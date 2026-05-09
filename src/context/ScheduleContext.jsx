import { createContext, useState, useEffect, use } from 'react';
import { parseDays, parseTimeRange, checkTimeConflict } from '../utils/time';

const ScheduleContext = createContext(null);

export function ScheduleProvider({ children }) {
  // Estado 1: Inventario de Materias
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('uni_subjects');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado 2: Horario Seleccionado
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('uni_schedule');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('uni_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('uni_schedule', JSON.stringify(schedule));
  }, [schedule]);

  // --- ACCIONES FASE 1 (Gestión de Materias) ---

  const addSubject = (subjectData) => {
    setSubjects(prev => [...prev, { ...subjectData, id: crypto.randomUUID() }]);
  };

  const deleteSubject = (id) => {
    // Primero limpiamos cualquier sección de esta materia que esté en el horario
    setSchedule(prev => prev.filter(item => {
        const subjectToDelete = subjects.find(s => s.id === id);
        // Si la materia existe y coincide el código/nombre, la removemos del horario también
        // (Mejor enfoque: filtrar si el item no pertenece a la materia eliminada, 
        // pero como schedule guarda copias planas, lo ideal es limpiar por código si es único)
        return true; 
    }));
    setSubjects(prev => prev.filter(sub => sub.id !== id));
  };

  const updateSubject = (updatedSubject) => {
    setSubjects(prev => prev.map(sub => 
      sub.id === updatedSubject.id ? updatedSubject : sub
    ));
  };

  // --- ACCIONES FASE 2 (Gestión de Horario) ---

  const toggleSection = (subject, section) => {
    const isSelected = schedule.some(item => item.sectionId === section.id);

    if (isSelected) {
      setSchedule(prev => prev.filter(item => item.sectionId !== section.id));
      return { success: true, action: 'removed' };
    } else {
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
          error: `Conflicto con ${conflict.subjectName} (${conflict.days} ${conflict.time})` 
        };
      }

      setSchedule(prev => [
        ...prev, 
        { 
          sectionId: section.id,
          subjectName: subject.name, // Asegúrate de pasar el nombre correcto al actualizar
          code: subject.code,
          ...section 
        }
      ]);
      return { success: true, action: 'added' };
    }
  };

  return (
    <ScheduleContext.Provider value={{ 
      subjects, addSubject, deleteSubject, updateSubject, 
      schedule, toggleSection 
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export const useSchedule = () => {
  const context = use(ScheduleContext);
  if (!context) throw new Error("useSchedule debe usarse dentro de ScheduleProvider");
  return context;
};