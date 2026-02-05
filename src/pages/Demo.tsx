import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CameraFeed } from '@/components/CameraFeed';
import { ExpressionStack } from '@/components/ExpressionStack';
import { EmotionGuess } from '@/components/EmotionGuess';
import { StateBanner, WhyPanel } from '@/components/StateBanner';
import { Timeline } from '@/components/Timeline';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useSettings } from '@/contexts/SettingsContext';
import { exportSession } from '@/lib/storage';
import type { DetectionResult, TimelineEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Play, 
  Pause, 
  Download,
  Volume2,
  VolumeX,
  Shield,
  Cpu,
  Gauge,
  BookOpen
} from 'lucide-react';

export default function Demo() {
  const { settings, updateSetting } = useSettings();
  const [isActive, setIsActive] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [whyPanelOpen, setWhyPanelOpen] = useState(false);
  const [coachMode, setCoachMode] = useState(false);
  
  const [detectionResult, setDetectionResult] = useState<DetectionResult>({
    expressions: [],
    emotions: [{ name: 'Neutral', confidence: 50 }],
    state: 'clear',
    stateReason: 'Waiting for camera...',
    timestamp: Date.now(),
    qualityScore: 0,
  });
  
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [fps, setFps] = useState(0);
  const [latency, setLatency] = useState(0);

  const handleDetectionResult = useCallback((result: DetectionResult) => {
    setDetectionResult(result);
  }, []);

  const handleTimelineUpdate = useCallback((entries: TimelineEntry[]) => {
    setTimeline(entries);
  }, []);

  const handleFpsUpdate = useCallback((newFps: number, newLatency: number) => {
    setFps(newFps);
    setLatency(Math.round(newLatency));
  }, []);

  const handleExport = () => {
    const data = exportSession();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirrormind-session-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectTimeline = (entry: TimelineEntry) => {
    // Could show a snapshot panel here
    console.log('Selected timeline entry:', entry);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <Header />
      
      <main id="main-content" className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-6">
          {/* Top Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsActive(!isActive)}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                aria-label={isActive ? 'Pause detection' : 'Resume detection'}
              >
                {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isActive ? 'Pause' : 'Resume'}
              </Button>
              
              <Button
                onClick={() => updateSetting('voiceEnabled', !settings.voiceEnabled)}
                variant="outline"
                size="sm"
                aria-label={settings.voiceEnabled ? 'Mute voice' : 'Enable voice'}
              >
                {settings.voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={() => updateSetting('mode', settings.mode === 'conversation' ? 'sports' : 'conversation')}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                {settings.mode === 'conversation' ? 'Conversation' : 'Sports'} Mode
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setCoachMode(!coachMode)}
                variant={coachMode ? 'default' : 'outline'}
                size="sm"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Coach
              </Button>
              
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button
                onClick={() => setSettingsOpen(true)}
                variant="outline"
                size="sm"
                aria-label="Open settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Video Feed */}
            <div className="lg:col-span-3 space-y-4">
              <CameraFeed
                isActive={isActive}
                onDetectionResult={handleDetectionResult}
                onTimelineUpdate={handleTimelineUpdate}
                onFpsUpdate={handleFpsUpdate}
              />
              
              {/* Stats Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gauge className="h-4 w-4" aria-hidden="true" />
                    <span>{fps} FPS</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Cpu className="h-4 w-4" aria-hidden="true" />
                    <span>{latency}ms</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-success">
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  <span>On-device only</span>
                </div>
              </div>

              {/* Coach Mode Overlay */}
              {coachMode && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 animate-scale-in">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Expression Guide
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-card">
                      <p className="font-medium">Smile vs Smirk</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Smile: Both mouth corners lift symmetrically. 
                        Smirk: One corner lifts higher (asymmetrical).
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-card">
                      <p className="font-medium">Raised Brows</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Often indicates surprise, interest, or questioning. 
                        Combined with wide eyes = strong surprise.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-card">
                      <p className="font-medium">Squint</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Narrowed eyes can mean skepticism, deep thought, 
                        or happiness (smiling eyes).
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-card">
                      <p className="font-medium">Brow Furrow</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Eyebrows drawn together suggests confusion, 
                        concentration, or frustration.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Output Panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* State Banner */}
              <div className="flex items-center justify-between">
                <StateBanner 
                  state={detectionResult.state} 
                  reason={detectionResult.stateReason}
                  showReason={true}
                />
                {detectionResult.state !== 'clear' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setWhyPanelOpen(!whyPanelOpen)}
                  >
                    Why?
                  </Button>
                )}
              </div>
              
              {whyPanelOpen && detectionResult.stateReason && (
                <WhyPanel
                  reason={detectionResult.stateReason}
                  isOpen={whyPanelOpen}
                  onClose={() => setWhyPanelOpen(false)}
                />
              )}

              {/* Expression Stack */}
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                  Expressions Detected
                </h2>
                <ExpressionStack expressions={detectionResult.expressions} />
              </div>

              {/* Emotion Guess */}
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  Emotion Analysis
                </h2>
                <EmotionGuess emotions={detectionResult.emotions} />
              </div>

              {/* Timeline */}
              <div className="pt-4 border-t border-border">
                <Timeline 
                  entries={timeline} 
                  onSelectEntry={handleSelectTimeline}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Settings Modal */}
      <SettingsPanel 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  );
}