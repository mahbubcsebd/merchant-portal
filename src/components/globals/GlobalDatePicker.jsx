import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function GlobalDatePicker({
  value,
  onChange,
  placeholder = "Select Date",
  className,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:border-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed",
          value
            ? "text-slate-900 dark:text-white"
            : "text-slate-400 dark:text-white/30",
          className
        )}
      >
        <span>{value ? format(value, "PPP") : placeholder}</span>
        <CalendarIcon size={16} className="text-slate-400 dark:text-white/30" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          captionLayout="dropdown"
          startMonth={new Date(2000, 0)}
          endMonth={new Date(2035, 11)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
