export const formatDate = (dateString) => {
  if (!dateString) return "";
  
  const str = String(dateString);
  
  if (str.length === 8 && !isNaN(str)) {
    const year = str.substring(0, 4);
    const month = str.substring(4, 6);
    const day = str.substring(6, 8);
    return `${month}/${day}/${year}`;
  }

  if (!isNaN(dateString)) {
    const date = new Date(Number(dateString));
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
  
  return str;
};

export const formatAmount = (amt) => {
  if (!amt) return "0.00";
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    parseFloat(amt),
  );
};

export const getTransactionStatusCode = (txOrStatus) => {
  if (!txOrStatus && txOrStatus !== 0) return "";
  const raw =
    typeof txOrStatus === "object"
      ? txOrStatus.txnStatus ??
        txOrStatus.status ??
        txOrStatus.TXNSTATUS ??
        txOrStatus.STATUS ??
        txOrStatus.statusCode ??
        ""
      : txOrStatus;

  const s = String(raw).trim().toUpperCase();
  if (
    s === "P" ||
    s === "SUCCESS" ||
    s === "PROCESSED" ||
    s === "SUCCESSFUL" ||
    s === "S"
  ) {
    return "P";
  }
  if (
    s === "R" ||
    s === "F" ||
    s === "FAILED" ||
    s === "FAILURE" ||
    s === "REJECTED" ||
    s === "FAIL" ||
    s === "ERROR" ||
    s === "DECLINED"
  ) {
    return "R";
  }
  if (
    s === "C" ||
    s === "PENDING" ||
    s === "WAITING" ||
    s === "IN_PROGRESS"
  ) {
    return "C";
  }
  return s;
};

export const formatStatus = (txOrStatus, t) => {
  const code = getTransactionStatusCode(txOrStatus);
  switch (code) {
    case "P":
      return t ? t("rmSuccess", "Success") : "Success";
    case "R":
    case "F":
      return t ? t("global_failed", "Failed") : "Failed";
    case "C":
      return t ? t("global_pending", "Pending") : "Pending";
    default: {
      const raw =
        typeof txOrStatus === "object"
          ? txOrStatus?.txnStatus ??
            txOrStatus?.status ??
            txOrStatus?.TXNSTATUS ??
            txOrStatus?.STATUS ??
            ""
          : txOrStatus;
      return raw ? String(raw) : "-";
    }
  }
};

export const getStatusBadgeClass = (status, variant = "badge") => {
  const code = getTransactionStatusCode(status);
  if (variant === "pill") {
    if (code === "R") {
      return "text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10";
    }
    if (code === "C") {
      return "text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10";
    }
    if (code === "P") {
      return "text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10";
    }
    return "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10";
  }

  if (code === "R") {
    return "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400";
  }
  if (code === "C") {
    return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
  }
  if (code === "P") {
    return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
  }
  return "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";
};
