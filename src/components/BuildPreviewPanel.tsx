import { ChevronDown, ChevronRight, Route, Database, Layers, Settings, FileText } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { SliceTask } from '@/types/aiOptions';

interface BuildPreviewPanelProps {
  techStack: string;
  routes: string;
  dataModel: string;
  slices: SliceTask[];
  env: string;
  releaseNote: string;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-primary">{icon}</span>
        <span className="font-medium text-sm">{title}</span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-border bg-background">
          {children}
        </div>
      )}
    </div>
  );
}

export function BuildPreviewPanel({
  techStack,
  routes,
  dataModel,
  slices,
  env,
  releaseNote,
}: BuildPreviewPanelProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground mb-4">Build 阶段生成内容预览</h4>
      
      {/* Tech Stack */}
      {techStack && (
        <CollapsibleSection 
          title={`技术栈: ${techStack}`} 
          icon={<Settings className="w-4 h-4" />}
          defaultOpen
        >
          <p className="text-sm text-muted-foreground">
            已选择的技术方案将用于后续开发
          </p>
        </CollapsibleSection>
      )}
      
      {/* Routes */}
      {routes && (
        <CollapsibleSection 
          title="路由设计" 
          icon={<Route className="w-4 h-4" />}
        >
          <pre className="text-xs bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre-wrap font-mono">
            {routes}
          </pre>
        </CollapsibleSection>
      )}
      
      {/* Data Model */}
      {dataModel && (
        <CollapsibleSection 
          title="数据模型" 
          icon={<Database className="w-4 h-4" />}
        >
          <pre className="text-xs bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre-wrap font-mono">
            {dataModel}
          </pre>
        </CollapsibleSection>
      )}
      
      {/* Slices */}
      {slices && slices.length > 0 && (
        <CollapsibleSection 
          title={`切片任务 (${slices.length} 个)`} 
          icon={<Layers className="w-4 h-4" />}
          defaultOpen
        >
          <div className="space-y-3">
            {slices.map((slice, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-3 rounded-lg border",
                  index === 0 && "border-primary/50 bg-primary/5",
                  index === 1 && "border-accent/50 bg-accent/5",
                  index === 2 && "border-secondary/50 bg-secondary/5",
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">
                    Loop {slice.loop}: {slice.name}
                  </h5>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {slice.estimatedTime}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{slice.description}</p>
                <ul className="text-xs space-y-1">
                  {slice.tasks.map((task, taskIndex) => (
                    <li key={taskIndex} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
      
      {/* Environment */}
      {env && (
        <CollapsibleSection 
          title="环境配置" 
          icon={<Settings className="w-4 h-4" />}
        >
          <pre className="text-xs bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre-wrap font-mono">
            {env}
          </pre>
        </CollapsibleSection>
      )}
      
      {/* Release Note */}
      {releaseNote && (
        <CollapsibleSection 
          title="发布说明" 
          icon={<FileText className="w-4 h-4" />}
        >
          <pre className="text-xs bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
            {releaseNote}
          </pre>
        </CollapsibleSection>
      )}
    </div>
  );
}
