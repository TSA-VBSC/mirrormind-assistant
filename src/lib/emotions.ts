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
    weights: [0.18, 0.12, 0.22, 0.18, 0.1, 0.1, 0.1],
    threshold: 20,
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

// Sadness indicators that should suppress/reduce happy confidence
const SADNESS_INDICATORS = ['inner_brow_raise', 'drooping_eyelids', 'frown', 'lip_press', 'lip_stretch', 'mouth_dimple', 'brow_furrow'];

export function mapExpressionsToEmotions(expressions: Expression[]): Emotion[] {
  const expressionMap: Record<string, number> = {};
  expressions.forEach(exp => {
    const id = exp.name.toLowerCase().replace(/\s+/g, '_');
    expressionMap[id] = exp.strength;
    // Common name mappings
    if (id === 'eyebrows_raised') expressionMap['brow_raise'] = exp.strength;
  });
  
  // Also map by potential id
  expressions.forEach(exp => {
    const potentialId = (exp as any).id || exp.name.toLowerCase().replace(/\s+/g, '_');
    expressionMap[potentialId] = exp.strength;
  });
  
  // Compute sadness signal strength
  let sadnessSignalStrength = 0;
  let sadnessSignalCount = 0;
  SADNESS_INDICATORS.forEach(id => {
    const val = expressionMap[id] || 0;
    if (val > 10) {
      sadnessSignalStrength += val;
      sadnessSignalCount++;
    }
  });

  const smileStrength = expressionMap['smile'] || 0;
  
  // Determine if smile should be suppressed:
  // If 2+ sadness indicators are present and the smile is weak/moderate,
  // reduce smile's effective strength for emotion mapping
  let smileSuppression = 1.0; // no suppression by default
  if (sadnessSignalCount >= 2 && smileStrength < 60) {
    // Strong suppression: sadness indicators override a weak smile
    smileSuppression = Math.max(0.1, 1 - (sadnessSignalStrength / 200));
  } else if (sadnessSignalCount >= 1 && smileStrength < 40) {
    smileSuppression = 0.5;
  }

  const emotions: Emotion[] = [];
  
  Object.entries(emotionRules).forEach(([emotionId, rule]) => {
    let score = 0;
    let matchedCount = 0;
    
    rule.expressions.forEach((expId, idx) => {
      let expStrength = expressionMap[expId] || 0;
      
      // Apply smile suppression for happy emotion
      if (emotionId === 'happy' && expId === 'smile') {
        expStrength *= smileSuppression;
      }
      
      if (expStrength > 10) {
        score += expStrength * rule.weights[idx];
        matchedCount++;
      }
    });
    
    // Require at least one expression match
    if (matchedCount > 0 && score >= rule.threshold) {
      // Boost sad confidence when multiple sadness indicators present
      let finalScore = score;
      if (emotionId === 'sad' && sadnessSignalCount >= 3) {
        finalScore = Math.min(100, score * 1.3);
      }
      
      emotions.push({
        name: emotionId.charAt(0).toUpperCase() + emotionId.slice(1),
        confidence: Math.min(100, Math.round(finalScore)),
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
      return `Facial tension and brow position suggest sadness or emotional distress`;
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
