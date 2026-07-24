import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Merchant Portal — mPay Network',
  description: 'Sign in to the mPay Merchant Portal and take full control of your business payments.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" style={{ fontFeatureSettings: '"cv02", "cv03", "cv04", "tnum"' }}>
        {/* ── Ambient Background Glows ─────────────────────────────── */}
        {/*
        <div
          className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
          aria-hidden="true"
        >
          <div className="absolute top-[-10%] left-[5%] w-[55vw] max-w-[650px] aspect-square rounded-full bg-blue-500/10 blur-[130px] animate-[mesh-move_15s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-10%] right-[5%] w-[60vw] max-w-[700px] aspect-square rounded-full bg-orange-400/8 blur-[140px] animate-[mesh-move_12s_ease-in-out_infinite_reverse]" />
        </div>
        */}

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
