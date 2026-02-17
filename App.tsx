import React, { useMemo, useState } from 'react';
import {
  Activity,
  FlaskConical,
  Stethoscope,
  BookOpenCheck,
  FileText,
  ClipboardCheck,
  Bed,
  Copy,
  Check,
} from 'lucide-react';

type DocumentType = 'alta' | 'seguimiento' | 'pase';

interface SoapForm {
  patientName: string;
  date: string;
  diagnosis: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

const sections = [
  {
    title: 'Actividad asistencial',
    description:
      'Seguimiento de pacientes, decisiones clínicas apoyadas en evidencia y registro de la práctica diaria.',
    icon: Stethoscope,
  },
  {
    title: 'Actividad investigadora',
    description:
      'Gestión de líneas de investigación, revisión bibliográfica inteligente y generación de ideas para publicaciones.',
    icon: FlaskConical,
  },
  {
    title: 'Docencia y actualización',
    description:
      'Resumen de guías clínicas, casos para sesiones clínicas y material educativo para residentes y pacientes.',
    icon: BookOpenCheck,
  },
];

const documentTypeConfig: Record<
  DocumentType,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  alta: { label: 'Informe de alta', icon: FileText },
  seguimiento: { label: 'Seguimiento de consulta', icon: ClipboardCheck },
  pase: { label: 'Nota de pase de planta', icon: Bed },
};

const today = new Date().toISOString().slice(0, 10);

const App: React.FC = () => {
  const [documentType, setDocumentType] = useState<DocumentType>('alta');
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<SoapForm>({
    patientName: '',
    date: today,
    diagnosis: '',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  const generatedSoap = useMemo(() => {
    const { label } = documentTypeConfig[documentType];
    return `${label} (Formato SOAP)
Fecha: ${form.date || '---'}
Paciente: ${form.patientName || '---'}
Diagnóstico principal: ${form.diagnosis || '---'}

S - Subjetivo
${form.subjective || 'Sin datos registrados.'}

O - Objetivo
${form.objective || 'Sin datos registrados.'}

A - Análisis / Valoración
${form.assessment || 'Sin datos registrados.'}

P - Plan
${form.plan || 'Sin datos registrados.'}`;
  }, [documentType, form]);

  const handleFieldChange = (field: keyof SoapForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedSoap);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('No se pudo copiar al portapapeles', error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-teal-300 font-semibold">
            <Activity size={14} /> Urología avanzada
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold leading-tight">
            Aplicación dedicada a tu actividad asistencial e investigadora como urólogo
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            Un entorno único para integrar atención clínica, investigación y formación continua con soporte de IA.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          {sections.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:border-teal-400/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-500/15 text-teal-300 flex items-center justify-center mb-4">
                <Icon size={18} />
              </div>
              <h2 className="text-lg font-semibold mb-2">{title}</h2>
              <p className="text-sm text-slate-300">{description}</p>
            </article>
          ))}
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
            <h2 className="text-xl font-semibold">Generador clínico SOAP</h2>
            <p className="text-sm text-slate-300">
              Crea rápidamente informes de alta, seguimiento de consulta o nota de pase de planta en formato SOAP.
            </p>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">Tipo de documento</label>
              <div className="grid sm:grid-cols-3 gap-2">
                {(Object.keys(documentTypeConfig) as DocumentType[]).map((key) => {
                  const { label, icon: Icon } = documentTypeConfig[key];
                  const isActive = key === documentType;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDocumentType(key)}
                      className={`rounded-xl px-3 py-2 text-sm border transition-colors flex items-center justify-center gap-2 ${
                        isActive
                          ? 'bg-teal-500/20 border-teal-400 text-teal-200'
                          : 'border-white/10 text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <Icon size={14} /> {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-slate-300">Paciente</span>
                <input
                  type="text"
                  value={form.patientName}
                  onChange={(e) => handleFieldChange('patientName', e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2"
                  placeholder="Nombre y apellidos"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-slate-300">Fecha</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2"
                />
              </label>
            </div>

            <label className="space-y-1 text-sm block">
              <span className="text-slate-300">Diagnóstico principal</span>
              <input
                type="text"
                value={form.diagnosis}
                onChange={(e) => handleFieldChange('diagnosis', e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2"
                placeholder="Ej.: Cólico renal derecho por litiasis ureteral"
              />
            </label>

            {([
              ['subjective', 'S - Subjetivo'],
              ['objective', 'O - Objetivo'],
              ['assessment', 'A - Análisis / Valoración'],
              ['plan', 'P - Plan'],
            ] as [keyof SoapForm, string][]).map(([field, label]) => (
              <label key={field} className="space-y-1 text-sm block">
                <span className="text-slate-300">{label}</span>
                <textarea
                  value={form[field]}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 min-h-20"
                  placeholder={`Introduce ${label.toLowerCase()}`}
                />
              </label>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Vista previa del documento</h3>
              <button
                type="button"
                onClick={copyToClipboard}
                className="rounded-lg px-3 py-2 bg-teal-500/20 border border-teal-400 text-teal-200 text-sm inline-flex items-center gap-2"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="text-xs leading-5 whitespace-pre-wrap rounded-2xl bg-slate-950 border border-white/10 p-4 flex-1 overflow-auto">
              {generatedSoap}
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
};

export default App;
