import { useState } from 'react';
import { useSchedule } from '../context/ScheduleContext';
import { parseDays, parseTimeRange } from '../utils/time';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIME_START = 6 * 60;
const TIME_END = 22 * 60;
const SLOT_MINUTES = 30;

const TIME_LABELS = [];
for (let mins = TIME_START; mins <= TIME_END; mins += 60) {
  const h = Math.floor(mins / 60);
  TIME_LABELS.push(`${h.toString().padStart(2, '0')}:00`);
}

export default function WeeklyGrid() {
  const { schedule, toggleSection } = useSchedule();
  const [tooltip, setTooltip] = useState(null);

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
      
      <div className="flex-1 overflow-auto relative">
        <div className="grid grid-cols-8 min-w-[900px]" style={{ gridTemplateRows: `auto repeat(${totalRows}, minmax(30px, 1fr))` }}>
          <div className="bg-slate-100 border-b border-slate-200"></div>
          
          {DAYS.map(day => (
            <div key={day} className="bg-slate-100 py-2 text-center text-sm font-bold text-slate-600 border-b border-l border-slate-200">
              {day}
            </div>
          ))}
          
          <div className="relative">
            {TIME_LABELS.map((label, idx) => (
              <div 
                key={idx} 
                className="text-[10px] text-slate-400 text-right pr-2 border-r border-slate-100"
                style={{ gridRow: idx + 2, height: '30px' }}
              >
                {label}
              </div>
            ))}
          </div>
          
          {DAYS.map(day => (
            <div 
              key={day} 
              className="relative border-l border-slate-200"
              style={{ gridColumn: DAYS.indexOf(day) + 2 }}
            >
              {Array.from({ length: totalRows }, (_, i) => (
                <div key={i} className="border-b border-slate-100" style={{ height: '30px' }} />
              ))}
              
              {getClassesForDay(day).map((item) => {
                const { rowStart, rowSpan } = getGridPosition(item.time);
                return (
                  <div
                    key={`${item.sectionId}-${day}`}
                    onClick={() => toggleSection({}, item)}
                    onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, item })}
                    onMouseLeave={() => setTooltip(null)}
                    className="absolute left-1 right-1 cursor-pointer bg-blue-100 border border-blue-300 rounded-md p-1 hover:bg-red-100 hover:border-red-300 transition-all overflow-hidden z-10"
                    style={{
                      top: `${(rowStart - 2) * 30}px`,
                      height: `${rowSpan * 30 - 2}px`,
                    }}
                  >
                    <div className="text-[10px] font-bold text-blue-800 truncate">
                      {item.name}
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

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
            style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}
          >
            <div className="font-bold">{tooltip.item.name}</div>
            <div className="opacity-80">{tooltip.item.code} - Sec {tooltip.item.number}</div>
            <div className="opacity-80">{tooltip.item.days} {tooltip.item.time}</div>
            <div className="opacity-80">{tooltip.item.room}</div>
          </div>
        )}
      </div>
    </div>
  );
}
