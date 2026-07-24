"use client"

import { MapPin, Pencil, User, Share2, Download, QrCode } from "lucide-react"
import GlobalInput from "@/components/globals/GlobalInput"
import GlobalSelect from "@/components/globals/GlobalSelect"
import GlobalButton from "@/components/globals/GlobalButton"

function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-xl overflow-hidden border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none p-4 sm:p-6 ${className}`}>
      {title && <h3 className="text-base sm:text-lg font-semibold text-[#2563eb] dark:text-white mb-4 sm:mb-6">{title}</h3>}
      {children}
    </div>
  )
}

function InputField({ label, placeholder, icon: Icon, defaultValue, required }) {
  return (
    <GlobalInput
      label={label}
      required={required}
      placeholder={placeholder}
      defaultValue={defaultValue}
      leftIcon={Icon ? <Icon size={14} /> : null}
      labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
    />
  )
}

export default function BusinessProfilePage() {
  return (
    <div className="w-full max-w-[1400px] mx-auto">
      
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-0.5">
            Settings
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Business Profile
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (Forms) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Business Profile */}
          <Card title="Business Profile">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              {/* Logo Upload Section */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#2563eb] p-1">
                  <div className="w-full h-full rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[#2563eb] dark:text-white">
                    <User className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={1.5} />
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-white/40">Upload Company Logo</span>
                <GlobalButton 
                  variant="primary"
                  className="px-5 py-1.5 h-8 text-[10px] sm:text-xs font-bold uppercase tracking-wider"
                >
                  Upload
                </GlobalButton>
              </div>
 
              {/* Form Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <InputField label="Store Name" defaultValue="Huawei Corp" />
                <InputField label="Business User ID" defaultValue="Huawei" />
                <InputField label="Business Phone Number" defaultValue="1223334444" />
                <InputField label="Business Email Address" defaultValue="tester1@moadbusglobal.com" />
              </div>
            </div>
          </Card>

          {/* Address Details */}
          <Card title="Address Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
              <InputField label="Street No" defaultValue="1234" icon={MapPin} required />
              <InputField label="Street Name" defaultValue="Test St" icon={MapPin} required />
              <InputField label="City" defaultValue="Manila" icon={MapPin} required />
              <InputField label="State" defaultValue="NCR" icon={Pencil} required />
              
              <GlobalSelect
                label="Country"
                required
                defaultValue="canada"
                labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
                options={[
                  { value: "canada", label: "Canada" },
                  { value: "usa", label: "USA" },
                  { value: "uk", label: "UK" }
                ]}
              />

              <InputField label="Zip Code" defaultValue="123321" icon={Pencil} required />
            </div>

            <div className="flex justify-end pt-4 border-t border-dashed border-slate-200 dark:border-white/10">
              <GlobalButton 
                variant="primary"
                className="w-full sm:w-auto px-8 text-xs font-bold uppercase tracking-wider h-10"
              >
                Submit
              </GlobalButton>
            </div>
          </Card>
        </div>

        {/* Right Column (QR Code) */}
        <div className="xl:col-span-4 flex flex-col">
          <Card title="Business QR Code" className="flex-1 flex flex-col h-full">
            <div className="flex flex-col items-center flex-1">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Huawei Corp</h4>
              <p className="text-sm text-slate-500 dark:text-white/40 mb-6">@Huawei</p>

              <GlobalSelect
                label="Account"
                defaultValue="xcg"
                labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
                containerClassName="w-full mb-6"
                options={[
                  { value: "xcg", label: "2,497.63 XCG" },
                  { value: "jmd", label: "0.00 JMD" }
                ]}
              />

              <div className="w-44 h-44 sm:w-48 sm:h-48 bg-white rounded-xl p-2 mb-6 flex items-center justify-center border-2 border-slate-200 dark:border-white/10">
                <QrCode className="size-[130px] sm:size-[160px] text-slate-900" strokeWidth={1} />
              </div>

              <div className="w-full flex flex-row gap-3 mt-auto pt-6 border-t border-dashed border-slate-200 dark:border-white/10">
                <GlobalButton 
                  variant="secondary"
                  leftIcon={<Share2 size={16} />}
                  className="flex-1 text-xs font-bold uppercase tracking-wider h-10"
                >
                  Share
                </GlobalButton>
                <GlobalButton 
                  variant="primary"
                  leftIcon={<Download size={16} />}
                  className="flex-1 text-xs font-bold uppercase tracking-wider h-10"
                >
                  Download
                </GlobalButton>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
