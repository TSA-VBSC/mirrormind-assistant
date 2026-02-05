import { useSettings } from '@/contexts/SettingsContext';
import type { Expression } from '@/lib/types';
import { Eye, Smile, Frown, AlertCircle } from 'lucide-react';

interface ExpressionStackProps {
  expressions: Expression[];
  maxDisplay?: number;
}

export function ExpressionStack({ expressions, maxDisplay = 4 }: ExpressionStackProps) {
  const { settings } = useSettings();
  const displayExpressions = expressions.slice(0, maxDisplay);

  const getStrengthClass = (strength: number): string => {
    if (strength >= 70) return 'high';
    if (strength >= 40) return 'medium';
    return 'low';
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength >= 70) return 'Strong';
    if (strength >= 40) return 'Moderate';
    return 'Weak';
  };

  const getExpressionIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('smile') || lowerName.includes('smirk')) {
      return <Smile className="h-4 w-4" aria-hidden="true" />;
    }
    if (lowerName.includes('frown')) {
      return <Frown className="h-4 w-4" aria-hidden="true" />;
    }
    if (lowerName.includes('eye') || lowerName.includes('squint') || lowerName.includes('wide')) {
      return <Eye className="h-4 w-4" aria-hidden="true" />;
    }
    return <AlertCircle className="h-4 w-4" aria-hidden="true" />;
  };

  if (displayExpressions.length === 0) {
    return (
      <div className="expression-card">
        <p className="text-muted-foreground text-sm">No strong expressions detected</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Face appears neutral</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Detected expressions">
      {displayExpressions.map((expression, index) => {
        const strengthClass = getStrengthClass(expression.strength);
        const strengthLabel = getStrengthLabel(expression.strength);
        
        return (
          <div
            key={`${expression.name}-${index}`}
            className="expression-card animate-in"
            role="listitem"
            aria-label={`${expression.name}: ${Math.round(expression.strength)} percent, ${strengthLabel}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getExpressionIcon(expression.name)}
                <span className="font-medium">{expression.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Pattern indicator for colorblind mode */}
                <span 
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    strengthClass === 'high' 
                      ? 'bg-expression-high/20 text-expression-high' 
                      : strengthClass === 'medium'
                      ? 'bg-expression-medium/20 text-expression-medium border border-dashed border-expression-medium'
                      : 'bg-expression-low/20 text-expression-low border border-dotted border-expression-low'
                  }`}
                  aria-hidden="true"
                >
                  {strengthLabel}
                </span>
                <span className="text-sm font-mono text-muted-foreground">
                  {Math.round(expression.strength)}%
                </span>
              </div>
            </div>
            
            {/* Strength bar with pattern support */}
            <div className="strength-bar h-2" role="progressbar" aria-valuenow={expression.strength} aria-valuemin={0} aria-valuemax={100}>
              <div 
                className={`strength-bar-fill ${strengthClass}`}
                style={{ width: `${expression.strength}%` }}
              />
            </div>
            
            {/* Evidence text */}
            {expression.evidence && (
              <p className="text-xs text-muted-foreground mt-2">
                {expression.evidence}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}