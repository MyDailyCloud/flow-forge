import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getApiKey, setApiKey, removeApiKey, getBaseUrl, setBaseUrl, getDefaultBaseUrl } from '@/storage';
import { Sparkles, Key, X, Check, RotateCcw } from 'lucide-react';

interface AIKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySet: () => void;
}

export function AIKeyDialog({ isOpen, onClose, onKeySet }: AIKeyDialogProps) {
  const [key, setKey] = useState('');
  const [baseUrl, setBaseUrlState] = useState('');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasKey(!!getApiKey());
      setBaseUrlState(getBaseUrl());
    }
  }, [isOpen]);

  const handleSave = () => {
    if (key.trim()) {
      setApiKey(key.trim());
      setHasKey(true);
      setKey('');
      onKeySet();
      onClose();
    }
  };

  const handleRemove = () => {
    removeApiKey();
    setHasKey(false);
    setKey('');
  };

  const handleBaseUrlSave = () => {
    if (baseUrl.trim()) {
      setBaseUrl(baseUrl.trim());
    }
  };

  const handleResetBaseUrl = () => {
    const defaultUrl = getDefaultBaseUrl();
    setBaseUrlState(defaultUrl);
    setBaseUrl(defaultUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">智谱 AI 设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6">
          {/* API Key 部分 */}
          {hasKey ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-400">API Key 已配置</span>
              </div>
              <Button
                variant="outline"
                onClick={handleRemove}
                className="w-full"
                size="sm"
              >
                移除 Key
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  智谱开放平台 API Key
                </label>
                <Input
                  type="password"
                  placeholder="输入你的 API Key..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Key 仅存储在本地浏览器中，不会上传到服务器
                </p>
              </div>
              <Button onClick={handleSave} disabled={!key.trim()} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                保存 API Key
              </Button>
            </div>
          )}

          {/* Base URL 部分 */}
          <div className="pt-4 border-t border-border space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                API Base URL（可选）
              </label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://open.bigmodel.cn/api/..."
                  value={baseUrl}
                  onChange={(e) => setBaseUrlState(e.target.value)}
                  onBlur={handleBaseUrlSave}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResetBaseUrl}
                  title="重置为默认值"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                自定义 API 端点，支持代理或兼容接口
              </p>
            </div>
          </div>

          {/* 完成按钮 */}
          <Button variant="outline" onClick={onClose} className="w-full">
            完成
          </Button>
        </div>
      </div>
    </div>
  );
}
