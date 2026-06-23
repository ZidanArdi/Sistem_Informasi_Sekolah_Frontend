import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { entityNav } from '../data/entities';

function AppLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const navClass = ({ isActive }) => (
    `block rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
    }`
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sekolah</p>
          <h1 className="mt-1 text-xl font-bold">Sistem Informasi</h1>
        </div>

        <nav className="space-y-1">
          <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
          {entityNav.map((item) => (
            <NavLink key={item.key} to={`/data/${item.key}`} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 border-t border-slate-200 pt-4">
          <p className="truncate text-sm font-semibold">{user.nama || 'Pengguna'}</p>
          <p className="mb-3 truncate text-xs text-slate-500">{user.role || 'staff'}</p>
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Sekolah</p>
              <p className="font-bold">Sistem Informasi</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold"
            >
              Logout
            </button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
            {entityNav.map((item) => (
              <NavLink key={item.key} to={`/data/${item.key}`} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
