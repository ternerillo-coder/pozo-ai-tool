
import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { Cloud, Download, Upload, CheckCircle2, RefreshCw, Smartphone, Monitor, Shield, LogOut } from 'lucide-react';

interface SettingsProps {
    onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
    const [backupString, setBackupString] = useState('');
    const [importString, setImportString] = useState('');
    const [status, setStatus] = useState<{msg: string, type: 'success'|'error'|null}>({msg:'', type:null});

    const generateBackup = () => {
        const data = StorageService.exportBackup();
        setBackupString(data);
        setStatus({ msg: 'Copia de seguridad generada correctamente.', type: 'success' });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(backupString);
        setStatus({ msg: 'Código copiado al portapapeles. Envíalo a tu otro dispositivo.', type: 'success' });
    };

    const handleImport = () => {
        if (!importString) return;
        const result = StorageService.importBackup(importString);
        if (result.success) {
            setStatus({ msg: `Datos sincronizados correctamente. (Versión: ${new Date(result.timestamp).toLocaleString()})`, type: 'success' });
            // Optional: Reload to reflect changes if not reactive
            setTimeout(() => window.location.reload(), 1500);
        } else {
            setStatus({ msg: 'Código de sincronización inválido o corrupto.', type: 'error' });
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto animate-slide-up">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Configuración y Sincronización</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cloud Sync Section */}
                <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                     
                     <div className="relative z-10 flex items-start gap-4 mb-6">
                        <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-500/30">
                            <Cloud size={32} className="text-teal-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Sincronización Multi-Dispositivo</h3>
                            <p className="text-slate-400 mt-1 max-w-xl">
                                Mantén tus alertas, agenda y notas sincronizadas entre tu PC de Trabajo y PC Personal. 
                                Al no utilizar un servidor central por privacidad, usa este método seguro de transferencia.
                            </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Export */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                            <h4 className="font-bold flex items-center gap-2 mb-4 text-teal-300">
                                <Monitor size={20} /> PC Origen (Trabajo)
                            </h4>
                            <p className="text-sm text-slate-400 mb-4">Genera un código de tus datos actuales para llevarlos a otro equipo.</p>
                            
                            {!backupString ? (
                                <button 
                                    onClick={generateBackup}
                                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                    <Upload size={18} /> Generar Copia
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-black/30 p-3 rounded-lg text-xs font-mono break-all border border-white/10 max-h-24 overflow-y-auto">
                                        {backupString}
                                    </div>
                                    <button 
                                        onClick={handleCopy}
                                        className="w-full py-2 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <CheckCircle2 size={18} /> Copiar Código
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Import */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                             <h4 className="font-bold flex items-center gap-2 mb-4 text-purple-300">
                                <Smartphone size={20} /> PC Destino (Casa)
                            </h4>
                            <p className="text-sm text-slate-400 mb-4">Pega aquí el código generado en el otro dispositivo para restaurar todo.</p>
                            <input 
                                type="text"
                                value={importString}
                                onChange={(e) => setImportString(e.target.value)}
                                placeholder="Pegar código de sincronización..."
                                className="w-full bg-black/30 border border-white/20 rounded-xl p-3 text-sm text-white focus:border-purple-500 focus:outline-none mb-4"
                            />
                            <button 
                                onClick={handleImport}
                                disabled={!importString}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <Download size={18} /> Sincronizar Ahora
                            </button>
                        </div>
                     </div>

                     {status.msg && (
                         <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/30' : 'bg-red-500/20 text-red-200 border border-red-500/30'}`}>
                             {status.type === 'success' ? <CheckCircle2 /> : <RefreshCw />}
                             <span className="font-medium">{status.msg}</span>
                         </div>
                     )}
                </div>

                {/* Account Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-slate-400" /> Cuenta y Seguridad
                    </h3>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl">👨‍⚕️</div>
                        <div>
                            <p className="font-bold text-slate-900">Dr. Usuario Urología</p>
                            <p className="text-sm text-slate-500">Licencia Profesional Activa</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onLogout}
                        className="w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <LogOut size={18} /> Cerrar Sesión en este dispositivo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
