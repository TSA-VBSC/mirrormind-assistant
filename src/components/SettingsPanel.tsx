import { useSettings, type Theme, type FontSize, type Verbosity, type Mode, type LandmarkOverlay } from '@/contexts/SettingsContext';
import { Settings, Sun, Moon, Sparkles, Sunset, Eye, Volume2, VolumeX, Vibrate, Type, Contrast, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSetting } = useSettings();

  if (!isOpen) return null;

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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl animate-scale-in">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
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
                  <button
                    key={theme.id}
                    onClick={() => updateSetting('theme', theme.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                      settings.theme === theme.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    aria-pressed={settings.theme === theme.id}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm">{theme.label}</span>
                  </button>
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
                <button
                  key={size.id}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="ultraContrast" className="flex items-center gap-2 cursor-pointer">
                  <Contrast className="h-4 w-4" aria-hidden="true" />
                  Ultra Contrast
                </Label>
                <Switch
                  id="ultraContrast"
                  checked={settings.ultraContrast}
                  onCheckedChange={(checked) => updateSetting('ultraContrast', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reduceMotion" className="flex items-center gap-2 cursor-pointer">
                  <Zap className="h-4 w-4" aria-hidden="true" />
                  Reduce Motion
                </Label>
                <Switch
                  id="reduceMotion"
                  checked={settings.reduceMotion}
                  onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
                />
              </div>
            </div>
          </section>

          {/* Voice Settings */}
          <section>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              Voice Feedback
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="voiceEnabled" className="flex items-center gap-2 cursor-pointer">
                  {settings.voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  Voice Announcements
                </Label>
                <Switch
                  id="voiceEnabled"
                  checked={settings.voiceEnabled}
                  onCheckedChange={(checked) => updateSetting('voiceEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="speakExpressionsFirst" className="cursor-pointer text-sm">
                  Speak expressions first (then emotion)
                </Label>
                <Switch
                  id="speakExpressionsFirst"
                  checked={settings.speakExpressionsFirst}
                  onCheckedChange={(checked) => updateSetting('speakExpressionsFirst', checked)}
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Verbosity</Label>
                <div className="flex gap-2">
                  {verbosityLevels.map(level => (
                    <button
                      key={level.id}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="vibrationEnabled" className="flex items-center gap-2 cursor-pointer">
                <Vibrate className="h-4 w-4" aria-hidden="true" />
                Vibration on state changes (mobile)
              </Label>
              <Switch
                id="vibrationEnabled"
                checked={settings.vibrationEnabled}
                onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)}
              />
            </div>
          </section>

          {/* Detection Mode */}
          <section>
            <h3 className="text-sm font-medium mb-3">Detection Mode</h3>
            <div className="flex gap-2">
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
            </div>
          </section>

          {/* Landmark Overlay */}
          <section>
            <h3 className="text-sm font-medium mb-3">Landmark Overlay</h3>
            <div className="flex gap-2">
              {overlayModes.map(mode => (
                <button
                  key={mode.id}
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
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}