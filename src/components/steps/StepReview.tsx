import { TrendingDown, Beaker, Target, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { ReviewData } from '@/types/sop';

interface StepReviewProps {
  data: ReviewData;
  onUpdate: (updates: Partial<ReviewData>) => void;
}

export function StepReview({ data, onUpdate }: StepReviewProps) {
  const funnelSteps = [
    { key: 'exposure' as const, label: '曝光', color: 'bg-primary' },
    { key: 'reach' as const, label: '到达', color: 'bg-primary/80' },
    { key: 'activation' as const, label: '激活', color: 'bg-primary/60' },
    { key: 'retention' as const, label: '留存/复购', color: 'bg-primary/40' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">数据复盘</h2>
        <p className="text-muted-foreground">
          用数据决定下一个迭代，不靠感觉
        </p>
      </div>

      {/* Funnel Metrics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">漏斗指标</h3>
        <div className="grid grid-cols-1 gap-4">
          {funnelSteps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-24 shrink-0">
                <div className={`w-3 h-3 rounded-full ${step.color}`} />
                <span className="text-sm text-muted-foreground">{step.label}</span>
              </div>
              <Input
                placeholder={`${step.label}数据`}
                value={data.funnelMetrics[step.key]}
                onChange={(e) =>
                  onUpdate({
                    funnelMetrics: { ...data.funnelMetrics, [step.key]: e.target.value },
                  })
                }
                className="flex-1"
              />
              {index < funnelSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <h4 className="text-sm font-semibold mb-4">漏斗可视化</h4>
        <div className="space-y-2">
          {funnelSteps.map((step, index) => {
            const width = 100 - index * 15;
            return (
              <div key={step.key} className="flex items-center gap-3">
                <div
                  className={`h-8 rounded ${step.color} transition-all duration-500 flex items-center justify-center`}
                  style={{ width: `${width}%` }}
                >
                  {data.funnelMetrics[step.key] && (
                    <span className="text-xs font-mono text-primary-foreground">
                      {data.funnelMetrics[step.key]}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Biggest Drop */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-destructive" />
          最大掉点（只改一个）
        </Label>
        <Textarea
          placeholder="分析漏斗中掉落最严重的环节..."
          value={data.biggestDrop}
          onChange={(e) => onUpdate({ biggestDrop: e.target.value })}
        />
      </div>

      {/* Next Experiment */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Beaker className="w-4 h-4 text-accent" />
          A/B 实验设计
        </Label>
        <Textarea
          placeholder="设计一个 A/B 或对照实验（7 天内出结论）\n例：\n- 实验组：新引导文案\n- 对照组：原引导文案\n- 指标：激活率"
          value={data.nextExperiment}
          onChange={(e) => onUpdate({ nextExperiment: e.target.value })}
          className="min-h-[120px]"
        />
      </div>

      {/* Next Week Goal */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          下周目标
        </Label>
        <Input
          placeholder="具体、可衡量的目标"
          value={data.nextWeekGoal}
          onChange={(e) => onUpdate({ nextWeekGoal: e.target.value })}
        />
      </div>

      {/* Review Checklist */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <h4 className="text-sm font-semibold mb-2">复盘原则</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 看漏斗：曝光→到达→激活→留存/复购</li>
          <li>• 找最大掉点（只改一个）</li>
          <li>• 设计实验（7天内出结论）</li>
          <li>• 更新：文案、引导、默认值、触发时机</li>
        </ul>
      </div>
    </div>
  );
}
