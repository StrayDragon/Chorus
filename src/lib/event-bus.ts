// src/lib/event-bus.ts
// 内存事件总线 — 进程级单例
// 将来多实例部署时替换为 Redis pub/sub，SSE 端点和客户端代码不变

import { EventEmitter } from "events";

export interface RealtimeEvent {
  companyUuid: string;
  projectUuid: string;
  entityType: "task" | "idea" | "proposal" | "document";
  entityUuid: string;
  action: "created" | "updated" | "deleted";
}

class ChorusEventBus extends EventEmitter {
  emitChange(event: RealtimeEvent) {
    this.emit("change", event);
  }
}

// Use globalThis to ensure a true process-level singleton across
// Next.js Route Handlers and Server Actions (which use separate module graphs)
const globalForEventBus = globalThis as unknown as {
  chorusEventBus: ChorusEventBus | undefined;
};

export const eventBus = (globalForEventBus.chorusEventBus ??= new ChorusEventBus());
