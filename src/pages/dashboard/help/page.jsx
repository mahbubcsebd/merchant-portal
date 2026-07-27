
import { HardHat } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="w-full h-full min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6">
      
      <div className="max-w-xl w-full p-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131c31] shadow-xl animate-in zoom-in-95 duration-500 flex flex-col items-center text-center">
        
        {/* Construction Icon */}
        <div className="mb-8 p-6 rounded-full bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-500/20 text-amber-500">
          <HardHat size={64} strokeWidth={1.5} />
        </div>

        {/* Title Badge */}
        <div className="bg-[#1b55ad] text-white px-8 py-3 rounded-lg font-bold text-xl tracking-wide shadow-md mb-8">
          Under Construction
        </div>

        {/* Subtext */}
        <p className="text-slate-600 dark:text-white/60 font-medium text-lg">
          Coming soon...
        </p>
        
      </div>
    </div>
  )
}
