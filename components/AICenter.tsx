import React, { useState } from 'react';
import EvidenceAI from './EvidenceAI';
import AIChat from './AIChat';
import { Scale, MessageSquareText, Sparkles } from 'lucide-react';

const AICenter: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'evidence' | 'chat'>('evidence');

    return (
        <div className="flex flex-col h-[calc(100vh-3rem)] bg-slate-50 overflow-hidden rounded-2xl m-6 shadow-sm border border-slate-200">
            {/* Header / Tabs */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-xl">
                        <Sparkles className="text-indigo-600 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Centro de Inteligencia</h1>
                        <p className="text-sm text-slate-500 font-medium">Búsqueda de evidencia y asistencia conversacional</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('evidence')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                            activeTab === 'evidence'
                                ? 'bg-white text-indigo-700 shadow-md ring-1 ring-black/5'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        <Scale size={18} />
                        Evidence AI
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                            activeTab === 'chat'
                                ? 'bg-white text-teal-700 shadow-md ring-1 ring-black/5'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        <MessageSquareText size={18} />
                        Chat Urólogo IA
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-slate-50/50">
                <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'evidence' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <EvidenceAI />
                </div>
                <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <AIChat />
                </div>
            </div>
        </div>
    );
};

export default AICenter;
