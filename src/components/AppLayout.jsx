import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { entityNav } from '../data/entities';

const getIcon = (key) => {
  const props = { className: "w-5 h-5 transition-colors duration-200" };
  switch (key) {
    case 'dashboard':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case 'guru':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'kelas':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'siswa':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'mapel':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'jadwal':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'nilai':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'profil-saya':
    case 'profil-guru':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'absensi':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case 'pengumuman':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      );
    case 'laporan':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'user-management':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'role-permissions':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'system-settings':
      return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
};

function AppLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok');
      return;
    }

    try {
      await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword
      });
      setPasswordSuccess('Password berhasil diubah!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Gagal mengubah password');
    }
  };

  const getActiveState = (to) => {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    
    const [targetPath, targetSearch] = to.split('?');
    
    if (currentPath !== targetPath) return false;
    
    if (!targetSearch) {
      if (targetPath === '/dashboard') {
        return !currentSearch || currentSearch === '?tab=dashboard';
      }
      return true;
    }
    
    return currentSearch === `?${targetSearch}`;
  };

  const getLinkClass = (to) => {
    const isActive = getActiveState(to);
    return `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 border-l-4 ${
      isActive
        ? 'bg-green-50 text-green-700 border-green-600 shadow-sm font-extrabold'
        : 'text-gray-600 border-transparent hover:bg-green-50/50 hover:text-green-700'
    }`;
  };

  const getRoleMenus = (role) => {
    const normRole = (role || 'siswa').toLowerCase().replace(' ', '_');
    switch (normRole) {
      case 'siswa':
        return [
          { label: 'Menu Utama', type: 'header' },
          { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
          { label: 'Profil Saya', to: '/dashboard?tab=profil-saya', icon: 'profil-saya' },
          { label: 'Jadwal Pelajaran', to: '/dashboard?tab=jadwal-pelajaran', icon: 'jadwal' },
          { label: 'Nilai Akademik', to: '/dashboard?tab=nilai-akademik', icon: 'nilai' },
          { label: 'Absensi', to: '/dashboard?tab=absensi', icon: 'absensi' },
          { label: 'Pengumuman', to: '/dashboard?tab=pengumuman', icon: 'pengumuman' },
        ];
      case 'guru':
        return [
          { label: 'Menu Utama', type: 'header' },
          { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
          { label: 'Profil Guru', to: '/dashboard?tab=profil-guru', icon: 'profil-guru' },
          { label: 'Jadwal Mengajar', to: '/dashboard?tab=jadwal-mengajar', icon: 'jadwal' },
          { label: 'Data Siswa', to: '/dashboard?tab=data-siswa', icon: 'siswa' },
          { label: 'Input Nilai', to: '/data/nilai', icon: 'nilai' },
          { label: 'Absensi Siswa', to: '/dashboard?tab=absensi', icon: 'absensi' },
          { label: 'Pengumuman', to: '/dashboard?tab=pengumuman', icon: 'pengumuman' },
        ];
      case 'staff_tu':
      case 'staff':
      case 'staff-tu':
      case 'tu':
        return [
          { label: 'Menu Utama', type: 'header' },
          { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
          { label: 'Kelola Data', type: 'header' },
          { label: 'Data Guru', to: '/data/guru', icon: 'guru' },
          { label: 'Data Siswa', to: '/data/siswa', icon: 'siswa' },
          { label: 'Data Kelas', to: '/data/kelas', icon: 'kelas' },
          { label: 'Mata Pelajaran', to: '/data/mapel', icon: 'mapel' },
          { label: 'Jadwal', to: '/data/jadwal', icon: 'jadwal' },
          { label: 'Laporan', to: '/dashboard?tab=laporan', icon: 'laporan' },
        ];
      case 'admin':
      case 'administrator':
      default:
        return [
          { label: 'Menu Utama', type: 'header' },
          { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
          { label: 'Kelola Data', type: 'header' },
          { label: 'User Management', to: '/dashboard?tab=user-management', icon: 'user-management' },
          { label: 'Role Permissions', to: '/dashboard?tab=role-permissions', icon: 'role-permissions' },
          { label: 'Data Guru', to: '/data/guru', icon: 'guru' },
          { label: 'Data Siswa', to: '/data/siswa', icon: 'siswa' },
          { label: 'Data Kelas', to: '/data/kelas', icon: 'kelas' },
          { label: 'Mata Pelajaran', to: '/data/mapel', icon: 'mapel' },
          { label: 'Jadwal', to: '/data/jadwal', icon: 'jadwal' },
          { label: 'Laporan', to: '/dashboard?tab=laporan', icon: 'laporan' },
          { label: 'System Settings', to: '/dashboard?tab=system-settings', icon: 'system-settings' },
        ];
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';
  };

  const menus = getRoleMenus(user.role);

  return (
    <div className="min-h-screen bg-green-50/30 text-gray-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-68 glass-sidebar bg-white px-4 py-6 lg:flex flex-col z-30 border-r border-gray-200">
        {/* Logo/Brand */}
        <div className="mb-8 px-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-green-500/25">
            S
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-green-600">Portal Akademik</p>
            <h1 className="text-md font-extrabold text-gray-950 tracking-wide">Sistem Informasi</h1>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 flex-1 overflow-y-auto px-1">
          {menus.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={idx} className="pt-4 pb-2 px-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{item.label}</p>
                </div>
              );
            }
            return (
              <Link key={idx} to={item.to} className={getLinkClass(item.to)}>
                {getIcon(item.icon)}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-68 min-h-screen flex flex-col">
        {/* Header - Desktop */}
        <header className="hidden lg:flex items-center justify-end px-8 pt-6 pb-2 bg-transparent gap-4">
          {/* Chat Icon */}
          <button type="button" className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-green-600 hover:border-green-300 transition duration-200 shadow-sm cursor-pointer">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          
          {/* Notification Icon */}
          <button type="button" className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-green-600 hover:border-green-300 transition duration-200 shadow-sm cursor-pointer relative">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          {/* Profile Dropdown / User Details */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 pl-2 border-l border-gray-250 hover:opacity-85 transition cursor-pointer text-left focus:outline-none"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-green-500/10 to-emerald-500/10 border border-green-200 flex items-center justify-center text-green-700 font-bold text-sm overflow-hidden shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" 
                  alt={user.nama} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-bold text-gray-900">{user.nama || 'Pengguna'}</p>
                <p className="text-[11px] font-semibold text-gray-500 capitalize">{user.role || 'staff'}</p>
              </div>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-gray-400 ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-250 shadow-lg py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menu Pengguna</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2 transition cursor-pointer"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Info Profil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2 transition cursor-pointer"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-5-3a3 3 0 11-6 0 3 3 0 016 0zM4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  Ubah Password
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition cursor-pointer"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Header - Mobile */}
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white text-gray-900 px-4 py-3 lg:hidden shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                S
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-green-600">Portal Akademik</p>
                <p className="font-extrabold text-xs tracking-wide text-gray-900">Sistem Informasi</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-red-600 border border-gray-200 cursor-pointer"
            >
              Logout
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
            <NavLink to="/dashboard" className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:text-green-700 hover:bg-green-50 transition whitespace-nowrap">
              Dashboard
            </NavLink>
            {entityNav.map((item) => (
              <NavLink key={item.key} to={`/data/${item.key}`} className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:text-green-700 hover:bg-green-50 transition whitespace-nowrap">
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        {/* Content Body */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
          <Outlet />
        </main>
      </div>

      {/* Modal - Info Profil */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            {/* Banner Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6 text-white relative">
              <h3 className="text-lg font-extrabold tracking-tight">Informasi Profil</h3>
              <p className="text-xs text-green-100 mt-1">Portal Akademik Sistem Informasi Sekolah</p>
              <button 
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 h-8 w-8 rounded-full flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 flex items-center justify-center overflow-hidden shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" 
                    alt={user.nama} 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <h4 className="text-base font-extrabold text-gray-900 mt-3">{user.nama}</h4>
                <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200/50 px-3 py-1 text-xs font-bold text-green-700 capitalize mt-1.5">
                  {user.role}
                </span>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</label>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{user.nama}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{user.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No. Induk / NISN</label>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {user.role === 'admin' ? 'N/A' : (user.role === 'siswa' ? '1202204012' : '198705122010121002')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-sm font-bold text-gray-700 rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Ubah Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6 text-white relative">
              <h3 className="text-lg font-extrabold tracking-tight">Ubah Password</h3>
              <p className="text-xs text-green-100 mt-1">Ubah kata sandi akun Anda demi keamanan</p>
              <button 
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                  setPasswordSuccess('');
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 h-8 w-8 rounded-full flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="p-6 space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 animate-shake">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs font-bold text-green-600">
                    {passwordSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Password Lama</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 px-3.5 py-2.5 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:border-green-600 focus:outline-none transition duration-150"
                    placeholder="Masukkan password lama"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Password Baru</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 px-3.5 py-2.5 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:border-green-600 focus:outline-none transition duration-150"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-250 px-3.5 py-2.5 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:border-green-600 focus:outline-none transition duration-150"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordSuccess('');
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-sm font-bold text-gray-700 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm font-bold text-white rounded-xl shadow-md transition cursor-pointer"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppLayout;
