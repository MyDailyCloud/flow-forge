import { useState, useCallback } from 'react';
import { chatWithAI, getApiKey } from '@/lib/zhipuAI';
import { AI_GUIDED_PROMPTS, parseAIResponse } from '@/lib/zhipuAI';
import type { AIOption, AIOptionsResponse, FlowStep, GuidedFlowState } from '@/types/aiOptions';
import type { ProjectData } from '@/types/sop';

const initialFlowState: GuidedFlowState = {
  step: 'idle',
  userInput: '',
  selectedPersona: '',
  selectedScenario: '',
  selectedOutcome: '',
  selectedMetric: '',
  generatedPRD: '',
  generatedLoops: [],
};

export function useAIGuidedFlow(updateProject: (updates: Partial<ProjectData>) => void) {
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
    const selectedOption = Array.isArray(selected) ? selected[0] : selected;
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
              step: 'complete',
            }));
          }
        } catch (err) {
          setError('生成完整项目失败');
        } finally {
          setIsLoading(false);
        }
        setOptions(null);
        break;

      default:
        break;
    }
  }, [flowState, updateProject, generateOptions]);

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
