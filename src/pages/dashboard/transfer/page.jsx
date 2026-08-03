import React, { useState } from "react";
import TransferFormView from "@/components/transfer/TransferFormView";
import ManageBeneficiaries from "@/components/transfer/ManageBeneficiaries";
import ViewBeneficiary from "@/components/transfer/ViewBeneficiary";
import ManageScheduledTransfers from "@/components/transfer/ManageScheduledTransfers";

export default function TransferPage() {
  const [view, setView] = useState("transfer"); // 'transfer', 'manage_beneficiaries', 'view_beneficiary', 'manage_scheduled'
  const [viewData, setViewData] = useState(null);

  return (
    <div className="w-full animate-in fade-in duration-300">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Transfer To Bank
        </h2>
      </div>

      {view === "transfer" && <TransferFormView setView={setView} />}
      {view === "manage_beneficiaries" && (
        <ManageBeneficiaries setView={setView} setViewData={setViewData} />
      )}
      {view === "view_beneficiary" && (
        <ViewBeneficiary setView={setView} beneficiary={viewData} />
      )}
      {view === "manage_scheduled" && (
        <ManageScheduledTransfers setView={setView} />
      )}
    </div>
  );
}
