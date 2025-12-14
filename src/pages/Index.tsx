import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles, Wand2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SOPSidebar } from '@/components/SOPSidebar';
import { ExportPanel } from '@/components/ExportPanel';
import { StepProject } from '@/components/steps/StepProject';
import { StepSpec } from '@/components/steps/StepSpec';
import { StepBuild } from '@/components/steps/StepBuild';
import { StepQuality } from '@/components/steps/StepQuality';
import { StepGrowth } from '@/components/steps/StepGrowth';
import { StepReview } from '@/components/steps/StepReview';
import { AIKeyDialog } from '@/components/AIKeyDialog';
import { AIGuidedStart } from '@/components/AIGuidedStart';
import { AIGuidedFlow } from '@/components/AIGuidedFlow';
import { AIGuidedProgress } from '@/components/AIGuidedProgress';
import { useSOPState } from '@/hooks/useSOPState';
import { useAIGuidedFlow } from '@/hooks/useAIGuidedFlow';
import { SOP_STEPS } from '@/types/sop';
import { useToast } from '@/hooks/use-toast';
import { getApiKey } from '@/lib/zhipuAI';

type Mode = 'manual' | 'guided';

const Index = () => {
  const [mode, setMode] = useState<Mode>('manual');
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(!!getApiKey());

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

  const guidedFlow = useAIGuidedFlow(updateProject, updateSpec);

  const { toast } = useToast();

  const handleReset = () => {
    if (confirm('确定要重置所有数据吗？此操作不可撤销。')) {
      resetState();
      guidedFlow.resetFlow();
      toast({
        title: '已重置',
        description: '所有 SOP 数据已清空',
      });
    }
  };

  const openAIDialog = () => setIsAIDialogOpen(true);

  const handleSwitchToManual = () => {
    setMode('manual');
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 0:
        return (
          <StepProject
            data={state.project}
            onUpdate={updateProject}
            onOpenAIDialog={openAIDialog}
          />
        );
      case 1:
        return (
          <StepSpec
            data={state.spec}
            prd={state.project.oneLinePrd}
            onUpdate={updateSpec}
            onOpenAIDialog={openAIDialog}
          />
        );
      case 2:
        return <StepBuild data={state.build} onUpdate={updateBuild} />;
      case 3:
        return <StepQuality data={state.quality} onUpdate={updateQuality} />;
      case 4:
        return (
          <StepGrowth
            data={state.growth}
            context={state.project.oneLinePrd}
            onUpdate={updateGrowth}
            onOpenAIDialog={openAIDialog}
          />
        );
      case 5:
        return <StepReview data={state.review} onUpdate={updateReview} />;
      default:
        return null;
    }
  };

  const renderGuidedContent = () => {
    if (guidedFlow.flowState.step === 'idle') {
      return (
        <AIGuidedStart
          onStart={(input) => {
            if (!hasApiKey) {
              setIsAIDialogOpen(true);
              toast({
                title: '请先设置 API Key',
                description: '需要 API Key 才能使用 AI 引导功能',
              });
              return;
            }
            guidedFlow.startFlow(input);
          }}
          isLoading={guidedFlow.isLoading}
        />
      );
    }

    if (guidedFlow.flowState.step === 'complete') {
      return (
        <div className="text-center py-12 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Project + Spec 阶段完成！</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            AI 已生成完整的项目定义和产品规格，包括：
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Project</h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• 目标人群 & 场景</li>
                <li>• 一句话 PRD</li>
                <li>• 行为闭环</li>
              </ul>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Spec</h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• 功能列表</li>
                <li>• 用户故事</li>
                <li>• 状态机 & 文案</li>
                <li>• 埋点事件</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-4 justify-center pt-4">
            <Button variant="outline" onClick={handleSwitchToManual}>
              <PenLine className="w-4 h-4 mr-2" />
              查看并编辑
            </Button>
            <Button
              variant="glow"
              onClick={() => {
                setMode('manual');
                setCurrentStep(2);
              }}
            >
              继续到 Build 阶段
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <AIGuidedProgress currentStep={guidedFlow.flowState.step} isLoading={guidedFlow.isLoading} />
        <AIGuidedFlow
          options={guidedFlow.options}
          isLoading={guidedFlow.isLoading}
          error={guidedFlow.error}
          onSelect={guidedFlow.handleSelect}
          onCustomInput={guidedFlow.handleCustomInput}
          onRetry={guidedFlow.retryCurrentStep}
        />
      </div>
    );
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
                {mode === 'guided' ? 'AI 引导' : `SOP ${state.currentStep}`}
              </span>
              <h1 className="text-lg font-semibold">
                {mode === 'guided' ? 'AI 端到端引导' : SOP_STEPS[state.currentStep].title}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Mode Toggle */}
              <div className="flex rounded-lg border border-border p-0.5">
                <button
                  onClick={() => setMode('manual')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    mode === 'manual'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <PenLine className="w-4 h-4 inline mr-1" />
                  手动
                </button>
                <button
                  onClick={() => setMode('guided')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    mode === 'guided'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Wand2 className="w-4 h-4 inline mr-1" />
                  AI 引导
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAIDialogOpen(true)}
                className={hasApiKey ? 'text-primary border-primary/50' : ''}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                AI 设置
              </Button>
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
          <div className="max-w-4xl mx-auto">
            {mode === 'guided' ? renderGuidedContent() : renderCurrentStep()}
          </div>
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

      {/* AI Key Dialog */}
      <AIKeyDialog
        isOpen={isAIDialogOpen}
        onClose={() => setIsAIDialogOpen(false)}
        onKeySet={() => setHasApiKey(true)}
      />

      {/* Ambient glow effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
};

export default Index;
