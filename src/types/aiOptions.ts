export interface AIOption {
  id: string;
  label: string;
  description?: string;
  value: any;
}

export interface AIOptionsResponse {
  type: 'single' | 'multiple';
  question: string;
  options: AIOption[];
  allowCustom?: boolean;
}

export type FlowStep =
  | 'idle'
  | 'input'
  | 'select-persona'
  | 'select-scenario'
  | 'select-outcome'
  | 'select-metric'
  | 'confirm-project'
  | 'select-features'
  | 'select-stories'
  | 'complete';

export interface GuidedFlowState {
  step: FlowStep;
  userInput: string;
  selectedPersona: string;
  selectedScenario: string;
  selectedOutcome: string;
  selectedMetric: string;
  generatedPRD: string;
  generatedLoops: Array<{ trigger: string; action: string; reward: string }>;
}
