import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { ProfileView } from './components/ProfileView';
import { AttendanceClock } from './components/AttendanceClock';
import { AttendanceSummary } from './components/AttendanceSummary';
import { api } from './api';

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'absen' | 'summary'>('absen');

  useEffect(() => {
    if (token) {
      // Refresh user profile info
      api.get('/employees/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [token]);

  const handleLoginSuccess = (userData: any, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-12">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            onProfileUpdated={(updated) => {
              setUser(updated);
              localStorage.setItem('user', JSON.stringify(updated));
            }}
          />
        )}

        {activeTab === 'absen' && <AttendanceClock />}

        {activeTab === 'summary' && <AttendanceSummary />}
      </main>
    </div>
  );
};

export default App;
