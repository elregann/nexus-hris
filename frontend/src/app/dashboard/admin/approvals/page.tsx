'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';

interface Employee {
  id: string;
  fullName: string;
  email: string;
  department?: { name: string };
}

interface ReimbursementClaim {
  id: string;
  title: string;
  amount: number;
  description?: string;
  status: 'PENDING' | 'PENDING_MANAGER' | 'PENDING_HR' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  employee: Employee;
}

interface LeaveRequest {
  id: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'PENDING_MANAGER' | 'PENDING_HR' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  employee: Employee;
}

export default function AdminApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'reimbursement' | 'leave'>('reimbursement');
  const [reimbursements, setReimbursements] = useState<ReimbursementClaim[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [reimbRes, leaveRes] = await Promise.all([
        api.get('/reimbursement/all'),
        api.get('/leave/all'),
      ]);
      setReimbursements(reimbRes.data);
      setLeaves(leaveRes.data);
    } catch (err) {
      console.error('Gagal mengambil data admin approval:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdateReimbursement = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/reimbursement/${id}/status`, { status });
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status reimbursement');
    }
  };

  const handleUpdateLeave = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/leave/${id}/status`, { status });
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengubah status cuti');
    }
  };

  // Helper untuk mengecek apakah status masih butuh persetujuan
  const isPendingStatus = (status: string) => status.includes('PENDING');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Panel Persetujuan (Approval)</h1>
        <p className="text-slate-400">Pusat persetujuan pengajuan cuti dan reimbursement karyawan.</p>
      </div>

      {/* Tab Navigasi */}
      <div className="flex space-x-3 mb-6 border-b border-slate-700 pb-3">
        <button
          onClick={() => setActiveTab('reimbursement')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'reimbursement'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Klaim Reimbursement ({reimbursements.filter((r) => isPendingStatus(r.status)).length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'leave'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Pengajuan Cuti ({leaves.filter((l) => isPendingStatus(l.status)).length} Pending)
        </button>
      </div>

      {/* Tabel Reimbursement */}
      {activeTab === 'reimbursement' && (
        <div className="overflow-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Karyawan</th>
                <th className="px-6 py-4">Judul Klaim</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : reimbursements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada pengajuan reimbursement.
                  </td>
                </tr>
              ) : (
                reimbursements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-750">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{item.employee?.fullName || 'N/A'}</div>
                      <div className="text-xs text-slate-400">{item.employee?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">{item.title}</td>
                    <td className="px-6 py-4 text-emerald-400 font-mono font-semibold">
                      Rp {item.amount.toLocaleString('id-ID')}
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
                    <td className="px-6 py-4 text-center space-x-2">
                      {isPendingStatus(item.status) ? (
                        <>
                          <button
                            onClick={() => handleUpdateReimbursement(item.id, 'APPROVED')}
                            className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-medium text-white transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateReimbursement(item.id, 'REJECTED')}
                            className="rounded bg-red-600 hover:bg-red-500 px-3 py-1 text-xs font-medium text-white transition"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabel Cuti */}
      {activeTab === 'leave' && (
        <div className="overflow-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Karyawan</th>
                <th className="px-6 py-4">Alasan Cuti</th>
                <th className="px-6 py-4">Mulai - Selesai</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Tidak ada pengajuan cuti.
                  </td>
                </tr>
              ) : (
                leaves.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-750">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{item.employee?.fullName || 'N/A'}</div>
                      <div className="text-xs text-slate-400">{item.employee?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">{item.reason}</td>
                    <td className="px-6 py-4 text-slate-300 text-xs font-mono">
                      {new Date(item.startDate).toLocaleDateString('id-ID')} -{' '}
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
                    <td className="px-6 py-4 text-center space-x-2">
                      {isPendingStatus(item.status) ? (
                        <>
                          <button
                            onClick={() => handleUpdateLeave(item.id, 'APPROVED')}
                            className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-medium text-white transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateLeave(item.id, 'REJECTED')}
                            className="rounded bg-red-600 hover:bg-red-500 px-3 py-1 text-xs font-medium text-white transition"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}