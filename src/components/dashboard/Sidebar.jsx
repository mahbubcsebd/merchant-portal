
import { cn } from '@/lib/utils';
import {
  Briefcase,
  CreditCard,
  FileText,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Phone,
  RefreshCcw,
  Settings,
  Store,
  Users,
  X,
} from 'lucide-react';

import { Link } from "react-router-dom";
import { useNavigate, useLocation } from 'react-router-dom';
import { useDashboardContext } from '@/pages/dashboard/context';
import { useDialog } from '@/components/globals/DialogProvider';
import { logout } from '@/lib/api/endpoints';

export const MENU_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Business Profile',
    href: '/dashboard/business-profile',
    icon: Briefcase,
  },
  {
    label: 'Live Transactions',
    href: '/dashboard/live-transactions',
    icon: RefreshCcw,
  },
  { label: 'Manage Cashiers', href: '/dashboard/manage-cashiers', icon: Users },
  { label: 'Branches', href: '/dashboard/branches', icon: Store },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Pay Bills', href: '/dashboard/pay-bills', icon: CreditCard },
  { label: 'Transfer To Bank', href: '/dashboard/transfer', icon: Landmark },
  { label: 'Administration', href: '/dashboard/admin', icon: Settings },
];

export const BOTTOM_MENU_ITEMS = [
  { label: 'Sign Out', href: '/', icon: LogOut },
  { label: 'Help', href: '/dashboard/help', icon: HelpCircle },
  { label: 'Contact Us', href: '/dashboard/contact', icon: Phone },
];

export function Sidebar({ isCollapsed, setIsCollapsed, isMobile, onClose }) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const { profile } = useDashboardContext();
  const { openConfirmDialog } = useDialog();

  const handleLogout = (e) => {
    e.preventDefault();
    openConfirmDialog({
      title: "Sign Out",
      description: "Are you sure you want to sign out of your account?",
      confirmText: "Yes, Sign Out",
      iconType: "danger",
      onConfirm: async () => {
        try {
          await logout();
        } catch (err) {
          console.error("Logout error", err);
        }
        navigate("/");
      }
    });
  };

  const userName = profile?.custName || profile?.FIRSTNAME || 'Merchant';
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <aside
      className={cn(
        "flex-shrink-0 flex flex-col h-full bg-white dark:bg-[#0f1829] overflow-hidden transition-all duration-300",
        isMobile ? "w-full" : (isCollapsed ? "w-[68px]" : "w-64"),
        isMobile ? "flex" : "hidden md:flex",
        !isMobile && "border-r border-slate-200 dark:border-white/5"
      )}
    >
      {/* Dark mode ambient glows only */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] left-[-20%] w-[80%] aspect-square rounded-full bg-blue-600/15 blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] aspect-square rounded-full bg-[#e65625]/10 blur-[70px]" />
      </div>

      {/* Logo Section / Toggle Section */}
      {isMobile ? (
        <div className="relative z-10 flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-white/5 flex-shrink-0">
          <img
            src="/images/logo.svg"
            alt="mPay Network"
            width={110}
            height={42}
            priority
            className="h-auto dark:invert-0"
          />
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white/80 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="Close Menu"
          >
            <X size={18} />
          </button>
        </div>
      ) : isCollapsed ? (
        <div className="relative z-10 flex items-center justify-center h-16 border-b border-slate-200 dark:border-white/5 flex-shrink-0">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white/80 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="Expand Sidebar"
          >
            <PanelLeft size={18} />
          </button>
        </div>
      ) : (
        <div className="relative z-10 flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-white/5 flex-shrink-0">
          <img
            src="/images/logo.svg"
            alt="mPay Network"
            width={110}
            height={42}
            priority
            className="h-auto dark:invert-0"
          />
          <button 
            onClick={() => setIsCollapsed(true)}
            className="text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white/80 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
      )}

      {/* User Info */}
      <div
        className={cn(
          "relative z-10 flex items-center transition-all duration-300 flex-shrink-0",
          isCollapsed ? "justify-center mt-4 mx-auto" : "gap-3 px-4 py-3 mx-3 mt-4",
          (!isCollapsed && !isMobile) && "rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/8"
        )}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {userInitials}
        </div>
        {!isCollapsed && (
          <div className="min-w-0 animate-in fade-in duration-200">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
              {userName}
            </p>
            <p className="text-xs text-slate-400 dark:text-white/40 truncate">
              Merchant
            </p>
          </div>
        )}
      </div>


      {/* Main Nav */}
      <div className={cn(
        "relative z-10 flex-1 overflow-y-auto no-scrollbar py-3 space-y-0.5 transition-all duration-300",
        isCollapsed ? "px-2" : "px-3"
      )}>
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-all duration-150',
                isCollapsed
                  ? 'justify-center w-10 h-10 mx-auto'
                  : 'gap-3 px-4 py-2.5',
                isActive
                  ? 'bg-[#2563eb] text-white shadow-[0_0_16px_rgba(37,99,235,0.35)]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white',
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon
                size={17}
                className={cn(
                  'shrink-0',
                  isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                )}
              />
              {!isCollapsed && (
                <span className="truncate animate-in fade-in duration-200">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Nav */}
      <div className={cn(
        "relative z-10 border-t border-slate-100 dark:border-white/5 pt-3 space-y-0.5 transition-all duration-300 flex-shrink-0",
        isCollapsed ? "px-2 pb-4" : "px-3 pb-4"
      )}>
        {BOTTOM_MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.label === 'Sign Out') {
            return (
              <button
                key={item.label}
                onClick={handleLogout}
                className={cn(
                  'flex items-center rounded-lg text-sm font-medium transition-all duration-150 w-full',
                  isCollapsed
                    ? 'justify-center h-10 mx-auto'
                    : 'gap-3 px-4 py-2.5',
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-[0_0_16px_rgba(37,99,235,0.35)]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white',
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon
                  size={17}
                  className={cn(
                    'shrink-0',
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate animate-in fade-in duration-200">
                    {item.label}
                  </span>
                )}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-all duration-150',
                isCollapsed
                  ? 'justify-center w-10 h-10 mx-auto'
                  : 'gap-3 px-4 py-2.5',
                isActive
                  ? 'bg-[#2563eb] text-white shadow-[0_0_16px_rgba(37,99,235,0.35)]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white',
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon
                size={17}
                className={cn(
                  'shrink-0',
                  isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                )}
              />
              {!isCollapsed && (
                <span className="truncate animate-in fade-in duration-200">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

