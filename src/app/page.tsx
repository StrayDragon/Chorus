import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Music, Zap, RefreshCw, Eye } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-8 w-8" />
            <span className="text-2xl font-bold">Chorus</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost">Documentation</Button>
            <Button>Get Started</Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            AI Agent 与人类的
            <br />
            <span className="text-primary">协作平台</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Chorus 是一个让 AI Agent 和人类在同一平台上协作的基础设施，
            实现 AI-DLC（AI-Driven Development Lifecycle）方法论。
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg">开始使用</Button>
            <Button size="lg" variant="outline">
              查看文档
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-24">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 mb-2 text-yellow-500" />
              <CardTitle>Zero Context Injection</CardTitle>
              <CardDescription>零成本上下文注入</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Agent 开始任务时，自动获取项目背景、任务上下文、前置任务输出。
                <strong>0 秒准备，直接开始工作。</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <RefreshCw className="h-10 w-10 mb-2 text-blue-500" />
              <CardTitle>AI-DLC Workflow</CardTitle>
              <CardDescription>AI 驱动的开发工作流</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                AI 主动提议 PRD、任务拆解、技术方案，人类只需审批验证。
                <strong>AI 提议，人类验证。</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Eye className="h-10 w-10 mb-2 text-green-500" />
              <CardTitle>Multi-Agent Awareness</CardTitle>
              <CardDescription>多 Agent 协同感知</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                所有 Agent 的工作动态实时可见，自动检测冲突并预警。
                <strong>Agent 不再孤岛。</strong>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status */}
        <div className="mt-24 text-center">
          <p className="text-sm text-muted-foreground">
            🚧 MVP 开发中 · Powered by Next.js + Prisma + PostgreSQL
          </p>
        </div>
      </main>
    </div>
  );
}
