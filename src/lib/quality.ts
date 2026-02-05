// Quality assessment for face detection
// Determines "Clear", "Mixed Signals", or "Low Visibility" states

import type { DetectionState } from './types';

interface QualityResult {
  score: number; // 0-100
  state: DetectionState;
  reason: string;
}

// MediaPipe returns normalized coordinates, so we check relative sizes
export function assessQuality(
  landmarks: Array<{ x: number; y: number; z: number }> | null,
  canvasWidth: number,
  canvasHeight: number,
  imageData?: ImageData
): QualityResult {
  if (!landmarks || landmarks.length === 0) {
    return {
      score: 0,
      state: 'low',
      reason: 'No face detected in frame',
    };
  }
  
  let score = 100;
  const issues: string[] = [];
  
  // Check face size (should be at least 15% of frame width)
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
  
  if (faceWidth < 0.15) {
    score -= 30;
    issues.push('face too far');
  } else if (faceWidth < 0.25) {
    score -= 15;
    issues.push('face small');
  }
  
  // Check if face is centered (face center should be within middle 60% of frame)
  const faceCenter = (leftCheek.x + rightCheek.x) / 2;
  if (faceCenter < 0.2 || faceCenter > 0.8) {
    score -= 20;
    issues.push('face off-center');
  }
  
  // Check face vertical position
  const chin = landmarks[152];
  const forehead = landmarks[10];
  const faceCenterY = (chin.y + forehead.y) / 2;
  if (faceCenterY < 0.2 || faceCenterY > 0.8) {
    score -= 15;
    issues.push('face too high/low');
  }
  
  // Check for extreme head rotation (using nose tip position relative to face)
  const noseTip = landmarks[1];
  const noseRelativeX = (noseTip.x - leftCheek.x) / faceWidth;
  if (noseRelativeX < 0.3 || noseRelativeX > 0.7) {
    score -= 25;
    issues.push('head turned too much');
  }
  
  // Basic lighting check using average z-depth variance
  // (poor lighting often causes inconsistent depth estimates)
  const depths = landmarks.slice(0, 50).map(l => l.z);
  const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
  const depthVariance = depths.reduce((acc, d) => acc + Math.pow(d - avgDepth, 2), 0) / depths.length;
  
  if (depthVariance > 0.01) {
    score -= 10;
    issues.push('lighting may be uneven');
  }
  
  // Estimate brightness if imageData is provided
  if (imageData) {
    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      totalBrightness += (r + g + b) / 3;
    }
    const avgBrightness = totalBrightness / (imageData.data.length / 4);
    
    if (avgBrightness < 50) {
      score -= 25;
      issues.push('very dark');
    } else if (avgBrightness < 80) {
      score -= 10;
      issues.push('dim lighting');
    } else if (avgBrightness > 220) {
      score -= 15;
      issues.push('very bright/overexposed');
    }
  }
  
  // Determine state
  let state: DetectionState;
  let reason: string;
  
  if (score >= 70) {
    state = 'clear';
    reason = 'Good visibility';
  } else if (score >= 40) {
    state = 'clear';
    reason = issues.length > 0 ? `Minor issues: ${issues.join(', ')}` : 'Acceptable visibility';
  } else {
    state = 'low';
    reason = `Low visibility: ${issues.join(', ')}`;
  }
  
  return {
    score: Math.max(0, score),
    state,
    reason,
  };
}