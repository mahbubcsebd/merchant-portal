import React from "react";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import GlobalButton from "@/components/globals/GlobalButton";
import { useLanguage } from "@/components/globals/LanguageProvider";

export default function ScheduledTransfersForm({
  formData,
  setFormData,
  handleFormSubmit,
  setLocalView,
  isPending,
}) {
  const { t } = useLanguage();

  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-4 sm:p-8 w-full max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          {t("edit_scheduled_transfer", "Edit Scheduled Transfer")}
        </h2>
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
          <GlobalInput
            label={t("beneficiary_name", "Beneficiary Name")}
            value={formData.BENFNAME || formData.payTo || ""}
            disabled
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <GlobalInput
              label={t("bank_name", "Bank Name")}
              value={formData.BENFBNKID || formData.bank || ""}
              disabled
            />
            <GlobalInput
              label={t("account_number", "Account No.")}
              value={formData.BENFACC || formData.account || ""}
              disabled
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <GlobalInput
              label={t("amount", "Amount")}
              value={formData.TXNAMOUNT || formData.amount || ""}
              onChange={(e) =>
                setFormData({ ...formData, TXNAMOUNT: e.target.value })
              }
              type="number"
              placeholder="0.00"
              required
            />
            <GlobalInput
              label={t("currency", "Currency")}
              value={formData.BENFACCUR || formData.currency || ""}
              disabled
            />
          </div>

          <GlobalInput
            label={t("description", "Description")}
            value={formData.TXNDESC || formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, TXNDESC: e.target.value })
            }
            placeholder={t("ph_transfer_description", "Transfer description...")}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <GlobalInput
              label={t("start_date", "Start Date")}
              type="date"
              value={formData.STRDATE || formData.startDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, STRDATE: e.target.value })
              }
              required
            />
            <GlobalSelect
              label={t("how_often", "How Often")}
              value={formData.FREQUENCY || formData.howOften || ""}
              onChange={(e) =>
                setFormData({ ...formData, FREQUENCY: e.target.value })
              }
              options={[
                { value: "1", label: t("freq_once", "Once") },
                { value: "2", label: t("freq_daily", "Daily") },
                { value: "3", label: t("freq_weekly", "Weekly") },
                { value: "4", label: t("freq_biweekly", "Bi-Weekly") },
                { value: "5", label: t("freq_monthly", "Monthly") },
                { value: "6", label: t("freq_quarterly", "Quarterly") },
                { value: "7", label: t("freq_halfyearly", "Half-Yearly") },
                { value: "8", label: t("freq_annually", "Annually") },
              ]}
              required
            />
          </div>

          <GlobalInput
            label={t("until_end_date", "Until (End Date)")}
            type="date"
            value={formData.ENDDATE || formData.endDate || ""}
            onChange={(e) =>
              setFormData({ ...formData, ENDDATE: e.target.value })
            }
            hint={t("endless_hint", "Leave blank for endless")}
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <GlobalButton
              type="button"
              onClick={() => setLocalView("list")}
              variant="secondary"
              className="w-full sm:w-auto uppercase tracking-wide text-xs font-bold sm:px-8"
              disabled={isPending}
            >
              {t("buttonCancel", t("cancel", "Cancel"))}
            </GlobalButton>
            <GlobalButton
              type="submit"
              variant="primary"
              className="w-full sm:w-auto uppercase tracking-wide text-xs font-bold sm:px-8"
              disabled={isPending}
            >
              {isPending ? t("submitting", "Submitting...") : t("buttonSubmit", t("submit", "Submit"))}
            </GlobalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
