import React, { useState } from "react";
import { Check } from "lucide-react";
import { useCashiers } from "@/hooks/useCashiers";

export default function CashierPermissionsList({ defaultSelected = [] }) {
  const { permissionsQuery } = useCashiers();
  const permissions = permissionsQuery.data || [];
  
  const [selectedIds, setSelectedIds] = useState(defaultSelected);

  const togglePermission = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  if (permissionsQuery.isLoading) {
    return <div className="text-center py-6 text-slate-500 text-sm">Loading permissions...</div>;
  }

  if (permissions.length === 0) {
    return <div className="text-center py-6 text-slate-500 text-sm">No permissions found.</div>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 pb-4">
        {permissions.map((perm) => {
          const isSelected = selectedIds.includes(perm.funcId);
          return (
            <div
              key={perm.funcId}
              onClick={() => togglePermission(perm.funcId)}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? "border-[#2563eb] bg-blue-50/50 dark:border-blue-500 dark:bg-blue-500/10"
                  : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
                  isSelected
                    ? "bg-[#2563eb] border-[#2563eb] dark:bg-blue-500 dark:border-blue-500"
                    : "bg-white border-slate-300 dark:bg-[#131c31] dark:border-white/20"
                }`}
              >
                {isSelected && <Check size={14} className="text-white" />}
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {perm.funcDesc}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Hidden field to pass data to Form submit handler */}
      <input type="hidden" name="functionalityIDs" value={JSON.stringify(selectedIds)} />
    </div>
  );
}
