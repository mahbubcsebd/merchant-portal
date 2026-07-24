"use client"

import Link from "next/link"
import Image from "next/image"
import { Contact, Phone, PhoneCall, Printer, MapPin, Globe } from "lucide-react"
import GlobalButton from "@/components/globals/GlobalButton"

export default function ContactPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-white transition-colors">
      
      {/* Top Logo */}
      <div className="mb-10">
        {/* Placeholder for Logo, since next/image might need exact path, I'll use a styled text or if they have logo.svg, I'll use it. Assuming they have logo in public, but let's just use a clean styled text for mPay */}
        <div className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-1">
          <span className="text-[#f97316]">m</span>
          <span className="text-[#2563eb]">Pay</span>
          <span className="text-xs font-semibold text-[#2563eb] self-end mb-1">network</span>
        </div>
      </div>

      <div className="max-w-xl w-full p-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131c31] shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col items-center">
        
        {/* Card Icon */}
        <div className="mb-8 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border-2 border-[#2563eb]/20 text-[#2563eb] dark:text-blue-400">
          <Contact size={48} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-8 w-full text-left border-b border-slate-200 dark:border-white/10 pb-4">
          Contact Us
        </h2>

        {/* Details */}
        <div className="w-full space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
            <span className="w-28 font-semibold text-slate-700 dark:text-white/80 shrink-0 flex items-center gap-2 text-sm">
              <Phone size={16} className="text-slate-400" /> Phone
            </span>
            <span className="text-slate-600 dark:text-white/60 text-sm">416-572-2191</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
            <span className="w-28 font-semibold text-slate-700 dark:text-white/80 shrink-0 flex items-center gap-2 text-sm">
              <PhoneCall size={16} className="text-emerald-500" /> Whatsapp
            </span>
            <span className="text-slate-600 dark:text-white/60 text-sm">416-572-2191</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
            <span className="w-28 font-semibold text-slate-700 dark:text-white/80 shrink-0 flex items-center gap-2 text-sm">
              <Printer size={16} className="text-slate-400" /> Fax
            </span>
            <span className="text-slate-600 dark:text-white/60 text-sm">416-352-7754</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
            <span className="w-28 font-semibold text-slate-700 dark:text-white/80 shrink-0 flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-rose-500" /> Address
            </span>
            <span className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
              mPayNetwork Inc, Corporate Office, TD Canada Trust Tower, 161 Bay St., 27th Floor Toronto, ON M5J2S1
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
            <span className="w-28 font-semibold text-slate-700 dark:text-white/80 shrink-0 flex items-center gap-2 text-sm">
              <Globe size={16} className="text-blue-500" /> Website
            </span>
            <a href="https://www.mpaynetwork.com" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] hover:underline text-sm font-medium transition-colors">
              https://www.mpaynetwork.com
            </a>
          </div>

        </div>

        {/* Back to Dashboard Button */}
        <div className="mt-12 w-full flex justify-center pt-6 border-t border-slate-200 dark:border-white/10">
          <Link href="/dashboard">
            <GlobalButton 
              variant="secondary"
              className="px-8 text-xs font-bold uppercase tracking-wider"
            >
              Back To Dashboard
            </GlobalButton>
          </Link>
        </div>

      </div>
    </div>
  )
}
