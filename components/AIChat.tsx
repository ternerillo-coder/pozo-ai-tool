
import React, { useState, useRef, useEffect } from 'react';
import { chatWithUrologistAI } from '../services/geminiService';
import { Send, User, Bot, Loader } from 'lucide-react';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hola Dr. Soy su Asistente IA especializado. Pregúnteme sobre guías, interacciones medicamentosas o casos complejos.", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    // Convert internal message format to history for API
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await chatWithUrologistAI(history, newMsg.content);

    setMessages(prev => [...prev, { role: 'model', content: response, timestamp: new Date() }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto p-4">
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-teal-600 text-white'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-slate-100 text-slate-900 rounded-tr-none' 
                : 'bg-teal-50 text-teal-900 rounded-tl-none border border-teal-100'
            }`}>
              <div className="prose prose-sm max-w-none prose-p:text-current prose-li:text-current">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              <span className="text-[10px] text-slate-500 mt-2 block opacity-80">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center">
                <Bot size={16} />
            </div>
            <div className="bg-teal-50 p-4 rounded-2xl rounded-tl-none border border-teal-100 flex items-center gap-2">
                <Loader className="animate-spin w-4 h-4 text-teal-600" />
                <span className="text-sm text-teal-900">Consultando base de datos...</span>
            </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 bg-white p-2 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-sm">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Haga una pregunta sobre Urología..."
          className="flex-1 p-3 bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          aria-label="Enviar mensaje"
          className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIChat;
