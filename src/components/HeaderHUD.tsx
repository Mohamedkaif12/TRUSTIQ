import React from 'react';
import { 
  Shield, 
  Users, 
  Zap, 
  Award, 
  Activity, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Dna,
  Radio
} from 'lucide-react';
import { GameStats } from '../types/game';
import { sound } from '../utils/audio';

interface HeaderHUDProps {
  stats: GameStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenTutorial: () => void;
  onOpenTrustDna: () => void;
  resolvedCount: number;
  totalCards: number;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  stats,
  soundEnabled,
  onToggleSound,
  onOpenTutorial,
  onOpenTrustDna,
  resolvedCount,
  totalCards
}) => {
  // Trust status color
  const getTrustColor = (trust: number) => {
    if (trust >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
    if (trust >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
  };

  const getCitizenColor = (members: number) => {
    if (members >= 850) return 'text-cyan-400';
    if (members >= 600) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        {/* Top brand line & system status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="font-heading font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 text-base sm:text-lg">
                TRUSTIQ
              </span>
              <span className="font-mono-code text-[11px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest">
                TRUST WAR MVP
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-slate-400 font-mono-code text-[11px] border-l border-slate-700/60 pl-3">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>SECTOR DEFENSE: ACTIVE</span>
              <span className="text-slate-600">|</span>
              <span>CARDS TRIAGED: {resolvedCount}/{totalCards}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenTrustDna();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 hover:text-indigo-100 transition-all text-xs font-mono-code"
              title="View your current Trust DNA archetype"
            >
              <Dna className="w-3.5 h-3.5 text-indigo-400" />
              <span>TRUST DNA</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenTutorial();
              }}
              className="p-1.5 rounded bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white transition-all"
              title="Field Manual & Rules"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onToggleSound}
              className="p-1.5 rounded bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white transition-all"
              title={soundEnabled ? 'Mute Cyber Audio' : 'Enable Cyber Audio'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* 5 Core Game Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-3">
          {/* 1. Community Members */}
          <div className="glass-panel p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-mono-code tracking-wider text-slate-400">
                Community
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-base sm:text-lg font-bold font-mono-code ${getCitizenColor(stats.communityMembers)}`}>
                  {stats.communityMembers.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono-code">/ 1,000</span>
              </div>
              {/* Health Mini Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-1 mt-1 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1 transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, (stats.communityMembers / 1000) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Investigation Credits */}
          <div className="glass-panel p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
            <div className={`p-2 rounded-md border ${stats.investigationCredits > 5 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'}`}>
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-mono-code tracking-wider text-slate-400 flex items-center justify-between">
                <span>AI Credits</span>
                <span className="text-[9px] text-amber-400/80 font-mono-code">5 CR/scan</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-bold font-mono-code text-amber-300">
                  {stats.investigationCredits}
                </span>
                <span className="text-[10px] text-slate-500 font-mono-code">CR</span>
              </div>
              {/* Credits Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-1 mt-1 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-300 h-1 transition-all duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, (stats.investigationCredits / 30) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Trust Lives */}
          <div className="glass-panel p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-mono-code tracking-wider text-slate-400">
                Trust Lives
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {[1, 2, 3].map((life) => (
                  <div
                    key={life}
                    className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${
                      life <= stats.trustLives
                        ? 'bg-rose-950/80 border-rose-500/60 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                        : 'bg-slate-900 border-slate-800 text-slate-700'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 fill-current" />
                  </div>
                ))}
              </div>
              <div className="text-[9px] text-slate-500 font-mono-code mt-1">
                {stats.trustLives} of 3 node shields
              </div>
            </div>
          </div>

          {/* 4. Trust XP */}
          <div className="glass-panel p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-md bg-violet-500/10 border border-violet-500/30 text-violet-400">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-mono-code tracking-wider text-slate-400">
                Trust XP
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-bold font-mono-code text-violet-300">
                  +{stats.trustXp}
                </span>
                <span className="text-[10px] text-slate-500 font-mono-code">XP</span>
              </div>
              <div className="text-[9px] text-violet-400/80 font-mono-code mt-0.5">
                {stats.threatsNeutralized} Threats Deflected
              </div>
            </div>
          </div>

          {/* 5. Community Trust */}
          <div className="col-span-2 sm:col-span-1 glass-panel p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-mono-code tracking-wider text-slate-400">
                Community Trust
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-base sm:text-lg font-bold font-mono-code ${
                  stats.communityTrust >= 75 ? 'text-emerald-400' : stats.communityTrust >= 40 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {stats.communityTrust}%
                </span>
                <span className={`text-[10px] px-1 py-0.2 rounded border font-mono-code ${getTrustColor(stats.communityTrust)}`}>
                  {stats.communityTrust >= 80 ? 'HIGH' : stats.communityTrust >= 50 ? 'FRAGILE' : 'COLLAPSE'}
                </span>
              </div>
              {/* Trust Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-1 mt-1 overflow-hidden">
                <div 
                  className={`h-1 transition-all duration-500 ${
                    stats.communityTrust >= 75 ? 'bg-emerald-400' : stats.communityTrust >= 40 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, stats.communityTrust))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
