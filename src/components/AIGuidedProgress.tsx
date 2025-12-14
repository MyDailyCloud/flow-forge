import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowStep } from '@/types/aiOptions';

interface AIGuidedProgressProps {
  currentStep: FlowStep;
  isLoading?: boolean;
}

interface StepInfo {
  id: FlowStep;
  label: string;
  phase: 'project' | 'spec';
}

const FLOW_STEPS: StepInfo[] = [
  // Project 阶段
  { id: 'select-persona', label: '目标人群', phase: 'project' },
  { id: 'select-scenario', label: '使用场景', phase: 'project' },
  { id: 'select-outcome', label: '期望结果', phase: 'project' },
  { id: 'select-metric', label: '北极星指标', phase: 'project' },
  { id: 'confirm-project', label: '生成项目', phase: 'project' },
  // Spec 阶段
  { id: 'select-features', label: '选择功能', phase: 'spec' },
  { id: 'select-stories', label: '用户故事', phase: 'spec' },
  { id: 'generating-states', label: '状态/文案', phase: 'spec' },
  { id: 'select-tracking', label: '埋点事件', phase: 'spec' },
];

export function AIGuidedProgress({ currentStep, isLoading }: AIGuidedProgressProps) {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.id === currentStep);
  const currentPhase = FLOW_STEPS.find((s) => s.id === currentStep)?.phase;

  return (
    <div className="space-y-4">
      {/* Phase labels */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <span className={cn(currentPhase === 'project' && 'text-primary font-medium')}>
          Project 阶段
        </span>
        <span className={cn(currentPhase === 'spec' && 'text-primary font-medium')}>
          Spec 阶段
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="flex items-center justify-center gap-1 py-2">
        {FLOW_STEPS.map((step, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = step.id === currentStep;
          const isUpcoming = currentIndex < index;
          const isPhaseStart = index === 0 || FLOW_STEPS[index - 1].phase !== step.phase;

          return (
            <div key={step.id} className="flex items-center">
              {/* Phase separator */}
              {isPhaseStart && index > 0 && (
                <div className="w-4 h-4 mx-1 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                </div>
              )}
              
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary/20 text-primary ring-2 ring-primary',
                    isUpcoming && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isCurrent && isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] whitespace-nowrap',
                    isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {index < FLOW_STEPS.length - 1 && FLOW_STEPS[index + 1].phase === step.phase && (
                <div
                  className={cn(
                    'w-4 h-0.5 mx-0.5',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}