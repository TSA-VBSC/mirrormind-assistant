import type { Emotion } from '@/lib/types';
import { Heart, HelpCircle } from 'lucide-react';

interface EmotionGuessProps {
  emotions: Emotion[];
  showAlternatives?: boolean;
}

export function EmotionGuess({ emotions, showAlternatives = true }: EmotionGuessProps) {
  const primary = emotions[0];
  const alternatives = emotions.slice(1, 3);

  if (!primary) {
    return (
      <div className="expression-card">
        <div className="flex items-center gap-2 text-muted-foreground">
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          <span>Analyzing...</span>
        </div>
      </div>
    );
  }

  const getEmotionColor = (emotion: string): string => {
    const lower = emotion.toLowerCase();
    switch (lower) {
      case 'happy':
        return 'text-success';
      case 'surprised':
        return 'text-warning';
      case 'sad':
        return 'text-expression-medium';
      case 'angry':
        return 'text-destructive';
      case 'fearful':
        return 'text-warning';
      case 'disgusted':
        return 'text-expression-low';
      case 'skeptical':
        return 'text-expression-medium';
      case 'confused':
        return 'text-expression-medium';
      case 'interested':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="expression-card" role="region" aria-label="Emotion analysis">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">Likely Emotion</span>
      </div>
      
      {/* Primary emotion */}
      <div className="flex items-baseline justify-between mb-2">
        <span className={`text-2xl font-bold ${getEmotionColor(primary.name)}`}>
          {primary.name}
        </span>
        <span className="text-lg font-mono text-muted-foreground">
          {primary.confidence}%
        </span>
      </div>
      
      {/* Confidence bar */}
      <div className="strength-bar h-3 mb-4">
        <div 
          className={`strength-bar-fill ${primary.confidence >= 70 ? 'high' : primary.confidence >= 40 ? 'medium' : 'low'}`}
          style={{ width: `${primary.confidence}%` }}
        />
      </div>
      
      {/* Alternatives */}
      {showAlternatives && alternatives.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground mb-2">Also possible:</p>
          <div className="flex flex-wrap gap-2">
            {alternatives.map((emotion, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {emotion.name} ({emotion.confidence}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}