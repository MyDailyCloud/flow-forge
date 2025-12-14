import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowStep } from '@/types/aiOptions';

interface AIGuidedProgressProps {
  currentStep: FlowStep;
}

const FLOW_STEPS: { id: FlowStep; label: string }[] = [
  { id: 'select-persona', label: '目标人群' },
  { id: 'select-scenario', label: '使用场景' },
  { id: 'select-outcome', label: '期望结果' },
  { id: 'select-metric', label: '北极星指标' },
  { id: 'confirm-project', label: '生成项目' },
];

export function AIGuidedProgress({ currentStep }: AIGuidedProgressProps) {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {FLOW_STEPS.map((step, index) => {
        const isCompleted = currentIndex > index;
        const isCurrent = step.id === currentStep;
        const isUpcoming = currentIndex < index;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all',
                isCompleted && 'bg-primary text-primary-foreground',
                isCurrent && 'bg-primary/20 text-primary ring-2 ring-primary',
                isUpcoming && 'bg-muted text-muted-foreground'
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            {index < FLOW_STEPS.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 mx-1',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
