import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { username, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/demo', label: 'Demo' },
    { path: '/about', label: 'About' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-bold transition-colors hover:text-primary"
          aria-label="MirrorMind Home"
        >
          <Brain className="h-7 w-7 text-primary" aria-hidden="true" />
          <span className="text-glow">MirrorMind</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.path 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/demo">
            <Button variant="default" size="sm" className="glow-primary-subtle">
              Try Demo
            </Button>
          </Link>
          <Link
            to="/account"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <User className="h-4 w-4" />
            <span className="max-w-[100px] truncate">{username ?? 'Account'}</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-up">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors py-2 ${
                  location.pathname === link.path 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/demo" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="default" className="w-full">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}