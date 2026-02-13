import type { Expression, Emotion, DetectionState } from './types';

let speechSynthesis: SpeechSynthesis | null = null;
let lastSpokenText = '';
let lastSpokenTime = 0;
const MIN_SPEAK_INTERVAL = 2000;
let hoverSpeakTimeout: ReturnType<typeof setTimeout> | null = null;

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
      try {
        langMap.set(code, new Intl.DisplayNames([code], { type: 'language' }).of(code) || code);
      } catch {
        langMap.set(code, code);
      }
    }
  });
  return Array.from(langMap.entries()).map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name));
}

function pickVoice(voiceName?: string, lang?: string): SpeechSynthesisVoice | null {
  if (!speechSynthesis) return null;
  const voices = speechSynthesis.getVoices();
  if (voiceName) {
    const v = voices.find(v => v.name === voiceName);
    if (v) return v;
  }
  if (lang) {
    const v = voices.find(v => v.lang.startsWith(lang));
    if (v) return v;
  }
  return voices.find(v =>
    v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha'))
  ) || voices.find(v => v.lang.startsWith('en')) || null;
}

export function speak(text: string, force = false, voiceName?: string, lang?: string): void {
  if (!speechSynthesis) return;

  const now = Date.now();
  if (!force && text === lastSpokenText && now - lastSpokenTime < MIN_SPEAK_INTERVAL * 2) return;
  if (!force && now - lastSpokenTime < MIN_SPEAK_INTERVAL) return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voice = pickVoice(voiceName, lang);
  if (voice) utterance.voice = voice;

  speechSynthesis.speak(utterance);
  lastSpokenText = text;
  lastSpokenTime = now;
}

/** Speak a short label for hover-to-speak accessibility (with debounce) */
export function speakLabel(label: string, voiceName?: string, lang?: string): void {
  if (!speechSynthesis) return;

  // Debounce: cancel previous pending hover speech
  if (hoverSpeakTimeout) {
    clearTimeout(hoverSpeakTimeout);
  }

  hoverSpeakTimeout = setTimeout(() => {
    if (!speechSynthesis) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(label);
    utterance.rate = 1.1;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    const voice = pickVoice(voiceName, lang);
    if (voice) utterance.voice = voice;

    speechSynthesis.speak(utterance);
    hoverSpeakTimeout = null;
  }, 350); // 350ms delay to prevent rapid spam
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

/**
 * Generate speech text.
 * By default (minimal/normal without detailed), only speaks the primary emotion label.
 * Detailed mode adds expression context.
 */
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
  // Low visibility — always announce
  if (state === 'low') {
    return verbosity === 'detailed'
      ? 'Low visibility right now. Try adjusting the lighting or facing the camera more directly.'
      : 'Low visibility';
  }

  const topEmotion = emotions[0];
  const emotionLabel = topEmotion?.name || 'Neutral';

  // Sports mode — ultra terse
  if (mode === 'sports') {
    if (state === 'mixed') return 'Mixed signals';
    return emotionLabel;
  }

  // Mixed signals
  if (state === 'mixed') {
    if (verbosity === 'detailed') {
      return `Mixed signals. ${stateReason}`;
    }
    return 'Mixed signals';
  }

  // No expressions detected
  if (expressions.length === 0) {
    return 'Neutral';
  }

  // ---------- Normal conversation output ----------

  // If we should include emotion (based on interval timer)
  if (includeEmotion) {
    if (verbosity === 'detailed') {
      // Detailed: emotion + top expressions
      const expList = expressions.slice(0, 3).map(e => e.name.toLowerCase()).join(', ');
      return `${emotionLabel}. Based on ${expList}.`;
    }
    // Minimal & normal: just the emotion label word
    return emotionLabel;
  }

  // When NOT including emotion, speak top expression only (if speakExpressionsFirst)
  if (speakExpressionsFirst && verbosity === 'detailed') {
    const expList = expressions.slice(0, 2).map(e => e.name.toLowerCase()).join(' and ');
    return `Noticing ${expList}.`;
  }

  // Default: just emotion label
  return emotionLabel;
}

export function stopSpeaking(): void {
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
  if (hoverSpeakTimeout) {
    clearTimeout(hoverSpeakTimeout);
    hoverSpeakTimeout = null;
  }
}
