import React from 'react';
import { GuardianMission } from '../types';
import { Target, CheckCircle2, Lock, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface GuardianMissionsCardProps {
  missions: GuardianMission[];
  onDeployMission?: (scenarioId?: string) => void;
}

export const GuardianMissionsCard: React.FC<GuardianMissionsCardProps> = ({
  missions,
  onDeployMission,
}) => {
  if (!missions || missions.length === 0) return null;

  const activeMission = missions.find((m) => m.status === 'ACTIVE') || missions[0];
  const completedCount = missions.filter((m) => m.status === 'COMPLETED').length;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-950/80 to-purple-950/30 border border-purple-500/30 shadow-lg shadow-purple-950/20 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono-code uppercase font-bold text-purple-300 tracking-wider block">
              GUARDIAN TRAINING MISSIONS
            </span>
            <span className="text-xs font-mono-code text-slate-400">
              Completed: {completedCount} / {missions.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-purple-950 border border-purple-500/40 text-purple-300">
            XP REWARDS ACTIVE
          </span>
        </div>
      </div>

      {/* Active Mission Spotlight */}
      {activeMission && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-bold text-white tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              {activeMission.title}
            </span>
            <span className="text-[10px] font-mono-code font-bold text-amber-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              +{activeMission.xp_reward} XP
            </span>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {activeMission.description}
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono-code text-slate-400">
              Target Cognitive Skill: <strong className="text-purple-300">{activeMission.target_skill.replace(/_/g, ' ').toUpperCase()}</strong>
            </span>

            {onDeployMission && activeMission.status === 'ACTIVE' && (
              <button
                onClick={() => {
                  sound.playClick();
                  onDeployMission(activeMission.linked_scenarios[0]);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono-code text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/50"
              >
                <span>ENGAGE MISSION</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mission Pipeline Mini List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
        {missions.slice(1, 5).map((m) => {
          const isDone = m.status === 'COMPLETED';
          const isActive = m.status === 'ACTIVE';
          return (
            <div
              key={m.id}
              className={`p-2.5 rounded-lg border text-xs font-mono-code flex items-center justify-between ${
                isDone
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : isActive
                  ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className="truncate">{m.title.split(':')[0]}</span>
              </div>
              <span className="text-[9px] shrink-0 text-slate-400">+{m.xp_reward}XP</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
