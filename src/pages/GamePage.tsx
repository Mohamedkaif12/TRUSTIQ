import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, ArrowLeft, Radio, Zap, AlertTriangle, CheckCircle2,
  XCircle, Clock, Target, Crosshair, Bot, Star, Swords, Lock,
  Users, Eye, Search, Award, RefreshCw, Terminal, Phone,
  ShieldAlert, ShieldCheck, Send, Activity, Flame, HelpCircle,
  TrendingUp, TrendingDown, ChevronDown, ChevronRight, Brain,
  Dna, Sparkles, AlertOctagon, Wifi, WifiOff
} from 'lucide-react';
import {
  PlayerState, CommunityState, Scenario, InvestigationActionType,
  PlayerDecision, DecisionConsequence, AdaptiveChallenge,
  INVESTIGATION_TIERS, AIInvestigationDossier
} from '../types';
import { sound } from '../utils/audio';

interface GamePageProps {
  levelId: number;
  scenarios: Scenario[];
  selectedScenarioId?: string | null;
  onSelectScenario?: (id: string) => void;
  player: PlayerState;
  community?: CommunityState;
  adaptiveBriefing?: AdaptiveChallenge | null;
  onInvestigateAction: (scenarioId: string, actionType: InvestigationActionType) => Promise<void>;
  onMakeDecision: (scenarioId: string, decision: PlayerDecision) => Promise<void>;
  onNextMission: () => void;
  onExitToMap: () => void;
  isSubmitting: boolean;
  latestConsequence?: DecisionConsequence | null;
  onCloseConsequence: () => void;
}

const LEVEL_META: Record<number, { title: string; color: string; badgeColor: string; threat: string; lore: string }> = {
  1: { title: 'ROOKIE DEFENSE SECTOR', color: 'text-emerald-400', badgeColor: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300', threat: 'UPI Reverse-Collect & Phishing', lore: 'Jamtara syndicate targeting Sector Alpha rural pensioners.' },
  2: { title: 'URBAN CIVIC GRID', color: 'text-sky-400', badgeColor: 'border-sky-500/40 bg-sky-950/20 text-sky-300', threat: 'Fake Subsidies & Govt. Impersonation', lore: 'Fraudulent scheme circulars distributed via municipal broadcast channels.' },
  3: { title: 'SYNTHETIC MEDIA FRONT', color: 'text-violet-400', badgeColor: 'border-violet-500/40 bg-violet-950/20 text-violet-300', threat: 'AI Voice Cloning & Neural Deepfakes', lore: 'ElevenLabs-grade voice clones impersonating senior officials.' },
  4: { title: 'COGNITIVE PSYOPS ZONE', color: 'text-amber-400', badgeColor: 'border-amber-500/40 bg-amber-950/20 text-amber-300', threat: 'Coordinated Panic Narratives', lore: 'Coordinated influencer botfarm seeding banking panic.' },
  5: { title: 'INSIDER COMPROMISE CELL', color: 'text-rose-400', badgeColor: 'border-rose-500/40 bg-rose-950/20 text-rose-300', threat: 'Official Feed Compromise', lore: 'Official emergency broadcast handle hijacked with forged advisory.' },
  6: { title: 'TRUST WAR // THE LAST STAND', color: 'text-red-400', badgeColor: 'border-red-500/60 bg-red-950/40 text-red-300', threat: 'MULTI-VECTOR SIMULTANEOUS ASSAULT', lore: 'All 1,000 citizens under coordinated cognitive assault. You are the final line of defense.' },
};

const CITIZEN_SECTORS = [
  { id: 'alpha', name: 'Sector Alpha', audience: 'Retirees & Pensioners', population: 280, icon: '👵', vulnerability: 'HIGH (UPI / Phishing)' },
  { id: 'beta', name: 'Sector Beta', audience: 'Students & Youth', population: 310, icon: '🎓', vulnerability: 'MEDIUM (Jobs & Schemes)' },
  { id: 'gamma', name: 'Sector Gamma', audience: 'Small Merchants', population: 210, icon: '🏪', vulnerability: 'HIGH (Payment Reversals)' },
  { id: 'delta', name: 'Sector Delta', audience: 'Healthcare & Civic', population: 200, icon: '🏥', vulnerability: 'CRITICAL (Panic Feeds)' },
];

const DEFENSE_PROTOCOLS: {
  action: PlayerDecision;
  label: string;
  tagline: string;
  color: string;
  borderColor: string;
  activeColor: string;
  riskForecast: string;
}[] = [
  { action: 'ALLOW', label: 'GREEN CORRIDOR', tagline: 'RELEASE BROADCAST', color: 'text-emerald-400', borderColor: 'border-emerald-500/30', activeColor: 'bg-emerald-700/80 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]', riskForecast: 'Zero friction if genuine; catastrophic financial harm if malicious.' },
  { action: 'VERIFY', label: 'CITIZEN ADVISORY', tagline: 'ATTACH FACT-CHECK BANNER', color: 'text-sky-400', borderColor: 'border-sky-500/30', activeColor: 'bg-sky-700/80 border-sky-400 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)]', riskForecast: 'Educates community; slight delay pending verification confirmation.' },
  { action: 'HOLD', label: 'SANDBOX FREEZE', tagline: 'QUARANTINE PENDING RECON', color: 'text-amber-400', borderColor: 'border-amber-500/30', activeColor: 'bg-amber-700/80 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]', riskForecast: 'Prevents damage spread; civic anxiety if message is authentic.' },
  { action: 'CONTAIN', label: 'FIREWALL ISOLATION', tagline: 'BLOCK VPA / DOMAIN', color: 'text-orange-400', borderColor: 'border-orange-500/30', activeColor: 'bg-orange-700/80 border-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]', riskForecast: '100% loss prevention vs. scams; shields vulnerable citizens from fraud.' },
  { action: 'ESCALATE', label: 'TACTICAL INTERCEPT', tagline: 'ALERT CYBER CELL', color: 'text-red-400', borderColor: 'border-red-500/30', activeColor: 'bg-red-700/80 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]', riskForecast: 'Max syndicate disruption; triggers ISP-level takedown.' },
];

// Renders a single NOVA investigation dossier result
const IntelReport: React.FC<{ action: string; result: AIInvestigationDossier }> = ({ action, result }) => {
  const [expanded, setExpanded] = useState(true);

  const riskColor =
    result.risk_score >= 75 ? 'text-red-400 border-red-500/40 bg-red-950/30' :
    result.risk_score >= 50 ? 'text-amber-400 border-amber-500/40 bg-amber-950/30' :
    'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';

  const statusColor =
    result.status === 'POTENTIAL_THREAT' ? 'text-red-300' :
    result.status === 'SUSPICIOUS' ? 'text-amber-300' :
    result.status === 'UNVERIFIED' ? 'text-sky-300' :
    'text-emerald-300';

  return (
    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex items-center justify-between">
        <span className="font-mono-code font-bold text-indigo-300 uppercase text-[10px] tracking-wider">
          {action.replace(/_/g, ' ')} SCAN
        </span>
        <div className="flex items-center gap-2">
          <span className={`px-1.5 py-0.5 rounded font-mono-code text-[9px] border font-bold ${riskColor}`}>
            RISK {result.risk_score ?? '?'}%
          </span>
          <button onClick={() => setExpanded(e => !e)} className="text-slate-500 hover:text-slate-300 transition-colors">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono-code font-bold ${statusColor}`}>{result.status}</span>
            <span className="text-slate-600 text-[9px]">·</span>
            <span className="text-[10px] font-mono-code text-slate-400">REC: <span className="text-cyan-300 font-bold">{result.recommended_action}</span></span>
          </div>

          {result.claim && (
            <p className="text-[10px] font-mono-code text-slate-300 leading-relaxed italic">"{result.claim}"</p>
          )}

          {result.signals && result.signals.length > 0 && (
            <div className="space-y-1">
              <div className="text-[9px] font-mono-code text-amber-400/80 uppercase tracking-wider">SIGNALS:</div>
              {result.signals.slice(0, 3).map((sig, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                    sig.severity === 'CRITICAL' ? 'bg-red-400' :
                    sig.severity === 'HIGH' ? 'bg-amber-400' :
                    sig.severity === 'MEDIUM' ? 'bg-sky-400' : 'bg-slate-500'
                  }`} />
                  <span className="text-[9px] font-mono-code text-slate-400 leading-tight">{sig.explanation}</span>
                </div>
              ))}
            </div>
          )}

          {result.reasoning && (
            <div className="pt-1.5 border-t border-slate-800/80">
              <p className="text-[9px] font-mono-code text-slate-500 leading-relaxed line-clamp-2">{result.reasoning}</p>
            </div>
          )}

          {result.analysis_source && (
            <div className="text-[8px] font-mono-code text-slate-700 flex items-center gap-1">
              <span className={`w-1 h-1 rounded-full ${result.analysis_source === 'AI' ? 'bg-violet-400' : 'bg-slate-600'}`} />
              via {result.model_used || result.analysis_source}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Inline consequence debrief that appears after a decision
const ConsequenceDebrief: React.FC<{
  consequence: DecisionConsequence;
  onNextMission: () => void;
  onClose: () => void;
  pendingCount: number;
}> = ({ consequence, onNextMission, onClose, pendingCount }) => {
  const isSuccess = consequence.is_correct;
  const xp = consequence.xp_earned ?? 0;
  const trustDelta = consequence.trust_points_delta ?? 0;
  const commDelta = consequence.community_trust_delta ?? 0;
  const dnaDeltas = consequence.trust_dna_deltas ?? {};
  const topDna = Object.entries(dnaDeltas)
    .filter(([, v]) => v !== 0)
    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
    .slice(0, 3);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto`}>
      <div className={`w-full max-w-lg my-auto rounded-2xl border overflow-hidden shadow-2xl ${
        isSuccess ? 'border-emerald-500/50' : 'border-rose-500/50'
      }`} style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #060913 100%)' }}>
        {/* Header */}
        <div className={`px-5 py-4 border-b ${isSuccess ? 'border-emerald-500/20 bg-emerald-950/30' : 'border-rose-500/20 bg-rose-950/30'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isSuccess ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'}`}>
              {isSuccess ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[9px] font-mono-code text-slate-400 uppercase tracking-wider">AFTER-ACTION DEBRIEF // {consequence.scenario_id}</div>
              <h3 className={`text-lg font-heading font-black ${isSuccess ? 'text-emerald-300' : 'text-rose-300'}`}>
                {consequence.verdict_label}
              </h3>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* XP & Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-center">
              <div className="text-amber-400 font-mono-code font-black text-lg">+{xp}</div>
              <div className="text-[9px] font-mono-code text-amber-400/60 uppercase">XP EARNED</div>
            </div>
            <div className={`p-3 rounded-xl text-center ${trustDelta >= 0 ? 'bg-emerald-950/20 border border-emerald-500/20' : 'bg-rose-950/20 border border-rose-500/20'}`}>
              <div className={`font-mono-code font-black text-lg ${trustDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trustDelta > 0 ? '+' : ''}{trustDelta}
              </div>
              <div className={`text-[9px] font-mono-code uppercase ${trustDelta >= 0 ? 'text-emerald-400/60' : 'text-rose-400/60'}`}>TRUST PTS</div>
            </div>
            <div className={`p-3 rounded-xl text-center ${commDelta >= 0 ? 'bg-sky-950/20 border border-sky-500/20' : 'bg-rose-950/20 border border-rose-500/20'}`}>
              <div className={`font-mono-code font-black text-lg ${commDelta >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                {commDelta > 0 ? '+' : ''}{commDelta}
              </div>
              <div className={`text-[9px] font-mono-code uppercase ${commDelta >= 0 ? 'text-sky-400/60' : 'text-rose-400/60'}`}>COMM TRUST</div>
            </div>
          </div>

          {/* Ground Truth Reveal */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-[9px] font-mono-code text-cyan-400 uppercase tracking-wider font-bold">INTELLIGENCE DECLASSIFIED</div>
            <div className="flex flex-wrap gap-3 text-[10px] font-mono-code">
              <span className="text-slate-400">GROUND TRUTH: <span className="text-white font-bold">{consequence.ground_truth}</span></span>
              <span className="text-slate-400">OPTIMAL: <span className="text-white font-bold">{consequence.correct_action}</span></span>
              <span className="text-slate-400">YOUR CALL: <span className={isSuccess ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>{consequence.decision}</span></span>
            </div>
            {consequence.explanation && (
              <p className="text-[10px] text-slate-300 leading-relaxed font-sans">{consequence.explanation}</p>
            )}
          </div>

          {/* Community Impact */}
          {consequence.simulation_impact_summary && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[9px] font-mono-code text-violet-400 uppercase tracking-wider font-bold mb-1">COMMUNITY IMPACT</div>
              <p className="text-[10px] font-mono-code text-slate-400 leading-relaxed">{consequence.simulation_impact_summary}</p>
            </div>
          )}

          {/* Trust DNA Shifts */}
          {topDna.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-[9px] font-mono-code text-violet-400 uppercase tracking-wider font-bold">
                <Dna className="w-3 h-3" />
                <span>TRUST DNA SHIFT</span>
              </div>
              <div className="space-y-1.5">
                {topDna.map(([trait, delta]) => (
                  <div key={trait} className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-code text-slate-400 capitalize">{trait.replace(/_/g, ' ')}</span>
                    <span className={`text-[10px] font-mono-code font-bold flex items-center gap-1 ${delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {delta > 0 ? '+' : ''}{delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guardian reaction */}
          {consequence.guardian_reaction && (
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-2">
              <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono-code text-indigo-200 italic leading-relaxed">"{consequence.guardian_reaction}"</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-slate-300 font-mono-code font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              REVIEW MISSION
            </button>
            <button
              onClick={onNextMission}
              className={`flex-1 py-3 rounded-xl font-mono-code font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                isSuccess
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-900/40'
                  : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white'
              }`}
            >
              <span>{pendingCount > 0 ? 'NEXT THREAT' : 'VIEW MAP'}</span>
              <Crosshair className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GamePage: React.FC<GamePageProps> = ({
  levelId, scenarios, selectedScenarioId: propSelectedId, onSelectScenario,
  player, community, adaptiveBriefing,
  onInvestigateAction, onMakeDecision, onNextMission, onExitToMap,
  isSubmitting, latestConsequence, onCloseConsequence
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    propSelectedId || scenarios.find(s => !s.is_decided)?.id || scenarios[0]?.id || null
  );
  const [selectedProtocol, setSelectedProtocol] = useState<PlayerDecision | null>(null);
  const [investigatingAction, setInvestigatingAction] = useState<string | null>(null);
  const [showConsequence, setShowConsequence] = useState(false);
  const [localConsequence, setLocalConsequence] = useState<DecisionConsequence | null>(null);
  const prevConsequenceRef = useRef<DecisionConsequence | null>(null);

  // Show consequence debrief when latestConsequence changes
  useEffect(() => {
    if (latestConsequence && latestConsequence !== prevConsequenceRef.current) {
      prevConsequenceRef.current = latestConsequence;
      setLocalConsequence(latestConsequence);
      setShowConsequence(true);
    }
  }, [latestConsequence]);

  // Sync prop changes for selected scenario
  useEffect(() => {
    if (propSelectedId && scenarios.some(s => s.id === propSelectedId)) {
      setInternalSelectedId(propSelectedId);
    } else if (!internalSelectedId || !scenarios.some(s => s.id === internalSelectedId)) {
      const next = scenarios.find(s => !s.is_decided)?.id || scenarios[0]?.id || null;
      setInternalSelectedId(next);
    }
  }, [propSelectedId, scenarios]);

  const activeId = internalSelectedId || scenarios[0]?.id || null;
  const currentScenario = scenarios.find(s => s.id === activeId) || scenarios[0];
  const pendingScenarios = scenarios.filter(s => !s.is_decided);
  const completedScenarios = scenarios.filter(s => s.is_decided);
  const isZoneCleared = scenarios.length > 0 && pendingScenarios.length === 0;
  const meta = LEVEL_META[levelId] || LEVEL_META[1];
  const isTrustWar = levelId === 6;

  const handleSelectScenario = (id: string) => {
    sound.playClick();
    setInternalSelectedId(id);
    setSelectedProtocol(null);
    onSelectScenario?.(id);
  };

  const handleInvestigate = async (action: InvestigationActionType) => {
    if (!currentScenario) return;
    setInvestigatingAction(action);
    try {
      await onInvestigateAction(currentScenario.id, action);
    } finally {
      setInvestigatingAction(null);
    }
  };

  const handleExecuteProtocol = async () => {
    if (!currentScenario || !selectedProtocol || isSubmitting) return;
    sound.playClick();
    await onMakeDecision(currentScenario.id, selectedProtocol);
  };

  const handleConsequenceContinue = () => {
    setShowConsequence(false);
    setLocalConsequence(null);
    onCloseConsequence();
    onNextMission();
  };

  const handleConsequenceClose = () => {
    setShowConsequence(false);
    // keep latestConsequence in parent so the inline debrief in scenario card shows
  };

  const difficultyColors: Record<string, string> = {
    EASY: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
    MEDIUM: 'text-amber-400 border-amber-500/40 bg-amber-950/30',
    HARD: 'text-red-400 border-red-500/40 bg-red-950/30'
  };

  if (!currentScenario && scenarios.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#060913] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md p-8 rounded-2xl border border-slate-700/60 shadow-2xl" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #060913 100%)' }}>
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
          <h2 className="text-2xl font-black font-heading text-white">ZONE DEFENDED!</h2>
          <p className="text-slate-400 font-mono-code text-sm">All operations in this defense sector are secured.</p>
          <button onClick={onExitToMap} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-mono-code font-bold text-sm">
            RETURN TO MISSION MAP
          </button>
        </div>
      </div>
    );
  }

  const latestInvestigations = Object.entries(currentScenario?.unlocked_investigations || {});
  const activeProtocolData = DEFENSE_PROTOCOLS.find(p => p.action === selectedProtocol);
  const effectiveIsDecided = !!currentScenario?.is_decided;

  return (
    <>
      {/* Inline Consequence Debrief Modal */}
      {showConsequence && localConsequence && (
        <ConsequenceDebrief
          consequence={localConsequence}
          onNextMission={handleConsequenceContinue}
          onClose={handleConsequenceClose}
          pendingCount={pendingScenarios.length}
        />
      )}

      <div className={`min-h-[calc(100vh-4rem)] bg-[#050811] text-slate-100 relative ${isTrustWar ? 'bg-gradient-to-b from-red-950/20 via-[#050811] to-[#050811]' : ''}`}>
        {/* Ambient lighting */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] blur-[140px] pointer-events-none ${isTrustWar ? 'bg-red-500/8' : 'bg-cyan-500/5'}`} />

        {/* ── TOP TACTICAL HUD ── */}
        <div className={`sticky top-0 z-20 backdrop-blur-md border-b ${isTrustWar ? 'bg-red-950/40 border-red-900/60' : 'bg-[#050811]/95 border-slate-800/80'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { sound.playClick(); onExitToMap(); }}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
                title="Return to World Map"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono-code font-bold uppercase tracking-widest ${meta.color}`}>
                    {meta.title}
                  </span>
                  <span className="text-slate-600 text-[9px]">·</span>
                  <span className="text-[9px] font-mono-code text-slate-400">SECTOR {levelId}</span>
                </div>
                <div className="text-xs font-black font-heading text-white tracking-wide flex items-center gap-1.5">
                  {isTrustWar && <Swords className="w-3.5 h-3.5 text-red-400 animate-pulse" />}
                  <span>THREAT VECTOR: {meta.threat}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats HUD */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-mono-code text-cyan-300 font-bold">{player.investigation_credits} CR</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-mono-code text-emerald-300 font-bold">{community?.community_trust ?? player.community_trust}%</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-mono-code text-amber-300 font-bold">{player.xp ?? 0} XP</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800">
                <Shield className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-mono-code text-violet-300 font-bold">Lv.{player.level}</span>
              </div>
            </div>
          </div>

          {/* Mission tabs */}
          {scenarios.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {scenarios.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectScenario(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono-code font-semibold whitespace-nowrap transition-all shrink-0
                    ${activeId === s.id
                      ? isTrustWar
                        ? 'bg-red-500/20 border border-red-500/50 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                        : 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : s.is_decided
                        ? s.is_correct
                          ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400'
                          : 'bg-red-950/40 border border-red-500/30 text-red-400'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {s.is_decided
                    ? (s.is_correct ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-red-400" />)
                    : <Radio className="w-3 h-3 text-amber-400 animate-pulse" />}
                  <span>OPS {idx + 1}: {s.difficulty}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zone complete banner */}
        {isZoneCleared && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-cyan-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-500/40 text-emerald-300">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-mono-code text-emerald-400 font-bold uppercase tracking-wider">ZONE {levelId} SECURED</div>
                  <div className="text-sm font-heading font-black text-white">All threats neutralized. Proceed to next sector.</div>
                </div>
              </div>
              <button
                onClick={() => { sound.playClick(); onExitToMap(); }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono-code font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                RETURN TO MAP
              </button>
            </div>
          </div>
        )}

        {/* ── MAIN 3-COLUMN LAYOUT ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── COL 1: COMMUNITY RADAR (3 cols) ── */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-mono-code font-bold uppercase text-white tracking-widest">COMMUNITY RADAR</span>
                </div>
                <span className="text-[9px] font-mono-code text-cyan-300 font-bold">1,000 CITIZENS</span>
              </div>

              {/* Trust & Exposure meters */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-[8px] font-mono-code text-emerald-400 uppercase tracking-wider">TRUST</div>
                  <div className="text-sm font-mono-code font-black text-emerald-300">{community?.community_trust ?? player.community_trust}%</div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${community?.community_trust ?? player.community_trust}%` }} />
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-[8px] font-mono-code text-rose-400 uppercase tracking-wider">EXPOSURE</div>
                  <div className="text-sm font-mono-code font-black text-rose-300">{community?.exposure ?? player.community_exposure}%</div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, community?.exposure ?? player.community_exposure)}%` }} />
                  </div>
                </div>
              </div>

              {/* Sector quadrants */}
              <div className="space-y-1.5">
                {CITIZEN_SECTORS.map(sec => (
                  <div key={sec.id} className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-start gap-2.5 hover:border-cyan-500/30 transition-all">
                    <span className="text-base shrink-0 mt-0.5">{sec.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-200">
                        <span>{sec.name}</span>
                        <span className="font-mono-code text-cyan-400 text-[9px]">{sec.population}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">{sec.audience}</div>
                      <div className="mt-0.5 text-[8px] font-mono-code text-amber-400/90 font-semibold">{sec.vulnerability}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live chatter */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/60 space-y-1">
                <div className="text-[8px] font-mono-code text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>INTERCEPTED CHATTER</span>
                </div>
                <p className="text-[9px] font-mono-code text-slate-400 italic leading-snug">
                  "{currentScenario?.title?.includes('UPI')
                    ? 'Resident_42: Someone sent ₹2,500 by mistake, asking to reverse...'
                    : currentScenario?.title?.includes('WHO')
                      ? 'Student_Rohit: WHO scholarship link offering $500 stipend...'
                      : 'Citizen_91: Urgent notice from the network. Verifying credibility...'}"
                </p>
              </div>
            </div>

            {/* NOVA Adaptive Briefing */}
            {adaptiveBriefing && !effectiveIsDecided && (
              <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-400" />
                  <span className="text-[10px] font-mono-code font-bold uppercase text-violet-300">NOVA TACTICAL SCAN</span>
                </div>
                <p className="text-[10px] font-mono-code text-slate-300 leading-relaxed">{adaptiveBriefing.reason}</p>
                <div className="text-[9px] font-mono-code text-violet-300">
                  Focus: <span className="font-bold underline">{adaptiveBriefing.training_focus}</span>
                </div>
              </div>
            )}

            {/* Progress in zone */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3">
              <div className="text-[9px] font-mono-code text-slate-500 uppercase tracking-wider mb-2">ZONE PROGRESS</div>
              <div className="flex gap-2">
                {scenarios.map((s) => (
                  <div key={s.id} className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                    s.is_decided
                      ? s.is_correct ? 'bg-emerald-500' : 'bg-rose-500'
                      : s.id === activeId ? 'bg-amber-400 animate-pulse' : 'bg-slate-800'
                  }`} />
                ))}
              </div>
              <div className="flex justify-between mt-1.5 text-[8px] font-mono-code text-slate-600">
                <span>{completedScenarios.length}/{scenarios.length} CLEARED</span>
                <span>{pendingScenarios.length} PENDING</span>
              </div>
            </div>
          </div>

          {/* ── COL 2: THREAT FORENSIC TERMINAL (5 cols) ── */}
          <div className="lg:col-span-5 space-y-5">
            <div className={`rounded-2xl border overflow-hidden transition-all shadow-xl ${
              effectiveIsDecided
                ? currentScenario?.is_correct
                  ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-900/90 to-slate-900/90'
                  : 'border-red-500/40 bg-gradient-to-br from-red-950/20 via-slate-900/90 to-slate-900/90'
                : isTrustWar
                  ? 'border-red-500/50 bg-gradient-to-br from-red-950/20 via-slate-900/90 to-slate-900/90 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                  : 'border-cyan-500/30 bg-slate-900/80'
            }`}>
              {/* Terminal header */}
              <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-mono-code uppercase font-bold text-slate-300 tracking-wider">
                    INTERCEPT TELEMETRY // {currentScenario?.id?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono-code border font-bold ${difficultyColors[currentScenario?.difficulty || 'MEDIUM'] || difficultyColors.MEDIUM}`}>
                    {currentScenario?.difficulty}
                  </span>
                  {effectiveIsDecided && (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono-code border font-bold ${
                      currentScenario?.is_correct ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' : 'border-red-500/40 text-red-300 bg-red-950/40'
                    }`}>
                      {currentScenario?.is_correct ? '✓ DEFENSE SUCCESS' : '✗ COMPROMISED'}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black font-heading text-white mb-1">
                    {currentScenario?.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono-code text-slate-400">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-cyan-400" />
                      <span>ORIGIN: <span className="text-cyan-300 font-bold">{currentScenario?.sender}</span></span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{currentScenario?.timestamp}</span>
                    </span>
                  </div>
                </div>

                {/* Message payload */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 font-mono-code text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap relative">
                  <div className="absolute top-2 right-2 text-[8px] font-mono-code text-slate-600 uppercase">RAW PAYLOAD</div>
                  {currentScenario?.content}
                </div>

                {/* Manipulation signals */}
                {currentScenario?.manipulation_signals?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[9px] font-mono-code text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>COGNITIVE MANIPULATION SIGNALS DETECTED:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {currentScenario.manipulation_signals.map((sig, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[10px] font-mono-code text-amber-300">
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post-decision verdict debrief (inline in card) */}
                {effectiveIsDecided && (
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    currentScenario?.is_correct
                      ? 'bg-emerald-950/30 border-emerald-500/30'
                      : 'bg-red-950/30 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      {currentScenario?.is_correct
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        : <XCircle className="w-4 h-4 text-red-400" />}
                      <span className={`text-xs font-mono-code font-bold ${currentScenario?.is_correct ? 'text-emerald-300' : 'text-red-300'}`}>
                        {currentScenario?.is_correct ? 'THREAT CONTAINED // ASSETS PRESERVED' : 'SECTOR COMPROMISED // DAMAGE RECORDED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{currentScenario?.explanation}</p>
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-3 text-[10px] font-mono-code">
                      <span className="text-slate-400">GROUND TRUTH: <span className="text-white font-bold">{currentScenario?.ground_truth}</span></span>
                      <span className="text-slate-400">OPTIMAL: <span className="text-white font-bold">{currentScenario?.correct_action}</span></span>
                      <span className="text-slate-400">YOUR VERDICT: <span className={currentScenario?.is_correct ? 'text-emerald-300 font-bold' : 'text-red-300 font-bold'}>{currentScenario?.user_decision}</span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next/Replay buttons when decided */}
            {effectiveIsDecided && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { sound.playClick(); onNextMission(); }}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono-code font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
                >
                  <span>{pendingScenarios.length > 0 ? 'NEXT THREAT' : 'RETURN TO MAP'}</span>
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ── COL 3: NOVA FORENSICS + DEFENSE PROTOCOLS (4 cols) ── */}
          <div className="lg:col-span-4 space-y-5">
            {/* NOVA AI Investigation Arsenal */}
            <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-mono-code font-bold text-indigo-300 uppercase tracking-widest">
                    NOVA FORENSIC TOOLS
                  </span>
                </div>
                <span className="text-[10px] font-mono-code text-cyan-300 font-bold">{player.investigation_credits} CR</span>
              </div>

              <div className="space-y-1.5">
                {INVESTIGATION_TIERS.map(tier => {
                  const isDone = currentScenario?.investigations_done?.includes(tier.type);
                  const canAfford = player.investigation_credits >= tier.cost;
                  const isRunning = investigatingAction === tier.type;

                  return (
                    <button
                      key={tier.type}
                      onClick={() => !isDone && canAfford && !isRunning && !effectiveIsDecided && handleInvestigate(tier.type)}
                      disabled={isDone || !canAfford || isRunning || effectiveIsDecided}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all
                        ${isDone
                          ? 'border-emerald-500/30 bg-emerald-950/20 cursor-default'
                          : effectiveIsDecided
                            ? 'border-slate-800 bg-slate-950/20 opacity-30 cursor-not-allowed'
                            : canAfford
                              ? 'border-indigo-500/20 bg-slate-950/60 hover:border-indigo-400/50 hover:bg-slate-900 cursor-pointer active:scale-[0.98]'
                              : 'border-slate-800 bg-slate-950/30 opacity-40 cursor-not-allowed'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${isDone ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-800 text-indigo-400'}`}>
                          {isRunning ? (
                            <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                          ) : isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Search className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className={`text-[11px] font-mono-code font-bold ${isDone ? 'text-emerald-300' : 'text-slate-200'}`}>
                            {tier.label}
                          </div>
                          <div className="text-[8px] text-slate-500 font-mono-code line-clamp-1">{tier.description}</div>
                        </div>
                      </div>
                      <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-mono-code font-bold ${isDone ? 'text-emerald-400' : 'text-cyan-400'}`}>
                        {isDone ? 'DONE' : isRunning ? '...' : `-${tier.cost}CR`}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Intelligence Reports */}
              {latestInvestigations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="text-[9px] font-mono-code text-cyan-400 uppercase tracking-wider font-bold">
                    DECODED INTELLIGENCE ({latestInvestigations.length}):
                  </div>
                  {latestInvestigations.map(([action, result]) => (
                    <IntelReport key={action} action={action} result={result as AIInvestigationDossier} />
                  ))}
                </div>
              )}
            </div>

            {/* DEFENSE PROTOCOL MATRIX */}
            {!effectiveIsDecided && (
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-4 space-y-3.5 shadow-2xl">
                <div>
                  <div className="text-[10px] font-mono-code text-cyan-400 font-bold uppercase tracking-widest">CYBER DEFENSE CONSOLE</div>
                  <p className="text-[11px] text-slate-400 font-mono-code mt-0.5">
                    AI investigates. <span className="text-cyan-300 font-bold">Human decides.</span> Select protocol:
                  </p>
                </div>

                <div className="space-y-1.5">
                  {DEFENSE_PROTOCOLS.map(proto => {
                    const isSelected = selectedProtocol === proto.action;
                    return (
                      <div
                        key={proto.action}
                        onClick={() => { sound.playClick(); setSelectedProtocol(proto.action); }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.99] ${
                          isSelected
                            ? proto.activeColor
                            : `${proto.borderColor} bg-slate-950/60 hover:bg-slate-900/90`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-mono-code text-xs font-black tracking-wide ${isSelected ? 'text-white' : proto.color}`}>
                            {proto.label}
                          </span>
                          <span className={`text-[9px] font-mono-code uppercase font-bold ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                            {proto.action}
                          </span>
                        </div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                          {proto.tagline}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Forecast panel */}
                {activeProtocolData && (
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
                    <div className="text-[9px] font-mono-code text-cyan-400 uppercase tracking-wider font-bold">IMPACT FORECAST:</div>
                    <p className="text-[10px] font-mono-code text-slate-300 leading-relaxed">{activeProtocolData.riskForecast}</p>
                  </div>
                )}

                {/* ENGAGE BUTTON */}
                <button
                  onClick={handleExecuteProtocol}
                  disabled={!selectedProtocol || isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-mono-code font-black text-xs sm:text-sm tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>PROCESSING...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{selectedProtocol ? `ENGAGE ${selectedProtocol} PROTOCOL` : 'SELECT PROTOCOL TO ENGAGE'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
