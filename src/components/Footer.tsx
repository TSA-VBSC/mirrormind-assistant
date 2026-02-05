import { Brain, Shield, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="font-semibold">MirrorMind</span>
            <span className="text-muted-foreground text-sm">— TSA Competition Project</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" aria-hidden="true" />
              <span>On-device only • No uploads</span>
            </div>
            <Link 
              to="/about" 
              className="hover:text-primary transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          <p>
            Built with accessibility in mind. All facial analysis happens locally in your browser.
          </p>
        </div>
      </div>
    </footer>
  );
}