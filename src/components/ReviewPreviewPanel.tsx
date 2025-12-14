import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, BarChart3, HelpCircle, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import type { ReviewTemplate } from '@/types/aiOptions';

interface ReviewPreviewPanelProps {
  reviewTemplate: ReviewTemplate | null;
}

export function ReviewPreviewPanel({ reviewTemplate }: ReviewPreviewPanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['funnel', 'questions', 'retrospective']));

  const toggleSection = (section: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(section)) {
      newOpen.delete(section);
    } else {
      newOpen.add(section);
    }
    setOpenSections(newOpen);
  };

  if (!reviewTemplate) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Review 阶段预览
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Funnel Template */}
        <Collapsible open={openSections.has('funnel')} onOpenChange={() => toggleSection('funnel')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
            <span className="font-medium text-sm">📊 漏斗分析模板</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openSections.has('funnel') ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="space-y-3 pl-2">
              {/* Funnel Stages */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {reviewTemplate.funnelStages.map((stage, index) => (
                  <div key={index} className="flex items-center">
                    <div className="px-3 py-1.5 bg-primary/10 rounded-lg text-sm font-medium text-primary whitespace-nowrap">
                      {stage}
                    </div>
                    {index < reviewTemplate.funnelStages.length - 1 && (
                      <div className="w-4 h-0.5 bg-primary/30 mx-1" />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Metrics to Track */}
              <div className="p-2 bg-background/50 rounded border-l-2 border-blue-500/50">
                <span className="font-medium text-sm text-blue-500">追踪指标：</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {reviewTemplate.metricsToTrack.map((metric, index) => (
                    <span key={index} className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs rounded">
                      {metric}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expected Baseline */}
              <div className="p-2 bg-background/50 rounded border-l-2 border-green-500/50">
                <span className="font-medium text-sm text-green-500">预期基线：</span>
                <p className="text-muted-foreground text-sm mt-1">{reviewTemplate.expectedBaseline}</p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Review Questions */}
        <Collapsible open={openSections.has('questions')} onOpenChange={() => toggleSection('questions')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
            <span className="font-medium text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              复盘问题清单
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openSections.has('questions') ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <ul className="space-y-2 pl-2">
              {reviewTemplate.reviewQuestions.map((question, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{question}</span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>

        {/* Retrospective Prompts */}
        <Collapsible open={openSections.has('retrospective')} onOpenChange={() => toggleSection('retrospective')}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
            <span className="font-medium text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              反思提示
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openSections.has('retrospective') ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
              {reviewTemplate.retrospectivePrompts.map((prompt, index) => (
                <div key={index} className="p-2 bg-background/50 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground">{prompt}</p>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
