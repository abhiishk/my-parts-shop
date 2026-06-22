import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Download, FileText, CheckCircle2, AlertTriangle, Link2, Loader2, Globe } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

export default function AdminImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState([]);
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(null);

  const loadLogs = () => api.adminImportLogs().then(setLogs).catch(() => {});
  useEffect(() => { loadLogs(); }, []);

  const fetchUrl = async () => {
    if (!url.trim().startsWith("http")) return toast.error("Enter a valid product URL");
    setFetching(true); setFetched(null);
    try {
      const data = await api.adminImportFromUrl(url.trim());
      setFetched(data);
      if (data.name) toast.success("Product data fetched — review and create");
      else toast.error("Could not extract product data from this URL");
    } catch (e) { toast.error(e.response?.data?.detail || "Fetch failed"); }
    finally { setFetching(false); }
  };

  const createFromFetched = async () => {
    try {
      await api.adminCreateProduct({
        name_en: fetched.name || "Imported Product",
        long_description: fetched.description || "",
        short_description: (fetched.description || "").slice(0, 140),
        selling_price: fetched.price || 0, mrp: fetched.price || 0,
        images: fetched.images || [], publish_status: "draft",
        tags: ["imported"], seo_description: (fetched.description || "").slice(0, 160),
      });
      toast.success("Draft product created — edit it in Products to finalize");
      setFetched(null); setUrl("");
    } catch (e) { toast.error(e.response?.data?.detail || "Create failed"); }
  };

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
      <h1 className="font-display text-2xl font-bold mb-2">Bulk Product Import</h1>
      <p className="text-sm text-slate-500 mb-6">Import products via CSV (WooCommerce-compatible) or fetch a single product from a URL.</p>

      {/* Import from URL */}
      <div className="border border-slate-200 rounded-lg p-5 bg-white mb-6">
        <div className="flex items-center gap-2 mb-1"><Globe size={20} className="text-brand" /><h2 className="font-display font-bold">Import from URL</h2></div>
        <p className="text-sm text-slate-500 mb-3">Paste a product page link (your WooCommerce/WordPress shop or supplier). We'll fetch the title, price, description and images where available.</p>
        <div className="flex gap-2 flex-wrap">
          <input data-testid="import-url-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourshop.com/product/hp-88a-toner" className="flex-1 min-w-[240px] h-10 border border-slate-300 rounded-md px-3 text-sm focus:outline-none focus:border-brand" />
          <button data-testid="fetch-url-btn" onClick={fetchUrl} disabled={fetching} className="h-10 px-4 bg-brand text-white rounded-md text-sm font-semibold flex items-center gap-2 disabled:bg-slate-300">
            {fetching ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />} Fetch Data
          </button>
        </div>
        {fetched && (
          <div className="mt-4 border border-slate-200 rounded-md p-3" data-testid="fetched-preview">
            <div className="grid sm:grid-cols-[100px_1fr] gap-3">
              <div className="flex gap-1 flex-wrap">
                {(fetched.images || []).slice(0, 2).map((img, i) => <img key={i} src={img} alt="" className="w-12 h-12 object-cover rounded border border-slate-200" />)}
                {(!fetched.images || fetched.images.length === 0) && <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-[10px] text-slate-400">No img</div>}
              </div>
              <div className="text-sm">
                <div className="font-semibold">{fetched.name || "(no title found)"}</div>
                <div className="text-slate-500 text-xs mt-0.5">Price: {fetched.price ? `₹${fetched.price}` : "—"} · {fetched.images?.length || 0} image(s)</div>
                <div className="text-slate-500 text-xs mt-1 line-clamp-2">{fetched.description}</div>
              </div>
            </div>
            {fetched.warnings?.length > 0 && (
              <ul className="text-[11px] text-amber-600 mt-2 list-disc pl-4">{fetched.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
            )}
            <button onClick={createFromFetched} className="mt-3 h-9 px-4 bg-brand-orange text-white rounded-md text-sm font-semibold" data-testid="create-from-url-btn">Create as Draft Product</button>
            <span className="text-[11px] text-slate-400 ml-2">It'll be created hidden — edit & publish from Products.</span>
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-3">Note: works best on shops that expose product structured data (most WooCommerce/WordPress stores). Large marketplaces (Amazon/Flipkart) block automated fetching.</p>
      </div>

      <h2 className="font-display font-bold mb-3">CSV Import</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="border border-slate-200 rounded-lg p-5 bg-white">
          <FileText size={24} className="text-brand mb-2" />
          <h3 className="font-display font-bold mb-1">1. Get the Template</h3>
          <p className="text-sm text-slate-500 mb-3">Download the CSV template with required columns and a sample row.</p>
          <button data-testid="download-template-btn" onClick={downloadTemplate} className="h-9 px-4 border border-slate-300 rounded-md text-sm flex items-center gap-2 hover:border-brand"><Download size={16} /> Download Template</button>
        </div>

        <div className="border border-slate-200 rounded-lg p-5 bg-white">
          <Upload size={24} className="text-brand mb-2" />
          <h3 className="font-display font-bold mb-1">2. Upload CSV</h3>
          <input data-testid="csv-file-input" type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="text-sm mb-3 block w-full" />
          <button data-testid="import-csv-btn" disabled={busy} onClick={upload} className="h-9 px-4 bg-brand text-white rounded-md text-sm font-semibold disabled:bg-slate-300">{busy ? "Importing…" : "Import Products"}</button>
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
