import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AIOptionCard } from '@/components/AIOptionCard';
import { Loader2, ArrowRight, Sparkles, RotateCcw } from 'lucide-react';
import type { AIOption, AIOptionsResponse } from '@/types/aiOptions';
import { cn } from '@/lib/utils';

interface AIGuidedFlowProps {
  options: AIOptionsResponse | null;
  isLoading: boolean;
  error?: string | null;
  onSelect: (selected: AIOption | AIOption[]) => void;
  onCustomInput?: (value: string) => void;
  onRetry?: () => void;
}

export function AIGuidedFlow({
  options,
  isLoading,
  error,
  onSelect,
  onCustomInput,
  onRetry,
}: AIGuidedFlowProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customValue, setCustomValue] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleSelect = (option: AIOption) => {
    if (options?.type === 'multiple') {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(option.id)) {
        newSelected.delete(option.id);
      } else {
        newSelected.add(option.id);
      }
      setSelectedIds(newSelected);
    } else {
      setSelectedIds(new Set([option.id]));
      // Auto-confirm for single select
      onSelect(option);
    }
  };

  const handleConfirmMultiple = () => {
    if (options && selectedIds.size > 0) {
      const selected = options.options.filter((o) => selectedIds.has(o.id));
      onSelect(selected);
      setSelectedIds(new Set());
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim() && onCustomInput) {
      onCustomInput(customValue.trim());
      setCustomValue('');
      setShowCustom(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        </div>
        <p className="text-muted-foreground animate-pulse">AI 正在思考...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-destructive">{error}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RotateCcw className="w-4 h-4 mr-2" />
            重试
          </Button>
        )}
      </div>
    );
  }

  if (!options) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        <p className="text-muted-foreground">等待 AI 生成下一步选项...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-foreground pt-1">{options.question}</h3>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.options.map((option) => (
          <AIOptionCard
            key={option.id}
            option={option}
            isSelected={selectedIds.has(option.id)}
            onSelect={() => handleSelect(option)}
          />
        ))}
      </div>

      {/* Custom Input Toggle */}
      {options.allowCustom !== false && (
        <div className="space-y-3">
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              + 自定义输入
            </button>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="输入你自己的选项..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCustomSubmit} disabled={!customValue.trim()}>
                  确认
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowCustom(false);
                    setCustomValue('');
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm Button for Multiple Select */}
      {options.type === 'multiple' && selectedIds.size > 0 && (
        <Button onClick={handleConfirmMultiple} className="w-full" variant="glow">
          确认选择 ({selectedIds.size} 项)
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
