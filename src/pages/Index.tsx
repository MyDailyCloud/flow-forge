import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles, Wand2, PenLine, Loader2 } from 'lucide-react';
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
import { BuildPreviewPanel } from '@/components/BuildPreviewPanel';
import { QualityPreviewPanel } from '@/components/QualityPreviewPanel';
import { ReviewPreviewPanel } from '@/components/ReviewPreviewPanel';
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

  const guidedFlow = useAIGuidedFlow(updateProject, updateSpec, updateBuild, updateQuality, updateGrowth, updateReview);

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
    const { step } = guidedFlow.flowState;

    if (step === 'idle') {
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

    // 自动生成步骤 - 显示加载进度
    const generatingSteps: Record<string, string> = {
      'generating-states': '正在生成状态机和文案...',
      'generating-routes': '正在生成路由设计...',
      'generating-data-model': '正在生成数据模型...',
      'generating-slices': '正在规划切片任务...',
      'generating-quality-checklist': '正在生成质量检查清单...',
      'generating-before-after': '正在生成 Before/After 对比图描述词...',
      'generating-video-script': '正在生成短视频脚本...',
      'generating-longform': '正在生成长文大纲...',
      'generating-review-template': '正在生成数据复盘模板...',
    };

    if (step in generatingSteps) {
      return (
        <div className="space-y-6">
          <AIGuidedProgress currentStep={step} isLoading={true} />
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            </div>
            <p className="text-lg text-muted-foreground">{generatingSteps[step]}</p>
          </div>
        </div>
      );
    }

    if (step === 'complete') {
      return (
        <div className="text-center py-12 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">🎉 全流程设计完成！</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            AI 已生成完整的产品设计方案，覆盖 SOP0-SOP5 全部 6 个阶段：
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">🚀 Project</h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• 人群 & 场景</li>
                <li>• 一句话 PRD</li>
                <li>• 行为闭环</li>
              </ul>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">📋 Spec</h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• 功能列表</li>
                <li>• 用户故事</li>
                <li>• 状态机 & 埋点</li>
              </ul>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">🔧 Build</h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• 技术栈</li>
                <li>• 路由设计</li>
                <li>• 数据模型</li>
              </ul>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">✅ Quality</h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• 质量检查清单</li>
                <li>• 测试用例</li>
                <li>• 上线检查项</li>
              </ul>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">📈 Growth</h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• 对比图 Prompt</li>
                <li>• 视频脚本</li>
                <li>• 长文大纲</li>
              </ul>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">📊 Review</h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• 漏斗分析模板</li>
                <li>• 复盘问题清单</li>
                <li>• 反思提示</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-4 justify-center pt-4">
            <Button variant="outline" onClick={handleSwitchToManual}>
              <PenLine className="w-4 h-4 mr-2" />
              查看并编辑
            </Button>
          </div>
        </div>
      );
    }

    // 各阶段确认步骤时显示预览面板
    const showBuildPreview = step === 'confirm-build';
    const showQualityPreview = step === 'confirm-quality';
    const showReviewPreview = step === 'confirm-review';
    
    return (
      <div className="space-y-6">
        <AIGuidedProgress currentStep={step} isLoading={guidedFlow.isLoading} />
        
        {showBuildPreview && (
          <BuildPreviewPanel
            techStack={guidedFlow.flowState.selectedTechStack}
            routes={guidedFlow.flowState.generatedRoutes}
            dataModel={guidedFlow.flowState.generatedDataModel}
            slices={guidedFlow.flowState.generatedSlices}
            env={guidedFlow.flowState.generatedEnv}
            releaseNote={guidedFlow.flowState.generatedReleaseNote}
          />
        )}

        {showQualityPreview && (
          <QualityPreviewPanel
            qualityChecklist={guidedFlow.flowState.generatedQualityChecklist}
            testCases={guidedFlow.flowState.generatedTestCases}
            launchChecklist={guidedFlow.flowState.generatedLaunchChecklist}
          />
        )}

        {showReviewPreview && (
          <ReviewPreviewPanel
            reviewTemplate={guidedFlow.flowState.generatedReviewTemplate}
          />
        )}
        
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

        {/* Footer Navigation - 只在手动模式显示 */}
        {mode === 'manual' && (
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
        )}
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
