import { BookOpen, List, GitBranch, FileText, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AIAssistButton } from '@/components/AIAssistButton';
import { SOP_PROMPTS } from '@/lib/zhipuAI';
import type { SpecData, UserStory, TrackingEvent } from '@/types/sop';

interface StepSpecProps {
  data: SpecData;
  prd: string;
  onUpdate: (updates: Partial<SpecData>) => void;
  onOpenAIDialog: () => void;
}

export function StepSpec({ data, prd, onUpdate, onOpenAIDialog }: StepSpecProps) {
  const updateUserStory = (index: number, field: keyof UserStory, value: string) => {
    const newStories = [...data.userStories];
    newStories[index] = { ...newStories[index], [field]: value };
    onUpdate({ userStories: newStories });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...data.featureList];
    newFeatures[index] = value;
    onUpdate({ featureList: newFeatures });
  };

  const updateTrackingEvent = (index: number, field: keyof TrackingEvent, value: string) => {
    const newEvents = [...data.trackingEvents];
    newEvents[index] = { ...newEvents[index], [field]: value };
    onUpdate({ trackingEvents: newEvents });
  };

  const handleGenerateStories = (result: string) => {
    try {
      const stories = JSON.parse(result);
      if (Array.isArray(stories) && stories.length >= 3) {
        onUpdate({
          userStories: stories.slice(0, 3).map((s: any) => ({
            asA: s.asA || '',
            iWant: s.iWant || '',
            soThat: s.soThat || '',
          })),
        });
      }
    } catch {
      // If not valid JSON, ignore
    }
  };

  const handleGenerateFeatures = (result: string) => {
    try {
      const features = JSON.parse(result);
      if (Array.isArray(features)) {
        const newFeatures = [...data.featureList];
        features.slice(0, 7).forEach((f: string, i: number) => {
          newFeatures[i] = f;
        });
        onUpdate({ featureList: newFeatures });
      }
    } catch {
      // If not valid JSON, ignore
    }
  };

  const handleGenerateTracking = (result: string) => {
    try {
      const events = JSON.parse(result);
      if (Array.isArray(events) && events.length >= 5) {
        onUpdate({
          trackingEvents: events.slice(0, 5).map((e: any) => ({
            name: e.name || '',
            props: e.props || '',
            when: e.when || '',
          })),
        });
      }
    } catch {
      // If not valid JSON, ignore
    }
  };

  const featuresString = data.featureList.filter(f => f).join(', ');

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">问题→方案</h2>
        <p className="text-muted-foreground">
          把需求变成可实现的"功能片段 + 文案 + 埋点"
        </p>
      </div>

      {/* User Stories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">用户故事 (最多3条)</h3>
          </div>
          <AIAssistButton
            prompt={SOP_PROMPTS.generateUserStories(prd, featuresString)}
            onResult={handleGenerateStories}
            onOpenKeyDialog={onOpenAIDialog}
            disabled={!prd}
            label="AI 生成"
          />
        </div>
        
        {data.userStories.map((story, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-card border border-border space-y-3"
          >
            <span className="text-xs font-mono text-muted-foreground">Story #{index + 1}</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">作为...</Label>
                <Input
                  placeholder="用户角色"
                  value={story.asA}
                  onChange={(e) => updateUserStory(index, 'asA', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">我想要...</Label>
                <Input
                  placeholder="功能需求"
                  value={story.iWant}
                  onChange={(e) => updateUserStory(index, 'iWant', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">以便...</Label>
                <Input
                  placeholder="期望价值"
                  value={story.soThat}
                  onChange={(e) => updateUserStory(index, 'soThat', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">功能列表 (不超过7个)</h3>
          </div>
          <AIAssistButton
            prompt={SOP_PROMPTS.suggestFeatures(prd)}
            onResult={handleGenerateFeatures}
            onOpenKeyDialog={onOpenAIDialog}
            disabled={!prd}
            label="AI 建议"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.featureList.map((feature, index) => (
            <Input
              key={index}
              placeholder={`功能 ${index + 1}`}
              value={feature}
              onChange={(e) => updateFeature(index, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* State Machine */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">状态机</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(data.stateMachine).map(([key, value]) => {
            const labels: Record<string, string> = {
              empty: '空态',
              success: '成功',
              failure: '失败',
              noPermission: '无权限',
              offline: '离线',
            };
            return (
              <div key={key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{labels[key]}</Label>
                <Input
                  placeholder={`${labels[key]}时的表现`}
                  value={value}
                  onChange={(e) =>
                    onUpdate({
                      stateMachine: { ...data.stateMachine, [key]: e.target.value },
                    })
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Copy Pack */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">文案包</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">首屏文案</Label>
            <Textarea
              placeholder="首次进入看到的内容"
              value={data.copyPack.firstScreen}
              onChange={(e) =>
                onUpdate({
                  copyPack: { ...data.copyPack, firstScreen: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">引导文案</Label>
            <Textarea
              placeholder="引导用户操作"
              value={data.copyPack.guidance}
              onChange={(e) =>
                onUpdate({
                  copyPack: { ...data.copyPack, guidance: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">错误态文案</Label>
            <Textarea
              placeholder="出错时显示"
              value={data.copyPack.errorState}
              onChange={(e) =>
                onUpdate({
                  copyPack: { ...data.copyPack, errorState: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">空态文案</Label>
            <Textarea
              placeholder="无内容时显示"
              value={data.copyPack.emptyState}
              onChange={(e) =>
                onUpdate({
                  copyPack: { ...data.copyPack, emptyState: e.target.value },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Tracking Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">埋点事件</h3>
          </div>
          <AIAssistButton
            prompt={SOP_PROMPTS.suggestTracking(featuresString || prd)}
            onResult={handleGenerateTracking}
            onOpenKeyDialog={onOpenAIDialog}
            disabled={!prd && !featuresString}
            label="AI 建议"
          />
        </div>
        
        <div className="space-y-3">
          {data.trackingEvents.map((event, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-lg bg-card border border-border"
            >
              <div>
                <Label className="text-xs text-muted-foreground">事件名</Label>
                <Input
                  placeholder="event_name"
                  value={event.name}
                  onChange={(e) => updateTrackingEvent(index, 'name', e.target.value)}
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">属性</Label>
                <Input
                  placeholder="user_id, timestamp"
                  value={event.props}
                  onChange={(e) => updateTrackingEvent(index, 'props', e.target.value)}
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">触发条件</Label>
                <Input
                  placeholder="用户点击按钮时"
                  value={event.when}
                  onChange={(e) => updateTrackingEvent(index, 'when', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
