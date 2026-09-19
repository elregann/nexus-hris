'use client';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Selamat Datang di Nexus HRIS</h1>
      <p className="text-slate-400">Sistem Manajemen Sumber Daya Manusia Terintegrasi.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <h3 className="text-sm font-medium text-slate-400">Status Sistem</h3>
          <p className="mt-2 text-2xl font-bold text-emerald-400">Terhubung</p>
        </div>
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <h3 className="text-sm font-medium text-slate-400">Modul Aktif</h3>
          <p className="mt-2 text-2xl font-bold text-blue-400">7 Modul Backend</p>
        </div>
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6">
          <h3 className="text-sm font-medium text-slate-400">API Target</h3>
          <p className="mt-2 text-2xl font-bold text-purple-400">localhost:3000</p>
        </div>
      </div>
    </div>
  );
}