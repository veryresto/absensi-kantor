import React from 'react';
import { Users, Eye, Database, LogOut, ShieldCheck, Bell } from 'lucide-react';

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
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-white text-lg leading-tight block">VeryResto HRD</span>
              <span className="text-xs text-indigo-300 block">Monitoring & Employee Portal</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'monitoring'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Monitoring Absensi</span>
            </button>

            <button
              onClick={() => setActiveTab('employees')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'employees'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Kelola Karyawan</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition relative ${
                activeTab === 'audit'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
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
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
