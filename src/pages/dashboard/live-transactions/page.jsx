
import { useState } from "react"
import { Eye } from "lucide-react"
import { useDialog } from "@/components/globals/DialogProvider"
import GlobalSelect from "@/components/globals/GlobalSelect"
import GlobalButton from "@/components/globals/GlobalButton"

const MOCK_TRANSACTIONS = [
  { id: 1, date: "05/27/2026", refNo: "64853941", amount: "1.63", currency: "XCG", type: "Pay to Email", userId: "", status: "Success" },
  { id: 2, date: "05/21/2026", refNo: "218295500", amount: "4.70", currency: "XCG", type: "Pay to Email", userId: "", status: "Success" },
  { id: 3, date: "04/30/2026", refNo: "365281875", amount: "1.10", currency: "XCG", type: "Pay to Email", userId: "", status: "Success" },
]

export default function LiveTransactionsPage() {
  const { openDetailDialog } = useDialog()
  
  const [status, setStatus] = useState("selected")
  const [branch, setBranch] = useState("selected")
  const [cashier, setCashier] = useState("selected")
  const [terminal, setTerminal] = useState("selected")

  const handleResetFilters = () => {
    setStatus("selected")
    setBranch("selected")
    setCashier("selected")
    setTerminal("selected")
  }

  const handleViewTxDetails = (tx) => {
    openDetailDialog({
      title: "Transaction Details",
      accentHeader: (
        <>
          <span className="text-xs font-semibold text-[#2563eb] dark:text-blue-400 uppercase tracking-widest mb-1">
            Amount
          </span>
          <span className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {tx.amount} <span className="text-2xl text-slate-400 dark:text-white/50 font-medium">{tx.currency}</span>
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
            {tx.status}
          </span>
        </>
      ),
      details: [
        { label: "Date", value: tx.date },
        { label: "Reference No", value: tx.refNo },
        { label: "Transaction Type", value: tx.type },
        { label: "Currency Code", value: tx.currency }
      ]
    })
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-0.5">
            Activity
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Live Transactions
          </h2>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none p-4 sm:p-6 min-h-[500px]">
        
        {/* Filters Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-[#2563eb] dark:text-white">Live Transactions</h3>
          <button 
            onClick={handleResetFilters} 
            className="text-xs sm:text-sm font-semibold text-[#2563eb] hover:underline"
          >
            Reset Filter
          </button>
        </div>

        {/* Filters Grid */}
        <div className="flex flex-col xl:flex-row gap-4 mb-8 items-stretch xl:items-end">
          <GlobalSelect
            label="Status"
            value={status}
            onChange={setStatus}
            containerClassName="flex-1 min-w-[180px]"
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={[
              { value: "selected", label: "Select Status" },
              { value: "P", label: "Success" },
              { value: "R", label: "Failed" },
              { value: "C", label: "Pending" }
            ]}
          />
          <GlobalSelect
            label="Branch"
            value={branch}
            onChange={setBranch}
            containerClassName="flex-1 min-w-[180px]"
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={[
              { value: "selected", label: "Select Subsidiary" },
              { value: "518", label: "Silicon Valley" },
              { value: "575", label: "Pangalawang Branch" }
            ]}
          />
          <GlobalSelect
            label="Cashier"
            value={cashier}
            onChange={setCashier}
            containerClassName="flex-1 min-w-[180px]"
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={[
              { value: "selected", label: "Select Cashiers" },
              { value: "Terchik", label: "lou marie" }
            ]}
          />
          <GlobalSelect
            label="Terminal ID"
            value={terminal}
            onChange={setTerminal}
            containerClassName="flex-1 min-w-[180px]"
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={[
              { value: "selected", label: "Select Terminal" },
              { value: "test1", label: "test1" }
            ]}
          />
          <GlobalButton 
            variant="primary" 
            className="w-full xl:w-auto shrink-0 h-10 px-8 text-xs font-bold uppercase tracking-wider"
          >
            Filter
          </GlobalButton>
        </div>

        {/* Data Table — Desktop View (Hidden on mobile) */}
        <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Date</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Reference No</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Amount</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Transaction Type</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">User ID</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">Status</th>
                <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-center">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {MOCK_TRANSACTIONS.map((tx, idx) => (
                <tr key={tx.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-blue-50/50 dark:bg-white/[0.02]'} hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors`}>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70">{tx.date}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70">{tx.refNo}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70">{tx.amount} {tx.currency}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70">{tx.type}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70">{tx.userId}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-white/70">{tx.status}</td>
                  <td className="px-5 py-4 text-center">
                    <button 
                      onClick={() => handleViewTxDetails(tx)}
                      className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card Feed — Mobile View (Hidden on desktop) */}
        <div className="md:hidden space-y-3 mb-8">
          {MOCK_TRANSACTIONS.map((tx) => (
            <div 
              key={tx.id}
              onClick={() => handleViewTxDetails(tx)}
              className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 active:bg-slate-50 dark:active:bg-white/10 transition-colors cursor-pointer flex flex-col gap-3"
            >
              {/* Row 1: Type & Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2563eb] dark:text-blue-400 uppercase tracking-wider">
                  {tx.type}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase">
                  {tx.status}
                </span>
              </div>

              {/* Row 2: Ref & Amount */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Ref: {tx.refNo}</p>
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-1">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {tx.amount} <span className="text-xs text-slate-400 dark:text-white/40 font-medium">{tx.currency}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-4">
          <GlobalButton variant="primary" className="w-full sm:w-auto px-8 h-10 text-xs font-bold uppercase tracking-wider">
            Refresh
          </GlobalButton>
        </div>
      </div>
    </div>
  )
}
