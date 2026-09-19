'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';

interface Employee {
  id: string;
  fullName: string;
  email: string;
  role: string;
  position?: string;
  department?: {
    name: string;
  };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: 'Password123!',
    role: 'EMPLOYEE',
    position: '',
  });

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
    } catch (err: any) {
      console.error('Gagal mengambil data pegawai:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/employees', formData);
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        password: 'Password123!',
        role: 'EMPLOYEE',
        position: '',
      });
      fetchEmployees(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambahkan pegawai.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Manajemen Karyawan</h1>
          <p className="text-slate-400">Kelola data pegawai dan hak akses sistem.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 font-medium text-white transition"
        >
          + Tambah Pegawai
        </button>
      </div>

      {/* Tabel Karyawan */}
      <div className="overflow-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4">Nama</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Jabatan</th>
              <th className="px-6 py-4">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  Memuat data...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  Belum ada data pegawai.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-750">
                  <td className="px-6 py-4 font-medium text-white">{emp.fullName}</td>
                  <td className="px-6 py-4 text-slate-400">{emp.email}</td>
                  <td className="px-6 py-4">{emp.position || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        emp.role === 'HR_ADMIN'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : emp.role === 'MANAGER'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {emp.role}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Pegawai */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Tambah Pegawai Baru</h2>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Budi Santoso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="budi@nexus.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Jabatan (Position)</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="HR_ADMIN">HR_ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-slate-400 hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 font-medium text-white transition disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}