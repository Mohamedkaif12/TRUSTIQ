import React from 'react';
import { 
  Shield, 
  ArrowRight, 
  Eye, 
  Search, 
  Cpu, 
  AlertTriangle, 
  BookOpen, 
  Sparkles,
  Lock,
  Swords,
  Map,
  CreditCard,
  Globe,
  Mic,
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HomePageProps {
  onStartGame: () => void;
  onExploreDna: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartGame, onExploreDna }) => {
  const steps = [
    {
      step: '01',
      title: 'SEE',
      icon: <Eye className="w-5 h-5 text-cyan-400" />,
      desc: 'Intercept incoming broadcasts, bank alerts, scheme announcements, and viral forwards in real time.',
      accent: 'border-cyan-500/30 bg-cyan-950/20'
    },
    {
      step: '02',
      title: 'INVESTIGATE',
      icon: <Search className="w-5 h-5 text-indigo-400" />,
      desc: 'Deploy limited AI Investigation Credits to extract core claims, inspect manipulation signals, and measure risk.',
      accent: 'border-indigo-500/30 bg-indigo-950/20'
    },
    {
      step: '03',
      title: 'DECIDE',
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
      desc: 'Choose to ALLOW, VERIFY, HOLD, CONTAIN, or ESCALATE based on evidence and strategic trade-offs.',
      accent: 'border-amber-500/30 bg-amber-950/20'
    },
    {
      step: '04',
      title: 'CONSEQUENCE',
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      desc: 'Witness instant ripple effects on 1,000 community citizens: protected lives, scammed victims, or false alarms.',
      accent: 'border-rose-500/30 bg-rose-950/20'
    },
    {
      step: '05',
      title: 'LEARN',
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      desc: 'Synthesize your behavioral patterns into a persistent Trust DNA cognitive archetype and eliminate blindspots.',
      accent: 'border-emerald-500/30 bg-emerald-950/20'
    }
  ];

  const zones = [
    { level: 1, title: 'ROOKIE ZONE', threat: 'UPI & Phishing', icon: <CreditCard className="w-4 h-4 text-emerald-400" />, border: 'border-emerald-500/40', tag: 'STARTER' },
    { level: 2, title: 'URBAN THREAT', threat: 'Fake Schemes', icon: <Globe className="w-4 h-4 text-sky-400" />, border: 'border-sky-500/40', tag: '50 XP' },
    { level: 3, title: 'DEEP FAKE', threat: 'AI Voice Cloning', icon: <Mic className="w-4 h-4 text-violet-400" />, border: 'border-violet-500/40', tag: '120 XP' },
    { level: 4, title: 'PSYOPS', threat: 'Influence Networks', icon: <Target className="w-4 h-4 text-amber-400" />, border: 'border-amber-500/40', tag: '220 XP' },
    { level: 5, title: 'INFILTRATION', threat: 'Internal Compromise', icon: <Eye className="w-4 h-4 text-rose-400" />, border: 'border-rose-500/40', tag: '350 XP' },
    { level: 6, title: 'TRUST WAR', threat: 'Multi-Vector Crisis', icon: <Swords className="w-4 h-4 text-red-400" />, border: 'border-red-500/60 bg-red-950/20', tag: 'FINAL BOSS' }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-10 px-4 sm:px-6 max-w-7xl mx-auto cyber-grid-bg relative">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
        {/* Tactical status pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono-code text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="tracking-widest uppercase">CAMPAIGN MODE ACTIVE // 6 PROGRESSIVE ZONES</span>
        </div>

        {/* Brand Main Title */}
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-7xl font-black font-heading tracking-tight text-white">
            TRUSTIQ
          </h1>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 uppercase">
            TRUST WAR
          </h2>
        </div>

        {/* Tagline */}
        <div className="text-lg sm:text-xl font-mono-code font-bold text-cyan-300/90 tracking-wide">
          "Pause. Investigate. Decide."
        </div>

        {/* Short core philosophical explanation */}
        <div className="max-w-2xl mx-auto p-5 rounded-2xl glass-panel border border-slate-700/60 shadow-xl relative">
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed italic">
            "Information doesn't become dangerous only when it is false. It becomes dangerous when people act before they investigate."
          </p>
        </div>

        {/* Call to Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-mono-code font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] active:scale-95"
          >
            <Map className="w-5 h-5 text-slate-950" />
            <span>DEPLOY TO MISSION MAP</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onExploreDna();
            }}
            className="w-full sm:w-auto px-6 py-4 rounded-xl glass-panel border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-white font-mono-code text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>EXPLORE TRUST DNA</span>
          </button>
        </div>
      </div>

      {/* ── CAMPAIGN PROGRESSION STRIP ── */}
      <div className="mt-12 sm:mt-16 max-w-6xl mx-auto w-full">
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-[10px] font-mono-code uppercase tracking-widest text-cyan-400">
                LEVEL PROGRESSION ARCHITECTURE
              </div>
              <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
                <span>CAMPAIGN ZONES // UNLOCK BY COMBAT XP</span>
              </h3>
            </div>
            <button
              onClick={() => { sound.playClick(); onStartGame(); }}
              className="text-xs font-mono-code text-cyan-300 hover:text-white flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>VIEW FULL WORLD MAP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {zones.map((z) => (
              <div
                key={z.level}
                onClick={() => { sound.playClick(); onStartGame(); }}
                className={`p-3 rounded-xl border ${z.border} bg-slate-900/60 hover:bg-slate-800/80 cursor-pointer transition-all flex flex-col justify-between group`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono-code text-slate-400 font-bold">L{z.level}</span>
                  <div className="p-1 rounded bg-slate-950 border border-slate-800">
                    {z.icon}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-heading font-black text-white group-hover:text-cyan-300 transition-colors">
                    {z.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono-code line-clamp-1">
                    {z.threat}
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono-code">
                  <span className="text-slate-500">GATE</span>
                  <span className="text-cyan-400 font-bold">{z.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="mt-12 sm:mt-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="text-xs font-mono-code uppercase tracking-widest text-cyan-400 mb-1">
            OPERATIONAL PROTOCOL
          </div>
          <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
            HOW THE GAME WORKS
          </h3>
          <div className="text-xs sm:text-sm font-mono-code text-slate-400 mt-2 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-cyan-300 font-bold">SEE</span>
            <span className="text-slate-600">→</span>
            <span className="text-indigo-300 font-bold">INVESTIGATE</span>
            <span className="text-slate-600">→</span>
            <span className="text-amber-300 font-bold">DECIDE</span>
            <span className="text-slate-600">→</span>
            <span className="text-rose-300 font-bold">CONSEQUENCE</span>
            <span className="text-slate-600">→</span>
            <span className="text-emerald-300 font-bold">LEARN</span>
          </div>
        </div>

        {/* 5-Step Process Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${item.accent} backdrop-blur-md flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/50 transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono-code text-xs text-slate-500 font-bold">
                  {item.step}
                </span>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  {item.icon}
                </div>
              </div>

              <div>
                <h4 className="text-base font-heading font-black text-white mb-1.5 tracking-wide">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono-code text-slate-500">
                <span>PHASE PROTOCOL</span>
                <span className="text-cyan-400">READY</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-14 pt-6 border-t border-slate-800/80 text-center text-xs font-mono-code text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>TRUSTIQ — AI DIGITAL TRUST SERIOUS GAME ENGINE</div>
        <div className="flex items-center gap-3">
          <span>FASTAPI BACKEND</span>
          <span>•</span>
          <span>SQLITE CAMPAIGN STORAGE</span>
          <span>•</span>
          <span>REACT COMBAT HUD</span>
        </div>
      </div>
    </div>
  );
};
