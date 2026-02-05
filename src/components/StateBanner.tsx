import type { DetectionState } from '@/lib/types';
import { CheckCircle, AlertTriangle, EyeOff, HelpCircle } from 'lucide-react';

interface StateBannerProps {
  state: DetectionState;
  reason?: string;
  showReason?: boolean;
}

export function StateBanner({ state, reason, showReason = true }: StateBannerProps) {
  const stateConfig = {
    clear: {
      icon: CheckCircle,
      label: 'Clear',
      description: 'Good visibility, stable detection',
      className: 'clear',
    },
    mixed: {
      icon: AlertTriangle,
      label: 'Mixed Signals',
      description: 'Conflicting expressions detected',
      className: 'mixed',
    },
    low: {
      icon: EyeOff,
      label: 'Low Visibility',
      description: 'Poor lighting or face position',
      className: 'low',
    },
  };

  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <div 
      className={`state-badge ${config.className}`}
      role="status"
      aria-live="polite"
      aria-label={`Detection state: ${config.label}. ${reason || config.description}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="font-medium">{config.label}</span>
      
      {showReason && (
        <button 
          className="ml-2 p-1 rounded-full hover:bg-background/50 transition-colors"
          aria-label="Show more details"
          title={reason || config.description}
        >
          <HelpCircle className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

interface WhyPanelProps {
  reason: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WhyPanel({ reason, isOpen, onClose }: WhyPanelProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="mt-2 p-3 rounded-lg bg-muted/50 border border-border animate-slide-up"
      role="tooltip"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Why this state?</p>
          <p className="text-sm">{reason}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Close explanation"
        >
          ×
        </button>
      </div>
    </div>
  );
}