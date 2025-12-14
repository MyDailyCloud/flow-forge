import { useState, useCallback, useEffect } from 'react';
import type { SOPState, ProjectData, SpecData, BuildData, QualityChecklist, GrowthPack, ReviewData } from '@/types/sop';
import { loadSOPState, saveSOPState, clearSOPState, getInitialState, exportSOPState } from '@/storage';

export function useSOPState() {
  const [state, setState] = useState<SOPState>(loadSOPState);

  // Auto-save with debounce using storage service
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSOPState(state);
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
    return exportSOPState(state);
  }, [state]);

  const resetState = useCallback(() => {
    setState(getInitialState());
    clearSOPState();
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
