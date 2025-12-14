import { Image, Video, FileText, Package, Link2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AIAssistButton } from '@/components/AIAssistButton';
import { SOP_PROMPTS } from '@/lib/zhipuAI';
import type { GrowthPack } from '@/types/sop';

interface StepGrowthProps {
  data: GrowthPack;
  context: string;
  onUpdate: (updates: Partial<GrowthPack>) => void;
  onOpenAIDialog: () => void;
}

export function StepGrowth({ data, context, onUpdate, onOpenAIDialog }: StepGrowthProps) {
  const items = [
    {
      key: 'beforeAfterImage' as const,
      label: '对比图 (Before/After)',
      icon: Image,
      placeholder: '描述对比图内容：使用前 vs 使用后',
      isTextarea: true,
    },
    {
      key: 'shortVideoScript' as const,
      label: '15秒短视频脚本',
      icon: Video,
      placeholder: '痛点 → 结果 → CTA\n例：\n0-5s: 你是否每天花2小时整理待办？\n5-12s: 用 XX 工具，1分钟搞定\n12-15s: 点击链接免费试用',
      isTextarea: true,
    },
    {
      key: 'longformOutline' as const,
      label: '长文大纲',
      icon: FileText,
      placeholder: '真实故事/复盘大纲\n例：\n1. 问题背景\n2. 尝试过的方案\n3. 解决方案\n4. 结果数据\n5. 复盘总结',
      isTextarea: true,
    },
    {
      key: 'downloadableAsset' as const,
      label: '可领取资产',
      icon: Package,
      placeholder: '模板/提示词/清单 的描述',
      isTextarea: false,
    },
    {
      key: 'demoLink' as const,
      label: 'Demo 链接',
      icon: Link2,
      placeholder: 'https://demo.example.com',
      isTextarea: false,
    },
  ];

  const filledCount = Object.values(data).filter((v) => v.trim() !== '').length;

  const handleAIGenerate = (result: string) => {
    // Parse the AI response and fill in the fields
    const lines = result.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    const updates: Partial<GrowthPack> = {};

    const saveSection = () => {
      if (currentSection && currentContent.length > 0) {
        const content = currentContent.join('\n').trim();
        if (currentSection.includes('对比') || currentSection.includes('Before')) {
          updates.beforeAfterImage = content;
        } else if (currentSection.includes('视频') || currentSection.includes('脚本')) {
          updates.shortVideoScript = content;
        } else if (currentSection.includes('长文') || currentSection.includes('大纲')) {
          updates.longformOutline = content;
        }
      }
    };

    for (const line of lines) {
      if (line.match(/^[1-3][\.\、]/) || line.match(/^#+\s/)) {
        saveSection();
        currentSection = line;
        currentContent = [];
      } else if (line.trim()) {
        currentContent.push(line);
      }
    }
    saveSection();

    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    } else {
      // If parsing failed, put everything in the first field
      onUpdate({ beforeAfterImage: result });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">增长物料生产线</h2>
          <p className="text-muted-foreground">
            每次迭代都变成"可传播内容"
          </p>
        </div>
        <AIAssistButton
          prompt={SOP_PROMPTS.analyzeGrowth(context)}
          onResult={handleAIGenerate}
          onOpenKeyDialog={onOpenAIDialog}
          disabled={!context}
          label="AI 生成物料"
        />
      </div>

      {/* 5-piece Kit Indicator */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="font-semibold">发布五件套</span>
          <span className="ml-auto text-sm font-mono text-muted-foreground">
            {filledCount}/5 完成
          </span>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                i < filledCount ? 'bg-accent' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Growth Items */}
      <div className="space-y-6">
        {items.map((item) => {
          const Icon = item.icon;
          const value = data[item.key];
          const isFilled = value.trim() !== '';

          return (
            <div
              key={item.key}
              className={`p-4 rounded-lg border transition-all ${
                isFilled
                  ? 'bg-accent/5 border-accent/30'
                  : 'bg-card border-border'
              }`}
            >
              <Label className="flex items-center gap-2 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isFilled
                      ? 'bg-accent/20 text-accent'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={isFilled ? 'text-foreground' : 'text-muted-foreground'}>
                  {item.label}
                </span>
                {isFilled && (
                  <span className="ml-auto text-xs text-accent">✓ 已填写</span>
                )}
              </Label>
              {item.isTextarea ? (
                <Textarea
                  placeholder={item.placeholder}
                  value={value}
                  onChange={(e) => onUpdate({ [item.key]: e.target.value })}
                  className="min-h-[120px]"
                />
              ) : (
                <Input
                  placeholder={item.placeholder}
                  value={value}
                  onChange={(e) => onUpdate({ [item.key]: e.target.value })}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <h4 className="text-sm font-semibold mb-2">发布物料要点</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 对比图要有视觉冲击力</li>
          <li>• 短视频前3秒抓住注意力</li>
          <li>• 长文要有真实数据支撑</li>
          <li>• 可领取资产要有实用价值</li>
          <li>• Demo 链接保持可用</li>
        </ul>
      </div>
    </div>
  );
}
