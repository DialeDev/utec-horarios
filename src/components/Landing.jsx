import { useNavigate } from 'react-router-dom';
import { useSchedule } from '../context/ScheduleContext';
import PDFUploader from './PDFUploader';
import { FiCalendar, FiFile, FiEdit2, FiGithub } from 'react-icons/fi';

export default function Landing() {
  const navigate = useNavigate();
  const { resetSubjects } = useSchedule();

  const handleManualStart = () => {
    resetSubjects([]);
    navigate('/materias');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-3">
            <FiCalendar className="text-blue-600 dark:text-blue-400" /> Horarios UTEC
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Construye tu horario académico de forma rápida y sencilla
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* PDF Upload */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow flex flex-col dark:bg-slate-900 dark:border-slate-700">
            <div className="text-4xl mb-4"><FiFile className="inline-block text-slate-600 dark:text-slate-400" size={48} /></div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Subir Hoja de Asesorías
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Importa tu horario directamente desde el PDF de UTEC
            </p>
            <div className="mt-auto flex justify-center">
              <PDFUploader onParseSuccess={(result) => {
                resetSubjects(result.courses);
                navigate('/horario');
              }} />
            </div>
          </div>

          {/* Manual Entry */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow flex flex-col dark:bg-slate-900 dark:border-slate-700">
            <div className="text-4xl mb-4"><FiEdit2 className="inline-block text-slate-600 dark:text-slate-400" size={48} /></div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Ingresar Manualmente
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Agrega tus materias una por una
            </p>
            <div className="mt-auto flex justify-center">
              <button
                onClick={handleManualStart}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium w-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Comenzar
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left dark:bg-blue-950/60 dark:border-blue-800">
          <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ¿Cómo funciona?
          </h3>
          <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Sube tu hoja de asesorías en PDF o ingresa tus materias manualmente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Selecciona las secciones que deseas tomar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>El sistema detecta conflictos automáticamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>Exporta tu horario a PDF para imprimirlo</span>
            </li>
          </ol>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-200 dark:border-slate-700">
          <a
            href="https://github.com/DialeDev/utec-horarios/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
          >
            <FiGithub className="text-lg" />
            ¿Tienes algún problema? Repórtalo aquí
          </a>
        </footer>

      </div>
    </div>
  );
}