import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * GlobalButton — Reusable button component for Merchant Wallet
 *
 * Props:
 *  variant      : 'primary' | 'secondary'   (default: 'primary')
 *  size         : 'sm' | 'md' | 'lg'        (default: 'md')
 *  isLoading    : boolean                    show spinner + disable interaction
 *  loadingText  : string                     text shown while loading
 *  leftIcon     : ReactNode                  icon before label
 *  rightIcon    : ReactNode                  icon after label
 *  fullWidth    : boolean                    w-full
 *  type         : 'button' | 'submit' | 'reset'
 *  disabled     : boolean
 *  className    : string                     extra overrides
 *  children     : ReactNode
 *  ...rest      : any native button props
 */
export default function GlobalButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  type = 'button',
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const isDisabled = disabled || isLoading;

  /* ── Size map ───────────────────────────────────────── */
  const sizeClass = {
    sm: 'h-9  px-4  text-xs  gap-1.5',
    md: 'h-11 px-6  text-sm  gap-2',
    lg: 'h-12 px-8  text-base gap-2.5',
  }[size] ?? 'h-11 px-6 text-sm gap-2';

  /* ── Variant map ────────────────────────────────────── */
  const variantClass = {
    primary: cn(
      'bg-[#2563eb] text-white font-semibold',
      'hover:bg-[#1d4ed8] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#2563eb]/25',
      'active:translate-y-0 active:shadow-none',
      'disabled:bg-[#2563eb]/60 disabled:shadow-none disabled:translate-y-0',
    ),
    secondary: cn(
      'bg-transparent text-[#2563eb] font-semibold',
      'border-2 border-[#2563eb]',
      'hover:bg-[#2563eb]/8 hover:-translate-y-0.5',
      'active:translate-y-0',
      'dark:text-blue-400 dark:border-blue-400/70',
      'dark:hover:bg-blue-400/10 dark:hover:border-blue-400',
      'disabled:opacity-50 disabled:translate-y-0',
    ),
    outline: cn(
      'bg-white dark:bg-white/5 text-slate-900 dark:text-white',
      'border border-slate-300 dark:border-white/15',
      'hover:bg-slate-50 dark:hover:bg-white/10',
      'active:bg-slate-100 dark:active:bg-white/15',
      'disabled:opacity-50 disabled:translate-y-0',
    ),
    danger: cn(
      'bg-rose-600 text-white font-semibold',
      'hover:bg-rose-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-600/25',
      'active:translate-y-0 active:shadow-none',
      'disabled:bg-rose-600/60 disabled:shadow-none disabled:translate-y-0',
    ),
  }[variant] ?? '';

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        /* Base */
        'inline-flex items-center justify-center',
        'rounded-lg',
        'transition-all duration-200',
        'cursor-pointer select-none',
        'disabled:cursor-not-allowed',
        /* Size */
        sizeClass,
        /* Variant */
        variantClass,
        /* Full width */
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {/* Spinner / Left icon */}
      {isLoading ? (
        <Loader2 className="shrink-0 animate-spin" size={16} />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}

      {/* Label */}
      {isLoading ? (
        <span>{loadingText ?? children}</span>
      ) : (
        children
      )}

      {/* Right icon (hidden while loading) */}
      {!isLoading && rightIcon && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}
