'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HiOutlineHome, 
  HiOutlineStar, 
  HiOutlineBell, 
  HiOutlineCog,
  HiOutlineLogout,
} from 'react-icons/hi';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { href: '/reviews', label: 'Reviews', icon: HiOutlineStar },
  { href: '/alerts', label: 'Alerts', icon: HiOutlineBell },
  { href: '/settings', label: 'Settings', icon: HiOutlineCog },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">KleosAI</h1>
            <p className="text-xs text-gray-500">Reputation Manager</p>
          </div>
        </div>
      </div>

      {/* Restaurant info */}
      {user?.restaurantName && (
        <div className="px-4 py-3 bg-indigo-50 mx-3 mt-4 rounded-xl">
          <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Restaurant</p>
          <p className="text-sm font-semibold text-indigo-900 mt-0.5 truncate">{user.restaurantName}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-700 font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <HiOutlineLogout className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
