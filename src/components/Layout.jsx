import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiCalendar } from 'react-icons/fi';

export default function Layout() {
  const loc = useLocation();
  
  const navClass = (path) => 
    `px-4 py-2 rounded-md transition-colors font-medium ${
      loc.pathname === path 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-200'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FiCalendar className="text-blue-600" /> Horarios Utec</h1>
          <nav className="flex gap-2">
            <Link to="/" className={navClass('/')}>Inicio</Link>
            <Link to="/subjects" className={navClass('/subjects')}>Materias</Link>
            <Link to="/builder" className={navClass('/builder')}>Horario</Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}