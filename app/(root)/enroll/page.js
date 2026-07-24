import { EnrollForm } from "@/components/EnrollForm";
import Image from "next/image";
import Link from "next/link";

export default function EnrollPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Main Split ───────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-screen">

        {/* ── Left Panel (50%) ─────────────────── */}
        <div className="relative w-full lg:w-1/2 flex flex-col justify-between overflow-hidden bg-[#0f1829] text-white
          p-8 sm:p-10 md:p-12 lg:p-14 xl:p-16 2xl:p-20
          min-h-[300px] lg:min-h-screen shrink-0">

          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-[-20%] left-[-10%] w-[70%] aspect-square rounded-full bg-blue-600/25 blur-[100px]" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[60%] aspect-square rounded-full bg-[#e65625]/20 blur-[90px]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          {/* Logo */}
          <div className="relative z-10">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <Image
                src="/images/logo.svg"
                alt="mPay Network"
                width={120}
                height={47}
                priority
                className="w-[95px] sm:w-[110px] lg:w-[115px] xl:w-[120px] 2xl:w-[125px] h-auto"
              />
            </Link>
          </div>

          {/* Hero text */}
          <div className="relative z-10 flex flex-col gap-5 my-auto py-10 lg:py-0">
            <div className="inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#e65625] animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide">Merchant Registration</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-[1.12] tracking-tight">
              Join thousands of<br />
              businesses already<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                growing with us.
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-sm xl:text-base text-slate-400 leading-relaxed max-w-[320px] xl:max-w-[360px]">
              Set up your merchant account in minutes and start accepting payments from day one.
            </p>

            {/* Stats */}
            <div className="flex gap-8 xl:gap-10 pt-2">
              {[
                { value: "5 min", label: "Setup time" },
                { value: "Zero", label: "Setup fee" },
                { value: "24/7", label: "Support" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-xl sm:text-2xl xl:text-3xl font-bold text-white">{value}</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <p className="relative z-10 text-xs text-slate-400 font-medium">
            © 2025 mPay Network. All rights reserved.
          </p>
        </div>

        {/* ── Right Panel (50%) ────────────────── */}
        <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center
          py-12 lg:py-8 bg-slate-50 dark:bg-[#0d1220]">

          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #2563eb 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-[90px] pointer-events-none" aria-hidden="true" />

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
              <Image src="/images/logo.svg" alt="mPay Network" width={110} height={43} priority className="h-auto w-auto" />
            </Link>
          </div>

          {/* Form */}
          <div className="relative z-10 w-full flex flex-col
            px-6 sm:px-10 md:px-16 lg:px-10 xl:px-0
            max-w-full lg:max-w-[420px] xl:max-w-[440px] 2xl:max-w-[480px]">
            <EnrollForm />
          </div>
        </div>

      </div>
    </div>
  );
}
