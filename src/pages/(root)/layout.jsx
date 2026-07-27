import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ── Common Top Bar ──────────────────────────────────── */}
      <div className="absolute top-0 right-0 z-50 px-5 py-3.5 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
      <Outlet />
    </div>
  );
}
