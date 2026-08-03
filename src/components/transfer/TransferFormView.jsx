import React, { useState } from "react";
import GlobalButton from "@/components/globals/GlobalButton";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalSelect from "@/components/globals/GlobalSelect";

export default function TransferFormView({ setView }) {
  const [formData, setFormData] = useState({
    to: "",
    from: "wallet1",
    amount: "",
    currency: "XCG",
    description: "",
    when: "Immediate",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131c31] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-4 sm:p-8 w-full relative">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-3 sm:gap-0 text-center sm:text-left">
          <button
            onClick={() => setView("manage_scheduled")}
            className="text-sm font-bold text-[#1b55ad] dark:text-blue-400 hover:underline"
          >
            Manage Scheduled Transfers
          </button>
          <button
            onClick={() => setView("manage_beneficiaries")}
            className="text-sm font-bold text-[#1b55ad] dark:text-blue-400 hover:underline"
          >
            Manage Beneficiaries
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <GlobalSelect
            label="To"
            required
            value={formData.to}
            onChange={(val) => setFormData({ ...formData, to: val })}
            labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
            options={[
              { value: "beneficiary1", label: "John Doe (ACU Credit Union)" },
              { value: "beneficiary2", label: "Jane Smith (RBC Bank)" },
            ]}
          />

          <GlobalSelect
            label="From"
            required
            value={formData.from}
            onChange={(val) => setFormData({ ...formData, from: val })}
            labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
            options={[
              { value: "wallet1", label: "2,497.63 XCG" },
              { value: "wallet2", label: "1,000.00 USD" },
            ]}
          />

          <div className="flex flex-col sm:flex-row gap-5">
            <GlobalInput
              label="Amount"
              required
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              containerClassName="flex-1"
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
            />

            <GlobalSelect
              label="Currency"
              required
              value={formData.currency}
              onChange={(val) => setFormData({ ...formData, currency: val })}
              containerClassName="flex-1"
              labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
              options={[
                { value: "XCG", label: "XCG" },
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
              ]}
            />
          </div>

          <GlobalInput
            label="Description"
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
          />

          <GlobalSelect
            label="When"
            required
            value={formData.when}
            onChange={(val) => setFormData({ ...formData, when: val })}
            labelClassName="text-sm text-slate-600 dark:text-white/70 mb-1.5"
            options={[
              { value: "Immediate", label: "Immediate" },
              { value: "Scheduled", label: "Scheduled" },
            ]}
          />

          <div className="flex justify-center mt-6">
            <GlobalButton
              type="submit"
              variant="primary"
              className="w-full sm:w-auto px-8 text-xs font-bold uppercase tracking-wider h-10"
            >
              Submit
            </GlobalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
