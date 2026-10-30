import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/globals/LanguageProvider";

export default function BranchDesktopTable({
  branches,
  isLoading,
  onView,
  onEdit,
  onDelete,
}) {
  const { t } = useLanguage();
  return (
    <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
            <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider">
              {t("subsidiaryName", "Branch Name")}
            </th>
            <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider">
              {t("ms_agentEmail", "Email")}
            </th>
            <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider">
              {t("ucphoneNo", "Phone Number")}
            </th>
            <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider">
              {t("global_status", "Status")}
            </th>
            <th className="px-6 py-4 font-bold text-slate-700 dark:text-white/80 text-xs uppercase tracking-wider text-right">
              {t("teAction", "Action")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {isLoading ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-10 text-center text-slate-500 dark:text-white/50"
              >
                <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-blue-600" />
                Loading branches...
              </td>
            </tr>
          ) : branches.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-10 text-center text-slate-500 dark:text-white/50 font-medium"
              >
                No branches found.
              </td>
            </tr>
          ) : (
            branches.map((branch, idx) => (
              <tr
                key={`desktop-${branch.subId || branch.CORPCUSTSUBID}-${idx}`}
                className={`${idx % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-blue-50/50 dark:bg-white/[0.02]"} hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group`}
              >
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white capitalize">
                  {branch.SUBNAME}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-white/70">
                  {branch.EMAILADDR || "—"}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-white/70 font-mono text-xs">
                  {branch.MOBILEPHONE || "—"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${branch.SUBSTATUS === "A" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/20" : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200/60 dark:border-rose-500/20"}`}
                  >
                    {branch.SUBSTATUS === "A" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onView(branch)}
                      className="w-8 h-8 rounded-lg border border-slate-200/70 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 bg-white dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-500 hover:text-blue-600 dark:text-white/60 dark:hover:text-blue-400 flex items-center justify-center transition-all shadow-2xs"
                      title="View"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => onEdit(branch)}
                      className="w-8 h-8 rounded-lg border border-slate-200/70 dark:border-white/10 hover:border-amber-200 dark:hover:border-amber-500/30 bg-white dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-slate-500 hover:text-amber-600 dark:text-white/60 dark:hover:text-amber-400 flex items-center justify-center transition-all shadow-2xs"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(branch)}
                      className="w-8 h-8 rounded-lg border border-slate-200/70 dark:border-white/10 hover:border-red-200 dark:hover:border-red-500/30 bg-white dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-600 dark:text-white/60 dark:hover:text-red-400 flex items-center justify-center transition-all shadow-2xs"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
