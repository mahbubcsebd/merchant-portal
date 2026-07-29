import React from "react";
import { Check } from "lucide-react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import GlobalButton from "./GlobalButton";

export default function SuccessDialog({ title = "Success", message = "Operation completed successfully.", details = {}, onClose }) {
  return (
    <div className="p-8 text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400">
        <Check size={32} />
      </div>
      
      <DialogHeader className="items-center text-center mb-6">
        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </DialogTitle>
        <DialogDescription className="text-sm text-slate-500 dark:text-white/60 max-w-[300px]">
          {message}
        </DialogDescription>
      </DialogHeader>

      {Object.keys(details).length > 0 && (
        <div className="w-full text-left bg-slate-50 dark:bg-white/5 rounded-lg p-4 mb-6 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
          {Object.entries(details).map(([key, value], idx) => {
            if (value === undefined || value === null || value === "") return null;
            return (
              <div key={idx} className="flex justify-between items-start text-sm">
                <span className="text-slate-500 dark:text-white/50 pr-4">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <span className="font-medium text-slate-900 dark:text-white text-right break-words">{String(value)}</span>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="w-full border-t border-slate-200 dark:border-white/10 pt-5 flex justify-center">
        <GlobalButton 
          variant="primary" 
          onClick={onClose} 
          className="w-full max-w-[150px] uppercase font-bold h-10 text-xs"
        >
          Done
        </GlobalButton>
      </div>
    </div>
  );
}
