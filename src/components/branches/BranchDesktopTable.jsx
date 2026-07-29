import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import BranchFormFields from "./BranchFormFields";

export default function BranchDesktopTable({
  branches,
  isLoading,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 mb-8">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
            <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
              Branch Name
            </th>
            <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
              Email
            </th>
            <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
              Phone Number
            </th>
            <th className="px-5 py-4 font-bold text-slate-900 dark:text-white">
              Status
            </th>
            <th className="px-5 py-4 font-bold text-slate-900 dark:text-white text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-white/10">
          {isLoading ? (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-10 text-center text-slate-500"
              >
                <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
                Loading branches...
              </td>
            </tr>
          ) : branches.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-10 text-center text-slate-500 font-medium"
              >
                No branches found.
              </td>
            </tr>
          ) : (
            branches.map((branch, idx) => (
              <tr
                key={branch.CORPCUSTSUBID || idx}
                className={`${idx % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-blue-50/50 dark:bg-white/[0.02]"} hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors`}
              >
                <td className="px-5 py-4 text-slate-600 dark:text-white/70 capitalize">
                  {branch.SUBNAME}
                </td>
                <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                  {branch.EMAILADDR}
                </td>
                <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                  {branch.MOBILEPHONE}
                </td>
                <td className="px-5 py-4 text-slate-600 dark:text-white/70">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${branch.SUBSTATUS === "A" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}
                  >
                    {branch.SUBSTATUS === "A" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-3">
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
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
