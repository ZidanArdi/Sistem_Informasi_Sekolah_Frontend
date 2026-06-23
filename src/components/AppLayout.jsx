import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
    default:
      return null;
  }
};

function AppLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const navClass = ({ isActive }) => (
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 border-l-4 ${
      isActive
        ? 'bg-slate-800 text-white border-indigo-500 shadow-md shadow-slate-950/20'
        : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white'
    }`
  );

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-68 glass-dark-sidebar bg-slate-900 px-4 py-6 lg:flex flex-col z-30">
        {/* Logo/Brand */}
        <div className="mb-8 px-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/25">
            S
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">Portal Akademik</p>
            <h1 className="text-md font-extrabold text-white tracking-wide">Sistem Informasi</h1>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 flex-1 overflow-y-auto px-1">
          <NavLink to="/dashboard" className={navClass}>
            {getIcon('dashboard')}
            <span>Dashboard</span>
          </NavLink>
          <div className="pt-4 pb-2 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Kelola Data</p>
          </div>
          {entityNav.map((item) => (
            <NavLink key={item.key} to={`/data/${item.key}`} className={navClass}>
              {getIcon(item.key)}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="mt-auto border-t border-slate-800 pt-6 px-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 border border-slate-700/50 flex items-center justify-center text-indigo-400 font-bold text-sm">
              {getInitials(user.nama || 'User')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.nama || 'Pengguna'}</p>
              <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-indigo-400 capitalize">
                {user.role || 'staff'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-red-950/30 border border-slate-700/60 hover:border-red-900/50 px-4 py-2.5 text-sm font-bold text-slate-300 hover:text-red-400 transition-all duration-200 cursor-pointer"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-68 min-h-screen flex flex-col">
        {/* Header - Mobile */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-900 text-white px-4 py-3 lg:hidden shadow-md">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                S
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-indigo-400">Portal Akademik</p>
                <p className="font-extrabold text-xs tracking-wide">Sistem Informasi</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            >
              Logout
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
            <NavLink to="/dashboard" className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition whitespace-nowrap">
              Dashboard
            </NavLink>
            {entityNav.map((item) => (
              <NavLink key={item.key} to={`/data/${item.key}`} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition whitespace-nowrap">
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
    </div>
  );
}

export default AppLayout;
