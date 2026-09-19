'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/app/lib/api';

interface NavItem {
  name: string;
  href: string;
  roles?: string[]; // Jika tidak diisi, menu bisa diakses oleh semua role
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Karyawan', href: '/dashboard/employees', roles: ['HR_ADMIN', 'MANAGER'] },
  { name: 'Presensi', href: '/dashboard/attendance' },
  { name: 'Reimbursement', href: '/dashboard/reimbursement' },
  { name: 'Cuti', href: '/dashboard/leave' },
  { name: 'Payroll', href: '/dashboard/payroll' },
  { name: 'Approval Admin', href: '/dashboard/admin/approvals', roles: ['HR_ADMIN', 'MANAGER'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setRole(res.data.role);
      } catch (err) {
        console.error('Gagal mengambil profile user:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/login');
  };

  // Filter menu berdasarkan role akun yang sedang login
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return role && item.roles.includes(role);
  });

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 p-6 flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold text-blue-500 mb-8">Nexus HRIS</div>
          <nav className="space-y-2">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-4 py-2.5 font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 font-medium border border-red-500/20 transition"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}