export interface Loop {
  trigger: string;
  action: string;
  reward: string;
}

export interface ProjectData {
  persona: string;
  scenario: string;
  outcome: string;
  northStarMetric: string;
  constraints: string;
  loops: Loop[];
  oneLinePrd: string;
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

export interface SpecData {
  userStories: UserStory[];
  featureList: string[];
  stateMachine: {
    empty: string;
    success: string;
    failure: string;
    noPermission: string;
    offline: string;
  };
  copyPack: {
    firstScreen: string;
    guidance: string;
    errorState: string;
    emptyState: string;
  };
  trackingEvents: TrackingEvent[];
}

export interface BuildData {
  repo: string;
  env: string;
  routes: string;
  dataModel: string;
  sliceStatus: {
    loop1: 'pending' | 'in-progress' | 'done';
    loop2: 'pending' | 'in-progress' | 'done';
    loop3: 'pending' | 'in-progress' | 'done';
  };
  releaseNote: string;
}

export interface QualityChecklist {
  criticalPathWorks: boolean;
  offlineHandled: boolean;
  permissionsClear: boolean;
  dataTraceable: boolean;
  metricsWorking: boolean;
}

export interface GrowthPack {
  beforeAfterImage: string;
  shortVideoScript: string;
  longformOutline: string;
  downloadableAsset: string;
  demoLink: string;
}

export interface ReviewData {
  funnelMetrics: {
    exposure: string;
    reach: string;
    activation: string;
    retention: string;
  };
  biggestDrop: string;
  nextExperiment: string;
  nextWeekGoal: string;
}

export interface SOPState {
  currentStep: number;
  project: ProjectData;
  spec: SpecData;
  build: BuildData;
  quality: QualityChecklist;
  growth: GrowthPack;
  review: ReviewData;
}

export const SOP_STEPS = [
  { id: 0, title: '项目启动', subtitle: 'Project Setup', duration: '30-60 min', icon: 'Rocket' },
  { id: 1, title: '问题→方案', subtitle: 'Problem to Solution', duration: '60-120 min', icon: 'Lightbulb' },
  { id: 2, title: 'AI 辅助开发', subtitle: 'AI-Assisted Dev', duration: '2-6 hours', icon: 'Code' },
  { id: 3, title: '质量与上线', subtitle: 'Quality & Launch', duration: '30-90 min', icon: 'CheckCircle' },
  { id: 4, title: '增长物料', subtitle: 'Growth Materials', duration: '60-120 min', icon: 'TrendingUp' },
  { id: 5, title: '数据复盘', subtitle: 'Data Review', duration: '30-60 min', icon: 'BarChart' },
] as const;
