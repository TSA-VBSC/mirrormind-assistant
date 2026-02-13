import { useState, useEffect, useCallback } from 'react';
import { useSettings, type Theme, type FontSize, type Verbosity, type Mode, type LandmarkOverlay, type EmotionSpeechInterval } from '@/contexts/SettingsContext';
import { getAvailableVoices, getAvailableLanguages, speakLabel } from '@/lib/speech';
import { Settings, Sun, Moon, Sparkles, Sunset, Eye, Volume2, VolumeX, Vibrate, Type, Contrast, Zap, MousePointer, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function HoverSpeakWrap({ label, enabled, voiceName, lang, children }: { label: string; enabled: boolean; voiceName?: string; lang?: string; children: React.ReactNode }) {
  const handleMouseEnter = useCallback(() => {
    if (enabled) speakLabel(label, voiceName, lang);
  }, [enabled, label, voiceName, lang]);
  
  return <div onMouseEnter={handleMouseEnter}>{children}</div>;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSetting } = useSettings();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(getAvailableVoices());
      setLanguages(getAvailableLanguages());
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  if (!isOpen) return null;

  const hs = settings.hoverSpeechEnabled;
  const vn = settings.selectedVoice || undefined;
  const ln = settings.selectedLanguage;

  const themes: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'neon', label: 'Neon Night', icon: Sparkles },
    { id: 'sunset', label: 'Warm Sunset', icon: Sunset },
    { id: 'colorblind', label: 'Colorblind', icon: Eye },
  ];

  const fontSizes: { id: FontSize; label: string }[] = [
    { id: 'normal', label: 'Normal' },
    { id: 'large', label: 'Large' },
    { id: 'xl', label: 'Extra Large' },
  ];

  const verbosityLevels: { id: Verbosity; label: string }[] = [
    { id: 'minimal', label: 'Minimal' },
    { id: 'normal', label: 'Normal' },
    { id: 'detailed', label: 'Detailed' },
  ];

  const overlayModes: { id: LandmarkOverlay; label: string }[] = [
    { id: 'off', label: 'Off' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'full', label: 'Full Mesh' },
  ];

  const emotionIntervals: { id: EmotionSpeechInterval; label: string }[] = [
    { id: 'off', label: 'Off' },
    { id: '10s', label: '10 sec' },
    { id: '30s', label: '30 sec' },
    { id: '1min', label: '1 min' },
    { id: '5min', label: '5 min' },
    { id: 'shift', label: 'On Shift' },
  ];

  const filteredVoices = voices.filter(v => v.lang.startsWith(settings.selectedLanguage));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl animate-scale-in">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme Selection */}
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Sun className="h-4 w-4" aria-hidden="true" />
              Color Theme
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {themes.map(theme => {
                const Icon = theme.icon;
                return (
                  <HoverSpeakWrap key={theme.id} label={`Theme: ${theme.label}`} enabled={hs} voiceName={vn} lang={ln}>
                    <button
                      onClick={() => updateSetting('theme', theme.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all w-full ${
                        settings.theme === theme.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      aria-pressed={settings.theme === theme.id}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span className="text-sm">{theme.label}</span>
                    </button>
                  </HoverSpeakWrap>
                );
              })}
            </div>
          </section>

          {/* Font Size */}
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Type className="h-4 w-4" aria-hidden="true" />
              Font Size
            </h3>
            <div className="flex gap-2">
              {fontSizes.map(size => (
                <HoverSpeakWrap key={size.id} label={`Font size: ${size.label}`} enabled={hs} voiceName={vn} lang={ln}>
                  <button
                    onClick={() => updateSetting('fontSize', size.id)}
                    className={`flex-1 p-2 rounded-lg border transition-all text-sm ${
                      settings.fontSize === size.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    aria-pressed={settings.fontSize === size.id}
                  >
                    {size.label}
                  </button>
                </HoverSpeakWrap>
              ))}
            </div>
          </section>

          {/* Accessibility Toggles */}
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Contrast className="h-4 w-4" aria-hidden="true" />
              Accessibility
            </h3>
            <div className="space-y-4">
              <HoverSpeakWrap label="Ultra Contrast toggle" enabled={hs} voiceName={vn} lang={ln}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="ultraContrast" className="flex items-center gap-2 cursor-pointer">
                    <Contrast className="h-4 w-4" aria-hidden="true" />
                    Ultra Contrast
                  </Label>
                  <Switch id="ultraContrast" checked={settings.ultraContrast} onCheckedChange={(checked) => updateSetting('ultraContrast', checked)} />
                </div>
              </HoverSpeakWrap>
              <HoverSpeakWrap label="Reduce Motion toggle" enabled={hs} voiceName={vn} lang={ln}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduceMotion" className="flex items-center gap-2 cursor-pointer">
                    <Zap className="h-4 w-4" aria-hidden="true" />
                    Reduce Motion
                  </Label>
                  <Switch id="reduceMotion" checked={settings.reduceMotion} onCheckedChange={(checked) => updateSetting('reduceMotion', checked)} />
                </div>
              </HoverSpeakWrap>
              <HoverSpeakWrap label="Hover to speak: reads labels aloud when you hover over controls" enabled={hs} voiceName={vn} lang={ln}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hoverSpeech" className="flex items-center gap-2 cursor-pointer">
                    <MousePointer className="h-4 w-4" aria-hidden="true" />
                    Hover-to-Speak
                  </Label>
                  <Switch id="hoverSpeech" checked={settings.hoverSpeechEnabled} onCheckedChange={(checked) => updateSetting('hoverSpeechEnabled', checked)} />
                </div>
              </HoverSpeakWrap>
            </div>
          </section>

          {/* Voice Settings */}
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              Voice Feedback
            </h3>
            <div className="space-y-4">
              <HoverSpeakWrap label="Voice announcements toggle" enabled={hs} voiceName={vn} lang={ln}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="voiceEnabled" className="flex items-center gap-2 cursor-pointer">
                    {settings.voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    Voice Announcements
                  </Label>
                  <Switch id="voiceEnabled" checked={settings.voiceEnabled} onCheckedChange={(checked) => updateSetting('voiceEnabled', checked)} />
                </div>
              </HoverSpeakWrap>
              
              <HoverSpeakWrap label="Speak expressions first, then emotion" enabled={hs} voiceName={vn} lang={ln}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="speakExpressionsFirst" className="cursor-pointer text-sm">
                    Speak expressions first
                  </Label>
                  <Switch id="speakExpressionsFirst" checked={settings.speakExpressionsFirst} onCheckedChange={(checked) => updateSetting('speakExpressionsFirst', checked)} />
                </div>
              </HoverSpeakWrap>

              {/* Language Selection */}
              <HoverSpeakWrap label="Language selection" enabled={hs} voiceName={vn} lang={ln}>
                <div>
                  <Label className="text-sm mb-2 block flex items-center gap-2">
                    <Globe className="h-4 w-4" aria-hidden="true" />
                    Language
                  </Label>
                  <select
                    value={settings.selectedLanguage}
                    onChange={(e) => {
                      updateSetting('selectedLanguage', e.target.value);
                      updateSetting('selectedVoice', ''); // Reset voice on language change
                    }}
                    className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm"
                    aria-label="Select language"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </HoverSpeakWrap>

              {/* Voice Selection */}
              <HoverSpeakWrap label="Voice selection" enabled={hs} voiceName={vn} lang={ln}>
                <div>
                  <Label className="text-sm mb-2 block">Voice</Label>
                  <select
                    value={settings.selectedVoice}
                    onChange={(e) => updateSetting('selectedVoice', e.target.value)}
                    className="w-full p-2 rounded-lg border border-border bg-card text-foreground text-sm"
                    aria-label="Select voice"
                  >
                    <option value="">Default</option>
                    {filteredVoices.map(voice => (
                      <option key={voice.name} value={voice.name}>{voice.name}</option>
                    ))}
                  </select>
                </div>
              </HoverSpeakWrap>

              {/* Emotion Speech Interval */}
              <HoverSpeakWrap label="How often the AI speaks about likely emotions" enabled={hs} voiceName={vn} lang={ln}>
                <div>
                  <Label className="text-sm mb-2 block">Emotion Speech Frequency</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {emotionIntervals.map(interval => (
                      <button
                        key={interval.id}
                        onClick={() => updateSetting('emotionSpeechInterval', interval.id)}
                        className={`p-2 rounded-lg border transition-all text-xs ${
                          settings.emotionSpeechInterval === interval.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        aria-pressed={settings.emotionSpeechInterval === interval.id}
                      >
                        {interval.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls how often emotion guesses are spoken aloud
                  </p>
                </div>
              </HoverSpeakWrap>

              <div>
                <Label className="text-sm mb-2 block">Verbosity</Label>
                <div className="flex gap-2">
                  {verbosityLevels.map(level => (
                    <HoverSpeakWrap key={level.id} label={`Verbosity: ${level.label}`} enabled={hs} voiceName={vn} lang={ln}>
                      <button
                        onClick={() => updateSetting('verbosity', level.id)}
                        className={`flex-1 p-2 rounded-lg border transition-all text-sm ${
                          settings.verbosity === level.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        aria-pressed={settings.verbosity === level.id}
                      >
                        {level.label}
                      </button>
                    </HoverSpeakWrap>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Haptics */}
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Vibrate className="h-4 w-4" aria-hidden="true" />
              Haptic Feedback
            </h3>
            <HoverSpeakWrap label="Vibration on state changes for mobile" enabled={hs} voiceName={vn} lang={ln}>
              <div className="flex items-center justify-between">
                <Label htmlFor="vibrationEnabled" className="flex items-center gap-2 cursor-pointer">
                  <Vibrate className="h-4 w-4" aria-hidden="true" />
                  Vibration on state changes (mobile)
                </Label>
                <Switch id="vibrationEnabled" checked={settings.vibrationEnabled} onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)} />
              </div>
            </HoverSpeakWrap>
          </section>

          {/* Detection Mode */}
          <section>
            <h3 className="text-sm font-medium mb-3">Detection Mode</h3>
            <div className="flex gap-2">
              <HoverSpeakWrap label="Conversation mode: more descriptive feedback" enabled={hs} voiceName={vn} lang={ln}>
                <button
                  onClick={() => updateSetting('mode', 'conversation')}
                  className={`flex-1 p-3 rounded-lg border transition-all ${
                    settings.mode === 'conversation'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  aria-pressed={settings.mode === 'conversation'}
                >
                  <p className="font-medium text-sm">Conversation</p>
                  <p className="text-xs text-muted-foreground mt-1">More descriptive</p>
                </button>
              </HoverSpeakWrap>
              <HoverSpeakWrap label="Sports mode: fast and minimal alerts" enabled={hs} voiceName={vn} lang={ln}>
                <button
                  onClick={() => updateSetting('mode', 'sports')}
                  className={`flex-1 p-3 rounded-lg border transition-all ${
                    settings.mode === 'sports'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  aria-pressed={settings.mode === 'sports'}
                >
                  <p className="font-medium text-sm">Sports</p>
                  <p className="text-xs text-muted-foreground mt-1">Fast & minimal</p>
                </button>
              </HoverSpeakWrap>
            </div>
          </section>

          {/* Landmark Overlay */}
          <section>
            <h3 className="text-sm font-medium mb-3">Landmark Overlay</h3>
            <div className="flex gap-2">
              {overlayModes.map(mode => (
                <HoverSpeakWrap key={mode.id} label={`Landmark overlay: ${mode.label}`} enabled={hs} voiceName={vn} lang={ln}>
                  <button
                    onClick={() => updateSetting('landmarkOverlay', mode.id)}
                    className={`flex-1 p-2 rounded-lg border transition-all text-sm ${
                      settings.landmarkOverlay === mode.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    aria-pressed={settings.landmarkOverlay === mode.id}
                  >
                    {mode.label}
                  </button>
                </HoverSpeakWrap>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
