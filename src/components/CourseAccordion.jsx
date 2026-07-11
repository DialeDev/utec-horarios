import { useState } from 'react';
import { toast } from 'sonner';
import { useSchedule } from '../context/ScheduleContext';
import { detectConflict } from '../utils/scheduler';

export default function CourseAccordion() {
  const { subjects, toggleSection, schedule } = useSchedule();
  const [openSubjectId, setOpenSubjectId] = useState(null);

  const toggleAccordion = (id) => {
    setOpenSubjectId(openSubjectId === id ? null : id);
  };

  const isSectionSelected = (secId) => schedule.some(s => s.sectionId === secId);

  const getSectionStatus = (section) => {
    if (isSectionSelected(section.id)) return 'selected';
    // Check if adding this would conflict
    const result = detectConflict(section, schedule);
    if (result.conflict) return 'conflicted';
    return 'available';
  };

  const handleSectionClick = (subject, section) => {
    const result = toggleSection(subject, section);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success(result.action === 'added' ? 'Sección agregada' : 'Sección removida');
    }
  };

  if (subjects.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white border-r border-slate-200 w-80 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-700">Materias</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-sm text-slate-400">
          No hay materias. Subí un PDF o ingresalas manualmente.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 w-80 shrink-0">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-bold text-slate-700">Materias</h2>
        <p className="text-xs text-slate-500">Toca para desplegar secciones</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {subjects.map(subject => (
          <div key={subject.id} className="border-b border-slate-100">
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

            {openSubjectId === subject.id && (
              <div className="bg-slate-50 px-2 pb-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                {subject.sections.map(section => {
                  const status = getSectionStatus(section);
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(subject, section)}
                      className={`w-full text-left p-2 rounded text-xs flex justify-between items-center border ${
                        status === 'selected'
                          ? 'bg-green-50 border-green-300'
                          : status === 'conflicted'
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          status === 'selected' ? 'text-green-600' :
                          status === 'conflicted' ? 'text-red-500' :
                          'text-slate-300'
                        }`}>
                          {status === 'selected' ? '✓' : status === 'conflicted' ? '✗' : '○'}
                        </span>
                        <div>
                          <span className="font-bold block">Sec {section.number}</span>
                          <span className="text-[10px]">{section.days}</span>
                        </div>
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
