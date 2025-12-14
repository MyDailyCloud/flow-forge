import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, CheckCircle2, TestTube2, Rocket } from 'lucide-react';
import { useState } from 'react';
import type { QualityChecklistData, TestCase } from '@/types/aiOptions';

interface QualityPreviewPanelProps {
  qualityChecklist: QualityChecklistData | null;
  testCases: TestCase[];
  launchChecklist: string[];
}

export function QualityPreviewPanel({
  qualityChecklist,
  testCases,
  launchChecklist,
}: QualityPreviewPanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['checklist', 'tests', 'launch']));

  const toggleSection = (section: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(section)) {
      newOpen.delete(section);
    } else {
      newOpen.add(section);
    }
    setOpenSections(newOpen);
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Quality 阶段预览
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quality Checklist */}
        {qualityChecklist && (
          <Collapsible open={openSections.has('checklist')} onOpenChange={() => toggleSection('checklist')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <span className="font-medium text-sm">✅ 质量检查清单</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSections.has('checklist') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-2 text-sm pl-2">
                <div className="p-2 bg-background/50 rounded border-l-2 border-primary/50">
                  <span className="font-medium text-primary">关键路径：</span>
                  <p className="text-muted-foreground mt-1">{qualityChecklist.criticalPath}</p>
                </div>
                <div className="p-2 bg-background/50 rounded border-l-2 border-yellow-500/50">
                  <span className="font-medium text-yellow-500">离线场景：</span>
                  <p className="text-muted-foreground mt-1">{qualityChecklist.offlineScenarios}</p>
                </div>
                <div className="p-2 bg-background/50 rounded border-l-2 border-blue-500/50">
                  <span className="font-medium text-blue-500">权限检查：</span>
                  <p className="text-muted-foreground mt-1">{qualityChecklist.permissionChecks}</p>
                </div>
                <div className="p-2 bg-background/50 rounded border-l-2 border-green-500/50">
                  <span className="font-medium text-green-500">数据追踪：</span>
                  <p className="text-muted-foreground mt-1">{qualityChecklist.dataTracing}</p>
                </div>
                <div className="p-2 bg-background/50 rounded border-l-2 border-purple-500/50">
                  <span className="font-medium text-purple-500">埋点验证：</span>
                  <p className="text-muted-foreground mt-1">{qualityChecklist.metricsValidation}</p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Test Cases */}
        {testCases.length > 0 && (
          <Collapsible open={openSections.has('tests')} onOpenChange={() => toggleSection('tests')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <span className="font-medium text-sm flex items-center gap-2">
                <TestTube2 className="w-4 h-4" />
                测试用例 ({testCases.length})
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSections.has('tests') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-3 pl-2">
                {testCases.map((testCase, index) => (
                  <div key={index} className="p-3 bg-background/50 rounded-lg border border-border/50">
                    <h4 className="font-medium text-sm mb-2">{testCase.name}</h4>
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-muted-foreground">步骤：</span>
                        <ol className="list-decimal list-inside mt-1 space-y-0.5">
                          {testCase.steps.map((step, i) => (
                            <li key={i} className="text-muted-foreground">{step}</li>
                          ))}
                        </ol>
                      </div>
                      <div className="mt-2">
                        <span className="text-muted-foreground">预期：</span>
                        <span className="text-primary ml-1">{testCase.expected}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Launch Checklist */}
        {launchChecklist.length > 0 && (
          <Collapsible open={openSections.has('launch')} onOpenChange={() => toggleSection('launch')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
              <span className="font-medium text-sm flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                上线检查项 ({launchChecklist.length})
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSections.has('launch') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <ul className="space-y-1 pl-2">
                {launchChecklist.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 rounded border border-border flex items-center justify-center">
                      <span className="text-xs">{index + 1}</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
