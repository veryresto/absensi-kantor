import React, { useState, useEffect } from 'react';
import { api, getPhotoUrl } from '../api';
import { Users, UserPlus, Edit, Phone, Mail, Camera, Shield, X, CheckCircle } from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees/admin/list');
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Failed to fetch employees list', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingEmp(null);
    setName('');
    setEmail('');
    setPassword('');
    setPosition('');
    setPhone('');
    setRole('EMPLOYEE');
    setPhotoFile(null);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (emp: any) => {
    setEditingEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPassword('');
    setPosition(emp.position);
    setPhone(emp.phone);
    setRole(emp.role);
    setPhotoFile(null);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('position', position);
      formData.append('phone', phone);
      formData.append('role', role);
      if (password.trim()) {
        formData.append('password', password);
      }
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      if (editingEmp) {
        await api.put(`/employees/admin/update/${editingEmp.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        if (!password.trim()) {
          setFormError('Password wajib diisi untuk karyawan baru');
          setSaving(false);
          return;
        }
        await api.post('/employees/admin/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setShowModal(false);
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data karyawan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Kelola Data Karyawan
            </h2>
            <p className="text-xs text-gray-500">Tambah karyawan baru atau perbarui informasi data karyawan yang ada</p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Karyawan Baru
          </button>
        </div>

        {/* Employees Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-slate-100 text-slate-800 font-semibold border-b text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Foto</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Posisi</th>
                <th className="py-3.5 px-4">No. HP</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Memuat daftar karyawan...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Belum ada data karyawan.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <img
                        src={getPhotoUrl(emp.photoUrl)}
                        alt={emp.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{emp.name}</td>
                    <td className="py-3.5 px-4 text-gray-600">{emp.email}</td>
                    <td className="py-3.5 px-4 font-medium text-indigo-600">{emp.position}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-700">{emp.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        emp.role === 'HR_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 text-indigo-600 font-medium text-xs rounded-lg transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-gray-900">
              {editingEmp ? 'Ubah Data Karyawan' : 'Tambah Karyawan Baru'}
            </h3>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Email Perusahaan</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@veryresto.com"
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Password {editingEmp && '(Opsional)'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingEmp ? 'Kosongkan jika tidak diubah' : '••••••••'}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Posisi / Jabatan</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Software Engineer"
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">No. Handphone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Role Akun</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="EMPLOYEE">Karyawan (EMPLOYEE)</option>
                  <option value="HR_ADMIN">Admin HRD (HR_ADMIN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Foto Profile</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium text-sm rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow transition disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
