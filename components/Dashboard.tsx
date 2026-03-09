

import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { View } from '../types';
import { fetchUrologyNews } from '../services/geminiService';
import { 
  Activity, Calendar as CalendarIcon, TrendingUp, Mic, Search, ArrowUpRight,
  Stethoscope, Calculator, MessageSquare, ChevronRight, Zap,
  Lightbulb, Loader2, Plus, Newspaper, Scale
} from 'lucide-react';

interface DashboardProps {
    setView: (view: View) => void;
}

interface Appointment {
  id: string;
  patientName: string;
  type: string;
  date: string;
  time: string;
  completed: boolean;
}

interface NewsItem {
    title: string;
    time: string;
    tag: string;
    url: string;
}

const URO_PEARLS = [
    "En litiasis renal > 2cm, la NLP es Gold Standard sobre RIRS (EAU 2025).",
    "Enzalutamida en CPHS m1 mejora SG independientemente del volumen.",
    "Microhematuria >50 años exige cistoscopia.",
    "RM Multiparamétrica pre-biopsia reduce sobrediagnóstico.",
    "NMIBC Alto Riesgo: Cistectomía temprana > diferida.",
    "Beta-3 agonistas: seguros cognitivamente en ancianos."
];

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Widget States
  const [pearl, setPearl] = useState(URO_PEARLS[0]);
  
  // News State
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState(false);
  // Quick Note State
  const [quickNote, setQuickNote] = useState('');

  const refreshData = () => {
    try {
        const savedApps = StorageService.getAppointments();
        if (savedApps) {
            const sorted = savedApps.sort((a: any, b: any) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
            setAppointments(sorted.slice(0, 10));
        }
        const savedNote = StorageService.getQuickNote();
        if (savedNote) setQuickNote(savedNote);
    } catch (e) { console.error("Data load fail", e); }
  };

  const loadNews = async () => {
      setLoadingNews(true);
      setNewsError(false);
      try {
          const items = await fetchUrologyNews();
          if (items && items.length > 0) setNews(items);
          else setNewsError(true);
      } catch (e) { setNewsError(true); } 
      finally { setLoadingNews(false); }
  };

  useEffect(() => {
    refreshData();
    loadNews();
    setPearl(URO_PEARLS[Math.floor(Math.random() * URO_PEARLS.length)]);
    const timer = setInterval(() => setDate(new Date()), 1000);
    const newsTimer = setInterval(loadNews, 3600000);
    const handleStorage = () => refreshData();
    window.addEventListener('storage-update', handleStorage);
    return () => { clearInterval(timer); clearInterval(newsTimer); window.removeEventListener('storage-update', handleStorage); };
  }, []);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setQuickNote(val);
      StorageService.saveQuickNote(val);
  };

  // Calendar
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

  return (
    <div className="relative min-h-full p-8 text-slate-100 font-sans bg-slate-950 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             <div className="absolute inset-0 bg-slate-950"></div>
             <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-4 animate-slide-up">
                <div>
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
                        UroGenius <span className="font-light text-teal-400">Pro</span>
                    </h1>
                    <div className="text-slate-400 font-medium mt-2 flex items-center gap-2 text-sm uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                        Centro de Inteligencia Urológica
                    </div>
                </div>
                
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-2xl rounded-full p-2 px-6 flex items-center gap-5 ring-1 ring-white/5">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white font-mono">
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                    <div className="h-8 w-px bg-slate-700/50"></div>
                    <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                         <Activity size={16} />
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
                
                {/* 1. Hero */}
                <div className="md:col-span-4 row-span-2 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl transition-all hover:shadow-teal-900/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/5 animate-slide-up delay-75">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-500/20 transition-all"></div>
                     <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-white/5 backdrop-blur-md w-14 h-14 flex items-center justify-center rounded-2xl border border-white/10">
                                    <Stethoscope className="text-teal-400" size={28} />
                                </div>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                                    <Zap size={10} className="fill-teal-400" /> Gemini 3.0
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold mb-3 tracking-tight text-white">Asistente Clínico</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">Documentación médica y soporte EAU 2025.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button onClick={() => setView(View.CLINICAL_NOTES)} className="col-span-2 bg-white text-slate-950 hover:bg-slate-200 py-3.5 px-6 rounded-2xl font-bold flex items-center justify-between group/btn transition-all shadow-lg">
                                <span>Redactar Informe</span> <ArrowUpRight className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform text-slate-900" size={20} />
                            </button>
                            <button onClick={() => setView(View.LIVE_CONSULT)} className="bg-slate-800/50 hover:bg-slate-700/50 text-white py-3 px-4 rounded-2xl font-semibold flex flex-col items-center justify-center gap-1 border border-white/5 transition-all">
                                <Mic size={18} className="text-teal-400" /> <span className="text-[10px] uppercase tracking-wide">Voz</span>
                            </button>
                            <button onClick={() => setView(View.AI_CENTER)} className="bg-slate-800/50 hover:bg-slate-700/50 text-white py-3 px-4 rounded-2xl font-semibold flex flex-col items-center justify-center gap-1 border border-white/5 transition-all">
                                <MessageSquare size={18} className="text-blue-400" /> <span className="text-[10px] uppercase tracking-wide">Chat</span>
                            </button>
                        </div>
                     </div>
                </div>

                {/* 2. Agenda */}
                <div className="md:col-span-4 row-span-2 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-1 border border-white/5 shadow-2xl animate-slide-up delay-100 flex flex-col relative group hover:border-white/10 transition-colors">
                    <div className="p-5 pb-2 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-white">Agenda Hoy</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Próximos Pacientes</p>
                        </div>
                        <button onClick={() => setView(View.SCHEDULER)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all text-slate-400 border border-white/5"><ChevronRight size={16} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 mt-2 custom-scrollbar">
                        {appointments.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 rounded-2xl m-2 border-2 border-dashed border-slate-700 bg-slate-800/20 p-6">
                                <div className="p-3 bg-slate-800 rounded-full mb-3 shadow-inner"><CalendarIcon size={20} className="text-teal-500" /></div>
                                <p className="text-sm font-bold text-slate-300">Agenda libre</p>
                                <button onClick={() => setView(View.SCHEDULER)} className="mt-3 px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-lg"><Plus size={14} /> Programar</button>
                            </div>
                        ) : (
                            appointments.map((app, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/30 hover:bg-slate-800/60 border border-white/5 transition-all cursor-pointer backdrop-blur-sm">
                                    <div className={`text-center min-w-[3rem] rounded-xl p-1.5 ${app.completed ? 'bg-slate-800 text-slate-600' : 'bg-blue-500/10 text-blue-400'}`}>
                                        <span className="block text-xs font-bold font-mono">{app.time}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-bold text-xs truncate ${app.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{app.patientName}</h4>
                                        <p className="text-[10px] text-slate-500 truncate">{app.type}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. Calendar Widget */}
                <div className="md:col-span-4 row-span-2 bg-slate-950 rounded-[2.5rem] p-6 border border-white/5 shadow-2xl flex flex-col relative overflow-hidden">
                     <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-slate-900 to-transparent opacity-50 pointer-events-none"></div>
                     <div className="flex justify-between items-center mb-4 relative z-10">
                         <h3 className="text-lg font-bold text-white capitalize">{date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
                         <div className="p-2 bg-slate-900 rounded-full border border-white/10"><CalendarIcon size={16} className="text-teal-400"/></div>
                     </div>
                     <div className="grid grid-cols-7 text-center mb-2">{['L','M','X','J','V','S','D'].map(d => <span key={d} className="text-[10px] font-bold text-slate-500">{d}</span>)}</div>
                     <div className="grid grid-cols-7 gap-1 flex-1 text-center relative z-10">
                         {Array.from({ length: adjustedStartDay }).map((_, i) => <div key={`empty-${i}`} />)}
                         {Array.from({ length: daysInMonth }).map((_, i) => {
                             const day = i + 1;
                             const isToday = day === date.getDate();
                             return (
                                 <div key={day} className={`aspect-square flex items-center justify-center text-xs font-medium rounded-full transition-all ${isToday ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-105 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>{day}</div>
                             );
                         })}
                     </div>
                </div>

                {/* 5. UroNews (Expanded) */}
                <div className="md:col-span-7 row-span-1 bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 shadow-lg flex flex-col relative overflow-hidden group">
                     <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400"><Newspaper size={14}/></div>
                            <h3 className="text-sm font-bold text-slate-200">UroNews Live</h3>
                        </div>
                        <button onClick={loadNews} disabled={loadingNews} className="text-slate-500 hover:text-blue-400 transition-colors"><Loader2 size={12} className={loadingNews ? "animate-spin" : ""} /></button>
                     </div>
                     <div className="flex-1 overflow-hidden relative space-y-3">
                         {loadingNews ? <div className="text-center py-8 text-slate-500 text-xs"><Loader2 className="animate-spin text-blue-500 mx-auto mb-2" />Sincronizando...</div> : 
                          newsError ? <div className="text-center py-8 text-red-400 text-xs">Error de carga. <button onClick={loadNews} className="underline">Reintentar</button></div> :
                          news.length === 0 ? <div className="text-center py-8 text-slate-500 text-xs">Sin noticias.</div> :
                          news.map((item, i) => (
                                <a href={item.url} target="_blank" rel="noreferrer" key={i} className="flex items-start gap-3 pb-2 border-b border-white/5 last:border-0 hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase min-w-[3rem] mt-0.5 whitespace-nowrap">{item.time}</span>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-white leading-snug hover:text-blue-300 transition-colors">{item.title}</p>
                                        <span className="text-[9px] text-teal-500 font-medium">{item.tag}</span>
                                    </div>
                                </a>
                          ))
                         }
                     </div>
                </div>

                {/* 6. Pearl (Expanded) */}
                <div className="md:col-span-5 row-span-1 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 shadow-lg relative overflow-hidden flex flex-col justify-between group cursor-pointer hover:scale-[1.02] transition-transform">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                     <div className="relative z-10">
                         <div className="flex justify-between items-start mb-2">
                             <div className="bg-yellow-500/20 p-2 rounded-xl backdrop-blur-sm"><Lightbulb size={20} className="text-yellow-400 fill-yellow-400/50"/></div>
                             <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/20">Tip del Día</span>
                         </div>
                         <p className="text-sm font-bold leading-relaxed mt-2 text-slate-200 drop-shadow-sm">"{pearl}"</p>
                     </div>
                </div>

                {/* 7. Utility Strip */}
                <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4 pb-6">
                    {[
                        { label: 'Centro de IA', icon: Scale, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', view: View.AI_CENTER, desc: 'Buscador & Chat' },
                        { label: 'Calculadoras', icon: Calculator, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', view: View.CALCULATORS, desc: 'Scores Clínicos' },
                        { label: 'Diagnóstico IA', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', view: View.DIAGNOSTICS, desc: 'Visión Artificial' },
                        { label: 'Investigación', icon: Search, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', view: View.RESEARCH, desc: 'Búsqueda Avanzada' },
                    ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <button key={i} onClick={() => setView(item.view)} className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-white/5 shadow-md hover:shadow-2xl hover:bg-slate-800/60 hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 text-left group animate-slide-up relative overflow-hidden">
                                <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} ${item.border} border flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300 backdrop-blur-md`}><Icon size={24} /></div>
                                <div className="relative z-10">
                                    <div className="font-bold text-slate-200 text-lg group-hover:text-white transition-colors">{item.label}</div>
                                    <div className="text-xs text-slate-500 font-medium group-hover:text-slate-400 transition-colors">{item.desc}</div>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Quick Note Widget */}
                 <div className="md:col-span-12 bg-slate-800/30 backdrop-blur rounded-[2rem] p-6 border border-white/5 flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0 p-3 bg-yellow-500/10 rounded-2xl text-yellow-400 border border-yellow-500/20">
                        <ArrowUpRight size={24} />
                    </div>
                    <div className="flex-1 w-full">
                         <h3 className="font-bold text-white mb-2">Bloc de Notas Rápido (Local)</h3>
                         <textarea 
                             value={quickNote}
                             onChange={handleNoteChange}
                             placeholder="Escribe notas temporales aquí (se guardan automáticamente)..."
                             className="w-full bg-slate-900/50 text-slate-200 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-teal-500/50 min-h-[100px]"
                         />
                    </div>
                 </div>

            </div>
        </div>
    </div>
  );
};

export default Dashboard;