/**
 * AI Prompts 统一导出
 */

export { projectPrompts } from './projectPrompts';
export { specPrompts } from './specPrompts';
export { buildPrompts } from './buildPrompts';
export { growthPrompts } from './growthPrompts';
export { qualityPrompts } from './qualityPrompts';
export { reviewPrompts } from './reviewPrompts';

// 组合所有 Guided Flow Prompts
import { projectPrompts } from './projectPrompts';
import { specPrompts } from './specPrompts';
import { buildPrompts } from './buildPrompts';
import { growthPrompts } from './growthPrompts';
import { qualityPrompts } from './qualityPrompts';
import { reviewPrompts } from './reviewPrompts';

export const AI_GUIDED_PROMPTS = {
  // Project 阶段
  suggestPersonas: projectPrompts.suggestPersonas,
  suggestScenarios: projectPrompts.suggestScenarios,
  suggestOutcomes: projectPrompts.suggestOutcomes,
  suggestMetrics: projectPrompts.suggestMetrics,
  generateFullProject: projectPrompts.generateFullProject,
  
  // Spec 阶段
  suggestFeatures: specPrompts.suggestFeatures,
  suggestUserStories: specPrompts.suggestUserStories,
  generateStatesAndCopy: specPrompts.generateStatesAndCopy,
  suggestTrackingEvents: specPrompts.suggestTrackingEvents,
  
  // Build 阶段
  suggestTechStack: buildPrompts.suggestTechStack,
  generateRoutes: buildPrompts.generateRoutes,
  generateDataModel: buildPrompts.generateDataModel,
  generateSlicePlan: buildPrompts.generateSlicePlan,
  generateBuildConfig: buildPrompts.generateBuildConfig,
  
  // Growth 阶段
  generateBeforeAfter: growthPrompts.generateBeforeAfter,
  generateVideoScript: growthPrompts.generateVideoScript,
  generateLongformOutline: growthPrompts.generateLongformOutline,
  suggestDownloadableAssets: growthPrompts.suggestDownloadableAssets,
  
  // Quality 阶段
  generateQualityChecklist: qualityPrompts.generateQualityChecklist,
  
  // Review 阶段
  generateReviewTemplate: reviewPrompts.generateReviewTemplate,
};

// 组合所有 SOP Prompts
export const SOP_PROMPTS = {
  generatePRD: projectPrompts.generatePRD,
  suggestLoops: projectPrompts.suggestLoops,
  generateUserStories: specPrompts.generateUserStories,
  suggestFeatures: specPrompts.suggestFeaturesSimple,
  generateCopy: specPrompts.generateCopy,
  suggestTracking: specPrompts.suggestTracking,
  analyzeGrowth: growthPrompts.analyzeGrowth,
};
