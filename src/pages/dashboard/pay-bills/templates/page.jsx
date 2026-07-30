
import { Eye, Pencil, Trash2 } from "lucide-react"
import { Link } from 'react-router-dom';
import { useDialog } from "@/components/globals/DialogProvider"
import GlobalButton from "@/components/globals/GlobalButton"
import BillerTemplateFormFields from "@/components/pay-bills/BillerTemplateFormFields"
import { usePayBills } from "@/hooks/usePayBills"
import { useQueryClient } from "@tanstack/react-query"

export default function ManageBillTemplatesPage() {
  const { openFormDialog, openConfirmDialog, openDetailDialog, openPreconfirmDialog, openSuccessDialog, openGlobalPopup, closeDialog } = useDialog()
  const { userBillersQuery, createBillTemplateMutation } = usePayBills()
  const queryClient = useQueryClient()
  const welcomeData = queryClient.getQueryData(["welcome"])

  const getCurrencyLabel = (currencyId) => {
    if (!welcomeData?.metaData?.CURRENCY) return currencyId;
    const curr = welcomeData.metaData.CURRENCY.find(c => String(c.id) === String(currencyId));
    return curr ? curr.title : currencyId;
  };

  const templates = (userBillersQuery.data || []).map((b, index) => ({
    id: b.BILLID || index,
    billerName: b.BILLERNAME || b.BILLNAME || "Unknown",
    templateName: b.BILLNAME || "Template",
    referenceNo: b.REFNO || b.REFERENCE || "N/A",
    currency: b.CURRENCY || b.BLRWALCUR || "N/A",
    raw: b
  }))

  const handleAddClick = (initialValues = null) => {
    openFormDialog({
      title: "Create Bill Template",
      isView: false,
      submitText: "Create",
      size: "sm:max-w-md",
      content: <BillerTemplateFormFields data={initialValues} isView={false} />,
      onSave: (values) => {
        openPreconfirmDialog({
          title: "Confirm Bill Template",
          details: {
            "Biller Name": values.billerName,
            "Bill Template Name": values.billName,
            "Reference No": values.refNum,
            "Currency": getCurrencyLabel(values.currency)
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
              billerName: values.billerName
            };

            createBillTemplateMutation.mutate(payload, {
              onSuccess: () => {
                openSuccessDialog({
                  title: "Template Created",
                  message: "Your bill template has been successfully created.",
                  details: {
                    "Bill Template Name": values.billName,
                    "Biller Name": values.billerName,
                    "Reference No": values.refNum,
                    "Currency": getCurrencyLabel(values.currency)
                  }
                });
              },
              onError: (err) => {
                openGlobalPopup({
                  title: "Error",
                  description: err.message || "Failed to create bill template.",
                  type: "error"
                });
              }
            });
          }
        });
        
        // Return false to prevent the FormDialogShell from calling onClose() 
        // and overriding our openPreconfirmDialog state.
        return false;
      }
    });
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Manage Bill Templates
        </h2>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none p-4 sm:p-6 min-h-[500px]">
        
        {/* Top Controls */}
        <div className="flex justify-end mb-6">
          <GlobalButton 
            onClick={() => handleAddClick()}
            variant="primary"
            className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider h-10 px-8"
          >
            Create Bill Template
          </GlobalButton>
        </div>

        {/* Data Table — Desktop View (Hidden on mobile) */}
        <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Template Name</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {templates.map((template, idx) => (
                <tr key={template.id} className={`${idx % 2 === 0 ? 'bg-blue-50/50 dark:bg-white/[0.02]' : 'bg-white dark:bg-transparent'} hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors`}>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70">{template.templateName}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => {
                          openDetailDialog({
                            title: "View Bill Template",
                            details: [
                              { label: "Biller Name", value: template.billerName },
                              { label: "Bill Template Name", value: template.templateName },
                              { label: "Reference No", value: template.referenceNo },
                              { label: "Currency", value: template.currency }
                            ],
                            doneText: "Back"
                          })
                        }} 
                        className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors" 
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          openFormDialog({
                            title: "Edit Bill Template",
                            isView: false,
                            submitText: "Save",
                            size: "sm:max-w-md",
                            content: <BillerTemplateFormFields data={template} isView={false} />,
                            onSave: (values) => {
                              console.log("Update bill template:", values)
                            }
                          })
                        }} 
                        className="text-slate-400 hover:text-emerald-500 transition-colors" 
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          openConfirmDialog({
                            title: "Delete Template?",
                            description: `Are you sure you want to delete ${template.templateName}? This action cannot be undone.`,
                            confirmText: "Delete",
                            iconType: "danger",
                            onConfirm: () => {
                              console.log("Delete template:", template.id)
                            }
                          })
                        }} 
                        className="text-slate-400 hover:text-rose-500 transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan="2" className="px-5 py-8 text-center text-slate-500 dark:text-white/50">
                    No bill templates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card Feed — Mobile View (Hidden on desktop) */}
        <div className="md:hidden space-y-3 mb-8">
          {templates.map((template) => (
            <div 
              key={template.id}
              className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-4"
            >
              {/* Row 1: Template Info */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">{template.templateName}</h4>
                <p className="text-xs text-slate-400 dark:text-white/45 mt-1">Biller: {template.billerName}</p>
                <p className="text-[10px] text-slate-400 dark:text-white/30 mt-0.5">Ref: {template.referenceNo} · {template.currency}</p>
              </div>

              {/* Row 2: Action Buttons */}
              <div className="flex items-center justify-start gap-4 pt-3 border-t border-dashed border-slate-200 dark:border-white/10">
                <button 
                  onClick={() => {
                    openDetailDialog({
                      title: "View Bill Template",
                      details: [
                        { label: "Biller Name", value: template.billerName },
                        { label: "Bill Template Name", value: template.templateName },
                        { label: "Reference No", value: template.referenceNo },
                        { label: "Currency", value: template.currency }
                      ],
                      doneText: "Back"
                    })
                  }} 
                  className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors" 
                  title="View"
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={() => {
                    openFormDialog({
                      title: "Edit Bill Template",
                      isView: false,
                      submitText: "Save",
                      size: "sm:max-w-md",
                      content: <BillerTemplateFormFields data={template} isView={false} />,
                      onSave: (values) => {
                        console.log("Update bill template:", values)
                      }
                    })
                  }} 
                  className="text-slate-400 hover:text-emerald-500 transition-colors" 
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => {
                    openConfirmDialog({
                      title: "Delete Template?",
                      description: `Are you sure you want to delete ${template.templateName}? This action cannot be undone.`,
                      confirmText: "Delete",
                      iconType: "danger",
                      onConfirm: () => {
                        console.log("Delete template:", template.id)
                      }
                    })
                  }} 
                  className="text-slate-400 hover:text-rose-500 transition-colors" 
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-white/50 bg-white dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
              No bill templates found.
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="flex justify-center border-t border-dashed border-slate-200 dark:border-white/10 pt-6">
          <Link to="/dashboard/pay-bills" className="w-full sm:w-auto">
            <GlobalButton 
              variant="secondary"
              className="w-full sm:w-auto uppercase tracking-wider font-bold h-10 text-xs px-8"
            >
              Back
            </GlobalButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
