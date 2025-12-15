import { useState } from 'react';
import { Wand2, PenLine, Sparkles, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Mode = 'manual' | 'guided';

interface OnboardingDialogProps {
  open: boolean;
  onComplete: (selectedMode: Mode) => void;
}

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [selectedMode, setSelectedMode] = useState<Mode>('guided');

  const handleStart = () => {
    onComplete(selectedMode);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" hideCloseButton>
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">欢迎使用 SOP 助手！</DialogTitle>
          <DialogDescription className="text-base">
            选择适合你的使用方式
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {/* AI 引导模式 */}
          <button
            onClick={() => setSelectedMode('guided')}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              selectedMode === 'guided'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {selectedMode === 'guided' && (
              <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-primary" />
            )}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Wand2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">AI 引导模式</h3>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded">
                    推荐
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  只需输入一句话，AI 帮你一步步完成产品设计
                </p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  适合：新手、快速验证想法
                </p>
              </div>
            </div>
          </button>

          {/* 手动模式 */}
          <button
            onClick={() => setSelectedMode('manual')}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              selectedMode === 'manual'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {selectedMode === 'manual' && (
              <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-primary" />
            )}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <PenLine className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">手动模式</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  完全控制每一个字段，自由填写
                </p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  适合：熟悉产品开发流程的用户
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* 功能简介 */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">SOP 助手能帮你：</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✓ 从想法到产品方案，覆盖完整 SOP 流程</li>
            <li>✓ 生成一句话 PRD、功能列表、技术设计</li>
            <li>✓ 输出增长素材、数据复盘模板</li>
          </ul>
        </div>

        <Button onClick={handleStart} className="w-full" variant="glow">
          开始使用
        </Button>
      </DialogContent>
    </Dialog>
  );
}
