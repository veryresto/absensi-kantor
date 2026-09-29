import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Clock, LogIn, LogOut, CheckCircle, AlertCircle } from 'lucide-react';

export const AttendanceClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchTodayStatus();
    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      setTodayRecord(res.data);
    } catch (err) {
      console.error('Error fetching today status', err);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.post('/attendance/clock-in');
      setTodayRecord(res.data);
      setMsg({ type: 'success', text: 'Berhasil melakukan Absen Masuk!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal melakukan Absen Masuk' });
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.post('/attendance/clock-out');
      setTodayRecord(res.data);
      setMsg({ type: 'success', text: 'Berhasil melakukan Absen Pulang!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Gagal melakukan Absen Pulang' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const parseDisplayTime = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Real-time Clock Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Clock className="w-48 h-48" />
        </div>
        <p className="text-sm font-medium uppercase tracking-widest text-blue-300 mb-1">{formatDate(time)}</p>
        <h1 className="text-5xl font-extrabold tracking-tight font-mono my-2">{formatTime(time)}</h1>
        <p className="text-xs text-slate-400">Standard Time (WIB) - WFH Attendance Logging</p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
            msg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Action Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-900 border-b pb-3">Status Absensi Hari Ini</h3>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-xs font-semibold uppercase text-emerald-600">Jam Masuk</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">
              {parseDisplayTime(todayRecord?.clockIn)}
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-semibold uppercase text-amber-600">Jam Pulang</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">
              {parseDisplayTime(todayRecord?.clockOut)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button
            onClick={handleClockIn}
            disabled={loading || Boolean(todayRecord?.clockIn)}
            className="py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
          >
            <LogIn className="w-6 h-6" />
            {todayRecord?.clockIn ? 'Sudah Absen Masuk' : 'Absen Masuk'}
          </button>

          <button
            onClick={handleClockOut}
            disabled={loading || !todayRecord?.clockIn || Boolean(todayRecord?.clockOut)}
            className="py-4 px-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
          >
            <LogOut className="w-6 h-6" />
            {todayRecord?.clockOut ? 'Sudah Absen Pulang' : 'Absen Pulang'}
          </button>
        </div>
      </div>
    </div>
  );
};
