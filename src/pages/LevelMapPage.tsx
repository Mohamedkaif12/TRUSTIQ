import React, { useState } from 'react';
import {
  Shield, Lock, CheckCircle2, Zap, Star, ChevronRight,
  Crosshair, Radio, AlertTriangle, Trophy, Swords,
  Globe, Mic, CreditCard, Target, ArrowRight, Eye, RefreshCw
} from 'lucide-react';
import { PlayerState, CommunityState } from '../types';
import { sound } from '../utils/audio';

interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  threat: string;
  iconName: string;
  color: string;
  borderColor: string;
  scenarioIds: string[];
  xpRequired: number;
  missionsRequired: number;
  lore: string;
}

interface LevelMapPageProps {
  player: PlayerState;
  community?: CommunityState;
  onStartLevel: (levelId: number, scenarioId?: string) => void;
  onViewResults: () => void;
  onBackToDashboard: () => void;
  onResetCampaign?: () => void;
}

const GAME_LEVELS: LevelConfig[] = [
  {
    id: 1, title: 'SIGNAL SCOUT', subtitle: 'Level 1 — Phishing & UPI Traps',
    description: 'First perimeter deployment. Intercept high-velocity UPI reverse collect traps and urgent refund phishing links targeting ordinary citizens.',
    threat: 'UPI Traps & Phishing Links', iconName: 'CreditCard',
    color: 'text-emerald-400', borderColor: 'border-emerald-500/40',
    scenarioIds: ['scenario-1', 'scenario-2'], xpRequired: 0, missionsRequired: 0,
    lore: 'Jamtara syndicate cells targeting Sector Alpha. Secure the community payment nodes.'
  },
  {
    id: 2, title: 'SOCIAL TRAP', subtitle: 'Level 2 — Misinformation & Fake Schemes',
    description: 'Civic misinformation surges. Neutralize fake government welfare schemes, exam postponement rumors, and viral hoaxes.',
    threat: 'Fake Schemes & Civic Hoaxes', iconName: 'Globe',
    color: 'text-sky-400', borderColor: 'border-sky-500/40',
    scenarioIds: ['scenario-3', 'scenario-4'], xpRequired: 50, missionsRequired: 1,
    lore: 'Disinformation cells embedded in civic digital infrastructure. Identify and quarantine.'
  },
  {
    id: 3, title: 'AUTHORITY ATTACK', subtitle: 'Level 3 — Police & Digital Arrest',
    description: 'Hostile syndicates impersonating cyber police, fake digital arrest warrants, and judicial summonses targeting merchant terminals.',
    threat: 'Digital Arrest & Authority Spoofing', iconName: 'Target',
    color: 'text-purple-400', borderColor: 'border-purple-500/40',
    scenarioIds: ['scenario-5', 'scenario-6'], xpRequired: 120, missionsRequired: 3,
    lore: 'Coordinated syndicate exploiting fear of law enforcement. Demand institutional proof.'
  },
  {
    id: 4, title: 'VISUAL DECEPTION', subtitle: 'Level 4 — Forged Media & Circulars',
    description: 'Forensically examine forged government circulars, fake ministry seals, and altered screenshot notices. Authentic notices must be allowed through!',
    threat: 'Forged Circulars & Visual Hoaxes', iconName: 'Eye',
    color: 'text-amber-400', borderColor: 'border-amber-500/40',
    scenarioIds: ['scenario-7', 'scenario-8'], xpRequired: 220, missionsRequired: 5,
    lore: 'High-fidelity visual hoaxes designed to bypass casual checks. Scrutinize visual metadata.'
  },
  {
    id: 5, title: 'VOICE & AI THREAT', subtitle: 'Level 5 — Deepfake Audio & Clones',
    description: 'Deep neural voice clones impersonating relatives in distress, AI-generated kidnapping ransoms, and synthetic ministerial broadcasts.',
    threat: 'AI Voice Clones & Synthetic Media', iconName: 'Mic',
    color: 'text-pink-400', borderColor: 'border-pink-500/40',
    scenarioIds: ['scenario-9', 'scenario-10'], xpRequired: 350, missionsRequired: 7,
    lore: 'ElevenLabs-grade voice clones impersonating authorities and family. AI investigates — you decide.'
  },
  {
    id: 6, title: 'TRUST WAR', subtitle: 'Level 6 — 3 Simultaneous Multi-Vector Threats',
    description: 'CRITICAL ALERT: Multi-vector crisis event. 3 simultaneous threat packets strike across multiple sectors simultaneously! Rapid tactical triage required.',
    threat: 'MULTI-VECTOR SIMULTANEOUS CRISIS', iconName: 'Swords',
    color: 'text-red-400', borderColor: 'border-red-500/60',
    scenarioIds: ['scenario-11', 'scenario-12'], xpRequired: 500, missionsRequired: 9,
    lore: 'CLASSIFIED. State-level threat actors assault all civic communication nodes simultaneously.'
  }
];

const ICON_MAP: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  Mic: <Mic className="w-6 h-6" />,
  Target: <Target className="w-6 h-6" />,
  Eye: <Eye className="w-6 h-6" />,
  Swords: <Swords className="w-6 h-6" />,
};

export const LevelMapPage: React.FC<LevelMapPageProps> = ({
  player, community, onStartLevel, onViewResults, onBackToDashboard, onResetCampaign
}) => {
  const playerXp = player.xp ?? 0;
  const playerMissions = player.missions_completed ?? 0;

  const getLevelStatus = (level: LevelConfig) => {
    if (playerXp < level.xpRequired || playerMissions < level.missionsRequired) return 'locked';
    const nextLevel = GAME_LEVELS.find(l => l.id === level.id + 1);
    if (nextLevel && playerXp >= nextLevel.xpRequired && playerMissions >= nextLevel.missionsRequired) return 'completed';
    return 'available';
  };

  const currentActiveLevel = GAME_LEVELS.reduce((acc, level) => {
    if (getLevelStatus(level) === 'available') return level.id;
    return acc;
  }, 1);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#060913] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-[10px] font-mono-code text-cyan-300 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="tracking-widest uppercase">MISSION ZONE SELECTION — TRUST WAR CAMPAIGN</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-tight mb-2">
            SELECT YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">MISSION ZONE</span>
          </h1>
          <p className="text-sm text-slate-400 font-mono-code">
            Unlock zones by earning XP and completing missions. The final <span className="text-red-400 font-bold">TRUST WAR</span> awaits.
          </p>
        </div>

        {/* Player Status Bar */}
        <div className="mb-8 p-4 rounded-xl glass-panel border border-slate-700/60 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-indigo-600/30 border border-cyan-500/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-mono-code text-cyan-300 font-bold">{player.name}</div>
              <div className="text-[10px] text-slate-400 font-mono-code">{player.rank || 'ROOKIE GUARDIAN'} · Lv.{player.level}</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: 'XP', value: playerXp, color: 'text-amber-400' },
              { label: 'Missions', value: playerMissions, color: 'text-emerald-400' },
              { label: 'Credits', value: player.investigation_credits, color: 'text-cyan-400' },
              { label: 'Trust %', value: `${community?.community_trust ?? player.community_trust}%`, color: 'text-violet-400' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className={`text-lg font-black font-mono-code ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-slate-500 font-mono-code uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* XP Progress Bar toward next unlock */}
        <div className="mb-8">
          <div className="flex justify-between text-[10px] font-mono-code text-slate-500 mb-1.5">
            <span>CAMPAIGN PROGRESS</span>
            <span>{playerXp} / 500 XP to TRUST WAR</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-violet-500 to-red-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (playerXp / 500) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {GAME_LEVELS.map(l => (
              <div key={l.id} className={`text-[9px] font-mono-code ${playerXp >= l.xpRequired ? l.color : 'text-slate-700'}`}>
                {l.id === 6 ? '⚔' : `L${l.id}`}
              </div>
            ))}
          </div>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAME_LEVELS.map((level) => {
            const status = getLevelStatus(level);
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            const isActive = level.id === currentActiveLevel;
            const isTrustWar = level.id === 6;

            return (
              <div
                key={level.id}
                onClick={() => {
                  if (isLocked) return;
                  sound.playClick();
                  onStartLevel(level.id, level.scenarioIds[0]);
                }}
                className={`
                  relative rounded-2xl border p-5 transition-all duration-300 overflow-hidden
                  ${isTrustWar && !isLocked
                    ? 'border-red-500/60 bg-gradient-to-br from-red-950/50 via-slate-900/80 to-orange-950/30 hover:border-red-400/80 cursor-pointer lg:col-span-3'
                    : isCompleted
                      ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-400/50 cursor-pointer'
                      : isLocked
                        ? 'border-slate-800/80 bg-slate-900/40 opacity-50 cursor-not-allowed'
                        : `${level.borderColor} bg-slate-900/60 hover:bg-slate-900/80 cursor-pointer ${isActive ? 'ring-1 ring-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : ''}`
                  }
                `}
              >
                {/* Animated glow for active/trust war */}
                {isActive && !isTrustWar && (
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
                )}
                {isTrustWar && !isLocked && (
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500/80 to-transparent animate-pulse" />
                )}

                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`
                    p-2.5 rounded-xl border shrink-0
                    ${isTrustWar && !isLocked ? 'border-red-500/40 bg-red-900/30 text-red-300'
                      : isCompleted ? 'border-emerald-500/40 bg-emerald-900/30 text-emerald-300'
                      : isLocked ? 'border-slate-700 bg-slate-900 text-slate-600'
                      : `${level.borderColor} bg-slate-900/80 ${level.color}`
                    }
                  `}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" />
                      : isLocked ? <Lock className="w-5 h-5" />
                      : ICON_MAP[level.iconName]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`text-[9px] font-mono-code font-bold uppercase tracking-widest
                        ${isTrustWar ? 'text-red-400' : isCompleted ? 'text-emerald-400' : isLocked ? 'text-slate-600' : level.color}`}>
                        {level.subtitle}
                      </span>
                      {isActive && !isTrustWar && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-code bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
                          ACTIVE
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-code bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          CLEARED
                        </span>
                      )}
                      {isTrustWar && !isLocked && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-code bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
                          FINAL BATTLE
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-black font-heading tracking-wide mb-1
                      ${isTrustWar && !isLocked ? 'text-red-200' : isLocked ? 'text-slate-500' : 'text-white'}`}>
                      {level.title}
                    </h3>

                    <p className={`text-[11px] leading-relaxed mb-2.5
                      ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
                      {level.description}
                    </p>

                    {/* Threat badge */}
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono-code mb-2.5
                      ${isTrustWar ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                        : isLocked ? 'bg-slate-900 border border-slate-800 text-slate-600'
                        : 'bg-slate-900/70 border border-slate-700/60 text-slate-400'
                      }`}>
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>{level.threat}</span>
                    </div>

                    {/* Lore */}
                    {!isLocked && (
                      <p className={`text-[9px] italic font-mono-code mb-3 line-clamp-1
                        ${isTrustWar ? 'text-red-400/60' : 'text-slate-600'}`}>
                        "{level.lore}"
                      </p>
                    )}

                    {/* Unlock req or deploy button */}
                    {isLocked ? (
                      <div className="text-[9px] font-mono-code text-slate-600 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Requires {level.xpRequired} XP · {level.missionsRequired} missions</span>
                      </div>
                    ) : (
                      <div className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono-code font-bold w-fit
                        ${isTrustWar
                          ? 'bg-gradient-to-r from-red-700 to-orange-700 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                          : isCompleted
                            ? 'bg-emerald-900/50 border border-emerald-500/30 text-emerald-300'
                            : 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                        }
                      `}>
                        {isCompleted ? <><CheckCircle2 className="w-3 h-3" /><span>REPLAY</span></>
                          : isTrustWar ? <><Swords className="w-3 h-3" /><span>BEGIN TRUST WAR</span></>
                          : <><Radio className="w-3 h-3" /><span>DEPLOY</span><ArrowRight className="w-3 h-3" /></>
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {onResetCampaign && (
            <button
              onClick={() => { sound.playClick(); onResetCampaign(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel border border-red-500/30 text-red-300 font-mono-code text-xs font-semibold hover:border-red-400/50 hover:bg-red-950/20 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-red-400" />
              <span>RESET CAMPAIGN</span>
            </button>
          )}
          <button
            onClick={() => { sound.playClick(); onViewResults(); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel border border-amber-500/30 text-amber-300 font-mono-code text-xs font-semibold hover:border-amber-400/50 transition-all"
          >
            <Trophy className="w-4 h-4" />
            <span>VIEW MISSION INTEL & TRUST DNA</span>
          </button>
          <button
            onClick={() => { sound.playClick(); onBackToDashboard(); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel border border-slate-700 text-slate-400 font-mono-code text-xs font-semibold hover:border-cyan-500/30 hover:text-cyan-300 transition-all"
          >
            <Radio className="w-4 h-4" />
            <span>OPERATIONS DESK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
