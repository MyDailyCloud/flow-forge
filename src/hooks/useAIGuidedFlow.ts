import { useState, useCallback } from 'react';
import { aiService } from '@/services';
import { hasApiKey } from '@/storage';
import { AI_GUIDED_PROMPTS } from '@/api/prompts';
import { parseAIResponse } from '@/api/aiClient';
import { formatBeforeAfterContent, formatVideoScriptContent, formatLongformContent } from '@/services/formatters';
import type { AIOption, AIOptionsResponse, FlowStep, GuidedFlowState, UserStory, TrackingEvent, SliceTask, QualityChecklistData, TestCase, ReviewTemplate } from '@/types/aiOptions';
import type { ProjectData, SpecData, BuildData, GrowthPack, QualityChecklist, ReviewData } from '@/types/sop';

const initialFlowState: GuidedFlowState = {
  step: 'idle',
  userInput: '',
  // Project 阶段
  selectedPersona: '',
  selectedScenario: '',
  selectedOutcome: '',
  selectedMetric: '',
  generatedPRD: '',
  generatedLoops: [],
  // Spec 阶段
  selectedFeatures: [],
  selectedStories: [],
  selectedTrackingEvents: [],
  // Build 阶段
  selectedTechStack: '',
  generatedRoutes: '',
  generatedDataModel: '',
  generatedSlices: [],
  generatedEnv: '',
  generatedReleaseNote: '',
  // Quality 阶段
  generatedQualityChecklist: null,
  generatedTestCases: [],
  generatedLaunchChecklist: [],
  // Growth 阶段
  generatedBeforeAfter: '',
  generatedVideoScript: '',
  generatedLongformOutline: '',
  selectedDownloadable: '',
  // Review 阶段
  generatedReviewTemplate: null,
};

export function useAIGuidedFlow(
  updateProject: (updates: Partial<ProjectData>) => void,
  updateSpec: (updates: Partial<SpecData>) => void,
  updateBuild: (updates: Partial<BuildData>) => void,
  updateQuality: (updates: Partial<QualityChecklist>) => void,
  updateGrowth: (updates: Partial<GrowthPack>) => void,
  updateReview: (updates: Partial<ReviewData>) => void
) {
  const [flowState, setFlowState] = useState<GuidedFlowState>(initialFlowState);
  const [options, setOptions] = useState<AIOptionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateOptions = useCallback(async (prompt: string): Promise<AIOptionsResponse | null> => {
    if (!hasApiKey()) {
      setError('请先设置 API Key');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      return await aiService.generateOptions(prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startFlow = useCallback(async (userInput: string) => {
    setFlowState((prev) => ({ ...prev, step: 'select-persona', userInput }));
    
    const result = await generateOptions(AI_GUIDED_PROMPTS.suggestPersonas(userInput));
    if (result) {
      setOptions(result);
    }
  }, [generateOptions]);

  const handleSelect = useCallback(async (selected: AIOption | AIOption[]) => {
    const isMultiple = Array.isArray(selected) && selected.length > 0;
    const selectedOption = isMultiple ? selected[0] : (selected as AIOption);
    const value = selectedOption.label;

    switch (flowState.step) {
      case 'select-persona':
        setFlowState((prev) => ({ ...prev, step: 'select-scenario', selectedPersona: value }));
        updateProject({ persona: value });
        const scenarioResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestScenarios(value)
        );
        if (scenarioResult) setOptions(scenarioResult);
        break;

      case 'select-scenario':
        setFlowState((prev) => ({ ...prev, step: 'select-outcome', selectedScenario: value }));
        updateProject({ scenario: value });
        const outcomeResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestOutcomes(flowState.selectedPersona, value)
        );
        if (outcomeResult) setOptions(outcomeResult);
        break;

      case 'select-outcome':
        setFlowState((prev) => ({ ...prev, step: 'select-metric', selectedOutcome: value }));
        updateProject({ outcome: value });
        const metricResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestMetrics(
            flowState.selectedPersona,
            flowState.selectedScenario,
            value
          )
        );
        if (metricResult) setOptions(metricResult);
        break;

      case 'select-metric':
        setFlowState((prev) => ({ ...prev, step: 'confirm-project', selectedMetric: value }));
        updateProject({ northStarMetric: value });
        
        // Generate full project (PRD + loops)
        setIsLoading(true);
        try {
          const fullProjectPrompt = AI_GUIDED_PROMPTS.generateFullProject(
            flowState.selectedPersona,
            flowState.selectedScenario,
            flowState.selectedOutcome,
            value
          );
          const projectData = await aiService.sendAndParse<{ prd: string; loops: any[] }>(fullProjectPrompt);
          
          if (projectData) {
            updateProject({
              oneLinePrd: projectData.prd,
              loops: projectData.loops || [],
            });
            setFlowState((prev) => ({
              ...prev,
              generatedPRD: projectData.prd,
              generatedLoops: projectData.loops || [],
              step: 'select-features',
            }));
            
            // 继续到 Spec 阶段 - 生成功能选项
            const featuresResult = await generateOptions(
              AI_GUIDED_PROMPTS.suggestFeatures(projectData.prd, projectData.loops || [])
            );
            if (featuresResult) setOptions(featuresResult);
          }
        } catch (err) {
          setError('生成完整项目失败');
        } finally {
          setIsLoading(false);
        }
        break;

      case 'select-features': {
        const selectedFeatures = (selected as AIOption[]).map(o => o.label);
        setFlowState((prev) => ({ ...prev, selectedFeatures, step: 'select-stories' }));
        updateSpec({ featureList: selectedFeatures });
        
        const storiesResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestUserStories(flowState.generatedPRD, selectedFeatures)
        );
        if (storiesResult) setOptions(storiesResult);
        break;
      }

      case 'select-stories': {
        const selectedStories: UserStory[] = (selected as AIOption[]).map(o => 
          o.value || { asA: '', iWant: o.label, soThat: '' }
        );
        setFlowState((prev) => ({ ...prev, selectedStories, step: 'generating-states' }));
        updateSpec({ userStories: selectedStories });
        
        // 自动生成状态机和文案 (无需选择)
        setIsLoading(true);
        setOptions(null);
        try {
          const statesPrompt = AI_GUIDED_PROMPTS.generateStatesAndCopy(
            flowState.generatedPRD,
            flowState.selectedFeatures,
            flowState.selectedPersona
          );
          const statesResponse = await chatWithAI([{ role: 'user', content: statesPrompt }]);
          const statesData = parseAIResponse<{ stateMachine: any; copyPack: any }>(statesResponse);
          
          if (statesData) {
            updateSpec({
              stateMachine: statesData.stateMachine,
              copyPack: statesData.copyPack,
            });
          }
          
          setFlowState((prev) => ({ ...prev, step: 'select-tracking' }));
          
          // 继续生成埋点选项
          const trackingResult = await generateOptions(
            AI_GUIDED_PROMPTS.suggestTrackingEvents(flowState.selectedFeatures, selectedStories)
          );
          if (trackingResult) setOptions(trackingResult);
        } catch (err) {
          setError('生成状态机和文案失败');
        } finally {
          setIsLoading(false);
        }
        break;
      }

      case 'select-tracking': {
        const selectedEvents: TrackingEvent[] = (selected as AIOption[]).map(o => 
          o.value || { name: o.label, props: '', when: '' }
        );
        updateSpec({ trackingEvents: selectedEvents });
        setFlowState((prev) => ({ 
          ...prev, 
          selectedTrackingEvents: selectedEvents, 
          step: 'select-tech-stack' 
        }));
        
        // 继续到 Build 阶段 - 生成技术栈选项
        const techStackResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestTechStack(flowState.generatedPRD, flowState.selectedFeatures)
        );
        if (techStackResult) setOptions(techStackResult);
        break;
      }

      case 'select-tech-stack': {
        setFlowState((prev) => ({ ...prev, selectedTechStack: value, step: 'generating-routes' }));
        updateBuild({ repo: value });
        setOptions(null);
        
        // Step 1: 生成路由设计
        setIsLoading(true);
        try {
          const routesPrompt = AI_GUIDED_PROMPTS.generateRoutes(
            flowState.generatedPRD,
            flowState.selectedFeatures,
            flowState.selectedStories
          );
          const routesResponse = await chatWithAI([{ role: 'user', content: routesPrompt }]);
          const routesData = parseAIResponse<{ routes: string }>(routesResponse);
          
          if (routesData) {
            const routes = routesData.routes;
            updateBuild({ routes });
            setFlowState((prev) => ({ ...prev, generatedRoutes: routes, step: 'generating-data-model' }));
            
            // Step 2: 生成数据模型
            const dataModelPrompt = AI_GUIDED_PROMPTS.generateDataModel(
              flowState.generatedPRD,
              flowState.selectedFeatures,
              value
            );
            const dataModelResponse = await chatWithAI([{ role: 'user', content: dataModelPrompt }]);
            const dataModelData = parseAIResponse<{ dataModel: string }>(dataModelResponse);
            
            if (dataModelData) {
              const dataModel = dataModelData.dataModel;
              updateBuild({ dataModel });
              setFlowState((prev) => ({ ...prev, generatedDataModel: dataModel, step: 'generating-slices' }));
              
              // Step 3: 生成切片任务规划
              const slicesPrompt = AI_GUIDED_PROMPTS.generateSlicePlan(
                flowState.generatedLoops,
                flowState.selectedFeatures,
                flowState.generatedPRD
              );
              const slicesResponse = await chatWithAI([{ role: 'user', content: slicesPrompt }]);
              const slicesData = parseAIResponse<{ slices: SliceTask[] }>(slicesResponse);
              
              if (slicesData) {
                const slices = slicesData.slices;
                // 更新 Build 数据中的 slice 状态
                updateBuild({
                  sliceStatus: {
                    loop1: 'pending',
                    loop2: 'pending',
                    loop3: 'pending',
                  },
                });
                setFlowState((prev) => ({ ...prev, generatedSlices: slices, step: 'confirm-build' }));
                
                // Step 4: 生成环境配置和发布说明
                const buildConfigPrompt = AI_GUIDED_PROMPTS.generateBuildConfig(
                  flowState.generatedPRD,
                  flowState.selectedFeatures,
                  value,
                  routes,
                  dataModel
                );
                const buildConfigResponse = await chatWithAI([{ role: 'user', content: buildConfigPrompt }]);
                const buildConfigData = parseAIResponse<{ env: string; releaseNote: string }>(buildConfigResponse);
                
                if (buildConfigData) {
                  updateBuild({
                    env: buildConfigData.env,
                    releaseNote: buildConfigData.releaseNote,
                  });
                  setFlowState((prev) => ({ 
                    ...prev, 
                    generatedEnv: buildConfigData.env,
                    generatedReleaseNote: buildConfigData.releaseNote,
                  }));
                }
                
                // 显示 Build 确认选项
                setOptions({
                  type: 'single',
                  question: 'Build 阶段设计已完成，确认后将进入 Growth 阶段',
                  options: [
                    { 
                      id: 'confirm-build', 
                      label: '确认并继续', 
                      description: `已生成：路由设计、数据模型、${slices.length} 个切片任务、环境配置`,
                      value: 'confirm',
                    }
                  ],
                  allowCustom: false,
                });
              }
            }
          }
        } catch (err) {
          setError('生成 Build 配置失败');
        } finally {
          setIsLoading(false);
        }
        break;
      }

      case 'confirm-build': {
        // 用户确认 Build 阶段，进入 Growth 阶段
        setFlowState((prev) => ({ ...prev, step: 'generating-before-after' }));
        setOptions(null);
        setIsLoading(true);
        
        try {
          // Growth Step 1: 生成 Before/After 对比图描述词
          const beforeAfterPrompt = AI_GUIDED_PROMPTS.generateBeforeAfter(
            flowState.generatedPRD,
            flowState.selectedPersona,
            flowState.selectedOutcome
          );
          const beforeAfterResponse = await chatWithAI([{ role: 'user', content: beforeAfterPrompt }]);
          const beforeAfterData = parseAIResponse<{ beforeAfter: any }>(beforeAfterResponse);
          
          if (beforeAfterData) {
            const formattedBeforeAfter = formatBeforeAfterContent(beforeAfterData.beforeAfter);
            updateGrowth({ beforeAfterImage: formattedBeforeAfter });
            setFlowState((prev) => ({ 
              ...prev, 
              generatedBeforeAfter: formattedBeforeAfter,
              step: 'generating-video-script' 
            }));
            
            // Growth Step 2: 生成视频脚本
            const videoPrompt = AI_GUIDED_PROMPTS.generateVideoScript(
              flowState.generatedPRD,
              flowState.selectedPersona,
              flowState.selectedOutcome,
              flowState.selectedFeatures
            );
            const videoResponse = await chatWithAI([{ role: 'user', content: videoPrompt }]);
            const videoData = parseAIResponse<{ videoScript: any }>(videoResponse);
            
            if (videoData) {
              const formattedVideo = formatVideoScriptContent(videoData.videoScript);
              updateGrowth({ shortVideoScript: formattedVideo });
              setFlowState((prev) => ({ 
                ...prev, 
                generatedVideoScript: formattedVideo,
                step: 'generating-longform' 
              }));
              
              // Growth Step 3: 生成长文大纲
              const longformPrompt = AI_GUIDED_PROMPTS.generateLongformOutline(
                flowState.generatedPRD,
                flowState.selectedPersona,
                flowState.selectedOutcome,
                flowState.selectedScenario
              );
              const longformResponse = await chatWithAI([{ role: 'user', content: longformPrompt }]);
              const longformData = parseAIResponse<{ longformOutline: any }>(longformResponse);
              
              if (longformData) {
                const formattedLongform = formatLongformContent(longformData.longformOutline);
                updateGrowth({ longformOutline: formattedLongform });
                setFlowState((prev) => ({ 
                  ...prev, 
                  generatedLongformOutline: formattedLongform,
                  step: 'select-downloadable' 
                }));
                
                // Growth Step 4: 生成可领取资产选项
                const downloadableResult = await generateOptions(
                  AI_GUIDED_PROMPTS.suggestDownloadableAssets(
                    flowState.generatedPRD,
                    flowState.selectedFeatures,
                    flowState.selectedPersona
                  )
                );
                if (downloadableResult) setOptions(downloadableResult);
              }
            }
          }
        } catch (err) {
          setError('生成 Growth 内容失败');
        } finally {
          setIsLoading(false);
        }
        break;
      }

      case 'select-downloadable': {
        const downloadableValue = selectedOption.value || selectedOption.label;
        updateGrowth({ downloadableAsset: JSON.stringify(downloadableValue) });
        setFlowState((prev) => ({ 
          ...prev, 
          selectedDownloadable: selectedOption.label,
          step: 'confirm-growth' 
        }));
        
        // 显示 Growth 确认选项
        setOptions({
          type: 'single',
          question: 'Growth 阶段完成！确认后将进入 Quality 阶段',
          options: [
            { 
              id: 'confirm-growth', 
              label: '确认并继续', 
              description: '已生成：对比图 Prompt、视频脚本、长文大纲、可领取资产',
              value: 'confirm',
            }
          ],
          allowCustom: false,
        });
        break;
      }

      case 'confirm-growth': {
        // 用户确认 Growth 阶段，进入 Quality 阶段
        setFlowState((prev) => ({ ...prev, step: 'generating-quality-checklist' }));
        setOptions(null);
        setIsLoading(true);
        
        try {
          // Quality Step: 生成质量检查清单和测试用例
          const qualityPrompt = AI_GUIDED_PROMPTS.generateQualityChecklist(
            flowState.generatedPRD,
            flowState.generatedRoutes,
            flowState.generatedDataModel,
            flowState.selectedFeatures
          );
          const qualityResponse = await chatWithAI([{ role: 'user', content: qualityPrompt }]);
          const qualityData = parseAIResponse<{ 
            qualityChecklist: QualityChecklistData; 
            testCases: TestCase[]; 
            launchChecklist: string[] 
          }>(qualityResponse);
          
          if (qualityData) {
            // 更新 Quality 状态
            updateQuality({
              criticalPathWorks: false,
              offlineHandled: false,
              permissionsClear: false,
              dataTraceable: false,
              metricsWorking: false,
            });
            
            setFlowState((prev) => ({ 
              ...prev, 
              generatedQualityChecklist: qualityData.qualityChecklist,
              generatedTestCases: qualityData.testCases || [],
              generatedLaunchChecklist: qualityData.launchChecklist || [],
              step: 'confirm-quality' 
            }));
            
            // 显示 Quality 确认选项
            setOptions({
              type: 'single',
              question: 'Quality 阶段已生成质量检查清单！确认后将进入 Review 阶段',
              options: [
                { 
                  id: 'confirm-quality', 
                  label: '确认并继续', 
                  description: `已生成：质量检查清单、${qualityData.testCases?.length || 0} 个测试用例、${qualityData.launchChecklist?.length || 0} 个上线检查项`,
                  value: 'confirm',
                }
              ],
              allowCustom: false,
            });
          }
        } catch (err) {
          setError('生成 Quality 内容失败');
        } finally {
          setIsLoading(false);
        }
        break;
      }

      case 'confirm-quality': {
        // 用户确认 Quality 阶段，进入 Review 阶段
        setFlowState((prev) => ({ ...prev, step: 'generating-review-template' }));
        setOptions(null);
        setIsLoading(true);
        
        try {
          // Review Step: 生成数据复盘模板
          const reviewPrompt = AI_GUIDED_PROMPTS.generateReviewTemplate(
            flowState.generatedPRD,
            flowState.selectedMetric,
            flowState.generatedLoops,
            `${flowState.generatedBeforeAfter}\n${flowState.generatedVideoScript}`
          );
          const reviewResponse = await chatWithAI([{ role: 'user', content: reviewPrompt }]);
          const reviewData = parseAIResponse<{ 
            funnelTemplate: { stages: string[]; metricsToTrack: string[]; expectedBaseline: string }; 
            reviewQuestions: string[]; 
            retrospectivePrompts: string[] 
          }>(reviewResponse);
          
          if (reviewData) {
            const reviewTemplate: ReviewTemplate = {
              funnelStages: reviewData.funnelTemplate?.stages || [],
              metricsToTrack: reviewData.funnelTemplate?.metricsToTrack || [],
              expectedBaseline: reviewData.funnelTemplate?.expectedBaseline || '',
              reviewQuestions: reviewData.reviewQuestions || [],
              retrospectivePrompts: reviewData.retrospectivePrompts || [],
            };
            
            // 更新 Review 状态
            updateReview({
              funnelMetrics: {
                exposure: '',
                reach: '',
                activation: '',
                retention: '',
              },
              biggestDrop: '',
              nextExperiment: '',
              nextWeekGoal: '',
            });
            
            setFlowState((prev) => ({ 
              ...prev, 
              generatedReviewTemplate: reviewTemplate,
              step: 'confirm-review' 
            }));
            
            // 显示 Review 确认选项
            setOptions({
              type: 'single',
              question: 'Review 阶段已生成数据复盘模板！确认后完成全流程',
              options: [
                { 
                  id: 'confirm-review', 
                  label: '完成全流程', 
                  description: `已生成：漏斗分析模板、${reviewData.reviewQuestions?.length || 0} 个复盘问题、${reviewData.retrospectivePrompts?.length || 0} 个反思提示`,
                  value: 'confirm',
                }
              ],
              allowCustom: false,
            });
          }
        } catch (err) {
          setError('生成 Review 内容失败');
        } finally {
          setIsLoading(false);
        }
        break;
      }

      case 'confirm-review': {
        // 全流程完成
        setFlowState((prev) => ({ ...prev, step: 'complete' }));
        setOptions(null);
        break;
      }

      default:
        break;
    }
  }, [flowState, updateProject, updateSpec, updateBuild, updateQuality, updateGrowth, updateReview, generateOptions]);

  const handleCustomInput = useCallback(async (value: string) => {
    // Treat custom input same as selected option
    handleSelect({ id: 'custom', label: value, value });
  }, [handleSelect]);

  const resetFlow = useCallback(() => {
    setFlowState(initialFlowState);
    setOptions(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const retryCurrentStep = useCallback(async () => {
    setError(null);
    
    switch (flowState.step) {
      case 'select-persona':
        const personaResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestPersonas(flowState.userInput)
        );
        if (personaResult) setOptions(personaResult);
        break;
      case 'select-scenario':
        const scenarioResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestScenarios(flowState.selectedPersona)
        );
        if (scenarioResult) setOptions(scenarioResult);
        break;
      case 'select-outcome':
        const outcomeResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestOutcomes(flowState.selectedPersona, flowState.selectedScenario)
        );
        if (outcomeResult) setOptions(outcomeResult);
        break;
      case 'select-metric':
        const metricResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestMetrics(
            flowState.selectedPersona,
            flowState.selectedScenario,
            flowState.selectedOutcome
          )
        );
        if (metricResult) setOptions(metricResult);
        break;
      case 'select-features':
        const featuresResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestFeatures(flowState.generatedPRD, flowState.generatedLoops)
        );
        if (featuresResult) setOptions(featuresResult);
        break;
      case 'select-stories':
        const storiesResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestUserStories(flowState.generatedPRD, flowState.selectedFeatures)
        );
        if (storiesResult) setOptions(storiesResult);
        break;
      case 'select-tracking':
        const trackingResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestTrackingEvents(flowState.selectedFeatures, flowState.selectedStories)
        );
        if (trackingResult) setOptions(trackingResult);
        break;
      case 'select-tech-stack':
        const techStackResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestTechStack(flowState.generatedPRD, flowState.selectedFeatures)
        );
        if (techStackResult) setOptions(techStackResult);
        break;
      case 'select-downloadable':
        const downloadableResult = await generateOptions(
          AI_GUIDED_PROMPTS.suggestDownloadableAssets(
            flowState.generatedPRD,
            flowState.selectedFeatures,
            flowState.selectedPersona
          )
        );
        if (downloadableResult) setOptions(downloadableResult);
        break;
    }
  }, [flowState, generateOptions]);

  // Helper functions for formatting Growth content
  function formatBeforeAfterContent(data: any): string {
    return `## Before/After 对比图

### Before（使用前）
**图片生成 Prompt：**
\`\`\`
${data.before?.prompt || ''}
\`\`\`
**场景说明：** ${data.before?.description || ''}

### After（使用后）
**图片生成 Prompt：**
\`\`\`
${data.after?.prompt || ''}
\`\`\`
**场景说明：** ${data.after?.description || ''}

### 社交媒体配文
${data.socialCopy || data.combined || ''}`;
  }

  function formatVideoScriptContent(data: any): string {
    return `## 15秒短视频脚本

### Hook（0-5s）
**文案：** ${data.hook?.text || ''}
**画面：** ${data.hook?.visual || ''}

### Solution（5-12s）
**文案：** ${data.solution?.text || ''}
**画面：** ${data.solution?.visual || ''}

### CTA（12-15s）
**文案：** ${data.cta?.text || ''}
**画面：** ${data.cta?.visual || ''}

### 完整脚本
${data.fullScript || ''}

### 话题标签
${(data.hashtags || []).map((t: string) => `#${t}`).join(' ')}`;
  }

  function formatLongformContent(data: any): string {
    const sections = (data.sections || []).map((s: any) => 
      `### ${s.heading}\n${(s.points || []).map((p: string) => `- ${p}`).join('\n')}\n*约 ${s.wordCount || 0} 字*`
    ).join('\n\n');
    
    return `## ${data.title || '长文大纲'}

**副标题：** ${data.subtitle || ''}

${sections}

**目标平台：** ${data.targetPlatform || '公众号/知乎'}
**预计阅读时间：** ${data.estimatedReadTime || '5分钟'}`;
  }

  return {
    flowState,
    options,
    isLoading,
    error,
    startFlow,
    handleSelect,
    handleCustomInput,
    resetFlow,
    retryCurrentStep,
  };
}