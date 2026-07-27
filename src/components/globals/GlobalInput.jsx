import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';

const GlobalInput = forwardRef(
  (
    {
      label,
      type = 'text',
      placeholder,
      required = false,
      error,
      helperText,
      className = '',
      labelClassName = '',
      inputClassName = '',
      containerClassName = '',
      isTextarea = false,
      rows = 4,
      disabled = false,
      isReadOnly = false,
      maxLength,
      leftIcon = null,
      rightElement = null,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const baseInputClass = cn(
      'w-full h-10 text-sm font-medium',
      'bg-slate-50 dark:bg-white/5',
      'text-slate-900 dark:text-white',
      'placeholder:text-slate-400 dark:placeholder:text-slate-600',
      'border rounded-lg',
      'transition-all duration-150 outline-none',
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
        : 'border-slate-200 dark:border-white/10 focus:border-[#2563eb] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#2563eb] dark:focus:ring-blue-500/20',
      (disabled || isReadOnly) && 'bg-slate-100 dark:bg-white/[0.03] cursor-not-allowed opacity-60',
      leftIcon ? 'pl-9' : 'px-3',
      (isPassword || rightElement) && 'pr-11',
    );

    const baseTextareaClass = cn(
      'w-full text-sm font-medium',
      'bg-slate-50 dark:bg-white/5',
      'text-slate-900 dark:text-white',
      'placeholder:text-slate-400 dark:placeholder:text-slate-600',
      'border rounded-lg resize-none',
      'px-3 py-2.5',
      'transition-all duration-150 outline-none',
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
        : 'border-slate-200 dark:border-white/10 focus:border-[#2563eb] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#2563eb] dark:focus:ring-blue-500/20',
      (disabled || isReadOnly) && 'bg-slate-100 dark:bg-white/[0.03] cursor-not-allowed opacity-60',
    );

    return (
      <div className={cn('w-full', containerClassName, className)}>
        {/* Label */}
        {label && (
          <label
            className={cn(
              'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2',
              labelClassName,
            )}
          >
            {label}
            {required && <span className="ml-1 text-[#e65625]">*</span>}
          </label>
        )}

        {/* Input / Textarea Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && !isTextarea && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
              {leftIcon}
            </span>
          )}

          {isTextarea ? (
            <textarea
              ref={ref}
              rows={rows}
              disabled={disabled}
              placeholder={placeholder}
              readOnly={isReadOnly}
              maxLength={maxLength}
              className={cn(baseTextareaClass, inputClassName)}
              {...props}
            />
          ) : (
            <input
              ref={ref}
              type={inputType}
              disabled={disabled}
              maxLength={maxLength}
              placeholder={placeholder}
              readOnly={isReadOnly}
              className={cn(baseInputClass, inputClassName)}
              {...props}
            />
          )}

          {/* Right custom element */}
          {rightElement && !isTextarea && (
            <div className="absolute flex items-center -translate-y-1/2 right-3.5 top-1/2">
              {rightElement}
            </div>
          )}

          {/* Password Eye Icon */}
          {isPassword && !disabled && !rightElement && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-150 p-0.5"
            >
              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Helper Text or Error */}
        {(helperText || error) && (
          <p
            className={cn(
              'mt-1.5 text-xs font-semibold flex items-center gap-1.5',
              error ? 'text-red-500' : 'text-slate-500 dark:text-slate-400',
            )}
          >
            {error && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

GlobalInput.displayName = 'GlobalInput';

export default GlobalInput;
