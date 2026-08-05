import { Phone, PhoneCall, Printer, MapPin, Globe } from "lucide-react"
import { useLanguage } from "@/components/globals/LanguageProvider"

export default function ContactPage() {
  const { t } = useLanguage();

  const CONTACT_DATA = [
    {
      id: 'phone',
      title: t("bp_phone", t("phone", "Phone")),
      value: '416-572-2191',
      icon: Phone,
      colorClass: 'text-sky-500',
      bgClass: 'bg-sky-50 dark:bg-sky-500/10',
      link: 'tel:4165722191',
      description: t("call_us_directly", "Call us directly")
    },
    {
      id: 'whatsapp',
      title: t("whatsapp", "WhatsApp"),
      value: '416-572-2191',
      icon: PhoneCall,
      colorClass: 'text-emerald-500',
      bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
      link: 'https://wa.me/14165722191',
      description: t("chat_with_support", "Chat with our support")
    },
    {
      id: 'fax',
      title: t("fax", "Fax"),
      value: '416-352-7754',
      icon: Printer,
      colorClass: 'text-violet-500',
      bgClass: 'bg-violet-50 dark:bg-violet-500/10',
      link: 'tel:4163527754',
      description: t("send_us_fax", "Send us a fax")
    },
    {
      id: 'website',
      title: t("contactus.website", t("website", "Website")),
      value: 'www.mpaynetwork.com',
      icon: Globe,
      colorClass: 'text-blue-500',
      bgClass: 'bg-blue-50 dark:bg-blue-500/10',
      link: 'https://www.mpaynetwork.com',
      description: t("visit_our_homepage", "Visit our homepage")
    },
    {
      id: 'address',
      title: t("contact_address", t("address", "Address")),
      value: 'mPayNetwork Inc, Corporate Office, TD Canada Trust Tower, 161 Bay St., 27th Floor Toronto, ON M5J2S1',
      icon: MapPin,
      colorClass: 'text-rose-500',
      bgClass: 'bg-rose-50 dark:bg-rose-500/10',
      link: 'https://maps.google.com/?q=161+Bay+St,+Toronto,+ON+M5J+2S1,+Canada',
      description: t("visit_corporate_office", "Visit our corporate office")
    }
  ]

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10 flex flex-col items-center pt-8">
      
      <div className="max-w-4xl w-full p-8 md:p-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#131c31] shadow-xl animate-in zoom-in-95 duration-500 flex flex-col">
        
        {/* Title */}
        <div className="mb-10 w-full text-center border-b border-slate-200 dark:border-white/10 pb-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {t("contact_us", t("get_in_touch", "Get In Touch"))}
          </h2>
          <p className="text-slate-500 dark:text-white/60 max-w-lg mx-auto">
            {t("contact_desc", "Have questions or need assistance? Reach out to us through any of the channels below. We're here to help!")}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {CONTACT_DATA.map((item) => (
            <a 
              key={item.id}
              href={item.link}
              target={item.id === 'website' || item.id === 'address' || item.id === 'whatsapp' ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`group flex items-start gap-5 p-6 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04] hover:shadow-lg hover:border-${item.colorClass.split('-')[1]}-300 transition-all duration-300 ${item.id === 'address' ? 'md:col-span-2' : ''}`}
            >
              <div className={`p-4 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-110 ${item.bgClass} ${item.colorClass}`}>
                <item.icon size={24} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-900 dark:text-white text-lg">
                  {item.title}
                </span>
                <span className="text-sm font-medium text-slate-400 dark:text-white/50 mb-1">
                  {item.description}
                </span>
                <span className="text-slate-600 dark:text-white/80 font-medium leading-relaxed">
                  {item.value}
                </span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}
