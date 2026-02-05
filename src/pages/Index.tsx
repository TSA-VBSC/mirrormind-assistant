import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Eye, 
  Shield, 
  Volume2, 
  Accessibility, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Smile,
  Frown,
  Meh,
  AlertTriangle
} from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Eye,
      title: 'Expression Detection',
      description: 'Real-time detection of 12+ facial expressions including smiles, smirks, frowns, raised brows, and more.',
    },
    {
      icon: Accessibility,
      title: 'Accessibility-First',
      description: 'Voice feedback, keyboard navigation, colorblind-safe themes, and screen reader support built-in.',
    },
    {
      icon: Shield,
      title: 'Complete Privacy',
      description: 'All processing happens on your device. No images or biometric data ever leave your browser.',
    },
  ];

  const expressionTypes = [
    { icon: Smile, name: 'Smile', color: 'text-success' },
    { icon: Frown, name: 'Frown', color: 'text-warning' },
    { icon: Meh, name: 'Neutral', color: 'text-muted-foreground' },
    { icon: AlertTriangle, name: 'Mixed', color: 'text-expression-medium' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <Header />
      
      <main id="main-content" className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="hero-gradient absolute inset-0 pointer-events-none" aria-hidden="true" />
          
          <div className="container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-medium">TSA Competition Project</span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
                <span className="text-glow">MirrorMind</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-primary mb-4 animate-slide-up">
                Expression-First Emotion Guidance
              </p>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up">
                A real-time, accessible assistant that reads facial expressions and helps 
                visually-impaired users understand the emotions of people around them.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
                <Link to="/demo">
                  <Button size="lg" className="glow-primary text-lg px-8 py-6">
                    <Brain className="h-5 w-5 mr-2" aria-hidden="true" />
                    Try Live Demo
                    <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    Learn How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Animated Expression Icons */}
          <div className="container mx-auto px-4 pb-10">
            <div className="flex justify-center gap-6 md:gap-12">
              {expressionTypes.map((exp, idx) => (
                <div 
                  key={exp.name}
                  className="flex flex-col items-center gap-2 animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`p-4 rounded-full bg-card border border-border ${
                    idx === 0 ? 'pulse-ring' : ''
                  }`}>
                    <exp.icon className={`h-8 w-8 ${exp.color}`} aria-hidden="true" />
                  </div>
                  <span className="text-sm text-muted-foreground">{exp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How MirrorMind Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Using advanced facial landmark detection, MirrorMind identifies specific 
                expressions first, then suggests likely emotions—always with transparency.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature, idx) => (
                <div 
                  key={feature.title}
                  className="feature-card"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Expression-First Explanation */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">
                    Expressions First, <br />
                    <span className="text-primary">Emotions Second</span>
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Unlike typical emotion detection that guesses feelings, MirrorMind 
                    tells you exactly what it sees—raised eyebrows, lifted mouth corners, 
                    squinted eyes—then suggests what emotion that combination usually means.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'See specific facial signals detected',
                      'Understand why an emotion is suggested',
                      'Get alerts for conflicting signals',
                      'Review history with expression timeline',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-2">Example Output:</div>
                    
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="font-medium text-primary mb-2">Expressions Detected:</p>
                      <ul className="space-y-1 text-sm">
                        <li>• Mouth corners lifted (smile) — 82%</li>
                        <li>• Cheeks raised — 71%</li>
                        <li>• Eyes slightly squinted — 54%</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                      <p className="font-medium text-success mb-1">Likely Emotion:</p>
                      <p className="text-lg font-bold">Happy (78% confidence)</p>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-sm">
                      <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span>"Smile detected with squinted eyes. Likely happy."</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6">
                <Accessibility className="h-4 w-4 text-success" aria-hidden="true" />
                <span className="text-sm font-medium text-success">Built for Everyone</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Accessibility at the Core
              </h2>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                {[
                  { label: 'Voice Feedback', desc: 'Real-time audio announcements' },
                  { label: 'Colorblind Themes', desc: 'Pattern-based indicators' },
                  { label: 'Keyboard Nav', desc: 'Full keyboard support' },
                  { label: 'Screen Readers', desc: 'ARIA labels throughout' },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-card border border-border">
                    <p className="font-medium mb-1">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience MirrorMind?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Try the live demo now—no account required. All processing happens 
              locally in your browser.
            </p>
            <Link to="/demo">
              <Button size="lg" className="glow-primary text-lg px-10 py-6">
                Launch Demo
                <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
