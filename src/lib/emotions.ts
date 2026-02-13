import type { Expression, Emotion } from './types';

// Map expression combinations to emotions
// Each emotion has contributing expressions with weights

const emotionRules: Record<string, { expressions: string[]; weights: number[]; threshold: number }> = {
  happy: {
    expressions: ['smile', 'squint'],
    weights: [0.7, 0.3],
    threshold: 30,
  },
  surprised: {
    expressions: ['mouth_open', 'brow_raise', 'wide_eyes'],
    weights: [0.4, 0.3, 0.3],
    threshold: 35,
  },
  sad: {
    expressions: ['frown', 'brow_furrow', 'inner_brow_raise', 'drooping_eyelids', 'lip_press', 'lip_stretch', 'mouth_dimple'],
    weights: [0.2, 0.15, 0.2, 0.15, 0.1, 0.1, 0.1],
    threshold: 25,
  },
  angry: {
    expressions: ['brow_furrow', 'lip_press', 'squint'],
    weights: [0.5, 0.3, 0.2],
    threshold: 40,
  },
  fearful: {
    expressions: ['wide_eyes', 'mouth_open', 'brow_raise'],
    weights: [0.4, 0.3, 0.3],
    threshold: 40,
  },
  disgusted: {
    expressions: ['nose_wrinkle', 'lip_press', 'squint'],
    weights: [0.5, 0.3, 0.2],
    threshold: 35,
  },
  skeptical: {
    expressions: ['squint', 'smirk', 'brow_raise'],
    weights: [0.4, 0.3, 0.3],
    threshold: 35,
  },
  confused: {
    expressions: ['head_tilt', 'brow_furrow', 'squint'],
    weights: [0.4, 0.3, 0.3],
    threshold: 30,
  },
  interested: {
    expressions: ['brow_raise', 'wide_eyes'],
    weights: [0.5, 0.5],
    threshold: 30,
  },
};

export function mapExpressionsToEmotions(expressions: Expression[]): Emotion[] {
  const expressionMap: Record<string, number> = {};
  expressions.forEach(exp => {
    // Extract the id from the name if needed
    const id = exp.name.toLowerCase().replace(/\s+/g, '_');
    expressionMap[id] = exp.strength;
    // Also try to match common variations
    if (id === 'eyebrows_raised') expressionMap['brow_raise'] = exp.strength;
    if (id === 'brow_furrow') expressionMap['brow_furrow'] = exp.strength;
  });
  
  // Also map by direct expression id if it's in the expressions array
  expressions.forEach(exp => {
    // The Expression might have an 'id' field or we can extract from name
    const potentialId = (exp as any).id || exp.name.toLowerCase().replace(/\s+/g, '_');
    expressionMap[potentialId] = exp.strength;
  });
  
  const emotions: Emotion[] = [];
  
  Object.entries(emotionRules).forEach(([emotionId, rule]) => {
    let score = 0;
    let matchedCount = 0;
    
    rule.expressions.forEach((expId, idx) => {
      const expStrength = expressionMap[expId] || 0;
      if (expStrength > 10) {
        score += expStrength * rule.weights[idx];
        matchedCount++;
      }
    });
    
    // Require at least one expression match
    if (matchedCount > 0 && score >= rule.threshold) {
      emotions.push({
        name: emotionId.charAt(0).toUpperCase() + emotionId.slice(1),
        confidence: Math.min(100, Math.round(score)),
      });
    }
  });
  
  // Sort by confidence
  emotions.sort((a, b) => b.confidence - a.confidence);
  
  // If no emotions detected with sufficient confidence, return neutral
  if (emotions.length === 0 || emotions[0].confidence < 25) {
    return [{ name: 'Neutral', confidence: 60 }];
  }
  
  return emotions.slice(0, 3); // Return top 3
}

export function getEmotionDescription(emotion: Emotion, expressions: Expression[]): string {
  const topExpressions = expressions.slice(0, 3).map(e => e.name.toLowerCase()).join(', ');
  
  switch (emotion.name.toLowerCase()) {
    case 'happy':
      return `Based on ${topExpressions}, suggests a positive emotional state`;
    case 'surprised':
      return `Open features (${topExpressions}) indicate surprise or interest`;
    case 'sad':
      return `Downturned features suggest sadness or disappointment`;
    case 'angry':
      return `Tension in face (${topExpressions}) may indicate frustration`;
    case 'fearful':
      return `Widened features suggest alertness or concern`;
    case 'disgusted':
      return `Nose and mouth tension suggest distaste`;
    case 'skeptical':
      return `Asymmetrical features suggest doubt or skepticism`;
    case 'confused':
      return `Head position and brow suggest puzzlement`;
    case 'interested':
      return `Open, attentive features suggest engagement`;
    case 'neutral':
      return `Relaxed features with no strong emotional signals`;
    default:
      return `Expression pattern suggests ${emotion.name.toLowerCase()}`;
  }
}