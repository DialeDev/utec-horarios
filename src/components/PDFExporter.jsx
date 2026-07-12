import { ReporteGenerator, downloadPDF } from '../utils/pdfGenerator';
import { useSchedule } from '../context/ScheduleContext';

export default function PDFExporter() {
  const { schedule } = useSchedule();

  const handleExport = () => {
    if (schedule.length === 0) {
      return;
    }
    const blob = ReporteGenerator.generarHorarioPDF(schedule);
    downloadPDF(blob);
  };

  return (
    <button
      onClick={handleExport}
      disabled={schedule.length === 0}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Descargar PDF
    </button>
  );
}
