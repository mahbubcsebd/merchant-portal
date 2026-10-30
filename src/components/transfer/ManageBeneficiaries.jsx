import React, { useState, useMemo } from "react";
import { getBankName, getCurrencyLabel } from "@/lib/utils/TransferUtils";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { getBankRoutingByBankId } from "@/lib/api/endpoints";
import { useDialog } from "@/components/globals/DialogProvider";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { welcomeApi } from "@/lib/api/endpoints";
import BeneficiaryFormFields from "@/components/transfer/BeneficiaryFormFields";
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Plus,
  ArrowLeft,
  Building2,
  CreditCard,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalButton from "@/components/globals/GlobalButton";
import GlobalPagination from "@/components/globals/GlobalPagination";
import { useLanguage } from "@/components/globals/LanguageProvider";

export default function ManageBeneficiaries({
  setView: setParentView,
  setViewData,
}) {
  const { t } = useLanguage();
  const {
    beneficiariesQuery,
    createBeneficiaryMutation,
    updateBeneficiaryMutation,
    deleteBeneficiaryMutation,
  } = useBeneficiaries();
  const {
    openFormDialog,
    openPreconfirmDialog,
    openSuccessDialog,
    openGlobalPopup,
    openDetailDialog,
    closeDialog,
  } = useDialog();
  const { validate } = useFormValidation();
  const queryClient = useQueryClient();

  const { data: welcomeData } = useQuery({
    queryKey: ["welcome"],
    queryFn: welcomeApi,
    staleTime: Infinity,
    initialData: () => queryClient.getQueryData(["welcome"]),
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const beneficiaries = beneficiariesQuery.data || [];

  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const name = (b.payeeName || "").toLowerCase();
      const nick = (b.payeeNickName || "").toLowerCase();
      const acct = (b.payeeBankAccount || "").toLowerCase();
      const bank = getBankName(
        welcomeData,
        b.payeeBankBIC,
        b.payeeBankName,
      ).toLowerCase();
      return (
        name.includes(term) ||
        nick.includes(term) ||
        acct.includes(term) ||
        bank.includes(term)
      );
    });
  }, [beneficiaries, searchTerm, welcomeData]);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalRecords = filteredBeneficiaries.length;
  const paginatedBeneficiaries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBeneficiaries.slice(start, start + pageSize);
  }, [filteredBeneficiaries, currentPage, pageSize]);

  const openBeneficiaryForm = (
    initialValues = null,
    isEdit = false,
    originalBeneficiary = null,
  ) => {
    openFormDialog({
      title: isEdit
        ? t("edit_beneficiary", "Edit Beneficiary")
        : t("add_beneficiary", "Add Beneficiary"),
      isView: false,
      submitText: t("buttonSubmit", t("submit", "Submit")),
      size: "sm:max-w-md",
      disableAutoValidation: true,
      content: (
        <BeneficiaryFormFields
          data={initialValues}
          isView={false}
          isEditMode={isEdit}
        />
      ),
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
          [t("add_ben_firstLast", "Beneficiary Name")]: values.payeeName,
          [t("add_ben_nickname", "Nickname")]: values.payeeNickName,
          [t("add_ben_accNo", "Account Number")]: values.payeeBankAccount,
          [t("add_ben_bank", "Bank")]: getBankName(
            welcomeData,
            values.payeeBankId,
          ),
          [t("add_ben_currency", "Currency")]: getCurrencyLabel(
            welcomeData,
            values.payeeAcctCurr,
          ),
        };

        openPreconfirmDialog({
          title: isEdit
            ? t("edit.beneficiary", "Confirm Edit")
            : t("register.beneficiary", "Confirm Beneficiary"),
          message: isEdit
            ? "Please review the updated details before submitting."
            : "Please review the beneficiary details before submitting.",
          details: preconfirmDetails,
          onChange: () => {
            openBeneficiaryForm(values, isEdit, originalBeneficiary);
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

              let payload;
              if (isEdit) {
                payload = {
                  payeeBankAccount: originalBeneficiary.payeeBankAccount,
                  payeeBankId: originalBeneficiary.payeeBankBIC,
                  payeeBankAccountUpd: values.payeeBankAccount,
                  payeeBankIdUpd: values.payeeBankId,
                  payeeBankRouting: routing,
                  payeeName: values.payeeName,
                  payeeNickName: values.payeeNickName,
                  payeeAcctCurr: values.payeeAcctCurr,
                };
              } else {
                payload = {
                  payeeName: values.payeeName,
                  payeeNickName: values.payeeNickName,
                  payeeBankAccount: values.payeeBankAccount,
                  payeeBankId: values.payeeBankId,
                  payeeBankRouting: routing,
                  payeeAcctCurr: values.payeeAcctCurr,
                };
              }

              const mutation = isEdit
                ? updateBeneficiaryMutation
                : createBeneficiaryMutation;
              const res = await mutation.mutateAsync(payload);

              openSuccessDialog({
                title: "Success",
                message:
                  res.message ||
                  (isEdit
                    ? "Beneficiary updated successfully."
                    : "Beneficiary created successfully."),
                details: preconfirmDetails,
              });
            } catch (err) {
              openGlobalPopup({
                title: "Error",
                description:
                  err.message ||
                  (isEdit
                    ? "Failed to update beneficiary."
                    : "Failed to create beneficiary."),
                type: "error",
              });
            }
          },
        });

        return false;
      },
    });
  };

  const handleAdd = (initialValues = null) =>
    openBeneficiaryForm(initialValues, false);

  const handleEdit = (b) => {
    openBeneficiaryForm(
      {
        payeeName: b.payeeName,
        payeeNickName: b.payeeNickName,
        payeeBankAccount: b.payeeBankAccount,
        payeeBankId: b.payeeBankBIC,
        payeeAcctCurr: b.payeeAcctCurr,
      },
      true,
      b,
    );
  };

  const handleView = (b) => {
    openDetailDialog({
      title: t("view_beneficiary", "View Beneficiary"),
      details: [
        {
          label: t("beneficiary_name", "Beneficiary Name"),
          value: b.payeeName,
        },
        {
          label: t("beneficiary_nickname", "Nickname"),
          value: b.payeeNickName || "—",
        },
        {
          label: t("account_number", "Account Number"),
          value: b.payeeBankAccount,
        },
        {
          label: t("bank_name", "Bank"),
          value: getBankName(welcomeData, b.payeeBankBIC, b.payeeBankName),
        },
        {
          label: t("currency", "Currency"),
          value:
            String(b.payeeAcctCurr) !== "0" && b.payeeAcctCurr
              ? getCurrencyLabel(welcomeData, b.payeeAcctCurr)
              : "XCG",
        },
      ],
      doneText: t("buttonsClose", t("close", "Close")),
    });
  };

  const handleDelete = (beneficiary) => {
    const details = {
      [t("add_ben_firstLast", "Beneficiary Name")]: beneficiary.payeeName,
      [t("add_ben_nickname", "Nickname")]: beneficiary.payeeNickName,
      [t("add_ben_accNo", "Account Number")]: beneficiary.payeeBankAccount,
      [t("add_ben_bank", "Bank")]: getBankName(
        welcomeData,
        beneficiary.payeeBankBIC,
        beneficiary.payeeBankName,
      ),
      [t("add_ben_currency", "Currency")]: getCurrencyLabel(
        welcomeData,
        beneficiary.payeeAcctCurr,
      ),
    };

    openPreconfirmDialog({
      title: t("delete_beneficiary_title", "Delete Beneficiary?"),
      message: `Are you sure you want to delete ${beneficiary.payeeName}? This action cannot be undone.`,
      details,
      confirmText: t("buttonsDelete", t("delete", "Delete")),
      iconType: "danger",
      onChange: () => closeDialog(),
      onSubmit: async () => {
        try {
          const payload = {
            payeeBankAccount: beneficiary.payeeBankAccount,
            payeeBankBIC: beneficiary.payeeBankBIC,
          };
          const res = await deleteBeneficiaryMutation.mutateAsync(payload);
          openSuccessDialog({
            title: t("success", "Success"),
            message: res.message || "Beneficiary deleted successfully.",
            details,
          });
        } catch (err) {
          openGlobalPopup({
            title: t("error", "Error"),
            description: err.message || "Failed to delete beneficiary.",
            type: "error",
          });
        }
      },
    });
  };

  // Helper for avatar initials
  const getInitials = (name) => {
    if (!name) return "BN";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* ── Top Bar with Back Button & Breadcrumb Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setParentView("transfer")}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm group"
            title={t("back_to_transfer", "Back to Transfer")}
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-white/40 uppercase tracking-wider">
              <span>{t("transfer_to_bank", "Transfer To Bank")}</span>
              <span>/</span>
              <span className="text-[#2563eb] dark:text-blue-400">
                {t("beneficiaries", "Beneficiaries")}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t("manage.beneficiaries", "Manage Beneficiaries")}
            </h3>
          </div>
        </div>

        <GlobalButton
          onClick={() => handleAdd()}
          variant="primary"
          className="h-10 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} />
          {t("add_beneficiary", "Add Beneficiary")}
        </GlobalButton>
      </div>

      {/* ── Summary & Search Bar Card ── */}
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-[#2563eb] dark:text-blue-400 shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-white/50">
              {t("total_registered", "Registered Beneficiaries")}
            </p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
              {beneficiaries.length}
              <span className="text-xs font-medium text-slate-400 dark:text-white/40 ml-1.5">
                {beneficiaries.length === 1 ? "account" : "accounts"}
              </span>
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="w-full md:w-80">
          <GlobalInput
            placeholder={t("search_beneficiary_ph", "Search by name, bank, account...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} className="text-slate-400" />}
            className="h-10 text-xs"
          />
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
        {beneficiariesQuery.isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-white/40">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">
              {t("loading_beneficiaries", "Loading beneficiaries...")}
            </p>
          </div>
        ) : beneficiariesQuery.isError ? (
          <div className="py-16 text-center text-red-500 text-sm">
            {t("error_loading_beneficiaries", "Error loading beneficiaries.")}
          </div>
        ) : filteredBeneficiaries.length === 0 ? (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-white/30 mb-4">
              <Building2 size={26} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {searchTerm
                ? t("no_matching_beneficiaries", "No matching beneficiaries found")
                : t("no_beneficiaries_yet", "No beneficiaries added yet")}
            </h4>
            <p className="text-xs text-slate-500 dark:text-white/50 max-w-sm mb-5">
              {searchTerm
                ? t("try_different_search", "Try searching with a different term or clear the search.")
                : t("add_first_beneficiary_hint", "Add your first bank beneficiary to start transferring funds quickly and safely.")}
            </p>
            {searchTerm ? (
              <GlobalButton
                variant="secondary"
                onClick={() => setSearchTerm("")}
                className="h-9 px-4 text-xs font-bold uppercase tracking-wider"
              >
                {t("clear_search", "Clear Search")}
              </GlobalButton>
            ) : (
              <GlobalButton
                variant="primary"
                onClick={() => handleAdd()}
                className="h-9 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus size={15} />
                {t("add_beneficiary", "Add Beneficiary")}
              </GlobalButton>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider">
                      {t("beneficiary", "Beneficiary")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider">
                      {t("bank_name", "Bank")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider">
                      {t("account_number", "Account Number")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider text-center">
                      {t("currency", "Currency")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider text-right">
                      {t("actions", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {paginatedBeneficiaries.map((b, idx) => {
                    const bankName = getBankName(
                      welcomeData,
                      b.payeeBankBIC,
                      b.payeeBankName,
                    );
                    const currLabel =
                      String(b.payeeAcctCurr) !== "0" && b.payeeAcctCurr
                        ? getCurrencyLabel(welcomeData, b.payeeAcctCurr)
                        : "XCG";
                    const initials = getInitials(b.payeeName);

                    return (
                      <tr
                        key={b.beneficiaryId || b.payeeBankAccount || idx}
                        className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Beneficiary Name + Nickname + Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-[#2563eb] dark:group-hover:text-blue-400 transition-colors">
                                {b.payeeName}
                              </p>
                              {b.payeeNickName && (
                                <p className="text-xs text-slate-400 dark:text-white/40 truncate">
                                  {b.payeeNickName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Bank Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-white/80">
                            <Building2
                              size={15}
                              className="text-slate-400 dark:text-white/40 shrink-0"
                            />
                            <span className="font-semibold text-xs sm:text-sm truncate max-w-[200px]">
                              {bankName}
                            </span>
                          </div>
                        </td>

                        {/* Account Number */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 font-mono text-xs font-semibold text-slate-800 dark:text-white/90">
                            <CreditCard size={13} className="text-slate-400" />
                            {b.payeeBankAccount}
                          </span>
                        </td>

                        {/* Currency badge */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20">
                            {currLabel}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleView(b)}
                              className="w-8 h-8 rounded-lg border border-slate-200/70 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 bg-white dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-500 hover:text-blue-600 dark:text-white/60 dark:hover:text-blue-400 flex items-center justify-center transition-all shadow-2xs"
                              title={t("view", "View")}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleEdit(b)}
                              className="w-8 h-8 rounded-lg border border-slate-200/70 dark:border-white/10 hover:border-amber-200 dark:hover:border-amber-500/30 bg-white dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-500 hover:text-amber-600 dark:text-white/60 dark:hover:text-amber-400 flex items-center justify-center transition-all shadow-2xs"
                              title={t("edit", "Edit")}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(b)}
                              className="w-8 h-8 rounded-lg border border-slate-200/70 dark:border-white/10 hover:border-red-200 dark:hover:border-red-500/30 bg-white dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-600 dark:text-white/60 dark:hover:text-red-400 flex items-center justify-center transition-all shadow-2xs"
                              title={t("delete", "Delete")}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Feed */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5">
              {paginatedBeneficiaries.map((b, idx) => {
                const bankName = getBankName(
                  welcomeData,
                  b.payeeBankBIC,
                  b.payeeBankName,
                );
                const currLabel =
                  String(b.payeeAcctCurr) !== "0" && b.payeeAcctCurr
                    ? getCurrencyLabel(welcomeData, b.payeeAcctCurr)
                    : "XCG";
                const initials = getInitials(b.payeeName);

                return (
                  <div
                    key={`mobile-${b.beneficiaryId || b.payeeBankAccount || idx}`}
                    className="p-4 flex flex-col gap-3.5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Header: Avatar, Name, Currency */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {b.payeeName}
                          </h4>
                          {b.payeeNickName && (
                            <p className="text-xs text-slate-400 dark:text-white/40 truncate">
                              {b.payeeNickName}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20">
                        {currLabel}
                      </span>
                    </div>

                    {/* Bank & Account info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50/70 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2
                          size={14}
                          className="text-slate-400 dark:text-white/40 shrink-0"
                        />
                        <span className="text-slate-600 dark:text-white/70 truncate font-medium">
                          {bankName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-slate-800 dark:text-white/90 font-semibold">
                        <CreditCard
                          size={14}
                          className="text-slate-400 dark:text-white/40 shrink-0"
                        />
                        <span className="truncate">{b.payeeBankAccount}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleView(b)}
                        className="px-3 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-white/70 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Eye size={14} />
                        {t("view", "View")}
                      </button>
                      <button
                        onClick={() => handleEdit(b)}
                        className="px-3 h-8 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-white/70 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Pencil size={14} />
                        {t("edit", "Edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        className="px-3 h-8 rounded-lg border border-red-200/80 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 size={14} />
                        {t("delete", "Delete")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalRecords > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-transparent">
                <GlobalPagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalRecords={totalRecords}
                  currentCount={paginatedBeneficiaries.length}
                  onPageChange={(page) => setCurrentPage(page)}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
