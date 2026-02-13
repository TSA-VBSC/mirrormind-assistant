import { useRef, useEffect, useState, useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { initializeFaceLandmarker, getFaceLandmarker, extractFeatures, drawLandmarks } from '@/lib/mediapipe';
import { scoreExpressions, detectConflicts } from '@/lib/expressions';
import { mapExpressionsToEmotions } from '@/lib/emotions';
import { smoothDetection, resetSmoothing } from '@/lib/smoothing';
import { assessQuality } from '@/lib/quality';
import { speak, generateSpeechText, initSpeech, stopSpeaking, getEmotionSpeechIntervalMs } from '@/lib/speech';
import { addToTimeline, startSession, endSession, getTimeline } from '@/lib/storage';
import type { DetectionResult, TimelineEntry } from '@/lib/types';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraFeedProps {
  isActive: boolean;
  onDetectionResult: (result: DetectionResult) => void;
  onTimelineUpdate: (entries: TimelineEntry[]) => void;
  onFpsUpdate: (fps: number, latency: number) => void;
}

export function CameraFeed({ isActive, onDetectionResult, onTimelineUpdate, onFpsUpdate }: CameraFeedProps) {
  const { settings } = useSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const animationRef = useRef<number>();
  const lastFrameTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastFpsUpdate = useRef<number>(0);
  const lastSpeakTime = useRef<number>(0);
  const lastEmotionSpeakTime = useRef<number>(0);
  const lastDetectionState = useRef<string>('');
  const lastEmotionState = useRef<string>('');
  const lastUIUpdateTime = useRef<number>(0);
  const latestResult = useRef<any>(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Initialize MediaPipe
      await initializeFaceLandmarker();
      initSpeech();
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        startSession();
        resetSmoothing();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start camera');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCameraActive(false);
    stopSpeaking();
    endSession();
  }, []);

  // Detection loop
  useEffect(() => {
    if (!cameraActive || !isActive) return;

    const faceLandmarker = getFaceLandmarker();
    if (!faceLandmarker) return;

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      
      if (!video || !canvas || !overlayCanvas || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const now = performance.now();
      
      // Throttle to ~15 FPS
      if (now - lastFrameTime.current < 66) {
        animationRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const startTime = performance.now();
      
      // Set canvas sizes
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      overlayCanvas.width = video.videoWidth;
      overlayCanvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      const overlayCtx = overlayCanvas.getContext('2d');
      
      if (!ctx || !overlayCtx) {
        animationRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // Draw video to hidden canvas
      ctx.drawImage(video, 0, 0);

      // Run face detection
      const results = faceLandmarker.detectForVideo(video, now);
      
      // Clear overlay
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      let detectionResult: DetectionResult;

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const blendshapes = results.faceBlendshapes;
        
        // Draw landmarks if enabled
        if (settings.landmarkOverlay !== 'off') {
          const primaryColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary')
            .trim();
          drawLandmarks(
            overlayCtx, 
            landmarks, 
            settings.landmarkOverlay as 'minimal' | 'full',
            `hsl(${primaryColor})`
          );
        }

        // Extract features
        const features = extractFeatures(landmarks);
        
        // Score expressions
        const rawExpressions = scoreExpressions(features, blendshapes);
        
        // Map to emotions
        const rawEmotions = mapExpressionsToEmotions(
          rawExpressions.map(e => ({ name: e.name, strength: e.strength, evidence: e.evidence }))
        );

        // Assess quality
        const quality = assessQuality(landmarks, canvas.width, canvas.height);
        
        // Check for conflicting expressions
        const conflicts = detectConflicts(rawExpressions);
        
        // Determine state
        let state = quality.state;
        let stateReason = quality.reason;
        
        if (state === 'clear' && conflicts.isConflicting) {
          state = 'mixed';
          stateReason = conflicts.reason;
        }

        // Apply smoothing
        detectionResult = smoothDetection(
          rawExpressions.map(e => ({ name: e.name, strength: e.strength, evidence: e.evidence })),
          rawEmotions,
          state,
          stateReason,
          quality.score
        );
      } else {
        // No face detected
        detectionResult = smoothDetection([], [], 'low', 'No face detected', 0);
      }

      // Update timeline
      const timelineEntry = addToTimeline(detectionResult);
      if (timelineEntry) {
        onTimelineUpdate(getTimeline());
      }

      // Voice feedback — only speaks emotion label, controlled by interval
      if (settings.voiceEnabled) {
        const emotionInterval = getEmotionSpeechIntervalMs(settings.emotionSpeechInterval);
        const currentEmotion = detectionResult.emotions[0]?.name || 'Neutral';

        let shouldSpeak = false;

        if (emotionInterval === null) {
          // "Off" — never speak emotions automatically
          shouldSpeak = false;
        } else if (emotionInterval === -1) {
          // "On significant shift" — only when emotion label changes
          if (currentEmotion !== lastEmotionState.current) {
            shouldSpeak = true;
          }
        } else {
          // Timed interval
          if (now - lastEmotionSpeakTime.current > emotionInterval) {
            shouldSpeak = true;
          }
        }

        // Also announce state changes (low visibility, mixed) independently
        const currentState = detectionResult.state;
        if (currentState !== 'clear' && currentState !== lastDetectionState.current && now - lastSpeakTime.current > 3000) {
          const stateText = currentState === 'low' ? 'Low visibility' : 'Mixed signals';
          speak(stateText, false, settings.selectedVoice || undefined, settings.selectedLanguage);
          lastSpeakTime.current = now;
          lastDetectionState.current = currentState;
        } else if (shouldSpeak) {
          const speechText = generateSpeechText(
            detectionResult.expressions,
            detectionResult.emotions,
            detectionResult.state,
            detectionResult.stateReason || '',
            settings.verbosity,
            settings.speakExpressionsFirst,
            settings.mode,
            true // includeEmotion — this just speaks the label
          );

          speak(speechText, false, settings.selectedVoice || undefined, settings.selectedLanguage);
          lastSpeakTime.current = now;
          lastEmotionSpeakTime.current = now;
          lastEmotionState.current = currentEmotion;
          lastDetectionState.current = currentState;
        }

        // Haptic feedback on emotion change
        if (settings.vibrationEnabled && 'vibrate' in navigator && currentEmotion !== lastEmotionState.current) {
          if (detectionResult.state === 'mixed') {
            navigator.vibrate([100, 50, 100]);
          } else {
            navigator.vibrate(50);
          }
          lastEmotionState.current = currentEmotion;
        }
      }

      // Throttle UI updates to every 2.5s for calm, stable display
      latestResult.current = detectionResult;
      if (now - lastUIUpdateTime.current > 2500) {
        onDetectionResult(detectionResult);
        lastUIUpdateTime.current = now;
      }

      // FPS calculation
      frameCount.current++;
      if (now - lastFpsUpdate.current >= 1000) {
        const fps = frameCount.current;
        const latency = performance.now() - startTime;
        onFpsUpdate(fps, latency);
        frameCount.current = 0;
        lastFpsUpdate.current = now;
      }

      lastFrameTime.current = now;
      animationRef.current = requestAnimationFrame(processFrame);
    };

    animationRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cameraActive, isActive, settings, onDetectionResult, onTimelineUpdate, onFpsUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="relative w-full aspect-video">
      <div className="video-container w-full h-full">
        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          aria-label="Camera feed"
        />
        
        {/* Overlay canvas for landmarks */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        />

        {/* Scanning effect */}
        {cameraActive && isActive && (
          <div className="scan-line" aria-hidden="true" />
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Initializing camera...</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center p-4">
              <CameraOff className="h-10 w-10 text-destructive mx-auto mb-3" />
              <p className="text-sm text-destructive mb-3">{error}</p>
              <Button onClick={startCamera} size="sm">
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Camera controls */}
        {!cameraActive && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Button
              onClick={startCamera}
              size="lg"
              className="glow-primary"
            >
              <Camera className="h-5 w-5 mr-2" />
              Start Camera
            </Button>
          </div>
        )}
      </div>

      {/* Camera toggle when active */}
      {cameraActive && (
        <Button
          onClick={stopCamera}
          variant="destructive"
          size="sm"
          className="absolute top-3 right-3 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Stop camera"
        >
          <CameraOff className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}