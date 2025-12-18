import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, PenTool, Database, Shield, Zap, Sliders, ChevronRight } from 'lucide-react';
import { KnowledgeUpload } from './KnowledgeUpload';

interface SettingsProps {
    onBack: () => void;
    accessToken: string;
}

export const SettingsScreen: React.FC<SettingsProps> = ({ onBack, accessToken }) => {
    const [useBiometrics, setUseBiometrics] = useState(true);
    const [offlineMode, setOfflineMode] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [geminiModel, setGeminiModel] = useState('gemini-1.5-pro');

    const sections = [
        {
            title: "AI Configuration",
            icon: Zap,
            items: [
                {
                    label: "Gemini Model",
                    type: "select",
                    value: geminiModel,
                    options: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
                    onChange: setGeminiModel
                },
                {
                    label: "Offline Caching",
                    desc: "Cache job data for low signal areas",
                    type: "toggle",
                    value: offlineMode,
                    onChange: setOfflineMode
                },
            ]
        },
        {
            title: "Security & Access",
            icon: Shield,
            items: [
                {
                    label: "Biometric Login",
                    desc: "Use FaceID / TouchID when available",
                    type: "toggle",
                    value: useBiometrics,
                    onChange: setUseBiometrics
                },
                {
                    label: "API Key Management",
                    desc: "Manage Gemini API Credentials",
                    type: "link",
                    action: () => alert("Secure Storage Access Required")
                },
            ]
        },
        {
            title: "Interface",
            icon: PenTool,
            items: [
                {
                    label: "High Contrast Mode",
                    desc: "Increase visibility for outdoor usage",
                    type: "toggle",
                    value: highContrast,
                    onChange: setHighContrast
                },
            ]
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl font-black text-white tracking-tight">System Configuration</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6">
                        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg">
                                <section.icon className="text-cyan-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-200">{section.title}</h3>
                        </div>

                        <div className="space-y-6">
                            {section.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">{item.label}</p>
                                        {item.desc && <p className="text-xs text-slate-500">{item.desc}</p>}
                                    </div>

                                    {item.type === 'toggle' && (
                                        <button
                                            onClick={() => (item.onChange as any)(!item.value)}
                                            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${item.value ? 'bg-cyan-500' : 'bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${item.value ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    )}

                                    {item.type === 'select' && (
                                        <select
                                            value={item.value as string}
                                            onChange={(e) => (item.onChange as any)(e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                        >
                                            {(item.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    )}

                                    {item.type === 'link' && (
                                        <button onClick={item.action} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                            <ChevronRight size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center justify-between">
                <div>
                    <h4 className="text-red-400 font-bold mb-1">Danger Zone</h4>
                    <p className="text-slate-400 text-sm">Clear local cache and reset application state.</p>
                </div>
                <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold transition-all">
                    Reset App
                </button>
            </div>

        </button>
            </div >

    {/* Knowledge Base Section */ }
    < div className = "bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6" >
                 <h3 className="text-xl font-bold text-indigo-300 mb-6 flex items-center gap-2">
                    <Database size={24} /> Oscar's Knowledge Base
                 </h3>
                 <KnowledgeUpload accessToken={accessToken} />
            </div >

        </motion.div >
    );
};
