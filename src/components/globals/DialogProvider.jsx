
import React, { createContext, useContext, useState } from "react"
import { 
  X, Lock, Trash2, Mail, Phone, MapPin, User, Globe, Image as ImageIcon,
  Check, ChevronsUpDown
} from "lucide-react"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog"
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList 
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import GlobalInput from "@/components/globals/GlobalInput"
import GlobalSelect from "@/components/globals/GlobalSelect"
import GlobalButton from "@/components/globals/GlobalButton"
import GlobalUpload from "@/components/globals/GlobalUpload"

const COUNTRY_CODES = [
  { code: '+880', flag: '🇧🇩', country: 'Bangladesh' },
  { code: '+1', flag: '🇺🇸', country: 'USA' },
  { code: '+63', flag: '🇵🇭', country: 'Philippines' },
  { code: '+44', flag: '🇬🇧', country: 'UK' },
  { code: '+91', flag: '🇮🇳', country: 'India' },
];

const DialogContext = createContext(null)

export function useDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider")
  }
  return context
}

export function DialogProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dialogType, setDialogType] = useState(null) // 'form' | 'confirm' | 'detail' | 'pay'
  const [dialogProps, setDialogProps] = useState({})

  const openFormDialog = (type, mode, data, onSave) => {
    setDialogProps({ type, mode, data, onSave })
    setDialogType("form")
    setIsOpen(true)
  }

  const openConfirmDialog = (props) => {
    setDialogProps(props)
    setDialogType("confirm")
    setIsOpen(true)
  }

  const openDetailDialog = (props) => {
    setDialogProps(props)
    setDialogType("detail")
    setIsOpen(true)
  }

  const openPayBillDialog = (props) => {
    setDialogProps(props)
    setDialogType("pay")
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
    // Clear props after close animation completes
    setTimeout(() => {
      setDialogType(null)
      setDialogProps({})
    }, 200)
  }

  // Get max width based on type and mode
  const getContentSizeClass = () => {
    if (dialogType === "form") {
      if (dialogProps.type === "biller-template") return "sm:max-w-md"
      return "sm:max-w-4xl" // Branch/Cashier form is a larger grid
    }
    if (dialogType === "detail") return "sm:max-w-lg"
    if (dialogType === "confirm") {
      if (dialogProps.iconType === "danger") return "sm:max-w-sm"
      return "sm:max-w-md"
    }
    if (dialogType === "pay") return "sm:max-w-md"
    return "sm:max-w-md"
  }

  return (
    <DialogContext.Provider value={{
      openFormDialog,
      openConfirmDialog,
      openDetailDialog,
      openPayBillDialog,
      closeDialog
    }}>
      {children}

      <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className={`${getContentSizeClass()} bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/5 shadow-2xl rounded-2xl overflow-hidden p-0 gap-0`} showCloseButton={false}>
          {dialogType === "form" && (
            <FormDialogContent {...dialogProps} onClose={closeDialog} />
          )}
          {dialogType === "confirm" && (
            <ConfirmDialogContent {...dialogProps} onClose={closeDialog} />
          )}
          {dialogType === "detail" && (
            <DetailDialogContent {...dialogProps} onClose={closeDialog} />
          )}
          {dialogType === "pay" && (
            <PayBillDialogContent {...dialogProps} onClose={closeDialog} />
          )}
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  )
}

/* ─────────────────────────────────────────────────────────────
    FORM DIALOG CONTENT
────────────────────────────────────────────────────────────── */
function FormDialogContent({ type, mode, data, onSave, onClose }) {
  const isView = mode === "view"
  
  // Local states for selects
  const [mobileDial, setMobileDial] = useState(data?.mobileDial || "+1")
  const [businessDial, setBusinessDial] = useState(data?.businessDial || "+1")
  const [openMobileCountryBox, setOpenMobileCountryBox] = useState(false)
  const [openBusinessCountryBox, setOpenBusinessCountryBox] = useState(false)
  const [subsidiary, setSubsidiary] = useState(data?.subsidiary || "branch1")
  const [category, setCategory] = useState(data?.category || "network")
  const [idType, setIdType] = useState(data?.idType || "corp")
  const [country, setCountry] = useState(data?.country || "usa")
  const [status, setStatus] = useState(data?.status || "Active")
  
  // Upload states
  const [profilePic, setProfilePic] = useState(data?.profilePic || null)
  const [docPic, setDocPic] = useState(data?.docPic || null)

  // Local state for biller template selects
  const [billerName, setBillerName] = useState(data?.billerName || "bank-of-america")
  const [currency, setCurrency] = useState(data?.currency || "xcg")

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const values = Object.fromEntries(formData.entries())
    
    // Merge select values
    if (type !== "biller-template") {
      values.mobileDial = mobileDial
      values.businessDial = businessDial
      values.subsidiary = subsidiary
      values.category = category
      values.idType = idType
      values.country = country
      values.status = status
      values.profilePic = profilePic
      values.docPic = docPic
    } else {
      values.billerName = billerName
      values.currency = currency
    }

    if (onSave) onSave(values)
    onClose()
  }

  const getTitle = () => {
    const action = mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View"
    if (type === "branch") return `${action} Branch`
    if (type === "cashier") return `${action} Cashier`
    if (type === "biller-template") return mode === "add" ? "Create Bill Template" : `${action} Bill Template`
    return ""
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 px-6 py-5 flex items-center justify-between shrink-0">
        <h3 className="text-slate-900 dark:text-white text-base font-bold uppercase tracking-wider">
          {getTitle()}
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
      <div className="p-8 overflow-y-auto space-y-6">
        {type === "biller-template" ? (
          /* Biller Template Form Fields */
          <div className="space-y-4">
            <GlobalSelect
              label="Biller Name"
              required
              disabled={isView}
              value={billerName}
              onChange={setBillerName}
              options={[
                { value: "vidanova", label: "Vidanova" },
                { value: "bank-of-america", label: "Bank of America" },
                { value: "mpay", label: "mPay Network" }
              ]}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            />
            <GlobalInput
              name="templateName"
              label="Bill Template Name"
              required
              disabled={isView}
              defaultValue={data?.templateName || ""}
              placeholder="e.g. Bill Template 001"
            />
            <GlobalInput
              name="referenceNo"
              label="Reference Number"
              required
              disabled={isView}
              defaultValue={data?.referenceNo || ""}
              placeholder="e.g. 12345"
            />
            <GlobalSelect
              label="Currency"
              required
              disabled={isView}
              value={currency}
              onChange={setCurrency}
              options={[
                { value: "xcg", label: "XCG" }
              ]}
              labelClassName="text-sm font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            />
          </div>
        ) : (
          /* Branch / Cashier Form Fields */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left">
            {type === "cashier" ? (
              <>
                <GlobalInput 
                  name="loginId"
                  label="User Login ID" 
                  required 
                  defaultValue={data?.loginId || ""} 
                  disabled={isView} 
                  placeholder="e.g. cashier_john"
                />
                <GlobalInput 
                  name="name"
                  label="Cashier Name" 
                  required 
                  defaultValue={data?.name || ""} 
                  disabled={isView} 
                  placeholder="e.g. John Doe"
                />
              </>
            ) : (
              <>
                <GlobalInput 
                  name="name"
                  label="Branch Name" 
                  required 
                  defaultValue={data?.name || ""} 
                  disabled={isView} 
                  placeholder="e.g. Silicon Valley Branch"
                />
                <GlobalInput 
                  name="email"
                  label="Branch Email Address" 
                  required 
                  type="email"
                  defaultValue={data?.email || ""} 
                  disabled={isView} 
                  placeholder="e.g. branch@example.com"
                />
              </>
            )}

            {/* Mobile Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-white/70">Mobile Phone</label>
              <div className="flex items-stretch w-full h-10 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus-within:border-[#2563eb] dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-[#2563eb] dark:focus-within:ring-blue-500/20 transition-all duration-150 overflow-hidden">
                <Popover open={openMobileCountryBox} onOpenChange={setOpenMobileCountryBox}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={isView}
                      aria-expanded={openMobileCountryBox}
                      className="flex items-center justify-between gap-1.5 h-full px-3 border-r border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.06] text-sm font-medium text-slate-900 dark:text-white shrink-0 transition-colors outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>
                          {
                            COUNTRY_CODES.find(
                              (c) => c.code === mobileDial,
                            )?.flag
                          }
                        </span>
                        <span>{mobileDial}</span>
                      </span>
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-55 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {COUNTRY_CODES.map((country) => (
                            <CommandItem
                              key={country.code}
                              value={country.country + ' ' + country.code}
                              onSelect={() => {
                                setMobileDial(country.code);
                                setOpenMobileCountryBox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  mobileDial === country.code
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              <span className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>
                                  {country.country} ({country.code})
                                </span>
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="relative flex-1 flex items-center">
                  <Phone size={14} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    defaultValue={data?.phone || ""}
                    disabled={isView}
                    className="w-full h-full bg-transparent border-none outline-none pl-9 pr-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650"
                  />
                </div>
              </div>
            </div>

            {/* Business Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-white/70">Business Phone</label>
              <div className="flex items-stretch w-full h-10 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus-within:border-[#2563eb] dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-[#2563eb] dark:focus-within:ring-blue-500/20 transition-all duration-150 overflow-hidden">
                <Popover open={openBusinessCountryBox} onOpenChange={setOpenBusinessCountryBox}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={isView}
                      aria-expanded={openBusinessCountryBox}
                      className="flex items-center justify-between gap-1.5 h-full px-3 border-r border-slate-200 dark:border-white/10 bg-transparent hover:bg-slate-100 dark:hover:bg-white/[0.06] text-sm font-medium text-slate-900 dark:text-white shrink-0 transition-colors outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>
                          {
                            COUNTRY_CODES.find(
                              (c) => c.code === businessDial,
                            )?.flag
                          }
                        </span>
                        <span>{businessDial}</span>
                      </span>
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-55 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[240px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {COUNTRY_CODES.map((country) => (
                            <CommandItem
                              key={country.code}
                              value={country.country + ' ' + country.code}
                              onSelect={() => {
                                setBusinessDial(country.code);
                                setOpenBusinessCountryBox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  businessDial === country.code
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              <span className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>
                                  {country.country} ({country.code})
                                </span>
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="relative flex-1 flex items-center">
                  <Phone size={14} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                  <input
                    id="businessPhone"
                    name="businessPhone"
                    type="tel"
                    placeholder="Enter business phone"
                    defaultValue={data?.businessPhone || ""}
                    disabled={isView}
                    className="w-full h-full bg-transparent border-none outline-none pl-9 pr-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-650"
                  />
                </div>
              </div>
            </div>

            <GlobalSelect
              label="Subsidiary / Parent Branch"
              value={subsidiary}
              onChange={setSubsidiary}
              disabled={isView}
              options={[
                { value: "branch1", label: "Silicon Valley" },
                { value: "branch2", label: "Pangalawang Branch" }
              ]}
              labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            />

            {type === "branch" && (
              <GlobalSelect
                label="Subsidiary / Branch Category"
                value={category}
                onChange={setCategory}
                disabled={isView}
                options={[
                  { value: "network", label: "Network Group" },
                  { value: "hq", label: "Headquarters" }
                ]}
                labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
              />
            )}

            <GlobalSelect
              label="Subsidiary Identity Document Type"
              value={idType}
              onChange={setIdType}
              disabled={isView}
              options={[
                { value: "corp", label: "Articles of Incorporation" },
                { value: "national_id", label: "National ID Card" }
              ]}
              labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            />

            <GlobalInput 
              name="idNo"
              label="Subsidiary Identity Document Identification Number" 
              defaultValue={data?.idNo || ""} 
              disabled={isView} 
              placeholder="e.g. Corp-ID-12345"
            />

            <GlobalSelect
              label="Country"
              value={country}
              onChange={setCountry}
              disabled={isView}
              options={[
                { value: "usa", label: "United States" },
                { value: "ph", label: "Philippines" }
              ]}
              labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            />

            <GlobalInput name="state" label="State" defaultValue={data?.state || ""} disabled={isView} placeholder="e.g. Metro Manila" />
            <GlobalInput name="city" label="City" defaultValue={data?.city || ""} disabled={isView} placeholder="e.g. Manila" />
            <GlobalInput name="zip" label="Zip Code" defaultValue={data?.zip || ""} disabled={isView} placeholder="e.g. 1234" />
            <GlobalInput name="streetNo" label="Street No" defaultValue={data?.streetNo || ""} disabled={isView} placeholder="e.g. 123" />
            <GlobalInput name="streetName" label="Street Name" defaultValue={data?.streetName || ""} disabled={isView} placeholder="e.g. Taft Avenue" />

            <GlobalSelect
              label="Status"
              value={status}
              onChange={setStatus}
              disabled={isView}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" }
              ]}
              labelClassName="text-xs font-semibold text-slate-700 dark:text-white/70 mb-1.5"
            />

            {/* Profile Image & Doc Image */}
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <GlobalUpload
                label="Upload Subsidiary Profile Picture"
                value={profilePic}
                onChange={setProfilePic}
                disabled={isView}
              />
              <GlobalUpload
                label="Upload Subsidiary Identity Document Picture"
                value={docPic}
                onChange={setDocPic}
                disabled={isView}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 px-6 py-4 flex justify-end gap-3 shrink-0">
        <GlobalButton 
          type="button" 
          variant="secondary" 
          onClick={onClose} 
          className="uppercase tracking-wider font-bold h-10 text-xs px-6"
        >
          {isView ? "Close" : "Cancel"}
        </GlobalButton>
        {!isView && (
          <GlobalButton 
            type="submit" 
            variant="primary" 
            className="uppercase tracking-wider font-bold h-10 text-xs px-6"
          >
            {mode === "add" ? "Create" : "Save"}
          </GlobalButton>
        )}
      </div>
    </form>
  )
}

// ImageUploadBox removed in favor of GlobalUpload

/* ─────────────────────────────────────────────────────────────
    CONFIRM DIALOG CONTENT
────────────────────────────────────────────────────────────── */
function ConfirmDialogContent({ title, description, confirmText = "Confirm", cancelText = "Cancel", onConfirm, iconType, onClose }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (onConfirm) {
      setLoading(true)
      try {
        await onConfirm()
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    onClose()
  }

  const getIcon = () => {
    switch (iconType) {
      case "danger":
        return (
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400 flex items-center justify-center mb-6">
            <Trash2 size={32} />
          </div>
        )
      case "warning":
        return (
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center mb-6">
            <Lock size={32} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-8 text-center flex flex-col items-center">
      {getIcon()}
      <DialogHeader className="items-center text-center">
        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </DialogTitle>
        <DialogDescription className="text-sm text-slate-500 dark:text-white/60">
          {description}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-8 flex items-center justify-center gap-3 w-full border-t border-slate-200 dark:border-white/10 pt-5">
        <GlobalButton
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="flex-1 max-w-[150px] uppercase font-bold h-10 text-xs"
        >
          {cancelText}
        </GlobalButton>
        <GlobalButton
          variant={iconType === "danger" ? "danger" : "primary"}
          onClick={handleConfirm}
          isLoading={loading}
          className="flex-1 max-w-[150px] uppercase font-bold h-10 text-xs"
        >
          {confirmText}
        </GlobalButton>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
    DETAIL DIALOG CONTENT
────────────────────────────────────────────────────────────── */
function DetailDialogContent({ title, subtitle, accentHeader, details = [], doneText = "Done", onClose }) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 px-6 py-5 flex items-center justify-between">
        <h3 className="text-slate-900 dark:text-white text-base font-bold uppercase tracking-wider">
          {title}
        </h3>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 overflow-y-auto space-y-6">
        {accentHeader && (
          <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-b from-blue-50 to-transparent dark:from-[#2563eb]/10 dark:to-transparent rounded-xl border border-blue-100 dark:border-blue-500/20">
            {accentHeader}
          </div>
        )}

        <div className="space-y-1">
          {details.map((detail, idx) => (
            <div 
              key={idx} 
              className={`flex justify-between items-center py-3 ${idx < details.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''}`}
            >
              <span className="text-sm text-slate-500 dark:text-white/50">{detail.label}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{detail.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 px-6 py-4 flex justify-end shrink-0">
        <GlobalButton 
          variant="primary" 
          onClick={onClose}
          className="uppercase tracking-wider font-bold h-10 text-xs px-8"
        >
          {doneText}
        </GlobalButton>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
    PAY BILL DIALOG CONTENT
────────────────────────────────────────────────────────────── */
function PayBillDialogContent({ data, onPay, onClose }) {
  const [amount, setAmount] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onPay) onPay(amount)
    onClose()
  }

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
            <span className="text-slate-500 dark:text-white/50 font-medium">Biller Name</span>
            <span className="font-semibold text-slate-900 dark:text-white">{data?.billerName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-white/50 font-medium">Template Name</span>
            <span className="font-semibold text-slate-900 dark:text-white">{data?.templateName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-white/50 font-medium">Reference Number</span>
            <span className="font-semibold text-slate-900 dark:text-white">{data?.referenceNo}</span>
          </div>
        </div>

        <GlobalInput
          label={`Amount to Pay (${data?.currency || "XCG"})`}
          required
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
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
          Pay Bill
        </GlobalButton>
      </div>
    </form>
  )
}
