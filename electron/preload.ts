import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  platform: process.platform,
  
  // App version
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // File operations
  saveFile: (data: string, filename: string) => 
    ipcRenderer.invoke('save-file', data, filename),
  openFile: () => 
    ipcRenderer.invoke('open-file'),
  exportToPath: (data: string, defaultFilename: string) =>
    ipcRenderer.invoke('export-to-path', data, defaultFilename),
    
  // Advanced file operations
  getUserDataPath: () => 
    ipcRenderer.invoke('get-user-data-path'),
  fileExists: (filePath: string) =>
    ipcRenderer.invoke('file-exists', filePath),
  readFile: (filePath: string) =>
    ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, data: string) =>
    ipcRenderer.invoke('write-file', filePath, data),
  deleteFile: (filePath: string) =>
    ipcRenderer.invoke('delete-file', filePath),
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
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
