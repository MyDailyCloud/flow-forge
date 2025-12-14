/**
 * API Key 存储服务
 * 专门用于管理 API 密钥的存储
 */

import { localStorage } from './storageService';

const API_KEY_STORAGE_KEY = 'zhipu_api_key';

/**
 * 获取 API Key
 */
export function getApiKey(): string | null {
  return localStorage.get<string>(API_KEY_STORAGE_KEY);
}

/**
 * 设置 API Key
 */
export function setApiKey(key: string): boolean {
  return localStorage.set(API_KEY_STORAGE_KEY, key);
}

/**
 * 删除 API Key
 */
export function removeApiKey(): boolean {
  return localStorage.remove(API_KEY_STORAGE_KEY);
}

/**
 * 检查 API Key 是否已设置
 */
export function hasApiKey(): boolean {
  return getApiKey() !== null;
}
