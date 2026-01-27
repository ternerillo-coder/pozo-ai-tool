

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClinicalAssistant from './components/ClinicalAssistant';
import ResearchHub from './components/ResearchHub';
import Calculators from './components/Calculators';
import Diagnostics from './components/Diagnostics';
import TeachingHub from './components/TeachingHub';
import AIChat from './components/AIChat';
import LiveConsultation from './components/LiveConsultation';
import Scheduler from './components/Scheduler';
import Login from './components/Login';
import Settings from './components/Settings';
import VisualStudio from './components/VisualStudio';
import EvidenceAI from './components/EvidenceAI';
import { View } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

  // Check for session on mount
  useEffect(() => {
      const session = sessionStorage.getItem('uro_session');
      if (session) setIsAuthenticated(true);
  }, []);

  const handleLogin = (email: string) => {
      sessionStorage.setItem('uro_session', email);
      setIsAuthenticated(true);
  };

  const handleLogout = () => {
      sessionStorage.removeItem('uro_session');
      setIsAuthenticated(false);
      setCurrentView(View.DASHBOARD);
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard setView={setCurrentView} />;
      case View.SCHEDULER:
        return <Scheduler />;
      case View.EVIDENCE:
        return <EvidenceAI />;
      case View.CLINICAL_NOTES:
        return <ClinicalAssistant />;
      case View.RESEARCH:
        return <ResearchHub />;
      case View.CALCULATORS:
        return <Calculators />;
      case View.DIAGNOSTICS:
        return <Diagnostics />;
      case View.TEACHING:
        return <TeachingHub />;
      case View.VISUAL_STUDIO:
        return <VisualStudio />;
      case View.CHAT:
        return <AIChat />;
      case View.LIVE_CONSULT:
        return <LiveConsultation />;
      case View.SETTINGS:
        return <Settings onLogout={handleLogout} />;
      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 h-screen overflow-y-auto relative">
        {/* Key on the div triggers the animation on route change */}
        <div key={currentView} className="animate-slide-up min-h-full pb-12">
           {renderView()}
        </div>
      </main>
      
      {/* Global Safety Warning / Disclaimer Overlay */}
      <div className="fixed bottom-4 right-6 z-40 animate-fade-in delay-300 pointer-events-none">
         <div className="group relative pointer-events-auto">
             <button className="bg-slate-200 text-slate-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs hover:bg-slate-300 shadow-md transition-transform hover:scale-110">
                 !
             </button>
             <div className="absolute bottom-10 right-0 w-64 bg-white p-4 rounded-xl shadow-xl border border-slate-200 hidden group-hover:block text-xs text-slate-600 animate-scale-in origin-bottom-right">
                 <strong>Aviso Legal:</strong> Esta aplicación es una herramienta asistida por IA con fines educativos y organizativos únicamente. No es un dispositivo médico. Todos los resultados (notas, diagnósticos, cálculos) deben ser verificados por un médico cualificado.
             </div>
         </div>
      </div>
    </div>
  );
};

export default App;