import React, { useState, useEffect, useRef } from 'react';
import { CoachingTip } from '../types';
import { generateCoachingTip } from '../services/coachingService';
import PolicyManagementModule from './PolicyManagementModule';

interface SupervisorDashboardProps {
  onExit: () => void;
}

const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ onExit }) => {
  // Navigation State: 'monitor' or 'policy-db'
  const [activeTab, setActiveTab] = useState<'monitor' | 'policy-db'>('monitor');

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [tips, setTips] = useState<CoachingTip[]>([]);
  const [status, setStatus] = useState('待机');
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition (Chrome only usually)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN'; // Set to Chinese

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => (prev + finalTranscript).slice(-500)); // Keep last 500 chars context
          fetchTip(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech error", event.error);
        setStatus('音频错误');
      };
    }
  }, []);

  const fetchTip = async (newText: string) => {
    const tip = await generateCoachingTip(newText);
    if (tip) {
      setTips(prev => [tip, ...prev].slice(0, 5)); // Keep latest 5 tips
    }
  };

  const toggleSession = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus('待机');
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setStatus('实时监控中');
      setTips([]);
      setTranscript('');
      // Initial Tip
      setTips([{
        id: 'init',
        category: 'INFO',
        content: '建议开场白: "您好，我是中国人寿财险大宗业务高级主管..."',
        priority: 'HIGH'
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-mono flex flex-col">
      {/* Top Bar - Backend Style */}
      <div className="h-14 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-950 shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded flex items-center justify-center text-white">
                 <i className="fa-solid fa-server"></i>
            </div>
            <div>
                <h1 className="font-bold text-sm text-slate-100 tracking-wide uppercase">核心业务管理后台</h1>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] text-emerald-500">SYSTEM ONLINE</span>
                </div>
            </div>
          </div>
          
          <div className="h-6 w-px bg-slate-700 mx-2"></div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-900 rounded p-1 border border-slate-800">
             <button 
                onClick={() => setActiveTab('monitor')}
                className={`px-4 py-1 text-xs font-medium rounded transition-all ${activeTab === 'monitor' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <i className="fa-solid fa-headset mr-2"></i>人工坐席接管
             </button>
             <button 
                onClick={() => setActiveTab('policy-db')}
                className={`px-4 py-1 text-xs font-medium rounded transition-all ${activeTab === 'policy-db' ? 'bg-emerald-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
             >
                <i className="fa-solid fa-database mr-2"></i>保单数据录入
             </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right hidden md:block">
             <div className="text-xs text-slate-300 font-bold">Admin User</div>
             <div className="text-[10px] text-slate-500">ID: 9527</div>
           </div>
           <button onClick={onExit} className="w-8 h-8 rounded hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors flex items-center justify-center" title="安全登出">
             <i className="fa-solid fa-power-off"></i>
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Background Grid for Dashboard feeling */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
        
        {/* VIEW 1: Policy Management Database */}
        {activeTab === 'policy-db' && (
            <div className="w-full h-full relative z-10">
                <PolicyManagementModule />
            </div>
        )}

        {/* VIEW 2: Live Monitor (Original View) */}
        {activeTab === 'monitor' && (
            <div className="flex w-full h-full relative z-10">
                {/* Left: Live Data & Transcript */}
                <div className="flex-1 p-6 flex flex-col border-r border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-emerald-500 font-bold mb-1 flex items-center gap-2">
                             <i className="fa-solid fa-satellite-dish animate-pulse"></i> 呼叫中心实时监控
                        </h2>
                        <div className="text-2xl font-light text-white mt-2">极速物流集团有限公司 <span className="text-sm bg-slate-800 px-2 py-0.5 rounded text-slate-400 align-middle ml-2">Web Call</span></div>
                        <div className="text-sm text-slate-500 mt-1">当前线路: <span className="text-emerald-400 font-mono">SECURE-VOIP-001</span></div>
                    </div>
                    <button 
                        onClick={toggleSession}
                        className={`px-6 py-3 rounded-lg flex items-center gap-3 font-bold transition-all shadow-lg ${isListening ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                    >
                        <i className={`fa-solid ${isListening ? 'fa-phone-slash' : 'fa-headset'} text-xl`}></i>
                        {isListening ? '断开连接' : '接入通话'}
                    </button>
                </div>

                <div className="flex-1 bg-slate-950 rounded-xl p-4 border border-slate-800 relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 opacity-50"></div>
                    <div className="absolute top-3 right-3 text-[10px] text-slate-500 border border-slate-700 px-2 rounded">ENCRYPTED</div>
                    
                    <div className="h-full overflow-y-auto font-mono text-sm leading-relaxed p-2 space-y-2">
                        {transcript ? (
                        <p className="text-slate-300 whitespace-pre-wrap">{transcript}</p>
                        ) : (
                        <div className="h-full flex items-center justify-center text-slate-600 italic">
                            Waiting for voice stream...
                        </div>
                        )}
                    </div>
                </div>
                </div>

                {/* Right: AI Coaching */}
                <div className="w-96 bg-slate-900 p-6 flex flex-col shadow-2xl z-20">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-brain text-purple-500"></i>
                        AI 实时辅导 (Copilot)
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {tips.map((tip) => (
                        <div 
                            key={tip.id} 
                            className={`p-4 rounded-lg border-l-4 shadow-lg animate-fade-in-up bg-slate-800
                            ${tip.priority === 'HIGH' ? 'border-red-500' : 'border-blue-500'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                                ${tip.category === 'RISK' ? 'bg-red-900/50 text-red-400' : 
                                tip.category === 'TRUST' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-blue-900/50 text-blue-400'}`}>
                                {tip.category}
                            </span>
                            {tip.priority === 'HIGH' && <i className="fa-solid fa-triangle-exclamation text-red-500 text-xs animate-pulse"></i>}
                            </div>
                            <p className="text-sm text-slate-200">{tip.content}</p>
                        </div>
                        ))}
                        {tips.length === 0 && (
                        <div className="text-center mt-20 opacity-30">
                            <i className="fa-solid fa-microchip text-4xl mb-4"></i>
                            <p className="text-xs">AI 正在分析通话语义...</p>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorDashboard;