/**
 * IPC Handlers - Electron 主进程 IPC 处理器
 */

import { ipcMain, dialog, app, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';

/**
 * 注册所有 IPC 处理器
 */
export function registerIpcHandlers(mainWindow: BrowserWindow | null) {
  // 获取应用版本
  ipcMain.handle('get-version', () => {
    return app.getVersion();
  });

  // 窗口控制
  ipcMain.on('window-minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('window-close', () => {
    mainWindow?.close();
  });

  // 保存文件
  ipcMain.handle('save-file', async (_event, data: string, filename: string) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow!, {
        defaultPath: filename,
        filters: [
          { name: 'JSON', extensions: ['json'] },
          { name: 'Markdown', extensions: ['md'] },
          { name: 'Text', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (result.canceled || !result.filePath) {
        return false;
      }

      fs.writeFileSync(result.filePath, data, 'utf-8');
      return true;
    } catch (error) {
      console.error('Failed to save file:', error);
      return false;
    }
  });

  // 打开文件
  ipcMain.handle('open-file', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow!, {
        properties: ['openFile'],
        filters: [
          { name: 'JSON', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      const content = fs.readFileSync(result.filePaths[0], 'utf-8');
      return content;
    } catch (error) {
      console.error('Failed to open file:', error);
      return null;
    }
  });

  // 导出到指定路径
  ipcMain.handle('export-to-path', async (_event, data: string, defaultFilename: string) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow!, {
        defaultPath: defaultFilename,
        filters: [
          { name: 'JSON', extensions: ['json'] },
          { name: 'Markdown', extensions: ['md'] },
        ],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, path: null };
      }

      fs.writeFileSync(result.filePath, data, 'utf-8');
      return { success: true, path: result.filePath };
    } catch (error) {
      console.error('Failed to export file:', error);
      return { success: false, path: null, error: String(error) };
    }
  });

  // 获取用户数据目录
  ipcMain.handle('get-user-data-path', () => {
    return app.getPath('userData');
  });

  // 检查文件是否存在
  ipcMain.handle('file-exists', (_event, filePath: string) => {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  });

  // 读取文件
  ipcMain.handle('read-file', (_event, filePath: string) => {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  });

  // 写入文件
  ipcMain.handle('write-file', (_event, filePath: string, data: string) => {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, data, 'utf-8');
      return true;
    } catch (error) {
      console.error('Failed to write file:', error);
      return false;
    }
  });

  // 删除文件
  ipcMain.handle('delete-file', (_event, filePath: string) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  });
}
