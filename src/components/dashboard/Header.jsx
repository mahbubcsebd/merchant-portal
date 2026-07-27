
import { Bell, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useDashboardContext } from '@/pages/dashboard/layout';

export function Header({ title = 'Dashboard', setIsMobileOpen }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { profile } = useDashboardContext();

  const userName = profile?.custName || profile?.FIRSTNAME || 'Merchant';
  const userInitials = userName.substring(0, 2).toUpperCase();

  useEffect(() => setMounted(true), []);

  const isDark = theme === 'dark';

  return (
    <header className="h-16 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 flex-shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger menu */}
        <button
          onClick={() => setIsMobileOpen?.(true)}
          className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>
          <p className="hidden sm:block text-[10px] sm:text-xs text-slate-400 dark:text-white/30 font-medium">
            Welcome back, {userName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={14} className="sm:size-4" /> : <Moon size={14} className="sm:size-4" />}
          </button>
        )}

        {/* Notification */}
        <button className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
          <Bell size={14} className="sm:size-4" />
          <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#e65625] rounded-full border border-white dark:border-[#0a0f1c]" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs select-none">
          {userInitials}
        </div>
      </div>
    </header>
  );
}
