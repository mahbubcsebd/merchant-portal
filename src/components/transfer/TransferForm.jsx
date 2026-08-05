import React, { useState, useEffect } from "react";
import GlobalButton from "@/components/globals/GlobalButton";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { useCalculateFees } from "@/hooks/useCalculateFees";
import { useTransfers } from "@/hooks/useTransfers";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useDialog } from "@/components/globals/DialogProvider";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { enforceNumericSpace, enforceAlphanumericSpace } from "@/lib/utils/inputFormatters";
import { getBankRoutingByBankId } from "@/lib/api/endpoints";
import { getBankName, getCurrencyLabel } from "@/lib/utils/TransferUtils";
import TransferBeneficiaryDetails from "./TransferBeneficiaryDetails";
import TransferScheduledFields from "./TransferScheduledFields";

export default function TransferForm({ setView }) {
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);

  const { accounts } = useDashboardContext();
  const { beneficiariesQuery } = useBeneficiaries();
  const { calculateFeesMutation } = useCalculateFees();
  const { payToBankMutation } = useTransfers();
  const {
    openPreconfirmDialog,
    openSuccessDialog,
    openGlobalPopup,
    closeDialog,
  } = useDialog();

  const { errors, validate, clearError, clearAllErrors } = useFormValidation();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    to: "",
    from: "",
    amount: "",
    currency: "XCG",
    description: "",
    when: "Immediate",
    startDate: null,
    howOften: "",
    until: "",
    endDate: null,
  });

  // Derived options
  const accountOptions = (accounts || []).map((acc) => ({
    value: acc.ACCOUNTNUMBER,
    label: `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(parseFloat(acc.AVBALANCE || "0"))} ${acc.CURSHRTNAME || acc.CURCODE}`,
  }));

  const beneficiaryOptions = (beneficiariesQuery.data || []).map((b) => ({
    value: b.beneficiaryId || b.payeeBankAccount,
    label: b.payeeName,
    raw: b,
  }));

  const selectedBen = beneficiaryOptions.find(
    (b) => b.value === formData.to,
  )?.raw;
  const selectedAccount = accounts?.find(
    (a) => a.ACCOUNTNUMBER === formData.from,
  );

  // Dynamic currency options
  const getCurrencyOptions = () => {
    const opts = [];
    if (selectedAccount?.CURCODE) {
      opts.push({
        value: selectedAccount.CURCODE,
        label: getCurrencyLabel(welcomeData, selectedAccount.CURCODE),
      });
    } else {
      opts.push({ value: "XCG", label: getCurrencyLabel(welcomeData, "XCG") });
    }

    if (
      selectedBen?.payeeAcctCurr &&
      String(selectedBen.payeeAcctCurr) !== "0" &&
      selectedBen.payeeAcctCurr !== (selectedAccount?.CURCODE || "XCG")
    ) {
      const curTitle = getCurrencyLabel(welcomeData, selectedBen.payeeAcctCurr);
      opts.push({ value: selectedBen.payeeAcctCurr, label: curTitle });
    }
    return opts;
  };

  const currencyOptions = getCurrencyOptions();
  const isCurrencyDisabled = currencyOptions.length <= 1;

  // Auto-set Currency when "To" or "From" changes
  useEffect(() => {
    if (currencyOptions.length === 1) {
      setFormData((prev) => ({ ...prev, currency: currencyOptions[0].value }));
    } else if (
      currencyOptions.length > 1 &&
      !currencyOptions.find((c) => c.value === formData.currency)
    ) {
      setFormData((prev) => ({ ...prev, currency: currencyOptions[0].value }));
    }
  }, [selectedBen, selectedAccount]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearError(e.target.name);
  };

  const handleSelectChange = (name, val) => {
    setFormData({ ...formData, [name]: val });
    clearError(name);
  };

  const [isFetchingRouting, setIsFetchingRouting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationRules = [
      {
        name: "to",
        value: formData.to,
        label: "a valid beneficiary",
        type: "select",
        required: true,
      },
      {
        name: "from",
        value: formData.from,
        label: "an account",
        type: "select",
        required: true,
      },
      {
        name: "amount",
        value: formData.amount,
        label: "a valid amount",
        type: "input",
        required: true,
        customValidation: (val) =>
          parseFloat(val) <= 0
            ? "Please enter a valid amount greater than 0."
            : null,
      },
      {
        name: "currency",
        value: formData.currency,
        label: "currency",
        type: "select",
        required: true,
      },
      {
        name: "when",
        value: formData.when,
        label: "when to pay",
        type: "select",
        required: true,
      },
    ];

    if (formData.when === "Scheduled") {
      validationRules.push({
        name: "startDate",
        value: formData.startDate,
        label: "start date",
        type: "input",
        required: true,
      });
      validationRules.push({
        name: "howOften",
        value: formData.howOften,
        label: "how often",
        type: "select",
        required: true,
      });

      if (parseInt(formData.howOften) > 1) {
        validationRules.push({
          name: "until",
          value: formData.until,
          label: "until",
          type: "select",
          required: true,
        });

        if (formData.until === "Y") {
          validationRules.push({
            name: "endDate",
            value: formData.endDate,
            label: "end date",
            type: "input",
            required: true,
          });
        }
      }
    }

    const { isValid } = validate(validationRules);
    if (!isValid) return;

    if (!selectedAccount || !selectedBen) return;

    // Call calculateFees API
    const feePayload = {
      functionalityID: "P4",
      fromCurrencyCode: selectedAccount.CURCODE,
      toCurrencyCode: selectedBen.payeeAcctCurr,
      txnCurrencyCode: formData.currency,
      sendingAmount: formData.amount,
      transactionCode: "PAYTOBANK",
    };

    calculateFeesMutation.mutate(feePayload, {
      onSuccess: async (data) => {
        let bankRouting = "";
        try {
          setIsFetchingRouting(true);
          const routingRes = await getBankRoutingByBankId({
            bankId: selectedBen.payeeBankBIC,
          });
          bankRouting =
            routingRes?.data?.bankRouting ||
            routingRes?.bankRouting ||
            selectedBen.payeeBankRouting ||
            "";
        } catch (err) {
          console.error("Failed to fetch bank routing", err);
          bankRouting = selectedBen.payeeBankRouting || "";
        } finally {
          setIsFetchingRouting(false);
        }

        const isSameCurrency =
          selectedAccount.CURCODE === selectedBen.payeeAcctCurr;
        const totalFeesText =
          data.totalFees != null
            ? `${data.totalFees} ${data.fromCurrencyName || selectedAccount.CURSHRTNAME}`
            : "0.00";

        const fromWalletLabel = `${selectedAccount.CURSHRTNAME || selectedAccount.CURCODE} Account`;

        const benBankName = getBankName(
          welcomeData,
          selectedBen.payeeBankBIC,
          selectedBen.payeeBankName,
        );

        const details = {
          [t("from_account", "From Wallet")]: fromWalletLabel,
          [t("p2b_benname", "Beneficiary Name")]: selectedBen.payeeName,
          [t("p2b_benbank", "Bank Name")]: benBankName,
          [t("p2b_accno", "Account No.")]: selectedBen.payeeBankAccount,
          [t("teAmount", "Amount")]: `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(parseFloat(formData.amount))} ${currencyOptions.find((c) => c.value === formData.currency)?.label || formData.currency}`,
        };

        if (!isSameCurrency && data.exchangeRate) {
          details[t("exchange_rate", "Exchange Rate")] = data.exchangeRate;
        }

        details[t("total_fees", "Total Fees")] = totalFeesText;
        details[t("ptb_description", "Description")] = formData.description || "N/A";

        if (formData.when === "Scheduled") {
          details[t("schedule_start", "Start Date")] = format(formData.startDate, "MM/dd/yyyy");
          details[t("schedule_often", "How Often")] = {
            1: t("schedule_once", "Once"),
            2: t("schedule_weekly", "Weekly"),
            3: t("schedule_biweekly", "Bi-weekly"),
            4: t("schedule_monthly", "Monthly"),
            5: t("schedule_quarterly", "Quarterly"),
            6: t("schedule_halfyearly", "Half-yearly"),
            7: t("schedule_annual", "Annual"),
          }[formData.howOften];

          if (parseInt(formData.howOften) > 1) {
            details[t("schedule_until", "Until")] =
              formData.until === "Y"
                ? format(formData.endDate, "MM/dd/yyyy")
                : t("schedule_FN", "Further Notice");
          }
        }

        openPreconfirmDialog({
          title: t("ptb_title", "Confirm Bank Transfer"),
          details: details,
          onChange: () => {
            closeDialog();
          },
          onSubmit: () => {
            const accountStr = `${selectedBen.payeeAcctCurr}@@@${selectedBen.payeeBankAccount}@@@${selectedBen.payeeBankBIC}@@@${selectedBen.payeeBankRouting}@@@${selectedBen.payeeName}@@@${selectedBen.payeeNickName}#${selectedBen.payeeNickName}`;

            const payPayload = {
              account: accountStr,
              accountNumber: selectedAccount.ACCOUNTNUMBER,
              toAccNum: selectedBen.payeeBankAccount,
              benBankId: selectedBen.payeeBankBIC,
              benBankName: benBankName,
              benName: selectedBen.payeeName,
              bankRouting: bankRouting,
              fromAccNum: selectedAccount.ACCOUNTNUMBER,
              fromCurrencyCode: selectedAccount.CURCODE,
              toCurrencyCode: selectedBen.payeeAcctCurr,
              currency: formData.currency, // txnCurrencyCode
              amount: formData.amount,
              description: formData.description,
              when: formData.when === "Immediate" ? "Y" : "N",
            };

            if (formData.when === "Immediate") {
              payPayload.startDate = format(new Date(), "MM/dd/yyyy");
              payPayload.endDate = "";
              payPayload.howOften = null;
              payPayload.until = null;
              payPayload.until_select = "N";
            } else {
              payPayload.startDate = format(formData.startDate, "MM/dd/yyyy");
              payPayload.howOften = formData.howOften;
              payPayload.until = null;

              if (parseInt(formData.howOften) > 1) {
                payPayload.until_select = formData.until;
                if (formData.until === "Y") {
                  payPayload.endDate = format(formData.endDate, "MM/dd/yyyy");
                } else {
                  payPayload.endDate = "";
                }
              } else {
                payPayload.until_select = "N";
                payPayload.endDate = "";
              }
            }

            payToBankMutation.mutate(payPayload, {
              onSuccess: () => {
                openSuccessDialog({
                  title: t("ptb_title", "Transfer Successful"),
                  message:
                    "Your bank transfer has been successfully processed.",
                  details: details,
                });
                setFormData({
                  to: "",
                  from: "",
                  amount: "",
                  currency: "XCG",
                  description: "",
                  when: "Immediate",
                  startDate: null,
                  howOften: "",
                  until: "",
                  endDate: null,
                });
                clearAllErrors();
              },
              onError: (err) => {
                openGlobalPopup({
                  title: t("error_title", "Error"),
                  description:
                    err.message || "Failed to process bank transfer.",
                  type: "error",
                });
              },
            });
          },
        });
      },
      onError: (err) => {
        openGlobalPopup({
          title: t("error_title", "Fee Calculation Error"),
          description:
            err.message || "Failed to calculate fees. Please try again.",
          type: "error",
        });
      },
    });
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      <div className="max-w-lg mx-auto rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm p-4 sm:p-8 relative">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-3 sm:gap-0 text-center sm:text-left">
          <button
            onClick={() => setView("manage_scheduled")}
            className="text-xs font-bold text-[#2563eb] hover:underline uppercase tracking-wider"
          >{t("manage_scheduled_transfer2", "Manage Scheduled Transfers")}</button>
          <button
            onClick={() => setView("manage_beneficiaries")}
            className="text-xs font-bold text-[#2563eb] hover:underline uppercase tracking-wider"
          >{t("manage.beneficiaries", "Manage Beneficiaries")}</button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="flex flex-col gap-4">
            <GlobalSelect
              label={t("ptb_account", "To")}
              name="to"
              value={formData.to}
              required
              onChange={(val) => handleSelectChange("to", val)}
              labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
              options={beneficiaryOptions}
              error={errors.to}
            />

            {/* Beneficiary Details Block - Extracted Component */}
            <TransferBeneficiaryDetails
              selectedBen={selectedBen}
              welcomeData={welcomeData}
            />
          </div>

          <GlobalSelect
            label={t("from_account", "From")}
            name="from"
            required
            value={formData.from}
            onChange={(val) => handleSelectChange("from", val)}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={accountOptions}
            error={errors.from}
          />

          <div className="flex flex-col sm:flex-row gap-5">
            <GlobalInput
              label={t("teAmount", "Amount")}
              name="amount"
              required
              type="text"
              maxLength={17}
              onInput={enforceNumericSpace}
              value={formData.amount}
              onChange={handleChange}
              containerClassName="flex-1"
              labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
              error={errors.amount}
            />

            <GlobalSelect
              label={t("currency", "Currency")}
              name="currency"
              required
              value={formData.currency}
              onChange={(val) => handleSelectChange("currency", val)}
              containerClassName="flex-1"
              labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
              options={currencyOptions}
              disabled={isCurrencyDisabled}
              error={errors.currency}
            />
          </div>

          <GlobalInput
            label={t("ptb_description", "Description")}
            name="description"
            type="text"
            maxLength={30}
            onInput={enforceAlphanumericSpace}
            value={formData.description}
            onChange={handleChange}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
          />

          <GlobalSelect
            label={t("schedule_when", "When")}
            name="when"
            required
            value={formData.when}
            onChange={(val) => handleSelectChange("when", val)}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={[
              { value: "Immediate", label: t("schedule_now", "Immediate") },
              { value: "Scheduled", label: "Scheduled" },
            ]}
            error={errors.when}
          />

          <TransferScheduledFields
            formData={formData}
            handleSelectChange={handleSelectChange}
            errors={errors}
          />

          <div className="flex justify-center pt-4 border-t border-dashed border-slate-200 dark:border-white/10 mt-6">
            <GlobalButton
              type="submit"
              variant="primary"
              className="w-full sm:w-auto px-8 text-xs font-bold uppercase tracking-wider h-10"
              isLoading={
                calculateFeesMutation.isPending ||
                payToBankMutation.isPending ||
                isFetchingRouting
              }
            >{t("buttonPayNow", "Submit")}</GlobalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
