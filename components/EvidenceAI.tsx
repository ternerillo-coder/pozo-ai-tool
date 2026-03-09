
import React, { useState } from 'react';
import { consultEAUFastCheck } from '../services/geminiService';
import { Scale, Search, Lightbulb, Library, Copy, CheckCircle2, Loader2, ArrowRight, History, Trash2, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EvidenceResult {
    pearl: string;
    evidence: string;
    sources: string;
}

interface HistoryItem {
    query: string;
    timestamp: Date;
    result: EvidenceResult;
}

const EvidenceAI: React.FC = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<EvidenceResult | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(false);

    const handleSearch = async (searchQuery: string = query) => {
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        setError(false);
        setResult(null);

        // Update UI to show search is happening for specific query
        if (searchQuery !== query) setQuery(searchQuery);

        const data: any = await consultEAUFastCheck(searchQuery);
        
        if (data) {
            setResult(data);
            // Add to history
            setHistory(prev => [{
                query: searchQuery,
                timestamp: new Date(),
                result: data
            }, ...prev].slice(0, 10)); // Keep last 10
        } else {
            setError(true);
        }
        
        setLoading(false);
    };

    const copyEvidence = () => {
        if (!result) return;
        const text = `PREGUNTA: ${query}\n\nPERLA CLÍNICA:\n${result.pearl}\n\nEVIDENCIA DETALLADA:\n${result.evidence}\n\nFUENTES:\n${result.sources}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearHistory = () => setHistory([]);

    return (
        <div className="flex h-full bg-slate-50 overflow-hidden">
            
            {/* LEFT: History Sidebar */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <History size={18} className="text-slate-400" /> Historial
                    </h3>
                    {history.length > 0 && (
                        <button onClick={clearHistory} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {history.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm italic">
                            Sin búsquedas recientes.
                        </div>
                    ) : (
                        history.map((item, idx) => (
                            <button 
                                key={idx}
                                onClick={() => { setQuery(item.query); setResult(item.result); }}
                                className={`w-full text-left p-3 rounded-xl border transition-all text-xs group ${
                                    result === item.result 
                                    ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' 
                                    : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="font-bold text-slate-800 mb-1 truncate group-hover:text-indigo-700">{item.query}</div>
                                <div className="text-slate-500 flex justify-between">
                                    <span>{item.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400"/>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* MAIN: Search & Results */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar relative">
                
                {/* Header / Search Area */}
                <div className={`transition-all duration-500 ease-out p-6 md:p-12 flex flex-col items-center ${result ? 'min-h-[auto]' : 'min-h-[80vh] justify-center'}`}>
                    
                    <div className={`mb-8 text-center transition-all duration-500 ${result ? 'scale-75 mb-4' : 'scale-100'}`}>
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 transform -rotate-6">
                            <Scale size={32} className="text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Evidence AI</h1>
                        <p className="text-slate-500 mt-2 font-medium">Motor de Búsqueda Clínica & Validación (EAU/AUA/PubMed)</p>
                    </div>

                    <div className="w-full max-w-2xl relative z-10">
                        <div className={`relative group transition-all duration-300 ${loading ? 'opacity-80' : 'opacity-100'}`}>
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2">
                                <Search className="ml-4 text-slate-400" size={24} />
                                <input 
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Ej. Manejo de cáncer próstata hormonosensible metastásico..."
                                    className="w-full p-4 text-lg bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
                                />
                                <button 
                                    onClick={() => handleSearch()}
                                    disabled={loading || !query}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                                </button>
                            </div>
                        </div>
                        
                        {/* Sample Queries (Only when no result) */}
                        {!result && !loading && (
                            <div className="mt-8 flex flex-wrap justify-center gap-2 animate-fade-in">
                                {['Tratamiento cistitis recurrente', 'Vigilancia activa CaP bajo riesgo', 'Litiasis > 2cm tratamiento', 'Inmunoterapia en Ca Renal'].map((q, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleSearch(q)}
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-center text-sm font-medium animate-slide-up">
                                No se encontraron resultados clínicos concluyentes. Intenta reformular la pregunta.
                            </div>
                        )}
                    </div>
                </div>

                {/* RESULTS AREA */}
                {result && (
                    <div className="flex-1 w-full max-w-5xl mx-auto p-6 md:px-12 pb-20 animate-slide-up">
                        
                        {/* 1. THE PEARL */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-8 mb-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10">
                                <h2 className="text-amber-800 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-4">
                                    <Lightbulb size={18} className="fill-amber-600 text-amber-600"/> Perla Clínica
                                </h2>
                                <p className="text-2xl font-bold text-slate-900 leading-relaxed">
                                    {result.pearl}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* 2. THE EVIDENCE */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                                    <h3 className="text-indigo-900 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                        <ShieldCheck size={18} className="text-indigo-600"/> Evidencia & Justificación
                                    </h3>
                                    <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-li:text-slate-700">
                                        <ReactMarkdown>{result.evidence}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {/* 3. SOURCES & ACTIONS */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-slate-900 text-slate-300 rounded-3xl p-6 shadow-lg">
                                    <h3 className="font-bold uppercase tracking-widest text-xs flex items-center gap-2 mb-4 text-slate-400">
                                        <Library size={16}/> Referencias
                                    </h3>
                                    <div className="text-sm space-y-4">
                                        <p className="italic leading-relaxed opacity-90">{result.sources}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={copyEvidence}
                                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                                        copied 
                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-700'
                                    }`}
                                >
                                    {copied ? <CheckCircle2 size={20}/> : <Copy size={20}/>}
                                    {copied ? 'Copiado al Portapapeles' : 'Copiar Resultado'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading Overlay */}
                {loading && !result && (
                    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium animate-pulse">Analizando Guías EAU 2025...</p>
                        <p className="text-xs text-slate-400 mt-2">Cruzando datos con PubMed y AUA</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvidenceAI;
