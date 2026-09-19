'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';

interface LeaveRequest {
  id: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function LeavePage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    reason: '',
    startDate: '',
    endDate: '',
  });

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leave/my-history');
      setLeaves(res.data);
    } catch (err: any) {
      console.error('Gagal mengambil data cuti:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/leave', {
        reason: formData.reason,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });

      setIsModalOpen(false);
      setFormData({ reason: '', startDate: '', endDate: '' });
      fetchLeaves();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengajukan cuti.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Pengajuan Cuti</h1>
          <p className="text-slate-400">Kelola dan ajukan permohonan izin cuti kerja kamu.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 font-medium text-white transition"
        >
          + Ajukan Cuti
        </button>
      </div>

      {/* Tabel Riwayat Cuti */}
      <div className="overflow-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4">Alasan Cuti</th>
              <th className="px-6 py-4">Tanggal Mulai</th>
              <th className="px-6 py-4">Tanggal Selesai</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  Memuat riwayat cuti...
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  Belum ada riwayat pengajuan cuti.
                </td>
              </tr>
            ) : (
              leaves.map((item) => (
                <tr key={item.id} className="hover:bg-slate-750">
                  <td className="px-6 py-4 font-medium text-white">{item.reason}</td>
                  <td className="px-6 py-4 text-slate-300">
                    {new Date(item.startDate).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {new Date(item.endDate).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form Cuti */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Form Pengajuan Cuti</h2>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Alasan Cuti</label>
                <input
                  type="text"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Cuti Tahunan / Acara Keluarga"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
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
                  {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}