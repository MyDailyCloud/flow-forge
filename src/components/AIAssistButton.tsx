import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { chatWithAI, getApiKey, type Message } from '@/lib/zhipuAI';
import { toast } from 'sonner';

interface AIAssistButtonProps {
  prompt: string;
  onResult: (result: string) => void;
  onOpenKeyDialog: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function AIAssistButton({
  prompt,
  onResult,
  onOpenKeyDialog,
  disabled,
  label = 'AI 生成',
  className,
}: AIAssistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!getApiKey()) {
      onOpenKeyDialog();
      return;
    }

    setIsLoading(true);
    try {
      const messages: Message[] = [
        { role: 'system', content: '你是一个专业的产品经理和增长专家，帮助用户完成 SOP 文档。回答要简洁、专业、可执行。' },
        { role: 'user', content: prompt },
      ];

      const result = await chatWithAI(messages);
      onResult(result);
      toast.success('AI 生成完成');
    } catch (error) {
      console.error('AI Error:', error);
      toast.error(error instanceof Error ? error.message : 'AI 请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
      )}
      {label}
    </Button>
  );
}
