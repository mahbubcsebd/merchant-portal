import React, { useState, useMemo } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Receipt,
  Search,
  Plus,
  ArrowLeft,
  Building2,
  Hash,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDialog } from "@/components/globals/DialogProvider";
import GlobalButton from "@/components/globals/GlobalButton";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalPagination from "@/components/globals/GlobalPagination";
import BillerTemplateFormFields from "@/components/pay-bills/BillerTemplateFormFields";
import { getCurrencyLabel } from "@/lib/utils/TransferUtils";
import { usePayBills } from "@/hooks/usePayBills";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/components/globals/LanguageProvider";

export default function ManageBillTemplatesPage() {
  const {
    openFormDialog,
    openDetailDialog,
    openPreconfirmDialog,
    openSuccessDialog,
    openGlobalPopup,
    closeDialog,
  } = useDialog();
  const {
    userBillersQuery,
    createBillTemplateMutation,
    updateBillTemplateMutation,
    deleteBillTemplateMutation,
  } = usePayBills();
  const queryClient = useQueryClient();
  const welcomeData = queryClient.getQueryData(["welcome"]);
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const templates = useMemo(() => {
    return (userBillersQuery.data || []).map((b, index) => ({
      id: b.BILLID || index,
      billerId: b.BILLERID,
      billerName: b.BLRDESC || b.BILLERNAME || "Unknown",
      templateName: b.BILLNAME || "Template",
      referenceNo: b.REFNUM || b.REFNO || b.REFERENCE || "",
      currency: b.CURRENCY || b.BILLCUR || b.BLRWALCUR || "N/A",
      raw: b,
    }));
  }, [userBillersQuery.data]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const name = String(template.templateName || "").toLowerCase();
      const biller = String(template.billerName || "").toLowerCase();
      const ref = String(template.referenceNo || "").toLowerCase();
      const curr = String(getCurrencyLabel(welcomeData, template.currency) || "").toLowerCase();

      return (
        name.includes(term) ||
        biller.includes(term) ||
        ref.includes(term) ||
        curr.includes(term)
      );
    });
  }, [templates, searchTerm, welcomeData]);

  // Reset page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalRecords = filteredTemplates.length;
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTemplates.slice(start, start + pageSize);
  }, [filteredTemplates, currentPage, pageSize]);

  const handleViewClick = (template) => {
    openDetailDialog({
      title: t("view_bill_template", "View Bill Template"),
      details: [
        {
          label: t("bp_tpBillerName", "Biller Name"),
          value: template.billerName,
        },
        {
          label: t("bp_tpName1", "Template Name"),
          value: template.templateName,
        },
        {
          label: t("bp_ref1", "Reference No"),
          value: template.referenceNo,
        },
        {
          label: t("bp_currency", "Currency"),
          value: getCurrencyLabel(welcomeData, template.currency),
        },
      ],
      doneText: t("button_close", "Close"),
    });
  };

  const handleDeleteClick = (template) => {
    openPreconfirmDialog({
      title: t("delete_template_title", "Delete Template?"),
      description: `Are you sure you want to delete ${template.templateName}? This action cannot be undone.`,
      details: {
        [t("bp_tpBillerName", "Biller Name")]: template.billerName,
        [t("bp_tpName1", "Template Name")]: template.templateName,
        [t("bp_ref1", "Reference No")]: template.referenceNo,
        [t("bp_currency", "Currency")]: getCurrencyLabel(welcomeData, template.currency),
      },
      confirmText: t("button_delete", "Delete"),
      iconType: "danger",
      onChange: () => closeDialog(),
      onSubmit: () => {
        deleteBillTemplateMutation.mutate(
          { billId: template.id },
          {
            onSuccess: () => {
              openSuccessDialog({
                title: t("delete.templates", "Delete Bill Template"),
                message: t("delete.templates_success", "Deleted Bill Template successfully."),
              });
            },
            onError: (err) => {
              openGlobalPopup({
                title: t("error_title", "Error"),
                description: err.message || "Failed to delete template.",
                type: "error",
              });
            },
          },
        );
      },
    });
  };

  const handleAddClick = (initialValues = null) => {
    const isEdit = !!initialValues?.id;
    const billerTitle = initialValues?.billerName || "Unknown";

    openFormDialog({
      title: isEdit ? t("edit_bill_template", "Edit Bill Template") : t("create.bill_template", "Create Bill Template"),
      isView: false,
      submitText: isEdit ? t("button_save_changes", "Save Changes") : t("button_create", "Create"),
      size: "sm:max-w-md",
      content: <BillerTemplateFormFields data={initialValues} isView={false} />,
      onSave: (values) => {
        openPreconfirmDialog({
          title: t("confirm_template", "Confirm Template"),
          details: {
            [t("bp_tpBillerName", "Biller Name")]: billerTitle,
            [t("bp_tpName1", "Template Name")]: values.billName,
            [t("bp_ref1", "Reference No")]: values.refNum,
            [t("bp_currency", "Currency")]: getCurrencyLabel(
              welcomeData,
              values.currency,
            ),
          },
          onChange: () => {
            handleAddClick(values);
          },
          onSubmit: () => {
            const payload = {
              billerId: values.billerId,
              billName: values.billName,
              refNum: values.refNum,
              currency: values.currency,
              billerName: values.billerName,
            };

            const mutation = isEdit
              ? updateBillTemplateMutation
              : createBillTemplateMutation;
            if (isEdit) payload.billId = initialValues.id;

            mutation.mutate(payload, {
              onSuccess: () => {
                openSuccessDialog({
                  title: isEdit
                    ? t("template_updated", "Template Updated")
                    : t("template_created", "Template Created"),
                  message: `Your bill template has been successfully ${isEdit ? "updated" : "created"}.`,
                  details: {
                    [t("bp_tpName1", "Template Name")]: values.billName,
                    [t("bp_tpBillerName", "Biller Name")]: billerTitle,
                    [t("bp_ref1", "Reference No")]: values.refNum,
                    [t("bp_currency", "Currency")]: getCurrencyLabel(
                      welcomeData,
                      values.currency,
                    ),
                  },
                });
              },
              onError: (err) => {
                openGlobalPopup({
                  title: t("error_title", "Error"),
                  description:
                    err.message ||
                    `Failed to ${isEdit ? "update" : "create"} bill template.`,
                  type: "error",
                });
              },
            });
          },
        });

        return false;
      },
    });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 pb-10">
      {/* ── Top Header Navigation Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/pay-bills"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm group"
            title={t("back_to_pay_bills", "Back to Pay Bills")}
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-white/40 uppercase tracking-wider">
              <span>{t("pay_bills", "Pay Bills")}</span>
              <span>/</span>
              <span className="text-[#2563eb] dark:text-blue-400">
                {t("templates", "Templates")}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t("manage.templates", "Manage Bill Templates")}
            </h3>
          </div>
        </div>

        <GlobalButton
          onClick={() => handleAddClick()}
          variant="primary"
          className="h-10 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} />
          {t("create.bill_template", "Create Bill Template")}
        </GlobalButton>
      </div>

      {/* ── Summary & Search Bar Card ── */}
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-[#2563eb] dark:text-blue-400 shrink-0">
            <Receipt size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-white/50">
              {t("total_templates", "Saved Bill Templates")}
            </p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
              {templates.length}
              <span className="text-xs font-medium text-slate-400 dark:text-white/40 ml-1.5">
                {templates.length === 1 ? "template" : "templates"}
              </span>
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="w-full md:w-80">
          <GlobalInput
            placeholder={t("search_template_ph", "Search by template, biller, ref...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} className="text-slate-400" />}
            className="h-10 text-xs"
          />
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
        {userBillersQuery.isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-white/40">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">
              {t("loading_templates", "Loading bill templates...")}
            </p>
          </div>
        ) : userBillersQuery.isError ? (
          <div className="py-16 text-center text-red-500 text-sm">
            {t("error_loading_templates", "Error loading bill templates.")}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-white/30 mb-4">
              <Receipt size={26} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {searchTerm
                ? t("no_matching_templates", "No matching templates found")
                : t("no_templates_yet", "No bill templates found")}
            </h4>
            <p className="text-xs text-slate-500 dark:text-white/50 max-w-sm mb-5">
              {searchTerm
                ? t("try_different_search", "Try searching with a different term or clear the search.")
                : t("create_first_template_hint", "Create your first template to save your frequent utility and service payments.")}
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
                onClick={() => handleAddClick()}
                className="h-9 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus size={15} />
                {t("create.bill_template", "Create Bill Template")}
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
                      {t("bp_tpName1", "Template Name")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider">
                      {t("bp_tpBillerName", "Biller Name")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider">
                      {t("bp_ref1", "Reference No")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider text-center">
                      {t("bp_currency", "Currency")}
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider text-right">
                      {t("action", "Action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {paginatedTemplates.map((template, idx) => (
                    <tr
                      key={template.id}
                      className={`${
                        idx % 2 === 0
                          ? "bg-white dark:bg-transparent"
                          : "bg-blue-50/50 dark:bg-white/[0.02]"
                      } hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group`}
                    >
                      {/* Template Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-[#2563eb] dark:group-hover:text-blue-400 transition-colors">
                              {template.templateName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Biller Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-white/80">
                          <Building2
                            size={15}
                            className="text-slate-400 dark:text-white/40 shrink-0"
                          />
                          <span className="font-semibold text-xs sm:text-sm truncate max-w-[200px]">
                            {template.billerName}
                          </span>
                        </div>
                      </td>

                      {/* Reference No */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 font-mono text-xs font-semibold text-slate-800 dark:text-white/90">
                          <Hash size={13} className="text-slate-400" />
                          {template.referenceNo || "—"}
                        </span>
                      </td>

                      {/* Currency badge */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20">
                          {getCurrencyLabel(welcomeData, template.currency)}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewClick(template)}
                            className="w-8 h-8 rounded-lg border border-slate-200/70 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 bg-white dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-500 hover:text-blue-600 dark:text-white/60 dark:hover:text-blue-400 flex items-center justify-center transition-all shadow-2xs"
                            title={t("view", "View")}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleAddClick(template)}
                            className="w-8 h-8 rounded-lg border border-slate-200/70 dark:border-white/10 hover:border-amber-200 dark:hover:border-amber-500/30 bg-white dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-500 hover:text-amber-600 dark:text-white/60 dark:hover:text-amber-400 flex items-center justify-center transition-all shadow-2xs"
                            title={t("edit", "Edit")}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(template)}
                            className="w-8 h-8 rounded-lg border border-slate-200/70 dark:border-white/10 hover:border-red-200 dark:hover:border-red-500/30 bg-white dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-600 dark:text-white/60 dark:hover:text-red-400 flex items-center justify-center transition-all shadow-2xs"
                            title={t("delete", "Delete")}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Feed (Hidden on desktop) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5">
              {paginatedTemplates.map((template) => (
                <div
                  key={`mobile-${template.id}`}
                  className="p-4 space-y-3.5 hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {/* Row 1: Template Name & Currency */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {template.templateName}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-white/60 mt-0.5">
                        <Building2 size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{template.billerName}</span>
                      </div>
                    </div>
                    <span className="inline-block shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20">
                      {getCurrencyLabel(welcomeData, template.currency)}
                    </span>
                  </div>

                  {/* Row 2: Reference Number Box */}
                  <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-white/40 uppercase">
                      {t("bp_ref1", "Reference No")}
                    </span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-white/80">
                      {template.referenceNo || "—"}
                    </span>
                  </div>

                  {/* Row 3: Action Buttons */}
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => handleViewClick(template)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye size={14} />
                      {t("view", "View")}
                    </button>
                    <button
                      onClick={() => handleAddClick(template)}
                      className="px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-1.5 transition-colors"
                    >
                      <Pencil size={14} />
                      {t("edit", "Edit")}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(template)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 size={14} />
                      {t("delete", "Delete")}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalRecords > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-transparent">
                <GlobalPagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalRecords={totalRecords}
                  currentCount={paginatedTemplates.length}
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

