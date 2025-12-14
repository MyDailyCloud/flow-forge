/**
 * 存储服务 - 统一数据访问层
 * 提供统一的存储接口，支持 localStorage 和 Electron 文件存储
 */

// Electron API 类型定义
declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      getVersion: () => Promise<string>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      saveFile: (data: string, filename: string) => Promise<boolean>;
      openFile: () => Promise<string | null>;
      exportToPath: (data: string, defaultFilename: string) => Promise<{ success: boolean; path: string | null; error?: string }>;
      getUserDataPath: () => Promise<string>;
      fileExists: (filePath: string) => Promise<boolean>;
      readFile: (filePath: string) => Promise<string | null>;
      writeFile: (filePath: string, data: string) => Promise<boolean>;
      deleteFile: (filePath: string) => Promise<boolean>;
    };
  }
}

// 检测是否在 Electron 环境中
export function isElectron(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.electronAPI !== 'undefined';
}

// 存储类型
export type StorageType = 'local' | 'file';

// 存储配置
export interface StorageConfig {
  type?: StorageType;
  encrypt?: boolean;
}

/**
 * 本地存储操作
 */
export const localStorage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue ?? null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${key}`, error);
      return defaultValue ?? null;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set item in localStorage: ${key}`, error);
      return false;
    }
  },

  remove(key: string): boolean {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${key}`, error);
      return false;
    }
  },

  clear(): boolean {
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage', error);
      return false;
    }
  },

  keys(): string[] {
    try {
      return Object.keys(window.localStorage);
    } catch (error) {
      console.error('Failed to get localStorage keys', error);
      return [];
    }
  },
};

/**
 * 文件存储操作 (Electron only)
 */
export const fileStorage = {
  async save(data: string, filename: string): Promise<boolean> {
    if (!isElectron()) {
      console.warn('File storage is only available in Electron environment');
      return false;
    }
    try {
      return await window.electronAPI.saveFile(data, filename);
    } catch (error) {
      console.error(`Failed to save file: ${filename}`, error);
      return false;
    }
  },

  async open(): Promise<string | null> {
    if (!isElectron()) {
      console.warn('File storage is only available in Electron environment');
      return null;
    }
    try {
      return await window.electronAPI.openFile();
    } catch (error) {
      console.error('Failed to open file', error);
      return null;
    }
  },
};

/**
 * 统一存储服务
 */
export class StorageService {
  private prefix: string;

  constructor(prefix: string = 'app_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string, defaultValue?: T): T | null {
    return localStorage.get<T>(this.getKey(key), defaultValue);
  }

  set<T>(key: string, value: T): boolean {
    return localStorage.set(this.getKey(key), value);
  }

  remove(key: string): boolean {
    return localStorage.remove(this.getKey(key));
  }

  // Electron 文件操作
  async saveToFile(data: string, filename: string): Promise<boolean> {
    return fileStorage.save(data, filename);
  }

  async openFromFile(): Promise<string | null> {
    return fileStorage.open();
  }
}

// 导出默认实例
export const storageService = new StorageService();
