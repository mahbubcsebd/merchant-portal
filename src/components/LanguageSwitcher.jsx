
import { Globe } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

const LANGUAGES = [
  { value: "English", flag: "🇺🇸", label: "English" },
  { value: "বাংলা",   flag: "🇧🇩", label: "বাংলা" },
]

export function LanguageSwitcher() {
  const [lang, setLang] = useState("English")

  return (
    <div className="flex items-center gap-2">
      <Select value={lang} onValueChange={setLang}>
        <SelectTrigger
          className="
            group
            h-9 gap-1.5 px-3
            rounded-full
            border border-slate-200/80 dark:border-white/10
            bg-white/70 dark:bg-white/5
            backdrop-blur-sm
            text-slate-600 dark:text-slate-300
            text-sm font-medium
            shadow-sm
            hover:border-[#2563eb]/40 hover:text-[#2563eb] hover:bg-white dark:hover:bg-white/10
            focus-visible:ring-2 focus-visible:ring-[#2563eb]/30 focus-visible:border-[#2563eb]/40
            transition-all duration-200
          "
        >
          <Globe
            size={14}
            className="text-slate-400 group-hover:text-[#2563eb] transition-colors duration-200 shrink-0"
          />
          <SelectValue />
        </SelectTrigger>

        <SelectContent
          align="end"
          className="min-w-[160px] rounded-xl border border-slate-200 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-black/40 p-1"
        >
          {LANGUAGES.map(({ value, flag, label }) => (
            <SelectItem
              key={value}
              value={value}
              className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <span className="text-base leading-none">{flag}</span>
                <span>{label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
