import type { FaceFeatures, Expression } from './types';

// Expression scoring based on facial feature analysis
// Returns expressions with strength 0-100 and evidence strings

interface ExpressionResult {
  id: string;
  name: string;
  strength: number;
  evidence: string;
}

// Baseline values (neutral face averages)
const BASELINE = {
  eyeAspectRatio: 0.25,
  mouthAspectRatio: 0.15,
  mouthCornerAngle: 160,
  browToEyeDistance: 0.04,
  browInnerDistance: 0.08,
  symmetryScore: 0.95,
  jawOpenness: 0.05,
  headTilt: 0,
};

export function scoreExpressions(features: FaceFeatures, blendshapes?: any[]): ExpressionResult[] {
  const results: ExpressionResult[] = [];
  
  // Use blendshapes if available (more accurate)
  if (blendshapes && blendshapes.length > 0) {
    const bs = blendshapes[0].categories.reduce((acc: Record<string, number>, cat: any) => {
      acc[cat.categoryName] = cat.score;
      return acc;
    }, {});
    
    // Smile detection
    const smileScore = ((bs.mouthSmileLeft || 0) + (bs.mouthSmileRight || 0)) / 2;
    if (smileScore > 0.1) {
      results.push({
        id: 'smile',
        name: 'Smile',
        strength: Math.min(100, smileScore * 150),
        evidence: `Mouth corners lifted (${Math.round(smileScore * 100)}%)`,
      });
    }
    
    // Smirk (asymmetrical smile)
    const smirkDiff = Math.abs((bs.mouthSmileLeft || 0) - (bs.mouthSmileRight || 0));
    if (smirkDiff > 0.15 && (bs.mouthSmileLeft > 0.2 || bs.mouthSmileRight > 0.2)) {
      const side = bs.mouthSmileLeft > bs.mouthSmileRight ? 'left' : 'right';
      results.push({
        id: 'smirk',
        name: 'Smirk',
        strength: Math.min(100, smirkDiff * 200),
        evidence: `Asymmetrical smile - ${side} corner higher`,
      });
    }
    
    // Frown
    const frownScore = ((bs.mouthFrownLeft || 0) + (bs.mouthFrownRight || 0)) / 2;
    if (frownScore > 0.1) {
      results.push({
        id: 'frown',
        name: 'Frown',
        strength: Math.min(100, frownScore * 150),
        evidence: `Mouth corners down (${Math.round(frownScore * 100)}%)`,
      });
    }
    
    // Mouth open / jaw drop
    const jawOpen = bs.jawOpen || 0;
    if (jawOpen > 0.15) {
      results.push({
        id: 'mouth_open',
        name: 'Mouth Open',
        strength: Math.min(100, jawOpen * 120),
        evidence: `Jaw dropped (${Math.round(jawOpen * 100)}%)`,
      });
    }
    
    // Lip press
    const lipPress = ((bs.mouthPressLeft || 0) + (bs.mouthPressRight || 0)) / 2;
    if (lipPress > 0.15) {
      results.push({
        id: 'lip_press',
        name: 'Lip Press',
        strength: Math.min(100, lipPress * 130),
        evidence: `Lips pressed together (${Math.round(lipPress * 100)}%)`,
      });
    }

    // Lip stretch / suppressed emotion (lips pulled back tightly)
    const lipStretch = ((bs.mouthStretchLeft || 0) + (bs.mouthStretchRight || 0)) / 2;
    if (lipStretch > 0.15) {
      results.push({
        id: 'lip_stretch',
        name: 'Lip Stretch',
        strength: Math.min(100, lipStretch * 140),
        evidence: `Lips stretched tightly (${Math.round(lipStretch * 100)}%)`,
      });
    }

    // Inner brow raise (sadness indicator)
    const innerBrowUp = bs.browInnerUp || 0;
    if (innerBrowUp > 0.12) {
      results.push({
        id: 'inner_brow_raise',
        name: 'Inner Brow Raise',
        strength: Math.min(100, innerBrowUp * 150),
        evidence: `Inner eyebrows raised (${Math.round(innerBrowUp * 100)}%) — often signals sadness or concern`,
      });
    }

    // Drooping eyelids (sadness/fatigue indicator)
    const eyeLidDroop = 1 - (((bs.eyeWideLeft || 0) + (bs.eyeWideRight || 0)) / 2);
    const eyeSquintForDroop = ((bs.eyeSquintLeft || 0) + (bs.eyeSquintRight || 0)) / 2;
    const droopScore = (eyeLidDroop * 0.4 + eyeSquintForDroop * 0.6);
    if (droopScore > 0.35 && eyeSquintForDroop > 0.15) {
      results.push({
        id: 'drooping_eyelids',
        name: 'Drooping Eyelids',
        strength: Math.min(100, droopScore * 120),
        evidence: `Eyelids lowered/heavy (${Math.round(droopScore * 100)}%) — may indicate sadness or fatigue`,
      });
    }

    // Mouth dimple / suppressed cry (mouth corners pulled inward)
    const mouthDimple = ((bs.mouthDimpleLeft || 0) + (bs.mouthDimpleRight || 0)) / 2;
    if (mouthDimple > 0.15) {
      results.push({
        id: 'mouth_dimple',
        name: 'Mouth Tension',
        strength: Math.min(100, mouthDimple * 140),
        evidence: `Mouth corners pulled inward (${Math.round(mouthDimple * 100)}%) — may indicate suppressed emotion`,
      });
    }
    
    // Lip purse
    const lipPurse = bs.mouthPucker || 0;
    if (lipPurse > 0.2) {
      results.push({
        id: 'lip_purse',
        name: 'Lip Purse',
        strength: Math.min(100, lipPurse * 130),
        evidence: `Lips puckered (${Math.round(lipPurse * 100)}%)`,
      });
    }
    
    // Eyebrows raised
    const browUp = ((bs.browOuterUpLeft || 0) + (bs.browOuterUpRight || 0) + 
                    (bs.browInnerUp || 0)) / 3;
    if (browUp > 0.15) {
      results.push({
        id: 'brow_raise',
        name: 'Eyebrows Raised',
        strength: Math.min(100, browUp * 150),
        evidence: `Brows elevated (${Math.round(browUp * 100)}%)`,
      });
    }
    
    // Brow furrow
    const browFurrow = bs.browDownLeft || bs.browDownRight || 0;
    if (browFurrow > 0.15) {
      results.push({
        id: 'brow_furrow',
        name: 'Brow Furrow',
        strength: Math.min(100, browFurrow * 150),
        evidence: `Brows drawn together (${Math.round(browFurrow * 100)}%)`,
      });
    }
    
    // Squint
    const squint = ((bs.eyeSquintLeft || 0) + (bs.eyeSquintRight || 0)) / 2;
    if (squint > 0.2) {
      results.push({
        id: 'squint',
        name: 'Squint',
        strength: Math.min(100, squint * 130),
        evidence: `Eyes narrowed (${Math.round(squint * 100)}%)`,
      });
    }
    
    // Wide eyes
    const wideEyes = ((bs.eyeWideLeft || 0) + (bs.eyeWideRight || 0)) / 2;
    if (wideEyes > 0.15) {
      results.push({
        id: 'wide_eyes',
        name: 'Wide Eyes',
        strength: Math.min(100, wideEyes * 150),
        evidence: `Eyes widened (${Math.round(wideEyes * 100)}%)`,
      });
    }
    
    // Nose wrinkle
    const noseWrinkle = bs.noseSneerLeft || bs.noseSneerRight || 0;
    if (noseWrinkle > 0.15) {
      results.push({
        id: 'nose_wrinkle',
        name: 'Nose Wrinkle',
        strength: Math.min(100, noseWrinkle * 150),
        evidence: `Nose scrunched (${Math.round(noseWrinkle * 100)}%)`,
      });
    }
  } else {
    // Fallback to feature-based scoring
    // Smile detection based on mouth corner angle
    if (features.mouthCornerAngle < BASELINE.mouthCornerAngle - 5) {
      const diff = BASELINE.mouthCornerAngle - features.mouthCornerAngle;
      results.push({
        id: 'smile',
        name: 'Smile',
        strength: Math.min(100, diff * 5),
        evidence: `Mouth corners lifted`,
      });
    }
    
    // Smirk based on symmetry
    if (features.symmetryScore < 0.85) {
      results.push({
        id: 'smirk',
        name: 'Smirk',
        strength: Math.min(100, (1 - features.symmetryScore) * 200),
        evidence: `Asymmetrical mouth position`,
      });
    }
    
    // Mouth open based on jaw openness
    if (features.jawOpenness > BASELINE.jawOpenness * 2) {
      results.push({
        id: 'mouth_open',
        name: 'Mouth Open',
        strength: Math.min(100, (features.jawOpenness / 0.2) * 100),
        evidence: `Jaw dropped`,
      });
    }
    
    // Brow raise based on brow-to-eye distance
    if (features.browToEyeDistance > BASELINE.browToEyeDistance * 1.2) {
      results.push({
        id: 'brow_raise',
        name: 'Eyebrows Raised',
        strength: Math.min(100, ((features.browToEyeDistance - BASELINE.browToEyeDistance) / BASELINE.browToEyeDistance) * 200),
        evidence: `Brows elevated`,
      });
    }
    
    // Head tilt
    if (Math.abs(features.headTilt) > 5) {
      const direction = features.headTilt > 0 ? 'right' : 'left';
      results.push({
        id: 'head_tilt',
        name: 'Head Tilt',
        strength: Math.min(100, Math.abs(features.headTilt) * 3),
        evidence: `Head tilted ${direction}`,
      });
    }
  }
  
  // Sort by strength descending
  return results.sort((a, b) => b.strength - a.strength);
}

// Detect conflicting expressions for "Mixed Signals" state
export function detectConflicts(expressions: ExpressionResult[]): { isConflicting: boolean; reason: string } {
  const hasSmile = expressions.find(e => e.id === 'smile' && e.strength > 40);
  const hasFrown = expressions.find(e => e.id === 'frown' && e.strength > 40);
  const hasBrowFurrow = expressions.find(e => e.id === 'brow_furrow' && e.strength > 40);
  const hasLipPress = expressions.find(e => e.id === 'lip_press' && e.strength > 40);
  const hasSquint = expressions.find(e => e.id === 'squint' && e.strength > 40);
  const hasBrowRaise = expressions.find(e => e.id === 'brow_raise' && e.strength > 40);
  
  // Smile + Brow furrow = polite/awkward smile
  if (hasSmile && hasBrowFurrow) {
    return {
      isConflicting: true,
      reason: `Smile (${Math.round(hasSmile.strength)}) + Brow furrow (${Math.round(hasBrowFurrow.strength)}) - could be polite/nervous smile`,
    };
  }
  
  // Smile + Lip press = suppressed emotion
  if (hasSmile && hasLipPress) {
    return {
      isConflicting: true,
      reason: `Smile (${Math.round(hasSmile.strength)}) + Lip press (${Math.round(hasLipPress.strength)}) - may be suppressing emotion`,
    };
  }
  
  // Squint + Lip press + Brow raise = sarcasm/skepticism
  if (hasSquint && hasLipPress && hasBrowRaise) {
    return {
      isConflicting: true,
      reason: `Squint + Lip press + Brow raise - possible sarcasm or skepticism`,
    };
  }
  
  // Smile + Frown = very mixed
  if (hasSmile && hasFrown) {
    return {
      isConflicting: true,
      reason: `Mixed mouth signals - smile and frown detected`,
    };
  }
  
  return { isConflicting: false, reason: '' };
}