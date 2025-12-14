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
  // Project 阶段
  | 'select-persona'
  | 'select-scenario'
  | 'select-outcome'
  | 'select-metric'
  | 'confirm-project'
  // Spec 阶段
  | 'select-features'
  | 'select-stories'
  | 'generating-states'
  | 'select-tracking'
  | 'complete';

export interface UserStory {
  asA: string;
  iWant: string;
  soThat: string;
}

export interface TrackingEvent {
  name: string;
  props: string;
  when: string;
}

export interface GuidedFlowState {
  step: FlowStep;
  userInput: string;
  // Project 阶段
  selectedPersona: string;
  selectedScenario: string;
  selectedOutcome: string;
  selectedMetric: string;
  generatedPRD: string;
  generatedLoops: Array<{ trigger: string; action: string; reward: string }>;
  // Spec 阶段
  selectedFeatures: string[];
  selectedStories: UserStory[];
  selectedTrackingEvents: TrackingEvent[];
}
