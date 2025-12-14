import { useState, useCallback } from 'react';
import type { SOPState, ProjectData, SpecData, BuildData, QualityChecklist, GrowthPack, ReviewData } from '@/types/sop';

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

export function useSOPState() {
  const [state, setState] = useState<SOPState>(initialState);

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
