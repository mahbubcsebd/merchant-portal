import { format, parse } from "date-fns";

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const formatAmount = (amt) => {
  if (!amt) return "0.00";
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(
    parseFloat(amt),
  );
};

export const formatReportDate = (whenStr, creationDate) => {
  if (whenStr && whenStr.length === 8) {
    try {
      const parsed = parse(whenStr, "yyyyMMdd", new Date());
      return format(parsed, "MMM dd, yyyy");
    } catch (e) {}
  }
  if (creationDate) {
    const date = new Date(Number(creationDate));
    return format(date, "MMM dd, yyyy");
  }
  return "";
};

export function openPrintWindow({
  data,
  reportTitle,
  fromDate,
  toDate,
  mode = "print",
}) {
  const fromLabel = fromDate ? format(fromDate, "MMM dd, yyyy") : "—";
  const toLabel = toDate ? format(toDate, "MMM dd, yyyy") : "—";
  const generatedAt = format(new Date(), "MMM dd, yyyy  hh:mm a");

  const rows = data
    .map(
      (r, i) => `
    <tr class="${i % 2 === 0 ? "even" : "odd"}">
      <td>${formatReportDate(r.when, r.creationDate)}</td>
      <td class="mono">${r.confirmationNumber}</td>
      <td>${r.to || ""}</td>
      <td class="name">${r.benficiaryName || ""}</td>
      <td class="credit">${formatAmount(r.amount)} ${r.currencyCode}</td>
      <td>${r.txnName}</td>
      <td><span class="badge processed">Processed</span></td>
    </tr>`,
    )
    .join("");

  const logoUrl = window.location.origin + "/images/logo.svg";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; background: #fff; }
    .page { padding: 32px 40px; max-width: 1000px; margin: 0 auto; }
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; border-bottom: 2px solid #e2e8f0; margin-bottom: 20px; }
    .report-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 8px; }
    .meta-bar { display: flex; gap: 32px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px; margin-bottom: 20px; }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { font-size: 9px; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
    .meta-value { font-size: 12px; font-weight: 600; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #1e40af; color: #fff; }
    thead th { padding: 9px 10px; text-align: left; font-size: 9.5px; font-weight: 700; text-transform: uppercase; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #334155; }
    td.mono  { font-family: monospace; font-size: 10px; }
    td.name  { font-weight: 600; color: #0f172a; }
    td.credit { font-weight: 700; color: #059669; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 9.5px; font-weight: 700; background: #dcfce7; color: #166534; }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div><img src="${logoUrl}" alt="Logo" width="120" /><div class="report-title">${reportTitle}</div></div>
    <div style="text-align:right"><div>Generated</div><div style="font-weight:600">${generatedAt}</div></div>
  </div>
  <div class="meta-bar">
    <div class="meta-item"><span class="meta-label">From Date</span><span class="meta-value">${fromLabel}</span></div>
    <div class="meta-item"><span class="meta-label">To Date</span><span class="meta-value">${toLabel}</span></div>
  </div>
  <table>
    <thead>
      <tr><th>Date</th><th>Confirmation No.</th><th>To Account</th><th>Beneficiary Name</th><th>Amount</th><th>Transaction Type</th><th>Status</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</div>
<script>window.onload = function(){ window.print(); window.onafterprint = function(){ window.close(); }; }<\/script>
</body></html>`;

  const win = window.open("", "_blank", "width=1100,height=750,scrollbars=yes");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export function downloadCSV(data, filename) {
  const header =
    "Date,Confirmation Number,To Account,Beneficiary Name,Amount,Transaction Type,Status\n";
  const rows = data
    .map(
      (r) =>
        `"${formatReportDate(r.when, r.creationDate)}","${r.confirmationNumber}","${r.to || ""}","${r.benficiaryName || ""}","${formatAmount(r.amount)} ${r.currencyCode}","${r.txnName}","Processed"`,
    )
    .join("\n");
  const uri = encodeURI("data:text/csv;charset=utf-8," + header + rows);
  const a = document.createElement("a");
  a.setAttribute("href", uri);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
