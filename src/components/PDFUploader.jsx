import { toast } from 'sonner';
import { parsePDF } from '../utils/pdfParser';

export default function PDFUploader({ onParseSuccess }) {
  const handlePDFUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Por favor selecciona un archivo PDF válido');
      return;
    }

    try {
      toast.promise(parsePDF(file), {
        loading: 'Parseando PDF...',
        success: (result) => {
          onParseSuccess(result);
          if (result.warnings.length > 0) {
            return `PDF procesado. ${result.warnings.length} advertencias`;
          }
          return 'Horario cargado exitosamente';
        },
        error: (err) => err.message || 'Error al parsear el PDF'
      });
    } catch (err) {
      toast.error('Error al procesar el PDF. Prueba ingresar manualmente.');
    }
  };

  return (
    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium w-full">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      Seleccionar PDF
      <input
        type="file"
        accept="application/pdf"
        onChange={handlePDFUpload}
        className="hidden"
      />
    </label>
  );
}
