import React, { useState } from "react";
import { X } from "lucide-react";
import GlobalInput from "./GlobalInput";
import GlobalButton from "./GlobalButton";

export default function PayBillDialogContent({ data, onPay, onClose }) {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onPay) onPay(amount);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 px-6 py-5 flex items-center justify-between shrink-0">
        <h3 className="text-slate-900 dark:text-white text-base font-bold uppercase tracking-wider">
          Pay Bill
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="p-8 space-y-5">
        <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-white/50 font-medium">
              Biller Name
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {data?.billerName}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-white/50 font-medium">
              Template Name
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {data?.templateName}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-white/50 font-medium">
              Reference
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {data?.referenceNo}
            </span>
          </div>
        </div>

        <div>
          <GlobalInput
            name="amount"
            label="Payment Amount"
            type="number"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<span className="text-slate-400 font-semibold">$</span>}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 px-6 py-4 flex justify-end gap-3 shrink-0">
        <GlobalButton
          type="button"
          variant="secondary"
          onClick={onClose}
          className="uppercase tracking-wider font-bold h-10 text-xs px-6"
        >
          Cancel
        </GlobalButton>
        <GlobalButton
          type="submit"
          variant="primary"
          className="uppercase tracking-wider font-bold h-10 text-xs px-6"
        >
          Submit Payment
        </GlobalButton>
      </div>
    </form>
  );
}
