import { useState, useMemo } from "react"
import { Eye, Loader2 } from "lucide-react"
import { useDialog } from "@/components/globals/DialogProvider"
import GlobalSelect from "@/components/globals/GlobalSelect"
import GlobalButton from "@/components/globals/GlobalButton"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { transactionHistory, getSubsidiaries, getCashierList, listOfTerminal } from "@/lib/api/endpoints"
import { useDashboardContext } from "@/pages/dashboard/context"

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp));
  return date.toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' });
}

const formatAmount = (amt) => {
  if (!amt) return "0.00";
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(parseFloat(amt));
}

export default function LiveTransactionsPage() {
  const { profile, accounts } = useDashboardContext()
  const { openDetailDialog } = useDialog()
  const queryClient = useQueryClient()
  
  const [status, setStatus] = useState("selected")
  const [branch, setBranch] = useState("selected")
  const [cashier, setCashier] = useState("selected")
  const [terminal, setTerminal] = useState("selected")

  // Fetch dropdown options
  const { data: subData } = useQuery({ 
    queryKey: ["getSubsidiaries"], 
    queryFn: () => getSubsidiaries(), 
    staleTime: 0 
  })
  
  const { data: cashierData } = useQuery({ 
    queryKey: ["getCashierList"], 
    queryFn: () => getCashierList(), 
    staleTime: 0 
  })
  
  const { data: terminalData } = useQuery({ 
    queryKey: ["listOfTerminal"], 
    queryFn: () => listOfTerminal(), 
    staleTime: 0 
  })

  const subOptions = useMemo(() => [
    { value: "selected", label: "All Subsidiaries" },
    ...(subData?.data || []).map(s => ({ value: s.CORPCUSTSUBID, label: s.SUBNAME }))
  ], [subData])

  const cashierOptions = useMemo(() => [
    { value: "selected", label: "All Cashiers" },
    ...(cashierData?.records || []).map(c => ({ value: c.merCashierID, label: `${c.cashierFName} ${c.cashierLName}` }))
  ], [cashierData])

  const terminalOptions = useMemo(() => [
    { value: "selected", label: "All Terminals" },
    ...(terminalData?.listOfTerminal || []).map(t => ({ value: t.terminalId, label: t.terminalName }))
  ], [terminalData])

  // Current applied filters for the API request
  const defaultAccountId = accounts?.[0]?.ACCOUNTNUMBER || ""
  
  const [appliedFilters, setAppliedFilters] = useState({
    pageNum: 1,
    pageSize: 10,
    accountId: defaultAccountId
  })

  // Ensure accountId is set if it was missing initially (e.g., if accounts loaded after component mount)
  if (!appliedFilters.accountId && defaultAccountId) {
    setAppliedFilters(prev => ({ ...prev, accountId: defaultAccountId }))
  }

  // Fetch Transactions based on appliedFilters
  const { data: txData, isFetching, refetch } = useQuery({
    queryKey: ["transactionHistory", appliedFilters],
    queryFn: () => transactionHistory(appliedFilters),
    staleTime: 0,
    enabled: !!appliedFilters.accountId, // Wait until we have the account ID
  })

  const transactions = txData?.transactionHistories || []

  const handleApplyFilter = () => {
    const payload = {
      pageNum: 1,
      pageSize: 10,
      accountId: defaultAccountId
    }
    if (status !== "selected") payload.txnStatus = status
    if (branch !== "selected") payload.custSubID = branch
    if (cashier !== "selected") payload.cashierID = cashier
    if (terminal !== "selected") payload.termID = terminal
    setAppliedFilters(payload)
  }

  const handleResetFilters = () => {
    setStatus("selected")
    setBranch("selected")
    setCashier("selected")
    setTerminal("selected")
    setAppliedFilters({
      pageNum: 1,
      pageSize: 10,
      accountId: defaultAccountId
    })
  }

  const handleRefresh = () => {
    refetch()
    queryClient.invalidateQueries({ queryKey: ["getSubsidiaries"] })
    queryClient.invalidateQueries({ queryKey: ["getCashierList"] })
    queryClient.invalidateQueries({ queryKey: ["listOfTerminal"] })
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
            {formatAmount(tx.amount)} <span className="text-2xl text-slate-400 dark:text-white/50 font-medium">{tx.currencyCode}</span>
          </span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Success
          </span>
        </>
      ),
      details: [
        { label: "Date", value: formatDate(tx.creationDate) },
        { label: "Reference No", value: tx.confirmationNumber },
        { label: "Transaction Type", value: tx.txnName },
        { label: "Currency Code", value: tx.currencyCode }
      ]
    })
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1b55ad] dark:text-blue-400 mb-1">
            Activity
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Live Transactions
          </h2>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none p-4 sm:p-6 min-h-[500px]">
        
        {/* Filters Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-[#2563eb] dark:text-white flex items-center gap-2">
            Live Transactions
            {isFetching && <Loader2 className="w-4 h-4 animate-spin text-[#2563eb]" />}
          </h3>
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
              { value: "selected", label: "All Statuses" },
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
            options={subOptions}
          />
          <GlobalSelect
            label="Cashier"
            value={cashier}
            onChange={setCashier}
            containerClassName="flex-1 min-w-[180px]"
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={cashierOptions}
          />
          <GlobalSelect
            label="Terminal ID"
            value={terminal}
            onChange={setTerminal}
            containerClassName="flex-1 min-w-[180px]"
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={terminalOptions}
          />
          <GlobalButton 
            onClick={handleApplyFilter}
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
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500 dark:text-white/50">
                    {isFetching ? "Loading transactions..." : "No transactions available"}
                  </td>
                </tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-blue-50/50 dark:bg-white/[0.02]'} hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors`}>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">{formatDate(tx.creationDate)}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">{tx.confirmationNumber}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">{formatAmount(tx.amount)} {tx.currencyCode}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">{tx.txnName}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">{tx.cashierID || "----"}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-white/70">Success</td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={() => handleViewTxDetails(tx)}
                        className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Card Feed — Mobile View (Hidden on desktop) */}
        <div className="md:hidden space-y-3 mb-8">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/10 rounded-xl">
              {isFetching ? "Loading transactions..." : "No transactions available"}
            </div>
          ) : (
            transactions.map((tx, idx) => (
              <div 
                key={idx}
                onClick={() => handleViewTxDetails(tx)}
                className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 active:bg-slate-50 dark:active:bg-white/10 transition-colors cursor-pointer flex flex-col gap-3"
              >
                {/* Row 1: Type & Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2563eb] dark:text-blue-400 uppercase tracking-wider">
                    {tx.txnName}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase">
                    Success
                  </span>
                </div>

                {/* Row 2: Ref & Amount */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Ref: {tx.confirmationNumber}</p>
                    <p className="text-xs text-slate-400 dark:text-white/40 mt-1">{formatDate(tx.creationDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatAmount(tx.amount)} <span className="text-xs text-slate-400 dark:text-white/40 font-medium">{tx.currencyCode}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center mb-4">
          <GlobalButton 
            onClick={handleRefresh}
            variant="primary" 
            className="w-full sm:w-auto px-8 h-10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            Refresh
          </GlobalButton>
        </div>
      </div>
    </div>
  )
}
