import React from 'react';
import { Bell, X } from 'lucide-react';

export interface AlertNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  changedFields: string[];
  updatedAt: string;
}

interface NotificationToastProps {
  alerts: AlertNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-0 sm:right-4 z-50 space-y-3 max-w-md w-full px-4 sm:px-0">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-slate-900 text-white p-4 rounded-lg shadow-lg border border-slate-700 animate-slide-up flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-300 rounded-md mt-0.5 border border-indigo-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full uppercase">
                  Real-time Alert
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(alert.updatedAt).toLocaleTimeString('id-ID')}
                </span>
              </div>
              <p className="text-sm font-bold text-white">
                Profil {alert.employeeName} Diperbarui!
              </p>
              <p className="text-xs text-slate-300">
                Karyawan <span className="text-indigo-300 font-mono">{alert.employeeEmail}</span> telah mengubah data profil:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {alert.changedFields.map((field) => (
                  <span
                    key={field}
                    className="px-2 py-0.5 bg-indigo-950 border border-indigo-700/50 text-indigo-200 text-[11px] font-mono rounded-md"
                  >
                    {field === 'phone' ? '📱 No. HP' : field === 'password' ? '🔑 Password' : '📸 Foto Profil'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onDismiss(alert.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};
