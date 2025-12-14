import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getApiKey, setApiKey, removeApiKey } from '@/lib/zhipuAI';
import { Sparkles, Key, X, Check } from 'lucide-react';

interface AIKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySet: () => void;
}

export function AIKeyDialog({ isOpen, onClose, onKeySet }: AIKeyDialogProps) {
  const [key, setKey] = useState('');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    setHasKey(!!getApiKey());
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

        {hasKey ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-400">API Key 已配置</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRemove}
                className="flex-1"
              >
                移除 Key
              </Button>
              <Button onClick={onClose} className="flex-1">
                完成
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
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
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                取消
              </Button>
              <Button onClick={handleSave} disabled={!key.trim()} className="flex-1">
                <Sparkles className="w-4 h-4 mr-2" />
                保存
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
