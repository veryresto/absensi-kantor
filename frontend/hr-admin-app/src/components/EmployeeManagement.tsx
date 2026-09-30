import React, { useState, useEffect } from 'react';
import { api, getPhotoUrl } from '../api';
import { Users, UserPlus, Edit, Trash2, X } from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [deletedEmployees, setDeletedEmployees] = useState<any[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
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

  const fetchDeletedEmployees = async () => {
    try {
      const res = await api.get('/employees/admin/deleted');
      setDeletedEmployees(res.data || []);
    } catch (err) {
      console.error('Failed to fetch deleted employees', err);
    }
  };

  const handleDelete = async (employee: any) => {
    if (!window.confirm(`Hapus karyawan ${employee.name}? Data absensinya tetap disimpan.`)) return;
    try {
      await api.delete(`/employees/admin/${employee.id}`);
      await fetchEmployees();
      if (showDeleted) await fetchDeletedEmployees();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Gagal menghapus karyawan');
    }
  };

  const toggleDeleted = async () => {
    const next = !showDeleted;
    setShowDeleted(next);
    if (next) await fetchDeletedEmployees();
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
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Kelola Data Karyawan</h1>
            <p className="text-sm text-gray-500 mt-1">Tambah karyawan baru atau perbarui data karyawan</p>
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Karyawan Baru
          </button>
        </div>

        {/* Employees Table */}
        <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
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
                      <button
                        onClick={() => handleDelete(emp)}
                        className="inline-flex items-center gap-1 ml-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-xs rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden border border-gray-200 rounded-lg divide-y divide-gray-200">
          {loading ? (
            <p className="py-8 px-4 text-center text-sm text-gray-500">Memuat daftar karyawan...</p>
          ) : employees.length === 0 ? (
            <p className="py-8 px-4 text-center text-sm text-gray-500">Belum ada data karyawan.</p>
          ) : employees.map((emp) => (
            <article key={emp.id} className="p-4">
              <div className="flex items-start gap-3">
                <img src={getPhotoUrl(emp.photoUrl)} alt={emp.name} className="w-11 h-11 rounded-full object-cover border border-gray-200" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-sm text-gray-900 truncate">{emp.name}</h2>
                      <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 text-[11px] font-semibold rounded-md ${emp.role === 'HR_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{emp.role}</span>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    <div><dt className="text-xs text-gray-500">Posisi</dt><dd className="text-indigo-700 font-medium">{emp.position}</dd></div>
                    <div><dt className="text-xs text-gray-500">No. HP</dt><dd className="font-mono text-gray-700">{emp.phone}</dd></div>
                  </dl>
                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => openEditModal(emp)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 text-indigo-700 font-medium text-xs rounded-md"><Edit className="w-3.5 h-3.5" />Edit</button>
                    <button onClick={() => handleDelete(emp)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium text-xs rounded-md"><Trash2 className="w-3.5 h-3.5" />Hapus</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <section className="border-t border-gray-200 pt-5 px-0 sm:px-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Karyawan Dihapus</h2>
            <p className="text-xs text-gray-500">Data karyawan yang dihapus secara soft-delete; riwayat absensi tetap tersimpan.</p>
          </div>
          <button
            onClick={toggleDeleted}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-sm rounded-lg"
          >
            {showDeleted ? 'Sembunyikan' : 'Lihat Karyawan Dihapus'}
          </button>
        </div>

        {showDeleted && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-slate-100 text-slate-800 font-semibold border-b text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Nama</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Posisi</th>
                  <th className="py-3.5 px-4">Deleted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {deletedEmployees.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-500">Belum ada deleted employee.</td></tr>
                ) : deletedEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{emp.name}</td>
                    <td className="py-3.5 px-4">{emp.email}</td>
                    <td className="py-3.5 px-4">{emp.position}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">{new Date(emp.deletedAt).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add / Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6 shadow-xl space-y-5 relative">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition disabled:opacity-50"
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
