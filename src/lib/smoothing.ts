import type { Expression, Emotion, DetectionState, DetectionResult } from './types';

// Exponential Moving Average (EMA) smoothing
// Higher alpha = more responsive to changes, lower alpha = smoother

const ALPHA = 0.15; // Lower = smoother, less flicker
const STABILITY_FRAMES = 8; // More frames required for stability
const MIN_CHANGE_THRESHOLD = 8; // Minimum change to trigger update

interface SmoothedState {
  expressions: Map<string, { strength: number; frames: number }>;
  emotions: Map<string, { confidence: number; frames: number }>;
  state: DetectionState;
  stateFrames: number;
}

let smoothedState: SmoothedState = {
  expressions: new Map(),
  emotions: new Map(),
  state: 'clear',
  stateFrames: 0,
};

export function smoothDetection(
  rawExpressions: Expression[],
  rawEmotions: Emotion[],
  rawState: DetectionState,
  stateReason: string,
  qualityScore: number
): DetectionResult {
  // Apply EMA to expressions
  const newExpressionMap = new Map<string, number>();
  rawExpressions.forEach(exp => {
    newExpressionMap.set(exp.name, exp.strength);
  });
  
  // Update smoothed expressions
  smoothedState.expressions.forEach((value, key) => {
    if (!newExpressionMap.has(key)) {
      // Decay expressions that are no longer detected
      const newStrength = value.strength * (1 - ALPHA);
      if (newStrength < 5) {
        smoothedState.expressions.delete(key);
      } else {
        smoothedState.expressions.set(key, { strength: newStrength, frames: 0 });
      }
    }
  });
  
  newExpressionMap.forEach((strength, key) => {
    const existing = smoothedState.expressions.get(key);
    if (existing) {
      const smoothedStrength = existing.strength * (1 - ALPHA) + strength * ALPHA;
      const change = Math.abs(smoothedStrength - existing.strength);
      const frames = change > MIN_CHANGE_THRESHOLD ? 0 : existing.frames + 1;
      smoothedState.expressions.set(key, { strength: smoothedStrength, frames });
    } else if (strength > 15) {
      smoothedState.expressions.set(key, { strength: strength * ALPHA, frames: 0 });
    }
  });
  
  // Apply EMA to emotions
  const newEmotionMap = new Map<string, number>();
  rawEmotions.forEach(emo => {
    newEmotionMap.set(emo.name, emo.confidence);
  });
  
  smoothedState.emotions.forEach((value, key) => {
    if (!newEmotionMap.has(key)) {
      const newConfidence = value.confidence * (1 - ALPHA);
      if (newConfidence < 10) {
        smoothedState.emotions.delete(key);
      } else {
        smoothedState.emotions.set(key, { confidence: newConfidence, frames: 0 });
      }
    }
  });
  
  newEmotionMap.forEach((confidence, key) => {
    const existing = smoothedState.emotions.get(key);
    if (existing) {
      const smoothedConfidence = existing.confidence * (1 - ALPHA) + confidence * ALPHA;
      const change = Math.abs(smoothedConfidence - existing.confidence);
      const frames = change > MIN_CHANGE_THRESHOLD ? 0 : existing.frames + 1;
      smoothedState.emotions.set(key, { confidence: smoothedConfidence, frames });
    } else if (confidence > 20) {
      smoothedState.emotions.set(key, { confidence: confidence * ALPHA, frames: 0 });
    }
  });
  
  // Apply stability locking to state changes
  if (rawState === smoothedState.state) {
    smoothedState.stateFrames++;
  } else {
    smoothedState.stateFrames++;
    if (smoothedState.stateFrames >= STABILITY_FRAMES) {
      smoothedState.state = rawState;
      smoothedState.stateFrames = 0;
    }
  }
  
  // Build result with stable expressions (only those stable for STABILITY_FRAMES)
  const stableExpressions: Expression[] = [];
  smoothedState.expressions.forEach((value, key) => {
    if (value.strength > 20) {
      const original = rawExpressions.find(e => e.name === key);
      stableExpressions.push({
        name: key,
        strength: Math.round(value.strength),
        evidence: original?.evidence || '',
      });
    }
  });
  stableExpressions.sort((a, b) => b.strength - a.strength);
  
  const stableEmotions: Emotion[] = [];
  smoothedState.emotions.forEach((value, key) => {
    if (value.confidence > 20) {
      stableEmotions.push({
        name: key,
        confidence: Math.round(value.confidence),
      });
    }
  });
  stableEmotions.sort((a, b) => b.confidence - a.confidence);
  
  return {
    expressions: stableExpressions,
    emotions: stableEmotions.length > 0 ? stableEmotions : [{ name: 'Neutral', confidence: 50 }],
    state: smoothedState.state,
    stateReason,
    timestamp: Date.now(),
    qualityScore,
  };
}

export function resetSmoothing() {
  smoothedState = {
    expressions: new Map(),
    emotions: new Map(),
    state: 'clear',
    stateFrames: 0,
  };
}