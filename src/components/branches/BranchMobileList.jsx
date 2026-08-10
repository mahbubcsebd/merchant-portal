import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";

export default function BranchMobileList({
  branches,
  isLoading,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="md:hidden space-y-3 mb-8">
      {isLoading ? (
        <div className="text-center py-10 text-slate-500">
          <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
          Loading branches...
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-10 text-slate-500 font-medium">
          No branches available.
        </div>
      ) : (
        branches.map((branch, idx) => (
          <div
            key={`mobile-${branch.subId || branch.CORPCUSTSUBID}-${idx}`}
            className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-4"
          >
            {/* Row 1: Name & Status */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                  {branch.SUBNAME}
                </h4>
                <p className="text-xs text-slate-400 dark:text-white/45 mt-1">
                  {branch.EMAILADDR}
                </p>
                <p className="text-xs text-slate-400 dark:text-white/45 mt-0.5">
                  {branch.MOBILEPHONE}
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${branch.SUBSTATUS === "A" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}
              >
                {branch.SUBSTATUS === "A" ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Row 2: Action Buttons */}
            <div className="flex items-center justify-start gap-4 pt-3 border-t border-dashed border-slate-200 dark:border-white/10">
              <button
                onClick={() => onView(branch)}
                className="text-slate-400 hover:text-[#2563eb] dark:hover:text-blue-400 transition-colors"
                title="View"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => onEdit(branch)}
                className="text-slate-400 hover:text-emerald-500 transition-colors"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => onDelete(branch)}
                className="text-slate-400 hover:text-rose-500 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
