import { useSchedule } from '../../context/ScheduleContext';
import { parseDays, parseTimeRange } from '../../utils/time';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function WeeklyView() {
  const { schedule, toggleSection } = useSchedule();

  // Función para obtener las clases de un día específico y ordenarlas cronológicamente
  const getClassesForDay = (dayName) => {
    return schedule
      .filter(item => {
        const daysArray = parseDays(item.days);
        return daysArray.includes(dayName);
      })
      .sort((a, b) => {
        // Ordenamiento Cronológico (Pila invertida visualmente ordenada)
        const timeA = parseTimeRange(a.time).start;
        const timeB = parseTimeRange(b.time).start;
        return timeA - timeB;
      });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-bold text-slate-700">Tu Horario Semanal</h2>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[1000px] h-full divide-x divide-slate-200">
          {DAYS.map(day => (
            <div key={day} className="flex flex-col">
              {/* Header del día */}
              <div className="bg-slate-100 py-2 text-center text-sm font-bold text-slate-600 border-b border-slate-200">
                {day}
              </div>
              
              {/* Contenedor de "Pila" */}
              <div className="flex-1 p-2 space-y-2 bg-slate-50/50">
                {getClassesForDay(day).map((item) => (
                  <div 
                    key={`${item.sectionId}-${day}`}
                    onClick={() => toggleSection({}, item)} // Permitir eliminar al tocar
                    className="cursor-pointer group relative bg-blue-100 border border-blue-200 p-2 rounded-md hover:bg-red-50 hover:border-red-200 transition-all"
                  >
                    <div className="text-xs font-bold text-blue-800 group-hover:text-red-600">
                      {item.time}
                    </div>
                    <div className="text-xs font-semibold text-slate-700 truncate group-hover:text-red-800">
                      {item.subjectName}
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between mt-1">
                      <span>Sec {item.number}</span>
                      <span>{item.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}