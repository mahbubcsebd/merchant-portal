import { useState } from "react";
import { Eye, Pencil, Trash2, Lock, Search } from "lucide-react";
import { useDialog } from "@/components/globals/DialogProvider";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalButton from "@/components/globals/GlobalButton";
import CashierFormFields from "@/components/cashiers/CashierFormFields";
import CashierPermissionsList from "@/components/cashiers/CashierPermissionsList";
import { useCashiers } from "@/hooks/useCashiers";
import { useFormValidation } from "@/hooks/useFormValidation";

export default function ManageCashiersPage() {
  const { openFormDialog, openConfirmDialog, openGlobalPopup } = useDialog();
  const { cashiersQuery, createCashierMutation, savePermissionsMutation } =
    useCashiers();
  const { validate } = useFormValidation();
  const [searchTerm, setSearchTerm] = useState("");

  const cashiers = (cashiersQuery.data || []).map((c) => ({
    id: c.merCashierID,
    loginId: c.merCashierID,
    name: `${c.cashierFName || ""} ${c.cashierLName || ""}`.trim(),
    status: c.cashierStatus === "A" ? "Active" : "Inactive",
    raw: c,
  }));

  const filteredCashiers = cashiers.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.loginId.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1b55ad] dark:text-blue-400 mb-1">
            Administration
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Manage Cashiers
          </h2>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none p-4 sm:p-6 min-h-[500px]">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <GlobalInput
            placeholder="Search Cashier"
            leftIcon={<Search size={16} />}
            containerClassName="w-full sm:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <GlobalButton
            onClick={() => {
              const openAddForm = (initialData = null) => {
                openFormDialog({
                  title: "Add Cashier",
                  isView: false,
                  submitText: "Submit",
                  disableAutoValidation: true,
                  content: (
                    <CashierFormFields data={initialData} isView={false} />
                  ),
                  onSave: async (values, setFormErrors) => {
                    const fields = [
                      {
                        name: "merCashierID",
                        value: values.merCashierID,
                        label: "Cashier User ID",
                        required: true,
                      },
                      {
                        name: "cashierFName",
                        value: values.cashierFName,
                        label: "First Name",
                        required: true,
                      },
                      {
                        name: "cashierLName",
                        value: values.cashierLName,
                        label: "Last Name",
                        required: true,
                      },
                      {
                        name: "cashierEmail",
                        value: values.cashierEmail,
                        label: "Email",
                        required: true,
                        type: "email",
                      },
                      {
                        name: "cashierMobile",
                        value: values.cashierMobile,
                        label: "Mobile No.",
                        required: true,
                      },
                      {
                        name: "merSubID",
                        value: values.merSubID,
                        label: "Branch",
                        required: true,
                        type: "select",
                      },
                      {
                        name: "cashierIDType",
                        value: values.cashierIDType,
                        label: "Cashier ID Type",
                        required: true,
                        type: "select",
                      },
                      {
                        name: "cashierIDNum",
                        value: values.cashierIDNum,
                        label: "Cashier ID Number",
                        required: true,
                      },
                    ];

                    const validationResult = validate(fields);
                    if (!validationResult.isValid) {
                      setFormErrors(validationResult.errors);
                      return false;
                    }

                    // Format mobile number
                    const countryCode = values.countryCode || "";
                    let rawMobile = values.cashierMobile || "";
                    if (rawMobile && !rawMobile.startsWith(countryCode)) {
                      rawMobile = countryCode + rawMobile;
                    }

                    const payload = {
                      ...values,
                      cashierMobile: rawMobile,
                    };

                    const openPermissionsDialog = () => {
                      openFormDialog({
                        title: "Cashier Permissions",
                        submitText: "Save",
                        content: <CashierPermissionsList />,
                        onSave: async (permValues, showPermError) => {
                          try {
                            const functionalityIDs = permValues.functionalityIDs
                              ? JSON.parse(permValues.functionalityIDs)
                              : [];
                            const permPayload = {
                              merCashierID: values.merCashierID,
                              functionalityIDs,
                            };

                            const res =
                              await savePermissionsMutation.mutateAsync(
                                permPayload,
                              );
                            openGlobalPopup({
                              title: "Success",
                              description:
                                res.message ||
                                "Permissions saved successfully.",
                              type: "success",
                            });
                            return false;
                          } catch (err) {
                            openGlobalPopup({
                              title: "Error",
                              description:
                                err.message || "Failed to save permissions.",
                              type: "error",
                              onClose: () => openPermissionsDialog(),
                            });
                            return false;
                          }
                        },
                      });
                    };

                    try {
                      const res =
                        await createCashierMutation.mutateAsync(payload);
                      openGlobalPopup({
                        title: "Success",
                        description:
                          res.message || "Cashier created successfully.",
                        type: "success",
                        onClose: () => openPermissionsDialog(),
                      });
                      return false; // Prevent auto-close
                    } catch (err) {
                      openGlobalPopup({
                        title: "Error",
                        description: err.message || "Failed to create cashier.",
                        type: "error",
                        onClose: () => openAddForm(values),
                      });
                      return false;
                    }
                  },
                });
              };
              openAddForm();
            }}
            variant="primary"
            className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider h-10 px-8"
          >
            Add Cashier
          </GlobalButton>
        </div>

        {/* Data Table — Desktop View (Hidden on mobile) */}
        <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  Login User ID
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  Cashier Name
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  Status
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-right">
                  Action
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
                    key={cashier.id}
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
                          onClick={() =>
                            openFormDialog({
                              title: "View Cashier",
                              isView: true,
                              content: (
                                <CashierFormFields
                                  data={cashier.raw}
                                  isView={true}
                                />
                              ),
                            })
                          }
                          className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            openFormDialog({
                              title: "Edit Cashier",
                              isView: false,
                              submitText: "Save",
                              content: (
                                <CashierFormFields
                                  data={cashier.raw}
                                  isView={false}
                                />
                              ),
                              onSave: (values) => {
                                console.log("Cashier to update:", values);
                              },
                            });
                          }}
                          className="text-slate-400 hover:text-emerald-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            openConfirmDialog({
                              title: "Delete Cashier?",
                              description: `Are you sure you want to delete ${cashier.name}? This action cannot be undone.`,
                              confirmText: "Delete",
                              iconType: "danger",
                              onConfirm: () => {
                                console.log("Delete cashier:", cashier.id);
                              },
                            });
                          }}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            openConfirmDialog({
                              title: "Reset PIN?",
                              description: `Are you sure you want to reset PIN for cashier ${cashier.name}?`,
                              confirmText: "Reset",
                              iconType: "warning",
                              onConfirm: () => {
                                console.log(
                                  "Reset PIN for cashier:",
                                  cashier.id,
                                );
                              },
                            });
                          }}
                          className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="Reset Pin"
                        >
                          <Lock size={16} />
                        </button>

                        {/* Premium Toggle Switch */}
                        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 dark:border-white/10">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              defaultChecked={cashier.status === "Active"}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                          </label>
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
            filteredCashiers.map((cashier) => (
              <div
                key={cashier.id}
                className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-4 shadow-sm dark:shadow-none"
              >
                {/* Row 1: Header (ID + Status Toggle) */}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-wider">
                    {cashier.loginId}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={cashier.status === "Active"}
                    />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                  </label>
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
                      onClick={() =>
                        openFormDialog({
                          title: "View Cashier",
                          isView: true,
                          content: (
                            <CashierFormFields
                              data={cashier.raw}
                              isView={true}
                            />
                          ),
                        })
                      }
                      className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        openFormDialog({
                          title: "Edit Cashier",
                          isView: false,
                          submitText: "Save",
                          content: (
                            <CashierFormFields
                              data={cashier.raw}
                              isView={false}
                            />
                          ),
                          onSave: (values) => {
                            console.log("Cashier to update:", values);
                          },
                        });
                      }}
                      className="text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        openConfirmDialog({
                          title: "Reset PIN?",
                          description: `Are you sure you want to reset PIN for cashier ${cashier.name}?`,
                          confirmText: "Reset",
                          iconType: "warning",
                          onConfirm: () => {
                            console.log("Reset PIN for cashier:", cashier.id);
                          },
                        });
                      }}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <Lock size={18} />
                    </button>
                    <button
                      onClick={() => {
                        openConfirmDialog({
                          title: "Delete Cashier?",
                          description: `Are you sure you want to delete ${cashier.name}? This action cannot be undone.`,
                          confirmText: "Delete",
                          iconType: "danger",
                          onConfirm: () => {
                            console.log("Delete cashier:", cashier.id);
                          },
                        });
                      }}
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
