import { Bell } from "lucide-react"
import { useDashboardContext } from "@/pages/dashboard/context"
import { useLanguage } from "@/components/globals/LanguageProvider"

export function LatestActivities() {
  const { notifications } = useDashboardContext();
  const { t } = useLanguage();

  const recentNotifications = [...notifications]
    .sort((a, b) => Number(b.msgId) - Number(a.msgId))
    .slice(0, 5);

  return (
    <div>
      <div className="flex items-center h-9 mb-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("latest_activities", "Latest Activities")}</h3>
      </div>

      <div className="rounded-xl overflow-hidden
        border border-slate-200 dark:border-white/8
        bg-white dark:bg-white/[0.03]
        shadow-sm dark:shadow-none
        divide-y divide-slate-100 dark:divide-white/5">
        
        {recentNotifications.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-500 text-sm">No recent activities found.</div>
        ) : (
          recentNotifications.map((activity) => (
            <div
              key={activity.msgId}
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
                <Bell size={16} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                    {activity.notificationTypeName}
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed line-clamp-2"
                   dangerouslySetInnerHTML={{ __html: activity.notificationMsg?.replace(/\n/g, "<br>") }}
                />
                <p className="text-[10px] text-slate-400 dark:text-white/25 font-medium mt-1.5">
                  {activity.timeAgo}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
