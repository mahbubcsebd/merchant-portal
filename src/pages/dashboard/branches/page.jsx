import { Eye, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { useDialog } from "@/components/globals/DialogProvider";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalButton from "@/components/globals/GlobalButton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubsidiaries, createSubsidiary } from "@/lib/api/endpoints";

export default function BranchesPage() {
  const {
    openFormDialog,
    openConfirmDialog,
    openPreconfirmDialog,
    openSuccessDialog,
    openGlobalPopup,
    closeDialog,
  } = useDialog();
  const queryClient = useQueryClient();

  // 1. Fetch Branches
  const { data: subsidiariesRes, isLoading } = useQuery({
    queryKey: ["subsidiaries"],
    queryFn: () => getSubsidiaries({}),
  });

  const branches = subsidiariesRes?.data || [];

  // 2. Add Branch Mutation
  const addMutation = useMutation({
    mutationFn: (values) => createSubsidiary(values),
    onSuccess: (res, variables) => {
      if (
        res.status === "success" &&
        (res.statusCode === "0" || res.statusCode === 0)
      ) {
        queryClient.invalidateQueries({ queryKey: ["subsidiaries"] });
        openSuccessDialog({
          title: "Branch Created",
          message: "The branch has been successfully created.",
          details: {
            "Branch Name": variables.subName,
            "Email Address": variables.emailAddr,
            "Mobile Phone":
              (variables.mobileDial || "") + variables.mobilePhone,
            "Business Phone":
              (variables.businessDial || "") + variables.businessPhone,
            Country: variables.subCountryLabel || variables.subCountry,
            State: variables.subState,
            City: variables.subCity,
            "Street Name": variables.streetName,
            "Street No": variables.streetNum,
            "Unit Name": variables.unitName,
            "Zip Code": variables.subZip,
            "Branch Category":
              variables.subCategoryLabel || variables.subCategory,
            "Business ID Type":
              variables.businessIdTypeLabel || variables.businessIdType,
            "Business ID Number": variables.businessIdNum,
            Website: variables.website,
            Status: variables.subStatusLabel || variables.subStatus,
          },
        });
      } else {
        openGlobalPopup({
          title: "Error",
          description: res.message || "Failed to create branch",
          type: "error",
          onClose: () => {
            handleAddClick(variables);
          },
        });
      }
    },
    onError: (err) => {
      openGlobalPopup({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        type: "error",
        onClose: () => {
          handleAddClick(variables);
        },
      });
    },
  });

  // 3. Handle Add Flow (Form -> Preconfirm -> Submit)
  const handleAddClick = (initialValues = null) => {
    openFormDialog("branch", "add", initialValues, (values) => {
      // Show preconfirm screen
      openPreconfirmDialog({
        title: "Confirm Branch Details",
        details: {
          "Branch Name": values.subName,
          "Email Address": values.emailAddr,
          "Mobile Phone": (values.mobileDial || "") + values.mobilePhone,
          "Business Phone": (values.businessDial || "") + values.businessPhone,
          Country: values.subCountryLabel || values.subCountry,
          State: values.subState,
          City: values.subCity,
          "Street Name": values.streetName,
          "Street No": values.streetNum,
          "Unit Name": values.unitName,
          "Zip Code": values.subZip,
          "Branch Category": values.subCategoryLabel || values.subCategory,
          "Business ID Type":
            values.businessIdTypeLabel || values.businessIdType,
          "Business ID Number": values.businessIdNum,
          Website: values.website,
          Status: values.subStatusLabel || values.subStatus,
        },
        onChange: () => {
          // Go back to form with filled values
          handleAddClick(values);
        },
        onSubmit: () => {
          // Transform payload to match API requirements (legacy mappings)
          const payload = {
            ...values,
            businessCategory: values.subCategory,
            businessTaxId: values.businessIdNum,
            countryCode: values.mobileDial || "",
            countryCodeB: values.businessDial || "",
          };

          // Send API request
          closeDialog();
          addMutation.mutate(payload);
        },
      });
      return false; // Prevent DialogProvider from auto-closing
    });
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-0.5">
            Network
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Manage Branches
          </h2>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none p-4 sm:p-6 min-h-[500px]">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <GlobalInput
            placeholder="Search Branches"
            leftIcon={<Search size={16} />}
            containerClassName="w-full sm:w-80"
          />

          <GlobalButton
            onClick={() => handleAddClick()}
            variant="primary"
            isLoading={addMutation.isPending}
            className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider h-10 px-8"
          >
            Add Branch
          </GlobalButton>
        </div>

        {/* Data Table — Desktop View (Hidden on mobile) */}
        <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  Branch Name
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  Email
                </th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  Phone Number
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
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
                    Loading branches...
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500 font-medium"
                  >
                    No branches available.
                  </td>
                </tr>
              ) : (
                branches.map((branch, idx) => (
                  <tr
                    key={branch.CORPCUSTSUBID || idx}
                    className={`${idx % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-blue-50/50 dark:bg-white/[0.02]"} hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors`}
                  >
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70 capitalize">
                      {branch.SUBNAME}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                      {branch.EMAILADDR}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                      {branch.MOBILEPHONE}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${branch.SUBSTATUS === "A" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}
                      >
                        {branch.SUBSTATUS === "A" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() =>
                            openFormDialog("branch", "view", branch)
                          }
                          className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            openFormDialog(
                              "branch",
                              "edit",
                              branch,
                              (values) => {
                                console.log("Branch to update:", values);
                              },
                            );
                          }}
                          className="text-slate-400 hover:text-emerald-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            openConfirmDialog({
                              title: "Delete Branch?",
                              description: `Are you sure you want to delete ${branch.SUBNAME}? This action cannot be undone.`,
                              confirmText: "Delete",
                              iconType: "danger",
                              onConfirm: () => {
                                console.log(
                                  "Delete branch:",
                                  branch.CORPCUSTSUBID,
                                );
                              },
                            });
                          }}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
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
          {isLoading ? (
            <div className="text-center py-10 text-slate-500">
              <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
              Loading branches...
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-medium">
              No branches available.
            </div>
          ) : (
            branches.map((branch, idx) => (
              <div
                key={branch.CORPCUSTSUBID || idx}
                className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-4"
              >
                {/* Row 1: Name & Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                      {branch.SUBNAME}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-white/45 mt-1">
                      {branch.EMAILADDR}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-white/45 mt-0.5">
                      {branch.MOBILEPHONE}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${branch.SUBSTATUS === "A" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}
                  >
                    {branch.SUBSTATUS === "A" ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Row 2: Action Buttons */}
                <div className="flex items-center justify-start gap-4 pt-3 border-t border-dashed border-slate-200 dark:border-white/10">
                  <button
                    onClick={() => openFormDialog("branch", "view", branch)}
                    className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => {
                      openFormDialog("branch", "edit", branch, (values) => {
                        console.log("Branch to update:", values);
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
                        title: "Delete Branch?",
                        description: `Are you sure you want to delete ${branch.SUBNAME}? This action cannot be undone.`,
                        confirmText: "Delete",
                        iconType: "danger",
                        onConfirm: () => {
                          console.log("Delete branch:", branch.CORPCUSTSUBID);
                        },
                      });
                    }}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
