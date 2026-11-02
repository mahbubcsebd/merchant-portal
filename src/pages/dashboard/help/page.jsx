import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Send,
  Receipt,
  Users,
  Store,
  FileText,
  Headphones,
  HelpCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import GlobalInput from "@/components/globals/GlobalInput";
import GlobalButton from "@/components/globals/GlobalButton";
import { useLanguage } from "@/components/globals/LanguageProvider";

export default function HelpPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Quick Start Guides / Features (Uniform Theme Icon Styling)
  const GUIDES = useMemo(
    () => [
      {
        id: "transactions",
        category: "transactions",
        title: t("guide_transactions_title", "Live Transactions & Monitoring"),
        description: t(
          "guide_transactions_desc",
          "Track incoming merchant payments in real time, inspect receipt details, and filter by cashier, status, or date.",
        ),
        icon: Receipt,
        href: "/dashboard/live-transactions",
        linkText: t("view_transactions", "View Transactions"),
      },
      {
        id: "transfers",
        category: "transfers",
        title: t("guide_transfers_title", "Bank Transfers & Beneficiaries"),
        description: t(
          "guide_transfers_desc",
          "Move business funds directly to linked bank accounts, schedule recurring payroll or vendor transfers, and manage saved beneficiaries.",
        ),
        icon: Send,
        href: "/dashboard/transfer",
        linkText: t("transfer_funds", "Transfer Funds"),
      },
      {
        id: "cashiers",
        category: "cashiers",
        title: t("guide_cashiers_title", "Cashier & Staff Access"),
        description: t(
          "guide_cashiers_desc",
          "Create cashier logins for POS terminals, assign permissions per subsidiary branch, and toggle active statuses securely.",
        ),
        icon: Users,
        href: "/dashboard/manage-cashiers",
        linkText: t("manage_cashiers", "Manage Cashiers"),
      },
      {
        id: "branches",
        category: "branches",
        title: t("guide_branches_title", "Branch & Terminal Management"),
        description: t(
          "guide_branches_desc",
          "Organize physical retail branches, configure merchant POS terminals, and maintain accurate subsidiary business details.",
        ),
        icon: Store,
        href: "/dashboard/branches",
        linkText: t("manage_branches", "Manage Branches"),
      },
      {
        id: "reports",
        category: "reports",
        title: t("guide_reports_title", "Financial Reports & Statements"),
        description: t(
          "guide_reports_desc",
          "Export transaction histories, generate monthly accounting statements in CSV format, and audit operational turnover.",
        ),
        icon: FileText,
        href: "/dashboard/reports",
        linkText: t("view_reports", "View Reports"),
      },
      {
        id: "security",
        category: "security",
        title: t("guide_security_title", "Account Security & Limits"),
        description: t(
          "guide_security_desc",
          "Update wallet PINs, configure daily transaction thresholds, and manage payment notifications in Administration.",
        ),
        icon: ShieldCheck,
        href: "/dashboard/admin",
        linkText: t("security_settings", "Security Settings"),
      },
    ],
    [t],
  );

  // FAQ Items categorized
  const FAQ_ITEMS = useMemo(
    () => [
      {
        id: "faq-1",
        category: "transactions",
        categoryLabel: t("transactions", "Transactions"),
        question: t("faq_q1", "How do I see incoming customer transactions?"),
        answer: t(
          "faq_a1",
          "Go to 'Live Transactions' from the sidebar. You will see a live ledger of all incoming and outgoing payments. You can filter by Branch, Cashier, Terminal ID, or transaction status (Completed, Pending, Reversed) and export receipts anytime.",
        ),
      },
      {
        id: "faq-2",
        category: "transactions",
        categoryLabel: t("transactions", "Transactions"),
        question: t("faq_q2", "What do the different transaction statuses mean?"),
        answer: t(
          "faq_a2",
          "• Completed: Payment was successfully processed and funds are settled in your wallet.\n• Pending: Transaction is currently in flight or awaiting multi-party confirmation.\n• Reversed: The transaction was cancelled or refunded back to the sender.\n• Failed: Payment failed due to insufficient funds, invalid account, or network error.",
        ),
      },
      {
        id: "faq-3",
        category: "transfers",
        categoryLabel: t("transfers", "Transfers"),
        question: t("faq_q3", "How do I transfer funds from my wallet to my bank account?"),
        answer: t(
          "faq_a3",
          "Navigate to 'Transfer To Bank' in the sidebar. Select your source currency account, choose a saved beneficiary or enter new bank details, enter the amount, and confirm the transfer with your secure PIN.",
        ),
      },
      {
        id: "faq-4",
        category: "transfers",
        categoryLabel: t("transfers", "Transfers"),
        question: t("faq_q4", "Can I set up scheduled recurring payments?"),
        answer: t(
          "faq_a4",
          "Yes. Under 'Transfer To Bank', click on 'Manage Scheduled Transfers'. You can create daily, weekly, or monthly transfer schedules with customized start and end dates.",
        ),
      },
      {
        id: "faq-5",
        category: "cashiers",
        categoryLabel: t("cashiers", "Cashiers"),
        question: t("faq_q5", "How do I add a new cashier for our checkout counters?"),
        answer: t(
          "faq_a5",
          "Open 'Manage Cashier' from the sidebar and click '+ Add Cashier'. Assign a Cashier ID, select their assigned branch subsidiary, configure their permissions, and set a starting PIN. You can toggle their active status on or off at any moment.",
        ),
      },
      {
        id: "faq-6",
        category: "branches",
        categoryLabel: t("branches", "Branches"),
        question: t("faq_q_branch", "How do I manage branches and terminals?"),
        answer: t(
          "faq_a_branch",
          "Navigate to 'Branches' to view all retail branches. Each branch has its own contact email, phone number, and linked POS terminals. You can view subsidiary details and manage cashiers associated with each branch.",
        ),
      },
      {
        id: "faq-7",
        category: "reports",
        categoryLabel: t("reports", "Reports"),
        question: t("faq_q7", "Where can I view and download statement reports?"),
        answer: t(
          "faq_a7",
          "Head to 'Reports' from the navigation. Select your date range, choose transaction type filters, and click 'Search'. You can then view summaries or download an export file for your bookkeeping software.",
        ),
      },
      {
        id: "faq-8",
        category: "security",
        categoryLabel: t("security", "Security"),
        question: t("faq_q6", "How do I change my wallet PIN?"),
        answer: t(
          "faq_a6",
          "Go to 'Administration' in the sidebar and choose 'Change PIN'. Enter your current PIN followed by your new 4-digit PIN. Never share your PIN with anyone; our support team will never ask for it.",
        ),
      },
    ],
    [t],
  );

  // Tabs for Categories
  const CATEGORY_TABS = useMemo(
    () => [
      { id: "all", label: t("all_topics", "All Topics") },
      { id: "transactions", label: t("transactions", "Transactions") },
      { id: "transfers", label: t("transfers", "Transfers") },
      { id: "cashiers", label: t("cashiers", "Cashiers") },
      { id: "branches", label: t("branches", "Branches") },
      { id: "reports", label: t("reports", "Reports") },
      { id: "security", label: t("security", "Security") },
    ],
    [t],
  );

  // Filtered Guides matching search query
  const filteredGuides = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return GUIDES.filter((guide) => {
      const matchesCategory =
        selectedCategory === "all" || guide.category === selectedCategory;
      const matchesSearch =
        !q ||
        guide.title.toLowerCase().includes(q) ||
        guide.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [GUIDES, selectedCategory, searchQuery]);

  // Filtered FAQ Items matching search query and tab selection
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [FAQ_ITEMS, selectedCategory, searchQuery]);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("help_and_support", "Help & Knowledge Base")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t(
              "help_page_subtitle",
              "Guides, answers, and operational assistance for your merchant portal",
            )}
          </p>
        </div>
      </div>

      {/* ── Search & Filter Bar ──────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input using Standard GlobalInput */}
        <div className="w-full md:w-96 relative">
          <GlobalInput
            placeholder={t("help_search_placeholder", "Search guides, transfers, cashiers, PIN...")}
            leftIcon={<Search size={16} className="text-slate-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            containerClassName="w-full"
            rightElement={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  title={t("clear", "Clear")}
                >
                  <X size={14} />
                </button>
              ) : null
            }
          />
        </div>

        {/* Standard Segmented Tabs Matching Reports and Live Transactions */}
        <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-0.5 shadow-2xs overflow-x-auto scrollbar-none shrink-0 max-w-full">
          {CATEGORY_TABS.map((tab, idx) => {
            const isActive = selectedCategory === tab.id;
            const isNextActive = CATEGORY_TABS[idx + 1]?.id === selectedCategory;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  "h-8 px-3.5 flex items-center justify-center text-xs font-semibold transition-all rounded-md cursor-pointer whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-[#2563eb] text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5",
                  !isActive &&
                    !isNextActive &&
                    idx < CATEGORY_TABS.length - 1 &&
                    "border-r border-slate-200/70 dark:border-white/10",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Quick Start Guides ──────────────────────────────── */}
      {filteredGuides.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t("quick_guides", "Quick Start Guides")}
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              ({filteredGuides.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {/* Consistent Single-Color Icon Container */}
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-[#2563eb] dark:text-blue-400 shrink-0">
                      <guide.icon size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {guide.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-white/60 leading-relaxed mb-4">
                    {guide.description}
                  </p>
                </div>

                <Link
                  to={guide.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] dark:text-blue-400 hover:gap-2 transition-all pt-2.5 border-t border-slate-100 dark:border-white/5"
                >
                  <span>{guide.linkText}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FAQ Section ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("frequently_asked_questions", "Frequently Asked Questions")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t(
                "faq_subtitle",
                "Answers to common questions about using your merchant account",
              )}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {filteredFaqs.length} {t("topics", "topics")}
          </span>
        </div>

        {/* FAQ Accordion List */}
        <div className="divide-y divide-slate-100 dark:divide-white/5 pt-1">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen size={32} className="mx-auto text-slate-300 dark:text-white/20 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-white/80">
                {t("no_faq_found", "No matching questions found")}
              </p>
              <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                {t(
                  "try_different_search",
                  "Try searching for another keyword or reach out to support.",
                )}
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={faq.id} className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#2563eb] shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="text-sm font-bold text-slate-800 dark:text-white/90 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      size={17}
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "transform rotate-180 text-blue-600 dark:text-blue-400" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-3 pl-5 pr-2 text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed whitespace-pre-line bg-slate-50/60 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-100 dark:border-white/5">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Contact Support Callout Card ────────────────────── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[#2563eb] dark:text-blue-400 flex items-center justify-center shrink-0">
            <Headphones size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("still_need_help", "Still need help or have questions?")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
              {t(
                "support_cta_desc",
                "Our customer support team is available via direct phone, WhatsApp chat, and email to assist your business.",
              )}
            </p>
          </div>
        </div>

        {/* GlobalButton component used consistently */}
        <Link to="/dashboard/contact">
          <GlobalButton
            variant="primary"
            className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider h-10 px-8"
          >
            {t("contact_support", "Contact Support")}
          </GlobalButton>
        </Link>
      </div>
    </div>
  );
}
