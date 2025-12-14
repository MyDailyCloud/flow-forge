import { GitBranch, Server, Route, Database, Layers, FileCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BuildData } from '@/types/sop';

interface StepBuildProps {
  data: BuildData;
  onUpdate: (updates: Partial<BuildData>) => void;
}

const sliceStatuses = ['pending', 'in-progress', 'done'] as const;

export function StepBuild({ data, onUpdate }: StepBuildProps) {
  const cycleStatus = (loop: 'loop1' | 'loop2' | 'loop3') => {
    const current = data.sliceStatus[loop];
    const currentIndex = sliceStatuses.indexOf(current);
    const nextStatus = sliceStatuses[(currentIndex + 1) % sliceStatuses.length];
    onUpdate({
      sliceStatus: { ...data.sliceStatus, [loop]: nextStatus },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-muted text-muted-foreground';
      case 'in-progress':
        return 'bg-accent/20 text-accent border-accent';
      case 'done':
        return 'bg-primary/20 text-primary border-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '待开始';
      case 'in-progress':
        return '进行中';
      case 'done':
        return '已完成';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">AI 辅助开发</h2>
        <p className="text-muted-foreground">
          在一天内把"可用 MVP"做出来
        </p>
      </div>

      {/* Development Flow */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <h4 className="text-sm font-semibold mb-3">开发节奏</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-primary/10 text-primary">1. 脚手架 (15-30min)</span>
          <span className="text-muted-foreground">→</span>
          <span className="px-2 py-1 rounded bg-accent/10 text-accent">2. 垂直切片</span>
          <span className="text-muted-foreground">→</span>
          <span className="px-2 py-1 rounded bg-primary/10 text-primary">3. 横向复制</span>
          <span className="text-muted-foreground">→</span>
          <span className="px-2 py-1 rounded bg-accent/10 text-accent">4. 补齐错误态</span>
          <span className="text-muted-foreground">→</span>
          <span className="px-2 py-1 rounded bg-primary/10 text-primary">5. 可观测性</span>
        </div>
      </div>

      {/* Project Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            代码仓库
          </Label>
          <Input
            placeholder="github.com/org/repo"
            value={data.repo}
            onChange={(e) => onUpdate({ repo: e.target.value })}
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            环境配置
          </Label>
          <Input
            placeholder="dev / staging / prod"
            value={data.env}
            onChange={(e) => onUpdate({ env: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Route className="w-4 h-4 text-primary" />
          路由设计
        </Label>
        <Textarea
          placeholder="/home, /dashboard, /settings..."
          value={data.routes}
          onChange={(e) => onUpdate({ routes: e.target.value })}
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          数据模型
        </Label>
        <Textarea
          placeholder="User { id, name, email }, Project { id, title, owner_id }..."
          value={data.dataModel}
          onChange={(e) => onUpdate({ dataModel: e.target.value })}
          className="font-mono text-sm min-h-[120px]"
        />
      </div>

      {/* Slice Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">切片进度</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          点击状态标签切换进度
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['loop1', 'loop2', 'loop3'] as const).map((loop, index) => (
            <div
              key={loop}
              className="p-4 rounded-lg bg-card border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">闭环 {index + 1}</span>
                <button
                  onClick={() => cycleStatus(loop)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105",
                    getStatusColor(data.sliceStatus[loop])
                  )}
                >
                  {getStatusLabel(data.sliceStatus[loop])}
                </button>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    data.sliceStatus[loop] === 'pending' && "w-0",
                    data.sliceStatus[loop] === 'in-progress' && "w-1/2 bg-accent",
                    data.sliceStatus[loop] === 'done' && "w-full bg-primary"
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Release Note */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          Release Note
        </Label>
        <Textarea
          placeholder="本次发布的主要变更..."
          value={data.releaseNote}
          onChange={(e) => onUpdate({ releaseNote: e.target.value })}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}
