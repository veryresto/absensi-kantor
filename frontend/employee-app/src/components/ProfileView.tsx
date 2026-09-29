import React, { useState } from 'react';
import { api, getPhotoUrl } from '../api';
import { User, Phone, Lock, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileViewProps {
  user: any;
  onProfileUpdated: (updatedUser: any) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onProfileUpdated }) => {
  const [phone, setPhone] = useState(user.phone || '');
  const [password, setPassword] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      if (phone !== user.phone) {
        formData.append('phone', phone);
      }
      if (password.trim() !== '') {
        formData.append('password', password);
      }
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await api.patch('/employees/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMsg('Data profil berhasil diperbarui! Notifikasi real-time telah dikirim ke Admin HRD.');
      setPassword('');
      setPhotoFile(null);
      setPhotoPreview(null);
      onProfileUpdated(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        <div className="px-6 pb-6 relative">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4 inline-block">
            <img
              src={photoPreview || getPhotoUrl(user.photoUrl)}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
            />
            <label className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-md transition">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-blue-600 font-medium">{user.position}</p>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
            </div>
            <span className="mt-2 sm:mt-0 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              Status WFH: Active
            </span>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
              <div>
                <p className="font-semibold">Sukses!</p>
                <p>{successMsg}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Ubah Data Profil</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  disabled
                  value={user.name}
                  className="w-full py-2.5 px-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Email Perusahaan
                </label>
                <input
                  type="text"
                  disabled
                  value={user.email}
                  className="w-full py-2.5 px-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Nomor Handphone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Password Baru (Opsional)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak diubah"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {photoPreview && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                📸 Foto profil baru terpilih. Klik 'Simpan Perubahan' untuk mengunggah foto.
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
