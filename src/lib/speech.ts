import type { Expression, Emotion, DetectionState } from './types';

let speechSynthesis: SpeechSynthesis | null = null;
let lastSpokenText = '';
let lastSpokenTime = 0;
const MIN_SPEAK_INTERVAL = 2000; // Minimum ms between announcements

export function initSpeech(): boolean {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    speechSynthesis = window.speechSynthesis;
    return true;
  }
  return false;
}

export function speak(text: string, force = false): void {
  if (!speechSynthesis) return;
  
  const now = Date.now();
  
  // Don't repeat the same thing too quickly
  if (!force && text === lastSpokenText && now - lastSpokenTime < MIN_SPEAK_INTERVAL * 2) {
    return;
  }
  
  // Rate limit
  if (!force && now - lastSpokenTime < MIN_SPEAK_INTERVAL) {
    return;
  }
  
  // Cancel any ongoing speech
  speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.1;
  utterance.pitch = 1;
  utterance.volume = 1;
  
  // Try to use a good voice
  const voices = speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha'))
  ) || voices.find(v => v.lang.startsWith('en'));
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  
  speechSynthesis.speak(utterance);
  lastSpokenText = text;
  lastSpokenTime = now;
}

export function generateSpeechText(
  expressions: Expression[],
  emotions: Emotion[],
  state: DetectionState,
  stateReason: string,
  verbosity: 'minimal' | 'normal' | 'detailed',
  speakExpressionsFirst: boolean,
  mode: 'conversation' | 'sports'
): string {
  if (state === 'low') {
    return verbosity === 'minimal' 
      ? 'Low visibility' 
      : 'Low visibility. Try more light or face the camera directly.';
  }
  
  const topExpressions = expressions.slice(0, 3);
  const topEmotion = emotions[0];
  
  if (mode === 'sports') {
    // Fast, minimal output
    if (topExpressions.length === 0) return 'Neutral';
    
    const expName = topExpressions[0].name;
    const strength = topExpressions[0].strength > 70 ? 'High' : topExpressions[0].strength > 40 ? 'Medium' : 'Low';
    
    if (state === 'mixed') {
      return 'Mixed signals';
    }
    
    return `${expName}. ${strength}.`;
  }
  
  // Conversation mode - more descriptive
  if (state === 'mixed') {
    if (verbosity === 'minimal') {
      return 'Mixed signals detected';
    }
    return `Mixed signals: ${stateReason}`;
  }
  
  if (topExpressions.length === 0) {
    return verbosity === 'minimal' ? 'Neutral' : 'Expression neutral, no strong signals detected';
  }
  
  let text = '';
  
  if (speakExpressionsFirst) {
    // Expressions first
    if (verbosity === 'minimal') {
      text = topExpressions[0].name;
    } else if (verbosity === 'normal') {
      const expList = topExpressions.map(e => e.name.toLowerCase()).join(', ');
      text = `Expression: ${expList}. Likely ${topEmotion?.name?.toLowerCase() || 'neutral'}.`;
    } else {
      // Detailed
      const expDetails = topExpressions.map(e => `${e.name.toLowerCase()} at ${e.strength}%`).join(', ');
      text = `Detecting ${expDetails}. ${topExpressions[0].evidence}. `;
      text += `This pattern suggests ${topEmotion?.name?.toLowerCase() || 'neutral'} with ${topEmotion?.confidence || 50}% confidence.`;
    }
  } else {
    // Emotions first
    if (verbosity === 'minimal') {
      text = topEmotion?.name || 'Neutral';
    } else if (verbosity === 'normal') {
      text = `Likely ${topEmotion?.name?.toLowerCase() || 'neutral'}. Seeing ${topExpressions[0].name.toLowerCase()}.`;
    } else {
      text = `Emotion appears ${topEmotion?.name?.toLowerCase() || 'neutral'} at ${topEmotion?.confidence || 50}% confidence. `;
      text += `Based on ${topExpressions.map(e => e.name.toLowerCase()).join(', ')}.`;
    }
  }
  
  return text;
}

export function stopSpeaking(): void {
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
}