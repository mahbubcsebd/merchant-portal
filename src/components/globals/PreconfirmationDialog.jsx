import React from "react";
import { X } from "lucide-react";
import GlobalButton from "./GlobalButton";

export default function PreconfirmationDialog({ title = "Confirm Details", details = {}, onSubmit, onChange, onClose }) {
  return (
    <div className="flex flex-col max-h-[85vh]">
      <div className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 px-6 py-5 flex items-center justify-between shrink-0">
        <h3 className="text-slate-900 dark:text-white text-base font-bold uppercase tracking-wider">
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 overflow-y-auto space-y-4">
        <p className="text-sm text-slate-500 dark:text-white/60 mb-2">
          Please review the details below before submitting.
        </p>
        <div className="rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
          {Object.entries(details).map(([key, value], idx) => {
            // Exclude empty or internal fields if needed
            if (value === undefined || value === null || value === "" || value === "N/A") return null;
            return (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-white dark:bg-transparent">
                <span className="text-xs font-semibold text-slate-500 dark:text-white/50 w-1/3 uppercase tracking-wider mb-1 sm:mb-0">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-white w-2/3 sm:text-right break-words">
                  {String(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-end gap-3 shrink-0">
        <GlobalButton variant="outline" onClick={onChange} className="uppercase font-bold tracking-wider h-10 px-6 text-xs">
          Change
        </GlobalButton>
        <GlobalButton variant="primary" onClick={onSubmit} className="uppercase font-bold tracking-wider h-10 px-6 text-xs">
          Submit
        </GlobalButton>
      </div>
    </div>
  );
}
