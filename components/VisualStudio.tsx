
import React, { useState, useRef } from 'react';
import { generateVisualContent, editMedicalImage } from '../services/geminiService';
import { Workflow, Loader2, Download, Image as ImageIcon, Layout, AlertTriangle, Wand2, Maximize, Smartphone, Square, Upload, ImagePlus, RefreshCw, PenTool } from 'lucide-react';

const VisualStudio: React.FC = () => {
    const [mode, setMode] = useState<'CREATE' | 'EDIT'>('CREATE');
    
    // Create Mode States
    const [topic, setTopic] = useState('');
    const [format, setFormat] = useState('Algoritmo de Decisión');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    
    // Edit Mode States
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [editInstruction, setEditInstruction] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Shared States
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSourceImage(reader.result as string);
                setResultImage(null); // Reset result when new image uploaded
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async (isRetry = false) => {
        if (mode === 'CREATE' && !topic) return;
        if (mode === 'EDIT' && (!sourceImage || !editInstruction)) return;

        setLoading(true);
        if (!isRetry) setError(null);
        setResultImage(null);

        // Pre-emptive check for API Key
        if (!isRetry && (window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                try {
                    if ((window as any).aistudio.openSelectKey) {
                        await (window as any).aistudio.openSelectKey();
                    }
                } catch (e) {
                    setError("Se requiere clave API para generar imágenes.");
                    setLoading(false);
                    return;
                }
            }
        }

        try {
            let img: string | null = null;

            if (mode === 'CREATE') {
                img = await generateVisualContent(topic, format, aspectRatio);
            } else {
                // Edit Mode
                if (sourceImage) {
                    img = await editMedicalImage(sourceImage, editInstruction);
                }
            }

            if (img) {
                setResultImage(img);
            } else {
                throw new Error("La IA no devolvió ninguna imagen.");
            }

        } catch (err: any) {
            console.error("Visual Generation Error:", err);
            
            // Robust error checking for 403 / Permission Denied
            const errorMsg = err.message || err.toString() || JSON.stringify(err);
            const isPermissionError = errorMsg.includes("403") || 
                                      errorMsg.includes("PERMISSION_DENIED") || 
                                      errorMsg.includes("permission");

            if (isPermissionError) {
                if (isRetry) {
                     setError("Permiso denegado. Por favor, selecciona un proyecto de Google Cloud con facturación habilitada.");
                     setLoading(false);
                     return;
                }

                 try {
                     if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
                         await (window as any).aistudio.openSelectKey();
                         await handleGenerate(true);
                         return;
                     } else {
                         setError("Permiso denegado. Se requiere clave API válida.");
                     }
                 } catch (retryErr) {
                     setError("No se pudo seleccionar la clave API. Inténtalo de nuevo.");
                 }
            } else {
                setError("Error al procesar la imagen: " + (err.message || "Inténtalo de nuevo."));
            }
        }
        setLoading(false);
    };

    const aspectRatios = [
        { id: '16:9', label: 'Horizontal (16:9)', icon: Maximize },
        { id: '9:16', label: 'Vertical (9:16)', icon: Smartphone },
        { id: '3:4', label: 'Vertical Pro (3:4)', icon: Smartphone },
        { id: '1:1', label: 'Cuadrado (1:1)', icon: Square },
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto animate-slide-up">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Workflow className="text-teal-600" size={32} />
                        Visual Studio
                    </h2>
                    <p className="text-slate-600">Suite de generación y edición de imagen médica con IA.</p>
                </div>
                
                {/* Mode Switcher */}
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => { setMode('CREATE'); setError(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                            mode === 'CREATE' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Wand2 size={16} /> Crear
                    </button>
                    <button
                        onClick={() => { setMode('EDIT'); setError(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                            mode === 'EDIT' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <PenTool size={16} /> Editar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Control Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        
                        {mode === 'CREATE' ? (
                            /* --- CREATE MODE CONTROLS --- */
                            <div className="animate-fade-in space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Patología / Tema Clínico</label>
                                    <textarea
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="Ej. Algoritmo de manejo de Microhematuria según AUA 2025..."
                                        className="w-full h-32 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Formato Visual</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['Algoritmo de Decisión', 'Infografía', 'Esquema Anatómico', 'Diagrama de Flujo'].map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setFormat(f)}
                                                className={`px-4 py-3 rounded-xl text-sm font-medium border text-left flex items-center gap-2 transition-all ${
                                                    format === f 
                                                    ? 'bg-teal-50 border-teal-500 text-teal-800 ring-1 ring-teal-500/20' 
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {f === 'Algoritmo de Decisión' ? <Workflow size={16}/> : 
                                                 f === 'Infografía' ? <Layout size={16}/> : 
                                                 <ImageIcon size={16}/>}
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Relación de Aspecto</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {aspectRatios.map((ar) => {
                                            const Icon = ar.icon;
                                            return (
                                                <button
                                                    key={ar.id}
                                                    onClick={() => setAspectRatio(ar.id)}
                                                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                                                        aspectRatio === ar.id 
                                                        ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <Icon size={14} />
                                                    {ar.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* --- EDIT MODE CONTROLS --- */
                            <div className="animate-fade-in space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">1. Subir Imagen Base</label>
                                    
                                    {!sourceImage ? (
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all group"
                                        >
                                            <div className="p-3 bg-slate-100 rounded-full group-hover:bg-white mb-3">
                                                <Upload className="text-slate-400 group-hover:text-teal-600" size={24} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-600">Clic para subir imagen</p>
                                            <p className="text-xs text-slate-400">JPG, PNG (Max 5MB)</p>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                                            <img src={sourceImage} alt="Source" className="w-full h-48 object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-100"
                                                >
                                                    <RefreshCw size={14} /> Cambiar Imagen
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleFileUpload} 
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">2. Instrucciones de Edición</label>
                                    <textarea
                                        value={editInstruction}
                                        onChange={(e) => setEditInstruction(e.target.value)}
                                        placeholder="Ej. 'Añade un cálculo renal en el polo inferior', 'Resalta la zona tumoral en rojo', 'Elimina el artefacto quirúrgico'..."
                                        className="w-full h-32 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <button
                                onClick={() => handleGenerate(false)}
                                disabled={loading || (mode === 'CREATE' ? !topic : (!sourceImage || !editInstruction))}
                                className={`w-full text-white py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 ${
                                    mode === 'CREATE' 
                                    ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-900/20' 
                                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/20'
                                }`}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : mode === 'CREATE' ? <Wand2 size={18} /> : <ImagePlus size={18} />}
                                {mode === 'CREATE' ? 'Generar Visual' : 'Aplicar Edición IA'}
                            </button>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-start gap-2 animate-fade-in">
                                    <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800">
                        <strong>Nota Técnica:</strong> 
                        {mode === 'CREATE' 
                            ? " Se utiliza Gemini 3 Pro Image. Soporta 1K de resolución." 
                            : " Se utiliza Gemini 2.5 Flash Image para edición rápida."}
                    </div>
                </div>

                {/* RIGHT COLUMN: Canvas / Result Area */}
                <div className="lg:col-span-2 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center min-h-[500px] relative overflow-hidden shadow-inner group">
                    {/* Grid Pattern Background */}
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

                    {loading ? (
                        <div className="text-center z-10 animate-pulse">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${mode === 'CREATE' ? 'bg-teal-100' : 'bg-purple-100'}`}>
                                <Loader2 className={`w-8 h-8 animate-spin ${mode === 'CREATE' ? 'text-teal-600' : 'text-purple-600'}`} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">{mode === 'CREATE' ? 'Diseñando Estructura...' : 'Editando Píxeles...'}</h3>
                            <p className="text-slate-500 text-sm mt-1">{mode === 'CREATE' ? 'Aplicando guías clínicas al diseño' : 'Aplicando transformación visual'}</p>
                        </div>
                    ) : resultImage ? (
                        <div className="relative w-full h-full flex items-center justify-center p-4 animate-scale-in">
                            <img src={resultImage} alt="Generated Medical Visual" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-white" />
                            
                            {/* Actions Overlay */}
                            <div className="absolute bottom-6 flex gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                <a 
                                    href={resultImage} 
                                    download={`uro-visual-${Date.now()}.png`}
                                    className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold shadow-xl border border-slate-100 flex items-center gap-2 hover:bg-slate-50"
                                >
                                    <Download size={18} /> Descargar PNG
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center opacity-40 z-10">
                            {mode === 'CREATE' ? <Workflow className="w-24 h-24 mx-auto mb-4 text-slate-400" /> : <ImagePlus className="w-24 h-24 mx-auto mb-4 text-slate-400" />}
                            <p className="text-xl font-bold text-slate-500">Lienzo Vacío</p>
                            <p className="text-slate-400 max-w-xs mx-auto mt-2">
                                {mode === 'CREATE' 
                                ? "Configure los parámetros a la izquierda para generar contenido nuevo." 
                                : "Suba una imagen y escriba instrucciones para modificarla."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisualStudio;
