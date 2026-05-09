import { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';

export default function SubjectManager() {
  const { addSubject, updateSubject, deleteSubject, subjects } = useSchedule();
  
  // Estado del formulario
  const [form, setForm] = useState({
    id: null, // Si existe ID, estamos editando
    code: '', 
    name: '', 
    sections: []
  });
  
  const [tempSection, setTempSection] = useState({
    number: '01', days: 'Lu, Vi', time: '06:30-08:00', room: 'EN LINEA'
  });

  // --- MANEJO DE SECCIONES INTERNAS ---

  const handleAddSection = () => {
    if (!tempSection.number || !tempSection.days || !tempSection.time) return;
    setForm(prev => ({
      ...prev,
      sections: [...prev.sections, { ...tempSection, id: crypto.randomUUID() }]
    }));
    // Opcional: limpiar inputs de sección tras agregar, o dejar para ingreso rápido
  };

  const handleRemoveSection = (sectionId) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  // --- GUARDADO DEL FORMULARIO ---

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!form.name || form.sections.length === 0) {
      alert("Debes agregar nombre y al menos una sección");
      return;
    }

    if (form.id) {
      // Modo Edición
      updateSubject(form);
    } else {
      // Modo Creación (limpiamos ID por si acaso, aunque no debería tener)
      const { id, ...newSubject } = form;
      addSubject(newSubject);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ id: null, code: '', name: '', sections: [] });
    setTempSection({ number: '01', days: 'Lu, Vi', time: '06:30-08:00', room: 'EN LINEA' });
  };

  // --- ACCIONES LISTADO (Cargar en form / Borrar) ---

  const handleEditClick = (subject) => {
    // Cargamos los datos en el formulario
    setForm({ ...subject });
    // Scroll suave hacia arriba para ver el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    if (confirm('¿Estás seguro de eliminar esta materia?')) {
      deleteSubject(id);
      // Si estábamos editando justo esa materia, limpiar el form
      if (form.id === id) resetForm();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* COLUMNA IZQUIERDA: FORMULARIO */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit sticky top-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-700">
            {form.id ? 'Editar Materia' : 'Agregar Nueva Materia'}
          </h2>
          {form.id && (
            <button onClick={resetForm} className="text-xs text-red-500 hover:underline">
              Cancelar Edición
            </button>
          )}
        </div>

        <form onSubmit={handleSaveSubject} className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase">Código</label>
              <input 
                type="text" required placeholder="EI-I"
                className="w-full mt-1 p-2 border rounded-md"
                value={form.code}
                onChange={e => setForm({...form, code: e.target.value})}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase">Nombre</label>
              <input 
                type="text" required placeholder="ESTADÍSTICA..."
                className="w-full mt-1 p-2 border rounded-md"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
          </div>

          {/* Sub-formulario Secciones */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-sm font-medium mb-2 text-slate-600">Gestión de Secciones</h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input className="p-2 border rounded text-sm" placeholder="Sec (01)" value={tempSection.number} onChange={e => setTempSection({...tempSection, number: e.target.value})} />
              <input className="p-2 border rounded text-sm" placeholder="Días (Lu, Vi)" value={tempSection.days} onChange={e => setTempSection({...tempSection, days: e.target.value})} />
              <input className="p-2 border rounded text-sm" placeholder="Hora (06:30-08:00)" value={tempSection.time} onChange={e => setTempSection({...tempSection, time: e.target.value})} />
              <input className="p-2 border rounded text-sm" placeholder="Aula" value={tempSection.room} onChange={e => setTempSection({...tempSection, room: e.target.value})} />
            </div>
            <button 
              type="button"
              onClick={handleAddSection}
              className="w-full py-1.5 text-sm bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded font-medium transition-colors"
            >
              + Agregar Sección
            </button>
          </div>

          {/* Lista previa de secciones en el form */}
          {form.sections.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              <p className="font-bold text-xs text-slate-400 uppercase">Secciones actuales:</p>
              {form.sections.map(s => (
                <div key={s.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100 group">
                  <div className="text-sm">
                    <span className="font-bold text-slate-700 mr-2">Sec {s.number}</span>
                    <span className="text-slate-500 text-xs">{s.days} • {s.time}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSection(s.id)}
                    className="text-red-400 hover:text-red-600 px-2 font-bold"
                    title="Quitar sección"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <button 
            type="submit" 
            className={`w-full py-3 text-white rounded-lg font-bold shadow-lg transition-all ${
              form.id 
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
            }`}
          >
            {form.id ? 'Guardar Cambios' : 'Registrar Materia'}
          </button>
        </form>
      </div>

      {/* COLUMNA DERECHA: LISTADO */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-700">
          Materias Disponibles ({subjects.length})
        </h2>
        
        {subjects.length === 0 ? (
          <div className="text-center p-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            No hay materias registradas.
          </div>
        ) : (
          <div className="space-y-3 h-[calc(100vh-150px)] overflow-y-auto pr-2 pb-10">
            {subjects.map(sub => (
              <div key={sub.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative">
                
                {/* Botones de acción (flotantes o en header) */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                  <button 
                    onClick={() => handleEditClick(sub)}
                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded transition-colors"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(sub.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>

                <div className="pr-16"> {/* Padding right para no tapar texto con botones */}
                  <h3 className="font-bold text-slate-800 text-sm">{sub.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                      {sub.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      {sub.sections.length} secciones
                    </span>
                  </div>
                </div>
                
                {/* Pequeña vista previa de secciones (opcional) */}
                <div className="mt-3 flex flex-wrap gap-1">
                   {sub.sections.slice(0, 5).map(s => (
                     <span key={s.id} className="text-[10px] border border-slate-100 bg-slate-50 px-1.5 py-0.5 rounded text-slate-400">
                       {s.number}
                     </span>
                   ))}
                   {sub.sections.length > 5 && <span className="text-[10px] text-slate-400">...</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}