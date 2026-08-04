import React from "react";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";
import GlobalButton from "@/components/globals/GlobalButton";

export default function ScheduledTransfersForm({
  formData,
  setFormData,
  handleFormSubmit,
  setLocalView,
  isPending,
}) {
  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-4 sm:p-8 w-full max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Edit Scheduled Transfer
        </h2>
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
          <GlobalInput
            label="Beneficiary Name"
            value={formData.BENFNAME || formData.payTo || ""}
            disabled
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <GlobalInput
              label="Bank Name"
              value={formData.BENFBNKID || formData.bank || ""}
              disabled
            />
            <GlobalInput
              label="Account No."
              value={formData.BENFACC || formData.account || ""}
              disabled
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <GlobalInput
              label="Amount"
              value={formData.TXNAMOUNT || formData.amount || ""}
              onChange={(e) =>
                setFormData({ ...formData, TXNAMOUNT: e.target.value })
              }
              type="number"
              placeholder="0.00"
              required
            />
            <GlobalInput
              label="Currency"
              value={formData.BENFACCUR || formData.currency || ""}
              disabled
            />
          </div>

          <GlobalInput
            label="Description"
            value={formData.TXNDESC || formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, TXNDESC: e.target.value })
            }
            placeholder="Transfer description..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <GlobalInput
              label="Start Date"
              type="date"
              value={formData.STRDATE || formData.startDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, STRDATE: e.target.value })
              }
              required
            />
            <GlobalSelect
              label="How Often"
              value={formData.FREQUENCY || formData.howOften || ""}
              onChange={(e) =>
                setFormData({ ...formData, FREQUENCY: e.target.value })
              }
              options={[
                { value: "1", label: "Once" },
                { value: "2", label: "Daily" },
                { value: "3", label: "Weekly" },
                { value: "4", label: "Bi-Weekly" },
                { value: "5", label: "Monthly" },
                { value: "6", label: "Quarterly" },
                { value: "7", label: "Half-Yearly" },
                { value: "8", label: "Annually" },
              ]}
              required
            />
          </div>

          <GlobalInput
            label="Until (End Date)"
            type="date"
            value={formData.ENDDATE || formData.endDate || ""}
            onChange={(e) =>
              setFormData({ ...formData, ENDDATE: e.target.value })
            }
            hint="Leave blank for endless"
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <GlobalButton
              type="button"
              onClick={() => setLocalView("list")}
              variant="secondary"
              className="w-full sm:w-auto uppercase tracking-wide text-xs font-bold sm:px-8"
              disabled={isPending}
            >
              Cancel
            </GlobalButton>
            <GlobalButton
              type="submit"
              variant="primary"
              className="w-full sm:w-auto uppercase tracking-wide text-xs font-bold sm:px-8"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Submit"}
            </GlobalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
