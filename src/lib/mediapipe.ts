import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import type { FaceFeatures } from './types';

let faceLandmarker: FaceLandmarker | null = null;
let isInitializing = false;

export async function initializeFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarker) return faceLandmarker;
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (faceLandmarker) return faceLandmarker;
  }
  
  isInitializing = true;
  
  try {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
      runningMode: 'VIDEO',
      numFaces: 1,
    });
    
    return faceLandmarker;
  } finally {
    isInitializing = false;
  }
}

export function getFaceLandmarker(): FaceLandmarker | null {
  return faceLandmarker;
}

// Helper to calculate distance between two points
function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Helper to calculate angle between three points
function angle(p1: { x: number; y: number }, center: { x: number; y: number }, p2: { x: number; y: number }): number {
  const a = distance(center, p1);
  const b = distance(center, p2);
  const c = distance(p1, p2);
  return Math.acos((a * a + b * b - c * c) / (2 * a * b)) * (180 / Math.PI);
}

// MediaPipe Face Landmark indices
const LANDMARKS = {
  // Eyes
  leftEyeUpper: [159, 145],
  leftEyeLower: [145, 159],
  leftEyeInner: 133,
  leftEyeOuter: 33,
  rightEyeUpper: [386, 374],
  rightEyeLower: [374, 386],
  rightEyeInner: 362,
  rightEyeOuter: 263,
  
  // Eyebrows
  leftBrowInner: 107,
  leftBrowOuter: 70,
  rightBrowInner: 336,
  rightBrowOuter: 300,
  
  // Mouth
  mouthLeft: 61,
  mouthRight: 291,
  mouthTop: 13,
  mouthBottom: 14,
  upperLipTop: 0,
  lowerLipBottom: 17,
  
  // Nose
  noseTip: 1,
  noseLeft: 219,
  noseRight: 439,
  
  // Face outline
  chin: 152,
  foreheadCenter: 10,
  leftCheek: 234,
  rightCheek: 454,
};

export function extractFeatures(landmarks: Array<{ x: number; y: number; z: number }>): FaceFeatures {
  // Eye aspect ratios (height / width)
  const leftEyeHeight = distance(landmarks[159], landmarks[145]);
  const leftEyeWidth = distance(landmarks[33], landmarks[133]);
  const eyeAspectRatioLeft = leftEyeHeight / leftEyeWidth;
  
  const rightEyeHeight = distance(landmarks[386], landmarks[374]);
  const rightEyeWidth = distance(landmarks[263], landmarks[362]);
  const eyeAspectRatioRight = rightEyeHeight / rightEyeWidth;
  
  // Mouth aspect ratio
  const mouthHeight = distance(landmarks[13], landmarks[14]);
  const mouthWidth = distance(landmarks[61], landmarks[291]);
  const mouthAspectRatio = mouthHeight / mouthWidth;
  
  // Mouth corner angle (for smile detection)
  const mouthCenter = {
    x: (landmarks[13].x + landmarks[14].x) / 2,
    y: (landmarks[13].y + landmarks[14].y) / 2,
  };
  const mouthCornerAngle = angle(landmarks[61], mouthCenter, landmarks[291]);
  
  // Lip compression ratio
  const upperLipThickness = distance(landmarks[0], landmarks[13]);
  const lowerLipThickness = distance(landmarks[14], landmarks[17]);
  const lipCompressionRatio = (upperLipThickness + lowerLipThickness) / mouthHeight;
  
  // Brow to eye distance
  const leftBrowToEye = distance(landmarks[107], landmarks[159]);
  const rightBrowToEye = distance(landmarks[336], landmarks[386]);
  const browToEyeDistance = (leftBrowToEye + rightBrowToEye) / 2;
  
  // Brow inner distance (for furrow)
  const browInnerDistance = distance(landmarks[107], landmarks[336]);
  
  // Nose wrinkle proxy (nose bridge compression)
  const noseWrinkleProxy = distance(landmarks[168], landmarks[6]) / distance(landmarks[1], landmarks[4]);
  
  // Symmetry score (mouth asymmetry for smirk detection)
  const leftMouthHeight = Math.abs(landmarks[61].y - mouthCenter.y);
  const rightMouthHeight = Math.abs(landmarks[291].y - mouthCenter.y);
  const symmetryScore = Math.min(leftMouthHeight, rightMouthHeight) / Math.max(leftMouthHeight, rightMouthHeight);
  
  // Head tilt
  const headTilt = Math.atan2(
    landmarks[454].y - landmarks[234].y,
    landmarks[454].x - landmarks[234].x
  ) * (180 / Math.PI);
  
  // Jaw openness
  const jawOpenness = distance(landmarks[13], landmarks[14]) / distance(landmarks[10], landmarks[152]);
  
  return {
    eyeAspectRatioLeft,
    eyeAspectRatioRight,
    mouthAspectRatio,
    mouthCornerAngle,
    lipCompressionRatio,
    browToEyeDistance,
    browInnerDistance,
    noseWrinkleProxy,
    symmetryScore,
    headTilt,
    mouthWidth,
    jawOpenness,
  };
}

export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number; z: number }>,
  mode: 'minimal' | 'full',
  primaryColor: string
) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  ctx.strokeStyle = primaryColor;
  ctx.fillStyle = primaryColor;
  ctx.lineWidth = 1;
  
  if (mode === 'minimal') {
    // Draw only eyes, mouth, and brows
    const keyPoints = [
      // Left eye
      [33, 133, 159, 145],
      // Right eye
      [263, 362, 386, 374],
      // Mouth
      [61, 291, 13, 14],
      // Left brow
      [70, 63, 105, 66, 107],
      // Right brow
      [300, 293, 334, 296, 336],
    ];
    
    keyPoints.forEach(pointSet => {
      ctx.beginPath();
      pointSet.forEach((idx, i) => {
        const x = landmarks[idx].x * width;
        const y = landmarks[idx].y * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    });
    
    // Draw key points
    [33, 133, 159, 145, 263, 362, 386, 374, 61, 291, 13, 14].forEach(idx => {
      const x = landmarks[idx].x * width;
      const y = landmarks[idx].y * height;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
  } else {
    // Full mesh
    landmarks.forEach((point, idx) => {
      const x = point.x * width;
      const y = point.y * height;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw connections for face oval
    const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
    ctx.beginPath();
    faceOval.forEach((idx, i) => {
      const x = landmarks[idx].x * width;
      const y = landmarks[idx].y * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
}

export { DrawingUtils };