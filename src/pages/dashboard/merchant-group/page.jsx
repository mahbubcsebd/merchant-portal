import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  LogIn,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getGroupMerchants, loginMerchantForGroup } from "@/lib/api/endpoints";
import { useDashboardContext } from "@/pages/dashboard/context";
import { useLanguage } from "@/components/globals/LanguageProvider";
import { useDialog } from "@/components/globals/DialogProvider";
import GlobalButton from "@/components/globals/GlobalButton";
import { cn } from "@/lib/utils";

export default function DashboardMerchantGroup() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openConfirmDialog } = useDialog();
  const { setIsSoftLogin } = useDashboardContext();

  const [selectedCustId, setSelectedCustId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: merchantsData,
    isLoading,
    isFetching,
    refetch,
    isError,
    error,
  } = useQuery({
    queryKey: ["getGroupMerchants"],
    queryFn: () => getGroupMerchants(),
    staleTime: 0,
    retry: 1,
  });

  const merchantsList = useMemo(() => {
    return merchantsData?.records || merchantsData?.data || [];
  }, [merchantsData]);

  const filteredMerchants = useMemo(() => {
    if (!searchQuery.trim()) return merchantsList;
    const q = searchQuery.toLowerCase().trim();
    return merchantsList.filter((m) => {
      const idMatch = String(m.custId || "").toLowerCase().includes(q);
      const nameMatch = String(m.custName || "").toLowerCase().includes(q);
      const emailMatch = String(m.email || "").toLowerCase().includes(q);
      const cityMatch = String(m.city || "").toLowerCase().includes(q);
      const phoneMatch = String(m.mobilePhone || "").includes(q);
      return idMatch || nameMatch || emailMatch || cityMatch || phoneMatch;
    });
  }, [merchantsList, searchQuery]);

  const selectedMerchant = useMemo(() => {
    if (!selectedCustId) return null;
    return merchantsList.find((m) => String(m.custId) === String(selectedCustId)) || null;
  }, [merchantsList, selectedCustId]);

  const loginMutation = useMutation({
    mutationFn: (custId) => loginMerchantForGroup({ custId }),
    onSuccess: async (data) => {
      if (data?.status === "success" || data?.statusCode === 0) {
        localStorage.setItem("is_soft_login", "true");
        if (setIsSoftLogin) {
          setIsSoftLogin(true);
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
          queryClient.invalidateQueries({ queryKey: ["userProfileForceFlag"] }),
          queryClient.invalidateQueries({ queryKey: ["accounts"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboardInfo"] }),
          queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        ]);

        navigate("/dashboard");
      } else {
        openConfirmDialog({
          title: t("error_title", "Error"),
          description:
            data?.message ||
            t("soft_login_failed", "Unable to switch into merchant account."),
          iconType: "danger",
          hideCancel: true,
        });
      }
    },
    onError: (err) => {
      openConfirmDialog({
        title: t("error_title", "Error"),
        description:
          err?.message ||
          t("soft_login_failed", "Unable to switch into merchant account."),
        iconType: "danger",
        hideCancel: true,
      });
    },
  });

  const handleRowClick = (custId) => {
    if (loginMutation.isPending) return;
    if (String(selectedCustId) === String(custId)) {
      setSelectedCustId(null);
    } else {
      setSelectedCustId(custId);
    }
  };

  const handleLoginClick = (e, custIdToLogin) => {
    if (e) e.stopPropagation();
    const targetId = custIdToLogin || selectedCustId;
    if (!targetId || loginMutation.isPending) return;
    loginMutation.mutate(String(targetId));
  };

  return (
    <div className="w-full space-y-5 pb-8 animate-[fade-up_0.3s_ease-out]">
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[#2563eb] dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t("mg_title", "Merchant Group")}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t(
                  "mg_subtitle",
                  "Manage, view, and switch between merchants linked to this group",
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all disabled:opacity-50 shrink-0"
            title={t("refresh", "Refresh")}
          >
            <RefreshCw
              size={14}
              className={cn(isFetching && "animate-spin text-[#2563eb]")}
            />
            <span className="hidden sm:inline">{t("refresh", "Refresh")}</span>
          </button>

          <GlobalButton
            onClick={() => handleLoginClick(null, selectedCustId)}
            disabled={!selectedCustId || loginMutation.isPending}
            loading={loginMutation.isPending}
            className="h-10 px-4 text-xs font-semibold shrink-0"
          >
            <LogIn size={14} className="mr-1.5" />
            <span>
              {selectedMerchant
                ? `${t("login", "Login")} (${selectedMerchant.custName || selectedMerchant.custId})`
                : t("login", "Login")}
            </span>
          </GlobalButton>
        </div>
      </div>

      {/* ── Filter / Search Bar ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              "search_merchants_placeholder",
              "Search by name, ID, email, or city...",
            )}
            className="w-full h-10 pl-9 pr-3 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#2563eb] dark:focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>{t("total_merchants", "Total merchants")}:</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
            {merchantsList.length}
          </span>
          {searchQuery && (
            <span className="text-slate-400">
              ({filteredMerchants.length} {t("filtered", "matching")})
            </span>
          )}
        </div>
      </div>

      {/* ── Table Container ─────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
            <div className="w-8 h-8 border-3 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">
              {t("loading_merchants", "Loading group merchants...")}
            </p>
          </div>
        ) : isError ? (
          <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-500 flex items-center justify-center mb-3">
              <AlertCircle size={22} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {t("failed_load_merchants", "Failed to load merchants")}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
              {error?.message ||
                t("error_occurred", "An error occurred while fetching group merchants.")}
            </p>
            <GlobalButton
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs"
            >
              {t("retry", "Try Again")}
            </GlobalButton>
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
              <Building2 size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {t("no_merchant", "No merchants found")}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              {searchQuery
                ? t(
                    "no_matching_merchants",
                    "No merchants matched your search query. Try clearing the filter.",
                  )
                : t(
                    "no_merchants_in_group",
                    "No merchant accounts have been linked to this merchant group yet.",
                  )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">{t("cId", "Cust ID")}</th>
                  <th className="py-3.5 px-4">{t("cname", "Merchant Name")}</th>
                  <th className="py-3.5 px-4">{t("ms_agentEmail", "Email")}</th>
                  <th className="py-3.5 px-4">
                    {t("mg_mobile_number", "Mobile Number")}
                  </th>
                  <th className="py-3.5 px-4">{t("global_status", "Status")}</th>
                  <th className="py-3.5 px-4">{t("crCity", "City")}</th>
                  <th className="py-3.5 px-4">
                    {t("businessType", "Business Type")}
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    {t("action", "Action")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredMerchants.map((merchant, index) => {
                  const isSelected =
                    String(selectedCustId) === String(merchant.custId);
                  const isActive =
                    merchant.status === "A" ||
                    merchant.status === "Active" ||
                    merchant.status === "ACTIVE";

                  const phoneDisplay = [
                    merchant.phCountryCode ? `+${merchant.phCountryCode}` : "",
                    merchant.mobilePhone || "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr
                      key={merchant.custId || index}
                      onClick={() => handleRowClick(merchant.custId)}
                      className={cn(
                        "cursor-pointer transition-colors duration-150 select-none",
                        isSelected
                          ? "bg-blue-50/80 dark:bg-blue-500/10 border-l-4 border-l-[#2563eb] dark:border-l-blue-400"
                          : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40",
                      )}
                    >
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                        {merchant.custId || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {merchant.custName || "—"}
                        </div>
                        {merchant.businessCategory && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            {merchant.businessCategory}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {merchant.email ? (
                          <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                            <Mail
                              size={12}
                              className="text-slate-400 shrink-0"
                            />
                            <span className="truncate">{merchant.email}</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {phoneDisplay ? (
                          <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <Phone
                              size={12}
                              className="text-slate-400 shrink-0"
                            />
                            <span>{phoneDisplay}</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                            isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
                          )}
                        >
                          {isActive ? (
                            <CheckCircle2 size={11} className="shrink-0" />
                          ) : (
                            <XCircle size={11} className="shrink-0" />
                          )}
                          <span>
                            {isActive
                              ? t("active", "Active")
                              : merchant.status || t("inactive", "Inactive")}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {merchant.city ? (
                          <span className="flex items-center gap-1.5">
                            <MapPin
                              size={12}
                              className="text-slate-400 shrink-0"
                            />
                            <span>{merchant.city}</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {merchant.businessType || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => handleLoginClick(e, merchant.custId)}
                          disabled={loginMutation.isPending}
                          className={cn(
                            "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm",
                            isSelected
                              ? "bg-[#2563eb] text-white hover:bg-blue-700"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700",
                          )}
                        >
                          <LogIn size={12} />
                          <span>{t("login", "Login")}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

