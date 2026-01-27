import React, { useState } from 'react';
import { CalculatorType } from '../types';
import { 
    HeartPulse, Activity, CheckCircle2, AlertTriangle, Calculator as CalcIcon, 
    Stethoscope, Brain, Heart, Scale, Cylinder, Dna, ShieldAlert, BarChart3, 
    Info, Lightbulb, ArrowRight, BookOpen, Copy, ExternalLink, TrendingUp, CheckSquare, Square, RotateCcw
} from 'lucide-react';

const Calculators: React.FC = () => {
  const [activeCalc, setActiveCalc] = useState<CalculatorType | null>(null);
  // Add a unique key to force re-render on reset
  const [resetKey, setResetKey] = useState(0);

  const calculatorsList = [
    {
      id: CalculatorType.IPSS,
      name: 'IPSS (Próstata)',
      desc: 'Síntomas del Tracto Urinario Inferior (LUTS).',
      icon: Activity,
      color: 'teal'
    },
    {
      id: CalculatorType.BRIGANTI,
      name: 'Nomograma Briganti',
      desc: 'Riesgo de Invasión Ganglionar (LNI) CaP.',
      icon: Dna,
      color: 'sky'
    },
    {
      id: CalculatorType.MSKCC,
      name: 'Nomograma MSKCC',
      desc: 'Predicción patológica pre-prostatectomía.',
      icon: ShieldAlert,
      color: 'blue'
    },
    {
      id: CalculatorType.STONE,
      name: 'STONE Score',
      desc: 'Probabilidad de Litiasis Ureteral.',
      icon: Scale,
      color: 'amber'
    },
    {
      id: CalculatorType.RENAL,
      name: 'RENAL Nephrometry',
      desc: 'Complejidad anatómica tumores renales.',
      icon: Stethoscope,
      color: 'blue'
    },
    {
      id: CalculatorType.PADUA,
      name: 'PADUA Score',
      desc: 'Riesgo quirúrgico nefrectomía parcial.',
      icon: CalcIcon,
      color: 'indigo'
    },
    {
      id: CalculatorType.EORTC,
      name: 'Tablas EORTC',
      desc: 'Riesgo Recidiva/Progresión Ca. Vejiga.',
      icon: BarChart3,
      color: 'orange'
    },
    {
      id: CalculatorType.ASA,
      name: 'Riesgo ASA',
      desc: 'Estado físico preoperatorio.',
      icon: HeartPulse,
      color: 'red'
    },
    {
      id: CalculatorType.IIEF,
      name: 'IIEF-5 (SHIM)',
      desc: 'Salud Sexual Masculina.',
      icon: Heart,
      color: 'rose'
    },
    {
      id: CalculatorType.VOLUME,
      name: 'Volumen Prostático',
      desc: 'Cálculo volumen elipsoide.',
      icon: Cylinder,
      color: 'cyan'
    },
    {
      id: CalculatorType.CHARLSON,
      name: 'Índice Charlson',
      desc: 'Comorbilidad y esperanza de vida.',
      icon: Brain,
      color: 'purple'
    }
  ];

  const handleReset = () => {
      setResetKey(prev => prev + 1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8 animate-slide-up">
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-2xl shadow-lg shadow-teal-900/20">
            <CalcIcon className="text-white w-8 h-8" />
        </div>
        <div>
            <h2 className="text-3xl font-bold text-slate-900">Calculadoras Clínicas</h2>
            <p className="text-slate-500 font-medium">Herramientas de estratificación de riesgo basadas en evidencia.</p>
        </div>
      </div>
      
      {!activeCalc ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
          {calculatorsList.map((calc) => {
             const Icon = calc.icon;
             // Color mapping for hover states and icons
             const colorMap: any = {
                teal: 'text-teal-600 bg-teal-50 group-hover:bg-teal-600',
                sky: 'text-sky-600 bg-sky-50 group-hover:bg-sky-600',
                blue: 'text-blue-600 bg-blue-50 group-hover:bg-blue-600',
                amber: 'text-amber-600 bg-amber-50 group-hover:bg-amber-600',
                indigo: 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600',
                orange: 'text-orange-600 bg-orange-50 group-hover:bg-orange-600',
                red: 'text-red-600 bg-red-50 group-hover:bg-red-600',
                rose: 'text-rose-600 bg-rose-50 group-hover:bg-rose-600',
                cyan: 'text-cyan-600 bg-cyan-50 group-hover:bg-cyan-600',
                purple: 'text-purple-600 bg-purple-50 group-hover:bg-purple-600'
             };
             const theme = colorMap[calc.color] || colorMap.teal;

             return (
              <div 
                key={calc.id}
                onClick={() => setActiveCalc(calc.id)}
                className="bg-white p-6 rounded-2xl border border-slate-200 cursor-pointer transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 duration-300 group relative overflow-hidden"
              >
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${theme} group-hover:text-white shadow-sm`}>
                  <Icon size={28} />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">{calc.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{calc.desc}</p>
                
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="text-slate-300 w-5 h-5" />
                </div>
              </div>
             );
          })}
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <button 
                onClick={() => setActiveCalc(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-teal-700 hover:border-teal-200 transition-all flex items-center gap-2 font-bold text-sm shadow-sm"
            >
                <ArrowRight className="rotate-180 w-4 h-4" /> Volver al catálogo
            </button>
            <button
                onClick={handleReset}
                className="px-4 py-2 text-slate-400 hover:text-slate-700 flex items-center gap-2 text-xs font-bold transition-all"
                title="Resetear valores"
            >
                <RotateCcw size={14} /> Resetear
            </button>
          </div>
          
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
             {/* Key forces re-mount on reset */}
             <React.Fragment key={resetKey}>
                 {activeCalc === CalculatorType.IPSS && <IPSSCalculator />}
                 {activeCalc === CalculatorType.ASA && <ASACalculator />}
                 {activeCalc === CalculatorType.RENAL && <RENALCalculator />}
                 {activeCalc === CalculatorType.PADUA && <PADUACalculator />}
                 {activeCalc === CalculatorType.STONE && <STONECalculator />}
                 {activeCalc === CalculatorType.IIEF && <IIEFCalculator />}
                 {activeCalc === CalculatorType.VOLUME && <VolumeCalculator />}
                 {activeCalc === CalculatorType.CHARLSON && <CharlsonCalculator />}
                 {activeCalc === CalculatorType.BRIGANTI && <BrigantiCalculator />}
                 {activeCalc === CalculatorType.MSKCC && <MSKCCCalculator />}
                 {activeCalc === CalculatorType.EORTC && <EORTCCalculator />}
             </React.Fragment>
          </div>
        </div>
      )}
    </div>
  );
};

// --- REUSABLE CLINICAL INSIGHT CARD ---

interface InsightCardProps {
    title: string;
    score: string | number;
    scoreLabel?: string;
    severity: string;
    color: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'purple';
    analysis?: React.ReactNode;
    guidelineText?: string;
    tips?: string[];
    guidelineUrl?: string;
}

const ClinicalInsightCard: React.FC<InsightCardProps> = ({ title, score, scoreLabel, severity, color, analysis, guidelineText, tips, guidelineUrl }) => {
    const colorStyles = {
        green: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-100', icon: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500' },
        yellow: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-100', icon: 'bg-yellow-100 text-yellow-600', bar: 'bg-yellow-400' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-100', icon: 'bg-orange-100 text-orange-600', bar: 'bg-orange-500' },
        red: { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-100', icon: 'bg-rose-100 text-rose-600', bar: 'bg-rose-500' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-100', icon: 'bg-blue-100 text-blue-600', bar: 'bg-blue-500' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-100', icon: 'bg-purple-100 text-purple-600', bar: 'bg-purple-500' }
    };

    const style = colorStyles[color] || colorStyles.blue;
    const [copied, setCopied] = useState(false);

    const copyResult = () => {
        const text = `Herramienta: ${title}\nPuntuación: ${score}\nInterpretación: ${severity}\nRecomendación: ${guidelineText || 'N/A'}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white p-0 lg:p-6 animate-scale-in">
             <div className={`${style.bg} rounded-3xl p-8 border ${style.border} relative overflow-hidden shadow-sm`}>
                {/* Background Decor */}
                <div className={`absolute top-0 right-0 w-64 h-64 ${style.icon} opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none`}></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    {/* Score Visualization */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                             {/* Animated Circle SVG */}
                             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                                <circle cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white opacity-50" />
                                <circle cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={314} strokeDashoffset={100} className={`${style.text} opacity-80`} strokeLinecap="round" />
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <span className={`text-3xl font-extrabold ${style.text}`}>{score}</span>
                                 {scoreLabel && <span className={`text-[10px] font-bold uppercase ${style.text} opacity-70`}>{scoreLabel}</span>}
                             </div>
                        </div>
                        <div className={`mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/60 backdrop-blur border border-white/50 ${style.text} shadow-sm whitespace-nowrap`}>
                            {severity}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className={`text-2xl font-bold ${style.text} mb-1`}>Resultado del Análisis</h3>
                                <div className="h-1 w-20 bg-current opacity-20 rounded-full"></div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={copyResult} className="p-2 bg-white/80 hover:bg-white rounded-xl text-slate-600 hover:text-teal-600 transition-all shadow-sm border border-slate-100" title="Copiar Resultado">
                                    {copied ? <CheckCircle2 size={20} className="text-green-600"/> : <Copy size={20} />}
                                </button>
                                {guidelineUrl && (
                                    <a href={guidelineUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/80 hover:bg-white rounded-xl text-slate-600 hover:text-blue-600 transition-all shadow-sm border border-slate-100" title="Ver Guía EAU">
                                        <ExternalLink size={20} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Analysis Component */}
                        {analysis && (
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                                {analysis}
                            </div>
                        )}

                        {/* Guideline */}
                        {guidelineText && (
                            <div className="flex gap-3 items-start">
                                <div className={`p-2 rounded-lg ${style.icon} mt-0.5`}>
                                    <BookOpen size={16} />
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold ${style.text} uppercase opacity-80 mb-1`}>Recomendación EAU 2025</h4>
                                    <p className="text-slate-700 text-sm font-medium leading-relaxed">{guidelineText}</p>
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        {tips && tips.length > 0 && (
                            <div className="flex gap-3 items-start">
                                <div className={`p-2 rounded-lg bg-yellow-100 text-yellow-600 mt-0.5`}>
                                    <Lightbulb size={16} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-yellow-800 uppercase opacity-80 mb-1">Perlas Clínicas</h4>
                                    <ul className="text-slate-700 text-xs font-medium space-y-1 list-disc pl-3 marker:text-yellow-500">
                                        {tips.map((tip, i) => <li key={i}>{tip}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};

// --- IMPLEMENTED CALCULATORS ---

const VolumeCalculator: React.FC = () => {
    const [dims, setDims] = useState({ w: '', h: '', l: '' });
    
    const w = parseFloat(dims.w) || 0;
    const h = parseFloat(dims.h) || 0;
    const l = parseFloat(dims.l) || 0;
    const vol = (w * h * l * 0.52).toFixed(1);
    const volume = parseFloat(vol);

    let classification = "Normal";
    let color: any = "green";
    let guide = "Próstata de tamaño normal. Sin indicación quirúrgica por volumen.";

    if (volume > 30 && volume <= 80) {
        classification = "HBP Moderada";
        color = "yellow";
        guide = "Tamaño intermedio. Candidato a RTU Monopolar/Bipolar, Rezum, Urolift o Láser verde según anatomía.";
    } else if (volume > 80) {
        classification = "HBP Severa";
        color = "orange";
        guide = "Próstata de gran volumen. Indicación de Enucleación (HoLEP/ThuLEP) o Adenomectomía Abierta/Laparoscópica. Evitar RTU convencional.";
    }

    const preventInvalidInput = (e: React.KeyboardEvent) => {
        if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50/50">
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-cyan-100 text-cyan-700 rounded-lg"><Cylinder size={24}/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Volumen Prostático</h3>
                        <p className="text-xs text-slate-500">Fórmula del Elipsoide (W x H x L x 0.52)</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {['Ancho (Width)', 'Alto (Height)', 'Largo (Length)'].map((label, i) => (
                        <div key={i}>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{label} (mm/cm)</label>
                            <input 
                                type="number" 
                                min="0"
                                value={Object.values(dims)[i]} 
                                onChange={(e) => setDims({...dims, [Object.keys(dims)[i]]: e.target.value})}
                                onKeyDown={preventInvalidInput}
                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none bg-white text-slate-900" 
                                placeholder="0" 
                            />
                        </div>
                    ))}
                    <div className="text-xs text-slate-400 italic mt-2">
                        * Asegúrese de usar la misma unidad (generalmente cm) para todos los campos.
                    </div>
                </div>
            </div>
            <div className="p-8 flex items-center justify-center bg-white lg:bg-transparent">
                 <ClinicalInsightCard 
                    title="Volumen Estimado"
                    score={vol + ' cc'}
                    severity={classification}
                    color={color}
                    guidelineText={guide}
                    guidelineUrl="https://uroweb.org/guidelines/non-neurogenic-male-luts"
                    tips={["La fórmula del elipsoide puede subestimar volúmenes >80cc.", "Para próstatas muy grandes con lóbulo medio intravesical, considera la configuración anatómica más que el volumen puro."]}
                 />
            </div>
        </div>
    );
}

const RENALCalculator: React.FC = () => {
    const [scores, setScores] = useState({ r: 1, e: 1, n: 1, a: 'a', l: 1 });
    
    // Logic: R(1-3) + E(1-3) + N(1-3) + L(1-3) = 4-12 points. 'A' is a suffix.
    const total = scores.r + scores.e + scores.n + scores.l;
    const suffix = scores.a === 'a' ? 'a' : scores.a === 'p' ? 'p' : 'x';
    const finalScore = `${total}${suffix}`;

    let complexity = "Baja Complejidad";
    let color: any = "green";
    if (total >= 7 && total <= 9) { complexity = "Complejidad Media"; color = "yellow"; }
    if (total >= 10) { complexity = "Alta Complejidad"; color = "red"; }

    const SelectBtn = ({ label, active, onClick }: any) => (
        <button onClick={onClick} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${active ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50'}`}>{label}</button>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50/50">
            <div className="p-8 space-y-5 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Stethoscope size={24}/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">R.E.N.A.L. Score</h3>
                        <p className="text-xs text-slate-500">Nephrometry Score for Renal Masses</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                     <div className="border-b pb-2">
                        <label className="text-sm font-bold text-slate-700 block mb-2">(R)adius - Diámetro Máximo</label>
                        <div className="flex gap-2">
                            <SelectBtn label="≤ 4cm (1pt)" active={scores.r===1} onClick={()=>setScores({...scores, r:1})}/>
                            <SelectBtn label="4 - 7cm (2pts)" active={scores.r===2} onClick={()=>setScores({...scores, r:2})}/>
                            <SelectBtn label="≥ 7cm (3pts)" active={scores.r===3} onClick={()=>setScores({...scores, r:3})}/>
                        </div>
                     </div>
                     <div className="border-b pb-2">
                        <label className="text-sm font-bold text-slate-700 block mb-2">(E)xophytic - % Exofítico</label>
                        <div className="flex gap-2">
                            <SelectBtn label="≥ 50% (1pt)" active={scores.e===1} onClick={()=>setScores({...scores, e:1})}/>
                            <SelectBtn label="< 50% (2pts)" active={scores.e===2} onClick={()=>setScores({...scores, e:2})}/>
                            <SelectBtn label="Endofítico (3pts)" active={scores.e===3} onClick={()=>setScores({...scores, e:3})}/>
                        </div>
                     </div>
                     <div className="border-b pb-2">
                        <label className="text-sm font-bold text-slate-700 block mb-2">(N)earness - Distancia a Seno/Sistema Colector</label>
                        <div className="flex gap-2">
                            <SelectBtn label="≥ 7mm (1pt)" active={scores.n===1} onClick={()=>setScores({...scores, n:1})}/>
                            <SelectBtn label="4 - 7mm (2pts)" active={scores.n===2} onClick={()=>setScores({...scores, n:2})}/>
                            <SelectBtn label="≤ 4mm (3pts)" active={scores.n===3} onClick={()=>setScores({...scores, n:3})}/>
                        </div>
                     </div>
                     <div className="border-b pb-2">
                        <label className="text-sm font-bold text-slate-700 block mb-2">(A)nterior / Posterior</label>
                        <div className="flex gap-2">
                            <SelectBtn label="Anterior (a)" active={scores.a==='a'} onClick={()=>setScores({...scores, a:'a'})}/>
                            <SelectBtn label="Posterior (p)" active={scores.a==='p'} onClick={()=>setScores({...scores, a:'p'})}/>
                            <SelectBtn label="Indeterminado (x)" active={scores.a==='x'} onClick={()=>setScores({...scores, a:'x'})}/>
                        </div>
                     </div>
                     <div className="border-b pb-2">
                        <label className="text-sm font-bold text-slate-700 block mb-2">(L)ocation - Líneas Polares</label>
                        <div className="flex gap-2">
                            <SelectBtn label="Sup/Inf (1pt)" active={scores.l===1} onClick={()=>setScores({...scores, l:1})}/>
                            <SelectBtn label="Cruza una (2pts)" active={scores.l===2} onClick={()=>setScores({...scores, l:2})}/>
                            <SelectBtn label="Cruza >50% (3pts)" active={scores.l===3} onClick={()=>setScores({...scores, l:3})}/>
                        </div>
                     </div>
                </div>
            </div>
            <div className="p-8 flex items-center justify-center bg-white lg:bg-transparent">
                 <ClinicalInsightCard 
                    title="Puntuación RENAL"
                    score={finalScore}
                    severity={complexity}
                    color={color}
                    guidelineText={total >= 10 
                        ? "Alta complejidad. Considerar Nefrectomía Radical o derivación a centro experto si se desea preservar nefrona. Riesgo de complicaciones urológicas elevado." 
                        : "Baja/Media complejidad. Candidato ideal para Nefrectomía Parcial (Robótica/Laparoscópica)."}
                    guidelineUrl="https://uroweb.org/guidelines/renal-cell-carcinoma"
                    tips={["El componente (N)earness es el predictor más fuerte de complicaciones postoperatorias.", "Tumores con score 'h' (hilar) añaden complejidad vascular no siempre reflejada en el número puro."]}
                 />
            </div>
        </div>
    );
};

const PADUACalculator: React.FC = () => {
    // Full implementation of PADUA
    const [vars, setVars] = useState({
        location: 1, // 1=Polar lines (Sup/Inf), 2=Crossing
        exophytic: 1, // 1=>=50%, 2=<50%, 3=Endo
        rim: 1, // 1=Lateral, 2=Medial
        sinus: 1, // 1=No, 2=Yes
        system: 1, // 1=No, 2=Yes (dislocated/infiltrated)
        size: 1 // 1=<4, 2=4-7, 3=>7
    });
    
    const total = (Object.values(vars) as number[]).reduce((a,b)=>a+b, 0);
    
    let risk = "Bajo Riesgo (6-7)";
    let color: any = "green";
    if (total >= 8 && total <= 9) { risk = "Riesgo Intermedio (8-9)"; color = "yellow"; }
    if (total >= 10) { risk = "Alto Riesgo (>=10)"; color = "red"; }

    const Row = ({label, opts, val, k}: any) => (
        <div className="border-b border-slate-100 pb-2 mb-2">
            <div className="text-xs font-bold text-slate-700 uppercase mb-1">{label}</div>
            <div className="flex flex-wrap gap-2">
                {opts.map((o: any, i: number) => (
                    <button key={i} onClick={()=>setVars({...vars, [k]: o.v})} className={`px-2 py-1 text-[10px] rounded border ${val===o.v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 hover:bg-indigo-50'}`}>
                        {o.l} ({o.v}pts)
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50/50">
            <div className="p-8 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><CalcIcon size={24}/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">PADUA Score</h3>
                        <p className="text-xs text-slate-500">Preoperative Aspects and Dimensions Used for Anatomical</p>
                    </div>
                </div>
                <Row k="location" val={vars.location} label="Localización Longitudinal" opts={[{l:'Polar Sup/Inf',v:1}, {l:'Cruza L. Polar',v:2}]} />
                <Row k="exophytic" val={vars.exophytic} label="Tasa Exofítica" opts={[{l:'>=50%',v:1}, {l:'<50%',v:2}, {l:'Endofítico',v:3}]} />
                <Row k="rim" val={vars.rim} label="Borde Renal" opts={[{l:'Lateral',v:1}, {l:'Medial',v:2}]} />
                <Row k="sinus" val={vars.sinus} label="Seno Renal" opts={[{l:'No Involucra',v:1}, {l:'Involucra',v:2}]} />
                <Row k="system" val={vars.system} label="Sistema Colector" opts={[{l:'Ausente',v:1}, {l:'Involucrado/Dislocado',v:2}]} />
                <Row k="size" val={vars.size} label="Tamaño Tumor" opts={[{l:'<=4cm',v:1}, {l:'4-7cm',v:2}, {l:'>7cm',v:3}]} />
            </div>
            <div className="p-8 flex items-center justify-center bg-white lg:bg-transparent">
                 <ClinicalInsightCard 
                    title="Puntuación PADUA"
                    score={total}
                    severity={risk}
                    color={color}
                    guidelineText="El score PADUA predice el riesgo de complicaciones globales (Clavien > 2) en nefrectomía parcial. Puntuaciones altas correlacionan con mayor tiempo de isquemia caliente."
                    tips={["La afectación del sistema colector aumenta significativamente el riesgo de fístula urinaria.", "Tumores con score >=10 tienen un riesgo de complicaciones ~30% vs ~6% en bajo riesgo."]}
                 />
            </div>
        </div>
    );
};

const IIEFCalculator: React.FC = () => {
    const [scores, setScores] = useState([5,5,5,5,5]);
    const total = scores.reduce((a,b)=>a+b,0);
    
    let severity = "Sin Disfunción (22-25)";
    let color: any = "green";
    if (total <= 21) { severity = "Disfunción Leve (17-21)"; color = "yellow"; }
    if (total <= 16) { severity = "Leve a Moderada (12-16)"; color = "orange"; }
    if (total <= 11) { severity = "Moderada (8-11)"; color = "orange"; } // darker orange handled by component logic approx
    if (total <= 7) { severity = "Severa (1-7)"; color = "red"; }

    const questions = [
        "Confianza para lograr erección",
        "Erección suficiente para penetración",
        "Mantenimiento erección tras penetración",
        "Dificultad para mantener hasta el final",
        "Satisfacción sexual"
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50/50">
            <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-lg"><Heart size={24}/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">IIEF-5 (SHIM)</h3>
                        <p className="text-xs text-slate-500">Sexual Health Inventory for Men</p>
                    </div>
                </div>
                {questions.map((q, i) => (
                    <div key={i} className="border-b border-slate-200 pb-3">
                        <label className="text-xs font-bold text-slate-700 block mb-1">{i+1}. {q}</label>
                        <input 
                            type="range" min="1" max="5" step="1" 
                            value={scores[i]} 
                            onChange={(e)=> {const s=[...scores]; s[i]=parseInt(e.target.value); setScores(s);}}
                            className="w-full accent-rose-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Muy bajo (1)</span>
                            <span className="font-bold text-rose-600">{scores[i]}</span>
                            <span>Muy alto (5)</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-8 flex items-center justify-center bg-white lg:bg-transparent">
                 <ClinicalInsightCard 
                    title="Salud Sexual"
                    score={total}
                    severity={severity}
                    color={color}
                    guidelineText="Primera línea EAU: Inhibidores PDE5 (Sildenafilo, Tadalafilo). Evaluar factores de riesgo cardiovascular y testosterona."
                    tips={["Si hay respuesta parcial a IPDE5, verificar toma correcta (estómago vacío, estimulación).", "En pacientes diabéticos la respuesta a fármacos orales puede ser menor (50-60%)."]}
                 />
            </div>
        </div>
    );
};

const ASACalculator: React.FC = () => {
    const [asa, setAsa] = useState(1);
    
    const descriptions = [
        "Paciente sano normal.",
        "Enfermedad sistémica leve.",
        "Enfermedad sistémica severa.",
        "Enfermedad sistémica severa con amenaza constante a la vida.",
        "Paciente moribundo, no se espera supervivencia sin operación.",
        "Muerte cerebral (donante)."
    ];

    const mortality = [
        "< 0.03%", // ASA 1
        "0.1 - 0.2%", // ASA 2
        "0.4 - 1.8%", // ASA 3
        "5 - 20%", // ASA 4
        "20 - 50%", // ASA 5
        "N/A" // ASA 6
    ];

    const colors: any = ["green", "green", "yellow", "orange", "red", "purple"];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50/50">
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 text-red-700 rounded-lg"><HeartPulse size={24}/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Score ASA</h3>
                        <p className="text-xs text-slate-500">American Society of Anesthesiologists</p>
                    </div>
                </div>
                <div className="space-y-2">
                    {[1,2,3,4,5,6].map((cls) => (
                        <button 
                            key={cls}
                            onClick={() => setAsa(cls)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center ${asa === cls ? 'bg-red-600 text-white border-red-700 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-red-50'}`}
                        >
                            <span className="font-bold">ASA {cls}</span>
                            <span className="text-xs opacity-80 truncate ml-2">{descriptions[cls-1]}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-8 flex items-center justify-center bg-white lg:bg-transparent">
                 <ClinicalInsightCard 
                    title={`Clase ASA ${asa}`}
                    score={mortality[asa-1]}
                    scoreLabel="Mortalidad Perioperatoria Aprox."
                    severity={descriptions[asa-1]}
                    color={colors[asa-1]}
                    guidelineText="La clasificación ASA es un predictor independiente fuerte de complicaciones postoperatorias en cirugía urológica mayor."
                 />
            </div>
        </div>
    );
};

const CharlsonCalculator: React.FC = () => {
    const [age, setAge] = useState(0); // 0=<50, 1=50-59, 2=60-69, 3=70-79, 4=>80
    
    // Better implementation:
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const comorbidities = [
        { id: 1, name: "Infarto Miocardio", pts: 1 },
        { id: 2, name: "Insuficiencia Cardíaca", pts: 1 },
        { id: 3, name: "Enf. Vascular Periférica", pts: 1 },
        { id: 4, name: "Enf. Cerebrovascular", pts: 1 },
        { id: 5, name: "Demencia", pts: 1 },
        { id: 6, name: "EPOC", pts: 1 },
        { id: 7, name: "Tejido Conectivo", pts: 1 },
        { id: 8, name: "Úlcera Péptica", pts: 1 },
        { id: 9, name: "Enf. Hepática Leve", pts: 1 },
        { id: 10, name: "Diabetes (sin daño)", pts: 1 },
        { id: 11, name: "Hemiplejia", pts: 2 },
        { id: 12, name: "Enf. Renal Mod-Severa", pts: 2 },
        { id: 13, name: "Diabetes con daño org.", pts: 2 },
        { id: 14, name: "Tumor Sólido", pts: 2 },
        { id: 15, name: "Leucemia", pts: 2 },
        { id: 16, name: "Linfoma", pts: 2 },
        { id: 17, name: "Enf. Hepática Mod-Severa", pts: 3 },
        { id: 18, name: "Tumor Metastásico", pts: 6 },
        { id: 19, name: "SIDA", pts: 6 },
    ];
    
    const toggle = (id: number) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const conditionScore = selectedIds.reduce((acc, id) => acc + (comorbidities.find(c => c.id === id)?.pts || 0), 0);
    const total = conditionScore + age;

    let survival = "> 90%";
    let color: any = "green";
    if (total >= 3) { survival = "77 - 90%"; color = "yellow"; }
    if (total >= 5) { survival = "53 - 77%"; color = "orange"; }
    if (total >= 7) { survival = "< 53%"; color = "red"; }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50/50">
            <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Brain size={24}/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Índice de Charlson</h3>
                        <p className="text-xs text-slate-500">Comorbilidad y Esperanza de Vida (10 años)</p>
                    </div>
                </div>

                <div className="pb-4 border-b">
                    <label className="text-sm font-bold text-slate-700 block mb-2">Edad</label>
                    <div className="flex flex-wrap gap-2">
                        {['<50 (0)', '50-59 (1)', '60-69 (2)', '70-79 (3)', '≥80 (4)'].map((l, i) => (
                            <button key={i} onClick={()=>setAge(i)} className={`px-3 py-1 text-xs rounded border ${age===i ? 'bg-purple-600 text-white' : 'bg-white'}`}>{l}</button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {comorbidities.map(c => (
                        <button 
                            key={c.id} 
                            onClick={() => toggle(c.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs text-left border transition-all ${selectedIds.includes(c.id) ? 'bg-purple-100 border-purple-300 text-purple-900' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                        >
                            {selectedIds.includes(c.id) ? <CheckSquare size={14} className="text-purple-600"/> : <Square size={14} className="text-slate-300"/>}
                            <span className="flex-1">{c.name}</span>
                            <span className="font-bold text-slate-400">+{c.pts}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-8 flex items-center justify-center bg-white lg:bg-transparent">
                 <ClinicalInsightCard 
                    title="Índice Comorbilidad"
                    score={total}
                    scoreLabel="Puntos Totales"
                    severity={`Supervivencia 10y: ${survival}`}
                    color={color}
                    guidelineText="Fundamental para decidir tratamiento en Cáncer de Próstata. EAU recomienda evitar tratamiento curativo si esperanza de vida < 10 años (generalmente Charlson >= 3-4 en mayores de 70)."
                 />
            </div>
        </div>
    );
};

const MSKCCCalculator: React.FC = () => {
    const [psa, setPsa] = useState('');
    const [gleason, setGleason] = useState('1'); // 1=<=6, 2=3+4, 3=4+3, 4=8, 5=9-10
    const [stage, setStage] = useState('1'); // 1=T1c, 2=T2a, 3=T2b/c

    // Simplified logic based on Partin/MSKCC trends
    const calcProb = () => {
        const p = parseFloat(psa) || 0;
        const g = parseInt(gleason);
        const t = parseInt(stage);

        // Base Organ Confined (OC) probability starts high and decreases
        let oc = 90; 
        // Penalties
        if (p > 10) oc -= 10;
        if (p > 20) oc -= 20;
        
        if (g === 2) oc -= 15; // 3+4
        if (g === 3) oc -= 30; // 4+3
        if (g === 4) oc -= 40; // 8
        if (g >= 5) oc -= 60; // 9-10

        if (t === 2) oc -= 10;
        if (t === 3) oc -= 20;

        return Math.max(1, Math.min(99, oc)); // Clamp 1-99
    };

    const ocProb = calcProb();
    const epeProb = (100 - ocProb) * 0.7; // Rough distribution of non-OC
    const sviProb = (100 - ocProb) * 0.3;

    const preventInvalidInput = (e: React.KeyboardEvent) => {
        if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50/50">
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><ShieldAlert size={24}/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Predicción Pre-Op (MSKCC/Partin)</h3>
                        <p className="text-xs text-slate-500">Estimación de estadio patológico</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">PSA Preoperatorio</label>
                        <input 
                            type="number" min="0" 
                            value={psa} 
                            onChange={e=>setPsa(e.target.value)} 
                            onKeyDown={preventInvalidInput}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900" 
                            placeholder="ng/mL" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Biopsia Gleason (ISUP)</label>
                        <select value={gleason} onChange={e=>setGleason(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="1">GG 1 (≤6)</option>
                            <option value="2">GG 2 (3+4)</option>
                            <option value="3">GG 3 (4+3)</option>
                            <option value="4">GG 4 (8)</option>
                            <option value="5">GG 5 (9-10)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estadio Clínico</label>
                        <select value={stage} onChange={e=>setStage(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="1">T1c</option>
                            <option value="2">T2a</option>
                            <option value="3">T2b/T2c</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="p-8 flex items-center justify-center bg-white lg:bg-transparent">
                 <ClinicalInsightCard 
                    title="Probabilidad Confinado Órgano"
                    score={ocProb + '%'}
                    severity={ocProb > 70 ? "Favorable" : ocProb > 40 ? "Intermedio" : "Desfavorable"}
                    color={ocProb > 70 ? "green" : ocProb > 40 ? "yellow" : "red"}
                    analysis={
                        <div className="space-y-2 mt-2">
                            <div className="flex justify-between text-xs font-medium text-slate-600">
                                <span>Extensión Extracapsular (EPE)</span>
                                <span>~{epeProb.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-orange-400 h-full" style={{width: `${epeProb}%`}}></div>
                            </div>
                            <div className="flex justify-between text-xs font-medium text-slate-600">
                                <span>Invasión Vesículas (SVI)</span>
                                <span>~{sviProb.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full" style={{width: `${sviProb}%`}}></div>
                            </div>
                        </div>
                    }
                    guidelineText="Probabilidad estimada basada en tablas predictivas estándar. Útil para planificar preservación de bandeletas neurovasculares (NVB)."
                    tips={["Si riesgo de EPE > 20-30% en un lado, considerar resección más amplia y no preservar NVB en ese lado."]}
                 />
            </div>
        </div>
    );
};

const BrigantiCalculator: React.FC = () => {
    const [psa, setPsa] = useState<string>('');
    const [gleason, setGleason] = useState<string>('1');
    const [stage, setStage] = useState<string>('cT1c');
    const [cores, setCores] = useState<string>('');

    const calculateRisk = () => {
        const p = parseFloat(psa) || 0;
        const g = parseInt(gleason);
        // Ensure cores is clamped 0-100
        const c = Math.min(100, Math.max(0, parseFloat(cores) || 0));
        
        let score = p * 0.5; 
        if (g === 2) score += 5;
        if (g === 3) score += 12;
        if (g === 4) score += 25;
        if (g === 5) score += 35;
        if (stage === 'cT2a') score += 3;
        if (stage === 'cT2b') score += 5;
        if (stage === 'cT2c') score += 10;
        if (stage.includes('cT3')) score += 20;
        score += c * 0.2;
        return Math.min(99, Math.max(1, score)).toFixed(1);
    };

    const risk = parseFloat(calculateRisk());
    const isHighRisk = risk > 5;

    const preventInvalidInput = (e: React.KeyboardEvent) => {
        if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 bg-slate-50/50">
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-sky-100 text-sky-700 rounded-lg"><Dna size={24}/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Nomograma Briganti 2019</h3>
                        <p className="text-xs text-slate-500">LNI Risk Assessment</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">PSA (ng/mL)</label>
                        <input 
                            type="number" min="0" 
                            value={psa} 
                            onChange={e => setPsa(e.target.value)} 
                            onKeyDown={preventInvalidInput}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-900" 
                            placeholder="0.0" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Grupo Grado (ISUP)</label>
                        <select value={gleason} onChange={e => setGleason(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-900">
                            <option value="1">GG 1 (3+3)</option>
                            <option value="2">GG 2 (3+4)</option>
                            <option value="3">GG 3 (4+3)</option>
                            <option value="4">GG 4 (8)</option>
                            <option value="5">GG 5 (9-10)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estadio Clínico (cT)</label>
                        <select value={stage} onChange={e => setStage(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-900">
                            <option value="cT1c">cT1c</option>
                            <option value="cT2a">cT2a</option>
                            <option value="cT2b">cT2b</option>
                            <option value="cT2c">cT2c</option>
                            <option value="cT3a">cT3a</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">% Cilindros Positivos</label>
                        <input 
                            type="number" min="0" max="100" 
                            value={cores} 
                            onChange={e => {
                                let val = parseFloat(e.target.value);
                                if (val > 100) val = 100;
                                setCores(e.target.value)
                            }} 
                            onKeyDown={preventInvalidInput}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none bg-white text-slate-900" 
                            placeholder="0 - 100" 
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center p-4 lg:p-8 bg-white lg:bg-transparent">
                 <ClinicalInsightCard 
                    title="Riesgo de Invasión Ganglionar"
                    score={risk + '%'}
                    severity={isHighRisk ? 'Alto Riesgo (>5%)' : 'Bajo Riesgo (<5%)'}
                    color={isHighRisk ? 'red' : 'green'}
                    guidelineText={isHighRisk 
                        ? "Las guías EAU recomiendan encarecidamente realizar una Linfadenectomía Pélvica Extendida (ePLND) debido a que el riesgo supera el umbral del 5-7%." 
                        : "El riesgo de invasión ganglionar es bajo. Según guías EAU, se puede omitir la linfadenectomía pélvica, reduciendo morbilidad quirúrgica."
                    }
                    guidelineUrl="https://uroweb.org/guidelines/prostate-cancer/chapter/disease-management"
                    tips={[
                        "Asegúrate de que la estadificación cT se base en tacto rectal y/o RM multiparamétrica.",
                        "El porcentaje de cilindros positivos debe excluir biopsias dirigidas para mayor precisión en versiones antiguas del nomograma, aunque Briganti 2019 lo ajusta."
                    ]}
                 />
            </div>
        </div>
    );
};

const IPSSCalculator: React.FC = () => {
  const questions = [
    "1. Sensación de vaciado incompleto",
    "2. Frecuencia miccional (< 2h)",
    "3. Intermitencia (para y sigue)",
    "4. Urgencia miccional",
    "5. Chorro débil",
    "6. Esfuerzo / Pujo",
    "7. Nocturia"
  ];
  
  const [scores, setScores] = useState<number[]>(new Array(7).fill(0));
  const total = scores.reduce((a, b) => a + b, 0);

  // Subscores logic
  // Voiding: Q1, Q3, Q5, Q6
  const voidingScore = scores[0] + scores[2] + scores[4] + scores[5];
  // Storage: Q2, Q4, Q7
  const storageScore = scores[1] + scores[3] + scores[6];

  let severity = 'Leve (0-7)';
  let color: 'green' | 'orange' | 'red' = 'green';
  let guideline = "Manejo expectante (Watchful Waiting). Modificaciones del estilo de vida (ingesta hídrica, cafeína/alcohol). Revisión anual.";

  if (total >= 8 && total <= 19) { 
      severity = 'Moderada (8-19)'; 
      color = 'orange'; 
      guideline = "Considerar tratamiento farmacológico. Alfa-bloqueantes son primera línea para alivio rápido. Si próstata >30-40cc, considerar 5-ARI combinados.";
  }
  if (total >= 20) { 
      severity = 'Severa (20-35)'; 
      color = 'red'; 
      guideline = "Considerar tratamiento invasivo/quirúrgico si falla tratamiento médico o si hay complicaciones. Evaluar flujo (Qmax) y RPM.";
  }

  const predominant = voidingScore > storageScore ? "Predominio de Vaciado (Obstructivo)" : storageScore > voidingScore ? "Predominio de Llenado (Irritativo)" : "Mixto";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 xl:gap-8 bg-slate-50/50">
      <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
         <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg"><Activity size={24}/></div>
            <div>
                <h3 className="text-xl font-bold text-slate-900">Cuestionario IPSS</h3>
                <p className="text-xs text-slate-500">Evaluación de síntomas prostáticos</p>
            </div>
        </div>
        {questions.map((q, idx) => (
          <div key={idx} className="pb-4 border-b border-slate-200 last:border-0">
            <label className="text-sm font-semibold text-slate-800 block mb-2">{q}</label>
            <div className="flex gap-1">
              {[0,1,2,3,4,5].map((val) => (
                <button
                  key={val}
                  onClick={() => { const s = [...scores]; s[idx] = val; setScores(s); }}
                  className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all border ${
                    scores[idx] === val 
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md transform scale-105' 
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-teal-50 hover:border-teal-200'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-8 flex items-center justify-center bg-white xl:bg-transparent">
        <ClinicalInsightCard 
            title="Sintomatología LUTS"
            score={total}
            severity={severity}
            color={color}
            analysis={
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                        <span>Perfil de Síntomas</span>
                        <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">{predominant}</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-700">
                            <span>Vaciado (Obstructivo)</span>
                            <span>{voidingScore}/20</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(voidingScore/20)*100}%` }}></div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-700">
                            <span>Llenado (Irritativo)</span>
                            <span>{storageScore}/15</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${(storageScore/15)*100}%` }}></div>
                        </div>
                    </div>
                </div>
            }
            guidelineText={guideline}
            tips={[
                storageScore > 5 ? "Si predominan síntomas de llenado sin RPM significativo, considera añadir anticolinérgicos o Beta-3 agonistas." : "Evalúa siempre la Calidad de Vida (pregunta 8) para decidir la agresividad del tratamiento.",
                "Recuerda realizar tacto rectal y PSA antes de iniciar tratamiento médico."
            ]}
        />
      </div>
    </div>
  );
};

const STONECalculator: React.FC = () => {
    const [score, setScore] = useState({ sex: 0, timing: 0, race: 0, nausea: 0, hematuria: 0 });
    const total = (Object.values(score) as number[]).reduce((a, b) => a + b, 0);

    let probability = "Baja (8-9%)";
    let color: any = "green";
    let advice = "Considerar observación o ecografía si el dolor es manejable. Evitar TC si es posible para reducir radiación.";

    if (total >= 6 && total <= 9) {
        probability = "Moderada (51%)";
        color = "yellow";
        advice = "TC Baja Dosis (Low Dose CT) recomendado si no hay mejoría. Alta sospecha clínica.";
    } else if (total >= 10) {
        probability = "Alta (85-89%)";
        color = "red";
        advice = "Realizar TC Baja Dosis (Gold Standard EAU 2025) urgente para planificar intervención (MET vs Tuls/Lito).";
    }

    const ToggleBtn = ({ label, active, onClick, points }: any) => (
        <button 
            onClick={onClick}
            className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all ${active ? 'bg-amber-500 text-white border-amber-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
        >
            {label} (+{points})
        </button>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50/50">
            <div className="p-8 space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><Scale size={24}/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">STONE Score</h3>
                        <p className="text-xs text-slate-500">Predicción de Litiasis Ureteral</p>
                    </div>
                </div>
                <div className="space-y-4">
                     <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <span className="font-semibold text-slate-700 text-sm">Sexo</span>
                        <div className="flex gap-2"><ToggleBtn label="Femenino" points="0" active={score.sex===0} onClick={()=>setScore({...score, sex:0})}/><ToggleBtn label="Masculino" points="2" active={score.sex===2} onClick={()=>setScore({...score, sex:2})}/></div>
                     </div>
                     <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <span className="font-semibold text-slate-700 text-sm">Raza (Origen)</span>
                        <div className="flex gap-2"><ToggleBtn label="Negra" points="0" active={score.race===0} onClick={()=>setScore({...score, race:0})}/><ToggleBtn label="No Negra" points="3" active={score.race===3} onClick={()=>setScore({...score, race:3})}/></div>
                     </div>
                     <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <span className="font-semibold text-slate-700 text-sm">Náuseas/Vómitos</span>
                        <div className="flex gap-2"><ToggleBtn label="No" points="0" active={score.nausea===0} onClick={()=>setScore({...score, nausea:0})}/><ToggleBtn label="Sí" points="1" active={score.nausea===1} onClick={()=>setScore({...score, nausea:1})}/></div>
                     </div>
                     <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <span className="font-semibold text-slate-700 text-sm">Hematuria</span>
                        <div className="flex gap-2"><ToggleBtn label="No" points="0" active={score.hematuria===0} onClick={()=>setScore({...score, hematuria:0})}/><ToggleBtn label="Sí" points="3" active={score.hematuria===3} onClick={()=>setScore({...score, hematuria:3})}/></div>
                     </div>
                     <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <span className="font-semibold text-slate-700 text-sm">Duración Dolor</span>
                        <div className="flex gap-2"><ToggleBtn label=">24h" points="0" active={score.timing===0} onClick={()=>setScore({...score, timing:0})}/><ToggleBtn label="6-24h" points="1" active={score.timing===1} onClick={()=>setScore({...score, timing:1})}/><ToggleBtn label="<6h" points="3" active={score.timing===3} onClick={()=>setScore({...score, timing:3})}/></div>
                     </div>
                </div>
            </div>
            <div className="p-8 flex items-center justify-center bg-white lg:bg-transparent">
                 <ClinicalInsightCard 
                    title="Probabilidad de Litiasis"
                    score={total}
                    severity={probability}
                    color={color}
                    guidelineText={advice}
                    guidelineUrl="https://uroweb.org/guidelines/urolithiasis"
                    tips={[
                        "El STONE score es altamente específico en puntuaciones altas, reduciendo la necesidad de imagen en diagnósticos claros si hay limitación de recursos.",
                        "En mujeres embarazadas, la ecografía es siempre la primera línea (EAU 2025)."
                    ]}
                 />
            </div>
        </div>
    );
};

const EORTCCalculator: React.FC = () => {
    // 0=Single, 1=2-7, 2=>=8
    const [numTumors, setNumTumors] = useState(0); 
    // 0=<3cm, 1=>=3cm
    const [size, setSize] = useState(0);
    // 0=Primary, 1=<=1/yr, 2=>1/yr
    const [priorRate, setPriorRate] = useState(0);
    // 0=Ta, 1=T1
    const [stage, setStage] = useState(0);
    // 0=No, 1=Yes
    const [cis, setCis] = useState(0);
    // 0=G1, 1=G2, 2=G3
    const [grade, setGrade] = useState(0);
    // 0=Recurrence, 1=Progression
    const [viewMode, setViewMode] = useState(0); 

    // Scoring Logic (Sylvester et al. EORTC Tables)
    // Recurrence Score
    const getRecScore = () => {
        let s = 0;
        if (numTumors === 1) s += 3;
        if (numTumors === 2) s += 6;
        if (size === 1) s += 3;
        if (priorRate === 1) s += 2;
        if (priorRate === 2) s += 4;
        if (stage === 1) s += 1;
        if (cis === 1) s += 1;
        if (grade === 1) s += 1;
        if (grade === 2) s += 2; // G3
        return s;
    };

    // Progression Score
    const getProgScore = () => {
        let s = 0;
        if (numTumors === 1) s += 3;
        if (numTumors === 2) s += 3; // Cap at 3 for progression
        if (size === 1) s += 3;
        if (priorRate === 1) s += 2;
        if (priorRate === 2) s += 2; // Cap at 2
        if (stage === 1) s += 4; // T1 is heavy weight
        if (cis === 1) s += 6; // CIS is heavy weight
        if (grade === 2) s += 5; // G3 is heavy weight
        return s;
    };

    const recScore = getRecScore();
    const progScore = getProgScore();

    // Interpretation
    const getRecRisk = (s: number) => {
        if (s === 0) return { prob1: 15, prob5: 31, risk: 'Bajo' };
        if (s <= 4) return { prob1: 24, prob5: 46, risk: 'Intermedio-Bajo' };
        if (s <= 9) return { prob1: 38, prob5: 62, risk: 'Intermedio-Alto' };
        return { prob1: 61, prob5: 78, risk: 'Alto' };
    };

    const getProgRisk = (s: number) => {
        if (s === 0) return { prob1: 0.2, prob5: 0.8, risk: 'Bajo' };
        if (s <= 6) return { prob1: 1, prob5: 6, risk: 'Intermedio' };
        if (s <= 13) return { prob1: 5, prob5: 17, risk: 'Alto' };
        return { prob1: 17, prob5: 45, risk: 'Muy Alto' };
    };

    const recData = getRecRisk(recScore);
    const progData = getProgRisk(progScore);

    // EAU 2025 Recommendation Logic (Simplified)
    const getManagement = () => {
        if (progData.risk === 'Muy Alto' || (progData.risk === 'Alto' && cis === 1)) {
            return "Riesgo Muy Alto: Cistectomía Radical temprana recomendada. Si no es candidato, BCG intravesical con mantenimiento (1-3 años). Re-RTU obligatoria si T1.";
        }
        if (progData.risk === 'Alto' || recData.risk === 'Alto') {
            return "Riesgo Alto: BCG intravesical con mantenimiento (1-3 años). Considerar re-RTU si T1 o incompleta. Seguimiento estricto (Cistoscopia/Citología).";
        }
        if (recData.risk.includes('Intermedio') || progData.risk === 'Intermedio') {
            return "Riesgo Intermedio: Quimioterapia (Mitomicina C) o BCG intravesical (1 año). Individualizar según toxicidad y recurrencia previa.";
        }
        return "Riesgo Bajo: Instilación única postoperatoria de quimioterapia (Mitomicina/Gemcitabina) dentro de las primeras 6-24h. Cistoscopia a los 3 meses.";
    };

    const SelectBtn = ({ label, active, onClick }: any) => (
        <button onClick={onClick} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${active ? 'bg-orange-500 text-white border-orange-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-orange-50'}`}>{label}</button>
    );

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 bg-slate-50/50">
            <div className="p-8 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 text-orange-700 rounded-lg"><BarChart3 size={24}/></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">EORTC / EAU Risk</h3>
                        <p className="text-xs text-slate-500">Ca. Vejiga No Músculo Invasivo</p>
                    </div>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                    {[
                        { label: 'Número de Tumores', opts: ['Único', '2 - 7', '>= 8'], val: numTumors, set: setNumTumors },
                        { label: 'Tamaño Tumoral', opts: ['< 3 cm', '>= 3 cm'], val: size, set: setSize },
                        { label: 'Tasa Recurrencia Previa', opts: ['Primario', '<= 1/año', '> 1/año'], val: priorRate, set: setPriorRate },
                        { label: 'Categoría T', opts: ['Ta', 'T1'], val: stage, set: setStage },
                        { label: 'CIS Concomitante', opts: ['No', 'Sí'], val: cis, set: setCis },
                        { label: 'Grado (OMS 1973/2004)', opts: ['G1 (LG)', 'G2', 'G3 (HG)'], val: grade, set: setGrade },
                    ].map((field, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                            <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                            <div className="flex gap-1 flex-wrap">
                                {field.opts.map((opt, idx) => (
                                    <SelectBtn key={idx} label={opt} active={field.val === idx} onClick={() => field.set(idx)} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-8 bg-white xl:bg-transparent flex flex-col gap-6 items-center justify-center">
                {/* Toggle View for Result */}
                <div className="flex bg-slate-200 p-1 rounded-xl w-full max-w-sm">
                    <button onClick={() => setViewMode(0)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 0 ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500'}`}>Riesgo Recidiva</button>
                    <button onClick={() => setViewMode(1)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 1 ? 'bg-white shadow-sm text-rose-700' : 'text-slate-500'}`}>Riesgo Progresión</button>
                </div>

                {viewMode === 0 ? (
                    <ClinicalInsightCard 
                        title="Riesgo de Recidiva"
                        score={recScore}
                        scoreLabel="Puntos EORTC"
                        severity={`${recData.risk} (${recData.prob5}% a 5 años)`}
                        color={recScore < 5 ? 'green' : recScore < 10 ? 'orange' : 'red'}
                        guidelineText={getManagement()}
                        tips={["La instilación única inmediata de quimioterapia reduce la recidiva en un 35% en tumores de bajo riesgo.", "El factor más influyente en recidiva es el número de tumores y la tasa previa."]}
                        guidelineUrl="https://uroweb.org/guidelines/non-muscle-invasive-bladder-cancer"
                    />
                ) : (
                    <ClinicalInsightCard 
                        title="Riesgo de Progresión"
                        score={progScore}
                        scoreLabel="Puntos EORTC"
                        severity={`${progData.risk} (${progData.prob5}% a 5 años)`}
                        color={progScore < 2 ? 'green' : progScore < 7 ? 'yellow' : 'red'}
                        guidelineText={getManagement()}
                        tips={["El CIS y el Grado 3 son los predictores más fuertes de progresión a invasivo.", "En riesgo Muy Alto, la cistectomía temprana ofrece mejor supervivencia cáncer-específica que la diferida."]}
                        guidelineUrl="https://uroweb.org/guidelines/non-muscle-invasive-bladder-cancer"
                    />
                )}
            </div>
        </div>
    );
};

export default Calculators;