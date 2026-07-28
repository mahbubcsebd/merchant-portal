import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";

const GlobalSelect = forwardRef(
  (
    {
      label,
      placeholder = "Select",
      required = false,
      error,
      helperText,
      options = [],
      className = "",
      labelClassName = "",
      selectClassName = "",
      containerClassName = "",
      disabled = false,
      value,
      isReadOnly = false,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    // Find selected option
    useEffect(() => {
      const option = options.find((opt) => opt.value === value);
      setSelectedOption(option || null);
    }, [value, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option) => {
      if (option.disabled || option.value === "") return;
      setSelectedOption(option);
      setIsOpen(false);
      if (onChange) {
        onChange(option.value);
      }
    };

    return (
      <div className={cn("w-full relative", containerClassName, className)}>
        {/* Hidden Inputs for Form Data */}
        {props.name && (
          <>
            <input type="hidden" name={props.name} value={value || ""} data-required={required ? "true" : undefined} />
            {selectedOption && (
              <input type="hidden" name={`${props.name}Label`} value={selectedOption.label} />
            )}
          </>
        )}

        {/* Label */}
        {label && (
          <label
            className={cn(
              "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2",
              labelClassName,
            )}
          >
            {label}
            {required && <span className="ml-1 text-[#e65625]">*</span>}
          </label>
        )}

        {/* Select Trigger */}
        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && !isReadOnly && setIsOpen(!isOpen)}
            className={cn(
              "w-full h-10 px-3 text-sm font-medium",
              "bg-slate-50 dark:bg-white/5",
              "text-slate-900 dark:text-white",
              "border rounded-lg",
              "transition-all duration-150 outline-none",
              "flex items-center justify-between",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : isOpen
                  ? "border-[#2563eb] dark:border-blue-500 ring-2 ring-[#2563eb]/20 dark:ring-blue-500/20"
                  : "border-slate-200 dark:border-white/10 focus:border-[#2563eb] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#2563eb]/20 dark:focus:ring-blue-500/20",
              (disabled || isReadOnly) &&
                "bg-slate-100 dark:bg-white/[0.03] cursor-not-allowed opacity-60",
              selectClassName,
            )}
            {...props}
          >
            <span
              className={cn(
                "truncate overflow-hidden whitespace-nowrap text-ellipsis text-left",
                selectedOption && selectedOption.value !== ""
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-slate-600 font-normal",
              )}
            >
              {selectedOption && selectedOption.label
                ? selectedOption.label
                : placeholder}
            </span>

            {!isReadOnly && (
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2",
                  isOpen && "transform rotate-180",
                )}
              />
            )}
          </button>

          {/* Dropdown */}
          {isOpen && !disabled && (
            <div
              ref={dropdownRef}
              className="absolute left-0 top-full z-[100] w-full mt-1 overflow-y-auto bg-white dark:bg-[#131c31] border border-slate-200 dark:border-white/10 rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] max-h-60 py-1"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm font-medium transition-colors duration-150",
                    option.className,
                    !option.disabled &&
                      "hover:bg-slate-50 dark:hover:bg-white/5 focus:bg-slate-50 dark:focus:bg-white/5 focus:outline-none cursor-pointer text-slate-700 dark:text-slate-300",
                    selectedOption?.value === option.value &&
                      "bg-blue-50 dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400 font-semibold",
                    option.disabled &&
                      "cursor-not-allowed opacity-40 text-slate-500",
                  )}
                >
                  {option.label}
                </button>
              ))}
              {options.length === 0 && (
                <div className="px-4 py-3 text-sm text-center text-slate-400 dark:text-slate-600">
                  No options
                </div>
              )}
            </div>
          )}
        </div>

        {/* Helper Text or Error */}
        {(helperText || error) && (
          <p
            className={cn(
              "mt-1.5 text-xs font-semibold flex items-center gap-1.5",
              error ? "text-red-500" : "text-slate-500 dark:text-slate-400",
            )}
          >
            {error && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            )}
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

GlobalSelect.displayName = "GlobalSelect";

export default GlobalSelect;
