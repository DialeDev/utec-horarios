import { createContext, useState, useEffect, useContext } from 'react';
import { parseDays, parseTimeRange, checkTimeConflict } from '../utils/time';

const ScheduleContext = createContext(null);

export function ScheduleProvider({ children }) {
  // Estado 1: Inventario de Materias
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('uni_subjects');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    // Migration: ensure every subject has an id
    const migrated = parsed.map(sub => ({
      ...sub,
      id: sub.id || crypto.randomUUID(),
    }));
    if (migrated.length > 0 && !parsed[0]?.id) {
      localStorage.setItem('uni_subjects', JSON.stringify(migrated));
    }
    return migrated;
  });

  // Estado 2: Horario Seleccionado
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('uni_schedule');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    // Migration: add id and courseId if missing (schema v1 -> v2)
    const migrated = parsed.map(item => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      courseId: item.courseId || '',
    }));
    if (migrated.length > 0 && !parsed[0]?.id) {
      localStorage.setItem('uni_schedule', JSON.stringify(migrated));
      localStorage.setItem('uni_schema_version', '2');
    }
    return migrated;
  });

  // Estado 3: Preferencias de Exportación
  const [exportPrefs, setExportPrefs] = useState(() => {
    const saved = localStorage.getItem('uni_export_prefs');
    return saved ? JSON.parse(saved) : { theme: 'light', color: '#2563eb', showCode: true, showRoom: true };
  });

  useEffect(() => {
    localStorage.setItem('uni_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('uni_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('uni_export_prefs', JSON.stringify(exportPrefs));
  }, [exportPrefs]);

  // --- ACCIONES FASE 1 (Gestión de Materias) ---

  const addSubject = (subjectData) => {
    setSubjects(prev => [...prev, { ...subjectData, id: crypto.randomUUID() }]);
  };

  const deleteSubject = (id) => {
    setSchedule(prev => prev.filter(item => item.courseId !== id));
    setSubjects(prev => prev.filter(sub => sub.id !== id));
  };

  const updateSubject = (updatedSubject) => {
    setSubjects(prev => prev.map(sub => 
      sub.id === updatedSubject.id ? updatedSubject : sub
    ));
  };

  // Reset subjects from PDF import
  const resetSubjects = (courses) => {
    setSubjects(courses.map(course => ({
      ...course,
      id: crypto.randomUUID()
    })));
    setSchedule([]);
  };

  // --- ACCIONES FASE 2 (Gestión de Horario) ---

  const removeFromSchedule = (id) => {
    setSchedule(prev => prev.filter(item => item.id !== id));
  };

  const toggleSection = (subject, section) => {
    const isSelected = schedule.some(item => item.sectionId === section.id);

    if (isSelected) {
      setSchedule(prev => prev.filter(item => item.sectionId !== section.id));
      return { success: true, action: 'removed' };
    }

    // No permitir dos secciones de la misma materia
    if (subject?.id) {
      const existingSection = schedule.find(item => item.courseId === subject.id);
      if (existingSection) {
        return {
          success: false,
          error: `Ya tienes "${subject.name}" con la sección ${existingSection.number}. Elimínala primero para cambiar de sección.`
        };
      }
    }

    const newDays = parseDays(section.days);
    const newTime = parseTimeRange(section.time);
    
    const conflict = schedule.find(existing => {
      const existingDays = parseDays(existing.days);
      const dayOverlap = newDays.some(d => existingDays.includes(d));
      if (!dayOverlap) return false;

      const existingTime = parseTimeRange(existing.time);
      return checkTimeConflict(newTime, existingTime);
    });

    if (conflict) {
      return { 
        success: false, 
        error: `Conflicto con ${conflict.name} (${conflict.days} ${conflict.time}). Prueba con otra sección.` 
      };
    }

    setSchedule(prev => [
      ...prev, 
      { 
        ...section,
        id: crypto.randomUUID(),
        courseId: subject.id,
        sectionId: section.id,
        name: subject.name,
        code: subject.code,
      }
    ]);
    return { success: true, action: 'added' };
  };

  const clearAll = () => {
    setSubjects([]);
    setSchedule([]);
  };

  return (
    <ScheduleContext.Provider value={{ 
      subjects, addSubject, deleteSubject, updateSubject, resetSubjects,
      schedule, toggleSection, removeFromSchedule, clearAll,
      exportPrefs, setExportPrefs
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) throw new Error("useSchedule debe usarse dentro de ScheduleProvider");
  return context;
};