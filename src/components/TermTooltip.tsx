import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GLOSSARY, type GlossaryKey } from '@/lib/glossary';

interface TermTooltipProps {
  term: GlossaryKey;
  children: React.ReactNode;
}

export function TermTooltip({ term, children }: TermTooltipProps) {
  const info = GLOSSARY[term];
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 underline decoration-dotted decoration-muted-foreground/50 underline-offset-2 cursor-help">
          {children}
          <HelpCircle className="w-3 h-3 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{info.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
