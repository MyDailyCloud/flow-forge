import { Rocket, Lightbulb, Code, CheckCircle, TrendingUp, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOP_STEPS } from '@/types/sop';

const iconMap = {
  Rocket,
  Lightbulb,
  Code,
  CheckCircle,
  TrendingUp,
  BarChart,
};

interface SOPSidebarProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function SOPSidebar({ currentStep, onStepChange }: SOPSidebarProps) {
  return (
    <aside className="w-72 min-h-screen bg-card border-r border-border p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold gradient-text">SOP Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">高产工作流构建器</p>
      </div>

      <nav className="flex-1 space-y-2">
        {SOP_STEPS.map((step, index) => {
          const Icon = iconMap[step.icon];
          const isActive = currentStep === index;
          const isPast = currentStep > index;

          return (
            <button
              key={step.id}
              onClick={() => onStepChange(index)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-200 text-left group",
                isActive && "bg-primary/10 border border-primary/30",
                !isActive && "hover:bg-secondary border border-transparent",
                isPast && !isActive && "opacity-70"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                  isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                  isPast && !isActive && "bg-primary/20 text-primary",
                  !isActive && !isPast && "bg-secondary text-muted-foreground group-hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">SOP{step.id}</span>
                </div>
                <h3
                  className={cn(
                    "font-medium text-sm truncate",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{step.subtitle}</p>
                <span className="text-xs text-muted-foreground/70">{step.duration}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">执行节奏</p>
          <p>上午: SOP0+SOP1</p>
          <p>下午: SOP2</p>
          <p>傍晚: SOP3</p>
          <p>晚上: SOP4</p>
          <p>隔天: SOP5</p>
        </div>
      </div>
    </aside>
  );
}
