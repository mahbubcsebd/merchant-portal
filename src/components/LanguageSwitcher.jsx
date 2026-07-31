import { Globe, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/components/globals/LanguageProvider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="flex items-center gap-2">
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger
          className="
            group
            h-9 gap-1.5 px-3
            rounded-full
            border border-slate-200/80 dark:border-white/10
            bg-white/80 dark:bg-[#0f1829]/80
            backdrop-blur-md
            text-slate-700 dark:text-slate-200
            text-xs font-semibold
            shadow-sm
            hover:border-[#2563eb]/40 hover:text-[#2563eb] hover:bg-white dark:hover:bg-[#131c31]
            focus-visible:ring-2 focus-visible:ring-[#2563eb]/30 focus-visible:border-[#2563eb]/40
            transition-all duration-200 cursor-pointer
          "
        >
          <Globe
            size={14}
            className="text-slate-400 group-hover:text-[#2563eb] transition-colors duration-200 shrink-0"
          />
          <span className="flex items-center gap-1.5">
            <span>{currentLang.flag}</span>
            <span>{currentLang.label}</span>
          </span>
        </SelectTrigger>

        <SelectContent
          align="end"
          className="min-w-[170px] rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131c31] shadow-xl shadow-slate-200/50 dark:shadow-black/40 p-1 z-50"
        >
          {SUPPORTED_LANGUAGES.map(({ code, flag, label }) => (
            <SelectItem
              key={code}
              value={code}
              className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-slate-100 dark:focus:bg-white/5"
            >
              <span className="flex items-center justify-between w-full gap-2">
                <span className="flex items-center gap-2">
                  <span className="text-sm leading-none">{flag}</span>
                  <span>{label}</span>
                </span>
                {code === language && (
                  <Check size={14} className="text-[#2563eb] dark:text-blue-400 shrink-0" />
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
