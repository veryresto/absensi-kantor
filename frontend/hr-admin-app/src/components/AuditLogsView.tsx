import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { RefreshCw } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Audit Log Perubahan Profil</h1>
            <p className="text-sm text-gray-500 mt-1">
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
        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
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

        <div className="md:hidden border border-gray-200 rounded-lg divide-y divide-gray-200">
          {loading ? (
            <p className="py-8 px-4 text-center text-sm text-gray-500">Memuat audit logs dari database sekunder...</p>
          ) : logs.length === 0 ? (
            <p className="py-8 px-4 text-center text-sm text-gray-500">Belum ada audit log yang tercatat di secondary database.</p>
          ) : logs.map((log) => (
            <article key={log.id} className="p-4 text-xs">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-indigo-700 break-all">{log.employeeEmail}</p>
                <time className="shrink-0 text-gray-500">{new Date(log.timestamp).toLocaleString('id-ID')}</time>
              </div>
              <p className="mt-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-semibold">{log.changedFields}</span></p>
              <dl className="mt-3 grid gap-2 font-mono">
                <div><dt className="text-gray-500 mb-0.5">Nilai sebelumnya</dt><dd className="text-gray-700 break-all">{log.previousValues}</dd></div>
                <div><dt className="text-gray-500 mb-0.5">Nilai baru</dt><dd className="text-emerald-700 break-all">{log.newValues}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
