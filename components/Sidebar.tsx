
import React from 'react';
import { View } from '../types';
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  Calculator, 
  Stethoscope, 
  Library, 
  MessageSquareText,
  Activity,
  Mic,
  CalendarClock,
  Settings,
  Workflow,
  Scale
} from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: View.DASHBOARD, label: 'Panel de Control', icon: LayoutDashboard },
    { id: View.SCHEDULER, label: 'Agenda y Recordatorios', icon: CalendarClock },
    { id: View.EVIDENCE, label: 'Evidence AI', icon: Scale },
    { id: View.CLINICAL_NOTES, label: 'Asistente Clínico', icon: FileText },
    { id: View.VISUAL_STUDIO, label: 'Visual Studio', icon: Workflow },
    { id: View.LIVE_CONSULT, label: 'Consultor en Vivo', icon: Mic },
    { id: View.DIAGNOSTICS, label: 'Diagnóstico e Imágenes', icon: Stethoscope },
    { id: View.CALCULATORS, label: 'Calculadoras', icon: Calculator },
    { id: View.RESEARCH, label: 'Investigación', icon: Search },
    { id: View.TEACHING, label: 'Docencia & I+D', icon: Library },
    { id: View.CHAT, label: 'Chat Urólogo IA', icon: MessageSquareText },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col h-screen sticky top-0 shadow-2xl z-50 transition-all border-r border-slate-800/50 backdrop-blur-xl">
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500/10 p-2 rounded-lg border border-teal-500/20">
            <Activity className="text-teal-400 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">UroGenius</h1>
            <p className="text-[10px] text-teal-500 font-bold uppercase tracking-widest">AI Medical Suite</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.5)] font-bold border-y border-r border-teal-400/30 border-l-[4px] border-l-white translate-x-1' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-teal-200 hover:translate-x-1'
                  }`}
                >
                  {/* Icon with Glow */}
                  <Icon 
                    size={20} 
                    className={`transition-all duration-300 relative z-10 ${
                        isActive ? 'scale-110 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'group-hover:scale-110 group-hover:text-teal-400'
                    }`} 
                  />
                  
                  <span className={`text-sm tracking-wide relative z-10 ${isActive ? 'text-white drop-shadow-md' : ''}`}>{item.label}</span>
                  
                  {/* Glossy sheen effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-40 pointer-events-none"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800/50 space-y-2 bg-slate-950/50">
        <button 
            onClick={() => setView(View.SETTINGS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === View.SETTINGS 
                ? 'bg-slate-800 text-white border-l-4 border-l-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
        >
            <Settings size={18} />
            <span className="text-sm font-medium">Configuración</span>
        </button>
        
        <div className="pt-2 pb-1">
            <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-800 to-slate-900 text-teal-400 flex items-center justify-center text-xs border border-teal-700 font-bold shadow-lg">
                        DR
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">Dr. Usuario</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                        En línea
                    </p>
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
