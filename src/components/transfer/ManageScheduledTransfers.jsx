import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDialog } from "@/components/globals/DialogProvider";
import ScheduledTransfersList from "./scheduled/ScheduledTransfersList";
import ScheduledTransferFormFields from "./scheduled/ScheduledTransferFormFields";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useScheduledTransfers } from "@/hooks/useScheduledTransfers";
import { getBankName, getCurrencyLabel } from "@/lib/utils/TransferUtils";
import { format, parse } from "date-fns";
import { useDashboardContext } from "@/pages/dashboard/context";

export default function ManageScheduledTransfers({ setView: setParentView }) {
  const { accounts } = useDashboardContext();
  const { t } = useLanguage();
  const { validate } = useFormValidation();
  const {
    openPreconfirmDialog,
    openSuccessDialog,
    openDetailDialog,
    openGlobalPopup,
    openFormDialog,
    closeDialog,
  } = useDialog();
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);

  const { transfersQuery, updateTransferMutation, deleteTransferMutation } =
    useScheduledTransfers();

  // Helper functions
  const getFrequencyLabel = (val) => {
    const map = {
      1: t("schedule_once", "Once"),
      2: t("schedule_daily", "Daily"),
      3: t("schedule_weekly", "Weekly"),
      4: t("schedule_biweekly", "Bi-Weekly"),
      5: t("schedule_monthly", "Monthly"),
      6: t("schedule_quarterly", "Quarterly"),
      7: t("schedule_halfyearly", "Half-Yearly"),
      8: t("schedule_annual", "Annually"),
    };
    return map[val] || val;
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
      title: t("view.scheduled", "View Scheduled Transfer"),
      details: [
        { label: t("p2b_benname", "Beneficiary Name"), value: transfer.BENFNAME },
        { label: t("p2b_benbank", "Bank Name"), value: getBankName(welcomeData, transfer.BENFBNKID) },
        { label: t("p2b_accno", "Account No."), value: transfer.BENFBNKAC },
        {
          label: t("teAmount", "Amount"),
          value: `${transfer.TXNAMOUNT} ${getCurrencyLabel(welcomeData, transfer.BENFACCUR)}`,
        },
        { label: t("schedule_start", "Start Date"), value: translateDate(transfer.STRDATE) },
        { label: t("schedule_often", "How Often"), value: getFrequencyLabel(transfer.FREQUENCY) },
        {
          label: t("schedule_until", "Until"),
          value:
            transfer.ENDDATE && transfer.ENDDATE !== "0"
              ? translateDate(transfer.ENDDATE)
              : "-",
        },
        { label: t("status", "Status"), value: transfer.TXNSTATUS },
        { label: t("ptb_description", "Description"), value: transfer.TXNDESC },
      ],
      doneText: t("button_close", "Close"),
    });
  };

    const handleEdit = (transfer) => {
    if (transfer.TXNSTATUS === "CANCELLED") return;

    const initialValues = {
      ...transfer,
      STRDATE: translateDate(transfer.STRDATE),
      ENDDATE: transfer.ENDDATE === "0" ? "" : translateDate(transfer.ENDDATE),
    };

    openFormDialog({
      title: t("ptb_title_edit", "Edit Scheduled Transfer"),
      isView: false,
      submitText: t("buttonUpdate", "Update"),
      size: "sm:max-w-xl",
      disableAutoValidation: true,
      content: <ScheduledTransferFormFields data={initialValues} accounts={accounts} />,
      onSave: (values, setErrors) => {
        const fieldsToValidate = [
          { name: "TXNAMOUNT", value: values.TXNAMOUNT, label: t("teAmount", "Amount"), required: true },
          { name: "STRDATE", value: values.STRDATE, label: t("schedule_start", "Start Date"), required: true },
          { name: "FREQUENCY", value: values.FREQUENCY, label: t("schedule_often", "How Often"), required: true },
        ];

        if (parseInt(values.FREQUENCY) > 1) {
          fieldsToValidate.push({ name: "ENDDATE", value: values.ENDDATE, label: t("schedule_end", "End Date"), required: true });
        }

        const { isValid, errors } = validate(fieldsToValidate);
        if (!isValid) {
          setErrors(errors);
          return false;
        }

        const formatForApi = (dateStr) => {
          if (!dateStr || dateStr === "0") return "";
          const parsed = parse(dateStr, "yyyyMMdd", new Date());
          return format(parsed, "MM/dd/yyyy");
        };

        const startDateFormatted = formatForApi(values.STRDATE);
        const endDateFormatted = formatForApi(values.ENDDATE);

        const payload = {
          HowOften_label: getFrequencyLabel(values.FREQUENCY),
          amount: values.TXNAMOUNT,
          benName: transfer.BENFNAME || "",
          coordLat: "1.1",
          coordLong: "1.1",
          custType: "C",
          date_start: startDateFormatted,
          description: values.TXNDESC,
          endDate: endDateFormatted,
          end_date: endDateFormatted,
          fromAccNum: values.FROMACC,
          fromAccountNumber: values.FROMACC,
          howOften: values.FREQUENCY,
          institutionID: welcomeData?.user?.institutionId || "1",
          langId: welcomeData?.user?.language || "en",
          scheduledTxnId: values.SCHEDULEDTXNID,
          startDate: startDateFormatted,
          until: parseInt(values.FREQUENCY) > 1 ? "Y" : "N",
          when: "N"
        };

        
        const rawPreconfirmDetails = {
          [t("from_account", "From Account")]: values.FROMACC,
          [t("p2b_benname", "Beneficiary Name")]: transfer.BENFNAME,
          [t("p2b_benbank", "Bank Name")]: getBankName(welcomeData, transfer.BENFBNKID),
          [t("p2b_accno", "Account No.")]: transfer.BENFBNKAC,
          [t("p2b_currency", "Currency")]: getCurrencyLabel(welcomeData, transfer.BENFACCUR),
          [t("teAmount", "Amount")]: `${values.TXNAMOUNT} ${getCurrencyLabel(welcomeData, transfer.BENFACCUR)}`,
          [t("ptb_description", "Description")]: values.TXNDESC,
          [t("schedule_start", "Start Date")]: startDateFormatted,
          [t("schedule_often", "How Often")]: getFrequencyLabel(values.FREQUENCY),
          [t("schedule_until", "Until")]: parseInt(values.FREQUENCY) > 1 ? endDateFormatted : "-",
        };
        const preconfirmDetails = Object.fromEntries(
          Object.entries(rawPreconfirmDetails).filter(([_, v]) => v && v !== "-")
        );

        openPreconfirmDialog({
          title: t("ptb_title_edit", "Confirm Update"),
          message: t("confirm_update_desc", "Are you sure you want to update this scheduled transfer?"),
          details: preconfirmDetails,
          onChange: () => {
             // Let them go back to the dialog
             handleEdit(transfer);
          },
          onSubmit: async () => {
            try {
              await updateTransferMutation.mutateAsync(payload);
              openSuccessDialog({
                title: t("success_title", "Success"),
                message: t("update_success_desc", "Scheduled transfer updated successfully."),
                details: preconfirmDetails
              });
            } catch (error) {
              openGlobalPopup({
                title: t("error_title", "Error"),
                description: error.message || "Failed to update scheduled transfer.",
                type: "error",
              });
            }
          },
        });

        return false;
      },
    });
  };

  const handleDelete = (transfer) => {
    if (transfer.TXNSTATUS === "CANCELLED") return;

    const details = {
      [t("p2b_benname", "Beneficiary Name")]: transfer.BENFNAME,
      [t("p2b_benbank", "Bank Name")]: getBankName(welcomeData, transfer.BENFBNKID),
      [t("p2b_accno", "Account No.")]: transfer.BENFBNKAC,
      [t("teAmount", "Amount")]: `${transfer.TXNAMOUNT} ${getCurrencyLabel(welcomeData, transfer.BENFACCUR)}`,
      [t("schedule_start", "Start Date")]: translateDate(transfer.STRDATE),
      [t("schedule_often", "How Often")]: getFrequencyLabel(transfer.FREQUENCY),
      [t("schedule_until", "Until")]: transfer.ENDDATE && transfer.ENDDATE !== "0" ? translateDate(transfer.ENDDATE) : "-",
      [t("status", "Status")]: transfer.TXNSTATUS,
      [t("ptb_description", "Description")]: transfer.TXNDESC,
    };

    openPreconfirmDialog({
      title: t("cancel_transfer_title", "Confirm Cancellation"),
      message: t("del_payment_confirm", "Are you sure you want to cancel this scheduled transfer? This action cannot be undone."),
      details,
      confirmText: t("button_confirm", "Yes, Cancel Transfer"),
      iconType: "danger",
      onChange: () => closeDialog(),
      onSubmit: async () => {
        try {
          await deleteTransferMutation.mutateAsync(transfer.SCHEDULEDTXNID);
          openSuccessDialog({
            title: t("success_title", "Transfer Cancelled"),
            message: t("cancel_transfer_success", "The scheduled transfer has been successfully cancelled."),
          });
        } catch (error) {
          openGlobalPopup({
            title: t("error_title", "Error"),
            description: error.message || "Failed to cancel transfer.",
            type: "error",
          });
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
  return (
    <ScheduledTransfersList
      transfers={
        transfersQuery.data?.map((t) => ({
          ...t,
          currency: getCurrencyLabel(welcomeData, t.BENFACCUR),
          bank: getBankName(welcomeData, t.BENFBNKID),
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