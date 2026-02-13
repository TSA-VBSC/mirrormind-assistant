import type { Expression, Emotion } from './types';

/**
 * Simplified emotion system: Happy, Sad, Surprised, Neutral
 * Uses weighted multi-signal scoring with sadness prioritization
 */

interface EmotionScore {
  name: string;
  score: number;
}

export function mapExpressionsToEmotions(expressions: Expression[]): Emotion[] {
  const exp: Record<string, number> = {};
  expressions.forEach(e => {
    const id = e.name.toLowerCase().replace(/\s+/g, '_');
    exp[id] = e.strength;
    if (id === 'eyebrows_raised') exp['brow_raise'] = e.strength;
    const potentialId = (e as any).id || id;
    exp[potentialId] = e.strength;
  });

  const g = (id: string) => exp[id] || 0;

  // --- Score each emotion with weighted signals ---

  // HAPPY: strong smile, no conflicting sadness
  let happyScore = g('smile') * 0.7 + g('squint') * 0.3;

  // SURPRISED: raised brows + wide eyes, optionally mouth open
  const surprisedScore =
    g('brow_raise') * 0.35 +
    g('wide_eyes') * 0.35 +
    g('mouth_open') * 0.30;

  // SAD: multiple subtle signals weighted together
  const sadScore =
    g('inner_brow_raise') * 0.25 +
    g('drooping_eyelids') * 0.20 +
    g('frown') * 0.20 +
    g('lip_press') * 0.10 +
    g('lip_stretch') * 0.10 +
    g('mouth_dimple') * 0.10 +
    g('brow_furrow') * 0.05;

  // Count how many sadness indicators are active
  const sadIndicators = ['inner_brow_raise', 'drooping_eyelids', 'frown', 'lip_press', 'lip_stretch', 'mouth_dimple', 'brow_furrow'];
  const activeSadCount = sadIndicators.filter(id => g(id) > 10).length;

  // Suppress happy when sadness signals are present alongside a weak/moderate smile
  if (activeSadCount >= 2 && g('smile') < 60) {
    happyScore *= Math.max(0.1, 1 - (activeSadCount * 0.25));
  } else if (activeSadCount >= 1 && g('smile') < 35) {
    happyScore *= 0.4;
  }

  // Boost sad when multiple indicators converge
  const boostedSadScore = activeSadCount >= 3
    ? Math.min(100, sadScore * 1.3)
    : sadScore;

  // Collect scores
  const emotions: EmotionScore[] = [
    { name: 'Happy', score: happyScore },
    { name: 'Sad', score: boostedSadScore },
    { name: 'Surprised', score: surprisedScore },
  ];

  // Sort by score descending
  emotions.sort((a, b) => b.score - a.score);

  // Minimum threshold to be considered a real emotion
  const THRESHOLD = 25;
  const detected = emotions.filter(e => e.score >= THRESHOLD);

  if (detected.length === 0) {
    return [{ name: 'Neutral', confidence: 60 }];
  }

  // Return top emotions (up to 3, including Neutral as fallback alternative)
  const result: Emotion[] = detected.slice(0, 3).map(e => ({
    name: e.name,
    confidence: Math.min(100, Math.round(e.score)),
  }));

  return result;
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
    case 'neutral':
      return `Relaxed features with no strong emotional signals`;
    default:
      return `Expression pattern suggests ${emotion.name.toLowerCase()}`;
  }
}
