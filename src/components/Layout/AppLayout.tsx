import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Video, MessageSquare, Users, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/actu', icon: Home, label: 'Actu' },
  { path: '/feed', icon: Video, label: 'Feed' },
  { path: '/messages', icon: MessageSquare, label: 'Messages' },
  { path: '/matchmaking', icon: Users, label: 'Part.' },
  { path: '/menu', icon: Menu, label: 'Menu' },
];

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isFeed = location.pathname === '/feed';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-[60]">
        {!isFeed && <div className="h-[2px] bg-gradient-legit opacity-40" />}
        <div className={cn(
          "backdrop-blur-md transition-colors duration-300",
          isFeed ? "bg-black/30" : "bg-card/90"
        )}>
          <div className="max-w-screen-xl mx-auto px-4">
            <div className={cn(
              "flex items-center justify-around",
              isFeed ? "h-12" : "h-14"
            )}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 relative',
                      isFeed
                        ? isActive
                          ? 'text-white'
                          : 'text-white/50 hover:text-white/80 active:scale-95'
                        : isActive
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95'
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      isActive && !isFeed && "animate-bounce-subtle"
                    )} />
                    <span className={cn(
                      "text-[10px] font-medium",
                      isFeed
                        ? isActive ? "font-semibold" : ""
                        : isActive && "gradient-text font-semibold"
                    )}>{item.label}</span>
                    {isActive && !isFeed && (
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-gradient-legit" />
                    )}
                    {isActive && isFeed && (
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-white/60" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;