import React from 'react';
import { User, Clock, FileSpreadsheet, LogOut, Building2 } from 'lucide-react';
import { getPhotoUrl } from '../api';

interface NavbarProps {
  activeTab: 'profile' | 'absen' | 'summary';
  setActiveTab: (tab: 'profile' | 'absen' | 'summary') => void;
  user: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg leading-tight block">VeryResto</span>
              <span className="text-xs text-gray-500 block">Absensi WFH Karyawan</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'profile'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profil Karyawan</span>
            </button>

            <button
              onClick={() => setActiveTab('absen')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'absen'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Absen</span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'summary'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Summary Absen</span>
            </button>
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            <img
              src={getPhotoUrl(user?.photoUrl)}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
            <button
              onClick={onLogout}
              title="Keluar"
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
