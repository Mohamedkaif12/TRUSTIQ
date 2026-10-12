import React, { useState } from 'react';
import {
  Scenario,
  PlayerState,
  PlayerDecision,
  InvestigationActionType,
  INVESTIGATION_TIERS,
  AIInvestigationDossier,
  AISignal,
  AIStatus,
  AnalysisSource,
  AdaptiveChallenge,
} from '../types';
import {
  ArrowLeft,
  Zap,
  Globe,
  Image,
  Mic,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Radio,
  Cpu,
  Send,
  FileSearch,
  Brain,
  TrendingUp,
  Eye,
  HelpCircle,
  Info,
  ShieldCheck,
  ShieldX,
  Siren,
  ChevronRight,
  Sparkles,
  Target,
  Crosshair,
  Activity,
  Scale,
  ExternalLink,
} from 'lucide-react';
import { CyberBadge } from '../components/CyberBadge';
import { sound } from '../utils/audio';

interface InvestigationPageProps {
  scenario: Scenario | null;
  scenarios: Scenario[];
  player: PlayerState;
  adaptiveBriefing?: AdaptiveChallenge | null;
  onSelectScenario: (id: string) => void;
  onInvestigateAction: (scenarioId: string, actionType: InvestigationActionType) => Promise<void>;
  onMakeDecision: (scenarioId: string, decision: PlayerDecision) => Promise<void>;
  onBackToDashboard: () => void;
  isSubmittingDecision: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStatusConfig(status: AIStatus): { label: string; color: string; bg: string; border: string; icon: React.ReactNode } {
  switch (status) {
    case 'LIKELY_SAFE':
      return {
        label: 'LIKELY SAFE',
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/40',
        border: 'border-emerald-500/40',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      };
    case 'UNVERIFIED':
      return {
        label: 'UNVERIFIED',
        color: 'text-sky-400',
        bg: 'bg-sky-950/30',
        border: 'border-sky-500/30',
        icon: <HelpCircle className="w-4 h-4 text-sky-400" />,
      };
    case 'SUSPICIOUS':
      return {
        label: 'SUSPICIOUS',
        color: 'text-amber-400',
        bg: 'bg-amber-950/30',
        border: 'border-amber-500/40',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      };
    case 'POTENTIAL_THREAT':
      return {
        label: 'POTENTIAL THREAT',
        color: 'text-rose-400',
        bg: 'bg-rose-950/40',
        border: 'border-rose-500/50',
        icon: <ShieldX className="w-4 h-4 text-rose-400" />,
      };
  }
}

function getSeverityConfig(severity: AISignal['severity']) {
  switch (severity) {
    case 'LOW': return { dot: 'bg-sky-400', text: 'text-sky-300', badge: 'bg-sky-950/50 border-sky-500/30 text-sky-300' };
    case 'MEDIUM': return { dot: 'bg-amber-400', text: 'text-amber-300', badge: 'bg-amber-950/50 border-amber-500/30 text-amber-300' };
    case 'HIGH': return { dot: 'bg-orange-400', text: 'text-orange-300', badge: 'bg-orange-950/50 border-orange-500/30 text-orange-300' };
    case 'CRITICAL': return { dot: 'bg-rose-400 animate-pulse', text: 'text-rose-300', badge: 'bg-rose-950/60 border-rose-500/50 text-rose-300' };
  }
}

function RiskGauge({ score }: { score: number }) {
  const color =
    score >= 75 ? '#f43f5e' :
    score >= 50 ? '#f59e0b' :
    score >= 25 ? '#38bdf8' : '#10b981';

  const r = 44;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
      <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
        <circle cx="60" cy="60" r={r} strokeWidth="8" stroke="#1e293b" fill="none" />
        <circle
          cx="60" cy="60" r={r}
          strokeWidth="8"
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-black font-mono" style={{ color }}>{score}</div>
        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">/ 100</div>
      </div>
    </div>
  );
}

function AISourceBadge({ source }: { source: AnalysisSource }) {
  if (source === 'AI') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
        <Brain className="w-3 h-3" /> AI ANALYSIS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/50 border border-amber-500/30 text-amber-400">
      <Cpu className="w-3 h-3" /> FALLBACK ENGINE
    </span>
  );
}

function AIDossierCard({ dossier, actionKey }: { dossier: AIInvestigationDossier; actionKey: string }) {
  const statusCfg = getStatusConfig(dossier.status);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl bg-slate-950/90 border border-cyan-500/30 overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-900/40 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <Unlock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
            <span className="text-indigo-400">NOVA //</span> {actionKey.replace(/_/g, ' ')} DOSSIER
          </span>
          <AISourceBadge source={dossier.analysis_source} />
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-800/60">

          {/* Risk + Status + Confidence row */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 items-start sm:items-center">
            <RiskGauge score={dossier.risk_score} />

            <div className="flex-1 space-y-3">
              {/* Status pill */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusCfg.bg} ${statusCfg.border}`}>
                {statusCfg.icon}
                <span className={`font-mono font-black text-sm ${statusCfg.color}`}>{statusCfg.label}</span>
              </div>

              {/* Confidence bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>CONFIDENCE</span>
                  <span className="text-cyan-300 font-bold">{dossier.confidence}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-700"
                    style={{ width: `${dossier.confidence}%` }}
                  />
                </div>
              </div>

              {/* RISK label */}
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                RISK SCORE: <span className="text-white font-bold">{dossier.risk_score} / 100</span>
              </div>
            </div>
          </div>

          {/* Claim */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3" /> IDENTIFIED CLAIM
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic">"{dossier.claim}"</p>
          </div>

          {/* ── Random Forest ML Risk Panel ── */}
          {dossier.ml_prediction && (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>RANDOM FOREST RISK PREDICTION</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  dossier.ml_prediction.risk_class === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                  dossier.ml_prediction.risk_class === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {dossier.ml_prediction.risk_class} RISK ({dossier.ml_prediction.risk_score}/100)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">MODEL CONFIDENCE</span>
                  <span className="text-cyan-300 font-bold">{dossier.ml_prediction.confidence}%</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">TOP DRIVER FEATURES</span>
                  <span className="text-slate-300 text-[11px] truncate block">
                    {dossier.ml_prediction.top_features.slice(0, 2).join(', ') || 'Standard indicators'}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 font-mono italic">
                {dossier.ml_prediction.prediction_disclaimer || "Random Forest predicts risk patterns from structural features. It does not establish objective truth."}
              </p>
            </div>
          )}

          {/* ── Z-Score Statistical Anomaly Panel ── */}
          {dossier.statistical_signals && dossier.statistical_signals.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Z-SCORE STATISTICAL ANOMALY ENGINE</span>
                </span>
                <span className="text-[10px] font-mono text-indigo-300">
                  Z = (x - μ) / σ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dossier.statistical_signals.map((sig, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 text-[11px]">{sig.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      sig.severity === 'critical' ? 'text-rose-400 bg-rose-950/60' :
                      sig.severity === 'high' ? 'text-amber-400 bg-amber-950/60' :
                      sig.severity === 'medium' ? 'text-cyan-400 bg-cyan-950/60' :
                      'text-slate-400'
                    }`}>
                      Z = {sig.z_score}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-slate-500 font-mono italic">
                Z-score identifies statistical abnormality relative to baseline distributions. It does not prove falsity or criminal intent.
              </p>
            </div>
          )}

          {/* Signals */}
          {dossier.signals && dossier.signals.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> DETECTED SIGNALS ({dossier.signals.length})
              </div>
              <div className="space-y-1.5">
                {dossier.signals.map((sig, i) => {
                  const sc = getSeverityConfig(sig.severity);
                  return (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60">
                      <span className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${sc.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-mono font-bold ${sc.text}`}>{sig.type}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${sc.badge}`}>{sig.severity}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{sig.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Evidence */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-bold flex items-center gap-1">
              <FileSearch className="w-3 h-3" /> EVIDENCE
            </div>
            <div className="space-y-1">
              {dossier.evidence.map((ev, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded bg-slate-900/40">
                  <span className="text-sky-500 mt-0.5 flex-shrink-0">›</span>
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* External verification note */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/40 border border-slate-700/40 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-600" />
            <span>{dossier.external_verification}</span>
          </div>

          {/* Uncertainty */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/50 space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> UNCERTAINTY
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{dossier.uncertainty}</p>
          </div>

          {/* Reasoning */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/50 space-y-1">
            <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-wider flex items-center gap-1">
              <Brain className="w-3 h-3" /> AI REASONING
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{dossier.reasoning}</p>
          </div>

          {/* AI Recommendation banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-950/60 border border-indigo-500/30">
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">
                NOVA ADVISORY RECOMMENDATION
              </div>
              <div className="text-sm font-mono font-black text-white tracking-wider">{dossier.recommended_action}</div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono italic text-right max-w-[140px]">
              <Sparkles className="w-3 h-3 text-indigo-400 flex-shrink-0" />
              Advisory only. You decide.
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center text-[10px] font-mono text-slate-500 italic border-t border-slate-800/60 pt-2">
            NOVA provides forensic intelligence. The Digital Guardian makes the final verdict.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export const InvestigationPage: React.FC<InvestigationPageProps> = ({
  scenario,
  scenarios,
  player,
  adaptiveBriefing,
  onSelectScenario,
  onInvestigateAction,
  onMakeDecision,
  onBackToDashboard,
  isSubmittingDecision,
}) => {
  const [selectedDecision, setSelectedDecision] = useState<PlayerDecision | null>(null);
  const [investigatingAction, setInvestigatingAction] = useState<string | null>(null);

  if (!scenario) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Cpu className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-xl font-heading font-bold text-slate-300">
          No Communication Selected for Investigation
        </h3>
        <p className="text-xs text-slate-500 font-mono-code">
          Select a scenario from the operations queue.
        </p>
        <button
          onClick={() => { sound.playClick(); onBackToDashboard(); }}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono-code text-xs font-bold"
        >
          RETURN TO DASHBOARD
        </button>
      </div>
    );
  }

  const isDecided = scenario.is_decided;

  const handleRunInvestigation = async (actionType: InvestigationActionType, cost: number) => {
    if (player.investigation_credits < cost) { sound.playWarning(); return; }
    setInvestigatingAction(actionType);
    try {
      await onInvestigateAction(scenario.id, actionType);
      sound.playScan();
    } catch {
      sound.playWarning();
    } finally {
      setInvestigatingAction(null);
    }
  };

  const getActionIcon = (type: InvestigationActionType) => {
    switch (type) {
      case 'quick_scan': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'source_check': return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'screenshot_analysis': return <Image className="w-4 h-4 text-sky-400" />;
      case 'voice_analysis': return <Mic className="w-4 h-4 text-purple-400" />;
      case 'deep_investigation': return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    }
  };

  // Check if the player overrode the AI recommendation
  const lastDossier = Object.values(scenario.unlocked_investigations).slice(-1)[0] as AIInvestigationDossier | undefined;
  const aiOverride =
    isDecided &&
    lastDossier &&
    scenario.user_decision &&
    scenario.user_decision !== lastDossier.recommended_action &&
    scenario.is_correct;

  const decisionDefinitions: { decision: PlayerDecision; label: string; desc: string; border: string }[] = [
    { decision: 'ALLOW',    label: 'ALLOW',    desc: 'Let content pass freely into the community stream.',        border: 'border-emerald-500/40' },
    { decision: 'VERIFY',   label: 'VERIFY',   desc: 'Route to fact-checkers; flag as unverified while checking.', border: 'border-sky-500/40' },
    { decision: 'HOLD',     label: 'HOLD',     desc: 'Temporarily freeze distribution for 1 hour.',               border: 'border-amber-500/40' },
    { decision: 'CONTAIN',  label: 'CONTAIN',  desc: 'Quarantine immediately. Block links/numbers.',               border: 'border-orange-500/40' },
    { decision: 'ESCALATE', label: 'ESCALATE', desc: 'Report to cybercrime cell and broadcast emergency warning.', border: 'border-rose-500/40' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 cyber-grid-bg">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { sound.playClick(); onBackToDashboard(); }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 font-mono-code text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>DASHBOARD</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-cyan-400 font-bold">
                FORENSIC LAB // CASE ID: {scenario.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-slate-800 text-slate-300">
                Difficulty: {scenario.difficulty}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-white">{scenario.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 glass-panel px-3.5 py-2 rounded-xl border border-amber-500/30">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400 font-mono text-xs">CREDITS:</span>
          <span className="text-amber-300 font-bold font-mono text-sm">{player.investigation_credits} CR</span>
        </div>
      </div>

      {/* ── Phase 6: Adaptive Training Briefing Banner ── */}
      {adaptiveBriefing && adaptiveBriefing.scenario_id === scenario.id && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/70 via-indigo-950/50 to-slate-900/80 border border-violet-500/40 shadow-lg shadow-violet-950/30 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-violet-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/20 border border-violet-500/50">
                <Target className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-[11px] font-mono-code uppercase font-bold text-violet-300 tracking-wider">
                TACTICAL BRIEFING // ADAPTIVE MISSION TARGET
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-code text-slate-400">Calibrated Difficulty:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold border ${
                adaptiveBriefing.difficulty === 'HARD'
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                  : adaptiveBriefing.difficulty === 'MEDIUM'
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                  : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              }`}>
                {adaptiveBriefing.difficulty}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Crosshair className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <div className="text-xs font-mono-code text-cyan-300 font-bold">
                Training Focus: {adaptiveBriefing.training_focus}
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {adaptiveBriefing.reason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols) */}
        <div className="lg:col-span-2 space-y-5">

          {/* Raw intercept */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between text-xs font-mono-code text-slate-400 mb-2 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>INTERCEPT PAYLOAD</span>
              </div>
              <span>From: <strong className="text-slate-200">{scenario.sender}</strong></span>
              <span>Time: <strong className="text-slate-200">{scenario.timestamp}</strong></span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 text-sm sm:text-base text-slate-200 leading-relaxed font-sans italic">
              "{scenario.content}"
            </div>
          </div>

          {/* Surface signals */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-mono-code text-xs uppercase font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Surface Manipulation Indicators ({scenario.manipulation_signals.length})</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono-code">Heuristic Telemetry</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scenario.manipulation_signals.map((sig, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 flex items-start gap-2.5 text-xs text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                  <span className="leading-snug">{sig}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── AI Investigation Dossiers ── */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-mono-code text-xs uppercase font-bold">
                <Brain className="w-4 h-4" />
                <span>AI INVESTIGATION DOSSIER ({scenario.investigations_done.length} Completed)</span>
              </div>
              <span className="text-[10px] font-mono-code text-slate-400">Phase 4 — AI Powered</span>
            </div>

            {scenario.investigations_done.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 space-y-2">
                <Lock className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-mono-code text-slate-400 font-bold">NO INVESTIGATION DATA UNLOCKED</div>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Spend investigation credits to activate ARIA — the AI investigation engine.
                  Each tool reveals deeper signals.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(scenario.unlocked_investigations).map(([actionKey, dossier]) => (
                  <AIDossierCard key={actionKey} dossier={dossier} actionKey={actionKey} />
                ))}
              </div>
            )}
          </div>

          {/* ── AI Override Badge ── */}
          {aiOverride && lastDossier && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/50 to-cyan-950/40 border border-emerald-500/50 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase">
                <Siren className="w-4 h-4" />
                AI OVERRIDE SUCCESS
              </div>
              <p className="text-xs text-slate-300">
                AI recommended <strong className="text-indigo-300">{lastDossier.recommended_action}</strong>.
                You selected <strong className="text-emerald-300">{scenario.user_decision}</strong>.
                <span className="text-emerald-400 font-bold"> Correct decision. </span>
                Excellent human judgment over AI advisory.
              </p>
            </div>
          )}

          {/* ── Verdict reveal (after decision) ── */}
          {isDecided && (
            <div className={`p-5 rounded-2xl border ${
              scenario.is_correct ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-rose-950/30 border-rose-500/40'
            } space-y-2`}>
              <div className="flex items-center justify-between text-xs font-mono-code">
                <span className={`font-bold flex items-center gap-1.5 ${scenario.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {scenario.is_correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  VERDICT: {scenario.user_decision} ({scenario.is_correct ? 'CORRECT' : 'INCORRECT'})
                </span>
                <span className="text-slate-400">
                  Ground Truth: <strong className="text-white">{scenario.ground_truth}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">{scenario.explanation}</p>
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-5">
          {/* Investigation action buttons */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-code text-slate-400 pb-2 border-b border-slate-800">
              <span className="text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> ARIA INVESTIGATION TOOLS
              </span>
              <span className="text-[10px] text-amber-300 font-bold">{player.investigation_credits} CR</span>
            </div>

            <div className="space-y-2">
              {INVESTIGATION_TIERS.map((tier) => {
                const isUnlocked = scenario.investigations_done.includes(tier.type);
                const canAfford = player.investigation_credits >= tier.cost;
                const isLoading = investigatingAction === tier.type;

                return (
                  <button
                    key={tier.type}
                    onClick={() => handleRunInvestigation(tier.type, tier.cost)}
                    disabled={isUnlocked || !canAfford || isDecided || isLoading}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isUnlocked
                        ? 'bg-cyan-950/40 border-cyan-500/40 opacity-80 cursor-default'
                        : canAfford && !isDecided
                        ? 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-cyan-500/40 cursor-pointer'
                        : 'bg-slate-950/60 border-slate-800/60 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        {isLoading
                          ? <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
                          : getActionIcon(tier.type)
                        }
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{tier.label}</span>
                          {isLoading && <span className="text-[10px] text-cyan-400 animate-pulse">ARIA THINKING…</span>}
                          {isUnlocked && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{tier.description}</div>
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isUnlocked
                          ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-500/30'
                          : canAfford
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-600'
                      }`}>
                        {isUnlocked ? 'DONE' : `-${tier.cost} CR`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* AI mode indicator */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[10px] font-mono text-slate-500">
              <Brain className="w-3 h-3 text-cyan-600" />
              <span>Powered by ARIA — AI Investigation Engine</span>
            </div>
          </div>

          {/* ── Decision Panel ── */}
          <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-slate-900/90 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-indigo-400 uppercase font-bold">EXECUTIVE DECISION</span>
                <span className="text-[10px] font-mono-code text-slate-500">{isDecided ? 'CASE CLOSED' : 'ONE CHANCE'}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                You can make only <strong>one final decision</strong> per scenario. AI recommends, but you choose.
              </p>
            </div>

            {isDecided ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono-code text-xs space-y-1">
                <span className="text-slate-500 block">FINAL VERDICT EXECUTED:</span>
                <span className="text-base font-bold text-cyan-300 block">{scenario.user_decision}</span>
                <span className="text-[10px] text-slate-400">Decision locked. Check Results page for full audit.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {decisionDefinitions.map((item) => {
                  const isAiRec = lastDossier?.recommended_action === item.decision;
                  return (
                    <div
                      key={item.decision}
                      onClick={() => { sound.playClick(); setSelectedDecision(item.decision); }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all relative ${
                        selectedDecision === item.decision
                          ? 'bg-indigo-950/80 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isAiRec && (
                        <div className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-900 border border-indigo-500/50 text-indigo-300 flex items-center gap-1">
                          <Brain className="w-2.5 h-2.5" /> AI REC
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono-code text-xs font-black text-white">{item.label}</span>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          selectedDecision === item.decision ? 'border-cyan-400 bg-cyan-400' : 'border-slate-700'
                        }`}>
                          {selectedDecision === item.decision && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                    </div>
                  );
                })}

                {/* Advisory note */}
                <div className="flex items-start gap-2 p-2 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-[10px] font-mono text-indigo-400">
                  <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>AI recommendation is advisory. You make the final decision.</span>
                </div>

                {/* Confirm button */}
                <button
                  onClick={() => { if (selectedDecision) onMakeDecision(scenario.id, selectedDecision); }}
                  disabled={!selectedDecision || isSubmittingDecision}
                  className={`w-full mt-2 py-3 px-4 rounded-xl font-mono-code text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedDecision && !isSubmittingDecision
                      ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-lg shadow-cyan-950/50 active:scale-95'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {selectedDecision ? `CONFIRM FINAL VERDICT: ${selectedDecision}` : 'SELECT A DECISION ABOVE'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
