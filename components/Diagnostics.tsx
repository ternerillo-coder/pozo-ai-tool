import React, { useState, useRef } from 'react';
import { analyzeMedicalImage, editMedicalImage } from '../services/geminiService';
import { Upload, Camera, Zap, Wand2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Diagnostics: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'ANALYZE' | 'EDIT'>('ANALYZE');
  const [editPrompt, setEditPrompt] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    const result = await analyzeMedicalImage(image, "Identifica hallazgos, patología potencial y sugiere siguientes pasos diagnósticos.");
    setAnalysis(result);
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!image || !editPrompt) return;
    setLoading(true);
    const result = await editMedicalImage(image, editPrompt);
    if (result) {
        setImage(result); // Replace current image with edited version
        setAnalysis(`Imagen editada con prompt: "${editPrompt}"`);
    } else {
        setAnalysis("Falló la edición de la imagen.");
    }
    setLoading(false);
    setEditPrompt('');
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Asistente de Diagnóstico por Imagen</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 text-center hover:border-teal-500 transition-colors relative overflow-hidden group">
            {image ? (
              <div className="relative">
                <img src={image} alt="Uploaded" className="max-h-96 mx-auto rounded-lg shadow-md" />
                <button 
                    onClick={() => { setImage(null); setAnalysis(''); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                    <RefreshCw size={16} />
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer py-12">
                <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4 group-hover:text-teal-500 transition-colors" />
                <p className="text-slate-600 font-medium">Clic para subir TC, RM o Foto Clínica</p>
                <p className="text-xs text-slate-500 mt-2">Soporta JPG, PNG</p>
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

          {image && (
             <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex gap-2 mb-4">
                    <button 
                        onClick={() => setMode('ANALYZE')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === 'ANALYZE' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                        Analizar Imagen
                    </button>
                    <button 
                        onClick={() => setMode('EDIT')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === 'EDIT' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                        Editar Imagen
                    </button>
                </div>

                {mode === 'ANALYZE' ? (
                     <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-slate-300 flex items-center justify-center gap-2"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <Zap size={20} />}
                        Iniciar Análisis IA (Gemini Pro)
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            placeholder="ej. 'Resaltar el cálculo renal en rojo'"
                            className="flex-1 border border-slate-300 rounded-lg px-3 text-sm text-slate-900"
                        />
                         <button
                            onClick={handleEdit}
                            disabled={loading || !editPrompt}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-slate-300"
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : <Wand2 size={20} />}
                        </button>
                    </div>
                )}
             </div>
          )}
        </div>

        <div className="bg-slate-950 text-slate-100 p-6 rounded-2xl shadow-xl min-h-[400px]">
          <h3 className="text-xl font-semibold mb-4 text-teal-400 border-b border-slate-800 pb-2">
            {mode === 'ANALYZE' ? 'Informe Diagnóstico IA' : 'Estado de Edición'}
          </h3>
          <div className="prose prose-invert prose-sm max-w-none">
             {loading ? (
                 <div className="flex flex-col items-center justify-center h-64 space-y-4 opacity-70">
                     <div className="w-2 h-2 bg-teal-400 rounded-full animate-ping"></div>
                     <p>Procesando datos visuales...</p>
                 </div>
             ) : analysis ? (
                 <ReactMarkdown>{analysis}</ReactMarkdown>
             ) : (
                 <p className="text-slate-500 italic">Sube una imagen y selecciona una acción para comenzar.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;