// Expression Detection Types

export interface Expression {
  name: string;
  strength: number; // 0-100
  evidence: string;
}

export interface Emotion {
  name: string;
  confidence: number; // 0-100
}

export type DetectionState = 'clear' | 'mixed' | 'low';

export interface DetectionResult {
  expressions: Expression[];
  emotions: Emotion[];
  state: DetectionState;
  stateReason?: string;
  timestamp: number;
  qualityScore: number;
}

export interface TimelineEntry {
  id: string;
  timestamp: number;
  topExpression: Expression;
  topEmotion: Emotion;
  state: DetectionState;
}

export interface SessionSummary {
  duration: number;
  expressionCounts: Record<string, number>;
  clearPercentage: number;
  mixedPercentage: number;
  lowVisibilityPercentage: number;
  averageConfidence: number;
  totalFrames: number;
}

// Feature vector from face landmarks
export interface FaceFeatures {
  eyeAspectRatioLeft: number;
  eyeAspectRatioRight: number;
  mouthAspectRatio: number;
  mouthCornerAngle: number;
  lipCompressionRatio: number;
  browToEyeDistance: number;
  browInnerDistance: number;
  noseWrinkleProxy: number;
  symmetryScore: number;
  headTilt: number;
  mouthWidth: number;
  jawOpenness: number;
}

// Expression definitions
export const EXPRESSIONS = [
  { id: 'smile', name: 'Smile', description: 'Both mouth corners lifted' },
  { id: 'smirk', name: 'Smirk', description: 'One corner lifted (asymmetrical)' },
  { id: 'frown', name: 'Frown', description: 'Mouth corners down' },
  { id: 'mouth_open', name: 'Mouth Open', description: 'Jaw dropped / surprise / talking' },
  { id: 'lip_press', name: 'Lip Press', description: 'Tight pressed lips' },
  { id: 'lip_purse', name: 'Lip Purse', description: 'Pursed / puckered lips' },
  { id: 'brow_raise', name: 'Eyebrows Raised', description: 'Surprise / interest' },
  { id: 'brow_furrow', name: 'Brow Furrow', description: 'Confusion / concentration / anger' },
  { id: 'squint', name: 'Squint', description: 'Narrowed eyes / skepticism / smiling eyes' },
  { id: 'wide_eyes', name: 'Wide Eyes', description: 'Surprise / fear' },
  { id: 'nose_wrinkle', name: 'Nose Wrinkle', description: 'Disgust / distaste' },
  { id: 'head_tilt', name: 'Head Tilt', description: 'Curious / confused' },
] as const;

export const EMOTIONS = [
  { id: 'happy', name: 'Happy' },
  { id: 'surprised', name: 'Surprised' },
  { id: 'sad', name: 'Sad' },
  { id: 'angry', name: 'Angry' },
  { id: 'fearful', name: 'Fearful' },
  { id: 'disgusted', name: 'Disgusted' },
  { id: 'neutral', name: 'Neutral' },
  { id: 'skeptical', name: 'Skeptical' },
  { id: 'confused', name: 'Confused' },
  { id: 'interested', name: 'Interested' },
] as const;