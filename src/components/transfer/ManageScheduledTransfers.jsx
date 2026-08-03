import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDialog } from "@/components/globals/DialogProvider";
import ScheduledTransfersList from "./scheduled/ScheduledTransfersList";
import ScheduledTransfersForm from "./scheduled/ScheduledTransfersForm";
import { useScheduledTransfers } from "@/hooks/useScheduledTransfers";

export default function ManageScheduledTransfers({ setView: setParentView }) {
  const [localView, setLocalView] = useState("list"); // 'list', 'form'
  const [formData, setFormData] = useState({});
  const { openPreconfirmDialog, openSuccessDialog, openDetailDialog } = useDialog();
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);

  const {
    transfersQuery,
    updateTransferMutation,
    deleteTransferMutation,
  } = useScheduledTransfers();

  // Helper functions
  const getFrequencyLabel = (val) => {
    const map = {
      "1": "Once",
      "2": "Daily",
      "3": "Weekly",
      "4": "Bi-Weekly",
      "5": "Monthly",
      "6": "Quarterly",
      "7": "Half-Yearly",
      "8": "Annually"
    };
    return map[val] || val;
  };

  const getCurrencyLabel = (val) => {
    if (!val) return val;
    if (!welcomeData?.metaData?.CURRENCY) return val;
    const curr = welcomeData.metaData.CURRENCY.find(
      (c) => String(c.id) === String(val)
    );
    return curr ? curr.title : val;
  };

  const getBankName = (val) => {
    if (!val) return val;
    if (!welcomeData?.metaData?.SETTLEBANK) return val;
    const bank = welcomeData.metaData.SETTLEBANK.find(
      (b) => String(b.id) === String(val)
    );
    return bank ? bank.title : val;
  };

  const translateDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    // YYYYMMDD to YYYY-MM-DD
    const y = dateStr.substr(0, 4);
    const m = dateStr.substr(4, 2);
    const d = dateStr.substr(6, 2);
    return `${y}-${m}-${d}`;
  };

  const formatDateForApi = (dateStr) => {
    if (!dateStr) return dateStr;
    // YYYY-MM-DD to YYYYMMDD
    return dateStr.replace(/-/g, "");
  };

  const handleView = (transfer) => {
    openDetailDialog({
      title: "View Scheduled Transfer",
      details: [
        { label: "Beneficiary Name", value: transfer.BENFNAME },
        { label: "Bank Name", value: getBankName(transfer.BENFBNKID) },
        { label: "Account No.", value: transfer.BENFACC },
        { label: "Amount", value: `${transfer.TXNAMOUNT} ${getCurrencyLabel(transfer.BENFACCUR)}` },
        { label: "Start Date", value: translateDate(transfer.STRDATE) },
        { label: "How Often", value: getFrequencyLabel(transfer.FREQUENCY) },
        { label: "Until", value: transfer.ENDDATE && transfer.ENDDATE !== "0" ? translateDate(transfer.ENDDATE) : "Endless" },
        { label: "Status", value: transfer.TXNSTATUS },
        { label: "Description", value: transfer.TXNDESC },
      ],
      doneText: "Close",
    });
  };

  const handleEdit = (transfer) => {
    if (transfer.TXNSTATUS === "CANCELLED") return;
    
    setFormData({
      ...transfer,
      STRDATE: translateDate(transfer.STRDATE),
      ENDDATE: transfer.ENDDATE === "0" ? "" : translateDate(transfer.ENDDATE),
    });
    setLocalView("form");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Map to API required payload
    const payload = {
      scheduledTxnId: formData.SCHEDULEDTXNID,
      amount: formData.TXNAMOUNT,
      description: formData.TXNDESC,
      startDate: formatDateForApi(formData.STRDATE),
      howOften: formData.FREQUENCY,
      endDate: formData.ENDDATE ? formatDateForApi(formData.ENDDATE) : "0", 
    };

    openPreconfirmDialog({
      title: "Confirm Update",
      message: "Are you sure you want to update this scheduled transfer?",
      details: [
        { label: "Beneficiary Name", value: formData.BENFNAME },
        { label: "Amount", value: `${formData.TXNAMOUNT} ${getCurrencyLabel(formData.BENFACCUR)}` },
        { label: "Start Date", value: formData.STRDATE },
        { label: "How Often", value: getFrequencyLabel(formData.FREQUENCY) },
        { label: "Until", value: formData.ENDDATE || "Endless" },
      ],
      onConfirm: async () => {
        try {
          await updateTransferMutation.mutateAsync(payload);
          setLocalView("list");
          openSuccessDialog({
            title: "Success",
            message: "Scheduled transfer updated successfully.",
          });
        } catch (error) {
          throw error;
        }
      },
    });
  };

  const handleDelete = (transfer) => {
    if (transfer.TXNSTATUS === "CANCELLED") return;

    openPreconfirmDialog({
      title: "Confirm Cancellation",
      message: "Are you sure you want to cancel this scheduled transfer? This action cannot be undone.",
      details: [
        { label: "Beneficiary Name", value: transfer.BENFNAME },
        { label: "Amount", value: `${transfer.TXNAMOUNT} ${getCurrencyLabel(transfer.BENFACCUR)}` },
        { label: "How Often", value: getFrequencyLabel(transfer.FREQUENCY) },
      ],
      confirmText: "Yes, Cancel Transfer",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await deleteTransferMutation.mutateAsync(transfer.SCHEDULEDTXNID);
          openSuccessDialog({
            title: "Transfer Cancelled",
            message: "The scheduled transfer has been successfully cancelled.",
          });
        } catch (error) {
          throw error;
        }
      },
    });
  };

  const handleHistory = (transfer) => {
    // Future integration for scheduledTxnHistory API
    console.log("View history for", transfer.SCHEDULEDTXNID);
  };

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  if (localView === "form") {
    return (
      <ScheduledTransfersForm
        formData={formData}
        setFormData={setFormData}
        handleFormSubmit={handleFormSubmit}
        setLocalView={setLocalView}
        isPending={updateTransferMutation.isPending}
      />
    );
  }

  return (
    <ScheduledTransfersList
      transfers={
        transfersQuery.data?.map(t => ({
          ...t,
          currency: getCurrencyLabel(t.BENFACCUR),
          bank: getBankName(t.BENFBNKID),
          howOften: getFrequencyLabel(t.FREQUENCY),
          until: t.ENDDATE === "0" ? "" : translateDate(t.ENDDATE),
        })) || []
      }
      isLoading={transfersQuery.isLoading}
      isError={transfersQuery.isError}
      setParentView={setParentView}
      handleView={handleView}
      handleEdit={handleEdit}
      handleHistory={handleHistory}
      handleDelete={handleDelete}
    />
  );
}
