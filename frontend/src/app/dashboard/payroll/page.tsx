'use client';

import { useState, useEffect } from 'react';
import { api } from '@/app/lib/api';

interface Payroll {
  id: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'DRAFT' | 'PROCESSING' | 'PAID';
  createdAt: string;
  employee?: {
    fullName: string;
    email: string;
    department?: { name: string };
  };
}

interface Employee {
  id: string;
  fullName: string;
}

export default function PayrollPage() {
  const [role, setRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [myPayrolls, setMyPayrolls] = useState<Payroll[]>([]);
  const [allPayrolls, setAllPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [genData, setGenData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Format angka → 1000000 menjadi 1.000.000
  // Pakai Number() supaya aman meski data dari API berupa string
  const formatRp = (value?: number | string | null) => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString('id-ID');
  };

  useEffect(() => {
    const init = async () => {
      try {
        const profileRes = await api.get('/auth/profile');
        const userRole = profileRes.data.role;
        setRole(userRole);

        await fetchMyPayrolls();

        if (userRole === 'HR_ADMIN' || userRole === 'FINANCE') {
          await fetchAllPayrolls();
          const empRes = await api.get('/employees');
          setEmployees(empRes.data);
        }
      } catch (err) {
        console.error('Gagal memuat data payroll:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchMyPayrolls = async () => {
    try {
      const res = await api.get('/payroll/my-slips');
      setMyPayrolls(res.data);
    } catch (err) {
      console.error('Gagal mengambil slip pribadi:', err);
    }
  };

  const fetchAllPayrolls = async () => {
    try {
      const res = await api.get('/payroll/all');
      setAllPayrolls(res.data);
    } catch (err) {
      console.error('Gagal mengambil rekap payroll:', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });
    try {
      await api.post('/payroll/generate', {
        employeeId: genData.employeeId,
        month: Number(genData.month),
        year: Number(genData.year),
      });
      setIsModalOpen(false);
      fetchAllPayrolls();
      setMessage({ text: 'Payroll berhasil diproses!', type: 'success' });
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Gagal generate payroll.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'PAID') => {
    try {
      await api.patch(`/payroll/${id}/status`, { status: newStatus });
      fetchAllPayrolls();
      setMessage({ text: 'Status payroll berhasil diperbarui jadi PAID!', type: 'success' });
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Gagal mengubah status.',
        type: 'error',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* CSS Print */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 18mm 28mm;
          }

          body * {
            visibility: hidden;
          }

          #print-area,
          #print-area * {
            visibility: visible;
          }

          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 160mm;
            margin: 0 auto;
            padding: 0;
            background: white !important;
            color: black !important;
            font-size: 11pt;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* DASHBOARD */}
      <div className="no-print">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Slip Gaji & Payroll</h1>
            <p className="text-slate-400">Penggajian dan rincian pendapatan karyawan.</p>
          </div>

          {(role === 'HR_ADMIN' || role === 'FINANCE') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 font-medium text-white transition"
            >
              + Generate Gaji
            </button>
          )}
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

        {(role === 'HR_ADMIN' || role === 'FINANCE') && (
          <div className="flex space-x-4 border-b border-slate-700 mb-6">
            <button
              onClick={() => setActiveTab('my')}
              className={`pb-3 font-medium transition border-b-2 ${
                activeTab === 'my'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Slip Gaji Saya
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 font-medium transition border-b-2 ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Kelola Payroll Karyawan
            </button>
          </div>
        )}

        {/* TAB SLIP GAJI SAYA */}
        {activeTab === 'my' && (
          <div className="overflow-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Periode</th>
                  <th className="px-6 py-4">Gaji Pokok</th>
                  <th className="px-6 py-4">Tunjangan</th>
                  <th className="px-6 py-4">Potongan</th>
                  <th className="px-6 py-4">Gaji Bersih (THP)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Memuat data...</td>
                  </tr>
                ) : myPayrolls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Belum ada riwayat slip gaji.</td>
                  </tr>
                ) : (
                  myPayrolls.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-750">
                      <td className="px-6 py-4 font-medium text-white">
                        {monthNames[item.month - 1]} {item.year}
                      </td>
                      <td className="px-6 py-4 font-mono">Rp {formatRp(item.basicSalary)}</td>
                      <td className="px-6 py-4 text-emerald-400 font-mono">+Rp {formatRp(item.allowances)}</td>
                      <td className="px-6 py-4 text-rose-400 font-mono">-Rp {formatRp(item.deductions)}</td>
                      <td className="px-6 py-4 text-blue-400 font-mono font-bold">Rp {formatRp(item.netSalary)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedPayroll(item)}
                          className="rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-1.5 text-xs font-medium text-white transition"
                        >
                          Cetak Slip PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB KELOLA PAYROLL */}
        {activeTab === 'all' && (role === 'HR_ADMIN' || role === 'FINANCE') && (
          <div className="overflow-hidden rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Karyawan</th>
                  <th className="px-6 py-4">Periode</th>
                  <th className="px-6 py-4">Gaji Pokok</th>
                  <th className="px-6 py-4">Tunjangan</th>
                  <th className="px-6 py-4">Potongan</th>
                  <th className="px-6 py-4">Gaji Bersih</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">Memuat rekap payroll...</td>
                  </tr>
                ) : allPayrolls.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">Belum ada data penggajian.</td>
                  </tr>
                ) : (
                  allPayrolls.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-750">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{item.employee?.fullName || 'N/A'}</div>
                        <div className="text-xs text-slate-400">{item.employee?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {monthNames[item.month - 1]} {item.year}
                      </td>
                      <td className="px-6 py-4 font-mono">Rp {formatRp(item.basicSalary)}</td>
                      <td className="px-6 py-4 text-emerald-400 font-mono">+Rp {formatRp(item.allowances)}</td>
                      <td className="px-6 py-4 text-rose-400 font-mono">-Rp {formatRp(item.deductions)}</td>
                      <td className="px-6 py-4 text-blue-400 font-mono font-bold">Rp {formatRp(item.netSalary)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedPayroll(item)}
                          className="rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-1.5 text-xs font-medium text-white transition"
                        >
                          Cetak
                        </button>
                        {item.status !== 'PAID' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'PAID')}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition"
                          >
                            Bayar (PAID)
                          </button>
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

      {/* ===================== MODAL PREVIEW SLIP GAJI (CARD KECIL) ===================== */}
      {selectedPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          {/* max-w-md = ukuran card kecil */}
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
            
            {/* ===== PRINT AREA ===== */}
            <div id="print-area" className="bg-white text-black px-7 py-7">

              {/* Header Perusahaan */}
              <div className="flex justify-between items-start pb-4 border-b border-black">
                <div>
                  <p className="text-base font-bold tracking-tight uppercase">NEXUS HRIS</p>
                  <p className="text-xs mt-0.5">PT NEXUS TEKNOLOGI INDONESIA</p>
                  <p className="text-xs text-gray-600">Jakarta, Indonesia</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-widest">Slip Gaji</p>
                  <p className="text-sm font-bold mt-0.5">
                    {monthNames[selectedPayroll.month - 1]} {selectedPayroll.year}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {new Date(selectedPayroll.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Data Karyawan */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 mb-5 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Nama Karyawan</p>
                  <p className="font-medium">{selectedPayroll.employee?.fullName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="font-medium text-xs">{selectedPayroll.employee?.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Departemen</p>
                  <p className="font-medium">{selectedPayroll.employee?.department?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                  <p className="font-medium">{selectedPayroll.status}</p>
                </div>
              </div>

              {/* Tabel Penghasilan & Potongan */}
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-black">
                    <th className="py-1.5 text-left font-semibold uppercase tracking-wide text-xs">Keterangan</th>
                    <th className="py-1.5 text-right font-semibold uppercase tracking-wide text-xs w-32">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Gaji Pokok</td>
                    <td className="py-2 text-right font-mono">
                      Rp {formatRp(selectedPayroll.basicSalary)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Tunjangan</td>
                    <td className="py-2 text-right font-mono">
                      Rp {formatRp(selectedPayroll.allowances)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Potongan</td>
                    <td className="py-2 text-right font-mono">
                      (Rp {formatRp(selectedPayroll.deductions)})
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black">
                    <td className="py-2.5 font-bold uppercase text-xs">Gaji Bersih (THP)</td>
                    <td className="py-2.5 text-right font-mono font-bold text-sm">
                      Rp {formatRp(selectedPayroll.netSalary)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Catatan */}
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                Dokumen ini digenerate secara otomatis oleh sistem NEXUS HRIS.
              </p>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 gap-8 mt-10 text-center text-xs">
                <div>
                  <p className="text-gray-500 mb-10">Penerima,</p>
                  <div className="border-t border-black pt-1 mx-auto w-32">
                    <p className="font-medium">
                      {selectedPayroll.employee?.fullName || 'Karyawan'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 mb-10">Disetujui,</p>
                  <div className="border-t border-black pt-1 mx-auto w-32">
                    <p className="font-medium">Finance / HR</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-3 border-t border-gray-300 text-center">
                <p className="text-[10px] text-gray-400">
                  Dokumen bersifat rahasia · © PT NEXUS TEKNOLOGI INDONESIA
                </p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-gray-200 bg-gray-50 no-print">
              <button
                type="button"
                onClick={() => setSelectedPayroll(null)}
                className="px-3.5 py-1.5 text-sm font-medium text-gray-600 hover:text-black transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 text-sm font-medium bg-black text-white hover:bg-gray-800 transition rounded"
              >
                Cetak / Simpan PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Generate Gaji */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Generate Payroll Gaji</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Pilih Karyawan</label>
                <select
                  required
                  value={genData.employeeId}
                  onChange={(e) => setGenData({ ...genData, employeeId: e.target.value })}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Pilih Karyawan --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Bulan</label>
                  <select
                    value={genData.month}
                    onChange={(e) => setGenData({ ...genData, month: Number(e.target.value) })}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    {monthNames.map((name, idx) => (
                      <option key={idx} value={idx + 1}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tahun</label>
                  <input
                    type="number"
                    value={genData.year}
                    onChange={(e) => setGenData({ ...genData, year: Number(e.target.value) })}
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
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
                  {submitting ? 'Hitung Gaji...' : 'Proses Payroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}