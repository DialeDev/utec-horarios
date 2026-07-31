import { useState } from 'react';
import { toast } from 'sonner';
import { useSchedule } from '../context/ScheduleContext';
import { detectConflict } from '../utils/scheduler';
import { FiCheck, FiX, FiCircle, FiChevronUp, FiChevronDown } from 'react-icons/fi';

function SectionButton({ section, status, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-2 rounded text-xs flex justify-between items-center border ${
        status === 'selected'
          ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-950/60 dark:border-green-800 dark:text-green-400'
          : status === 'conflicted'
            ? 'bg-red-100 border-red-200 text-red-700 dark:bg-red-950/60 dark:border-red-900 dark:text-red-400'
            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-600'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`shrink-0 text-sm font-bold ${
          status === 'selected' ? 'text-green-700 dark:text-green-400' :
          status === 'conflicted' ? 'text-red-600 dark:text-red-400' :
          'text-slate-400 dark:text-slate-500'
        }`}>
          {status === 'selected' ? <FiCheck size={16} className="text-green-700 dark:text-green-400" /> : status === 'conflicted' ? <FiX size={16} className="text-red-600 dark:text-red-400" /> : <FiCircle size={16} className="text-slate-400 dark:text-slate-500" />}
        </span>
        <div>
          <span className="font-bold block">Sec {section.number}</span>
          <span className="text-[10px]">{section.days}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
          <span className="block font-mono">{section.time}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{section.room}</span>
      </div>
    </button>
  );
}

export default function CourseAccordion() {
  const { subjects, toggleSection, schedule } = useSchedule();
  const [openSubjectId, setOpenSubjectId] = useState(null);

  const toggleAccordion = (id) => {
    setOpenSubjectId(openSubjectId === id ? null : id);
  };

  const isSectionSelected = (secId) => schedule.some(s => s.sectionId === secId);

  const getSectionStatus = (section) => {
    if (isSectionSelected(section.id)) return 'selected';
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

  const openSubject = openSubjectId ? subjects.find(s => s.id === openSubjectId) : null;

  if (subjects.length === 0) {
    return (
      <div className="bg-white border-b lg:border-b-0 lg:border-r border-slate-200 lg:w-80 lg:h-full lg:flex lg:flex-col shrink-0 dark:bg-slate-900 dark:border-slate-700">
        <div className="p-3 lg:p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-700 text-sm lg:text-base dark:text-slate-300">Materias</h2>
        </div>
        <div className="hidden lg:flex flex-1 items-center justify-center p-4 text-sm text-slate-500 dark:text-slate-400">
          No hay materias. Subí un PDF o ingresalas manualmente.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b lg:border-b-0 lg:border-r border-slate-200 lg:w-80 lg:h-full lg:flex lg:flex-col shrink-0 dark:bg-slate-900 dark:border-slate-700">
      {/* Header */}
      <div className="p-3 lg:p-4 border-b border-slate-100 flex justify-between items-center lg:block dark:border-slate-800">
        <h2 className="font-bold text-slate-700 text-sm lg:text-base dark:text-slate-300">Materias</h2>
        <span className="text-xs text-slate-500 lg:hidden dark:text-slate-400">{subjects.length} materias</span>
      </div>

      {/* Subject list: horizontal scroll en mobile, vertical accordion en desktop */}
      <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto gap-1.5 p-2 lg:p-0 lg:flex-1">
        {subjects.map(subject => (
          <div key={subject.id} className="flex-shrink-0 lg:flex-shrink lg:border-b lg:border-slate-100 w-36 lg:w-auto dark:lg:border-slate-800">
            <button
              onClick={() => toggleAccordion(subject.id)}
              className={`
                w-full text-left
                lg:p-4 p-2
                rounded-lg lg:rounded-none
                hover:bg-slate-50 transition-colors dark:hover:bg-slate-800
                border lg:border-0 border-slate-200 dark:border-slate-700
                ${openSubjectId === subject.id ? 'bg-blue-50 lg:bg-transparent border-blue-300 lg:border-0 dark:bg-blue-950/60 dark:lg:bg-transparent dark:border-blue-700 dark:lg:border-0' : ''}
              `}
            >
              <div className="font-semibold text-xs lg:text-sm text-slate-800 truncate dark:text-slate-200">{subject.name}</div>
              <div className="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400">{subject.code}</div>
              {/* Desktop: count + chevron */}
              <div className="hidden lg:flex items-center justify-between mt-0.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{subject.sections.length} secciones</span>
                <span className="text-slate-500 dark:text-slate-400">{openSubjectId === subject.id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}</span>
              </div>
              {/* Mobile: mini section badges */}
              <div className="lg:hidden mt-1 flex flex-wrap gap-0.5">
                {subject.sections.slice(0, 3).map(s => (
                  <span key={s.id} className={`text-[9px] px-1 py-px rounded border ${isSectionSelected(s.id) ? 'bg-green-200 border-green-400 text-green-800 dark:bg-green-950/60 dark:border-green-800 dark:text-green-400' : 'bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'}`}>
                    {s.number}
                  </span>
                ))}
                {subject.sections.length > 3 && (
                  <span className="text-[9px] text-slate-500 dark:text-slate-400">+{subject.sections.length - 3}</span>
                )}
              </div>
            </button>

            {/* Desktop: sections accordion inline */}
            {openSubjectId === subject.id && (
              <div className="hidden lg:block bg-slate-50 px-2 pb-2 space-y-1 dark:bg-slate-800/50">
                {subject.sections.map(section => (
                  <SectionButton
                    key={section.id}
                    section={section}
                    status={getSectionStatus(section)}
                    onClick={() => handleSectionClick(subject, section)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: sections panel for selected subject */}
      {openSubject && (
        <div className="lg:hidden border-t border-slate-200 p-2 space-y-1 max-h-36 overflow-y-auto dark:border-slate-700">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 dark:text-slate-400">{openSubject.name}</p>
          {openSubject.sections.map(section => (
            <SectionButton
              key={section.id}
              section={section}
              status={getSectionStatus(section)}
              onClick={() => handleSectionClick(openSubject, section)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
