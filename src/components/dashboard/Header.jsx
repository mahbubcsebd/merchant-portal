import { Bell, Moon, Sun, Menu, AlertCircle, CreditCard, QrCode, PhoneCall, Mail, ScanLine, ImageIcon, Landmark, CheckCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useDashboardContext } from '@/pages/dashboard/context';
import { useQuery } from '@tanstack/react-query';
import { getPortalNotifications } from '@/lib/api/endpoints';
import { useDialog } from '@/components/globals/DialogProvider';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Map notification types to icons and colors
const notificationMeta = {
  PAYBILL:        { icon: CreditCard,  color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
  PAYQRCODE:      { icon: QrCode,      color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-900/20' },
  PAYTOBANK:      { icon: Landmark,    color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  PAYTOEMAIL:     { icon: Mail,        color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/20' },
  PAYTOPHONE:     { icon: PhoneCall,   color: 'text-pink-500',    bg: 'bg-pink-50 dark:bg-pink-900/20' },
  PROFBYQR:       { icon: QrCode,      color: 'text-[#06b6d4]',    bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  SCANCOLLET:     { icon: ScanLine,    color: 'text-teal-500',    bg: 'bg-teal-50 dark:bg-teal-900/20' },
  SCANGALERY:     { icon: ImageIcon,   color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  SCANTOPAY:      { icon: ScanLine,    color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  FORGOTPASSWORD: { icon: AlertCircle, color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
  DEFAULT:        { icon: Bell,        color: 'text-slate-500',   bg: 'bg-slate-100 dark:bg-white/5' },
};

export function Header({ title = 'Dashboard', setIsMobileOpen }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { profile } = useDashboardContext();
  const { openConfirmDialog } = useDialog();

  const userName = profile?.custName || profile?.FIRSTNAME || 'Merchant';
  const userInitials = userName.substring(0, 2).toUpperCase();

  useEffect(() => setMounted(true), []);
  const isDark = theme === 'dark';

  // Read notifications IDs saved in localStorage
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const saved = localStorage.getItem('read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch notifications
  const { data: notifData, isLoading: notifLoading } = useQuery({
    queryKey: ['portalNotifications'],
    queryFn: () => getPortalNotifications(),
    staleTime: 2 * 60 * 1000,
  });

  const notifications = notifData?.notifications || [];

  const isUnread = (notif) => {
    if (readNotifIds.includes(notif.msgId)) return false;
    if (notif.notificationStatus === 'R' || notif.notificationStatus === 'READ') return false;
    return true;
  };

  const unreadCount = notifications.filter(isUnread).length;

  const markAsRead = (msgId) => {
    if (!readNotifIds.includes(msgId)) {
      const updated = [...readNotifIds, msgId];
      setReadNotifIds(updated);
      try {
        localStorage.setItem('read_notifications', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.msgId).filter(Boolean);
    const updated = Array.from(new Set([...readNotifIds, ...allIds]));
    setReadNotifIds(updated);
    try {
      localStorage.setItem('read_notifications', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

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
        {/* Language Switcher */}
        <LanguageSwitcher />

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

        {/* Notification Bell using shadcn DropdownMenu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              aria-label="Notifications"
            >
              <Bell size={14} className="sm:size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#e65625] text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-[#0a0f1c] flex items-center justify-center animate-in zoom-in duration-200">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="!w-[min(360px,90vw)] !max-w-[360px] max-h-[520px] p-0 overflow-hidden flex flex-col bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10 shrink-0">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h2>
                <p className="text-[11px] text-slate-500 dark:text-white/50 mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : `${notifications.length} total messages`}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#2563eb] dark:text-blue-400 hover:underline transition-all"
                >
                  <CheckCheck size={13} />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
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
                    const unread = isUnread(notif);
                    const meta = notificationMeta[notif.notificationType] || notificationMeta.DEFAULT;
                    const IconComponent = meta.icon;
                    return (
                      <li
                        key={notif.msgId}
                        onClick={() => {
                          markAsRead(notif.msgId);
                          openConfirmDialog({
                            title: notif.notificationTypeName || 'Notification',
                            description: notif.notificationMsg,
                            confirmText: 'OK',
                            hideCancel: true,
                          });
                        }}
                        className={cn(
                          'flex items-start gap-3 px-5 py-3.5 transition-colors cursor-pointer relative',
                          unread
                            ? 'bg-blue-50/60 dark:bg-blue-950/25 hover:bg-blue-100/60 dark:hover:bg-blue-900/35'
                            : 'hover:bg-slate-50 dark:hover:bg-white/5'
                        )}
                      >
                        <div className={`shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${meta.bg}`}>
                          <IconComponent size={14} className={meta.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p
                              className={cn(
                                'text-[11px] truncate',
                                unread
                                  ? 'font-bold text-[#1b55ad] dark:text-blue-400'
                                  : 'font-semibold text-slate-600 dark:text-white/70'
                              )}
                            >
                              {notif.notificationTypeName}
                            </p>
                            {unread && (
                              <span className="w-2 h-2 rounded-full bg-[#e65625] shrink-0" title="Unread" />
                            )}
                          </div>
                          <p
                            className={cn(
                              'text-xs leading-relaxed line-clamp-2',
                              unread
                                ? 'font-semibold text-slate-900 dark:text-white'
                                : 'text-slate-500 dark:text-white/60'
                            )}
                          >
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
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Avatar */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs select-none">
          {userInitials}
        </div>
      </div>
    </header>
  );
}
