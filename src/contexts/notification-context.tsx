"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { authFetch } from "@/lib/auth-client";

interface NotificationContextType {
  unreadCount: number;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const subscribersRef = useRef<Set<() => void>>(new Set());

  const notify = useCallback(() => {
    subscribersRef.current.forEach((cb) => cb());
  }, []);

  // Fetch initial unread count from REST API
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await authFetch("/api/notifications?readFilter=unread&take=0");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.data.unreadCount);
        }
      }
    } catch {
      // Silently fail — will retry on next SSE event or visibility change
    }
  }, []);

  const refreshNotifications = useCallback(() => {
    fetchUnreadCount();
    notify();
  }, [fetchUnreadCount, notify]);

  useEffect(() => {
    let es: EventSource | null = null;
    let debounceTimer: NodeJS.Timeout;

    function connect() {
      disconnect();
      es = new EventSource("/api/events/notifications");

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (typeof data.unreadCount === "number") {
            setUnreadCount(data.unreadCount);
          }
        } catch {
          // Ignore parse errors
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(notify, 300);
      };

      es.onerror = () => {
        // Browser EventSource auto-reconnects on error
      };
    }

    function disconnect() {
      if (es) {
        es.close();
        es = null;
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        connect();
        fetchUnreadCount();
      } else {
        disconnect();
      }
    }

    // Initial connection and data fetch
    connect();
    fetchUnreadCount();

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      disconnect();
      clearTimeout(debounceTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchUnreadCount, notify]);

  const contextValue = useMemo(
    () => ({ unreadCount, refreshNotifications }),
    [unreadCount, refreshNotifications]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Access notification context (unreadCount + refreshNotifications).
 * Returns null values gracefully if called outside NotificationProvider.
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    return { unreadCount: 0, refreshNotifications: () => {} };
  }
  return context;
}
