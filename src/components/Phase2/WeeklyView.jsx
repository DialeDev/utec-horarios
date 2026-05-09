import { useSchedule } from '../../context/ScheduleContext';
import { parseDays, parseTimeRange } from '../../utils/time';
import { generatePDF, downloadPDF } from '../../utils/pdfGenerator';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIME_START = 6 * 60; // 06:00 in minutes
const TIME_END = 22 * 60; // 22:00 in minutes
const SLOT_MINUTES = 30; // Each grid row = 30 minutes

// Generate time labels from 06:00 to 22:00
const TIME_LABELS = [];
for (let mins = TIME_START; mins <= TIME_END; mins += 60) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  TIME_LABELS.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
}

export default function WeeklyView() {
  const { schedule, toggleSection, exportPrefs, setExportPrefs } = useSchedule();

  // Calculate grid-row position for a class
  const getGridPosition = (timeStr) => {
    const { start, end } = parseTimeRange(timeStr);
    const rowStart = Math.floor((start - TIME_START) / SLOT_MINUTES) + 2; // +2 because row 1 is header, row 2 is 06:00
    const duration = end - start;
    const rowSpan = Math.max(1, Math.ceil(duration / SLOT_MINUTES));
    return { rowStart, rowSpan };
  };

  // Get classes for a specific day
  const getClassesForDay = (dayName) => {
    return schedule
      .filter(item => {
        const daysArray = parseDays(item.days);
        return daysArray.includes(dayName);
      })
      .sort((a, b) => {
        const timeA = parseTimeRange(a.time).start;
        const timeB = parseTimeRange(b.time).start;
        return timeA - timeB;
      });
  };

  const totalRows = Math.floor((TIME_END - TIME_START) / SLOT_MINUTES) + 1;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h2 className="font-bold text-slate-700">Tu Horario Semanal</h2>
        <div className="flex items-center gap-4">
          {/* Color picker */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Color:</label>
            <input
              type="color"
              value={exportPrefs.color}
              onChange={(e) => setExportPrefs({ ...exportPrefs, color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-slate-200"
            />
          </div>
          {/* Theme selector */}
          <select
            value={exportPrefs.theme}
            onChange={(e) => setExportPrefs({ ...exportPrefs, theme: e.target.value })}
            className="text-xs border border-slate-200 rounded px-2 py-1"
          >
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
            <option value="colorful">Colorido</option>
          </select>
          {/* Export button */}
          <button
            onClick={() => {
              const blob = generatePDF(schedule, exportPrefs.theme, exportPrefs.color, {
                showRoom: exportPrefs.showRoom,
                showCode: exportPrefs.showCode
              });
              downloadPDF(blob);
            }}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Exportar PDF
          </button>
          <span className="text-xs text-slate-400">06:00 - 22:00</span>
        </div>
      </div>
      
      {/* Time-scaled Grid */}
      <div className="flex-1 overflow-x-auto">
        <div className="grid grid-cols-8 min-w-[900px]" style={{ gridTemplateRows: `auto repeat(${totalRows}, minmax(30px, 1fr))` }}>
          {/* Time column header */}
          <div className="bg-slate-100 border-b border-slate-200"></div>
          
          {/* Day headers */}
          {DAYS.map(day => (
            <div key={day} className="bg-slate-100 py-2 text-center text-sm font-bold text-slate-600 border-b border-l border-slate-200">
              {day}
            </div>
          ))}
          
          {/* Time labels column */}
          <div className="relative">
            {TIME_LABELS.map((label, idx) => (
              <div 
                key={idx} 
                className="text-[10px] text-slate-400 text-right pr-2 border-r border-slate-100"
                style={{ 
                  gridRow: idx + 2,
                  height: '30px'
                }}
              >
                {label}
              </div>
            ))}
          </div>
          
          {/* Day columns with grid-positioned classes */}
          {DAYS.map(day => (
            <div 
              key={day} 
              className="relative border-l border-slate-200"
              style={{ gridColumn: DAYS.indexOf(day) + 2 }}
            >
              {/* Grid lines */}
              {Array.from({ length: totalRows }, (_, i) => (
                <div 
                  key={i} 
                  className="border-b border-slate-100"
                  style={{ height: '30px' }}
                />
              ))}
              
              {/* Positioned classes */}
              {getClassesForDay(day).map((item) => {
                const { rowStart, rowSpan } = getGridPosition(item.time);
                return (
                  <div
                    key={`${item.sectionId}-${day}`}
                    onClick={() => toggleSection({}, item)}
                    className="absolute left-1 right-1 cursor-pointer bg-blue-100 border border-blue-300 rounded-md p-1 hover:bg-red-100 hover:border-red-300 transition-all overflow-hidden z-10"
                    style={{
                      gridRow: `${rowStart} / span ${rowSpan}`,
                    }}
                  >
                    <div className="text-[10px] font-bold text-blue-800 truncate">
                      {item.subjectName}
                    </div>
                    <div className="text-[9px] text-blue-600 truncate">
                      {item.time}
                    </div>
                    <div className="text-[8px] text-blue-500 truncate flex justify-between">
                      <span>S{item.number}</span>
                      <span>{item.room}</span>
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