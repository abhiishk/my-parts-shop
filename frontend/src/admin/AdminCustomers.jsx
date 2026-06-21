import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  useEffect(() => { api.adminCustomers().then(setCustomers).catch(() => {}); }, []);

  return (
    <div>
      <h1 className="font-cabinet text-2xl font-bold mb-5">Customers ({customers.length})</h1>
      <div className="bg-white border border-gray-200 rounded-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-2.5">Name</th><th className="px-4 py-2.5">Email</th><th className="px-4 py-2.5">Phone</th><th className="px-4 py-2.5">Orders</th><th className="px-4 py-2.5">Joined</th></tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-gray-100">
                <td className="px-4 py-2.5 font-medium">{c.name}</td>
                <td className="px-4 py-2.5">{c.email}</td>
                <td className="px-4 py-2.5">{c.phone || "—"}</td>
                <td className="px-4 py-2.5">{c.order_count}</td>
                <td className="px-4 py-2.5 text-xs">{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No customers yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
