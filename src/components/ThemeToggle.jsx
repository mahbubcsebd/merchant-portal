
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        group
        w-9 h-9 flex items-center justify-center
        rounded-full
        border border-slate-200/80 dark:border-white/10
        bg-white/70 dark:bg-white/5
        backdrop-blur-sm
        text-slate-600 dark:text-slate-300
        shadow-sm
        hover:border-[#2563eb]/40 hover:text-[#2563eb] hover:bg-white dark:hover:bg-white/10
        focus-visible:ring-2 focus-visible:ring-[#2563eb]/30 focus-visible:border-[#2563eb]/40
        transition-all duration-200 shrink-0
      "
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={16} className="text-slate-400 group-hover:text-[#2563eb] transition-colors duration-200" />
      ) : (
        <Moon size={16} className="text-slate-400 group-hover:text-[#2563eb] transition-colors duration-200" />
      )}
    </button>
  )
}
