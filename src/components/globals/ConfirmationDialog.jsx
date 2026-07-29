import React, { useState } from "react";
import { Trash2, Lock } from "lucide-react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import GlobalButton from "./GlobalButton";

export default function ConfirmationDialog({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  iconType,
  onClose,
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (onConfirm) {
      setLoading(true);
      try {
        await onConfirm();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    onClose();
  };

  const getIcon = () => {
    switch (iconType) {
      case "danger":
        return (
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400 flex items-center justify-center mb-6">
            <Trash2 size={32} />
          </div>
        );
      case "warning":
        return (
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center mb-6">
            <Lock size={32} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 text-center flex flex-col items-center">
      {getIcon()}
      <DialogHeader className="items-center text-center">
        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </DialogTitle>
        <DialogDescription className="text-sm text-slate-500 dark:text-white/60">
          {description}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-8 flex items-center justify-center gap-3 w-full border-t border-slate-200 dark:border-white/10 pt-5">
        <GlobalButton
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="flex-1 max-w-[150px] uppercase font-bold h-10 text-xs"
        >
          {cancelText}
        </GlobalButton>
        <GlobalButton
          variant={iconType === "danger" ? "danger" : "primary"}
          onClick={handleConfirm}
          isLoading={loading}
          className="flex-1 max-w-[150px] uppercase font-bold h-10 text-xs"
        >
          {confirmText}
        </GlobalButton>
      </div>
    </div>
  );
}
