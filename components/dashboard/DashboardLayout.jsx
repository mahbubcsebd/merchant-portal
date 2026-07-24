'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function DashboardLayout({ children, title }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    html.classList.add('overflow-hidden', 'h-full');
    body.classList.add('overflow-hidden', 'h-full');
    body.classList.remove('min-h-full');

    return () => {
      html.classList.remove('overflow-hidden', 'h-full');
      body.classList.remove('overflow-hidden', 'h-full');
      body.classList.add('min-h-full');
    };
  }, []);

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs z-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar Drawer (Slides in from the left) */}
      <div 
        className={cn(
          "fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-[#0f1829] border-r border-slate-200 dark:border-white/5 z-50 md:hidden transition-all duration-300 ease-in-out shadow-2xl",
          isMobileOpen ? "translate-x-0 visible opacity-100" : "-translate-x-full invisible opacity-0 pointer-events-none"
        )}
      >
        <Sidebar isMobile={true} onClose={() => setIsMobileOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Grid pattern — only visible in dark mode */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />
        {/* Top right glow — dark mode only */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[300px] rounded-full bg-blue-600/0 dark:bg-blue-600/10 blur-[120px] pointer-events-none"
          aria-hidden="true"
        />

        <Header title={title} setIsMobileOpen={setIsMobileOpen} />

        <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

