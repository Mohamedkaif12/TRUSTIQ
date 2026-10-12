import React from 'react';
import { GuardianAchievement } from '../types';
import { Trophy, CheckCircle2, Lock, X, Award, Shield, Zap, Brain, Crosshair } from 'lucide-react';
import { sound } from '../utils/audio';

interface GuardianAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: GuardianAchievement[];
}

export const GuardianAchievementsModal: React.FC<GuardianAchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'CONTAINMENT':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'INVESTIGATION':
        return <Crosshair className="w-4 h-4 text-sky-400" />;
      case 'DISCRETION':
        return <Brain className="w-4 h-4 text-purple-400" />;
      case 'FORENSICS':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'PSYCHOLOGY':
        return <Award className="w-4 h-4 text-rose-400" />;
      default:
        return <Trophy className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090d1a] border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-code text-amber-400 uppercase tracking-widest font-bold block">
                GUARDIAN SERVICE RECORD
              </span>
              <h2 className="text-lg font-heading font-black text-white tracking-wide">
                OPERATIONAL ACHIEVEMENTS ({unlockedCount}/{achievements.length})
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of achievements */}
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {achievements.map((ach) => {
            const pct = Math.min(100, Math.round((ach.progress / ach.target) * 100));
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                  ach.unlocked
                    ? 'bg-slate-900/80 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                    : 'bg-slate-950/60 border-slate-800/70 opacity-70'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    ach.unlocked
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}
                >
                  {ach.unlocked ? (
                    getCategoryIcon(ach.category)
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code font-bold text-white tracking-wide">
                      {ach.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono-code font-bold px-2 py-0.5 rounded border ${
                        ach.unlocked
                          ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      {ach.unlocked ? 'UNLOCKED' : `${ach.progress} / ${ach.target}`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {ach.description}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-950 border border-slate-800/80 overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ach.unlocked
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono-code text-slate-200 transition-all border border-slate-800"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
