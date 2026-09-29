import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Search, Calendar, Filter, FileSpreadsheet } from 'lucide-react';

export const AttendanceSummary: React.FC = () => {
  const getDefaultDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return {
      fromDate: `${year}-${month}-01`,
      toDate: `${year}-${month}-${day}`,
    };
  };

  const defaults = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSummary(defaults.fromDate, defaults.toDate);
  }, []);

  const fetchSummary = async (from: string, to: string) => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/summary', {
        params: { fromDate: from, toDate: to },
      });
      setRecords(res.data.records || []);
    } catch (err) {
      console.error('Failed to fetch attendance summary', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSummary(fromDate, toDate);
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Summary Absensi WFH</h2>
              <p className="text-xs text-gray-500">Ringkasan riwayat kehadiran karyawan</p>
            </div>
          </div>
        </div>

        {/* Filter Form */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Dari Tanggal (From)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Sampai Tanggal (To)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-sm transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Mencari...' : 'Cari'}
            </button>
          </div>
        </form>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-900 font-semibold border-b text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Masuk</th>
                <th className="py-3.5 px-4">Pulang</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    Memuat data summary...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    Tidak ada catatan absensi untuk rentang tanggal ini.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-gray-900">{rec.date}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700">{formatDateTime(rec.clockIn)}</td>
                    <td className="py-3.5 px-4 font-mono text-amber-700">{formatDateTime(rec.clockOut)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        rec.clockOut ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.clockOut ? 'Selesai Pulang' : 'Sudah Masuk'}
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
