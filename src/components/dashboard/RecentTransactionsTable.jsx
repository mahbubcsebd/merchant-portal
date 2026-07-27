import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useDashboardContext } from "@/pages/dashboard/layout"
import { useMemo } from "react"

const columns = [
  {
    id: "icon",
    cell: ({ row }) => (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        row.original.direction === "in"
          ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-400"
      }`}>
        {row.original.direction === "in"
          ? <ArrowDownLeft size={14} />
          : <ArrowUpRight size={14} />
        }
      </div>
    ),
    size: 40,
  },
  {
    accessorKey: "type",
    header: "Transaction",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{row.getValue("type")}</p>
        <p className="text-xs text-slate-400 dark:text-white/30 truncate">
          {row.original.description} <span className="inline sm:hidden">· {row.original.date}</span>
        </p>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-xs text-slate-400 dark:text-white/30 font-medium whitespace-nowrap">
        {row.getValue("date")}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const formattedAmount = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.getValue("amount"));
      return (
        <div className={`text-right font-semibold text-sm shrink-0 ${
          row.original.direction === "in"
            ? "text-emerald-500 dark:text-emerald-400"
            : "text-red-500 dark:text-red-400"
        }`}>
          {row.original.direction === "in" ? "+" : "-"}{row.original.currency} {formattedAmount}
        </div>
      )
    },
  },
]

export function RecentTransactionsTable({ currencyDropdown }) {
  const { transactions } = useDashboardContext();

  const formattedTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.slice(0, 6).map((txn, index) => ({
      id: `TXN-${index}`,
      type: txn.txnName || "Transaction",
      description: txn.description || "",
      amount: parseFloat(txn.amount) || 0, // Using amount directly assuming it's correctly scaled in old portal
      currency: txn.currencyCode || "XCG",
      direction: txn.txnDebitCreditCode === "C" ? "in" : "out",
      date: txn.txnDate || "",
    }));
  }, [transactions]);

  const table = useReactTable({
    data: formattedTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <div className="flex items-center justify-between h-9 mb-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
        {currencyDropdown}
      </div>

      <div className="rounded-xl overflow-hidden
        border border-slate-200 dark:border-white/8
        bg-white dark:bg-white/[0.03]
        shadow-sm dark:shadow-none">
        <table className="w-full">
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4
                  hover:bg-slate-50 dark:hover:bg-white/[0.03]
                  transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={cell.column.id === "amount" ? { marginLeft: "auto" } : undefined}
                    className={
                      cell.column.id === "type" 
                        ? "flex-1 min-w-0" 
                        : cell.column.id === "date" 
                          ? "hidden sm:block" 
                          : ""
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
