import React, { useState, useRef } from 'react';
import { generateVisualContent, editMedicalImage } from '../services/geminiService';
import { Workflow, Loader2, Download, Image as ImageIcon, Layout, AlertTriangle, Wand2, Maximize, Smartphone, Square, Upload, ImagePlus, RefreshCw, PenTool, History, SplitSquareHorizontal, Crop, Check, X, Zap, Palette } from 'lucide-react';
import ReactCrop, { type Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const VisualStudio: React.FC = () => {
    const [mode, setMode] = useState<'CREATE' | 'EDIT'>('CREATE');
    
    // Create Mode States
    const [topic, setTopic] = useState('');
    const [format, setFormat] = useState('Algoritmo de Decisión');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [stylePreset, setStylePreset] = useState('Ninguno');
    
    // Edit Mode States
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [editInstruction, setEditInstruction] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Shared States
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // History State
    const [history, setHistory] = useState<{url: string, prompt: string, mode: string}[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Crop States
    const [crop, setCrop] = useState<CropType>();
    const [isCropping, setIsCropping] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const quickPrompts = [
        { label: "Manejo HPB", topic: "Algoritmo de manejo de Hiperplasia Prostática Benigna según EAU", format: "Algoritmo de Decisión" },
        { label: "Anatomía Próstata", topic: "Anatomía zonal de la próstata (McNeal)", format: "Esquema Anatómico" },
        { label: "Prevención Litiasis", topic: "Medidas dietéticas para prevención de litiasis renal", format: "Infografía" }
    ];

    const styles = [
        { id: 'Ninguno', label: 'Por Defecto' },
        { id: 'Classic Medical Illustration (Netter style)', label: 'Ilustración Clásica' },
        { id: 'Highly detailed 3D render, cinematic lighting', label: 'Render 3D' },
        { id: 'Minimalist flat design, vector art', label: 'Minimalista' },
        { id: 'Whiteboard sketch style, educational', label: 'Pizarra' }
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSourceImage(reader.result as string);
                setResultImage(null);
                setIsCropping(true);
                setCrop(undefined);
            };
            reader.readAsDataURL(file);
        }
    };

    const getCroppedImg = () => {
        const image = imgRef.current;
        if (!image || !crop || crop.width === 0 || crop.height === 0) {
            setIsCropping(false);
            return;
        }
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );
        const base64Image = canvas.toDataURL('image/jpeg');
        setSourceImage(base64Image);
        setIsCropping(false);
    };

    const handleGenerate = async (isRetry = false) => {
        if (mode === 'CREATE' && !topic) return;
        if (mode === 'EDIT' && (!sourceImage || !editInstruction)) return;

        setLoading(true);
        if (!isRetry) setError(null);
        setResultImage(null);

        try {
            let img: string | null = null;

            if (mode === 'CREATE') {
                img = await generateVisualContent(topic, format, aspectRatio, stylePreset);
            } else {
                if (sourceImage) {
                    img = await editMedicalImage(sourceImage, editInstruction);
                }
            }

            if (img) {
                setResultImage(img);
                setHistory(prev => [{ url: img!, prompt: mode === 'CREATE' ? topic : editInstruction, mode }, ...prev]);
            } else {
                throw new Error("La IA no devolvió ninguna imagen.");
            }

        } catch (err: any) {
            console.error("Visual Generation Error:", err);
            setError("Error al procesar la imagen: " + (err.message || "Inténtalo de nuevo."));
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
        <div className="p-6 max-w-6xl mx-auto animate-slide-up relative">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Workflow className="text-teal-600" size={32} />
                        Visual Studio
                    </h2>
                    <p className="text-slate-600">Suite de generación y edición de imagen médica con IA.</p>
                </div>
                
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
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        
                        {mode === 'CREATE' ? (
                            <div className="animate-fade-in space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="block text-sm font-bold text-slate-900">Patología / Tema Clínico</label>
                                    </div>
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {quickPrompts.map(qp => (
                                            <button key={qp.label} onClick={() => { setTopic(qp.topic); setFormat(qp.format); }} className="text-[10px] bg-teal-50 text-teal-700 px-2 py-1 rounded-full border border-teal-200 hover:bg-teal-100 flex items-center gap-1 transition-colors">
                                                <Zap size={10} /> {qp.label}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="Ej. Algoritmo de manejo de Microhematuria según AUA 2025..."
                                        className="w-full h-24 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2"><Palette size={16}/> Estilo Visual</label>
                                    <select value={stylePreset} onChange={e => setStylePreset(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white">
                                        {styles.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                    </select>
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
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                                <button 
                                                    onClick={() => setIsCropping(true)}
                                                    className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-100 w-36 justify-center"
                                                >
                                                    <Crop size={14} /> Recortar
                                                </button>
                                                <button 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-100 w-36 justify-center"
                                                >
                                                    <RefreshCw size={14} /> Cambiar
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
                        Se utiliza Gemini 2.5 Flash Image para generación y edición rápida.
                    </div>
                </div>

                <div className="lg:col-span-2 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center min-h-[500px] relative overflow-hidden shadow-inner group">
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
                        <div className="relative w-full h-full flex flex-col p-4 animate-scale-in z-10">
                            {mode === 'EDIT' && sourceImage ? (
                                <div className="flex flex-col md:flex-row gap-4 w-full h-full items-center justify-center">
                                    <div className="flex-1 flex flex-col items-center justify-center w-full h-full">
                                        <span className="bg-slate-800 text-white text-xs px-3 py-1 rounded-full mb-2 shadow-md flex items-center gap-1"><SplitSquareHorizontal size={12}/> Original</span>
                                        <img src={sourceImage} className="max-w-full max-h-[40vh] md:max-h-[60vh] object-contain rounded-lg shadow-md border border-slate-200 bg-white" />
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center w-full h-full">
                                        <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full mb-2 shadow-md flex items-center gap-1"><Wand2 size={12}/> Editada</span>
                                        <img src={resultImage} className="max-w-full max-h-[40vh] md:max-h-[60vh] object-contain rounded-lg shadow-2xl border-2 border-purple-500 bg-white" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <img src={resultImage} alt="Generated Medical Visual" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-white" />
                                </div>
                            )}
                            
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

            {/* Cropping Modal */}
            {isCropping && sourceImage && (
                <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-3xl flex flex-col items-center shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800"><Crop size={24} className="text-teal-600"/> Recortar Imagen</h3>
                        <div className="max-h-[60vh] overflow-auto border border-slate-200 rounded-lg mb-6 bg-slate-50 w-full flex justify-center p-4">
                            <ReactCrop crop={crop} onChange={c => setCrop(c)}>
                                <img ref={imgRef} src={sourceImage} alt="Crop me" className="max-w-full max-h-[50vh] object-contain" />
                            </ReactCrop>
                        </div>
                        <div className="flex gap-4 w-full justify-end">
                            <button onClick={() => setIsCropping(false)} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancelar</button>
                            <button onClick={getCroppedImg} className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-colors"><Check size={18}/> Aplicar Recorte</button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Gallery Toggle */}
            <button 
                onClick={() => setShowHistory(!showHistory)} 
                className="fixed right-6 bottom-20 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40 flex items-center gap-2"
                title="Historial de Sesión"
            >
                <History size={24} />
                {history.length > 0 && <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">{history.length}</span>}
            </button>

            {/* History Panel */}
            {showHistory && (
                <div className="fixed right-6 bottom-40 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-40 overflow-hidden animate-scale-in origin-bottom-right flex flex-col max-h-[60vh]">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><History size={18} className="text-teal-600"/> Historial de Sesión</h3>
                        <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 shadow-sm"><X size={16}/></button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="text-center py-8">
                                <History className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No hay imágenes generadas aún.</p>
                            </div>
                        ) : (
                            history.map((item, i) => (
                                <div key={i} className="bg-white rounded-xl p-2 border border-slate-200 shadow-sm group relative">
                                    <img src={item.url} className="w-full h-32 object-cover rounded-lg mb-2 border border-slate-100" />
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${item.mode === 'CREATE' ? 'bg-teal-100 text-teal-700' : 'bg-purple-100 text-purple-700'}`}>{item.mode}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 line-clamp-2 font-medium">{item.prompt}</p>
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3 backdrop-blur-sm">
                                        <button onClick={() => { setResultImage(item.url); setMode(item.mode as any); setShowHistory(false); }} className="bg-white p-2.5 rounded-xl hover:bg-teal-50 text-teal-700 shadow-lg hover:scale-110 transition-transform" title="Ver en lienzo"><Maximize size={18}/></button>
                                        <a href={item.url} download={`history-${i}.png`} className="bg-white p-2.5 rounded-xl hover:bg-teal-50 text-teal-700 shadow-lg hover:scale-110 transition-transform" title="Descargar"><Download size={18}/></a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisualStudio;
