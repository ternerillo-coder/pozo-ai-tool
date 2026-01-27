import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Volume2, Activity } from 'lucide-react';

const LiveConsultation: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Listo para conectar');
  
  // Refs for audio handling to avoid re-renders
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopSession();
    };
  }, []);

  const stopSession = () => {
    if (sessionRef.current) {
        sessionRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) { console.error("Error closing output audio", e); }
    }
    
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
      try {
        inputContextRef.current.close();
      } catch (e) { console.error("Error closing input audio", e); }
    }
    
    // Stop all playing sources to prevent errors
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    
    if (mountedRef.current) {
        setConnected(false);
        setStatus('Desconectado');
    }
  };

  const startSession = async () => {
    try {
      stopSession(); // Ensure clean state
      setStatus('Conectando...');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      
      audioContextRef.current = outputAudioContext;
      inputContextRef.current = inputAudioContext;
      
      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const analyser = inputAudioContext.createAnalyser();
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            if (!mountedRef.current) return;
            setConnected(true);
            setStatus('Sesión en Vivo Activa');
            
            const source = inputAudioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              if (inputAudioContext.state === 'closed' || !mountedRef.current) return;

              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              let binary = '';
              const bytes = new Uint8Array(int16.buffer);
              const len = bytes.byteLength;
              for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
              
              sessionPromise.then((session) => {
                  if(mountedRef.current) session.sendRealtimeInput({ media: { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (!mountedRef.current) return;
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               if (!outputAudioContext || outputAudioContext.state === 'closed') return;

               const binaryString = atob(base64Audio);
               const len = binaryString.length;
               const bytes = new Uint8Array(len);
               for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
               
               const dataInt16 = new Int16Array(bytes.buffer);
               const frameCount = dataInt16.length; 
               const buffer = outputAudioContext.createBuffer(1, frameCount, 24000);
               const channelData = buffer.getChannelData(0);
               for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i] / 32768.0;
               
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
               const source = outputAudioContext.createBufferSource();
               source.buffer = buffer;
               source.connect(outputNode);
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += buffer.duration;
               sourcesRef.current.add(source);
               
               source.onended = () => sourcesRef.current.delete(source);
            }
          },
          onclose: () => { if(mountedRef.current) { setConnected(false); setStatus('Sesión Finalizada'); } },
          onerror: (err) => { console.error(err); if(mountedRef.current) { setStatus('Error de conexión'); setConnected(false); } }
        },
        config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: "Eres un asistente experto en Urología. Responde concisamente en español."
        }
      });
      sessionRef.current = sessionPromise;
    } catch (e) {
      console.error(e);
      setStatus('Fallo al conectar');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-full flex flex-col items-center justify-center animate-slide-up">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Consultor Médico en Vivo</h2>
        <p className="text-lg text-slate-700">Conversación de voz en tiempo real con Gemini 2.5</p>
      </div>

      <div className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-700 ${connected ? 'bg-teal-100 shadow-[0_0_60px_rgba(20,184,166,0.3)]' : 'bg-slate-100'}`}>
        {connected && (
             <>
                <div className="absolute inset-0 rounded-full border-4 border-teal-500 opacity-20 animate-pulse-soft"></div>
                <div className="absolute inset-0 rounded-full border-2 border-teal-400 opacity-40 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
             </>
        )}
        <div className="z-10 text-center transition-transform duration-300 transform hover:scale-105">
            {connected ? <Activity className="w-24 h-24 text-teal-600 animate-pulse" /> : <Volume2 className="w-24 h-24 text-slate-400" />}
        </div>
      </div>

      <div className="mt-12 space-y-4 text-center">
        <div className={`text-xl font-medium transition-colors duration-300 ${connected ? 'text-teal-700' : 'text-slate-500'}`}>{status}</div>
        {!connected ? (
            <button onClick={startSession} className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:scale-105 flex items-center gap-3">
                <Mic size={24} /> Iniciar Consulta
            </button>
        ) : (
            <button onClick={stopSession} className="bg-red-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-600 transition-all shadow-xl hover:scale-105 flex items-center gap-3">
                <MicOff size={24} /> Terminar Sesión
            </button>
        )}
      </div>
    </div>
  );
};

export default LiveConsultation;