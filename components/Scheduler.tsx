
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Calendar, Clock, Plus, Trash2, CheckCircle2, Mail, CalendarPlus, StickyNote, ExternalLink, RefreshCw, GitBranch, Stethoscope, AlertCircle, Bell } from 'lucide-react';

interface Reminder {
  id: string;
  patientName: string;
  type: 'Consulta' | 'Cirugía' | 'Seguimiento' | 'Pruebas';
  date: string;
  time: string;
  notes: string;
  completed: boolean;
  pathology?: string; // Metadata for smart follow-up
}

// Protocol Logic Definitions
const PROTOCOLS: Record<string, { label: string, steps: { offsetMonths: number, type: string, tests: string }[] }> = {
    'CAP_LOW': {
        label: 'Ca. Próstata (Bajo Riesgo / Vigilancia)',
        steps: [
            { offsetMonths: 3, type: 'Seguimiento', tests: 'PSA, Tacto Rectal' },
            { offsetMonths: 6, type: 'Seguimiento', tests: 'PSA' },
            { offsetMonths: 12, type: 'Seguimiento', tests: 'PSA, Tacto Rectal, Considerar Re-Biopsia/RM' }
        ]
    },
    'CAP_POST_RP': {
        label: 'Ca. Próstata (Post-Prostatectomía)',
        steps: [
            { offsetMonths: 3, type: 'Seguimiento', tests: 'PSA Ultrasensible' },
            { offsetMonths: 6, type: 'Seguimiento', tests: 'PSA Ultrasensible' },
            { offsetMonths: 12, type: 'Seguimiento', tests: 'PSA Ultrasensible' }
        ]
    },
    'NMIBC_HIGH': {
        label: 'Ca. Vejiga NMIBC (Alto Riesgo)',
        steps: [
            { offsetMonths: 3, type: 'Pruebas', tests: 'Cistoscopia + Citología' },
            { offsetMonths: 6, type: 'Pruebas', tests: 'Cistoscopia + Citología' },
            { offsetMonths: 9, type: 'Pruebas', tests: 'Cistoscopia + Citología' },
            { offsetMonths: 12, type: 'Pruebas', tests: 'Cistoscopia + Citología + UroTAC (anual)' }
        ]
    },
    'RCC_PT1': {
        label: 'Ca. Renal (pT1 - Nefrectomía)',
        steps: [
            { offsetMonths: 6, type: 'Seguimiento', tests: 'Analítica (Creatinina), Ecografía/TC Abdomen' },
            { offsetMonths: 12, type: 'Seguimiento', tests: 'TC Toraco-Abdominal' },
            { offsetMonths: 24, type: 'Seguimiento', tests: 'TC Toraco-Abdominal' }
        ]
    },
    'LITIASIS': {
        label: 'Litiasis (Post-URS/Lito)',
        steps: [
            { offsetMonths: 1, type: 'Seguimiento', tests: 'RX Abdomen / Ecografía (Comprobar Stone Free)' },
            { offsetMonths: 6, type: 'Consulta', tests: 'Estudio Metabólico (si recurrente)' }
        ]
    }
};

const getLocalToday = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const Scheduler: React.FC = () => {
  // Initialize strictly from Storage Service to ensure persistence
  const [reminders, setReminders] = useState<Reminder[]>(() => {
      const saved = StorageService.getAppointments();
      // Returns saved array (even if empty) to respect user deletions. 
      // Only returns default sample if null (fresh install).
      return saved !== null ? saved : [];
  });

  const [viewMode, setViewMode] = useState<'SIMPLE' | 'SMART'>('SIMPLE');
  const [permission, setPermission] = useState(Notification.permission);

  // Save to StorageService whenever reminders change
  useEffect(() => {
    StorageService.saveAppointments(reminders);
  }, [reminders]);

  // Listen for storage updates (e.g., from Settings Import)
  useEffect(() => {
      const handleStorageUpdate = () => {
          const updated = StorageService.getAppointments();
          if (updated) {
              setReminders(prev => {
                  // Only update if the data actually changed to prevent infinite loops
                  if (JSON.stringify(prev) === JSON.stringify(updated)) {
                      return prev;
                  }
                  return updated;
              });
          }
      };
      window.addEventListener('storage-update', handleStorageUpdate);
      return () => window.removeEventListener('storage-update', handleStorageUpdate);
  }, []);

  // Notification System Logic
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
    }

    const checkReminders = () => {
        const now = new Date();
        const currentDate = getLocalToday();
        const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        reminders.forEach(r => {
            if (!r.completed && r.date === currentDate && r.time === currentTime) {
                if (Notification.permission === 'granted') {
                    new Notification(`UroGenius: ${r.patientName}`, {
                        body: `${r.type} - ${r.notes || 'Sin notas adicionales.'}`,
                        icon: 'https://cdn-icons-png.flaticon.com/512/3209/3209074.png',
                        requireInteraction: true
                    });
                }
            }
        });
    };

    // Check every 60 seconds
    const interval = setInterval(checkReminders, 60000);
    
    return () => clearInterval(interval);
  }, [reminders]);

  const requestNotificationPermission = () => {
      Notification.requestPermission().then(setPermission);
  };

  // Standard Form State
  const [form, setForm] = useState({
    patientName: '',
    type: 'Consulta',
    date: getLocalToday(),
    time: '',
    notes: ''
  });

  // Smart Protocol Form State
  const [smartForm, setSmartForm] = useState({
      patientName: '',
      protocolKey: 'CAP_POST_RP',
      surgeryDate: getLocalToday(),
      baseTime: '09:00'
  });

  const handleAdd = () => {
    if (!form.patientName || !form.date || !form.time) return;
    
    const newReminder: Reminder = {
      id: Date.now().toString(),
      patientName: form.patientName,
      type: form.type as any,
      date: form.date,
      time: form.time,
      notes: form.notes,
      completed: false
    };

    setReminders(prev => [...prev, newReminder].sort((a, b) => {
        return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
    }));

    setForm({
      patientName: '',
      type: 'Consulta',
      date: getLocalToday(),
      time: '',
      notes: ''
    });
  };

  const handleSmartGenerate = () => {
      if (!smartForm.patientName || !smartForm.surgeryDate) return;

      const protocol = PROTOCOLS[smartForm.protocolKey];
      const surgDate = new Date(smartForm.surgeryDate);
      
      const newReminders: Reminder[] = protocol.steps.map((step, index) => {
          const followUpDate = new Date(surgDate);
          followUpDate.setMonth(followUpDate.getMonth() + step.offsetMonths);
          
          // Avoid weekends
          if (followUpDate.getDay() === 0) followUpDate.setDate(followUpDate.getDate() + 1); // Sun -> Mon
          if (followUpDate.getDay() === 6) followUpDate.setDate(followUpDate.getDate() + 2); // Sat -> Mon

          const isPast = followUpDate < new Date();

          return {
              id: Date.now().toString() + index, // unique id
              patientName: smartForm.patientName,
              type: step.type as any,
              date: followUpDate.toISOString().split('T')[0],
              time: smartForm.baseTime,
              notes: `[PROTOCOLO ${protocol.label}] Revisión +${step.offsetMonths} meses. SOLICITAR: ${step.tests}`,
              completed: isPast, // Auto-complete if in past
              pathology: smartForm.protocolKey
          };
      });

      setReminders(prev => [...prev, ...newReminders].sort((a, b) => {
          return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
      }));

      alert(`Se han generado ${newReminders.length} citas de seguimiento automáticas para ${smartForm.patientName}.`);
      setSmartForm({ ...smartForm, patientName: '' });
  };

  const toggleComplete = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  // --- GOOGLE INTEGRATIONS ---
  const addToGoogleCalendar = (r: Reminder) => {
    const startDate = new Date(`${r.date}T${r.time}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const formatGCalTime = (date: Date) => {
        const pad = (n: number) => n < 10 ? '0' + n : n;
        return date.getFullYear().toString() +
               pad(date.getMonth() + 1) +
               pad(date.getDate()) +
               'T' +
               pad(date.getHours()) +
               pad(date.getMinutes()) +
               '00';
    };

    const startDateTime = formatGCalTime(startDate);
    const endDateTime = formatGCalTime(endDate);
    
    const title = encodeURIComponent(`[UroGenius] ${r.type}: ${r.patientName}`);
    const details = encodeURIComponent(
`Paciente: ${r.patientName}
Tipo de Cita: ${r.type}
-------------------
Notas:
${r.notes || 'Sin notas adicionales.'}

Generado por UroGenius AI Suite`
    );
    const location = encodeURIComponent("Consulta Urología");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}&sf=true&output=xml`;
    window.open(url, '_blank');
  };

  const sendViaGmail = (r: Reminder) => {
    const subject = encodeURIComponent(`Recordatorio Cita: ${r.patientName} - ${r.type}`);
    const body = encodeURIComponent(`Estimado/a,\n\nSe le recuerda su cita programada.\n\nPaciente: ${r.patientName}\nFecha: ${r.date}\nHora: ${r.time}\nTipo: ${r.type}\nNotas: ${r.notes}\n\nSaludos,\nDr. Urología`);
    const url = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
    window.open(url, '_blank');
  };

  const saveToGoogleKeep = (r: Reminder) => {
    const textToCopy = `Cita Urología\n${r.patientName} (${r.type})\n${r.date} a las ${r.time}\n${r.notes}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const confirm = window.confirm("Datos copiados al portapapeles.\n\nSe abrirá Google Keep en una nueva pestaña. Simplemente presiona 'Ctrl+V' en una nota nueva.");
        if (confirm) {
            window.open("https://keep.google.com/", '_blank');
        }
    });
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Cirugía': return 'bg-red-100 text-red-900 border-red-200';
      case 'Consulta': return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'Seguimiento': return 'bg-teal-100 text-teal-900 border-teal-200';
      case 'Pruebas': return 'bg-purple-100 text-purple-900 border-purple-200';
      default: return 'bg-slate-100 text-slate-900 border-slate-200';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 animate-slide-up flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-900">Agenda y Recordatorios</h2>
            <p className="text-slate-600">Gestione el seguimiento de pacientes. Alertas persistentes en este navegador.</p>
        </div>
        <div className="flex items-center gap-3">
             {permission !== 'granted' && (
                 <button onClick={requestNotificationPermission} className="bg-amber-100 text-amber-800 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-amber-200 transition-colors">
                     <Bell size={16}/> Activar Alertas
                 </button>
             )}
             <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                <button 
                    onClick={() => setViewMode('SIMPLE')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'SIMPLE' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                >
                    Cita Simple
                </button>
                <button 
                    onClick={() => setViewMode('SMART')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'SMART' ? 'bg-teal-600 shadow text-white' : 'text-slate-500 hover:text-teal-600'}`}
                >
                    <GitBranch size={16} /> Plan Inteligente
                </button>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INPUT FORM (Switches based on Mode) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit animate-slide-up delay-75">
          {viewMode === 'SIMPLE' ? (
            // SIMPLE APPOINTMENT
            <>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-teal-600" />
                    Nueva Cita Individual
                </h3>
                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Paciente</label>
                    <input
                        type="text"
                        value={form.patientName}
                        onChange={e => setForm({...form, patientName: e.target.value})}
                        placeholder="Nombre del paciente"
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-black bg-white text-sm"
                    />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo</label>
                        <select
                        value={form.type}
                        onChange={e => setForm({...form, type: e.target.value})}
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-black bg-white text-sm"
                        >
                        <option>Consulta</option>
                        <option>Seguimiento</option>
                        <option>Cirugía</option>
                        <option>Pruebas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Hora</label>
                        <input
                        type="time"
                        value={form.time}
                        onChange={e => setForm({...form, time: e.target.value})}
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-black bg-white text-sm"
                        />
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha</label>
                    <input
                        type="date"
                        value={form.date}
                        onChange={e => setForm({...form, date: e.target.value})}
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-black bg-white text-sm"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Notas</label>
                    <textarea
                        value={form.notes}
                        onChange={e => setForm({...form, notes: e.target.value})}
                        placeholder="Detalles clínicos breves..."
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-black bg-white text-sm h-20 resize-none"
                    />
                    </div>
                    <button
                    onClick={handleAdd}
                    disabled={!form.patientName || !form.time}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                    Agendar Cita
                    </button>
                </div>
            </>
          ) : (
            // SMART PROTOCOL
            <>
                <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Generar Plan de Seguimiento
                </h3>
                <div className="space-y-4">
                    <div className="bg-teal-50 p-3 rounded-lg border border-teal-100 text-xs text-teal-800 leading-relaxed mb-4">
                        <AlertCircle size={14} className="inline mr-1 mb-0.5"/>
                        Esta herramienta genera automáticamente todas las citas futuras (3, 6, 12 meses...) y las pruebas requeridas basándose en el protocolo seleccionado.
                    </div>

                    <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Paciente</label>
                    <input
                        type="text"
                        value={smartForm.patientName}
                        onChange={e => setSmartForm({...smartForm, patientName: e.target.value})}
                        placeholder="Nombre del paciente"
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-black bg-white text-sm"
                    />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Protocolo Patológico</label>
                        <select
                            value={smartForm.protocolKey}
                            onChange={e => setSmartForm({...smartForm, protocolKey: e.target.value})}
                            className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-black bg-white text-sm"
                        >
                            {Object.entries(PROTOCOLS).map(([key, proto]) => (
                                <option key={key} value={key}>{proto.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha Cirugía/Evento</label>
                        <input
                            type="date"
                            value={smartForm.surgeryDate}
                            onChange={e => setSmartForm({...smartForm, surgeryDate: e.target.value})}
                            className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-black bg-white text-sm"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Hora Citas</label>
                        <input
                            type="time"
                            value={smartForm.baseTime}
                            onChange={e => setSmartForm({...smartForm, baseTime: e.target.value})}
                            className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-black bg-white text-sm"
                        />
                        </div>
                    </div>

                    <button
                    onClick={handleSmartGenerate}
                    disabled={!smartForm.patientName || !smartForm.surgeryDate}
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                    <GitBranch size={16} />
                    Generar Protocolo Completo
                    </button>
                </div>
            </>
          )}
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-4 animate-slide-up delay-150">
          {reminders.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay citas programadas en este dispositivo.</p>
              <p className="text-xs mt-2 text-teal-600 font-medium">¿Usas otro PC? Ve a Configuración {'>'} Sincronizar para importar tus alertas.</p>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div 
                key={reminder.id}
                className={`bg-white p-5 rounded-2xl border transition-all duration-300 group ${
                  reminder.completed ? 'border-slate-100 opacity-60' : 'border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="mt-1">
                        <button 
                            onClick={() => toggleComplete(reminder.id)}
                            className={`rounded-full p-1 transition-colors ${
                                reminder.completed ? 'text-teal-600 bg-teal-50' : 'text-slate-300 hover:text-teal-50'
                            }`}
                        >
                            <CheckCircle2 size={24} className={reminder.completed ? "fill-teal-100" : ""} />
                        </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className={`font-bold text-lg ${reminder.completed ? 'text-slate-500 line-through' : 'text-black'}`}>
                          {reminder.patientName}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${getTypeColor(reminder.type)}`}>
                          {reminder.type}
                        </span>
                        {reminder.pathology && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
                                <GitBranch size={10} /> Auto-Gen
                            </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                         <div className="flex items-center gap-1">
                             <Calendar size={14} />
                             {new Date(reminder.date).toLocaleDateString()}
                         </div>
                         <div className="flex items-center gap-1">
                             <Clock size={14} />
                             {reminder.time}
                         </div>
                      </div>

                      {reminder.notes && (
                        <p className={`text-sm p-2 rounded-lg border inline-block font-medium ${reminder.notes.includes('[PROTOCOLO') ? 'bg-amber-50 text-amber-900 border-amber-100' : 'bg-slate-50 text-black border-slate-100'}`}>
                          {reminder.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1 pl-4 border-l border-slate-100">
                     <button 
                        onClick={() => addToGoogleCalendar(reminder)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all tooltip-trigger group/tooltip relative"
                        title="Añadir a Google Calendar"
                     >
                        <CalendarPlus size={18} />
                     </button>
                     
                     <button 
                        onClick={() => sendViaGmail(reminder)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Enviar por Gmail"
                     >
                        <Mail size={18} />
                     </button>
                     
                     <button 
                        onClick={() => saveToGoogleKeep(reminder)}
                        className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"
                        title="Guardar en Google Keep"
                     >
                        <StickyNote size={18} />
                     </button>

                     <div className="w-px h-6 bg-slate-200 mx-1"></div>

                     <button 
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Eliminar Cita"
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
