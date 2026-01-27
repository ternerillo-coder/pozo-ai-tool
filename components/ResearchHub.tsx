import React, { useState, useRef, useEffect } from 'react';
import { researchRecentPapers, searchPubMed, searchEAUGuidelines, generateResearchMap, chatWithPapers } from '../services/geminiService';
import { Search, ExternalLink, BookOpen, Loader2, Sparkles, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Filter, Wand2, Youtube, Zap, Globe, FileText, MonitorPlay, Brain, Stethoscope, Workflow, Network, Share2, Download, MessageSquareText, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ResearchTool } from '../types';

const aiTools: ResearchTool[] = [
  // 1. Búsqueda y Gestión (Search/Analysis)
  { 
    name: 'Perplexity AI', 
    description: 'Buscador científico conversacional con citas en tiempo real.', 
    url: 'https://www.perplexity.ai', 
    category: 'Search', 
    isFree: true, 
    pros: ['Modo Académico (Papers)', 'Citas verificables', 'Velocidad superior a Google'], 
    cons: ['Alguna alucinación posible', 'Límite de búsquedas Pro gratis'], 
    useCases: ['Revisión rápida de literatura', 'Respuesta a dudas clínicas puntuales'], 
    tutorialUrl: 'https://youtube.com' 
  },
  { 
    name: 'Consensus', 
    description: 'Buscador de consenso científico (Sí/No/Posible).', 
    url: 'https://consensus.app', 
    category: 'Search', 
    isFree: true, 
    pros: ['% de Consenso visual', 'Filtro por diseño de estudio', 'Sintetiza conclusiones'], 
    cons: ['Funciones Deep Search son de pago', 'Base de datos limitada a veces'], 
    useCases: ['¿Es eficaz la fitoterapia en HBP?', 'Dudas terapéuticas controvertidas'], 
    tutorialUrl: '#' 
  },
  { 
    name: 'Elicit', 
    description: 'Analista de investigación para revisiones sistemáticas.', 
    url: 'https://elicit.com', 
    category: 'Research', 
    isFree: true, 
    pros: ['Tabla de comparación PICO', 'Extracción masiva de datos', 'Matriz de evidencia'], 
    cons: ['Créditos limitados en free tier', 'Curva de aprendizaje'], 
    useCases: ['Meta-análisis preliminares', 'Comparar papers de un tema'], 
    tutorialUrl: '#' 
  },
  { 
    name: 'ResearchRabbit', 
    description: 'Spotify de la investigación: mapas de conexiones.', 
    url: 'https://researchrabbitapp.com', 
    category: 'Analysis', 
    isFree: true, 
    pros: ['Visualización de redes de citas', 'Descubrimiento serendipitoso', 'Alertas'], 
    cons: ['Interfaz densa', 'Requiere Zotero para máximo potencial'], 
    useCases: ['Rastrear origen de una técnica', 'Ver quién cita a quién'], 
    tutorialUrl: '#' 
  },
  { 
    name: 'Scite.ai', 
    description: 'Smart Citations: ¿La cita apoya o contradice?', 
    url: 'https://scite.ai', 
    category: 'Analysis', 
    isFree: false, 
    pros: ['Detecta papers retractados', 'Clasifica citas (Apoya/Contrasta)'], 
    cons: ['De pago', 'Análisis de texto completo limitado a veces'], 
    useCases: ['Validar solidez de una afirmación', 'Evitar citar estudios refutados'], 
    tutorialUrl: '#' 
  },
  
  // 2. Documentación Clínica (Scribes)
  { 
    name: 'Nuance DAX Copilot', 
    description: 'Líder en documentación ambiental (Microsoft).', 
    url: 'https://www.nuance.com/healthcare.html', 
    category: 'Clinical', 
    isFree: false, 
    pros: ['Integración total (Epic/Cerner)', 'Reduce burnout documentado', 'Calidad médica'], 
    cons: ['Coste elevado (Institucional)', 'Implementación compleja'], 
    useCases: ['Consulta ambulatoria automática', 'Notas de evolución'], 
    tutorialUrl: '#' 
  },
  { 
    name: 'Suki AI', 
    description: 'Asistente de voz flexible para notas y órdenes.', 
    url: 'https://suki.ai', 
    category: 'Clinical', 
    isFree: false, 
    pros: ['Órdenes de voz (Labs/Rx)', 'Compatible con móviles', 'Rápida implementación'], 
    cons: ['Pago por licencia', 'Requiere hablar claro'], 
    useCases: ['Dictado de notas operatorias', 'Peticiones en planta'], 
    tutorialUrl: '#' 
  },

  // 3. Creación de Contenido (Creation)
  { 
    name: 'Gamma', 
    description: 'Generador de presentaciones médicas en segundos.', 
    url: 'https://gamma.app', 
    category: 'Creation', 
    isFree: true, 
    pros: ['Genera estructura y diseño', 'Importa desde texto/Word', 'Estética moderna'], 
    cons: ['Exportar a PPT editable limitado', 'Imágenes genéricas a veces'], 
    useCases: ['Sesiones clínicas urgentes', 'Clases a alumnos'], 
    tutorialUrl: '#' 
  },
  { 
    name: 'BioRender', 
    description: 'Estándar para ilustraciones científicas.', 
    url: 'https://biorender.com', 
    category: 'Creation', 
    isFree: false, 
    pros: ['Iconografía urológica exacta', 'Calidad de publicación', 'Fácil uso'], 
    cons: ['Marca de agua en gratis', 'Suscripción cara'], 
    useCases: ['Figuras para papers', 'Posters congresos'], 
    tutorialUrl: '#' 
  },
  { 
    name: 'Midjourney', 
    description: 'Generador de imágenes artísticas/realistas.', 
    url: 'https://midjourney.com', 
    category: 'Creation', 
    isFree: false, 
    pros: ['Calidad visual insuperable', 'Creatividad ilimitada'], 
    cons: ['Uso vía Discord (complejo)', 'No anatómicamente perfecto siempre'], 
    useCases: ['Portadas de presentaciones', 'Material divulgativo abstracto'], 
    tutorialUrl: '#' 
  },

  // 4. Video y Avatares
  { 
    name: 'HeyGen', 
    description: 'Avatares parlantes realistas multilingües.', 
    url: 'https://heygen.com', 
    category: 'Video', 
    isFree: false, 
    pros: ['Traducción de video (Lip-sync)', 'Clonación de voz', 'Fácil de usar'], 
    cons: ['Créditos caros', 'Puede verse "uncanny valley"'], 
    useCases: ['Consentimiento informado en video', 'Videos post-op personalizados'], 
    tutorialUrl: '#' 
  },

  // 5. Educación Personalizada
  { 
    name: 'NotebookLM', 
    description: 'Tu experto personal sobre TUS documentos (Google).', 
    url: 'https://notebooklm.google.com', 
    category: 'Education', 
    isFree: true, 
    pros: ['Genera Podcasts de audio', 'Sin alucinaciones (Grounding)', 'Citas directas'], 
    cons: ['Experimental', 'Solo admite texto/PDF por ahora'], 
    useCases: ['Estudiar Guías EAU (Podcast)', 'Resumir historias clínicas complejas'], 
    tutorialUrl: '#' 
  },

  // 6. Imagen y Diagnóstico
  { 
    name: 'Aidoc', 
    description: 'IA para radiología y priorización de urgencias.', 
    url: 'https://www.aidoc.com', 
    category: 'Clinical', 
    isFree: false, 
    pros: ['Alertas tiempo real (TEP, Litiasis)', 'Integración PACS'], 
    cons: ['Solución hospitalaria'], 
    useCases: ['Detección incidentalomas', 'Priorización lista trabajo'], 
    tutorialUrl: '#' 
  },

  // 7. Automatización
  { 
    name: 'Zapier', 
    description: 'Conecta tus apps sin código.', 
    url: 'https://zapier.com', 
    category: 'Automation', 
    isFree: true, 
    pros: ['6000+ Integraciones', 'Fácil (If This Then That)'], 
    cons: ['Pasos limitados en gratis', 'Complejo para lógica avanzada'], 
    useCases: ['Guardar attachment de email en Drive', 'Alertas de nuevos papers'], 
    tutorialUrl: '#' 
  },
  { 
    name: 'n8n', 
    description: 'Automatización de flujos de trabajo avanzada.', 
    url: 'https://n8n.io', 
    category: 'Automation', 
    isFree: true, 
    pros: ['Self-hosted gratis', 'Privacidad datos (HIPAA friendly)', 'Potente'], 
    cons: ['Requiere conocimientos técnicos'], 
    useCases: ['Gestión de citas compleja', 'Pipelines de datos de investigación'], 
    tutorialUrl: '#' 
  },
  
  // Others mentioned
  { name: 'PubMed.ai', description: 'Búsqueda semántica en PubMed.', url: 'https://pubmed.ai', category: 'Search', isFree: true, pros: ['Directo al grano'], cons: ['Menos filtros'], useCases: ['Búsqueda rápida'], tutorialUrl: '#' },
  { name: 'Undermind', description: 'Búsqueda profunda autónoma.', url: 'https://undermind.ai', category: 'Search', isFree: false, pros: ['Exhaustivo'], cons: ['Lento (Deep search)'], useCases: ['Estado del arte'], tutorialUrl: '#' },
  { name: 'Litmaps', description: 'Visualización de literatura dinámica.', url: 'https://litmaps.com', category: 'Analysis', isFree: true, pros: ['Descubre seminal papers'], cons: ['Interfaz'], useCases: ['Biblio Tesis'], tutorialUrl: '#' },
  { name: 'ChatPDF', description: 'Chatea con cualquier PDF.', url: 'https://chatpdf.com', category: 'Analysis', isFree: true, pros: ['Rápido', 'Fácil'], cons: ['Límite páginas'], useCases: ['Leer paper rápido'], tutorialUrl: '#' },
  { name: 'Napkin AI', description: 'Texto a gráficos simples.', url: 'https://napkin.ai', category: 'Creation', isFree: true, pros: ['Diagramas rápidos'], cons: ['Estilo simple'], useCases: ['Esquemas ppt'], tutorialUrl: '#' },
  { name: 'Open Evidence', description: 'Respuestas médicas validadas.', url: 'https://openevidence.com', category: 'Search', isFree: true, pros: ['Clínico', 'Fuentes'], cons: ['USA centrado'], useCases: ['Dosis', 'Protocolos'], tutorialUrl: '#' },
];

interface PubMedCard { title: string; authors: string; journal: string; summary: string; url: string; }

const ResearchHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'latest' | 'pubmed' | 'tools' | 'eau'>('tools');
  const [toolCategory, setToolCategory] = useState<string>('All');
  
  // Reuse existing states...
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  
  // PubMed States
  const [pubMedQuery, setPubMedQuery] = useState('');
  const [pubMedResults, setPubMedResults] = useState<PubMedCard[]>([]);
  const [pubMedLoading, setPubMedLoading] = useState(false);
  // Knowledge Graph State
  const [knowledgeMap, setKnowledgeMap] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const [mapError, setMapError] = useState('');

  // Chat with Papers State
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [eauQuery, setEauQuery] = useState('');
  const [eauResult, setEauResult] = useState('');
  const [eauSources, setEauSources] = useState<any[]>([]);
  const [eauLoading, setEauLoading] = useState(false);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  useEffect(() => {
      chatBottomRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [chatMessages]);

  const fetchResearch = async () => {
    setLoading(true);
    const { text, sources } = await researchRecentPapers();
    setSummary(text);
    setLoading(false);
  };

  const handlePubMedSearch = async () => {
    if (!pubMedQuery) return;
    setPubMedLoading(true);
    setPubMedResults([]);
    setKnowledgeMap(null); 
    setMapError('');
    setChatMessages([]); // Reset chat

    const rawResult = await searchPubMed(pubMedQuery);
    const cards: PubMedCard[] = [];
    const blocks = rawResult.split('|||');
    blocks.forEach(block => {
        const title = block.match(/TITULO:\s*(.*)/)?.[1]?.trim();
        if (title) {
            cards.push({
                title,
                authors: block.match(/AUTORES:\s*(.*)/)?.[1]?.trim() || '',
                journal: block.match(/REVISTA:\s*(.*)/)?.[1]?.trim() || '',
                summary: block.match(/RESUMEN:\s*(.*)/)?.[1]?.trim() || '',
                url: block.match(/URL:\s*(.*)/)?.[1]?.trim() || `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(pubMedQuery)}`
            });
        }
    });
    setPubMedResults(cards);
    setPubMedLoading(false);
  };

  const handleResearchChat = async (input: string = chatInput) => {
      if (!input.trim() || pubMedResults.length === 0) return;
      
      const newMsg = { role: 'user', content: input };
      setChatMessages(prev => [...prev, newMsg]);
      setChatInput('');
      setChatLoading(true);

      // Build context from results
      const context = pubMedResults.map(p => `TÍTULO: ${p.title}\nAUTORES: ${p.authors}\nRESUMEN: ${p.summary}`).join('\n\n---\n\n');
      
      const response = await chatWithPapers(context, input, chatMessages.map(m => ({role: m.role, parts: [{text: m.content}]})));
      
      setChatMessages(prev => [...prev, { role: 'model', content: response }]);
      setChatLoading(false);
  };

  const handleQuickAnalysis = (type: 'TREND' | 'HYPE' | 'PARALLEL') => {
      let prompt = "";
      switch(type) {
          case 'TREND': prompt = "Analiza la tendencia de investigación basada en estos 10-15 artículos. ¿Hacia dónde va el campo? ¿Cuál es el consenso actual?"; break;
          case 'HYPE': prompt = "Analiza críticamente si hay 'Hype' en estos artículos. ¿Son sólidos los RCTs y Meta-análisis listados? Identifica sesgos potenciales."; break;
          case 'PARALLEL': prompt = "Identifica vías de investigación paralelas o controversias que surjan al comparar estos estudios. ¿Hay resultados contradictorios?"; break;
      }
      handleResearchChat(prompt);
  }

  const handleGenerateMap = async () => {
      if (!pubMedQuery) return;
      setLoadingMap(true);
      setMapError('');
      
      try {
          if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
             const hasKey = await (window as any).aistudio.hasSelectedApiKey();
             if (!hasKey && (window as any).aistudio.openSelectKey) {
                 await (window as any).aistudio.openSelectKey();
             }
          }

          const img = await generateResearchMap(pubMedQuery);
          if (img) setKnowledgeMap(img);
          else setMapError("No se pudo generar el mapa visual.");
      } catch (e: any) {
          if (e.toString().includes("403")) {
              setMapError("Error de permisos. El mapa requiere Gemini Pro (Key de proyecto pago).");
              if ((window as any).aistudio?.openSelectKey) await (window as any).aistudio.openSelectKey();
          } else {
              setMapError("Error generando el mapa.");
          }
      }
      setLoadingMap(false);
  };

  const handleEAUSearch = async (overrideQuery?: string) => {
      const q = overrideQuery || eauQuery;
      if(!q) return;
      
      if (overrideQuery) setEauQuery(overrideQuery);

      setEauLoading(true);
      const { text, sources } = await searchEAUGuidelines(q);
      setEauResult(text);
      setEauSources(sources);
      setEauLoading(false);
  }

  const categories = ['All', 'Search', 'Analysis', 'Clinical', 'Creation', 'Video', 'Education', 'Automation', 'Research'];

  const filteredTools = toolCategory === 'All' ? aiTools : aiTools.filter(t => t.category === toolCategory);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-slide-up">
        <div>
            <h2 className="text-3xl font-bold text-slate-900">Centro de Investigación</h2>
            <p className="text-slate-600">Ecosistema de herramientas IA y evidencia científica.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-xl overflow-x-auto">
            <button onClick={() => setActiveTab('tools')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'tools' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'}`}>Herramientas IA</button>
            <button onClick={() => setActiveTab('eau')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'eau' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'}`}>Guías EAU 2025</button>
            <button onClick={() => setActiveTab('pubmed')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'pubmed' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'}`}>PubMed & Analysis</button>
            <button onClick={() => setActiveTab('latest')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'latest' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'}`}>Últimos Papers</button>
        </div>
      </div>

      {activeTab === 'tools' && (
        <div className="animate-slide-up space-y-8">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10"><Zap className="text-yellow-400 fill-yellow-400" /> Hacks de Productividad & Workflows</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                        <h4 className="font-bold text-teal-300 text-sm mb-2 flex items-center gap-2"><Search size={14}/> Sesión Clínica Flash</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Perplexity (Búsqueda) → Elicit (Comparar Papers) → NotebookLM (Resumen Audio) → Gamma (PPT Final).
                            <br/><span className="text-yellow-400 font-bold">Tiempo: 45 min.</span>
                        </p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                        <h4 className="font-bold text-teal-300 text-sm mb-2 flex items-center gap-2"><Workflow size={14}/> Automatización Cadena</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            n8n detecta "Cáncer" en AP → Busca Guía EAU → Genera borrador informe paciente (GPT) → Crea video explicativo (HeyGen).
                        </p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                        <h4 className="font-bold text-teal-300 text-sm mb-2 flex items-center gap-2"><MonitorPlay size={14}/> Efecto WOW</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Usa Avatar Digital (HeyGen) en congresos para presentar en 3 idiomas simultáneos.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex overflow-x-auto pb-2 gap-2">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setToolCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                            toolCategory === cat 
                            ? 'bg-slate-800 text-white border-slate-800' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool) => {
                    const isExpanded = expandedTool === tool.name;
                    return (
                        <div key={tool.name} className={`bg-white rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-teal-500 shadow-lg ring-1 ring-teal-500/20 col-span-1 md:col-span-2 lg:col-span-3' : 'border-slate-200 hover:border-teal-300 hover:shadow-md'}`}>
                            <div className="p-5 cursor-pointer" onClick={() => setExpandedTool(isExpanded ? null : tool.name)}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${tool.isFree ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{tool.isFree ? 'Freemium' : 'Pago'}</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-600 border border-slate-200">{tool.category}</span>
                                    </div>
                                    {isExpanded ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">{tool.name}</h3>
                                <p className="text-slate-600 text-sm leading-snug">{tool.description}</p>
                            </div>
                            
                            {isExpanded && (
                                <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold text-green-700 flex items-center gap-1 uppercase tracking-wider"><ThumbsUp size={12}/> Ventajas</h5>
                                            <ul className="text-xs space-y-1.5">
                                                {tool.pros.map((p,i)=><li key={i} className="flex items-start gap-1.5"><span className="mt-1 w-1 h-1 rounded-full bg-green-500 flex-shrink-0"></span><span className="text-slate-700">{p}</span></li>)}
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold text-red-700 flex items-center gap-1 uppercase tracking-wider"><ThumbsDown size={12}/> Limitaciones</h5>
                                            <ul className="text-xs space-y-1.5">
                                                {tool.cons.map((c,i)=><li key={i} className="flex items-start gap-1.5"><span className="mt-1 w-1 h-1 rounded-full bg-red-400 flex-shrink-0"></span><span className="text-slate-700">{c}</span></li>)}
                                            </ul>
                                        </div>
                                        <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                                            <h5 className="text-xs font-bold text-indigo-700 flex items-center gap-1 uppercase tracking-wider"><Brain size={12}/> Uso Urológico</h5>
                                            <ul className="text-xs space-y-1.5">
                                                {tool.useCases.map((u,i)=><li key={i} className="text-slate-700 italic">"{u}"</li>)}
                                            </ul>
                                            <div className="pt-2 mt-2 border-t border-slate-100 flex gap-2">
                                                <a href={tool.url} target="_blank" className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold text-center hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"><ExternalLink size={12}/> Abrir App</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {activeTab === 'eau' && (
           <div className="animate-slide-up space-y-6">
               <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                   <div className="flex items-center gap-2 mb-4">
                       <BookOpen className="text-amber-600" />
                       <h3 className="text-xl font-bold text-amber-900">Consultor Guías EAU 2025</h3>
                   </div>
                   <div className="flex gap-4">
                       <input 
                            type="text" 
                            value={eauQuery} 
                            onChange={e => setEauQuery(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleEAUSearch()}
                            placeholder="Ej. Tratamiento cáncer próstata hormonosensible..."
                            className="flex-1 p-4 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-900 placeholder:text-slate-400 font-medium"
                       />
                       <button onClick={() => handleEAUSearch()} disabled={eauLoading || !eauQuery} className="px-8 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-all disabled:opacity-50">
                           {eauLoading ? <Loader2 className="animate-spin" /> : 'Consultar'}
                       </button>
                   </div>

                   <div className="mt-6">
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-3">Accesos Directos por Patología</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { l: 'Ca. Próstata', q: 'EAU Guidelines Prostate Cancer 2025 recommendations and algorithms' },
                                { l: 'Ca. Renal', q: 'EAU Guidelines Renal Cell Carcinoma 2025 management and algorithms' },
                                { l: 'Ca. Vejiga', q: 'EAU Guidelines Bladder Cancer 2025 treatment algorithms' },
                                { l: 'Litiasis', q: 'EAU Guidelines Urolithiasis 2025 treatment flowcharts' },
                                { l: 'Infecciones', q: 'EAU Guidelines Urological Infections 2025' },
                                { l: 'HBP / LUTS', q: 'EAU Guidelines Male LUTS 2025 management' },
                                { l: 'Disfunción Sexual', q: 'EAU Guidelines Sexual Health 2025' },
                                { l: 'Trauma', q: 'EAU Guidelines Urological Trauma 2025' }
                            ].map((item, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleEAUSearch(item.q)}
                                    className="px-3 py-1.5 bg-white border border-amber-200 text-amber-900 rounded-lg text-xs font-medium hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all shadow-sm"
                                >
                                    {item.l}
                                </button>
                            ))}
                        </div>
                   </div>
               </div>
               {eauResult && (
                   <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
                       <ReactMarkdown>{eauResult}</ReactMarkdown>
                       {eauSources.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <h4 className="text-sm font-bold">Fuentes Oficiales:</h4>
                                <ul className="text-xs space-y-1 mt-2">
                                    {eauSources.map((s,i) => <li key={i}><a href={s.uri} target="_blank" className="text-blue-600 hover:underline">{s.title}</a></li>)}
                                </ul>
                            </div>
                       )}
                   </div>
               )}
           </div>
      )}

      {activeTab === 'latest' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Sparkles className="text-teal-600 w-4 h-4" /> Resumen IA</h3>
                    <button onClick={fetchResearch} disabled={loading} className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-full hover:bg-teal-700 flex items-center gap-1">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />} {summary ? 'Actualizar' : 'Buscar'}
                    </button>
                </div>
                <div className="p-6 min-h-[400px]">
                    {loading ? <div className="h-full flex items-center justify-center text-teal-500"><Loader2 className="w-10 h-10 animate-spin" /></div> : 
                     summary ? <div className="prose prose-slate max-w-none"><ReactMarkdown>{summary}</ReactMarkdown></div> :
                     <div className="text-center text-slate-400 py-20"><BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50"/>Clic en Buscar para iniciar.</div>}
                </div>
            </div>
            <div className="space-y-6">
                 <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-sm text-blue-900">
                    <h4 className="font-bold mb-2">Nota Metodológica</h4>
                    <p>IA con Search Grounding. Verifica siempre en la fuente original.</p>
                 </div>
            </div>
        </div>
      )}

      {activeTab === 'pubmed' && (
        <div className="animate-slide-up space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-4">
                <input 
                    type="text"
                    value={pubMedQuery}
                    onChange={(e) => setPubMedQuery(e.target.value)}
                    placeholder="Términos MeSH o palabras clave..."
                    className="flex-1 p-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none" 
                    onKeyDown={(e) => e.key === 'Enter' && handlePubMedSearch()}
                />
                <button onClick={handlePubMedSearch} disabled={pubMedLoading || !pubMedQuery} className="bg-blue-700 text-white px-6 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 min-w-[140px] justify-center">
                    {pubMedLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />} {pubMedLoading ? 'Analizando...' : 'Buscar'}
                </button>
            </div>

            {/* SPLIT VIEW: Results + Chat */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* LEFT: RESULTS (Expanded if no results, otherwise 7 cols) */}
                <div className={`${pubMedResults.length > 0 ? 'xl:col-span-7' : 'xl:col-span-12'} space-y-6`}>
                    
                    {/* Knowledge Map */}
                    {pubMedResults.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Network className="text-indigo-600" /> Mapa de Conocimiento
                                </h3>
                                {!knowledgeMap ? (
                                    <button 
                                        onClick={handleGenerateMap} 
                                        disabled={loadingMap}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {loadingMap ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>} Generar Mapa
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setKnowledgeMap(null)}
                                        className="text-slate-400 hover:text-slate-600 text-xs underline"
                                    >
                                        Ocultar Mapa
                                    </button>
                                )}
                            </div>

                            {loadingMap && (
                                <div className="h-64 flex flex-col items-center justify-center text-indigo-500 bg-white rounded-xl border border-indigo-100 mb-6">
                                    <Loader2 className="w-10 h-10 animate-spin mb-2" />
                                    <p className="text-sm font-medium">Analizando citas bibliográficas...</p>
                                </div>
                            )}

                            {mapError && (
                                <div className="p-4 mb-6 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                                    <ThumbsDown size={16}/> {mapError}
                                </div>
                            )}

                            {knowledgeMap && (
                                <div className="relative mb-8 group animate-scale-in">
                                    <img src={knowledgeMap} alt="Knowledge Graph" className="w-full h-auto rounded-xl shadow-lg border border-slate-200" />
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        <a href={knowledgeMap} download="knowledge-graph.png" className="bg-white/90 text-slate-800 p-2 rounded-lg shadow hover:bg-white text-xs font-bold flex items-center gap-2 backdrop-blur">
                                            <Download size={14}/> Guardar
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Papers Grid */}
                    {pubMedResults.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between px-2">
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Resultados ({pubMedResults.length})</h4>
                                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 font-bold">Búsqueda Profunda Activa</span>
                            </div>
                            {pubMedResults.map((card, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col group">
                                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-800">{card.title}</h3>
                                    <p className="text-xs text-slate-500 mb-4 italic">{card.authors} - {card.journal}</p>
                                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded mb-4 flex-grow line-clamp-4 hover:line-clamp-none transition-all">{card.summary}</p>
                                    <a href={card.url} target="_blank" className="text-center w-full py-2 border border-slate-200 rounded hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors text-sm font-bold flex items-center justify-center gap-2"><ExternalLink size={14}/> Ver en PubMed</a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        pubMedLoading && (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                                <p className="font-medium text-slate-600">Realizando Revisión Sistemática...</p>
                                <p className="text-xs mt-2">Buscando 10-15 artículos de alto impacto (2020-2025)</p>
                            </div>
                        )
                    )}
                </div>

                {/* RIGHT: CHAT WITH FINDINGS (Only if results exist) */}
                {pubMedResults.length > 0 && (
                    <div className="xl:col-span-5 flex flex-col h-[calc(100vh-250px)] sticky top-6 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-slide-up">
                        <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <MessageSquareText size={18} className="text-teal-400"/> Chat con Resultados
                            </h3>
                            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">{pubMedResults.length} Papers</span>
                        </div>
                        
                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
                            {chatMessages.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    <p className="mb-4">Analiza estos {pubMedResults.length} artículos encontrados.</p>
                                    <div className="flex flex-col gap-2 px-8">
                                        <button onClick={() => handleQuickAnalysis('TREND')} className="p-2 bg-white border border-slate-200 rounded-lg hover:border-teal-400 hover:text-teal-700 text-xs font-medium transition-all text-left">📈 Analizar Tendencia y Consenso</button>
                                        <button onClick={() => handleQuickAnalysis('HYPE')} className="p-2 bg-white border border-slate-200 rounded-lg hover:border-purple-400 hover:text-purple-700 text-xs font-medium transition-all text-left">🔍 Detectar Hype vs Evidencia Sólida</button>
                                        <button onClick={() => handleQuickAnalysis('PARALLEL')} className="p-2 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:text-blue-700 text-xs font-medium transition-all text-left">🔀 Vías Paralelas / Controversias</button>
                                    </div>
                                </div>
                            ) : (
                                chatMessages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                                        }`}>
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                ))
                            )}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-sm text-slate-500">
                                        <Loader2 size={14} className="animate-spin" /> Analizando documentos...
                                    </div>
                                </div>
                            )}
                            <div ref={chatBottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white border-t border-slate-200">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleResearchChat()}
                                    placeholder="Pregunta sobre estos papers..."
                                    className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none text-slate-900"
                                />
                                <button 
                                    onClick={() => handleResearchChat()}
                                    disabled={chatLoading || !chatInput}
                                    className="absolute right-2 top-2 p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all disabled:opacity-50"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ResearchHub;