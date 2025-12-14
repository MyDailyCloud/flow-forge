import { CheckCircle, Circle, Zap, WifiOff, Shield, Database, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QualityChecklist } from '@/types/sop';

interface StepQualityProps {
  data: QualityChecklist;
  onUpdate: (updates: Partial<QualityChecklist>) => void;
}

const checklistItems: { key: keyof QualityChecklist; label: string; description: string; icon: typeof Zap }[] = [
  {
    key: 'criticalPathWorks',
    label: '关键路径可用',
    description: '关键路径 3 分钟内走通',
    icon: Zap,
  },
  {
    key: 'offlineHandled',
    label: '离线处理',
    description: '断网/失败态不崩',
    icon: WifiOff,
  },
  {
    key: 'permissionsClear',
    label: '权限清晰',
    description: '权限弹窗一次讲清',
    icon: Shield,
  },
  {
    key: 'dataTraceable',
    label: '数据可追溯',
    description: '数据落库可追溯（用户可导出/删除）',
    icon: Database,
  },
  {
    key: 'metricsWorking',
    label: '指标可用',
    description: '指标事件能打出来（至少 5 个关键事件）',
    icon: BarChart3,
  },
];

export function StepQuality({ data, onUpdate }: StepQualityProps) {
  const completedCount = Object.values(data).filter(Boolean).length;
  const totalCount = checklistItems.length;
  const isComplete = completedCount === totalCount;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">质量与上线</h2>
        <p className="text-muted-foreground">
          让"可用"变成"可交付"
        </p>
      </div>

      {/* Progress */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">上线检查进度</span>
          <span className={cn(
            "text-sm font-mono",
            isComplete ? "text-primary" : "text-muted-foreground"
          )}>
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500",
              isComplete ? "bg-primary" : "bg-accent"
            )}
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
        {isComplete && (
          <p className="text-sm text-primary mt-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            所有检查项已通过，可以上线！
          </p>
        )}
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {checklistItems.map((item) => {
          const Icon = item.icon;
          const isChecked = data[item.key];

          return (
            <button
              key={item.key}
              onClick={() => onUpdate({ [item.key]: !isChecked })}
              className={cn(
                "w-full flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 text-left group",
                isChecked
                  ? "bg-primary/5 border-primary/30"
                  : "bg-card border-border hover:border-muted-foreground/30"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all",
                  isChecked
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-secondary"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className={cn(
                    "font-medium",
                    isChecked ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {item.label}
                  </h4>
                  {isChecked ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground/50" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <h4 className="text-sm font-semibold mb-2">上线清单要点</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 模拟真实用户操作流程</li>
          <li>• 测试网络异常场景</li>
          <li>• 确保数据隐私合规</li>
          <li>• 验证埋点事件正确触发</li>
        </ul>
      </div>
    </div>
  );
}
