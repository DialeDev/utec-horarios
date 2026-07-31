import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiCalendar, FiMoon, FiSun } from 'react-icons/fi';

export default function Layout() {
  const loc = useLocation();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('uni_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('uni_theme', 'light');
    }
    window.dispatchEvent(new Event('themechange'));
  };

  const navClass = (path) => 
    `px-4 py-2 rounded-md transition-colors font-medium ${
      loc.pathname === path 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <FiCalendar className="text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Horarios UTEC</span>
          </Link>
          <div className="flex items-center gap-2">
            <nav className="flex gap-2">
              <Link to="/" className={navClass('/')}>Inicio</Link>
              <Link to="/materias" className={navClass('/materias')}>Materias</Link>
              <Link to="/horario" className={navClass('/horario')}>Horario</Link>
            </nav>
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-2 rounded-md text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}