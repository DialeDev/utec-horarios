import { useState } from 'react';
import { toast } from 'sonner';
import { useSchedule } from '../../context/ScheduleContext';

export default function ClassSelector() {
  const { subjects, toggleSection, schedule } = useSchedule();
  const [openSubjectId, setOpenSubjectId] = useState(null);

  const toggleAccordion = (id) => {
    setOpenSubjectId(openSubjectId === id ? null : id);
  };

  const isSectionSelected = (secId) => schedule.some(s => s.sectionId === secId);

  const handleSectionClick = (subject, section) => {
    const result = toggleSection(subject, section);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success(result.action === 'added' ? 'Sección agregada' : 'Sección removida');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 w-80 shrink-0">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-bold text-slate-700">Materias</h2>
        <p className="text-xs text-slate-500">Toca para desplegar secciones</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {subjects.map(subject => (
          <div key={subject.id} className="border-b border-slate-100">
            {/* Cabecera Materia */}
            <button 
              onClick={() => toggleAccordion(subject.id)}
              className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-sm text-slate-800">{subject.name}</div>
                <div className="text-xs text-slate-400">{subject.code}</div>
              </div>
              <span className="text-slate-400 text-xs">{openSubjectId === subject.id ? '▲' : '▼'}</span>
            </button>

            {/* Lista de Secciones (Desplegable) */}
            {openSubjectId === subject.id && (
              <div className="bg-slate-50 px-2 pb-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                {subject.sections.map(section => {
                  const selected = isSectionSelected(section.id);
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(subject, section)}
                      className={`w-full text-left p-2 rounded text-xs flex justify-between items-center border ${
                        selected 
                          ? 'bg-green-100 border-green-300 text-green-800' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      <div>
                        <span className="font-bold block">Sec {section.number}</span>
                        <span className="text-[10px]">{section.days}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-mono">{section.time}</span>
                        <span className="text-[10px] opacity-75">{section.room}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}