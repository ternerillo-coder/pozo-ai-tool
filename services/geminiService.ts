
import { GoogleGenAI, Type, Modality } from "@google/genai";

// --- 1. Clinical & General Text Generation (Gemini 2.5 Flash for speed, 3 Pro for complex) ---

export const generateClinicalNote = async (prompt: string, complex: boolean = false): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelId = complex ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "Eres un experto asistente urólogo. Genera documentación clínica estrictamente en TEXTO PLANO (Plain Text). ESTILO: Historia Clínica Electrónica (similar a Mambrino XXI). PROHIBIDO USAR MARKDOWN (nada de negritas '**', nada de cursivas, nada de símbolos extraños). Usa saltos de línea para separar secciones. El objetivo es que el texto se pueda copiar y pegar directamente en un software médico antiguo. Usar mayúsculas SOLO para los títulos de las secciones. El contenido del cuerpo debe usar gramática estándar (tipo oración).",
        temperature: 0.2, // Lower temperature for very structured, factual outputs
      }
    });
    return response.text || "Error al generar la nota.";
  } catch (error) {
    console.error("Clinical Note Gen Error:", error);
    return "Error al generar la nota clínica. Por favor, verifica tu conexión e inténtalo de nuevo.";
  }
};

export const chatWithUrologistAI = async (history: { role: string, content: string }[], newMessage: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      config: {
        systemInstruction: `CONTEXTO TEMPORAL OBLIGATORIO (RÉGIMEN ESTRICTO):
- HOY ES: 2 de Diciembre de 2025.
- ASUNCIÓN CRÍTICA: Las Guías Clínicas 2025 (EAU y AUA) YA ESTÁN PUBLICADAS.

REGLA DE ORO: ***IMPORTANTE***, el formato de respuesta del chat Urólogo IA debe estar basado en estas instrucciones: ROL Y ESTILO GENERAL

- Eres “UroEvidence Coach”, un asistente especializado que combina tres perfiles:
  1. Urólogo senior con amplia experiencia clínica.
  2. Metodólogo experto en medicina basada en evidencia.
  3. Docente académico.

- Escribes en español, tono formal y estructurado.
- Tu objetivo principal es ayudar a tomar decisiones clínicas basadas en la mejor evidencia (2020-2025).

1. PRIORIDAD DE FUENTES Y ACTUALIZACIÓN (CRÍTICO)
   - Prioridad ABSOLUTA: Guías EAU 2025 y AUA 2025.
   - Bibliografía: Prioriza 2020-2025.

10. FORMATO DE SALIDA (CRÍTICO - NO LATEX)
- PROHIBIDO usar formato LaTeX o MathJax (ej. $\alpha$, $\beta_{1a}$) para texto médico.
- USA CARACTERES UNICODE ESTÁNDAR para símbolos griegos (α, β, γ).
- Ejemplo Correcto: "Bloqueantes alfa-1" o "Bloqueantes α1".
`,
      }
    });
    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Lo siento, encontré un error al procesar tu solicitud. Por favor, intenta reformular la pregunta.";
  }
};

// --- 2. Research with Search Grounding (Gemini 2.5 Flash + Google Search) ---

export const researchRecentPapers = async (): Promise<{ text: string, sources: any[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Actúa como un urólogo académico. FECHA ACTUAL: Diciembre 2025. Busca y resume los 3 artículos de investigación urológica más importantes publicados recientemente (2024-2025). Prioriza Guías EAU/AUA 2025 y RCTs recientes. Formato: Título, Autores, Metodología, Hallazgos, Implicaciones.",
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "No se encontraron investigación relevante.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .filter((c: any) => c.web?.uri && c.web?.title)
      .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

    return { text, sources };
  } catch (error) {
    console.error("Research Error:", error);
    return { text: "Error de conexión al recuperar datos de investigación.", sources: [] };
  }
};

export const searchEAUGuidelines = async (query: string): Promise<{ text: string, sources: any[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Búsqueda más flexible para asegurar resultados
    const prompt = `Actúa como un Auditor de Calidad Clínica. FECHA: Diciembre 2025.
    Busca información en las Guías Clínicas de la Asociación Europea de Urología (EAU Guidelines) sobre: "${query}".
    Prioriza las versiones más recientes disponibles (2024 o 2025).
    
    Objetivo: Extraer "Recomendaciones Clave" con Nivel de Evidencia (LE) y Grado de Recomendación (GR).
    Si existen, describe los "Algoritmos de Decisión" o diagramas de flujo propuestos para el manejo de esta patología.
    Responde en español de forma estructurada.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "No se encontraron datos específicos en las guías.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .filter((c: any) => c.web?.uri && c.web?.title)
      .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

    return { text, sources };
  } catch (error) {
    console.error("EAU Guidelines Error:", error);
    return { text: "Error al consultar Guías EAU.", sources: [] };
  }
};

export const searchPubMed = async (query: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
        Actúa como un Investigador Médico Senior realizando una REVISIÓN SISTEMÁTICA DEL ESTADO DEL ARTE.
        Tema de búsqueda: "${query}".
        FECHA ACTUAL: Diciembre 2025.
        
        CRITERIOS DE BÚSAVQUEDA EXHAUSTIVA:
        1. CANTIDAD: Debes encontrar y listar entre 10 y 15 artículos científicos relevantes.
        2. TIPO DE ESTUDIO (Jerarquía): Prioriza estrictamente Meta-análisis, Revisiones Sistemáticas y Ensayos Clínicos Aleatorizados (RCTs). Incluye estudios observacionales solo si son de alto impacto.
        3. PERIODO: Últimos 5 años (2020-2025). Prioriza lo más reciente.
        
        INSTRUCCIONES DE FORMATO (CRÍTICO PARA PARSEO):
        Devuelve los artículos separados EXACTAMENTE por el delimitador "|||". No numeres la lista fuera del bloque.
        
        Formato de cada bloque:
           TITULO: [Título completo]
           AUTORES: [Primer autor et al.]
           REVISTA: [Nombre Revista, Año, Nivel de Evidencia si aplica]
           RESUMEN: [Resumen técnico de los hallazgos principales y estadística clave en español]
           URL: [Enlace al DOI o PubMed]
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        return response.text || "";
    } catch (error) {
        console.error("PubMed Search Error", error);
        return "";
    }
}

export const chatWithPapers = async (papersContext: string, userQuery: string, history: any[]): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chat = ai.chats.create({
            model: 'gemini-3-pro-preview',
            history: history,
            config: {
                systemInstruction: `
                Eres un Analista de Investigación Urológica Experto.
                Tienes acceso a un conjunto amplio de 10-15 Abstracts/Artículos proporcionados en el contexto (Estado del Arte).
                
                TUS OBJETIVOS:
                1. Responder a la pregunta del usuario sintetizando la información de MÚLTIPLES estudios del contexto.
                2. Realizar un "Meta-análisis cualitativo" rápido: busca consenso y disenso entre los autores listados.
                3. Citar explícitamente los estudios (ej. "Como demuestra Smith et al. (2024)...").
                4. Evaluar la calidad de la evidencia presentada (ej. "La mayoría son retrospectivos, por lo que...").
                
                CONTEXTO DE LOS PAPERS:
                ${papersContext}
                `
            }
        });

        const result = await chat.sendMessage({ message: userQuery });
        return result.text || "No pude analizar los documentos.";
    } catch (error) {
        console.error("Chat Papers Error:", error);
        return "Error al analizar los documentos.";
    }
}


// --- 3. Image Analysis ---

export const analyzeMedicalImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: `Eres un urólogo experto. Analiza esta imagen médica. ${prompt}. Responde en español. DISCLAIMER: Esto es una ayuda diagnóstica IA, requiere validación médica.` }
        ]
      }
    });
    return response.text || "Falló el análisis de imagen.";
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return "Error al analizar la imagen. Inténtalo de nuevo.";
  }
};

// --- 4. Teaching Content ---

export const generateTeachingContent = async (
  toolType: string, 
  context: string, 
  fileData?: { data: string, mimeType: string }
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let systemInstruction = "Eres un Profesor Titular de Urología y Diseñador Instruccional Senior. FECHA: Diciembre 2025. ";
    
    switch (toolType) {
        case 'ABSTRACT': systemInstruction += "Genera un Abstract estructurado para congreso."; break;
        case 'SESSION': systemInstruction += "Crea un esquema para Sesión Clínica con bibliografía reciente."; break;
        case 'EXAM': systemInstruction += "Crea preguntas tipo test basadas en guías."; break;
        case 'CLINICAL_CASE': systemInstruction += "Genera un CASO CLÍNICO DESAFIANTE. Empieza presentando el caso y detente antes de dar la solución."; break;
        case 'PRESENTATION': 
            systemInstruction += `
            ACTÚA COMO UN EXPERTO PONENTE EN CONGRESOS INTERNACIONALES DE UROLOGÍA.
            SI SE ADJUNTA UN ARCHIVO, RESÚMELO Y TRANSFÓRMALO EN DIAPOSITIVAS PROFESIONALES.
            
            FORMATO OBLIGATORIO PARA CADA DIAPOSITIVA (Usa exactamente estas etiquetas para permitir el parseo):
            [SLIDE]
            [TITLE]: Título de la diapositiva
            [CONTENT]: 
            - Bullet 1
            - Bullet 2
            - Bullet 3
            [VISUAL]: Descripción detallada de la imagen, tabla o gráfico sugerido.
            [NOTES]: Guion completo del orador.
            [DESIGN]: Sugerencias de colores, transiciones y layout.
            [PEARL]: Mensaje clave o frase de impacto.
            [BIBLIO]: Referencias Vancouver (EAU 2025).
            
            REGLA DE EXTENSIÓN:
            - '10 min': 6-8 diapositivas.
            - '20 min': 12-18 diapositivas.
            - '45-60 min': 30-45 diapositivas (Profundización máxima).
            
            Genera un contenido de ALTA DENSIDAD CIENTÍFICA pero visualmente equilibrado.
            `; 
            break;
        default: systemInstruction += "Genera contenido educativo médico.";
    }

    const contents: any = [];
    
    if (fileData) {
        const base64Data = fileData.data.includes(',') ? fileData.data.split(',')[1] : fileData.data;
        contents.push({
            inlineData: {
                data: base64Data,
                mimeType: fileData.mimeType
            }
        });
    }
    
    contents.push({ text: context });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: contents },
      config: { 
        systemInstruction, 
        temperature: 0.6,
      }
    });

    return response.text || "Error generando contenido.";
  } catch (error) {
    console.error("Teaching Gen Error:", error);
    return "Error al generar contenido docente.";
  }
};

export const evaluateClinicalCase = async (caseContext: string, userAnswer: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `CASO ORIGINAL:\n${caseContext}\n\nRESPUESTA USUARIO:\n${userAnswer}`,
            config: {
                systemInstruction: "Evalúa la respuesta del residente (0-10), da el diagnóstico correcto y explica según Guías EAU 2025.",
                temperature: 0.3
            }
        });
        return response.text || "Error al evaluar.";
    } catch (error) {
        console.error("Eval Error:", error);
        return "Error en la evaluación.";
    }
};

// --- 5. Image Editing ---

export const editMedicalImage = async (base64Image: string, editPrompt: string): Promise<string | null> => {
  try {
     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
     const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash-image',
       contents: {
         parts: [
           { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
           { text: editPrompt }
         ]
       }
     });

     for (const part of response.candidates?.[0]?.content?.parts || []) {
       if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
     }
     return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    return null;
  }
};

// --- 6. Anatomy/Visual Gen (Gemini 3 Pro Image) ---

export const generateAnatomyImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Medical illustration: ${prompt}. Anatomically correct, educational style.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    console.error("Anatomy Gen Error:", error);
    throw error;
  }
};

export const generateVisualContent = async (topic: string, format: string, aspectRatio: string = "1:1", stylePreset: string = ""): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let promptDetail = format === 'Infografía' 
        ? `Medical Infographic about "${topic}". Clean, informative layout, medical blue palette. Text must be legible.` 
        : `Medical Decision Flowchart/Algorithm about "${topic}". Professional, white background, high contrast text.`;

    if (stylePreset && stylePreset !== 'Ninguno') {
        promptDetail += ` Visual Style: ${stylePreset}.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: promptDetail }] },
      config: { 
        imageConfig: { 
          aspectRatio: (aspectRatio as any) || "1:1" 
        } 
      },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) {
    console.error("Visual Gen Error:", error);
    throw error;
  }
};

export const generateResearchMap = async (topic: string): Promise<string | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
        Create a detailed 'Knowledge Graph' or 'Citation Network Map' (style of ResearchRabbit) about the topic: "${topic}".
        
        VISUAL REQUIREMENTS:
        - White background, professional scientific look.
        - Central nodes: Seminal/Foundational papers (labeled with Author/Year, e.g., 'Smith 2015').
        - Peripheral nodes: Recent 2024-2025 papers connecting to the center.
        - Use colored lines to show connections (citations).
        - Clusters: Group by sub-themes (e.g., Diagnosis, Treatment, Outcomes).
        - Text MUST BE LEGIBLE. High contrast.
        - Title at the top: 'Estado del Arte: ${topic}'.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "16:9" } },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        return null;
    } catch (error) {
        console.error("Research Map Error:", error);
        throw error; // Let UI handle the error
    }
};

// --- 8. OPEN EVIDENCE / FAST CHECK ---

export const consultEAUFastCheck = async (query: string): Promise<{pearl: string, evidence: string, sources: string} | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // OPEN EVIDENCE STYLE PROMPT
        // Searches broadly for high-quality evidence, prioritizing guidelines but not limited to strict "2025" string matching if unavailable.
        const prompt = `
        ACTÚA COMO UN MOTOR DE EVIDENCIA MÉDICA (tipo Open Evidence).
        Consulta del usuario: "${query}".
        
        REALIZA UNA BÚSQUEDA EXHAUSTIVA EN: Guías Clínicas (EAU, AUA, NCCN) y Literatura Reciente (2023-2025).
        
        Objetivo: Responder con certeza clínica y fuentes.
        
        Devuelve JSON PURO (sin markdown):
        {
            "pearl": "La respuesta directa y concisa en 1-2 frases (La Perla Clínica).",
            "evidence": "Explicación detallada justificando la respuesta con datos (HR, p-values, grados de recomendación si existen).",
            "sources": "Lista de Guías o Artículos específicos encontrados (ej. EAU Guidelines 2024, EAU Pocket 2025, AUA 2023)."
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        if (response.text) {
             let cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
             const result = JSON.parse(cleanText);
             // Normalize keys in case model drifts
             return {
                 pearl: result.pearl || result.answer || "Sin respuesta concisa.",
                 evidence: result.evidence || result.shield || result.explanation || "Sin detalle.",
                 sources: result.sources || result.reference || "Fuentes generales."
             };
        }
        return null;
    } catch (error) {
        console.error("Evidence Check Error", error);
        return null;
    }
}

// --- 9. News Fetcher ---

export const fetchUrologyNews = async (): Promise<{title: string, time: string, tag: string, url: string}[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Busca 4 noticias recientes de Urología (últimas 48h).
        Devuelve un array JSON PURO (sin markdown):
        [{"title": "Titular", "time": "hace X h", "tag": "Tema", "url": "http..."}]
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        if (response.text) {
            let cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanText);
            if (Array.isArray(parsed)) return parsed.slice(0, 4);
        }
        return [];
    } catch (error) {
        console.error("News Fetch Error", error);
        return [];
    }
}
