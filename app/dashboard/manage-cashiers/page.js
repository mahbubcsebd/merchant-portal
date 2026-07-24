"use client"

import { Eye, Pencil, Trash2, Lock, Search } from "lucide-react"
import { useDialog } from "@/components/globals/DialogProvider"
import GlobalInput from "@/components/globals/GlobalInput"
import GlobalButton from "@/components/globals/GlobalButton"

const MOCK_CASHIERS = [
  { id: 1, loginId: "Terchik", name: "lou marie", status: "Active" },
  { id: 2, loginId: "JohnDoe", name: "John Doe", status: "Active" },
  { id: 3, loginId: "JaneS", name: "Jane Smith", status: "Inactive" },
  { id: 4, loginId: "Admin2", name: "Mike Tyson", status: "Active" },
  { id: 5, loginId: "Cashier5", name: "Sarah Connor", status: "Inactive" },
]

export default function ManageCashiersPage() {
  const { openFormDialog, openConfirmDialog } = useDialog()

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-0.5">
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
          />
          
          <GlobalButton 
            onClick={() => {
              openFormDialog("cashier", "add", null, (values) => {
                console.log("Cashier to add:", values)
              })
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
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Login User ID</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Cashier Name</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Status</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {MOCK_CASHIERS.map((cashier, idx) => (
                <tr key={cashier.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-blue-50/50 dark:bg-white/[0.02]'} hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors`}>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70">{cashier.loginId}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70 capitalize">{cashier.name}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cashier.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                      {cashier.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => openFormDialog("cashier", "view", cashier)} 
                        className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors" 
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          openFormDialog("cashier", "edit", cashier, (values) => {
                            console.log("Cashier to update:", values)
                          })
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
                               console.log("Delete cashier:", cashier.id)
                            }
                          })
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
                              console.log("Reset PIN for cashier:", cashier.id)
                            }
                          })
                        }} 
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" 
                        title="Reset Pin"
                      >
                        <Lock size={16} />
                      </button>
                      
                      {/* Premium Toggle Switch */}
                      <label className="relative inline-flex items-center cursor-pointer ml-2">
                        <input type="checkbox" className="sr-only peer" defaultChecked={cashier.status === 'Active'} />
                        <div className="w-9 h-5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 peer-focus:outline-none rounded-full peer transition-all peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card Feed — Mobile View (Hidden on desktop) */}
        <div className="md:hidden space-y-3 mb-8">
          {MOCK_CASHIERS.map((cashier) => (
            <div 
              key={cashier.id}
              className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-4"
            >
              {/* Row 1: Name & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">{cashier.name}</h4>
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-0.5">ID: {cashier.loginId}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${cashier.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                  {cashier.status}
                </span>
              </div>

              {/* Row 2: Action Buttons & Toggle Switch */}
              <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200 dark:border-white/10">
                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => openFormDialog("cashier", "view", cashier)} 
                    className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors" 
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      openFormDialog("cashier", "edit", cashier, (values) => {
                        console.log("Cashier to update:", values)
                      })
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
                          console.log("Delete cashier:", cashier.id)
                        }
                      })
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
                          console.log("Reset PIN for cashier:", cashier.id)
                        }
                      })
                    }} 
                    className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" 
                    title="Reset Pin"
                  >
                    <Lock size={16} />
                  </button>
                </div>

                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={cashier.status === 'Active'} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer transition-all peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

