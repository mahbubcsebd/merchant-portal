
import { Bell, Moon, Sun, Menu, X, AlertCircle, CreditCard, QrCode, PhoneCall, Mail, Repeat2, Landmark, ScanLine, ImageIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { useDashboardContext } from '@/pages/dashboard/context';
import { useQuery } from '@tanstack/react-query';
import { getPortalNotifications } from '@/lib/api/endpoints';

// Map notification types to icons and colors
const notificationMeta = {
  PAYBILL:      { icon: CreditCard,  color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
  PAYQRCODE:    { icon: QrCode,      color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-900/20' },
  PAYTOBANK:    { icon: Landmark,    color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  PAYTOEMAIL:   { icon: Mail,        color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/20' },
  PAYTOPHONE:   { icon: PhoneCall,   color: 'text-pink-500',    bg: 'bg-pink-50 dark:bg-pink-900/20' },
  PROFBYQR:     { icon: QrCode,      color: 'text-cyan-500',    bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  SCANCOLLET:   { icon: ScanLine,    color: 'text-teal-500',    bg: 'bg-teal-50 dark:bg-teal-900/20' },
  SCANGALERY:   { icon: ImageIcon,   color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  SCANTOPAY:    { icon: ScanLine,    color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  FORGOTPASSWORD: { icon: AlertCircle, color: 'text-red-500',  bg: 'bg-red-50 dark:bg-red-900/20' },
  DEFAULT:      { icon: Bell,        color: 'text-slate-500',   bg: 'bg-slate-100 dark:bg-white/5' },
};

export function Header({ title = 'Dashboard', setIsMobileOpen }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { profile } = useDashboardContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  const userName = profile?.custName || profile?.FIRSTNAME || 'Merchant';
  const userInitials = userName.substring(0, 2).toUpperCase();

  useEffect(() => setMounted(true), []);
  const isDark = theme === 'dark';

  // Fetch notifications
  const { data: notifData, isLoading: notifLoading } = useQuery({
    queryKey: ['portalNotifications'],
    queryFn: () => getPortalNotifications(),
    staleTime: 2 * 60 * 1000,
  });

  const notifications = notifData?.notifications || [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <p className="hidden sm:block text-[10px] sm:text-xs text-slate-500 dark:text-white/70 font-semibold">
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

        {/* Notification Bell */}
        <div className="relative">
          <button
            ref={bellRef}
            onClick={() => setShowNotifications(prev => !prev)}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            aria-label="Notifications"
          >
            <Bell size={14} className="sm:size-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#e65625] rounded-full border border-white dark:border-[#0a0f1c]" />
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifications && (
            <div
              ref={panelRef}
              className="absolute right-0 top-12 w-[360px] max-h-[520px] bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10 shrink-0">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h2>
                  {notifications.length > 0 && (
                    <p className="text-[11px] text-slate-500 dark:text-white/50 mt-0.5">{notifications.length} messages</p>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1">
                {notifLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" />
                    <p className="text-xs text-slate-400 dark:text-white/40">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                      <Bell size={20} className="text-slate-400 dark:text-white/30" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-white/50 font-medium">No notifications</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-white/5">
                    {notifications.map((notif) => {
                      const meta = notificationMeta[notif.notificationType] || notificationMeta.DEFAULT;
                      const IconComponent = meta.icon;
                      return (
                        <li key={notif.msgId} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${meta.bg}`}>
                            <IconComponent size={14} className={meta.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-[#1b55ad] dark:text-blue-400 mb-0.5 truncate">
                              {notif.notificationTypeName}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed line-clamp-2">
                              {notif.notificationMsg}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-white/30 mt-1">
                              {notif.timeAgo}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs select-none">
          {userInitials}
        </div>
      </div>
    </header>
  );
}
