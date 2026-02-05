import type { TimelineEntry, SessionSummary, DetectionResult } from './types';

const MAX_TIMELINE_ENTRIES = 120; // ~60 seconds at 2 entries/sec
const SESSION_KEY = 'mirrormind-session';

interface SessionData {
  startTime: number;
  timeline: TimelineEntry[];
  expressionCounts: Record<string, number>;
  stateCounts: { clear: number; mixed: number; low: number };
  totalConfidence: number;
  frameCount: number;
}

let currentSession: SessionData | null = null;

export function startSession(): void {
  currentSession = {
    startTime: Date.now(),
    timeline: [],
    expressionCounts: {},
    stateCounts: { clear: 0, mixed: 0, low: 0 },
    totalConfidence: 0,
    frameCount: 0,
  };
}

export function addToTimeline(result: DetectionResult): TimelineEntry | null {
  if (!currentSession) return null;
  
  currentSession.frameCount++;
  currentSession.stateCounts[result.state]++;
  
  if (result.emotions.length > 0) {
    currentSession.totalConfidence += result.emotions[0].confidence;
  }
  
  // Count expressions
  result.expressions.forEach(exp => {
    currentSession!.expressionCounts[exp.name] = 
      (currentSession!.expressionCounts[exp.name] || 0) + 1;
  });
  
  // Only add to timeline if we have meaningful data
  if (result.expressions.length === 0 && result.state === 'clear') {
    return null;
  }
  
  const entry: TimelineEntry = {
    id: `${result.timestamp}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: result.timestamp,
    topExpression: result.expressions[0] || { name: 'Neutral', strength: 50, evidence: '' },
    topEmotion: result.emotions[0] || { name: 'Neutral', confidence: 50 },
    state: result.state,
  };
  
  currentSession.timeline.push(entry);
  
  // Keep timeline bounded
  if (currentSession.timeline.length > MAX_TIMELINE_ENTRIES) {
    currentSession.timeline.shift();
  }
  
  return entry;
}

export function getTimeline(): TimelineEntry[] {
  return currentSession?.timeline || [];
}

export function getSessionSummary(): SessionSummary | null {
  if (!currentSession || currentSession.frameCount === 0) return null;
  
  const duration = (Date.now() - currentSession.startTime) / 1000;
  const total = currentSession.stateCounts.clear + 
                currentSession.stateCounts.mixed + 
                currentSession.stateCounts.low;
  
  return {
    duration,
    expressionCounts: { ...currentSession.expressionCounts },
    clearPercentage: Math.round((currentSession.stateCounts.clear / total) * 100),
    mixedPercentage: Math.round((currentSession.stateCounts.mixed / total) * 100),
    lowVisibilityPercentage: Math.round((currentSession.stateCounts.low / total) * 100),
    averageConfidence: Math.round(currentSession.totalConfidence / currentSession.frameCount),
    totalFrames: currentSession.frameCount,
  };
}

export function exportSession(): string {
  const summary = getSessionSummary();
  if (!summary) return JSON.stringify({ error: 'No session data' });
  
  const report = {
    title: 'MirrorMind Session Summary',
    generatedAt: new Date().toISOString(),
    note: 'No images or biometric data stored - aggregated statistics only',
    summary: {
      durationSeconds: Math.round(summary.duration),
      durationFormatted: formatDuration(summary.duration),
      totalFramesAnalyzed: summary.totalFrames,
    },
    visibility: {
      clearPercentage: summary.clearPercentage,
      mixedSignalsPercentage: summary.mixedPercentage,
      lowVisibilityPercentage: summary.lowVisibilityPercentage,
    },
    expressionsDetected: Object.entries(summary.expressionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        expression: name,
        occurrences: count,
        percentage: Math.round((count / summary.totalFrames) * 100),
      })),
    averageEmotionConfidence: summary.averageConfidence,
  };
  
  return JSON.stringify(report, null, 2);
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

export function endSession(): void {
  currentSession = null;
}