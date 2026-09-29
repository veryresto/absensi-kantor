import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { AdminLogin } from './components/AdminLogin';
import { AdminNavbar } from './components/AdminNavbar';
import { AttendanceMonitoring } from './components/AttendanceMonitoring';
import { EmployeeManagement } from './components/EmployeeManagement';
import { AuditLogsView } from './components/AuditLogsView';
import { NotificationToast, AlertNotification } from './components/NotificationToast';
import { api } from './api';

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [user, setUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'monitoring' | 'employees' | 'audit'>('monitoring');
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  useEffect(() => {
    if (token) {
      // Connect Socket.IO for real-time WebSocket notifications from NestJS backend
      const socket = io(import.meta.env.VITE_BACKEND_URL, {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Connected to WebSocket server for real-time HR alerts');
      });

      socket.on('employee_profile_updated', (data: any) => {
        console.log('Received employee_profile_updated event:', data);
        const newAlert: AlertNotification = {
          id: Date.now().toString(),
          employeeId: data.employeeId,
          employeeName: data.employeeName,
          employeeEmail: data.employeeEmail,
          changedFields: data.changedFields || [],
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
        setAlerts((prev) => [newAlert, ...prev]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token]);

  const handleLoginSuccess = (userData: any, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('admin_token', authToken);
    localStorage.setItem('admin_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (!token || !user) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 pb-12">
      <AdminNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        unreadAlertsCount={alerts.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {activeTab === 'monitoring' && <AttendanceMonitoring />}
        {activeTab === 'employees' && <EmployeeManagement />}
        {activeTab === 'audit' && <AuditLogsView />}
      </main>

      {/* Real-time WebSocket Popup Alert Toast */}
      <NotificationToast alerts={alerts} onDismiss={dismissAlert} />
    </div>
  );
};

export default App;
