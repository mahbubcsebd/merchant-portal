import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata = {
  title: 'Merchant Portal — mPay Network',
  description:
    'Sign in to the mPay Merchant Portal and take full control of your business payments.',
};

export default function RootLayout({ children }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ── Common Top Bar ──────────────────────────────────── */}
      <div className="absolute top-0 right-0 z-50 px-5 py-3.5 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  );
}
