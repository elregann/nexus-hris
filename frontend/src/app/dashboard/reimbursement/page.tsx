'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';

interface Reimbursement {
  id: string;
  title: string;
  amount: number;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function ReimbursementPage() {
  const [claims, setClaims] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
  });

  const fetchClaims = async () => {
    try {
      const res = await api.get('/reimbursement/my-claims');
      setClaims(res.data);
    } catch (err: any) {
      console.error('Gagal mengambil klaim:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/reimbursement', {
        title: formData.title,
        amount: Number(formData.amount),
        description: formData.description,
      });
      setIsModalOpen(false);
      setFormData({ title: '', amount: '', description: '' });
      fetchClaims();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengajukan reimbursement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Pengajuan Reimbursement</h1>
          <p className="text-slate-400">Klaim biaya operasional dan klaim medis di sini.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 font-medium text-white transition"
        >
          + Ajukan Klaim
        </button>
      </div>

      {/* Tabel Riwayat Klaim */}
      <div className="overflow-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4">Judul Klaim</th>
              <th className="px-6 py-4">Nominal</th>
              <th className="px-6 py-4">Keterangan</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  Memuat data klaim...
                </td>
              </tr>
            ) : claims.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  Belum ada klaim reimbursement.
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-750">
                  <td className="px-6 py-4 font-medium text-white">{claim.title}</td>
                  <td className="px-6 py-4 text-emerald-400 font-mono font-semibold">
                    Rp {claim.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{claim.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        claim.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : claim.status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form Pengajuan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Form Reimbursement Baru</h2>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Judul / Keperluan</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Bensin Kunjungan Klien"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="150000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Keterangan Detail</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Pembelian Bensin Pertamax untuk perjalanan ke Surabaya"
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