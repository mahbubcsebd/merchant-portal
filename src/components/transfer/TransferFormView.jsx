import React, { useState, useEffect } from "react";
import GlobalButton from "@/components/globals/GlobalButton";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { useCalculateFees } from "@/hooks/useCalculateFees";
import { usePayToBank } from "@/hooks/usePayToBank";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useDialog } from "@/components/globals/DialogProvider";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { getBankRoutingByBankId } from "@/lib/api/endpoints";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function TransferFormView({ setView }) {
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);

  const { accounts } = useDashboardContext();
  const { beneficiariesQuery } = useBeneficiaries();
  const { calculateFeesMutation } = useCalculateFees();
  const { payToBankMutation } = usePayToBank();
  const {
    openPreconfirmDialog,
    openSuccessDialog,
    openGlobalPopup,
    closeDialog,
  } = useDialog();

  const { errors, validate, clearError, clearAllErrors } = useFormValidation();

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

  const getBankName = (bankId, fallbackName) => {
    if (!bankId) return fallbackName || "N/A";
    if (!welcomeData?.metaData?.SETTLEBANK) return fallbackName || bankId;
    const bank = welcomeData.metaData.SETTLEBANK.find(
      (b) => String(b.id).trim() === String(bankId).trim(),
    );
    return bank ? bank.title : fallbackName || bankId;
  };

  const getCurrencyLabel = (currencyId) => {
    if (!currencyId || String(currencyId) === "0") currencyId = "XCG";
    if (!welcomeData?.metaData?.CURRENCY) return currencyId;
    const curr = welcomeData.metaData.CURRENCY.find(
      (c) => String(c.id) === String(currencyId),
    );
    return curr ? curr.title : currencyId;
  };

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
        label: getCurrencyLabel(selectedAccount.CURCODE),
      });
    } else {
      opts.push({ value: "XCG", label: getCurrencyLabel("XCG") });
    }

    if (
      selectedBen?.payeeAcctCurr &&
      String(selectedBen.payeeAcctCurr) !== "0" &&
      selectedBen.payeeAcctCurr !== (selectedAccount?.CURCODE || "XCG")
    ) {
      const curTitle = getCurrencyLabel(selectedBen.payeeAcctCurr);
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
          selectedBen.payeeBankBIC,
          selectedBen.payeeBankName,
        );

        const details = {
          "From Wallet": fromWalletLabel,
          "Beneficiary Name": selectedBen.payeeName,
          "Bank Name": benBankName,
          "Account No.": selectedBen.payeeBankAccount,
          Amount: `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(parseFloat(formData.amount))} ${currencyOptions.find((c) => c.value === formData.currency)?.label || formData.currency}`,
        };

        if (!isSameCurrency && data.exchangeRate) {
          details["Exchange Rate"] = data.exchangeRate;
        }

        details["Total Fees"] = totalFeesText;
        details["Description"] = formData.description || "N/A";

        if (formData.when === "Scheduled") {
          details["Start Date"] = format(formData.startDate, "MM/dd/yyyy");
          details["How Often"] = {
            1: "Once",
            2: "Weekly",
            3: "Bi-weekly",
            4: "Monthly",
            5: "Quarterly",
            6: "Half-yearly",
            7: "Annual",
          }[formData.howOften];

          if (parseInt(formData.howOften) > 1) {
            details["Until"] =
              formData.until === "Y"
                ? format(formData.endDate, "MM/dd/yyyy")
                : "Further Notice";
          }
        }

        openPreconfirmDialog({
          title: "Confirm Bank Transfer",
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
                  title: "Transfer Successful",
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
                  title: "Error",
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
          title: "Fee Calculation Error",
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
          >
            Manage Scheduled Transfers
          </button>
          <button
            onClick={() => setView("manage_beneficiaries")}
            className="text-xs font-bold text-[#2563eb] hover:underline uppercase tracking-wider"
          >
            Manage Beneficiaries
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5"
        >
          <div className="flex flex-col gap-4">
            <GlobalSelect
              label="To"
              name="to"
              value={formData.to}
              required
              onChange={(val) => handleSelectChange("to", val)}
              labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
              options={beneficiaryOptions}
              error={errors.to}
            />

            {/* Beneficiary Details Block - Refined to match PayBill style */}
            {selectedBen && (
              <div className="bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-white/80">
                    Beneficiary Bank
                  </span>
                  <span className="text-slate-600 dark:text-white/60">
                    {getBankName(
                      selectedBen.payeeBankBIC,
                      selectedBen.payeeBankName,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-white/80">
                    Beneficiary Name
                  </span>
                  <span className="text-slate-600 dark:text-white/60">
                    {selectedBen.payeeName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-white/80">
                    Account No.
                  </span>
                  <span className="text-slate-600 dark:text-white/60">
                    {selectedBen.payeeBankAccount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-white/80">
                    Currency
                  </span>
                  <span className="text-slate-600 dark:text-white/60">
                    {String(selectedBen.payeeAcctCurr) !== "0"
                      ? getCurrencyLabel(selectedBen.payeeAcctCurr)
                      : "XCG"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <GlobalSelect
            label="From"
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
              label="Amount"
              name="amount"
              required
              type="number"
              value={formData.amount}
              onChange={handleChange}
              containerClassName="flex-1"
              labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
              error={errors.amount}
            />

            <GlobalSelect
              label="Currency"
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
            label="Description"
            name="description"
            type="text"
            value={formData.description}
            onChange={handleChange}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
          />

          <GlobalSelect
            label="When"
            name="when"
            required
            value={formData.when}
            onChange={(val) => handleSelectChange("when", val)}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={[
              { value: "Immediate", label: "Immediate" },
              { value: "Scheduled", label: "Scheduled" },
            ]}
            error={errors.when}
          />

          {formData.when === "Scheduled" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl mt-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col">
                <label className="block text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5">
                  Start Date<span className="ml-1 text-[#e65625]">*</span>
                </label>
                <div className="relative w-full flex">
                  <CalendarIcon
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                  />
                  <Popover>
                    <PopoverTrigger
                      type="button"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full pl-10 h-10 text-sm font-medium justify-start text-left bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:ring-1 focus:ring-[#2563eb] rounded-lg transition-all duration-150 shadow-none",
                        !formData.startDate
                          ? "text-slate-400 font-normal"
                          : "text-slate-900 dark:text-white",
                        errors.startDate &&
                          "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
                      )}
                    >
                      {formData.startDate ? (
                        format(formData.startDate, "dd/MM/yyyy")
                      ) : (
                        <span>dd/mm/yyyy</span>
                      )}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => {
                          handleSelectChange("startDate", date);
                        }}
                        disabled={(date) =>
                          date < new Date().setHours(0, 0, 0, 0)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.startDate && (
                  <p className="mt-1.5 text-xs font-semibold flex items-center gap-1.5 text-red-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <GlobalSelect
                label="How Often"
                name="howOften"
                required
                value={formData.howOften}
                onChange={(val) => handleSelectChange("howOften", val)}
                labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
                options={[
                  { value: "1", label: "Once" },
                  { value: "2", label: "Weekly" },
                  { value: "3", label: "Bi-weekly" },
                  { value: "4", label: "Monthly" },
                  { value: "5", label: "Quarterly" },
                  { value: "6", label: "Half-yearly" },
                  { value: "7", label: "Annual" },
                ]}
                error={errors.howOften}
              />

              {parseInt(formData.howOften) > 1 && (
                <>
                  <GlobalSelect
                    label="Until"
                    name="until"
                    required
                    value={formData.until}
                    onChange={(val) => handleSelectChange("until", val)}
                    labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
                    options={[
                      { value: "N", label: "Further Notice" },
                      { value: "Y", label: "Specified Date" },
                    ]}
                    error={errors.until}
                  />

                  {formData.until === "Y" && (
                    <div className="flex flex-col">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5">
                        End Date<span className="ml-1 text-[#e65625]">*</span>
                      </label>
                      <div className="relative w-full flex">
                        <CalendarIcon
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                        />
                        <Popover>
                          <PopoverTrigger
                            type="button"
                            className={cn(
                              buttonVariants({ variant: "outline" }),
                              "w-full pl-10 h-10 text-sm font-medium justify-start text-left bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:ring-1 focus:ring-[#2563eb] rounded-lg transition-all duration-150 shadow-none",
                              !formData.endDate
                                ? "text-slate-400 font-normal"
                                : "text-slate-900 dark:text-white",
                              errors.endDate &&
                                "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
                            )}
                          >
                            {formData.endDate ? (
                              format(formData.endDate, "dd/MM/yyyy")
                            ) : (
                              <span>dd/mm/yyyy</span>
                            )}
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.endDate}
                              onSelect={(date) => {
                                handleSelectChange("endDate", date);
                              }}
                              disabled={(date) =>
                                date < new Date().setHours(0, 0, 0, 0) ||
                                (formData.startDate &&
                                  date <= formData.startDate)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      {errors.endDate && (
                        <p className="mt-1.5 text-xs font-semibold flex items-center gap-1.5 text-red-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          {errors.endDate}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

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
            >
              Submit
            </GlobalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
