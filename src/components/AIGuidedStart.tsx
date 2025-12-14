import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ArrowRight, Wand2 } from 'lucide-react';

interface AIGuidedStartProps {
  onStart: (input: string) => void;
  isLoading: boolean;
}

export function AIGuidedStart({ onStart, isLoading }: AIGuidedStartProps) {
  const [input, setInput] = useState('');

  const examples = [
    '帮助程序员快速写出高质量代码',
    '让设计师 10 秒完成配色方案',
    '帮职场人写周报节省 80% 时间',
    '让学生用 AI 高效复习考试',
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Wand2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">AI 引导模式</h2>
        <p className="text-muted-foreground">
          只需输入你的想法，AI 会一步步引导你完成整个 SOP
        </p>
      </div>

      {/* Input */}
      <div className="space-y-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="用一句话描述你想做的产品/功能..."
          className="min-h-[120px] text-lg"
        />
        <Button
          onClick={() => onStart(input)}
          disabled={!input.trim() || isLoading}
          className="w-full"
          variant="glow"
          size="lg"
        >
          {isLoading ? (
            <>处理中...</>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              开始 AI 引导
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">或者试试这些例子：</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {examples.map((example, i) => (
            <button
              key={i}
              onClick={() => setInput(example)}
              className="px-3 py-1.5 text-sm rounded-full border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
