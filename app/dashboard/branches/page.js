"use client"

import { Eye, Pencil, Trash2, Search } from "lucide-react"
import { useDialog } from "@/components/globals/DialogProvider"
import GlobalInput from "@/components/globals/GlobalInput"
import GlobalButton from "@/components/globals/GlobalButton"

const MOCK_BRANCHES = [
  { id: 1, name: "Silicon Valley", email: "tester1@moadbusglobal.com", phone: "1223334444", status: "Active" },
  { id: 2, name: "Pangalawang Branch", email: "2branch@testing.com", phone: "11111323112", status: "Active" },
  { id: 3, name: "New York HQ", email: "hq@moadbus.com", phone: "18005559999", status: "Inactive" },
]

export default function BranchesPage() {
  const { openFormDialog, openConfirmDialog } = useDialog()

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
            onClick={() => {
              openFormDialog("branch", "add", null, (values) => {
                console.log("Branch to add:", values)
              })
            }}
            variant="primary"
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
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Branch Name</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Email</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Phone Number</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Status</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {MOCK_BRANCHES.map((branch, idx) => (
                <tr key={branch.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-blue-50/50 dark:bg-white/[0.02]'} hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors`}>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70 capitalize">{branch.name}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70">{branch.email}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70">{branch.phone}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${branch.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                      {branch.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-3">
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
                            console.log("Branch to update:", values)
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
                            title: "Delete Branch?",
                            description: `Are you sure you want to delete ${branch.name}? This action cannot be undone.`,
                            confirmText: "Delete",
                            iconType: "danger",
                            onConfirm: () => {
                              console.log("Delete branch:", branch.id)
                            }
                          })
                        }} 
                        className="text-slate-400 hover:text-rose-500 transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card Feed — Mobile View (Hidden on desktop) */}
        <div className="md:hidden space-y-3 mb-8">
          {MOCK_BRANCHES.map((branch) => (
            <div 
              key={branch.id}
              className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-4"
            >
              {/* Row 1: Name & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">{branch.name}</h4>
                  <p className="text-xs text-slate-400 dark:text-white/45 mt-1">{branch.email}</p>
                  <p className="text-xs text-slate-400 dark:text-white/45 mt-0.5">{branch.phone}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${branch.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                  {branch.status}
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
                      console.log("Branch to update:", values)
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
                      title: "Delete Branch?",
                      description: `Are you sure you want to delete ${branch.name}? This action cannot be undone.`,
                      confirmText: "Delete",
                      iconType: "danger",
                      onConfirm: () => {
                        console.log("Delete branch:", branch.id)
                      }
                    })
                  }} 
                  className="text-slate-400 hover:text-rose-500 transition-colors" 
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
