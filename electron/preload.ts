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
  
  // File operations (for future use)
  saveFile: (data: string, filename: string) => 
    ipcRenderer.invoke('save-file', data, filename),
  openFile: () => 
    ipcRenderer.invoke('open-file'),
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
    };
  }
}
