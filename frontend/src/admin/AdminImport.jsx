import { useEffect, useState } from "react";
import { Upload, Download, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

export default function AdminImport() {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState([]);

  const loadLogs = () => api.adminImportLogs().then(setLogs).catch(() => {});
  useEffect(() => { loadLogs(); }, []);

  const upload = async () => {
    if (!file) return toast.error("Choose a CSV file");
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await api.adminImportCsv(fd);
      setReport(r);
      toast.success(`Imported: ${r.created} created, ${r.updated} updated`);
      loadLogs();
    } catch (e) { toast.error(e.response?.data?.detail || "Import failed"); }
    finally { setBusy(false); }
  };

  const downloadTemplate = () => {
    const token = localStorage.getItem("ps_token");
    fetch(api.importTemplateUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "partstation_import_template.csv"; a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="font-cabinet text-2xl font-bold mb-2">Bulk Product Import</h1>
      <p className="text-sm text-gray-500 mb-6">Import products via CSV (WooCommerce-compatible columns). Existing SKUs are updated.</p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 rounded-sm p-5 bg-white">
          <FileText size={24} className="text-brand mb-2" />
          <h2 className="font-cabinet font-bold mb-1">1. Get the Template</h2>
          <p className="text-sm text-gray-500 mb-3">Download the CSV template with required columns and a sample row.</p>
          <button data-testid="download-template-btn" onClick={downloadTemplate} className="h-9 px-4 border border-gray-300 rounded-sm text-sm flex items-center gap-2 hover:border-brand"><Download size={16} /> Download Template</button>
        </div>

        <div className="border border-gray-200 rounded-sm p-5 bg-white">
          <Upload size={24} className="text-brand mb-2" />
          <h2 className="font-cabinet font-bold mb-1">2. Upload CSV</h2>
          <input data-testid="csv-file-input" type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="text-sm mb-3 block w-full" />
          <button data-testid="import-csv-btn" disabled={busy} onClick={upload} className="h-9 px-4 bg-brand text-white rounded-sm text-sm font-medium disabled:bg-gray-300">{busy ? "Importing…" : "Import Products"}</button>
        </div>
      </div>

      {report && (
        <div className="border border-gray-200 rounded-sm p-5 bg-white mb-6" data-testid="import-report">
          <h2 className="font-cabinet font-bold mb-3">Import Report</h2>
          <div className="flex gap-4 mb-3">
            <span className="flex items-center gap-1 text-emerald-600 text-sm"><CheckCircle2 size={16} /> Created: {report.created}</span>
            <span className="flex items-center gap-1 text-blue-600 text-sm"><CheckCircle2 size={16} /> Updated: {report.updated}</span>
            <span className="flex items-center gap-1 text-red-600 text-sm"><AlertTriangle size={16} /> Failed: {report.failed}</span>
          </div>
          {report.errors?.length > 0 && (
            <div className="text-xs bg-red-50 border border-red-200 rounded-sm p-3 max-h-40 overflow-y-auto">
              {report.errors.map((e, i) => <div key={i}>Row {e.row}: {e.error}</div>)}
            </div>
          )}
        </div>
      )}

      <h2 className="font-cabinet font-bold mb-3">Import History</h2>
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-2.5">Date</th><th className="px-4 py-2.5">Created</th><th className="px-4 py-2.5">Updated</th><th className="px-4 py-2.5">Failed</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.batch_id} className="border-t border-gray-100">
                <td className="px-4 py-2.5 text-xs">{new Date(l.at).toLocaleString("en-IN")}</td>
                <td className="px-4 py-2.5">{l.created}</td><td className="px-4 py-2.5">{l.updated}</td><td className="px-4 py-2.5">{l.failed}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No imports yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
