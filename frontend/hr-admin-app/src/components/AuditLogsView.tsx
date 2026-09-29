import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Database, RefreshCw, Activity, Terminal } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit/logs');
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch audit logs from secondary database', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-purple-600" />
              Secondary Database Audit Log Stream (RabbitMQ Consumer)
            </h2>
            <p className="text-xs text-gray-500">
              Log perubahan data profil yang dikirim melalui Message Queue (RabbitMQ) dan disimpan di database terpisah (<code className="bg-gray-100 px-1 py-0.5 rounded text-purple-700">audit_log_db</code>)
            </p>
          </div>

          <button
            onClick={fetchAuditLogs}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-slate-900 text-slate-200 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Waktu (Timestamp)</th>
                <th className="py-3.5 px-4">Email Karyawan</th>
                <th className="py-3.5 px-4">Field Yang Diubah</th>
                <th className="py-3.5 px-4">Nilai Sebelumnya</th>
                <th className="py-3.5 px-4">Nilai Baru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Memuat audit logs dari database sekunder...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Belum ada audit log yang tercatat di secondary database.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-700">{log.employeeEmail}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">
                        {log.changedFields}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">{log.previousValues}</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-semibold max-w-xs truncate">{log.newValues}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
