import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Search, Calendar, Eye, Filter, RefreshCw } from 'lucide-react';

export const AttendanceMonitoring: React.FC = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/admin/all', {
        params: {
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
      });
      setRecords(res.data || []);
    } catch (err) {
      console.error('Failed to fetch attendance logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttendance();
  };

  const filteredRecords = records.filter((rec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      rec.employee?.name?.toLowerCase().includes(q) ||
      rec.employee?.email?.toLowerCase().includes(q) ||
      rec.employee?.position?.toLowerCase().includes(q)
    );
  });

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-6 h-6 text-indigo-600" />
              Monitoring Absensi Karyawan (Read-Only)
            </h2>
            <p className="text-xs text-gray-500">Pantau seluruh catatan absensi masuk dan pulang karyawan secara terpusat</p>
          </div>

          <button
            onClick={fetchAttendance}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Cari Nama / Email
            </label>
            <input
              type="text"
              placeholder="Ketik nama / email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-sm transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Filter Absensi
            </button>
          </div>
        </form>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-slate-100 text-slate-800 font-semibold border-b text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nama Karyawan</th>
                <th className="py-3.5 px-4">Posisi</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Absen Masuk</th>
                <th className="py-3.5 px-4">Absen Pulang</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Memuat data absensi karyawan...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Tidak ada catatan absensi yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div>{rec.employee?.name || 'Karyawan'}</div>
                      <div className="text-xs text-gray-400 font-normal">{rec.employee?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-gray-600">
                      {rec.employee?.position || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-gray-800">{rec.date}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700">{formatDateTime(rec.clockIn)}</td>
                    <td className="py-3.5 px-4 font-mono text-amber-700">{formatDateTime(rec.clockOut)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        rec.clockOut ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.clockOut ? 'Pulang' : 'Masuk'}
                      </span>
                    </td>
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
