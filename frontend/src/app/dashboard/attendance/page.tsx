'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
  employee?: {
    fullName: string;
    email: string;
  };
}

export default function AttendancePage() {
  const [role, setRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [myHistory, setMyHistory] = useState<AttendanceRecord[]>([]);
  const [allHistory, setAllHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 1. Fetch Profile untuk Cek Role User
  useEffect(() => {
    const init = async () => {
      try {
        const profileRes = await api.get('/auth/profile');
        const userRole = profileRes.data.role;
        setRole(userRole);

        // Fetch presensi pribadi
        await fetchMyHistory();

        // Jika HR_ADMIN atau MANAGER, fetch presensi semua karyawan
        if (userRole === 'HR_ADMIN' || userRole === 'MANAGER') {
          await fetchAllHistory();
        }
      } catch (err) {
        console.error('Gagal memuat data presensi:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchMyHistory = async () => {
    try {
      const res = await api.get('/attendance/my-history');
      setMyHistory(res.data);
    } catch (err) {
      console.error('Gagal mengambil riwayat presensi saya:', err);
    }
  };

  const fetchAllHistory = async () => {
    try {
      const res = await api.get('/attendance/all');
      setAllHistory(res.data);
    } catch (err) {
      console.error('Gagal mengambil rekap semua presensi:', err);
    }
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await api.post('/attendance/clock-in');
      setMessage({ text: 'Berhasil Clock In!', type: 'success' });
      fetchMyHistory();
      if (role === 'HR_ADMIN' || role === 'MANAGER') fetchAllHistory();
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Gagal Clock In',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await api.post('/attendance/clock-out');
      setMessage({ text: 'Berhasil Clock Out!', type: 'success' });
      fetchMyHistory();
      if (role === 'HR_ADMIN' || role === 'MANAGER') fetchAllHistory();
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Gagal Clock Out',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Presensi & Kehadiran</h1>
          <p className="text-slate-400">Pencatatan jam kerja dan rekap kehadiran pegawai.</p>
        </div>

        {/* Tombol Aksi Clock In / Clock Out */}
        <div className="flex space-x-3">
          <button
            onClick={handleClockIn}
            disabled={actionLoading}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 font-medium text-white transition disabled:opacity-50"
          >
            Clock In
          </button>
          <button
            onClick={handleClockOut}
            disabled={actionLoading}
            className="rounded-lg bg-rose-600 hover:bg-rose-500 px-5 py-2.5 font-medium text-white transition disabled:opacity-50"
          >
            Clock Out
          </button>
        </div>
      </div>

      {message.text && (
        <div
          className={`mb-6 rounded-lg p-4 text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tab Navigasi (Hanya munculkan pilihan tab All untuk HR/Manager) */}
      {(role === 'HR_ADMIN' || role === 'MANAGER') && (
        <div className="flex space-x-4 border-b border-slate-700 mb-6">
          <button
            onClick={() => setActiveTab('my')}
            className={`pb-3 font-medium transition border-b-2 ${
              activeTab === 'my'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Presensi Saya
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 font-medium transition border-b-2 ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Rekap Semua Karyawan
          </button>
        </div>
      )}

      {/* TAB 1: PRESENSI SAYA */}
      {activeTab === 'my' && (
        <div className="overflow-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Masuk (Clock In)</th>
                <th className="px-6 py-4">Keluar (Clock Out)</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Memuat data presensi...
                  </td>
                </tr>
              ) : myHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Belum ada riwayat presensi.
                  </td>
                </tr>
              ) : (
                myHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-750">
                    <td className="px-6 py-4 font-medium text-white">
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">
                      {item.clockIn ? formatDate(item.clockIn) : '-'}
                    </td>
                    <td className="px-6 py-4 text-rose-400 font-semibold">
                      {item.clockOut ? formatDate(item.clockOut) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-blue-500/10 text-blue-400 px-2.5 py-1 text-xs font-semibold border border-blue-500/20">
                        {item.status || 'HADIR'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: REKAP SEMUA KARYAWAN (KHUSUS HR / MANAGER) */}
      {activeTab === 'all' && (role === 'HR_ADMIN' || role === 'MANAGER') && (
        <div className="overflow-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Nama Pegawai</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Masuk (Clock In)</th>
                <th className="px-6 py-4">Keluar (Clock Out)</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Memuat rekap seluruh karyawan...
                  </td>
                </tr>
              ) : allHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Belum ada data presensi karyawan.
                  </td>
                </tr>
              ) : (
                allHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-750">
                    <td className="px-6 py-4 font-medium text-white">
                      {item.employee?.fullName || 'Karyawan'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">
                      {item.clockIn ? formatDate(item.clockIn) : '-'}
                    </td>
                    <td className="px-6 py-4 text-rose-400 font-semibold">
                      {item.clockOut ? formatDate(item.clockOut) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-purple-500/10 text-purple-400 px-2.5 py-1 text-xs font-semibold border border-purple-500/20">
                        {item.status || 'HADIR'}
                      </span>
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