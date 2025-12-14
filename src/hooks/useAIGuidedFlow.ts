import { useState, useCallback } from 'react';
import { chatWithAI, getApiKey } from '@/lib/zhipuAI';
import { AI_GUIDED_PROMPTS, parseAIResponse } from '@/lib/zhipuAI';
import type { AIOption, AIOptionsResponse, FlowStep, GuidedFlowState, UserStory, TrackingEvent } from '@/types/aiOptions';
import type { ProjectData, SpecData, BuildData } from '@/types/sop';

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
};

export function useAIGuidedFlow(
  updateProject: (updates: Partial<ProjectData>) => void,
  updateSpec: (updates: Partial<SpecData>) => void,
  updateBuild: (updates: Partial<BuildData>) => void
) {
  const [flowState, setFlowState] = useState<GuidedFlowState>(initialFlowState);
  const [options, setOptions] = useState<AIOptionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateOptions = useCallback(async (prompt: string): Promise<AIOptionsResponse | null> => {
    if (!getApiKey()) {
      setError('请先设置 API Key');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await chatWithAI([{ role: 'user', content: prompt }]);
      const parsed = parseAIResponse<AIOptionsResponse>(response);
      
      if (!parsed || !parsed.options) {
        throw new Error('AI 返回格式错误');
      }

      return parsed;
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
          const response = await chatWithAI([{ role: 'user', content: fullProjectPrompt }]);
          const projectData = parseAIResponse<{ prd: string; loops: any[] }>(response);
          
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
        
        // 自动生成路由设计
        setIsLoading(true);
        setOptions(null);
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
            
            // 继续生成数据模型
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
              setFlowState((prev) => ({ ...prev, generatedDataModel: dataModel, step: 'confirm-build' }));
              
              // 生成环境配置和发布说明
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
              }
              
              // Build 阶段完成
              setFlowState((prev) => ({ ...prev, step: 'complete' }));
            }
          }
        } catch (err) {
          setError('生成 Build 配置失败');
        } finally {
          setIsLoading(false);
        }
        setOptions(null);
        break;
      }

      default:
        break;
    }
  }, [flowState, updateProject, updateSpec, updateBuild, generateOptions]);

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
    }
  }, [flowState, generateOptions]);

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