/**
 * SOP 数据存储服务
 * 专门用于管理 SOP 状态的持久化
 */

import { localStorage } from './storageService';
import type { SOPState } from '@/types/sop';

const SOP_STORAGE_KEY = 'sop_data';

/**
 * 获取初始 SOP 状态
 */
export function getInitialState(): SOPState {
  return {
    currentStep: 0,
    project: {
      persona: '',
      scenario: '',
      outcome: '',
      northStarMetric: '',
      constraints: '',
      loops: [
        { trigger: '', action: '', reward: '' },
        { trigger: '', action: '', reward: '' },
        { trigger: '', action: '', reward: '' },
      ],
      oneLinePrd: '',
    },
    spec: {
      userStories: [
        { asA: '', iWant: '', soThat: '' },
        { asA: '', iWant: '', soThat: '' },
        { asA: '', iWant: '', soThat: '' },
      ],
      featureList: ['', '', '', '', '', '', ''],
      stateMachine: {
        empty: '',
        success: '',
        failure: '',
        noPermission: '',
        offline: '',
      },
      copyPack: {
        firstScreen: '',
        guidance: '',
        errorState: '',
        emptyState: '',
      },
      trackingEvents: [
        { name: '', props: '', when: '' },
        { name: '', props: '', when: '' },
        { name: '', props: '', when: '' },
        { name: '', props: '', when: '' },
        { name: '', props: '', when: '' },
      ],
    },
    build: {
      repo: '',
      env: '',
      routes: '',
      dataModel: '',
      sliceStatus: {
        loop1: 'pending',
        loop2: 'pending',
        loop3: 'pending',
      },
      releaseNote: '',
    },
    quality: {
      criticalPathWorks: false,
      offlineHandled: false,
      permissionsClear: false,
      dataTraceable: false,
      metricsWorking: false,
    },
    growth: {
      beforeAfterImage: '',
      shortVideoScript: '',
      longformOutline: '',
      downloadableAsset: '',
      demoLink: '',
    },
    review: {
      funnelMetrics: {
        exposure: '',
        reach: '',
        activation: '',
        retention: '',
      },
      biggestDrop: '',
      nextExperiment: '',
      nextWeekGoal: '',
    },
  };
}

/**
 * 加载 SOP 数据
 */
export function loadSOPState(): SOPState {
  const initialState = getInitialState();
  const saved = localStorage.get<Partial<SOPState>>(SOP_STORAGE_KEY);
  
  if (!saved) {
    return initialState;
  }

  // Merge with initialState to handle new fields
  return {
    ...initialState,
    ...saved,
    project: { ...initialState.project, ...saved.project },
    spec: { ...initialState.spec, ...saved.spec },
    build: { ...initialState.build, ...saved.build },
    quality: { ...initialState.quality, ...saved.quality },
    growth: { ...initialState.growth, ...saved.growth },
    review: { ...initialState.review, ...saved.review },
  };
}

/**
 * 保存 SOP 数据
 */
export function saveSOPState(state: SOPState): boolean {
  return localStorage.set(SOP_STORAGE_KEY, state);
}

/**
 * 清除 SOP 数据
 */
export function clearSOPState(): boolean {
  return localStorage.remove(SOP_STORAGE_KEY);
}

/**
 * 导出 SOP 数据为 JSON 字符串
 */
export function exportSOPState(state: SOPState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * 导入 SOP 数据
 */
export function importSOPState(jsonString: string): SOPState | null {
  try {
    const parsed = JSON.parse(jsonString);
    const initialState = getInitialState();
    
    // Validate and merge with initial state
    return {
      ...initialState,
      ...parsed,
      project: { ...initialState.project, ...parsed.project },
      spec: { ...initialState.spec, ...parsed.spec },
      build: { ...initialState.build, ...parsed.build },
      quality: { ...initialState.quality, ...parsed.quality },
      growth: { ...initialState.growth, ...parsed.growth },
      review: { ...initialState.review, ...parsed.review },
    };
  } catch (error) {
    console.error('Failed to import SOP state:', error);
    return null;
  }
}
