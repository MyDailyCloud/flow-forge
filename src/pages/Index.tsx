import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SOPSidebar } from '@/components/SOPSidebar';
import { ExportPanel } from '@/components/ExportPanel';
import { StepProject } from '@/components/steps/StepProject';
import { StepSpec } from '@/components/steps/StepSpec';
import { StepBuild } from '@/components/steps/StepBuild';
import { StepQuality } from '@/components/steps/StepQuality';
import { StepGrowth } from '@/components/steps/StepGrowth';
import { StepReview } from '@/components/steps/StepReview';
import { useSOPState } from '@/hooks/useSOPState';
import { SOP_STEPS } from '@/types/sop';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const {
    state,
    setCurrentStep,
    updateProject,
    updateSpec,
    updateBuild,
    updateQuality,
    updateGrowth,
    updateReview,
    exportData,
    resetState,
  } = useSOPState();

  const { toast } = useToast();

  const handleReset = () => {
    if (confirm('确定要重置所有数据吗？此操作不可撤销。')) {
      resetState();
      toast({
        title: '已重置',
        description: '所有 SOP 数据已清空',
      });
    }
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 0:
        return <StepProject data={state.project} onUpdate={updateProject} />;
      case 1:
        return <StepSpec data={state.spec} onUpdate={updateSpec} />;
      case 2:
        return <StepBuild data={state.build} onUpdate={updateBuild} />;
      case 3:
        return <StepQuality data={state.quality} onUpdate={updateQuality} />;
      case 4:
        return <StepGrowth data={state.growth} onUpdate={updateGrowth} />;
      case 5:
        return <StepReview data={state.review} onUpdate={updateReview} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <SOPSidebar currentStep={state.currentStep} onStepChange={setCurrentStep} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-primary">
                SOP {state.currentStep}
              </span>
              <h1 className="text-lg font-semibold">
                {SOP_STEPS[state.currentStep].title}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                重置
              </Button>
              <ExportPanel exportData={exportData} />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-4xl mx-auto">{renderCurrentStep()}</div>
        </div>

        {/* Footer Navigation */}
        <footer className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, state.currentStep - 1))}
              disabled={state.currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一步
            </Button>

            <div className="flex gap-1">
              {SOP_STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === state.currentStep
                      ? 'bg-primary w-6'
                      : index < state.currentStep
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="glow"
              onClick={() =>
                setCurrentStep(Math.min(SOP_STEPS.length - 1, state.currentStep + 1))
              }
              disabled={state.currentStep === SOP_STEPS.length - 1}
            >
              下一步
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </footer>
      </main>

      {/* Ambient glow effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
};

export default Index;
