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
  phase: 'project' | 'spec' | 'build' | 'growth';
}

const FLOW_STEPS: StepInfo[] = [
  // Project 阶段
  { id: 'select-persona', label: '人群', phase: 'project' },
  { id: 'select-scenario', label: '场景', phase: 'project' },
  { id: 'select-outcome', label: '结果', phase: 'project' },
  { id: 'select-metric', label: '指标', phase: 'project' },
  { id: 'confirm-project', label: 'PRD', phase: 'project' },
  // Spec 阶段
  { id: 'select-features', label: '功能', phase: 'spec' },
  { id: 'select-stories', label: '故事', phase: 'spec' },
  { id: 'generating-states', label: '状态', phase: 'spec' },
  { id: 'select-tracking', label: '埋点', phase: 'spec' },
  // Build 阶段
  { id: 'select-tech-stack', label: '技术栈', phase: 'build' },
  { id: 'generating-routes', label: '路由', phase: 'build' },
  { id: 'generating-data-model', label: '数据', phase: 'build' },
  { id: 'confirm-build', label: '配置', phase: 'build' },
  // Growth 阶段
  { id: 'generating-before-after', label: '对比图', phase: 'growth' },
  { id: 'generating-video-script', label: '视频', phase: 'growth' },
  { id: 'generating-longform', label: '长文', phase: 'growth' },
  { id: 'select-downloadable', label: '资产', phase: 'growth' },
  { id: 'confirm-growth', label: '完成', phase: 'growth' },
];

const PHASE_LABELS = {
  project: 'Project',
  spec: 'Spec',
  build: 'Build',
  growth: 'Growth',
};

export function AIGuidedProgress({ currentStep, isLoading }: AIGuidedProgressProps) {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.id === currentStep);
  const currentPhase = FLOW_STEPS.find((s) => s.id === currentStep)?.phase;

  // Group steps by phase
  const phases = ['project', 'spec', 'build', 'growth'] as const;

  return (
    <div className="space-y-3">
      {/* Phase labels */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        {phases.map((phase) => (
          <span
            key={phase}
            className={cn(
              'transition-colors',
              currentPhase === phase && 'text-primary font-medium'
            )}
          >
            {PHASE_LABELS[phase]}
          </span>
        ))}
      </div>
      
      {/* Progress bar */}
      <div className="flex items-center justify-center gap-0.5 py-2 overflow-x-auto">
        {FLOW_STEPS.map((step, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = step.id === currentStep;
          const isUpcoming = currentIndex < index;
          const isPhaseStart = index === 0 || FLOW_STEPS[index - 1].phase !== step.phase;

          return (
            <div key={step.id} className="flex items-center">
              {/* Phase separator */}
              {isPhaseStart && index > 0 && (
                <div className="w-3 h-3 mx-0.5 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                </div>
              )}
              
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-medium transition-all',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary/20 text-primary ring-2 ring-primary',
                    isUpcoming && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3" />
                  ) : isCurrent && isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'text-[9px] whitespace-nowrap',
                    isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {index < FLOW_STEPS.length - 1 && FLOW_STEPS[index + 1].phase === step.phase && (
                <div
                  className={cn(
                    'w-3 h-0.5 mx-0.5',
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