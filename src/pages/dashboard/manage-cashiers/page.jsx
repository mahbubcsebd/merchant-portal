import { useState } from "react";
import { Eye, Pencil, Trash2, Lock, Search, Power } from "lucide-react";
import { useDialog } from "@/components/globals/DialogProvider";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalButton from "@/components/globals/GlobalButton";
import CashierFormFields from "@/components/cashiers/CashierFormFields";
import CashierPermissionsList from "@/components/cashiers/CashierPermissionsList";
import { useCashiers } from "@/hooks/useCashiers";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { getCashierPermissionsByCashier } from "@/lib/api/endpoints";

export default function ManageCashiersPage() {
  const { openFormDialog, openConfirmDialog, openGlobalPopup } = useDialog();
  const { cashiersQuery, createCashierMutation, updateCashierMutation, updateStatusMutation, savePermissionsMutation, deleteCashierMutation } =
    useCashiers();
  const { validate } = useFormValidation();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const cashiers = (cashiersQuery.data || []).map((c) => ({
    id: c.cashierIDNum || c.merCashierID,
    loginId: c.merCashierID,
    name: `${c.cashierFName || ""} ${c.cashierLName || ""}`.trim(),
    status: c.cashierStatus === "A" ? "Active" : "Inactive",
    raw: c,
  }));

  const filteredCashiers = cashiers
    .filter((c) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.loginId.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => a.loginId.localeCompare(b.loginId));

  // --- Handlers ---
  const handleAddCashier = (initialData = null) => {
    openFormDialog({
      title: t("add_cashier_label", "Add Cashier"),
      isView: false,
      submitText: "Submit",
      disableAutoValidation: true,
      content: <CashierFormFields data={initialData} isView={false} />,
      onSave: async (values, setFormErrors) => {
        const fields = [
          { name: 'merCashierID', value: values.merCashierID, label: t("cashier_user_id", "Cashier User ID"), required: true },
          { name: 'cashierFName', value: values.cashierFName, label: t("ucFirstName", "First Name"), required: true },
          { name: 'cashierLName', value: values.cashierLName, label: t("ucLastName", "Last Name"), required: true },
          { name: 'cashierEmail', value: values.cashierEmail, label: t("bp_email", "Email Address"), required: true, type: 'email' },
          { name: 'countryCode', value: values.countryCode, label: t("crCountry", "Country Code"), required: true, type: 'select' },
          { name: 'cashierMobile', value: values.cashierMobile, label: t("global_mobile_no", "Mobile No."), required: true },
          { name: 'merSubID', value: values.merSubID, label: t("myQr_subsidiary", "Branch"), required: true, type: 'select' },
          { name: 'cashierIDType', value: values.cashierIDType, label: t("cashier_id_type", "Cashier ID Type"), required: true, type: 'select' },
          { name: 'cashierIDNum', value: values.cashierIDNum, label: t("cashier_id_number", "Cashier ID Number"), required: true }
        ];
        
        const validationResult = validate(fields);
        if (!validationResult.isValid) {
          setFormErrors(validationResult.errors);
          return false;
        }
        
        const countryCode = values.countryCode || "";
        let rawMobile = values.cashierMobile || "";
        if (rawMobile && !rawMobile.startsWith(countryCode)) {
          rawMobile = countryCode + rawMobile;
        }
        
        const payload = { ...values, cashierMobile: rawMobile };
        
        const openPermissionsDialog = () => {
          openFormDialog({
            title: t("cashier_permissions", "Cashier Permissions"),
            submitText: "Save",
            content: <CashierPermissionsList />,
            onSave: async (permValues, showPermError) => {
              try {
                const functionalityIDs = permValues.functionalityIDs ? JSON.parse(permValues.functionalityIDs) : [];
                const permPayload = { merCashierID: values.merCashierID, functionalityIDs };
                const res = await savePermissionsMutation.mutateAsync(permPayload);
                openGlobalPopup({
                  title: "Success",
                  description: res.message || "Permissions saved successfully.",
                  type: "success"
                });
                return false;
              } catch (err) {
                openGlobalPopup({
                  title: "Error",
                  description: err.message || "Failed to save permissions.",
                  type: "error",
                  onClose: () => openPermissionsDialog()
                });
                return false;
              }
            }
          });
        };

        try {
          const res = await createCashierMutation.mutateAsync(payload);
          openGlobalPopup({
            title: "Success",
            description: res.message || "Cashier created successfully.",
            type: "success",
            onClose: () => openPermissionsDialog()
          });
          return false;
        } catch (err) {
          openGlobalPopup({
            title: "Error",
            description: err.message || "Failed to create cashier.",
            type: "error",
            onClose: () => handleAddCashier(values)
          });
          return false;
        }
      },
    });
  };

  const handleView = (cashier) => {
    openFormDialog({
      title: t("view_cashier_label", "View Cashier"),
      isView: true,
      content: <CashierFormFields data={cashier.raw} isView={true} />,
    });
  };

  const handleEdit = (cashier) => {
    openFormDialog({
      title: t("edit_cashier", "Edit Cashier"),
      isView: false,
      submitText: "Save",
      content: <CashierFormFields data={cashier.raw} isView={false} />,
      onSave: async (values, setFormErrors) => {
        const fields = [
          { name: 'merCashierID', value: values.merCashierID, label: t("cashier_user_id", "Cashier User ID"), required: true },
          { name: 'cashierFName', value: values.cashierFName, label: t("ucFirstName", "First Name"), required: true },
          { name: 'cashierLName', value: values.cashierLName, label: t("ucLastName", "Last Name"), required: true },
          { name: 'cashierEmail', value: values.cashierEmail, label: t("bp_email", "Email Address"), required: true, type: 'email' },
          { name: 'countryCode', value: values.countryCode, label: t("crCountry", "Country Code"), required: true, type: 'select' },
          { name: 'cashierMobile', value: values.cashierMobile, label: t("global_mobile_no", "Mobile No."), required: true },
          { name: 'merSubID', value: values.merSubID, label: t("myQr_subsidiary", "Branch"), required: true, type: 'select' },
          { name: 'cashierIDType', value: values.cashierIDType, label: t("cashier_id_type", "Cashier ID Type"), required: true, type: 'select' },
          { name: 'cashierIDNum', value: values.cashierIDNum, label: t("cashier_id_number", "Cashier ID Number"), required: true }
        ];
        
        const validationResult = validate(fields);
        if (!validationResult.isValid) {
          setFormErrors(validationResult.errors);
          return false;
        }
        
        const countryCode = values.countryCode || "";
        let rawMobile = values.cashierMobile || "";
        if (rawMobile && !rawMobile.startsWith(countryCode)) {
          rawMobile = countryCode + rawMobile;
        }
        
        const payload = { ...values, cashierMobile: rawMobile };
        
        const openPermissionsDialog = (defaultSelected = []) => {
          openFormDialog({
            title: t("cashier_permissions", "Cashier Permissions"),
            submitText: "Save",
            content: <CashierPermissionsList defaultSelected={defaultSelected} />,
            onSave: async (permValues, showPermError) => {
              try {
                const functionalityIDs = permValues.functionalityIDs ? JSON.parse(permValues.functionalityIDs) : [];
                const permPayload = { merCashierID: values.merCashierID, functionalityIDs };
                const res = await savePermissionsMutation.mutateAsync(permPayload);
                openGlobalPopup({
                  title: "Success",
                  description: res.message || "Permissions saved successfully.",
                  type: "success"
                });
                return false;
              } catch (err) {
                openGlobalPopup({
                  title: "Error",
                  description: err.message || "Failed to save permissions.",
                  type: "error",
                  onClose: () => openPermissionsDialog(defaultSelected)
                });
                return false;
              }
            }
          });
        };
        
        try {
          const res = await updateCashierMutation.mutateAsync(payload);
          
          let defaultSelected = [];
          try {
            const permRes = await getCashierPermissionsByCashier({ merCashierID: values.merCashierID });
            if (permRes && permRes.permisions) {
              defaultSelected = permRes.permisions.map(p => p.funcId);
            }
          } catch (e) {
            console.error("Failed to fetch existing permissions", e);
          }
          
          openGlobalPopup({
            title: "Success",
            description: res.message || "Cashier updated successfully.",
            type: "success",
            onClose: () => openPermissionsDialog(defaultSelected)
          });
          return false;
        } catch (err) {
          openGlobalPopup({
            title: "Error",
            description: err.message || "Failed to update cashier.",
            type: "error",
            onClose: () => handleEdit({ raw: values })
          });
          return false;
        }
      },
    });
  };

  const handleResetPin = (cashier) => {
    openConfirmDialog({
      title: "Reset PIN?",
      description: `Are you sure you want to reset PIN for cashier ${cashier.name}?`,
      confirmText: "Reset",
      iconType: "warning",
      onConfirm: () => {
        console.log("Reset PIN for cashier:", cashier.id);
      },
    });
  };

  const handleDelete = (cashier) => {
    openConfirmDialog({
      title: t("delete_cashier_title", "Delete Cashier?"),
      description: t("delete_cashier_desc", "Are you sure you want to delete this cashier? This action cannot be undone."),
      confirmText: t("delete", "Delete"),
      iconType: "danger",
      onConfirm: async () => {
        try {
          const res = await deleteCashierMutation.mutateAsync({ merCashierID: cashier.id });
          openGlobalPopup({
            title: t("success_title", "Success"),
            description: res.message || t("deleted_cashier", "Cashier deleted successfully."),
            type: "success"
          });
          return false;
        } catch (err) {
          openGlobalPopup({
            title: t("error_title", "Error"),
            description: err.message || "Failed to delete cashier.",
            type: "error"
          });
          return false;
        }
      },
    });
  };

  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const handleStatusChange = async (cashier) => {
    const newStatus = cashier.raw.cashierStatus === "A" ? "I" : "A";
    setStatusLoadingId(cashier.id);
    try {
      const res = await updateStatusMutation.mutateAsync({
        cashierIDNum: cashier.raw.cashierIDNum ? String(cashier.raw.cashierIDNum) : "",
        merCashierID: cashier.loginId,
        cashierStatus: newStatus
      });
      openGlobalPopup({
        title: t("success_title", "Success"),
        description: res.message || t("update_cashier_msg", "Cashier updated successfully."),
        type: "success"
      });
    } catch (err) {
      openGlobalPopup({
        title: t("error_title", "Error"),
        description: err.message || "Failed to update status.",
        type: "error"
      });
    } finally {
      setStatusLoadingId(null);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1b55ad] dark:text-blue-400 mb-1">
            Administration
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t("mc_title", "Manage Cashiers")}
          </h2>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none p-4 sm:p-6 min-h-[500px]">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <GlobalInput
            placeholder={t("search_cashier", "Search Cashier")}
            leftIcon={<Search size={16} />}
            containerClassName="w-full sm:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <GlobalButton
            onClick={() => handleAddCashier()}
            variant="primary"
            className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider h-10 px-8"
          >
            {t("add_cashier_label", "Add Cashier")}
          </GlobalButton>
        </div>

        {/* Data Table — Desktop View (Hidden on mobile) */}
        <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  {t("loginUserId", "Login User ID")}
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  {t("cashier_name", "Cashier Name")}
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  {t("global_status", "Status")}
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-right">
                  {t("teAction", "Action")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {cashiersQuery.isLoading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-8 text-center text-slate-500 dark:text-white/50"
                  >
                    Loading cashiers...
                  </td>
                </tr>
              ) : filteredCashiers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-8 text-center text-slate-500 dark:text-white/50"
                  >
                    No cashiers found.
                  </td>
                </tr>
              ) : (
                filteredCashiers.map((cashier, idx) => (
                  <tr
                    key={`desktop-${cashier.id}-${idx}`}
                    className={`${idx % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-blue-50/50 dark:bg-white/[0.02]"} hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors`}
                  >
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                      {cashier.loginId}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70 capitalize">
                      {cashier.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cashier.status === "Active" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}
                      >
                        {cashier.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleView(cashier)}
                          className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(cashier)}
                          className="text-slate-400 hover:text-emerald-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cashier)}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => handleResetPin(cashier)}
                          className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Reset Pin"
                        >
                          <Lock size={16} />
                        </button>

                        {/* Premium Toggle Switch */}
                        <div className="flex items-center ml-2 pl-4 border-l border-slate-200 dark:border-white/10 relative">
                          {statusLoadingId === cashier.id ? (
                            <div className="w-9 h-5 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-full">
                              <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={cashier.status === "Active"}
                                onChange={() => handleStatusChange(cashier)}
                                disabled={statusLoadingId === cashier.id}
                              />
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                            </label>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Card Feed — Mobile View (Hidden on desktop) */}
        <div className="md:hidden space-y-3 mb-8">
          {cashiersQuery.isLoading ? (
            <div className="text-center py-8 text-slate-500 dark:text-white/50 text-sm">
              Loading cashiers...
            </div>
          ) : filteredCashiers.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-white/50 text-sm">
              No cashiers found.
            </div>
          ) : (
            filteredCashiers.map((cashier, idx) => (
              <div
                key={`mobile-${cashier.id}-${idx}`}
                className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-4 shadow-sm dark:shadow-none"
              >
                {/* Row 1: Header (ID + Status Toggle) */}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">
                    {cashier.loginId}
                  </span>
                  <div className="relative">
                    {statusLoadingId === cashier.id ? (
                      <div className="w-8 h-4 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-full">
                        <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={cashier.status === "Active"}
                          onChange={() => handleStatusChange(cashier)}
                          disabled={statusLoadingId === cashier.id}
                        />
                        <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Row 2: Cashier Info */}
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                    {cashier.name}
                  </h4>
                  <span
                    className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${cashier.status === "Active" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}
                  >
                    {cashier.status}
                  </span>
                </div>

                {/* Row 3: Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200 dark:border-white/10">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleView(cashier)}
                      className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(cashier)}
                      className="text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleResetPin(cashier)}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <Lock size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cashier)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
