
import React, { useState, useRef } from 'react';
import { generateTeachingContent, evaluateClinicalCase } from '../services/geminiService';
import PptxGenJS from 'pptxgenjs';
import { 
  BookOpen, 
  Presentation, 
  FileQuestion, 
  Terminal, 
  Lightbulb, 
  FileText, 
  Loader2, 
  Copy, 
  Check, 
  Microscope,
  Stethoscope,
  Send,
  GraduationCap,
  Projector,
  FileUp,
  X,
  FileCheck,
  Download
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type ToolType = 'ABSTRACT' | 'SESSION' | 'EXAM' | 'PROMPT' | 'TIPS' | 'EVIDENCE' | 'CLINICAL_CASE' | 'PRESENTATION';

const TeachingHub: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('ABSTRACT');
  
  // Standard Tool State
  const [inputContext, setInputContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  
  // Interactive Case State
  const [caseTopic, setCaseTopic] = useState('');
  const [caseDifficulty, setCaseDifficulty] = useState('Residente R1-R2');
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [caseStep, setCaseStep] = useState<'SETUP' | 'SCENARIO' | 'EVALUATION'>('SETUP');

  // Presentation Generator State
  const [presTitle, setPresTitle] = useState('');
  const [presDuration, setPresDuration] = useState('20 min');
  const [presAudience, setPresAudience] = useState('Residentes');
  const [presStyle, setPresStyle] = useState('Científico y Visual');
  const [customVisualPrompt, setCustomVisualPrompt] = useState('');
  const [attachedFile, setAttachedFile] = useState<{data: string, mime: string, name: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [generatingPPT, setGeneratingPPT] = useState(false);
  const [copied, setCopied] = useState(false);

  const tools = [
    { id: 'PRESENTATION', label: 'Presentación (Guion)', icon: Projector, placeholder: 'Generador de Guiones para PPT' },
    { id: 'ABSTRACT', label: 'Creación de Abstracts', icon: FileText, placeholder: 'Introduce los datos brutos del estudio: Introducción, Métodos, Resultados preliminares...' },
    { id: 'SESSION', label: 'Sesiones Clínicas', icon: Presentation, placeholder: 'Tema de la sesión (ej. Manejo actual del Cáncer Renal Metastásico) o detalles del caso clínico a presentar.' },
    { id: 'EXAM', label: 'Cuestionarios / Examen', icon: FileQuestion, placeholder: 'Tema y nivel de dificultad (ej. Litiasis Ureteral para Residentes de 1er año).' },
    { id: 'PROMPT', label: 'Ingeniero de Prompts', icon: Terminal, placeholder: 'Describe qué quieres lograr con una IA médica y generaré el prompt técnico perfecto para ti.' },
    { id: 'TIPS', label: 'Tips & Tricks Quirúrgicos', icon: Lightbulb, placeholder: 'Nombre del procedimiento (ej. Enucleación prostática con láser Holmium).' },
    { id: 'EVIDENCE', label: 'Resumen Evidencia', icon: Microscope, placeholder: 'Pregunta clínica específica (PICO). ej. ¿Es superior la nefrectomía parcial robótica a la laparoscópica en T1b?' },
    { id: 'CLINICAL_CASE', label: 'Reto Clínico (Interactivo)', icon: Stethoscope, placeholder: 'Tema del caso (ej. Hematuria macroscópica)' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFile({
          data: reader.result as string,
          mime: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedContent('');
    
    if (activeTool === 'CLINICAL_CASE') {
        const prompt = `Genera un caso clínico sobre: ${caseTopic}. Nivel de dificultad: ${caseDifficulty}.`;
        const result = await generateTeachingContent(activeTool, prompt);
        setGeneratedContent(result);
        setCaseStep('SCENARIO');
    } else if (activeTool === 'PRESENTATION') {
        const prompt = `
        Genera un guion detallado para una presentación médica.
        
        TÍTULO: "${presTitle}"
        DURACIÓN: ${presDuration}
        AUDIENCIA: ${presAudience}
        ESTILO VISUAL BASE: ${presStyle}
        INSTRUCCIONES VISUALES PERSONALIZADAS: ${customVisualPrompt || 'Seguir estilo base estándar.'}
        ${attachedFile ? `CONTEXTO ADJUNTO: Utiliza el archivo '${attachedFile.name}' como FUENTE PRINCIPAL para extraer la data técnica, tablas y figuras para la presentación.` : ''}
        
        Por favor, estructura la respuesta diapositiva por diapositiva incluyendo sugerencias visuales.
        `;
        const result = await generateTeachingContent(
            activeTool, 
            prompt,
            attachedFile ? { data: attachedFile.data, mimeType: attachedFile.mime } : undefined
        );
        setGeneratedContent(result);
    } else {
        if (!inputContext) return;
        const result = await generateTeachingContent(activeTool, inputContext);
        setGeneratedContent(result);
    }
    
    setLoading(false);
  };

  // --- PPTX GENERATOR LOGIC ---
  const handleDownloadPPTX = async () => {
    if (!generatedContent) return;
    setGeneratingPPT(true);

    try {
        const pres = new PptxGenJS();
        
        // Metadata
        pres.title = presTitle || "Presentación UroGenius";
        pres.subject = "Urología";
        pres.author = "UroGenius AI";

        // Layout (16:9)
        pres.layout = 'LAYOUT_16x9';

        // 1. Parse Content
        // The AI output follows [SLIDE] tags based on system instruction.
        const rawSlides = generatedContent.split(/\[SLIDE\]/i).filter(s => s.trim().length > 10);
        
        if (rawSlides.length === 0) {
            // Fallback if parsing fails: Just one slide with all text
            const slide = pres.addSlide();
            slide.addText("Resumen Generado", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '363636' });
            slide.addText(generatedContent.substring(0, 2000), { x: 0.5, y: 1.5, w: '90%', fontSize: 12, color: '666666' });
        } else {
             // Create slides
            rawSlides.forEach((rawSlideText) => {
                const slide = pres.addSlide();
                
                // Extract Title
                const titleMatch = rawSlideText.match(/\[TITLE\]:(.*?)(?=\[|$)/i);
                const title = titleMatch ? titleMatch[1].trim() : "Diapositiva";
                
                // Extract Content
                const contentMatch = rawSlideText.match(/\[CONTENT\]:([\s\S]*?)(?=\[VISUAL\]|\[NOTES\]|\[DESIGN\]|\[|$)/i);
                let content = contentMatch ? contentMatch[1].trim() : "";
                
                // Clean markdown bullets
                const contentLines = content.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .map(line => line.replace(/^[-*•]\s*/, '')); // Remove existing bullets for PPT bullets

                // Extract Visuals/Design for notes or specialized box
                const visualMatch = rawSlideText.match(/\[VISUAL\]:([\s\S]*?)(?=\[|$)/i);
                const visualText = visualMatch ? visualMatch[1].trim() : "";

                // Extract Notes
                const notesMatch = rawSlideText.match(/\[NOTES\]:([\s\S]*?)(?=\[|$)/i);
                const notes = notesMatch ? notesMatch[1].trim() : "";

                // --- ADD TO SLIDE ---
                
                // 1. Title Bar
                slide.addText(title, { 
                    x: 0.5, y: 0.5, w: '90%', h: 0.8, 
                    fontSize: 28, bold: true, color: '005b96', fontFace: 'Arial' 
                });
                
                // 2. Main Content (Bullets)
                if (contentLines.length > 0) {
                    const textObjects = contentLines.map(line => ({ 
                        text: line, 
                        options: { bullet: true, breakLine: true, indentLevel: 0 } 
                    }));
                    
                    slide.addText(textObjects, { 
                        x: 0.5, y: 1.5, w: '60%', h: '70%', 
                        fontSize: 18, color: '333333', lineSpacing: 32, fontFace: 'Arial'
                    });
                }

                // 3. Visual Suggestion Box (Right side)
                if (visualText) {
                    slide.addText("Sugerencia Visual IA:", {
                        x: 7.0, y: 1.5, w: '25%', h: 0.4,
                        fontSize: 10, bold: true, color: '666666', fill: { color: 'F1F5F9' }
                    });
                    slide.addText(visualText, {
                        x: 7.0, y: 2.0, w: '25%', h: 3.5,
                        fontSize: 11, color: '475569', italic: true, valign: 'top',
                        shape: pres.ShapeType.rect, fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 }
                    });
                }

                // 4. Footer
                slide.addText(`UroGenius AI - ${new Date().toLocaleDateString()}`, {
                    x: 0.5, y: 7.0, w: '90%', fontSize: 10, color: 'AAAAAA'
                });

                // 5. Speaker Notes
                if (notes) {
                    slide.addNotes(notes);
                }
            });
        }

        // Save
        await pres.writeFile({ fileName: `UroGenius-${presTitle.replace(/\s+/g, '_') || 'Presentacion'}.pptx` });

    } catch (e) {
        console.error("PPT Gen Error", e);
        alert("Hubo un error generando el archivo PPTX. Inténtelo de nuevo.");
    } finally {
        setGeneratingPPT(false);
    }
  };

  const handleEvaluate = async () => {
      if (!userAnswer || !generatedContent) return;
      setLoading(true);
      const result = await evaluateClinicalCase(generatedContent, userAnswer);
      setEvaluation(result);
      setCaseStep('EVALUATION');
      setLoading(false);
  };

  const resetCase = () => {
      setCaseStep('SETUP');
      setGeneratedContent('');
      setUserAnswer('');
      setEvaluation('');
      setCaseTopic('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeToolData = tools.find(t => t.id === activeTool);
  const isCaseMode = activeTool === 'CLINICAL_CASE';
  const isPresentationMode = activeTool === 'PRESENTATION';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 animate-slide-up">
        <h2 className="text-3xl font-bold text-slate-900">Docencia & I+D</h2>
        <p className="text-slate-600">Herramientas académicas para producción científica y educación médica continua.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Selection */}
        <div className="lg:col-span-1 space-y-2 animate-slide-up delay-75">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => { 
                    setActiveTool(tool.id as ToolType); 
                    setGeneratedContent(''); 
                    setInputContext('');
                    setAttachedFile(null);
                    setCustomVisualPrompt('');
                    if (tool.id === 'CLINICAL_CASE') resetCase();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  activeTool === tool.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={18} />
                {tool.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
            {isCaseMode ? (
                // INTERACTIVE CLINICAL CASE UI
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[500px] animate-slide-up">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-teal-100 text-teal-700 rounded-lg"><Stethoscope size={24}/></div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Generador de Retos Clínicos</h3>
                            <p className="text-sm text-slate-500">Ponga a prueba a sus residentes con casos generados por IA.</p>
                        </div>
                    </div>

                    {caseStep === 'SETUP' && (
                        <div className="space-y-6 max-w-lg mx-auto py-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Tema del Caso</label>
                                <input 
                                    type="text" 
                                    value={caseTopic}
                                    onChange={(e) => setCaseTopic(e.target.value)}
                                    placeholder="ej. Masa renal incidental, Hematuria, Dolor escrotal agudo..."
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Nivel de Dificultad</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Residente R1-R2', 'Residente R3-R4', 'Adjunto Joven', 'Experto'].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setCaseDifficulty(level)}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                                                caseDifficulty === level ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !caseTopic}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Stethoscope size={18} />}
                                Generar Caso Clínico
                            </button>
                        </div>
                    )}

                    {(caseStep === 'SCENARIO' || caseStep === 'EVALUATION') && (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 prose prose-slate max-w-none">
                                <h4 className="text-teal-800 font-bold flex items-center gap-2 uppercase text-xs tracking-wider mb-2">
                                    <FileText size={14}/> Escenario Clínico
                                </h4>
                                <ReactMarkdown>{generatedContent}</ReactMarkdown>
                            </div>

                            {caseStep === 'SCENARIO' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Tu Resolución (Diagnóstico y Plan)</label>
                                        <textarea 
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            placeholder="Escribe aquí tu diagnóstico diferencial, pruebas a solicitar y manejo inicial..."
                                            className="w-full h-32 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none bg-white text-slate-900"
                                        />
                                    </div>
                                    <button
                                        onClick={handleEvaluate}
                                        disabled={loading || !userAnswer}
                                        className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                        Enviar Respuesta y Evaluar
                                    </button>
                                </div>
                            )}

                            {caseStep === 'EVALUATION' && (
                                <div className="animate-slide-up space-y-4">
                                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                                        <h4 className="text-indigo-800 font-bold flex items-center gap-2 uppercase text-xs tracking-wider mb-4">
                                            <GraduationCap size={16}/> Evaluación Docente
                                        </h4>
                                        <div className="prose prose-indigo max-w-none text-sm">
                                            <ReactMarkdown>{evaluation}</ReactMarkdown>
                                        </div>
                                    </div>
                                    <button
                                        onClick={resetCase}
                                        className="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
                                    >
                                        Generar Nuevo Caso
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : isPresentationMode ? (
                // PRESENTATION GENERATOR UI
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full animate-slide-up delay-100">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Projector size={24}/></div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Diseñador de Presentaciones</h3>
                            <p className="text-sm text-slate-500">Cree guiones estructurados y expórtelos a PowerPoint (.pptx).</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-1">Título de la Ponencia</label>
                                <input 
                                    type="text" 
                                    value={presTitle}
                                    onChange={(e) => setPresTitle(e.target.value)}
                                    placeholder="ej. Manejo del Cáncer de Próstata Resistente a Castración"
                                    className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-1">Duración</label>
                                    <select 
                                        value={presDuration}
                                        onChange={(e) => setPresDuration(e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option>10 min (Flash)</option>
                                        <option>20 min (Estándar)</option>
                                        <option>45 min (Grand Rounds)</option>
                                        <option>60 min (Curso)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-1">Audiencia</label>
                                    <input 
                                        type="text" 
                                        value={presAudience}
                                        onChange={(e) => setPresAudience(e.target.value)}
                                        placeholder="ej. Residentes, Pacientes, Expertos"
                                        className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <label className="block text-sm font-bold text-slate-900 mb-2">Archivo Base (Opcional)</label>
                                {!attachedFile ? (
                                  <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all group"
                                  >
                                    <FileUp className="text-slate-400 group-hover:text-purple-600 mb-2" size={24} />
                                    <p className="text-xs font-bold text-slate-600">Clic para adjuntar PDF o JPG</p>
                                    <p className="text-[10px] text-slate-400">La IA leerá el documento para crear la presentación</p>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <FileCheck className="text-purple-600 flex-shrink-0" size={18} />
                                      <div className="truncate">
                                        <p className="text-xs font-bold text-purple-900 truncate">{attachedFile.name}</p>
                                        <p className="text-[10px] text-purple-600 uppercase">{attachedFile.mime.split('/')[1]}</p>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => setAttachedFile(null)}
                                      className="p-1 hover:bg-white text-purple-400 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                )}
                                <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  className="hidden" 
                                  accept=".pdf,image/jpeg,image/png,image/webp"
                                  onChange={handleFileUpload} 
                                />
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-sm font-bold text-slate-900 mb-2">Estilo Visual Personalizado</label>
                                <div className="space-y-2">
                                    <select 
                                        value={presStyle}
                                        onChange={(e) => setPresStyle(e.target.value)}
                                        className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-purple-500 outline-none"
                                    >
                                        <option>Científico y Riguroso</option>
                                        <option>Visual e Infográfico</option>
                                        <option>Austero y Minimalista</option>
                                        <option>Didáctico para Pacientes</option>
                                    </select>
                                    <textarea
                                        value={customVisualPrompt}
                                        onChange={(e) => setCustomVisualPrompt(e.target.value)}
                                        placeholder="Instrucciones visuales libres (ej. 'Usa fondo oscuro, esquema de colores azul neón, minimalista con iconos grandes...')"
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none resize-none text-xs h-20"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={loading || !presTitle}
                                className="w-full bg-purple-700 text-white py-3 rounded-xl font-bold hover:bg-purple-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Projector size={18} />}
                                Generar Guion de Presentación
                            </button>
                        </div>

                        {/* Result Preview Area for Presentation */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-y-auto max-h-[600px] min-h-[400px]">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-70">
                                    <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                                    <p className="text-slate-500 animate-pulse">Analizando contenido y diseñando diapositivas...</p>
                                    {attachedFile && <p className="text-xs text-purple-600 font-bold">Leyendo archivo adjunto...</p>}
                                </div>
                            ) : generatedContent ? (
                                <div className="prose prose-slate max-w-none prose-sm">
                                    <div className="flex justify-end mb-4 gap-2 sticky top-0 bg-slate-50/95 backdrop-blur py-2 border-b border-slate-200 z-10">
                                        <button 
                                            onClick={() => copyToClipboard(generatedContent)}
                                            className="text-xs text-slate-600 hover:text-purple-800 flex items-center gap-1 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                                        >
                                            {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copiado' : 'Copiar Texto'}
                                        </button>
                                        <button 
                                            onClick={handleDownloadPPTX}
                                            disabled={generatingPPT}
                                            className="text-xs text-white flex items-center gap-1 font-bold bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {generatingPPT ? <Loader2 size={14} className="animate-spin"/> : <Download size={14}/>} 
                                            Descargar PPTX <span className="bg-white/20 px-1 rounded text-[9px] uppercase">Pro</span>
                                        </button>
                                    </div>
                                    <ReactMarkdown>{generatedContent}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 text-center px-4">
                                    <Projector className="w-16 h-16 mb-4" />
                                    <p>Configure los detalles y adjunte documentos para generar su presentación.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // STANDARD TOOL UI
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                    {/* Input */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full animate-slide-up delay-100">
                        <div className="mb-4 flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2">
                            {activeToolData && <activeToolData.icon className="text-teal-600" />}
                            <h3 className="font-bold">{activeToolData?.label}</h3>
                        </div>
                        
                        <textarea
                            value={inputContext}
                            onChange={(e) => setInputContext(e.target.value)}
                            placeholder={activeToolData?.placeholder}
                            className="flex-grow w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none text-slate-900 bg-white placeholder:text-slate-400 min-h-[300px]"
                        />
                        
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !inputContext}
                            className="mt-4 w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <BookOpen size={18} />}
                            Generar Contenido
                        </button>
                    </div>

                    {/* Output */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[400px] relative animate-slide-up delay-150">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Resultado Generado</h3>
                            {generatedContent && (
                                <button 
                                    onClick={() => copyToClipboard(generatedContent)}
                                    className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 ${
                                    copied 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50'
                                    }`}
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'COPIADO' : 'COPIAR'}
                                </button>
                            )}
                        </div>

                        <div className="flex-grow overflow-y-auto prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-800 prose-strong:text-slate-900 prose-li:text-slate-800 text-sm">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-70">
                                    <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                                    <p className="text-slate-500 animate-pulse">Consultando bases de conocimiento médico...</p>
                                </div>
                            ) : generatedContent ? (
                                <div className="animate-scale-in">
                                    <ReactMarkdown>{generatedContent}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                                    {activeToolData && <activeToolData.icon className="w-16 h-16 mb-4" />}
                                    <p>Complete el formulario para generar contenido.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TeachingHub;
