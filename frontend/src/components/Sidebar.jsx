import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarRange, 
  BookOpen, 
  Sparkles, 
  Building2, 
  BarChart3, 
  Trophy, 
  LogOut, 
  Sun, 
  Moon, 
  Flame, 
  Menu, 
  X,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  if (!user) return null;

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Daily Planner', path: '/planner', icon: CalendarRange },
    { name: 'DSA Patterns', path: '/patterns', icon: BookOpen },
    { name: 'AI Mentor', path: '/ai-mentor', icon: Sparkles },
    { name: 'Company Prep', path: '/company-prep', icon: Building2 },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Leaderboards', path: '/leaderboards', icon: Trophy },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate XP percentage
  const xpNeeded = user.level * 100;
  const xpPercentage = Math.min(100, Math.max(0, (user.xp / xpNeeded) * 100));

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-card/90 backdrop-blur-md border-b border-border/65 text-foreground sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-primary to-accent p-1.5 rounded-lg text-white shadow-glow-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-base tracking-wider text-primary">DSA TRACKER AI</span>
        </div>
        <div className="flex items-center gap-4">
          {user.streak > 0 && (
            <div className="flex items-center gap-1 text-orange-500 font-bold bg-orange-500/10 px-2.5 py-0.5 rounded-full text-xs">
              <Flame className="h-4 w-4 fill-current animate-bounce-slow" />
              <span>{user.streak}d</span>
            </div>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 glass-panel border-r border-border/40 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:sticky lg:h-screen lg:top-0`}>
        <div>
          {/* Logo */}
          <div className="p-6 hidden lg:flex items-center gap-3 border-b border-border/30">
            <div className="bg-gradient-to-tr from-primary to-accent p-2.5 rounded-xl text-white shadow-glow-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg tracking-wider text-primary">DSA TRACKER AI</span>
          </div>

          {/* User Profile Info Card */}
          <div className="p-6 border-b border-border/30 bg-muted/15">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-sm uppercase shadow-glow-primary">
                {user.username.substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground truncate text-xs tracking-wide">{user.username}</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                    Lvl {user.level}
                  </span>
                </div>
              </div>
              
              {/* Streak */}
              {user.streak > 0 && (
                <div className="flex flex-col items-center justify-center bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-xl text-orange-500 shadow-sm select-none">
                  <Flame className="h-3.5 w-3.5 fill-current animate-pulse-slow" />
                  <span className="text-xs font-bold mt-0.5">{user.streak}d</span>
                </div>
              )}
            </div>

            {/* XP Progression Bar */}
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
                <span className="font-bold uppercase tracking-wider">Experience</span>
                <span className="font-extrabold text-foreground/80">{user.xp} / {xpNeeded} XP</span>
              </div>
              <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden border border-border/20">
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500 shadow-glow-primary"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 uppercase tracking-wider ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-glow-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border/40'
                  }`
                }
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-border/30 flex flex-col gap-2">
          {/* Theme & Profile Action */}
          <div className="flex items-center justify-between bg-muted/30 p-2 rounded-xl border border-border/20">
            <span className="text-xs text-muted-foreground pl-2 font-bold uppercase tracking-wider">Dark Mode</span>
            <button 
              onClick={toggleTheme} 
              className="p-1.5 bg-card border border-border/45 rounded-lg text-foreground hover:bg-muted transition-all duration-200 cursor-pointer shadow-sm"
              title="Toggle Light/Dark Theme"
            >
              {isDark ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-500" />}
            </button>
          </div>

          {/* Log Out */}
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl border border-red-500/20 text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
