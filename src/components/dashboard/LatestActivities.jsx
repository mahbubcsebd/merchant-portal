
import { QrCode, Smartphone } from "lucide-react"

const MOCK_ACTIVITIES = [
  {
    id: 1, type: "Request QR",
    message: "You have received 1.00 XCG via Request By QR from C*** L** M****. Reference Number: 951614910.",
    date: "Apr 13, 2026 · 23:11", icon: QrCode, amount: "+1.00", currency: "XCG",
  },
  {
    id: 2, type: "Pay to Email",
    message: "You have received via Email 10.00 XCG from *********lego.",
    date: "Feb 03, 2026 · 07:53", icon: Smartphone, amount: "+10.00", currency: "XCG",
  },
  {
    id: 3, type: "Pay to Email",
    message: "You have received via Email 1.00 XCG from *********tore.",
    date: "Feb 03, 2026 · 07:45", icon: Smartphone, amount: "+1.00", currency: "XCG",
  },
  {
    id: 4, type: "Pay to Email",
    message: "You have received via Email 4.55 XCG from *****Nam2.",
    date: "Feb 02, 2026 · 20:33", icon: Smartphone, amount: "+4.55", currency: "XCG",
  },
  {
    id: 5, type: "Pay to Email",
    message: "You have received via Email 20.88 XCG from *****Nam2.",
    date: "Feb 02, 2026 · 20:48", icon: Smartphone, amount: "+20.88", currency: "XCG",
  },
]

export function LatestActivities() {
  return (
    <div>
      <div className="flex items-center h-9 mb-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Latest Activities</h3>
      </div>

      <div className="rounded-xl overflow-hidden
        border border-slate-200 dark:border-white/8
        bg-white dark:bg-white/[0.03]
        shadow-sm dark:shadow-none
        divide-y divide-slate-100 dark:divide-white/5">
        {MOCK_ACTIVITIES.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 px-5 py-4
              hover:bg-slate-50 dark:hover:bg-white/[0.03]
              transition-colors"
          >
            {/* Icon */}
            <div className="w-9 h-9 rounded-xl
              bg-blue-50 dark:bg-[#2563eb]/15
              border border-blue-100 dark:border-[#2563eb]/20
              text-blue-500 dark:text-blue-400
              flex items-center justify-center shrink-0 mt-0.5">
              <activity.icon size={16} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                  {activity.type}
                </p>
                <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 shrink-0">
                  {activity.amount} {activity.currency}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed line-clamp-2">
                {activity.message}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-white/25 font-medium mt-1.5">
                {activity.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
