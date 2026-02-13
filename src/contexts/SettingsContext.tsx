import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'neon' | 'sunset' | 'colorblind';
export type FontSize = 'normal' | 'large' | 'xl';
export type Verbosity = 'minimal' | 'normal' | 'detailed';
export type Mode = 'conversation' | 'sports';
export type LandmarkOverlay = 'off' | 'minimal' | 'full';
export type EmotionSpeechInterval = 'off' | '10s' | '30s' | '1min' | '5min' | 'shift';

interface Settings {
  theme: Theme;
  fontSize: FontSize;
  ultraContrast: boolean;
  reduceMotion: boolean;
  voiceEnabled: boolean;
  verbosity: Verbosity;
  mode: Mode;
  landmarkOverlay: LandmarkOverlay;
  speakExpressionsFirst: boolean;
  vibrationEnabled: boolean;
  emotionSpeechInterval: EmotionSpeechInterval;
  selectedVoice: string;
  selectedLanguage: string;
  hoverSpeechEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const defaultSettings: Settings = {
  theme: 'dark',
  fontSize: 'normal',
  ultraContrast: false,
  reduceMotion: false,
  voiceEnabled: true,
  verbosity: 'normal',
  mode: 'conversation',
  landmarkOverlay: 'minimal',
  speakExpressionsFirst: true,
  vibrationEnabled: true,
  emotionSpeechInterval: '30s',
  selectedVoice: '',
  selectedLanguage: 'en',
  hoverSpeechEnabled: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem('mirrormind-settings');
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('mirrormind-settings', JSON.stringify(settings));
    
    // Apply theme classes
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-neon', 'theme-sunset', 'theme-colorblind');
    if (settings.theme !== 'dark') {
      root.classList.add(`theme-${settings.theme}`);
    }
    
    // Apply font size
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-xl');
    root.classList.add(`font-size-${settings.fontSize}`);
    
    // Apply ultra contrast
    root.classList.toggle('ultra-contrast', settings.ultraContrast);
    
    // Apply reduce motion
    root.classList.toggle('reduce-motion', settings.reduceMotion);
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
