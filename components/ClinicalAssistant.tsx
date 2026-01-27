import React, { useState } from 'react';
import { generateClinicalNote } from '../services/geminiService';
import { FileText, Loader2, Copy, Check, LayoutGrid, AlignLeft, Activity, Stethoscope, Brain, ClipboardList } from 'lucide-react';

const ClinicalAssistant: React.FC = () => {
  const [docType, setDocType] = useState('Nota SOAP (Seguimiento)');
  
  // State for free text input (General)
  const [patientData, setPatientData] = useState('');
  
  // State for structured SOAP input
  const [soapData, setSoapData] = useState({
    s: '',
    o: '',
    a: '',
    p: ''
  });

  const [loading, setLoading] = useState(false);
  const [generatedNote, setGeneratedNote] = useState('');
  const [copied, setCopied] = useState(false);

  const isSoapMode = docType === 'Nota SOAP (Seguimiento)';

  const handleGenerate = async () => {
    // Validation
    if (isSoapMode) {
        if (!soapData.s && !soapData.o && !soapData.a && !soapData.p) return;
    } else {
        if (!patientData) return;
    }

    setLoading(true);
    setGeneratedNote('');
    
    let finalPromptData = '';

    if (isSoapMode) {
        finalPromptData = `
        DATOS ESTRUCTURADOS DEL PACIENTE:
        - SUBJETIVO (S): ${soapData.s || 'No reportado'}
        - OBJETIVO (O): ${soapData.o || 'No reportado'}
        - ANÁLISIS (A): ${soapData.a || 'Pendiente'}
        - PLAN (P): ${soapData.p || 'Pendiente'}
        `;
    } else {
        finalPromptData = patientData;
    }

    const prompt = `Genera un documento tipo "${docType}" para el siguiente caso clínico.
    
    ESTILO REQUERIDO: MAMBRINO XXI (SESCAM) > v8.0
    INSTRUCCIONES DE FORMATO (ESTRICTAS):
    1. SALIDA EN TEXTO PLANO (PLAIN TEXT).
    2. PROHIBIDO USAR MARKDOWN: No uses negritas (**), no uses cursivas (*), no uses bullets/viñetas de markdown (-).
    3. PROHIBIDO USAR CORCHETES [] O SÍMBOLOS ESPECIALES.
    4. Usa MAYÚSCULAS para los encabezados de sección estándar (ej. MOTIVO DE CONSULTA:, ANTECEDENTES:, JUICIO CLÍNICO:, PLAN:).
    5. Separa las secciones con saltos de línea claros.
    6. Usa terminología médica urológica precisa en español.
    7. Formato listo para copiar y pegar en un cuadro de texto plano de historia clínica electrónica antigua.
    
    DATOS CLÍNICOS:
    ${finalPromptData}`;

    const result = await generateClinicalNote(prompt, docType.includes('Protocolo') || docType.includes('Complejo'));
    setGeneratedNote(result);
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearFields = () => {
      setSoapData({ s: '', o: '', a: '', p: '' });
      setPatientData('');
      setGeneratedNote('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 animate-slide-up">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Asistente de Documentación Clínica</h2>
        <p className="text-slate-600">Genere notas de evolución, altas y protocolos compatibles con Mambrino XXI (Texto Plano).</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full animate-slide-up delay-75 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-900 mb-2">Tipo de Documento</label>
            <div className="relative">
                <select 
                value={docType} 
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-3 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white text-slate-900 transition-all font-medium appearance-none"
                >
                <option>Nota SOAP (Seguimiento)</option>
                <option>Nota de Ingreso</option>
                <option>Informe de Alta</option>
                <option>Protocolo Quirúrgico</option>
                <option>Carta de Derivación</option>
                </select>
                <FileText className="absolute left-3 top-3.5 text-slate-500 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <div className="flex-grow mb-6">
            {isSoapMode ? (
                <div className="grid grid-cols-1 gap-4 animate-fade-in">
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase">
                            <AlignLeft size={14} /> Subjetivo (S)
                        </label>
                        <textarea
                            value={soapData.s}
                            onChange={(e) => setSoapData({...soapData, s: e.target.value})}
                            placeholder="Síntomas del paciente, dolor, evolución subjetiva..."
                            className="w-full p-3 border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none h-24 text-sm bg-white text-black resize-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase">
                            <Activity size={14} /> Objetivo (O)
                        </label>
                        <textarea
                            value={soapData.o}
                            onChange={(e) => setSoapData({...soapData, o: e.target.value})}
                            placeholder="Signos vitales, examen físico, abdomen, genitales, diuresis..."
                            className="w-full p-3 border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none h-24 text-sm bg-white text-black resize-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase">
                            <Brain size={14} /> Análisis (A)
                        </label>
                        <textarea
                            value={soapData.a}
                            onChange={(e) => setSoapData({...soapData, a: e.target.value})}
                            placeholder="Impresión diagnóstica, evolución favorable/desfavorable..."
                            className="w-full p-3 border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none h-24 text-sm bg-white text-black resize-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase">
                            <ClipboardList size={14} /> Plan (P)
                        </label>
                        <textarea
                            value={soapData.p}
                            onChange={(e) => setSoapData({...soapData, p: e.target.value})}
                            placeholder="Ajuste antibióticos, pruebas solicitadas, alta, dieta..."
                            className="w-full p-3 border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none h-24 text-sm bg-white text-black resize-none"
                        />
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col animate-fade-in">
                    <label className="block text-sm font-bold text-slate-900 mb-2">Contexto Clínico y Datos</label>
                    <textarea
                    value={patientData}
                    onChange={(e) => setPatientData(e.target.value)}
                    placeholder="Escriba aquí los datos del paciente en formato libre..."
                    className="w-full flex-grow p-4 border border-slate-300 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none font-mono text-sm bg-white text-black resize-none min-h-[300px]"
                    />
                </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
                onClick={clearFields}
                className="px-4 py-3 rounded-xl font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-all"
            >
                Limpiar
            </button>
            <button
                onClick={handleGenerate}
                disabled={loading || (isSoapMode ? (!soapData.s && !soapData.o && !soapData.a && !soapData.p) : !patientData)}
                className={`flex-grow py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white transition-all duration-300 ${
                loading || (isSoapMode ? (!soapData.s && !soapData.o && !soapData.a && !soapData.p) : !patientData)
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-teal-600 hover:bg-teal-700 shadow-lg hover:shadow-teal-900/20 active:scale-[0.98]'
                }`}
            >
                {loading ? <Loader2 className="animate-spin" /> : <Stethoscope />}
                {loading ? 'Redactando (Estilo Mambrino)...' : 'Generar Nota Clínica'}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[600px] relative animate-slide-up delay-150">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="text-teal-600" size={20} />
                Nota Generada (Texto Plano)
            </h3>
            {generatedNote && (
              <button 
                onClick={copyToClipboard}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-300 border ${
                  copied 
                  ? 'bg-green-100 text-green-700 border-green-200 scale-105' 
                  : 'text-slate-600 border-slate-200 hover:text-teal-700 hover:border-teal-200 hover:bg-teal-50'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado al Portapapeles' : 'Copiar Texto'}
              </button>
            )}
          </div>
          
          <div className="flex-grow overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity size={16} className="text-teal-500" />
                    </div>
                </div>
                <p className="animate-pulse font-medium">Procesando terminología médica...</p>
              </div>
            ) : generatedNote ? (
              <div className="animate-scale-in origin-top bg-slate-50 p-6 rounded-xl border border-slate-100 h-full">
                {/* Render as PRE-WRAP plain text to simulate simple EHR text field */}
                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-900">
                    {generatedNote}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                <LayoutGrid className="w-16 h-16 mb-4 text-slate-300" />
                <p className="text-lg font-medium">Esperando datos clínicos</p>
                <p className="text-sm">Complete los campos para generar la nota compatible con Mambrino.</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
            <span>IA Generativa v2.5 Flash</span>
            <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-100">Requiere validación médica</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalAssistant;