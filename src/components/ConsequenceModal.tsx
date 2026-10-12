import React from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Shield,
  Zap,
  TrendingUp, 
  TrendingDown, 
  Users, 
  Award, 
  ArrowRight,
  Radio,
  Brain,
  Sparkles,
  HeartHandshake,
  Dna,
  CheckCircle2,
  AlertTriangle,
  Siren,
  ChevronRight,
  Target,
  Crosshair
} from 'lucide-react';
import { DecisionConsequence, AdaptiveChallenge } from '../types';
import { sound } from '../utils/audio';

interface ConsequenceModalProps {
  consequence: DecisionConsequence | null;
  onClose: () => void;
  onContinue: () => void;
  adaptiveBriefing?: AdaptiveChallenge | null;
}

export const ConsequenceModal: React.FC<ConsequenceModalProps> = ({
  consequence,
  onClose,
  onContinue,
  adaptiveBriefing,
}) => {
  if (!consequence) return null;

  const isSuccess = consequence.is_correct;
  const commState = consequence.new_community_state;
  const dnaDeltas = consequence.trust_dna_deltas || {};
  const hasDnaChanges = Object.keys(dnaDeltas).some(k => dnaDeltas[k] !== 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className={`w-full max-w-2xl glass-panel-elevated rounded-2xl border my-auto ${
        isSuccess ? 'border-emerald-500/50 shadow-emerald-950/40' : 'border-rose-500/50 shadow-rose-950/40'
      } overflow-hidden shadow-2xl flex flex-col`}>
        
        {/* Header */}
        <div className={`px-5 sm:px-6 py-4 flex items-center justify-between border-b ${
          isSuccess ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-rose-950/40 border-rose-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isSuccess ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
            }`}>
              {isSuccess ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-code uppercase tracking-wider text-slate-400 block">
                  DECISION CONSEQUENCE REPORT // CASE {consequence.scenario_id}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-code bg-slate-900 border border-slate-800 text-slate-400">
                  GAME SIMULATION
                </span>
              </div>
              <h3 className={`text-xl font-heading font-black ${
                isSuccess ? 'text-emerald-300' : 'text-rose-300'
              }`}>
                {consequence.verdict_label}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Executive Action & Ground Truth */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono-code">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">YOUR VERDICT</span>
              <span className="text-white font-bold text-sm tracking-wider">{consequence.decision}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">CORRECT ACTION</span>
              <span className="text-cyan-400 font-bold text-sm tracking-wider">{consequence.correct_action}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
              <span className="text-slate-500 text-[10px] uppercase block">GROUND TRUTH</span>
              <span className={`font-bold text-sm ${
                consequence.ground_truth === 'GENUINE' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {consequence.ground_truth}
              </span>
            </div>
          </div>

          {/* Section 2: AI Reliability & Override Banner */}
          {consequence.ai_recommendation && (
            <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              consequence.ai_override_success
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : 'bg-indigo-950/30 border-indigo-500/30'
            }`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-mono-code uppercase font-bold text-indigo-300">
                    AI RELIABILITY AUDIT
                  </span>
                  {consequence.ai_override_success && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono-code bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1">
                      <Siren className="w-2.5 h-2.5" /> AI OVERRIDE SUCCESS
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  AI Recommended: <strong className="text-indigo-200">{consequence.ai_recommendation}</strong> | 
                  Your Decision: <strong className="text-white">{consequence.decision}</strong>
                </p>
                {consequence.ai_override_message && (
                  <p className="text-[11px] text-slate-400 italic font-mono-code">
                    {consequence.ai_override_message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Phase 6: Digital Guardian Reaction & XP Progress */}
          {(consequence.guardian_reaction || consequence.xp_earned !== undefined) && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/20 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-mono-code uppercase font-bold text-cyan-300 tracking-wider">
                    GUARDIAN FORENSIC DEBRIEF // {consequence.guardian_rank || 'OPERATIVE'}
                  </span>
                </div>
                {consequence.xp_earned !== undefined && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-code font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1 shadow-sm">
                    <Zap className="w-3 h-3 text-amber-400" />
                    +{consequence.xp_earned} XP
                  </span>
                )}
              </div>

              {consequence.guardian_reaction && (
                <p className="text-xs sm:text-sm text-slate-200 font-sans italic leading-relaxed pl-6 border-l-2 border-cyan-500/50">
                  "{consequence.guardian_reaction}"
                </p>
              )}

              {consequence.xp_breakdown && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono-code text-slate-400 pl-6">
                  <span>Base: +{consequence.xp_breakdown.base_xp} XP</span>
                  {consequence.xp_breakdown.override_bonus > 0 && (
                    <span className="text-emerald-400 font-semibold">Override Bonus: +{consequence.xp_breakdown.override_bonus} XP</span>
                  )}
                  {consequence.xp_breakdown.efficiency_bonus > 0 && (
                    <span className="text-cyan-400 font-semibold">Efficiency Bonus: +{consequence.xp_breakdown.efficiency_bonus} XP</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Simulated Community Impact (4 Grid Dials) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-code text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> SIMULATED COMMUNITY IMPACT
              </span>
              <span className="text-[10px] font-mono-code text-slate-500">
                Civic Telemetry Feedback
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Trust Score Delta */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-1">
                  Trust Score
                </span>
                <span className={`text-xl font-bold font-mono-code flex items-center justify-center gap-1 ${
                  consequence.trust_points_delta >= 0 ? 'text-cyan-400' : 'text-rose-400'
                }`}>
                  <Award className="w-4 h-4" />
                  {consequence.trust_points_delta >= 0 ? `+${consequence.trust_points_delta}` : `${consequence.trust_points_delta}`}
                </span>
                <span className="text-[9px] font-mono-code text-slate-500 mt-0.5 block">
                  New: {consequence.new_trust_score ?? 0} PTS
                </span>
              </div>

              {/* Community Trust Delta */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-1">
                  Comm. Trust
                </span>
                <span className={`text-xl font-bold font-mono-code flex items-center justify-center gap-1 ${
                  consequence.community_trust_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {consequence.community_trust_delta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {consequence.community_trust_delta >= 0 ? `+${consequence.community_trust_delta}%` : `${consequence.community_trust_delta}%`}
                </span>
                <span className="text-[9px] font-mono-code text-slate-500 mt-0.5 block">
                  Level: {commState?.community_trust ?? consequence.updated_player?.community_trust}%
                </span>
              </div>

              {/* Exposure Delta */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-1">
                  Game Exposure
                </span>
                <span className={`text-xl font-bold font-mono-code flex items-center justify-center gap-1 ${
                  (consequence.exposure_delta ?? consequence.community_exposure_delta) === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  <Radio className="w-4 h-4" />
                  {(consequence.exposure_delta ?? consequence.community_exposure_delta) === 0 ? '0' : `+${consequence.exposure_delta ?? consequence.community_exposure_delta}`}
                </span>
                <span className="text-[9px] font-mono-code text-slate-500 mt-0.5 block">
                  Total: {commState?.exposure ?? consequence.updated_player?.community_exposure} Citizens
                </span>
              </div>

              {/* Harm Prevented / Caused */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-1">
                  Harm Prevented
                </span>
                <span className={`text-xl font-bold font-mono-code flex items-center justify-center gap-1 ${
                  (consequence.harm_prevented_delta ?? 0) > 0 ? 'text-sky-400' : 'text-slate-400'
                }`}>
                  <HeartHandshake className="w-4 h-4" />
                  +{(consequence.harm_prevented_delta ?? 0)}
                </span>
                <span className="text-[9px] font-mono-code text-slate-500 mt-0.5 block">
                  Harm caused: +{consequence.harm_caused_delta ?? 0}
                </span>
              </div>
            </div>

            {/* Simulation Message Box */}
            {consequence.simulation_impact_summary && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                {consequence.simulation_impact_summary}
              </div>
            )}
          </div>

          {/* Section 4: Trust DNA Skill Adjustments */}
          {hasDnaChanges && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-indigo-400 uppercase font-bold flex items-center gap-1.5">
                  <Dna className="w-3.5 h-3.5" /> TRUST DNA SKILL ADJUSTMENTS
                </span>
                <span className="text-[10px] font-mono-code text-slate-500">
                  Cognitive Behavioral Profiling
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(dnaDeltas).filter(([_, d]) => d !== 0).map(([trait, delta]) => {
                  const label = trait.replace(/_/g, ' ');
                  const isPositive = delta > 0;
                  return (
                    <div key={trait} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-300 font-mono-code capitalize truncate mr-1">
                        {label}
                      </span>
                      <span className={`font-mono-code font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isPositive ? `+${delta}` : delta}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 5: Full Debrief Explanation */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono-code text-cyan-400 uppercase font-semibold block">
              POST-INCIDENT FORENSIC DEBRIEF:
            </span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {consequence.explanation}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
          {/* Phase 6: Adaptive Briefing Preview */}
          {adaptiveBriefing && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-950/50 via-indigo-950/40 to-cyan-950/30 border border-violet-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-500/20 border border-violet-500/40">
                  <Target className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <span className="text-[10px] font-mono-code uppercase font-bold text-violet-300 tracking-wider">
                  ADAPTIVE TRAINING BRIEFING
                </span>
                <span className={`ml-auto px-2 py-0.5 rounded text-[9px] font-mono-code font-bold border ${
                  adaptiveBriefing.difficulty === 'HARD'
                    ? 'bg-rose-950 border-rose-500/50 text-rose-300'
                    : adaptiveBriefing.difficulty === 'MEDIUM'
                    ? 'bg-amber-950 border-amber-500/50 text-amber-300'
                    : 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                }`}>
                  {adaptiveBriefing.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Crosshair className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="text-xs font-mono-code text-cyan-300 font-semibold">
                  Training Focus: {adaptiveBriefing.training_focus}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono-code pl-5">
                {adaptiveBriefing.reason}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-mono-code text-slate-500 hidden sm:block">
              Decisions are permanently committed to the ledger.
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onContinue();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono-code text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/50"
            >
              <span>{adaptiveBriefing ? 'DEPLOY TO TARGETED CHALLENGE' : 'NEXT CHALLENGE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
