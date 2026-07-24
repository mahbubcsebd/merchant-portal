"use client"

import { useState } from "react"
import Link from "next/link"
import GlobalInput from "@/components/globals/GlobalInput"
import GlobalSelect from "@/components/globals/GlobalSelect"
import GlobalButton from "@/components/globals/GlobalButton"

export default function PayBillsPage() {
  const [biller, setBiller] = useState("")
  const [fromAccount, setFromAccount] = useState("")
  const [when, setWhen] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Pay Bills Form Submitted")
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Bill Payments
        </h2>
      </div>

      {/* Main card */}
      <div className="max-w-lg mx-auto rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm p-4 sm:p-8">
        <div className="flex justify-start mb-4">
          <Link href="/dashboard/pay-bills/templates" className="text-xs font-bold text-[#2563eb] hover:underline uppercase tracking-wider">
            Manage Bill Template
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* To (Biller) */}
          <GlobalSelect
            label="To"
            required
            value={biller}
            onChange={setBiller}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={[
              { value: "14186", label: "Bill Template 001" },
              { value: "14187", label: "Electricity Board" },
              { value: "14188", label: "Internet Provider" }
            ]}
          />

          {/* Biller Details (Shows when a biller is selected) */}
          {biller && (
            <div className="bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-white/80">Biller Name</span>
                <span className="text-slate-600 dark:text-white/60">
                  {biller === "14186" ? "Bill Template 001" : biller === "14187" ? "Electricity Board" : "Internet Provider"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-white/80">Reference No</span>
                <span className="text-slate-600 dark:text-white/60">REF-{biller}-9921</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-white/80">Currency</span>
                <span className="text-slate-600 dark:text-white/60">XCG</span>
              </div>
            </div>
          )}

          {/* From Account */}
          <GlobalSelect
            label="From"
            required
            value={fromAccount}
            onChange={setFromAccount}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={[
              { value: "1000025963", label: "2,497.63 XCG" },
              { value: "1000028042", label: "0.00 JMD" }
            ]}
          />

          {/* Amount */}
          <GlobalInput
            label="Amount"
            required
            type="text"
            inputMode="decimal"
            maxLength={18}
            placeholder="0.00"
            rightElement={<span className="text-sm font-medium text-slate-400 select-none">XCG</span>}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
          />

          {/* Description */}
          <GlobalInput
            label="Description"
            type="text"
            maxLength={30}
            placeholder="Payment description"
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
          />

          {/* When */}
          <GlobalSelect
            label="When"
            required
            value={when}
            onChange={setWhen}
            labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            options={[
              { value: "immediate", label: "Immediate" },
              { value: "scheduled", label: "Scheduled" }
            ]}
          />

          {/* Submit */}
          <div className="flex justify-center pt-4 border-t border-dashed border-slate-200 dark:border-white/10 mt-6">
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
  )
}
