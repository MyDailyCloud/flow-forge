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
  // Build 阶段
  | 'select-tech-stack'
  | 'generating-routes'
  | 'generating-data-model'
  | 'generating-slices'
  | 'confirm-build'
  // Quality 阶段
  | 'generating-quality-checklist'
  | 'confirm-quality'
  // Growth 阶段
  | 'generating-before-after'
  | 'generating-video-script'
  | 'generating-longform'
  | 'select-downloadable'
  | 'confirm-growth'
  // Review 阶段
  | 'generating-review-template'
  | 'confirm-review'
  | 'complete';

export interface SliceTask {
  loop: number;
  name: string;
  description: string;
  tasks: string[];
  estimatedTime: string;
}

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

export interface QualityChecklistData {
  criticalPath: string;
  offlineScenarios: string;
  permissionChecks: string;
  dataTracing: string;
  metricsValidation: string;
}

export interface TestCase {
  name: string;
  steps: string[];
  expected: string;
}

export interface ReviewTemplate {
  funnelStages: string[];
  metricsToTrack: string[];
  expectedBaseline: string;
  reviewQuestions: string[];
  retrospectivePrompts: string[];
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
  // Build 阶段
  selectedTechStack: string;
  generatedRoutes: string;
  generatedDataModel: string;
  generatedSlices: SliceTask[];
  generatedEnv: string;
  generatedReleaseNote: string;
  // Quality 阶段
  generatedQualityChecklist: QualityChecklistData | null;
  generatedTestCases: TestCase[];
  generatedLaunchChecklist: string[];
  // Growth 阶段
  generatedBeforeAfter: string;
  generatedVideoScript: string;
  generatedLongformOutline: string;
  selectedDownloadable: string;
  // Review 阶段
  generatedReviewTemplate: ReviewTemplate | null;
}
