import React from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Server, 
  Globe, 
  Activity, 
  Zap, 
  Lock,
  FileSearch
} from 'lucide-react';
import { InformationCard, DecisionType } from '../types/game';
import { sound } from '../utils/audio';

interface InvestigationModalProps {
  card: InformationCard | null;
  availableCredits: number;
  onClose: () => void;
  onDeepInvestigate: (cardId: string) => void;
  onDecision: (cardId: string, decision: DecisionType) => void;
}

export const InvestigationModal: React.FC<InvestigationModalProps> = ({
  card,
  availableCredits,
  onClose,
  onDeepInvestigate,
  onDecision,
}) => {
  if (!card) return null;

  const isResolved = card.status === 'DECIDED';
  const hasCredits = availableCredits >= 5;

  const getRiskColor = (score: number) => {
    if (score >= 80) return { 
      label: 'CRITICAL THREAT', 
      text: 'text-rose-400', 
      bg: 'bg-rose-950/60', 
      border: 'border-rose-500/50',
      meter: 'bg-rose-500'
    };
    if (score >= 50) return { 
      label: 'SUSPICIOUS HOAX', 
      text: 'text-amber-400', 
      bg: 'bg-amber-950/60', 
      border: 'border-amber-500/50',
      meter: 'bg-amber-500'
    };
    return { 
      label: 'AUTHENTIC & SAFE', 
      text: 'text-emerald-400', 
      bg: 'bg-emerald-950/60', 
      border: 'border-emerald-500/50',
      meter: 'bg-emerald-500'
    };
  };

  const risk = getRiskColor(card.aiData.riskScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl glass-panel-elevated rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-code text-[11px] text-cyan-400 uppercase tracking-widest font-semibold">
                  AI FORENSIC DOSSIER // DEEP RECON
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-slate-800 text-slate-300">
                  {card.categoryLabel}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-white">
                {card.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Risk Score & Confidence HUD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Risk Gauge */}
            <div className={`p-4 rounded-xl border ${risk.border} ${risk.bg}`}>
              <div className="flex items-center justify-between text-xs font-mono-code mb-2">
                <span className="text-slate-300 font-semibold uppercase">Risk Score Assessment</span>
                <span className={`font-bold ${risk.text}`}>{risk.label}</span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-3xl font-extrabold font-mono-code ${risk.text}`}>
                  {card.aiData.riskScore}
                </span>
                <span className="text-xs text-slate-400 font-mono-code">/ 100 Risk Index</span>
              </div>
              <div className="w-full bg-slate-900/90 rounded-full h-2 overflow-hidden border border-slate-700/50">
                <div 
                  className={`h-2 transition-all duration-700 ${risk.meter}`}
                  style={{ width: `${card.aiData.riskScore}%` }}
                />
              </div>
            </div>

            {/* AI Confidence */}
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/40">
              <div className="flex items-center justify-between text-xs font-mono-code mb-2">
                <span className="text-slate-300 font-semibold uppercase">Model Confidence</span>
                <span className="text-cyan-400 font-bold">SYNTHESIS ENGINE</span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold font-mono-code text-cyan-300">
                  {card.aiData.confidence}%
                </span>
                <span className="text-xs text-slate-400 font-mono-code">Certainty Level</span>
              </div>
              <div className="w-full bg-slate-900/90 rounded-full h-2 overflow-hidden border border-slate-700/50">
                <div 
                  className="h-2 bg-gradient-to-r from-cyan-500 to-indigo-400 transition-all duration-700"
                  style={{ width: `${card.aiData.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Original Message Quote */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-xs text-slate-300">
            <span className="font-mono-code text-slate-500 uppercase text-[10px] block mb-1">
              Intercepted Message Payload:
            </span>
            <p className="italic text-slate-200 text-sm leading-relaxed">
              "{card.content}"
            </p>
          </div>

          {/* Identified Core Claim */}
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
            <span className="font-mono-code text-cyan-400 uppercase text-xs font-bold block mb-1">
              Extracted Core Claim:
            </span>
            <p className="text-sm font-medium text-slate-100">
              {card.aiData.claim}
            </p>
          </div>

          {/* Manipulation Signals */}
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="font-mono-code text-amber-400 uppercase text-xs font-bold">
                Detected Manipulation Signals & Psychological Levers:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {card.aiData.manipulationSignals.map((signal, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950/90 border border-amber-500/25 flex items-start gap-2 text-xs text-slate-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Forensic Explanation */}
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
            <span className="font-mono-code text-indigo-400 uppercase text-xs font-bold block mb-1.5">
              AI Analysis & Grounded Evidence:
            </span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {card.aiData.explanation}
            </p>
          </div>

          {/* Deep Forensics Section */}
          {card.isDeepInvestigated ? (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 space-y-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="font-mono-code text-emerald-300 uppercase text-xs font-bold">
                  Deep Forensics & Network Telemetry (Unlocked)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-code">
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">SOURCE ORIGIN / IP</span>
                  <span className="text-slate-200 font-medium">{card.aiData.deepForensics.sourceOrigin}</span>
                </div>

                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">DOMAIN / SIGNATURE AGE</span>
                  <span className="text-slate-200 font-medium">{card.aiData.deepForensics.domainAge}</span>
                </div>

                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">PROPAGATION DYNAMICS</span>
                  <span className="text-slate-200 font-medium">{card.aiData.deepForensics.propagationRate}</span>
                </div>

                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">TECHNICAL FINGERPRINT</span>
                  <span className="text-slate-200 font-medium">{card.aiData.deepForensics.technicalFingerprint}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="font-mono-code text-xs text-slate-300 font-bold flex items-center justify-center sm:justify-start gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Deep Network Telemetry Locked
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Unlock domain WHOIS age, IP origin geolocation, and server threat signatures.
                </p>
              </div>

              <button
                onClick={() => {
                  if (hasCredits) {
                    sound.playScan();
                    onDeepInvestigate(card.id);
                  } else {
                    sound.playWarning();
                  }
                }}
                disabled={!hasCredits || isResolved}
                className={`px-3 py-2 rounded-lg font-mono-code text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-all ${
                  hasCredits && !isResolved
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/50'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>INVESTIGATE MORE</span>
                <span className="px-1 py-0.2 rounded bg-black/30 text-[10px] text-amber-300">-5 CR</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="px-5 py-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs font-mono-code text-slate-400">
            {isResolved ? (
              <span className="text-cyan-400">STATUS: Case already resolved</span>
            ) : (
              <span>ACTION REQUIRED: Issue verdict for 1,000 community members</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!isResolved) {
                  sound.playClick();
                  onDecision(card.id, 'TRUST');
                  onClose();
                }
              }}
              disabled={isResolved}
              className={`px-4 py-2 rounded-lg font-mono-code text-xs font-bold flex items-center gap-1.5 transition-all ${
                isResolved
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>TRUST MESSAGE</span>
            </button>

            <button
              onClick={() => {
                if (!isResolved) {
                  sound.playClick();
                  onDecision(card.id, 'BLOCK');
                  onClose();
                }
              }}
              disabled={isResolved}
              className={`px-4 py-2 rounded-lg font-mono-code text-xs font-bold flex items-center gap-1.5 transition-all ${
                isResolved
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 active:scale-95'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>BLOCK & QUARANTINE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
