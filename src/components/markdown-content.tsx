"use client";

import { Streamdown } from "streamdown";

export function MarkdownContent({ children }: { children: string }) {
  return <Streamdown>{children}</Streamdown>;
}
