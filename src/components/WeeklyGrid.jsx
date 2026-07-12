import { useSchedule } from '../context/ScheduleContext';
import { parseDays, parseTimeRange } from '../utils/time';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIME_START = 6 * 60;
const TIME_END = 22 * 60;
const SLOT_MINUTES = 30;
const ROW_HEIGHT = 48; // px por slot de 30 min — generoso para distinguir medias horas

const TIME_LABELS = [];
for (let mins = TIME_START; mins <= TIME_END; mins += 60) {
  const h = Math.floor(mins / 60);
  TIME_LABELS.push(`${h.toString().padStart(2, '0')}:00`);
}

const formatRoom = (room) => {
  if (!room || room.toUpperCase() === 'EN LINEA') return 'En Línea';
  return room;
};

export default function WeeklyGrid() {
  const { schedule, removeFromSchedule } = useSchedule();

  const getGridPosition = (timeStr) => {
    const { start, end } = parseTimeRange(timeStr);
    const rowStart = Math.floor((start - TIME_START) / SLOT_MINUTES) + 2;
    const duration = end - start;
    const rowSpan = Math.max(1, Math.ceil(duration / SLOT_MINUTES));
    return { rowStart, rowSpan };
  };

  const getClassesForDay = (dayName) => {
    return schedule
      .filter(item => {
        const daysArray = parseDays(item.days);
        return daysArray.includes(dayName);
      })
      .sort((a, b) => parseTimeRange(a.time).start - parseTimeRange(b.time).start);
  };

  const totalRows = Math.floor((TIME_END - TIME_START) / SLOT_MINUTES) + 1;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h2 className="font-bold text-slate-700">Tu Horario Semanal</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">{schedule.length} secciones</span>
          <span className="text-xs text-slate-400">06:00 - 22:00</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto overscroll-contain">
        <div 
          className="grid min-w-[700px]"
          style={{ 
            gridTemplateColumns: `44px repeat(7, minmax(80px, 1fr))`,
            gridTemplateRows: `auto repeat(${totalRows}, ${ROW_HEIGHT}px)` 
          }}
        >
          <div className="bg-slate-100 border-b border-slate-200 sticky left-0" style={{ zIndex: 20 }}></div>
          
          {DAYS.map(day => (
            <div key={day} className="bg-slate-100 py-2 text-center text-[10px] sm:text-sm font-bold text-slate-600 border-b border-l border-slate-200">
              {day}
            </div>
          ))}
          
          <div className="sticky left-0 z-10 bg-slate-50 relative" style={{ gridRow: '2 / -1' }}>
            {TIME_LABELS.map((label, idx) => (
              <div 
                key={idx} 
                className="text-[10px] text-slate-400 text-right pr-1.5 border-r border-slate-100 absolute left-0 right-0"
                style={{ 
                  top: `${idx * 2 * ROW_HEIGHT}px`,
                  height: `${ROW_HEIGHT * 2}px`
                }}
              >
                <span className="relative -top-2">{label}</span>
              </div>
            ))}
          </div>
          
          {DAYS.map(day => (
            <div 
              key={day} 
              className="relative border-l border-slate-200"
              style={{ gridColumn: DAYS.indexOf(day) + 2, gridRow: '2 / -1' }}
            >
              {Array.from({ length: totalRows }, (_, i) => (
                <div key={i} className="border-b border-slate-100" style={{ height: `${ROW_HEIGHT}px` }} />
              ))}
              
              {getClassesForDay(day).map((item) => {
                const { rowStart, rowSpan } = getGridPosition(item.time);
                return (
                  <div
                    key={`${item.sectionId}-${day}`}
                    onClick={() => removeFromSchedule(item.id)}
                    className="absolute inset-x-0.5 cursor-pointer bg-blue-50 border border-blue-200 rounded-md p-1.5 hover:bg-red-50 hover:border-red-300 transition-all overflow-hidden z-10 flex flex-col"
                    style={{
                      top: `${(rowStart - 2) * ROW_HEIGHT}px`,
                      height: `${rowSpan * ROW_HEIGHT - 2}px`,
                    }}
                  >
                    <div className="text-[10px] font-bold text-blue-900 truncate leading-tight">
                      {item.name}
                    </div>
                    <div className="text-[9px] text-blue-900 truncate leading-tight">
                      {item.time}
                    </div>
                    <div className="text-[8px] text-blue-900 truncate leading-tight mt-auto flex justify-between">
                      <span>Sec {item.number}</span>
                      <span>{formatRoom(item.room)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
