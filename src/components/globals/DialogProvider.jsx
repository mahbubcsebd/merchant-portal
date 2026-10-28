import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import PreconfirmationDialog from "@/components/globals/PreconfirmationDialog";
import SuccessDialog from "@/components/globals/SuccessDialog";
import ConfirmationDialog from "@/components/globals/ConfirmationDialog";
import ViewDetailDialog from "@/components/globals/ViewDetailDialog";
import PayBillDialogContent from "@/components/globals/PayBillDialogContent";
import GlobalPopup from "@/components/globals/GlobalPopup";
import FormDialogShell from "@/components/globals/FormDialogShell";

const DialogContext = createContext(null);

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

export function DialogProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [dialogProps, setDialogProps] = useState({});

  const openFormDialog = useCallback((props) => {
    setDialogProps(props);
    setDialogType("form");
    setIsOpen(true);
  }, []);

  const openConfirmDialog = useCallback((props) => {
    setDialogProps(props);
    setDialogType("confirm");
    setIsOpen(true);
  }, []);

  const openDetailDialog = useCallback((props) => {
    setDialogProps(props);
    setDialogType("detail");
    setIsOpen(true);
  }, []);

  const openPayBillDialog = useCallback((props) => {
    setDialogProps(props);
    setDialogType("pay");
    setIsOpen(true);
  }, []);

  const openGlobalPopup = useCallback((props) => {
    setDialogProps(props);
    setDialogType("globalPopup");
    setIsOpen(true);
  }, []);

  const openPreconfirmDialog = useCallback((props) => {
    setDialogProps(props);
    setDialogType("preconfirm");
    setIsOpen(true);
  }, []);

  const openSuccessDialog = useCallback((props) => {
    setDialogProps(props);
    setDialogType("success");
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    // Clear props after close animation completes
    setTimeout(() => {
      setDialogType(null);
      setDialogProps({});
    }, 200);
  }, []);

  // Get max width based on type
  const getContentSizeClass = () => {
    if (dialogType === "form") return dialogProps.size || "sm:max-w-4xl";
    if (dialogType === "detail") return "sm:max-w-lg";
    if (dialogType === "confirm") {
      if (dialogProps.iconType === "danger") return "sm:max-w-sm";
      return "sm:max-w-md";
    }
    if (dialogType === "preconfirm") return "sm:max-w-lg";
    if (dialogType === "success") return "sm:max-w-lg";
    if (dialogType === "globalPopup") return "sm:max-w-sm";
    if (dialogType === "pay") return "sm:max-w-md";
    return "sm:max-w-md";
  };

  const handleDialogClose = useCallback(() => {
    if (dialogProps?.onClose) {
      dialogProps.onClose();
    }
    closeDialog();
  }, [dialogProps, closeDialog]);

  const contextValue = useMemo(
    () => ({
      openFormDialog,
      openConfirmDialog,
      openDetailDialog,
      openPayBillDialog,
      openGlobalPopup,
      openPreconfirmDialog,
      openSuccessDialog,
      closeDialog,
    }),
    [
      openFormDialog,
      openConfirmDialog,
      openDetailDialog,
      openPayBillDialog,
      openGlobalPopup,
      openPreconfirmDialog,
      openSuccessDialog,
      closeDialog,
    ],
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDialogClose();
          }
        }}
      >
        <DialogContent
          className={`${getContentSizeClass()} bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden p-0 gap-0`}
          showCloseButton={false}
        >
          {dialogType === "form" && (
            <FormDialogShell {...dialogProps} onClose={handleDialogClose}>
              {dialogProps.content}
            </FormDialogShell>
          )}
          {dialogType === "confirm" && (
            <ConfirmationDialog {...dialogProps} onClose={handleDialogClose} />
          )}
          {dialogType === "detail" && (
            <ViewDetailDialog {...dialogProps} onClose={handleDialogClose} />
          )}
          {dialogType === "pay" && (
            <PayBillDialogContent {...dialogProps} onClose={handleDialogClose} />
          )}
          {dialogType === "preconfirm" && (
            <PreconfirmationDialog {...dialogProps} onClose={handleDialogClose} />
          )}
          {dialogType === "success" && (
            <SuccessDialog {...dialogProps} onClose={handleDialogClose} />
          )}
          {dialogType === "globalPopup" && (
            <GlobalPopup
              {...dialogProps}
              onClose={dialogProps.onClose || closeDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
}
