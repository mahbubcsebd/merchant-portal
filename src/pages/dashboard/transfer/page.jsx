import React, { useState } from "react";
import { useLanguage } from "@/components/globals/LanguageProvider";
import TransferFormView from "@/components/transfer/TransferFormView";
import ManageBeneficiaries from "@/components/transfer/ManageBeneficiaries";
import ManageScheduledTransfers from "@/components/transfer/ManageScheduledTransfers";

export default function TransferPage() {
  const { t } = useLanguage();
  const [view, setView] = useState("transfer"); // 'transfer', 'manage_beneficiaries', 'manage_scheduled'
  const [viewData, setViewData] = useState(null);

  return (
    <div className="w-full animate-in fade-in duration-300">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {t("transfer_to_bank", "Transfer To Bank")}
        </h2>
      </div>

      {view === "transfer" && <TransferFormView setView={setView} />}
      {view === "manage_beneficiaries" && (
        <ManageBeneficiaries setView={setView} setViewData={setViewData} />
      )}
      {view === "manage_scheduled" && (
        <ManageScheduledTransfers setView={setView} />
      )}
    </div>
  );
}
