import { Target, Users, Zap, Gauge, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AIAssistButton } from '@/components/AIAssistButton';
import { SOP_PROMPTS } from '@/lib/zhipuAI';
import type { ProjectData, Loop } from '@/types/sop';

interface StepProjectProps {
  data: ProjectData;
  onUpdate: (updates: Partial<ProjectData>) => void;
  onOpenAIDialog: () => void;
}

export function StepProject({ data, onUpdate, onOpenAIDialog }: StepProjectProps) {
  const updateLoop = (index: number, field: keyof Loop, value: string) => {
    const newLoops = [...data.loops];
    newLoops[index] = { ...newLoops[index], [field]: value };
    onUpdate({ loops: newLoops });
  };

  const handleGeneratePRD = (result: string) => {
    onUpdate({ oneLinePrd: result.trim() });
  };

  const handleGenerateLoops = (result: string) => {
    try {
      const loops = JSON.parse(result);
      if (Array.isArray(loops) && loops.length >= 3) {
        onUpdate({
          loops: loops.slice(0, 3).map((l: any) => ({
            trigger: l.trigger || '',
            action: l.action || '',
            reward: l.reward || '',
          })),
        });
      }
    } catch {
      // If not valid JSON, ignore
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">项目启动</h2>
        <p className="text-muted-foreground">
          把"我要做什么"变成"我今天能交付什么"
        </p>
      </div>

      {/* One-liner PRD Template */}
      <div className="p-4 rounded-lg bg-secondary/30 border border-border">
        <p className="text-sm text-muted-foreground font-mono">
          "为【<span className="text-primary">人群</span>】在【<span className="text-primary">场景</span>】提供【<span className="text-primary">结果</span>】，
          用【关键机制】在 7 天内做到【<span className="text-accent">指标</span>】。"
        </p>
      </div>

      {/* Basic Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            目标人群 (Who)
          </Label>
          <Input
            placeholder="例：25-35岁的产品经理"
            value={data.persona}
            onChange={(e) => onUpdate({ persona: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            使用场景 (Where/When)
          </Label>
          <Input
            placeholder="例：每日晨会前5分钟"
            value={data.scenario}
            onChange={(e) => onUpdate({ scenario: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            期望结果 (Outcome)
          </Label>
          <Input
            placeholder="例：快速生成当日待办清单"
            value={data.outcome}
            onChange={(e) => onUpdate({ outcome: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            北极星指标
          </Label>
          <Input
            placeholder="例：日活用户数 DAU"
            value={data.northStarMetric}
            onChange={(e) => onUpdate({ northStarMetric: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          约束条件
        </Label>
        <Input
          placeholder="平台/隐私/时长/预算限制"
          value={data.constraints}
          onChange={(e) => onUpdate({ constraints: e.target.value })}
        />
      </div>

      {/* 3 Loops */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">3 个最小闭环</h3>
            <p className="text-sm text-muted-foreground">
              触发（用户何时来）→ 行动（做什么）→ 回报（立即得到什么）
            </p>
          </div>
          <AIAssistButton
            prompt={SOP_PROMPTS.suggestLoops(data.oneLinePrd || `${data.persona} ${data.scenario} ${data.outcome}`)}
            onResult={handleGenerateLoops}
            onOpenKeyDialog={onOpenAIDialog}
            disabled={!data.persona && !data.scenario && !data.outcome && !data.oneLinePrd}
            label="AI 建议"
          />
        </div>

        {data.loops.map((loop, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-card border border-border space-y-3"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-sm font-medium">闭环 {index + 1}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">触发</Label>
                <Input
                  placeholder="用户何时来"
                  value={loop.trigger}
                  onChange={(e) => updateLoop(index, 'trigger', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">行动</Label>
                <Input
                  placeholder="用户做什么"
                  value={loop.action}
                  onChange={(e) => updateLoop(index, 'action', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">回报</Label>
                <Input
                  placeholder="立即得到什么"
                  value={loop.reward}
                  onChange={(e) => updateLoop(index, 'reward', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* One-liner PRD Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>一句话 PRD</Label>
          <AIAssistButton
            prompt={SOP_PROMPTS.generatePRD(data.persona, data.scenario, data.outcome)}
            onResult={handleGeneratePRD}
            onOpenKeyDialog={onOpenAIDialog}
            disabled={!data.persona && !data.scenario && !data.outcome}
            label="AI 生成"
          />
        </div>
        <Textarea
          placeholder="完整的一句话产品定义..."
          value={data.oneLinePrd}
          onChange={(e) => onUpdate({ oneLinePrd: e.target.value })}
          className="min-h-[80px]"
        />
        {data.persona && data.scenario && data.outcome && !data.oneLinePrd && (
          <p className="text-xs text-muted-foreground mt-2">
            💡 建议: "为【{data.persona}】在【{data.scenario}】提供【{data.outcome}】，
            用【关键机制】在 7 天内做到【{data.northStarMetric || '指标'}】。"
          </p>
        )}
      </div>
    </div>
  );
}
