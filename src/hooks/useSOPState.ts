import { useState, useCallback, useEffect } from 'react';
import type { SOPState, ProjectData, SpecData, BuildData, QualityChecklist, GrowthPack, ReviewData } from '@/types/sop';

const STORAGE_KEY = 'sop_data';

const initialState: SOPState = {
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

// Load from localStorage
function loadFromStorage(): SOPState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with initialState to handle new fields
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
    }
  } catch (e) {
    console.error('Failed to load SOP data from localStorage:', e);
  }
  return initialState;
}

export function useSOPState() {
  const [state, setState] = useState<SOPState>(loadFromStorage);

  // Auto-save to localStorage with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save SOP data to localStorage:', e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [state]);

  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const updateProject = useCallback((updates: Partial<ProjectData>) => {
    setState(prev => ({
      ...prev,
      project: { ...prev.project, ...updates },
    }));
  }, []);

  const updateSpec = useCallback((updates: Partial<SpecData>) => {
    setState(prev => ({
      ...prev,
      spec: { ...prev.spec, ...updates },
    }));
  }, []);

  const updateBuild = useCallback((updates: Partial<BuildData>) => {
    setState(prev => ({
      ...prev,
      build: { ...prev.build, ...updates },
    }));
  }, []);

  const updateQuality = useCallback((updates: Partial<QualityChecklist>) => {
    setState(prev => ({
      ...prev,
      quality: { ...prev.quality, ...updates },
    }));
  }, []);

  const updateGrowth = useCallback((updates: Partial<GrowthPack>) => {
    setState(prev => ({
      ...prev,
      growth: { ...prev.growth, ...updates },
    }));
  }, []);

  const updateReview = useCallback((updates: Partial<ReviewData>) => {
    setState(prev => ({
      ...prev,
      review: { ...prev.review, ...updates },
    }));
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const resetState = useCallback(() => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
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
  };
}
