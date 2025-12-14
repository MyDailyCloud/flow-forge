import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { AIOption } from '@/types/aiOptions';

interface AIOptionCardProps {
  option: AIOption;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function AIOptionCard({ option, isSelected, onSelect, disabled }: AIOptionCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'relative p-4 rounded-lg border text-left transition-all duration-200',
        'hover:border-primary/50 hover:bg-primary/5',
        isSelected
          ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
          : 'border-border bg-card',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
      <h4 className="font-medium text-foreground mb-1">{option.label}</h4>
      {option.description && (
        <p className="text-sm text-muted-foreground">{option.description}</p>
      )}
    </button>
  );
}
