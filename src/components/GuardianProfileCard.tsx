import React from 'react';
import { PlayerState, GuardianAvatarStyle } from '../types';
import { GuardianAvatar } from './GuardianAvatar';
import { 
  Shield, 
  Award, 
  Flame, 
  Users, 
  Target, 
  Edit3, 
  Trophy,
  Zap
} from 'lucide-react';
import { sound } from '../utils/audio';

interface GuardianProfileCardProps {
  player: PlayerState;
  onEditGuardian: () => void;
  onOpenAchievements?: () => void;
  communityProtected?: number;
}

export const GuardianProfileCard: React.FC<GuardianProfileCardProps> = ({
  player,
  onEditGuardian,
  onOpenAchievements,
  communityProtected,
}) => {
  const xp = player.xp ?? 0;
  const nextXp = player.xp_for_next_level ?? 250;
  const rankTitle = player.rank ?? 'ROOKIE GUARDIAN';
  const avatarStyle: GuardianAvatarStyle = (player.avatar as GuardianAvatarStyle) || 'AGENT';

  // Calculate XP percentage towards next level
  const xpPercent = Math.min(100, Math.round((xp / nextXp) * 100));

  const protectedCount = communityProtected ?? (player.missions_completed ? player.missions_completed * 180 : 0);

  return (
    <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900/95 via-[#080d1e]/90 to-cyan-950/40 border border-cyan-500/30 shadow-[0_4px_30px_rgba(6,182,212,0.12)] overflow-hidden">
      {/* Background Cyber Grid Accent */}
      <div className="absolute top-0 right-0 w-64 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Avatar + Identity */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative group">
            <GuardianAvatar style={avatarStyle} size="xl" />
            <button
              onClick={() => {
                sound.playClick();
                onEditGuardian();
              }}
              title="Customize Callsign & Avatar"
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-400 hover:text-white hover:bg-cyan-500 transition-all shadow-md shadow-black/60"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono-code uppercase font-bold text-cyan-400 tracking-wider">
                DIGITAL GUARDIAN
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                LEVEL {player.level}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black font-heading text-white tracking-wide">
              {player.name || 'Agent Commander'}
            </h3>

            <div className="flex items-center gap-2 text-xs font-mono-code text-slate-300">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-indigo-300 tracking-wide">{rankTitle}</span>
            </div>
          </div>
        </div>

        {/* Middle: XP Progress Track */}
        <div className="w-full md:max-w-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-code">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>EXPERIENCE (XP)</span>
            </span>
            <span className="text-cyan-300 font-bold">
              {xp} <span className="text-slate-500">/ {nextXp} XP</span>
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400 transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${Math.max(5, xpPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono-code text-slate-500">
            <span>Level {player.level}</span>
            <span>{100 - xpPercent}% to Rank Advancement</span>
          </div>
        </div>

        {/* Right: Quick Stats & Achievements */}
        <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
          {/* Trust Score */}
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-0.5">
              Trust Score
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono-code text-cyan-300 flex items-center gap-1">
              <Flame className="w-4 h-4 text-cyan-400" />
              {player.trust_score}
            </span>
          </div>

          {/* Community Protected */}
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-0.5">
              Protected
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono-code text-emerald-300 flex items-center gap-1">
              <Users className="w-4 h-4 text-emerald-400" />
              +{protectedCount}
            </span>
          </div>

          {/* Achievements CTA */}
          {onOpenAchievements && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAchievements();
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-400 hover:text-amber-300 transition-all flex flex-col items-center justify-center gap-1"
              title="View Guardian Achievements"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-[9px] font-mono-code font-bold uppercase">Badges</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
