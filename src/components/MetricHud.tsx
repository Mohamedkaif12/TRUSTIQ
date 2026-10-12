import React from 'react';
import { 
  Award, 
  ShieldCheck, 
  Zap, 
  Users, 
  Radio, 
  ShieldAlert, 
  HeartHandshake,
  AlertOctagon,
  Sparkles,
  Cpu
} from 'lucide-react';
import { PlayerState, CommunityState } from '../types';

interface MetricHudProps {
  player: PlayerState;
  community?: CommunityState;
}

export const MetricHud: React.FC<MetricHudProps> = ({ player, community }) => {
  const commTrust = community?.community_trust ?? player.community_trust;
  const population = community?.population ?? player.community_population;
  const exposure = community?.exposure ?? player.community_exposure;
  const harmPrevented = community?.harm_prevented ?? 0;
  const harmCaused = community?.harm_caused ?? 0;

  return (
    <div className="w-full space-y-3">
      {/* Simulation Disclaimer Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[10px] font-mono-code text-slate-500">
        <div className="flex items-center gap-2">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span className="text-cyan-400 font-bold uppercase">CYBERSECURITY SIMULATION TELEMETRY</span>
          <span className="hidden sm:inline text-slate-600">//</span>
          <span className="hidden sm:inline text-slate-400">All community impact metrics represent a dynamic game simulation</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] bg-slate-900 border border-slate-800 text-slate-400 uppercase tracking-widest font-bold">
          GAME SIMULATION
        </span>
      </div>

      {/* Main Command-Center Metric HUD */}
      <div className="w-full glass-panel border border-cyan-500/20 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        {/* Top glowing scan line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

        {/* Grid of the 6 key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          
          {/* 1. Player Level & Rank */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex items-center gap-3 relative group hover:border-indigo-500/40 transition-all">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono-code uppercase tracking-wider text-slate-400 truncate">
                Player Level
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono-code text-indigo-300">
                  LVL {player.level}
                </span>
                <span className="text-[10px] text-indigo-400 font-mono-code">AGENT</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono-code truncate">
                {player.name}
              </div>
            </div>
          </div>

          {/* 2. Trust Score (0–1000) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex items-center gap-3 relative group hover:border-cyan-500/40 transition-all">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
                Trust Score
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono-code text-cyan-300">
                  {player.trust_score}
                </span>
                <span className="text-[10px] text-cyan-500 font-mono-code">/ 1000 PTS</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono-code">
                Evaluated score
              </div>
            </div>
          </div>

          {/* 3. Investigation Credits (Starts at 30) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex items-center gap-3 relative group hover:border-amber-500/40 transition-all">
            <div className={`p-2.5 rounded-lg border ${
              player.investigation_credits >= 6
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
                Credits
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono-code text-amber-300">
                  {player.investigation_credits}
                </span>
                <span className="text-[10px] text-slate-500 font-mono-code">/ 30 CR</span>
              </div>
              <div className="text-[10px] text-amber-400/80 font-mono-code">
                Forensic reserve
              </div>
            </div>
          </div>

          {/* 4. Community Trust (0–100%) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex items-center gap-3 relative group hover:border-emerald-500/40 transition-all">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
                Comm. Trust
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl sm:text-2xl font-black font-mono-code ${
                  commTrust >= 75 ? 'text-emerald-400' : commTrust >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {commTrust}%
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono-code">
                Pop: {population} citizens
              </div>
            </div>
          </div>

          {/* 5. Simulated Exposure */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex items-center gap-3 relative group hover:border-rose-500/40 transition-all">
            <div className={`p-2.5 rounded-lg border ${
              exposure === 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
                Exposure
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl sm:text-2xl font-black font-mono-code ${
                  exposure === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {exposure}
                </span>
                <span className="text-[10px] text-slate-500 font-mono-code">CITIZENS</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono-code">
                {exposure === 0 ? 'Zero breaches' : 'Active breach reach'}
              </div>
            </div>
          </div>

          {/* 6. Harm Prevented / Shielded */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex items-center gap-3 relative group hover:border-sky-500/40 transition-all">
            <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono-code uppercase tracking-wider text-slate-400">
                Harm Prevented
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-mono-code text-sky-300">
                  {harmPrevented}
                </span>
                <span className="text-[10px] text-slate-500 font-mono-code">SHIELDED</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono-code">
                Harm caused: {harmCaused}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
