/**
 * 存储层统一导出
 */

export { 
  storageService, 
  localStorage, 
  fileStorage, 
  isElectron,
  StorageService,
  type StorageType,
  type StorageConfig,
} from './storageService';

export {
  getApiKey,
  setApiKey,
  removeApiKey,
  hasApiKey,
  getBaseUrl,
  setBaseUrl,
  resetBaseUrl,
  getDefaultBaseUrl,
} from './apiKeyStorage';

export {
  getInitialState,
  loadSOPState,
  saveSOPState,
  clearSOPState,
  exportSOPState,
  importSOPState,
} from './sopStorage';
