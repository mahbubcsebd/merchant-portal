import React from "react";
import { getBankName, getCurrencyLabel } from "@/lib/utils/TransferUtils";

export default function TransferBeneficiaryDetails({ selectedBen, welcomeData }) {
  if (!selectedBen) return null;

  return (
    <div className="bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-slate-700 dark:text-white/80">
          Beneficiary Bank
        </span>
        <span className="text-slate-600 dark:text-white/60">
          {getBankName(welcomeData, selectedBen.payeeBankBIC, selectedBen.payeeBankName)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-slate-700 dark:text-white/80">
          Beneficiary Name
        </span>
        <span className="text-slate-600 dark:text-white/60">
          {selectedBen.payeeName}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-slate-700 dark:text-white/80">
          Account No.
        </span>
        <span className="text-slate-600 dark:text-white/60">
          {selectedBen.payeeBankAccount}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-slate-700 dark:text-white/80">
          Currency
        </span>
        <span className="text-slate-600 dark:text-white/60">
          {String(selectedBen.payeeAcctCurr) !== "0"
            ? getCurrencyLabel(welcomeData, selectedBen.payeeAcctCurr)
            : "XCG"}
        </span>
      </div>
    </div>
  );
}
