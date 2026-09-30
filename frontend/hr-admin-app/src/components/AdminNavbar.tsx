import React from 'react';
import { Users, Eye, Database, LogOut, ShieldCheck } from 'lucide-react';

interface AdminNavbarProps {
  activeTab: 'monitoring' | 'employees' | 'audit';
  setActiveTab: (tab: 'monitoring' | 'employees' | 'audit') => void;
  user: any;
  onLogout: () => void;
  unreadAlertsCount: number;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  unreadAlertsCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-lg leading-tight block">VeryResto HRD</span>
              <span className="text-xs text-slate-400 hidden md:block">Monitoring & Employee Portal</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-0.5 sm:space-x-1" aria-label="Navigasi admin">
            <button
              onClick={() => setActiveTab('monitoring')}
              aria-label="Monitoring Absensi"
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'monitoring'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Monitoring Absensi</span>
            </button>

            <button
              onClick={() => setActiveTab('employees')}
              aria-label="Kelola Karyawan"
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'employees'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Kelola Karyawan</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              aria-label="Audit Log Queue"
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-md text-sm font-medium transition relative ${
                activeTab === 'audit'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Audit Log Queue</span>
              {unreadAlertsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <span className="text-xs font-semibold block text-slate-200">{user?.name}</span>
              <span className="text-[10px] text-indigo-400 block">{user?.email}</span>
            </div>
            <button
              onClick={onLogout}
              title="Keluar"
              aria-label="Keluar"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
