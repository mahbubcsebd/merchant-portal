import React from "react";
import { Check, X } from "lucide-react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import GlobalButton from "./GlobalButton";

export default function GlobalPopup({ title, description, type = "error", onClose }) {
  const isError = type === "error";

  return (
    <div className="p-8 text-center flex flex-col items-center">
      <div 
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-6
        ${isError ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400" : "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"}`}
      >
        {isError ? (
          <X size={32} />
        ) : (
          <Check size={32} />
        )}
      </div>
      
      <DialogHeader className="items-center text-center">
        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {title || (isError ? "Error" : "Success")}
        </DialogTitle>
        <DialogDescription className="text-sm text-slate-500 dark:text-white/60 max-w-[300px]">
          {description}
        </DialogDescription>
      </DialogHeader>
      
      <div className="mt-8 w-full border-t border-slate-200 dark:border-white/10 pt-5 flex justify-center">
        <GlobalButton 
          variant={isError ? "danger" : "primary"} 
          onClick={onClose} 
          className="w-full max-w-[150px] uppercase font-bold h-10 text-xs"
        >
          Close
        </GlobalButton>
      </div>
    </div>
  );
}
