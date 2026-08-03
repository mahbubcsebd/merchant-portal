import React, { useState } from "react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { getBankRoutingByBankId } from "@/lib/api/endpoints";
import { useDialog } from "@/components/globals/DialogProvider";
import { useQueryClient } from "@tanstack/react-query";
import BeneficiaryFormFields from "@/components/transfer/BeneficiaryFormFields";
import { Eye, Pencil, Trash2, Search } from "lucide-react";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalButton from "@/components/globals/GlobalButton";

export default function ManageBeneficiaries({ setView: setParentView, setViewData }) {
  const { beneficiariesQuery, createBeneficiaryMutation } = useBeneficiaries();
  const {
    openFormDialog,
    openConfirmDialog,
    openSuccessDialog,
    openPreconfirmDialog,
    openGlobalPopup,
  } = useDialog();
  const { validate } = useFormValidation();
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);

  const getBankName = (bankId) => {
    if (!welcomeData?.metaData?.SETTLEBANK) return bankId;
    const bank = welcomeData.metaData.SETTLEBANK.find(
      (b) => String(b.id) === String(bankId),
    );
    return bank ? bank.title : bankId;
  };

  const getCurrencyLabel = (currencyId) => {
    if (!welcomeData?.metaData?.CURRENCY) return currencyId;
    const curr = welcomeData.metaData.CURRENCY.find(
      (c) => String(c.id) === String(currencyId),
    );
    return curr ? curr.title : currencyId;
  };

  const [searchTerm, setSearchTerm] = useState("");

  const beneficiaries = beneficiariesQuery.data || [];
  const filteredBeneficiaries = beneficiaries.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (b.payeeName && b.payeeName.toLowerCase().includes(term)) ||
      (b.payeeNickName && b.payeeNickName.toLowerCase().includes(term))
    );
  });

  const handleAdd = (initialValues = null) => {
    openFormDialog({
      title: "Add Beneficiary",
      isView: false,
      submitText: "Submit",
      size: "sm:max-w-md",
      disableAutoValidation: true,
      content: <BeneficiaryFormFields data={initialValues} isView={false} />,
      onSave: (values, setErrors) => {
        const fieldsToValidate = [
          {
            name: "payeeName",
            value: values.payeeName,
            label: "Beneficiary Name",
            required: true,
          },
          {
            name: "payeeNickName",
            value: values.payeeNickName,
            label: "Beneficiary Nickname",
            required: true,
          },
          {
            name: "payeeBankAccount",
            value: values.payeeBankAccount,
            label: "Account Number",
            required: true,
          },
          {
            name: "payeeBankId",
            value: values.payeeBankId,
            label: "Bank",
            type: "select",
            required: true,
          },
          {
            name: "payeeAcctCurr",
            value: values.payeeAcctCurr,
            label: "Currency",
            type: "select",
            required: true,
          },
        ];

        const { isValid, errors } = validate(fieldsToValidate);
        if (!isValid) {
          setErrors(errors);
          return false;
        }

        const preconfirmDetails = {
          "Beneficiary Name": values.payeeName,
          Nickname: values.payeeNickName,
          "Account Number": values.payeeBankAccount,
          Bank: getBankName(values.payeeBankId),
          Currency: getCurrencyLabel(values.payeeAcctCurr),
        };

        openPreconfirmDialog({
          title: "Confirm Beneficiary",
          message: "Please review the beneficiary details before submitting.",
          details: preconfirmDetails,
          onChange: () => {
            handleAdd(values);
          },
          onSubmit: async () => {
            try {
              let routing = "";
              try {
                const routingRes = await getBankRoutingByBankId({
                  payeeBankId: values.payeeBankId,
                });
                if (routingRes && typeof routingRes.bankRouting === "string") {
                  routing = routingRes.bankRouting;
                }
              } catch (e) {
                console.warn("Failed to fetch routing number", e);
              }

              const payload = {
                payeeName: values.payeeName,
                payeeNickName: values.payeeNickName,
                payeeBankAccount: values.payeeBankAccount,
                payeeBankId: values.payeeBankId,
                payeeBankRouting: routing,
                payeeAcctCurr: values.payeeAcctCurr,
              };

              const res = await createBeneficiaryMutation.mutateAsync(payload);
              openSuccessDialog({
                title: "Success",
                message: res.message || "Beneficiary created successfully.",
                details: preconfirmDetails,
              });
            } catch (err) {
              openGlobalPopup({
                title: "Error",
                description: err.message || "Failed to create beneficiary.",
                type: "error",
              });
            }
          },
        });

        return false;
      },
    });
  };

  const handleEdit = (b, index) => {
    alert("Update to be implemented later!");
  };

  const handleDelete = (index) => {
    if (confirm("Are you sure you want to delete this beneficiary?")) {
      alert("Delete to be implemented later!");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-4 sm:p-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white px-1 text-base sm:text-lg">
            Beneficiaries
          </h3>
          <GlobalButton
            onClick={handleAdd}
            variant="primary"
            className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider h-10"
          >
            + Add Beneficiary
          </GlobalButton>
        </div>

        <div className="flex flex-col gap-0 border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-transparent">
          {beneficiariesQuery.isLoading ? (
            <div className="p-8 text-center text-slate-500 dark:text-white/50 text-sm">
              Loading beneficiaries...
            </div>
          ) : beneficiariesQuery.isError ? (
            <div className="p-8 text-center text-red-500 text-sm">
              Error loading beneficiaries.
            </div>
          ) : filteredBeneficiaries.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-white/50 text-sm">
              No beneficiaries found.
            </div>
          ) : (
            filteredBeneficiaries.map((b, idx) => (
              <div
                key={b.beneficiaryId || idx}
                className={`flex items-center justify-between p-3 px-3 sm:px-4 ${idx !== filteredBeneficiaries.length - 1 ? "border-b border-slate-200 dark:border-white/10" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-[#1b55ad] dark:text-blue-400 shrink-0">
                    <svg
                      width="20"
                      height="20"
                      className="sm:w-6 sm:h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <circle cx="10" cy="13" r="2"></circle>
                      <path d="M14 17a4 4 0 0 0-8 0"></path>
                    </svg>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white/90 text-sm truncate">
                    {b.payeeName}
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <button
                    onClick={() => {
                      setViewData({
                        name: b.payeeName,
                        nickname: b.payeeNickName,
                        account: b.payeeBankAccount,
                        bank: b.payeeBankBIC,
                        currency: b.payeeAcctCurr,
                      });
                      setParentView("view_beneficiary");
                    }}
                    className="text-slate-400 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors"
                    title="View"
                  >
                    <Eye size={18} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => handleEdit(b, idx)}
                    className="text-slate-400 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={18} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <GlobalButton
            onClick={() => setParentView("transfer")}
            variant="secondary"
            className="w-full sm:w-auto px-8 text-xs font-bold uppercase tracking-wider h-10"
          >
            Back to Transfer
          </GlobalButton>
        </div>
      </div>
    </div>
  );
}
