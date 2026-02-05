import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Eye,
  Shield,
  Accessibility,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Code,
  Layers,
  Activity,
  Lock
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <Header />
      
      <main id="main-content" className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Brain className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">TSA Competition Entry</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About MirrorMind
            </h1>
            <p className="text-xl text-muted-foreground">
              Understanding the technology behind expression-first emotion guidance
            </p>
          </div>

          {/* Problem Statement */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold">The Problem</h2>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-lg mb-4">
                For visually impaired individuals and those who struggle to read facial 
                expressions (including people with autism spectrum conditions), social 
                interactions can be challenging.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Difficulty perceiving subtle facial cues in conversation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Missing important emotional context from facial expressions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Existing solutions often guess emotions without explaining why</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Solution */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold">Our Solution</h2>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-lg mb-6">
                MirrorMind takes an <strong>expression-first approach</strong>. Instead of 
                just guessing emotions, it tells you exactly what facial signals it detects, 
                then suggests what those signals typically mean.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="font-medium mb-2">Traditional Approach</p>
                  <p className="text-muted-foreground text-sm">
                    "Person is happy (75%)" — but why? No explanation.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="font-medium mb-2 text-primary">MirrorMind Approach</p>
                  <p className="text-sm">
                    "Smile detected (82%), squinted eyes (54%) → Likely happy"
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Code className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold">Technology Stack</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { 
                  name: 'MediaPipe Face Landmarker', 
                  desc: '468-point facial landmark detection with blendshapes',
                  icon: Eye
                },
                { 
                  name: 'React + TypeScript', 
                  desc: 'Modern, type-safe frontend framework',
                  icon: Code
                },
                { 
                  name: 'Web Speech API', 
                  desc: 'Native browser text-to-speech for accessibility',
                  icon: Activity
                },
                { 
                  name: 'Tailwind CSS', 
                  desc: 'Utility-first styling with custom design system',
                  icon: Layers
                },
              ].map((tech) => (
                <div key={tech.name} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <tech.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="font-medium">{tech.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{tech.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Processing Pipeline */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold">Detection Pipeline</h2>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="space-y-6">
                {[
                  {
                    step: 'A',
                    title: 'Face Landmarks',
                    desc: 'MediaPipe extracts 468 facial landmarks and 52 blendshape values at ~15 FPS',
                  },
                  {
                    step: 'B',
                    title: 'Feature Extraction',
                    desc: 'Calculate normalized ratios: eye aspect ratio, mouth curvature, brow distance, symmetry metrics',
                  },
                  {
                    step: 'C',
                    title: 'Expression Scoring',
                    desc: 'Score 12+ expressions (smile, smirk, frown, raised brows, etc.) using blendshapes and geometric features',
                  },
                  {
                    step: 'D',
                    title: 'Emotion Mapping',
                    desc: 'Map expression combinations to emotions using weighted rules (smile + squint → happy)',
                  },
                  {
                    step: 'E',
                    title: 'Smoothing',
                    desc: 'Apply exponential moving average (EMA) to reduce jitter and stability locking for consistent output',
                  },
                  {
                    step: 'F',
                    title: 'Quality Assessment',
                    desc: 'Detect low visibility (poor lighting, face off-center) and mixed signals (conflicting expressions)',
                  },
                ].map((item, idx) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Accessibility */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-success/10">
                <Accessibility className="h-5 w-5 text-success" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold">Accessibility Features</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'Voice announcements with adjustable verbosity',
                'Colorblind-safe themes with pattern indicators',
                'Full keyboard navigation support',
                'Screen reader ARIA labels throughout',
                'Font size options (Normal / Large / XL)',
                'Ultra contrast mode for low vision',
                'Reduce motion option',
                'Mobile haptic feedback (vibration)',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold">Privacy & Security</h2>
            </div>
            <div className="bg-success/5 border border-success/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-success" aria-hidden="true" />
                <div>
                  <p className="font-bold text-lg">100% On-Device Processing</p>
                  <p className="text-muted-foreground">Your camera feed never leaves your browser</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" aria-hidden="true" />
                  <span>No images or video uploaded to any server</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" aria-hidden="true" />
                  <span>No biometric data stored or transmitted</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" aria-hidden="true" />
                  <span>Session exports contain only aggregated statistics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" aria-hidden="true" />
                  <span>Works offline after initial model download</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Limitations */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold">Limitations</h2>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-muted-foreground mb-4">
                MirrorMind is a demonstration and educational tool. It has limitations:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-1">•</span>
                  <span>Facial expressions don't always match internal emotions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-1">•</span>
                  <span>Cultural differences affect expression interpretation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-1">•</span>
                  <span>Performance depends on lighting and camera quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-1">•</span>
                  <span>Single-face detection only; doesn't track multiple people</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-1">•</span>
                  <span>Should not be used as a diagnostic or medical tool</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Try It Yourself</h2>
            <p className="text-muted-foreground mb-6">
              Experience expression-first emotion guidance in real-time.
            </p>
            <Link to="/demo">
              <Button size="lg" className="glow-primary">
                Launch Demo
                <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
              </Button>
            </Link>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}