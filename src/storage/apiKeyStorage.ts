/**
 * API Key 存储服务
 * 专门用于管理 API 密钥和 Base URL 的存储
 */

import { localStorage } from './storageService';

const API_KEY_STORAGE_KEY = 'zhipu_api_key';
const BASE_URL_STORAGE_KEY = 'zhipu_base_url';
const DEFAULT_BASE_URL = 'https://open.bigmodel.cn/api/coding/paas/v4/chat/completions';

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

/**
 * 获取 Base URL
 */
export function getBaseUrl(): string {
  return localStorage.get<string>(BASE_URL_STORAGE_KEY) || DEFAULT_BASE_URL;
}

/**
 * 设置 Base URL
 */
export function setBaseUrl(url: string): boolean {
  return localStorage.set(BASE_URL_STORAGE_KEY, url);
}

/**
 * 重置 Base URL 为默认值
 */
export function resetBaseUrl(): boolean {
  return localStorage.remove(BASE_URL_STORAGE_KEY);
}

/**
 * 获取默认 Base URL
 */
export function getDefaultBaseUrl(): string {
  return DEFAULT_BASE_URL;
}
