import React, { useState } from "react";
import GlobalButton from "@/components/globals/GlobalButton";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import { CheckCircle2 } from "lucide-react";

export default function ManageScheduledTransfers({ setView: setParentView }) {
  const [localView, setLocalView] = useState('list') // 'list', 'view', 'form', 'confirm', 'success'
  const [viewData, setViewData] = useState(null)
  const [editIndex, setEditIndex] = useState(null)
  
  const [transfers, setTransfers] = useState([
    { id: 1, payTo: 'trxhh', bank: 'XCG Account', account: '10000000002', fromAccount: '146,309.37 XCG', amount: '5.00', currency: 'XCG', description: 'Test', when: 'Scheduled', startDate: '10/02/2025', howOften: 'Once', until: '', status: 'WAITING' },
    { id: 2, payTo: 'Raxzen', bank: 'XCG Account', account: '10000000003', fromAccount: '146,309.37 XCG', amount: '2.00', currency: 'XCG', description: '', when: 'Scheduled', startDate: '10/02/2025', howOften: 'Half-yearly', until: '09/30/2025', status: 'WAITING' },
    { id: 3, payTo: 'Kelly', bank: 'XCG Account', account: '10000000004', fromAccount: '146,309.37 XCG', amount: '100.00', currency: 'XCG', description: '', when: 'Scheduled', startDate: '06/23/2025', howOften: 'Monthly', until: '07/23/2025', status: 'CANCELLED' }
  ])

  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  const handleEdit = (t, index) => {
    setFormData({ ...t })
    setEditIndex(index)
    setErrors({})
    setLocalView('form')
  }

  const handleDelete = (index) => {
    if(confirm("Are you sure you want to delete this scheduled transfer?")) {
      const updated = [...transfers]
      updated.splice(index, 1)
      setTransfers(updated)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.fromAccount) newErrors.fromAccount = "Required"
    if (!formData.amount || isNaN(formData.amount)) newErrors.amount = "Required"
    if (!formData.when) newErrors.when = "Required"
    if (!formData.startDate) newErrors.startDate = "Required"
    if (!formData.howOften) newErrors.howOften = "Required"
    return newErrors
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
    } else {
      setLocalView('confirm')
    }
  }

  const handleConfirm = () => {
    if (editIndex !== null) {
      const updated = [...transfers]
      updated[editIndex] = { ...updated[editIndex], ...formData }
      setTransfers(updated)
    }
    setLocalView('success')
  }

  if (localView === 'list') {
    return (
      <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-4 sm:p-6 w-full">
          
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white px-1 text-base sm:text-lg">Scheduled Transfers</h3>
          </div>
          
          {/* Table — Desktop View (Hidden on mobile) */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-white/10">
                  <th className="px-4 py-4">Pay To</th>
                  <th className="px-4 py-4 text-center">How Often</th>
                  <th className="px-4 py-4 text-center">Until</th>
                  <th className="px-4 py-4 text-right">Amount</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t, idx) => (
                  <tr key={t.id} className={`${idx % 2 === 0 ? 'bg-[#e4f1fe] dark:bg-blue-900/20' : 'bg-white dark:bg-transparent'} border-b border-slate-100 dark:border-white/5`}>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-white/90">{t.payTo}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-white/80 text-center">{t.howOften}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-white/80 text-center">{t.until}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-white/80 text-right">{t.currency} {t.amount}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-white/80 text-center uppercase text-xs font-semibold">{t.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => { setViewData(t); setLocalView('view'); }} className="text-slate-500 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors" title="View">
                          <Eye size={16} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => handleEdit(t, idx)} className="text-slate-500 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors" title="Edit">
                          <Pencil size={16} strokeWidth={2} />
                        </button>
                        <button className="text-slate-500 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors" title="History">
                          <Clock size={16} strokeWidth={2} />
                        </button>
                        <button onClick={() => handleDelete(idx)} className="text-slate-500 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transfers.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-white/50 text-sm">
                No scheduled transfers found.
              </div>
            )}
          </div>

          {/* Card Feed — Mobile View (Hidden on desktop) */}
          <div className="md:hidden space-y-3">
            {transfers.map((t, idx) => (
              <div 
                key={t.id}
                className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-4"
              >
                {/* Row 1: Name & Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">{t.payTo}</h4>
                    <p className="text-xs text-slate-400 dark:text-white/45 mt-1">{t.howOften} · Until: {t.until || "Endless"}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    t.status === 'WAITING' 
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' 
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                  }`}>
                    {t.status}
                  </span>
                </div>

                {/* Row 2: Amount & Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200 dark:border-white/10">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                    {t.currency} {t.amount}
                  </span>

                  <div className="flex items-center gap-3">
                    <button onClick={() => { setViewData(t); setLocalView('view'); }} className="text-slate-500 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors" title="View">
                      <Eye size={18} strokeWidth={2} />
                    </button>
                    <button onClick={() => handleEdit(t, idx)} className="text-slate-500 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors" title="Edit">
                      <Pencil size={18} strokeWidth={2} />
                    </button>
                    <button className="text-slate-500 hover:text-[#1b55ad] dark:hover:text-blue-400 transition-colors" title="History">
                      <Clock size={18} strokeWidth={2} />
                    </button>
                    <button onClick={() => handleDelete(idx)} className="text-slate-500 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {transfers.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-white/50 text-sm bg-white dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                No scheduled transfers found.
              </div>
            )}
          </div>
  
          <div className="mt-8 flex justify-center">
            <GlobalButton 
              onClick={() => setParentView('transfer')}
              variant="secondary"
              className="w-full sm:w-auto px-8 text-xs font-bold uppercase tracking-wider h-10"
            >
              Back
            </GlobalButton>
          </div>
        </div>
      </div>
    )
  }

  if (localView === 'view') {
    return (
      <div className="w-full max-w-lg mx-auto animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-8 w-full text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">View Scheduled Transfer</h2>
          
          <div className="flex flex-col gap-0 text-sm">
            <div className="flex items-center py-3 px-4 bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Beneficiary Name</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{viewData?.payTo}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-[#e4f1fe] dark:bg-blue-900/20 rounded-t-lg border-b border-white/40 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Beneficiary Bank</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{viewData?.bank}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">From</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">XCG Account</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-[#e4f1fe] dark:bg-blue-900/20 border-b border-white/40 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Account No.</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{viewData?.account}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Amount:</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{viewData?.amount} {viewData?.currency}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-[#e4f1fe] dark:bg-blue-900/20 border-b border-white/40 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Description</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{viewData?.description}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">When</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{viewData?.startDate}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-[#e4f1fe] dark:bg-blue-900/20 rounded-b-lg border-b border-white/40 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">How Often</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{viewData?.howOften}</span>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <GlobalButton 
              onClick={() => setLocalView('list')}
              variant="primary"
              className="px-10 text-xs font-bold uppercase tracking-wider"
            >
              OK
            </GlobalButton>
          </div>
        </div>
      </div>
    )
  }

  if (localView === 'form') {
    return (
      <div className="w-full max-w-xl mx-auto animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-8 w-full">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center sm:text-left">
            Edit Scheduled Transfer
          </h2>

          <div className="flex flex-col gap-2 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-white/70">Beneficiary Name</span>
              <span className="text-slate-900 dark:text-white font-semibold">{formData.payTo}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-white/70">Beneficiary Bank</span>
              <span className="text-slate-900 dark:text-white font-semibold">{formData.bank}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-white/70">Account No.</span>
              <span className="text-slate-900 dark:text-white font-semibold">{formData.account}</span>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            
            <GlobalSelect
              label="From Account"
              required
              value={formData.fromAccount}
              onChange={(val) => setFormData({...formData, fromAccount: val})}
              error={errors.fromAccount}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
              options={[
                { value: "146,309.37 XCG", label: "146,309.37 XCG" },
                { value: "657,260.78 USD", label: "657,260.78 USD" },
                { value: "12.46 CAD", label: "12.46 CAD" }
              ]}
            />

            <GlobalInput 
              label="Amount"
              required
              type="text" 
              value={formData.amount} 
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              error={errors.amount}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
            />

            <GlobalInput 
              label="Description"
              type="text" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
            />

            <GlobalSelect
              label="When"
              required
              value={formData.when}
              onChange={(val) => setFormData({...formData, when: val})}
              error={errors.when}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
              options={[
                { value: "Scheduled", label: "Scheduled" }
              ]}
            />

            <GlobalInput 
              label="Start Date"
              required
              type="text" 
              value={formData.startDate} 
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              placeholder="MM/DD/YYYY"
              error={errors.startDate}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
            />

            <GlobalSelect
              label="How Often"
              required
              value={formData.howOften}
              onChange={(val) => setFormData({...formData, howOften: val})}
              error={errors.howOften}
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
              options={[
                { value: "Once", label: "Once" },
                { value: "Daily", label: "Daily" },
                { value: "Weekly", label: "Weekly" },
                { value: "Bi-weekly", label: "Bi-weekly" },
                { value: "Monthly", label: "Monthly" },
                { value: "Quarterly", label: "Quarterly" },
                { value: "Half-yearly", label: "Half-yearly" },
                { value: "Annual", label: "Annual" }
              ]}
            />

            <div className="flex items-center justify-center gap-4 mt-6">
              <GlobalButton 
                type="button" 
                onClick={() => setLocalView('list')} 
                variant="secondary"
                className="uppercase tracking-wide flex-1 text-xs font-bold"
              >
                Cancel
              </GlobalButton>
              <GlobalButton 
                type="submit" 
                variant="primary"
                className="uppercase tracking-wide flex-1 text-xs font-bold"
              >
                Submit
              </GlobalButton>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (localView === 'confirm') {
    return (
      <div className="w-full max-w-lg mx-auto animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-8 w-full text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Confirm Details</h2>
          
          <div className="flex flex-col gap-0 text-sm">
            <div className="flex items-center py-3 px-4 bg-white dark:bg-[#0a0f1c]/50 border-b border-slate-200 dark:border-white/10">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Beneficiary Name</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.payTo}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-transparent border-b border-slate-200 dark:border-white/10">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">From</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">XCG Account</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-[#0a0f1c]/50 border-b border-slate-200 dark:border-white/10">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Account No.</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.account}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-transparent border-b border-slate-200 dark:border-white/10">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Description</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.description}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-[#0a0f1c]/50 border-b border-slate-200 dark:border-white/10">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Amount:</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.amount} {formData.currency}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-transparent border-b border-slate-200 dark:border-white/10">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">When</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.when}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-[#0a0f1c]/50 border-b border-slate-200 dark:border-white/10">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Start Date</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.startDate}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-transparent border-b border-slate-200 dark:border-white/10">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">How Often</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.howOften}</span>
            </div>
            <div className="py-4 px-4 bg-slate-100 dark:bg-white/5 rounded-b-lg">
              <p className="text-red-600 dark:text-red-400 italic text-sm text-left">
                The amount paid may vary based on the exchange rate on the transaction's scheduled date.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <GlobalButton 
              onClick={() => setLocalView('form')} 
              variant="secondary"
              className="px-6 text-xs font-bold uppercase tracking-wider"
            >
              Change
            </GlobalButton>
            <GlobalButton 
              onClick={handleConfirm} 
              variant="primary"
              className="px-6 text-xs font-bold uppercase tracking-wider"
            >
              Confirm
            </GlobalButton>
          </div>
        </div>
      </div>
    )
  }

  if (localView === 'success') {
    return (
      <div className="w-full max-w-lg mx-auto animate-in fade-in duration-300">
        <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-8 w-full text-center relative overflow-hidden">
          
          <div className="flex justify-center mb-4">
            <div className="bg-[#1b55ad] text-white rounded-full p-3 ring-4 ring-blue-50 dark:ring-blue-900/30">
              <CheckCircle2 size={56} strokeWidth={2.5} />
            </div>
          </div>
          
          <h2 className="text-xl font-medium text-slate-900 dark:text-white mb-8">
            Transaction Successful
          </h2>
          
          <div className="flex flex-col gap-0 text-sm">
            <div className="flex items-center py-3 px-4 bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Beneficiary Name</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.payTo}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-[#e4f1fe] dark:bg-blue-900/20 rounded-t-lg border-b border-white/40 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">From</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">XCG Account</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Account No.</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.account}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-[#e4f1fe] dark:bg-blue-900/20 border-b border-white/40 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Description</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.description}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Amount:</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.amount} {formData.currency}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-[#e4f1fe] dark:bg-blue-900/20 border-b border-white/40 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">When</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.when}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">Start Date</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.startDate}</span>
            </div>
            <div className="flex items-center py-3 px-4 bg-[#e4f1fe] dark:bg-blue-900/20 rounded-b-lg border-b border-white/40 dark:border-white/5">
              <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">How Often</span>
              <span className="w-1/2 text-slate-700 dark:text-white/80 text-left">{formData.howOften}</span>
            </div>
            <div className="py-4 px-4 bg-slate-50 dark:bg-transparent rounded-b-lg mt-2">
              <p className="text-red-600 dark:text-red-400 italic text-sm text-left">
                The amount paid may vary based on the exchange rate on the transaction's scheduled date.
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <GlobalButton 
              onClick={() => setLocalView('list')} 
              variant="primary"
              className="px-10 text-xs font-bold uppercase tracking-wider"
            >
              Done
            </GlobalButton>
          </div>
        </div>
      </div>
    )
  }

  return null
}
