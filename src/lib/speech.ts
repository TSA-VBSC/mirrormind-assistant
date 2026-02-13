import type { Expression, Emotion, DetectionState } from './types';

let speechSynthesis: SpeechSynthesis | null = null;
let lastSpokenText = '';
let lastSpokenTime = 0;
const MIN_SPEAK_INTERVAL = 2000;

export function initSpeech(): boolean {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    speechSynthesis = window.speechSynthesis;
    return true;
  }
  return false;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!speechSynthesis) return [];
  return speechSynthesis.getVoices();
}

export function getAvailableLanguages(): { code: string; name: string }[] {
  const voices = getAvailableVoices();
  const langMap = new Map<string, string>();
  voices.forEach(v => {
    const code = v.lang.split('-')[0];
    if (!langMap.has(code)) {
      langMap.set(code, new Intl.DisplayNames([code], { type: 'language' }).of(code) || code);
    }
  });
  return Array.from(langMap.entries()).map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name));
}

export function speak(text: string, force = false, voiceName?: string, lang?: string): void {
  if (!speechSynthesis) return;
  
  const now = Date.now();
  
  if (!force && text === lastSpokenText && now - lastSpokenTime < MIN_SPEAK_INTERVAL * 2) {
    return;
  }
  
  if (!force && now - lastSpokenTime < MIN_SPEAK_INTERVAL) {
    return;
  }
  
  speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1;
  utterance.volume = 1;
  
  const voices = speechSynthesis.getVoices();
  
  if (voiceName) {
    const selectedVoice = voices.find(v => v.name === voiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  } else if (lang) {
    const langVoice = voices.find(v => v.lang.startsWith(lang));
    if (langVoice) utterance.voice = langVoice;
  } else {
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha'))
    ) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
  }
  
  speechSynthesis.speak(utterance);
  lastSpokenText = text;
  lastSpokenTime = now;
}

/** Speak a short label for hover-to-speak accessibility */
export function speakLabel(label: string, voiceName?: string, lang?: string): void {
  if (!speechSynthesis) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(label);
  utterance.rate = 1.1;
  utterance.pitch = 1;
  utterance.volume = 0.8;
  
  const voices = speechSynthesis.getVoices();
  if (voiceName) {
    const v = voices.find(v => v.name === voiceName);
    if (v) utterance.voice = v;
  } else if (lang) {
    const v = voices.find(v => v.lang.startsWith(lang));
    if (v) utterance.voice = v;
  }
  
  speechSynthesis.speak(utterance);
}

export function getEmotionSpeechIntervalMs(interval: string): number | null {
  switch (interval) {
    case 'off': return null;
    case '10s': return 10_000;
    case '30s': return 30_000;
    case '1min': return 60_000;
    case '5min': return 300_000;
    case 'shift': return -1; // special: only on significant shift
    default: return 30_000;
  }
}

export function generateSpeechText(
  expressions: Expression[],
  emotions: Emotion[],
  state: DetectionState,
  stateReason: string,
  verbosity: 'minimal' | 'normal' | 'detailed',
  speakExpressionsFirst: boolean,
  mode: 'conversation' | 'sports',
  includeEmotion: boolean = false
): string {
  if (state === 'low') {
    return verbosity === 'minimal' 
      ? 'Low visibility' 
      : 'It looks like visibility is low right now. Try adjusting the lighting or facing the camera more directly.';
  }
  
  const topExpressions = expressions.slice(0, 3);
  const topEmotion = emotions[0];
  
  if (mode === 'sports') {
    if (topExpressions.length === 0) return 'Neutral';
    const expName = topExpressions[0].name;
    const strength = topExpressions[0].strength > 70 ? 'High' : topExpressions[0].strength > 40 ? 'Medium' : 'Low';
    if (state === 'mixed') return 'Mixed signals';
    return `${expName}. ${strength}.`;
  }
  
  // Conversation mode - warm, supportive tone
  if (state === 'mixed') {
    if (verbosity === 'minimal') {
      return 'I\'m noticing some mixed signals';
    }
    return `I\'m picking up mixed signals: ${stateReason}. That\'s completely normal — expressions can be complex.`;
  }
  
  if (topExpressions.length === 0) {
    return verbosity === 'minimal' ? 'Neutral' : 'Things look calm and neutral right now — no strong signals to report.';
  }
  
  let text = '';
  
  if (speakExpressionsFirst) {
    if (verbosity === 'minimal') {
      text = topExpressions[0].name;
    } else if (verbosity === 'normal') {
      const expList = topExpressions.map(e => e.name.toLowerCase()).join(', ');
      text = `I\'m noticing ${expList}.`;
      if (includeEmotion) {
        text += ` This often goes with feeling ${topEmotion?.name?.toLowerCase() || 'neutral'}.`;
      }
    } else {
      const expDetails = topExpressions.map(e => `${e.name.toLowerCase()} at ${e.strength}%`).join(', ');
      text = `I can see ${expDetails}. ${topExpressions[0].evidence}. `;
      if (includeEmotion) {
        text += `This pattern often suggests ${topEmotion?.name?.toLowerCase() || 'neutral'} — about ${topEmotion?.confidence || 50}% likely.`;
      }
    }
  } else {
    if (!includeEmotion) {
      // If not including emotion, just describe expressions
      const expList = topExpressions.map(e => e.name.toLowerCase()).join(', ');
      text = verbosity === 'minimal' ? topExpressions[0].name : `I\'m noticing ${expList}.`;
    } else if (verbosity === 'minimal') {
      text = topEmotion?.name || 'Neutral';
    } else if (verbosity === 'normal') {
      text = `It looks like ${topEmotion?.name?.toLowerCase() || 'neutral'}. I\'m seeing ${topExpressions[0].name.toLowerCase()}.`;
    } else {
      text = `The overall feeling seems ${topEmotion?.name?.toLowerCase() || 'neutral'} — about ${topEmotion?.confidence || 50}% confident. `;
      text += `This is based on ${topExpressions.map(e => e.name.toLowerCase()).join(', ')}.`;
    }
  }
  
  return text;
}

export function stopSpeaking(): void {
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
}
