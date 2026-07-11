import { useNavigate } from 'react-router-dom';
import { useSchedule } from '../context/ScheduleContext';
import PDFUploader from './PDFUploader';

export default function Landing() {
  const navigate = useNavigate();
  const { resetSubjects } = useSchedule();

  const handleManualStart = () => {
    resetSubjects([]);
    navigate('/subjects');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-slate-800">
            📅 UniScheduler UTEC
          </h1>
          <p className="text-lg text-slate-600">
            Construye tu horario académico de forma rápida y sencilla
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* PDF Upload */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📄</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Subir Hoja de Asesorías
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Importa tu horario directamente desde el PDF de UTEC
            </p>
            <PDFUploader onParseSuccess={(result) => {
              resetSubjects(result.courses);
              navigate('/builder');
            }} />
          </div>

          {/* Manual Entry */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">✏️</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Ingresar Manualmente
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Agrega tus materias una por una
            </p>
            <button
              onClick={handleManualStart}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Comenzar
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ¿Cómo funciona?
          </h3>
          <ol className="space-y-2 text-sm text-blue-700">
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

      </div>
    </div>
  );
}