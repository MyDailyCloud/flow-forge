/**
 * 用户偏好存储服务
 */
import { localStorage } from './storageService';

const FIRST_VISIT_KEY = 'sop_has_visited';
const PREFERRED_MODE_KEY = 'sop_preferred_mode';

type Mode = 'manual' | 'guided';

/**
 * 检查是否是首次访问
 */
export function isFirstVisit(): boolean {
  return !localStorage.get<boolean>(FIRST_VISIT_KEY, false);
}

/**
 * 标记已访问
 */
export function markAsVisited(): void {
  localStorage.set(FIRST_VISIT_KEY, true);
}

/**
 * 获取用户偏好的模式（默认为 guided）
 */
export function getPreferredMode(): Mode {
  return localStorage.get<Mode>(PREFERRED_MODE_KEY, 'guided') ?? 'guided';
}

/**
 * 设置用户偏好的模式
 */
export function setPreferredMode(mode: Mode): void {
  localStorage.set(PREFERRED_MODE_KEY, mode);
}
