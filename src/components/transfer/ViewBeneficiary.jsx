import React from "react";
import GlobalButton from "@/components/globals/GlobalButton";

export default function ViewBeneficiary({ setView, beneficiary }) {
  return (
    <div className="w-full max-w-lg mx-auto animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-4 sm:p-8 w-full text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          View
        </h2>

        <div className="flex flex-col gap-0 text-sm">
          <div className="flex items-center py-2.5 px-3 sm:px-4 bg-[#e4f1fe] dark:bg-blue-900/20 rounded-t-lg border-b border-white/40 dark:border-white/5">
            <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">
              First & Last Name
            </span>
            <span className="w-1/2 text-slate-700 dark:text-white/80 text-left truncate">
              {beneficiary?.name}
            </span>
          </div>
          <div className="flex items-center py-2.5 px-3 sm:px-4 bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
            <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">
              Beneficiary Nickname
            </span>
            <span className="w-1/2 text-slate-700 dark:text-white/80 text-left truncate">
              {beneficiary?.nickname}
            </span>
          </div>
          <div className="flex items-center py-2.5 px-3 sm:px-4 bg-[#e4f1fe] dark:bg-blue-900/20 border-b border-white/40 dark:border-white/5">
            <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">
              Account Number
            </span>
            <span className="w-1/2 text-slate-700 dark:text-white/80 text-left truncate">
              {beneficiary?.account}
            </span>
          </div>
          <div className="flex items-center py-2.5 px-3 sm:px-4 bg-white dark:bg-transparent border-b border-slate-100 dark:border-white/5">
            <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">
              Bank
            </span>
            <span className="w-1/2 text-slate-700 dark:text-white/80 text-left truncate">
              {beneficiary?.bank}
            </span>
          </div>
          <div className="flex items-center py-2.5 px-3 sm:px-4 bg-[#e4f1fe] dark:bg-blue-900/20 rounded-b-lg">
            <span className="w-1/2 text-slate-900 dark:text-white font-bold text-right pr-4">
              Currency
            </span>
            <span className="w-1/2 text-slate-700 dark:text-white/80 text-left truncate">
              {beneficiary?.currency}
            </span>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <GlobalButton
            onClick={() => setView("manage_beneficiaries")}
            variant="secondary"
            className="w-full sm:w-auto px-8 text-xs font-bold uppercase tracking-wider h-10"
          >
            Back
          </GlobalButton>
        </div>
      </div>
    </div>
  );
}
