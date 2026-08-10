import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import GlobalButton from "@/components/globals/GlobalButton";
import { useDashboardContext } from "@/pages/dashboard/context";
import { usePayBills } from "@/hooks/usePayBills";
import { useCalculateFees } from "@/hooks/useCalculateFees";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useDialog } from "@/components/globals/DialogProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/components/globals/LanguageProvider";
import {
  enforceNumericSpace,
  enforceAlphanumericSpace,
} from "@/lib/utils/inputFormatters";

export default function PayBillsPage() {
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);
  const { t } = useLanguage();

  const { accounts } = useDashboardContext();
  const { userBillersQuery, getBillerDetailsMutation, payBillsMutation } =
    usePayBills();
  const { calculateFeesMutation } = useCalculateFees();
  const {
    openPreconfirmDialog,
    openSuccessDialog,
    openGlobalPopup,
    closeDialog,
  } = useDialog();

  const { errors, validate, clearError, clearAllErrors } = useFormValidation();

  const [biller, setBiller] = useState("");
  const [billerDetails, setBillerDetails] = useState(null);
  const [fromAccount, setFromAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [when, setWhen] = useState("immediate");

  // Format accounts for dropdown
  const accountOptions = (accounts || []).map((acc) => ({
    value: acc.ACCOUNTNUMBER,
    label: `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(parseFloat(acc.AVBALANCE || "0"))} ${acc.CURSHRTNAME || acc.CURCODE}`,
    raw: acc,
  }));

  // Format billers for dropdown
  const billerOptions = (userBillersQuery.data || []).map((b) => ({
    value: String(b.BILLID),
    label: b.BILLNAME,
  }));

  // Fetch biller details when biller changes
  useEffect(() => {
    if (biller) {
      getBillerDetailsMutation.mutate(biller, {
        onSuccess: (data) => {
          setBillerDetails(data);
        },
        onError: () => {
          setBillerDetails(null);
        },
      });
    } else {
      setBillerDetails(null);
    }
  }, [biller]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = validate([
      {
        name: "biller",
        value: biller,
        label: t("bp_to", "To"),
        type: "select",
        required: true,
      },
      {
        name: "fromAccount",
        value: fromAccount,
        label: t("from_account", "From Account"),
        type: "select",
        required: true,
      },
      {
        name: "amount",
        value: amount,
        label: t("bp_amount", "Amount"),
        type: "input",
        required: true,
        customValidation: (val) =>
          parseFloat(val) <= 0
            ? "Please enter a valid amount greater than 0."
            : null,
      },
      {
        name: "when",
        value: when,
        label: t("schedule_when", "When"),
        type: "select",
        required: true,
      },
    ]);

    if (!isValid) return;

    const selectedAccount = accounts?.find(
      (a) => a.ACCOUNTNUMBER === fromAccount,
    );
    if (!selectedAccount) return;

    // Call calculateFees API
    const feePayload = {
      functionalityID: "P7",
      fromCurrencyCode: selectedAccount.CURCODE,
      toCurrencyCode: billerDetails.currency,
      sendingAmount: amount,
      transactionCode: "PAYBILL",
    };

    calculateFeesMutation.mutate(feePayload, {
      onSuccess: (data) => {
        // Build details for preconfirmation
        const isSameCurrency =
          selectedAccount.CURCODE == billerDetails.currency;
        const exchangeRateText = isSameCurrency ? "N/A" : data.exchangeRate;
        const totalFeesText =
          data.totalFees != null
            ? `${data.totalFees} ${data.fromCurrencyName || selectedAccount.CURSHRTNAME}`
            : "0.00";

        const selectedBillerLabel = billerOptions.find(
          (o) => o.value === biller,
        )?.label;
        const fromWalletLabel = accountOptions.find(
          (o) => o.value === fromAccount,
        )?.label;

        const currencyLabel =
          welcomeData?.metaData?.CURRENCY?.find(
            (c) => String(c.id) === String(billerDetails.currency),
          )?.title ||
          billerDetails.currencyName ||
          "XCG";

        const details = {
          [t("from_account", "From Account")]: fromWalletLabel,
          [t("bp_to", "To")]: selectedBillerLabel,
          [t("bp_tpBillerName", "Biller Name")]: billerDetails.billerName,
          [t("bp_ref1", "Reference No")]: billerDetails.referenceNo,
          [t("bp_amount", "Amount")]:
            `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(parseFloat(amount))} ${currencyLabel}`,
          "Exchange Rate": exchangeRateText,
          "Total Fees": totalFeesText,
          [t("bp_desc", "Description")]: description || "N/A",
        };

        openPreconfirmDialog({
          title: t("confirm_payment", "Confirm Payment"),
          details: details,
          onChange: () => {
            closeDialog();
          },
          onSubmit: () => {
            // Call payBills API
            const payPayload = {
              accountNumber: fromAccount,
              amount: amount,
              billId: biller,
              coordLat: "1.1",
              coordLong: "1.1",
              currency: selectedAccount.CURCODE,
              custType: "C",
              description: description,
              endDate: "",
              fromAccNum: fromAccount,
              fromCurrencyCode: selectedAccount.CURCODE,
              howOften: "",
              referenceNumber: billerDetails.referenceNo,
              startDate: new Date().toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }),
              toCurrencyCode: billerDetails.currency,
              until: "",
              when: "Y",
            };

            payBillsMutation.mutate(payPayload, {
              onSuccess: () => {
                openSuccessDialog({
                  title: t("payment_successful", "Payment Successful"),
                  message: "Your bill payment has been successfully processed.",
                  details: details,
                });
                // Reset form
                setAmount("");
                setDescription("");
                setBiller("");
              },
              onError: (err) => {
                openGlobalPopup({
                  title: t("error_title", "Error"),
                  description: err.message || "Failed to process bill payment.",
                  type: "error",
                });
              },
            });
          },
        });
      },
      onError: (err) => {
        openGlobalPopup({
          title: t("error_title", "Error calculating fees"),
          description:
            err.message ||
            "An error occurred while calculating transaction fees.",
          type: "error",
        });
      },
    });
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Bill Payments
        </h2>
      </div>

      {/* Main card */}
      <div className="max-w-lg mx-auto rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm p-4 sm:p-8">
        <div className="flex justify-start mb-4">
          <Link
            to="/dashboard/pay-bills/templates"
            className="text-xs font-bold text-[#2563eb] hover:underline uppercase tracking-wider"
          >
            Manage Bill Template
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* To (Biller) */}
          <GlobalSelect
            label={t("ptb_account", "To")}
            value={biller}
            onChange={(val) => {
              setBiller(val);
              clearError("biller");
            }}
            required
            error={errors.biller}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={billerOptions}
            disabled={userBillersQuery.isLoading}
          />

          {/* Biller Details (Shows when a biller is selected) */}
          {billerDetails && (
            <div className="bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-white/80">
                  {t("bp_tpBillerName", "Biller Name")}
                </span>
                <span className="text-slate-600 dark:text-white/60">
                  {billerDetails.billerName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-white/80">
                  {t("bp_ref1", "Reference No")}
                </span>
                <span className="text-slate-600 dark:text-white/60">
                  {billerDetails.referenceNo}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-white/80">
                  {t("bp_currency", "Currency")}
                </span>
                <span className="text-slate-600 dark:text-white/60">
                  {welcomeData?.metaData?.CURRENCY?.find(
                    (c) => String(c.id) === String(billerDetails.currency),
                  )?.title ||
                    billerDetails.currencyName ||
                    billerDetails.currency}
                </span>
              </div>
            </div>
          )}

          {/* From Account */}
          <GlobalSelect
            label={t("from_account", "From Account")}
            value={fromAccount}
            onChange={(val) => {
              setFromAccount(val);
              clearError("fromAccount");
            }}
            required
            error={errors.fromAccount}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={accountOptions}
          />

          {/* Amount */}
          <GlobalInput
            label={t("bp_amount", "Amount")}
            type="text"
            inputMode="decimal"
            maxLength={17}
            placeholder="0.00"
            value={amount}
            error={errors.amount}
            onInput={enforceNumericSpace}
            required
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, "");
              setAmount(val);
              clearError("amount");
            }}
            rightElement={
              <span className="text-sm font-medium text-slate-400 select-none">
                {welcomeData?.metaData?.CURRENCY?.find(
                  (c) => String(c.id) === String(billerDetails?.currency),
                )?.title ||
                  billerDetails?.currencyName ||
                  accounts?.find((a) => a.ACCOUNTNUMBER === fromAccount)
                    ?.CURSHRTNAME ||
                  "XCG"}
              </span>
            }
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
          />

          {/* Description */}
          <GlobalInput
            label={t("bp_desc", "Description")}
            type="text"
            maxLength={30}
            placeholder={t("bp_desc", "Description")}
            value={description}
            onInput={enforceAlphanumericSpace}
            onChange={(e) => setDescription(e.target.value)}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
          />

          {/* When */}
          <GlobalSelect
            label={t("schedule_when", "When")}
            value={when}
            onChange={(val) => {
              setWhen(val);
              clearError("when");
            }}
            required
            error={errors.when}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={[
              { value: "immediate", label: t("schedule_now", "Pay Now") },
            ]}
          />

          {/* Submit */}
          <div className="flex justify-center pt-4 border-t border-dashed border-slate-200 dark:border-white/10 mt-6">
            <GlobalButton
              type="submit"
              variant="primary"
              className="w-full sm:w-auto px-8 text-xs font-bold uppercase tracking-wider h-10"
              isLoading={
                calculateFeesMutation.isPending || payBillsMutation.isPending
              }
            >
              {t("buttonSubmit", "Submit")}
            </GlobalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
