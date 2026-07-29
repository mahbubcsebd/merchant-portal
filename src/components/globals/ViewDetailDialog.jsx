import React from "react";
import { X } from "lucide-react";
import GlobalButton from "./GlobalButton";

export default function ViewDetailDialog({
  title,
  subtitle,
  accentHeader,
  details = [],
  doneText = "Done",
  onClose,
}) {
  const validDetails = details.filter(detail => 
    detail.value !== null && 
    detail.value !== undefined && 
    detail.value !== "" && 
    detail.value !== "N/A"
  );

  return (
    <div className="flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 px-6 py-5 flex items-center justify-between">
        <h3 className="text-slate-900 dark:text-white text-base font-bold uppercase tracking-wider">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 overflow-y-auto space-y-6 max-h-[60vh]">
        {accentHeader && (
          <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-blue-50 to-transparent dark:from-[#2563eb]/10 dark:to-transparent rounded-xl border border-blue-100 dark:border-blue-500/20">
            {accentHeader}
          </div>
        )}

        <div className="space-y-1">
          {validDetails.map((detail, idx) => (
            <div
              key={idx}
              className={`flex justify-between items-center py-3 ${idx < validDetails.length - 1 ? "border-b border-slate-100 dark:border-white/5" : ""}`}
            >
              <span className="text-sm text-slate-500 dark:text-white/50">
                {detail.label}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {detail.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 px-6 py-4 flex justify-end shrink-0">
        <GlobalButton
          variant="primary"
          onClick={onClose}
          className="uppercase tracking-wider font-bold h-10 text-xs px-8"
        >
          {doneText}
        </GlobalButton>
      </div>
    </div>
  );
}
