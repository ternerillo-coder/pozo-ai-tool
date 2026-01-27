import React, { useState } from 'react';
import { generateAnatomyImage } from '../services/geminiService';
import { Image, Download, Loader2, AlertTriangle, Sparkles } from 'lucide-react';

const PatientEducation: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (isRetry = false) => {
    if (!prompt) return;
    setError(null);
    setLoading(true);

    // Initial check: if we know we don't have a key, ask for one before trying
    if (!isRetry && (window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
       const hasKey = await (window as any).aistudio.hasSelectedApiKey();
       if (!hasKey) {
         try {
            if ((window as any).aistudio.openSelectKey) {
                await (window as any).aistudio.openSelectKey();
            }
         } catch (e) {
             console.error("Key selection failed", e);
             setError("Falló la selección de la clave API.");
             setLoading(false);
             return;
         }
       }
    }

    try {
        const result = await generateAnatomyImage(prompt, size);
        setGeneratedImage(result);
    } catch (err: any) {
        // Handle 403/Permission Denied specifically
        if (err.toString().includes("403") || err.message?.includes("PERMISSION_DENIED") || err.message?.includes("The caller does not have permission")) {
            
            // If this was already a retry, stop to avoid infinite loops
            if (isRetry) {
                setError("Permiso denegado. Asegúrate de seleccionar un proyecto con facturación habilitada para usar este modelo.");
                setLoading(false);
                return;
            }

            // Trigger key selection
            if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
                 try {
                     await (window as any).aistudio.openSelectKey();
                     // RECURSIVE RETRY after successful selection
                     await handleGenerate(true);
                     return; 
                 } catch (selectErr) {
                     setError("Se requiere una clave API válida para generar imágenes de alta calidad.");
                 }
            } else {
                 setError("Permiso denegado. El modelo requiere una clave API pagada.");
            }
        } else {
            setError("Error al generar la imagen. " + (err.message || "Inténtalo de nuevo."));
        }
        setGeneratedImage(null);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 animate-slide-up">
        <h2 className="text-3xl font-bold text-slate-900">Educación al Paciente y Anatomía</h2>
        <p className="text-slate-600">Cree ilustraciones anatómicas personalizadas para explicar procedimientos a los pacientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 animate-slide-up delay-75">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <label className="block text-sm font-semibold text-slate-900 mb-2">Descripción</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="ej. Una sección transversal clara del riñón mostrando un cálculo coraliforme. Estilo de ilustración médica simple y limpio."
              className="w-full h-32 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none text-sm mb-4 text-slate-900 transition-colors"
            />
            
            <label className="block text-sm font-semibold text-slate-900 mb-2">Calidad</label>
            <div className="flex gap-2 mb-6">
                {['1K', '2K', '4K'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setSize(s as any)}
                        className={`flex-1 py-1 text-sm rounded border transition-all duration-200 ${size === s ? 'bg-teal-50 border-teal-500 text-teal-800 font-medium scale-105' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <button
              onClick={() => handleGenerate(false)}
              disabled={loading || !prompt}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-900/20 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              Generar Ilustración
            </button>
            
            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-200 animate-fade-in">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-xs text-yellow-900 animate-fade-in delay-200">
             <strong>Consejo:</strong> Sé específico sobre la patología. ej., "Hiperplasia Prostática Benigna comprimiendo la uretra".
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 rounded-2xl flex items-center justify-center min-h-[400px] relative overflow-hidden group border border-slate-800 animate-slide-up delay-150 shadow-inner">
            {loading ? (
                <div className="text-center animate-pulse">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Renderizando anatomía de alta resolución...</p>
                    <p className="text-slate-500 text-xs mt-2">Puede tardar unos segundos...</p>
                </div>
            ) : generatedImage ? (
                <div className="relative w-full h-full flex items-center justify-center animate-scale-in">
                    <img src={generatedImage} alt="Generated Anatomy" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none"></div>
                    <a 
                        href={generatedImage} 
                        download="uro-diagram.png"
                        className="absolute bottom-6 right-6 bg-white/95 backdrop-blur text-slate-900 px-6 py-3 rounded-full font-semibold shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-white"
                    >
                        <Download size={18} /> Guardar Imagen
                    </a>
                </div>
            ) : (
                <div className="text-slate-500 flex flex-col items-center opacity-40">
                    <Image size={48} className="mb-2" />
                    <p>Vista Previa de Ilustración</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PatientEducation;