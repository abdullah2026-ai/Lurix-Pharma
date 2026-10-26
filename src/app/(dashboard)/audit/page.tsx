"use client";

import { useState, useEffect } from "react";
import { 
  History, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldAlert, 
  Calendar, 
  FileText, 
  X,
  User,
  Activity
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { IAuditLog } from "@/lib/types";
import { formatDhakaDateTime } from "@/lib/timezone";
import { toast } from "sonner";
import { auth } from "@/lib/firebase/client";

export default function AuditPage() {
  const { userProfile } = useAuth();
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<IAuditLog | null>(null);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const params = new URLSearchParams();
      if (entityFilter) params.append("entityType", entityFilter);

      const res = await fetch(`/api/audit?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load audit logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Could not fetch audit records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [entityFilter]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F2F5F3]">
      <DashboardHeader title="Security Audit Trail" />

      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-950/5 shadow-neu-flat flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">System Audit Trail</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Append-only immutable record of all security, inventory, and sales transactions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700"
            >
              <option value="">All Entities</option>
              <option value="medicine">Medicines & Stock</option>
              <option value="sale">Sales & POS</option>
              <option value="expense">Expenses</option>
              <option value="user">User Management</option>
              <option value="setting">System Settings</option>
            </select>

            <button
              onClick={fetchAuditLogs}
              className="p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all"
              title="Refresh Audit Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Logs Table Card */}
        <div className="bg-white rounded-3xl border border-emerald-950/5 shadow-neu-flat overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-4 px-5">Timestamp (Asia/Dhaka)</th>
                  <th className="py-4 px-4">Operator / Actor</th>
                  <th className="py-4 px-4">Action</th>
                  <th className="py-4 px-4">Entity Type</th>
                  <th className="py-4 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      Loading audit records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      No audit records found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id?.toString()} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-5 font-mono text-[11px] text-gray-600">
                        {formatDhakaDateTime(log.createdAt)}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{log.actorName}</div>
                        {log.actorEmail && (
                          <div className="text-[10px] text-gray-400 font-mono">{log.actorEmail}</div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800 font-mono">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="capitalize text-gray-700 font-medium">
                          {log.entityType}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-[11px] border border-gray-200"
                        >
                          View Payload
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payload Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Audit Record Detail</h2>
                  <p className="text-xs text-gray-500 font-mono">{selectedLog.action} • {formatDhakaDateTime(selectedLog.createdAt)}</p>
                </div>
                <button onClick={() => setSelectedLog(null)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-500">Actor:</span>{" "}
                  <strong>{selectedLog.actorName}</strong> ({selectedLog.actorEmail || selectedLog.actorUid})
                </div>
                <div>
                  <span className="text-gray-500">Target Entity:</span>{" "}
                  <strong>{selectedLog.entityType}</strong> (ID: {selectedLog.entityId || "N/A"})
                </div>

                <div className="mt-3">
                  <span className="text-gray-500 font-semibold block mb-1">Audit Details JSON:</span>
                  <pre className="p-3.5 rounded-2xl bg-gray-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-2xl bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
