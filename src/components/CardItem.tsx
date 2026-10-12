import React from 'react';
import { 
  Building2, 
  GraduationCap, 
  Landmark, 
  HeartPulse, 
  MessageSquare, 
  Share2, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Radio, 
  Sparkles,
  Zap,
  Eye,
  FileSearch
} from 'lucide-react';
import { InformationCard, DecisionType } from '../types/game';
import { sound } from '../utils/audio';

interface CardItemProps {
  card: InformationCard;
  availableCredits: number;
  onInvestigate: (cardId: string) => void;
  onDeepInvestigate: (cardId: string) => void;
  onDecision: (cardId: string, decision: DecisionType) => void;
  onOpenFullDossier: (card: InformationCard) => void;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  availableCredits,
  onInvestigate,
  onDeepInvestigate,
  onDecision,
  onOpenFullDossier,
}) => {
  const isResolved = card.status === 'DECIDED';
  const hasCredits = availableCredits >= 5;

  // Category Icon & Accent Colors
  const getCategoryMeta = () => {
    switch (card.category) {
      case 'bank':
        return {
          icon: <Building2 className="w-4 h-4 text-rose-400" />,
          border: 'border-rose-500/30 hover:border-rose-500/50',
          badge: 'bg-rose-950/70 text-rose-300 border-rose-500/40',
        };
      case 'college':
        return {
          icon: <GraduationCap className="w-4 h-4 text-cyan-400" />,
          border: 'border-cyan-500/30 hover:border-cyan-500/50',
          badge: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40',
        };
      case 'government':
        return {
          icon: <Landmark className="w-4 h-4 text-amber-400" />,
          border: 'border-amber-500/30 hover:border-amber-500/50',
          badge: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
        };
      case 'health':
        return {
          icon: <HeartPulse className="w-4 h-4 text-red-400" />,
          border: 'border-red-500/30 hover:border-red-500/50',
          badge: 'bg-red-950/70 text-red-300 border-red-500/40',
        };
      case 'whatsapp':
        return {
          icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
          border: 'border-emerald-500/30 hover:border-emerald-500/50',
          badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
        };
      case 'social':
        return {
          icon: <Share2 className="w-4 h-4 text-sky-400" />,
          border: 'border-sky-500/30 hover:border-sky-500/50',
          badge: 'bg-sky-950/70 text-sky-300 border-sky-500/40',
        };
    }
  };

  const meta = getCategoryMeta();

  // Risk Level Colors
  const getRiskColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/50', label: 'CRITICAL RISK' };
    if (score >= 50) return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50', label: 'MODERATE HOAX' };
    return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50', label: 'AUTHENTIC / SAFE' };
  };

  const riskMeta = getRiskColor(card.aiData.riskScore);

  return (
    <div
      className={`glass-panel rounded-xl border ${meta.border} transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
        isResolved ? 'opacity-85 saturate-75' : 'hover:shadow-cyan-950/20 hover:shadow-2xl'
      }`}
    >
      {/* Top Banner Ribbon */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono-code">
        <div className="flex items-center gap-2">
          {meta.icon}
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${meta.badge}`}>
            {card.categoryLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{card.timestamp}</span>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Source metadata */}
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span className="font-mono-code text-[11px]">Via: {card.channel}</span>
          </div>
          <span className="text-slate-400 font-mono-code text-[11px] truncate max-w-[140px]">
            From: <strong className="text-slate-200">{card.sender}</strong>
          </span>
        </div>

        {/* Message Title */}
        <h3 className="font-heading font-bold text-slate-100 text-base sm:text-lg mb-2.5 leading-snug">
          {card.title}
        </h3>

        {/* Raw Message Content in Terminal Box */}
        <div className="bg-slate-950/90 border border-slate-800/80 rounded-lg p-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mb-4 relative">
          <div className="absolute top-2 right-2 text-[10px] font-mono-code text-slate-500 uppercase">
            RAW INTERCEPT
          </div>
          <p className="pr-12 text-slate-200/90 selection:bg-cyan-500/20">
            "{card.content}"
          </p>
        </div>

        {/* AI INVESTIGATION STATUS / REVEAL BOX */}
        {card.isInvestigated ? (
          <div className="bg-slate-900/95 border border-cyan-500/30 rounded-lg p-3.5 mb-4 relative overflow-hidden transition-all duration-300 scanline-effect">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono-code font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>AI FORENSIC ANALYSIS</span>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold border ${riskMeta.bg} ${riskMeta.text} ${riskMeta.border}`}>
                {riskMeta.label} ({card.aiData.riskScore}%)
              </div>
            </div>

            {/* Core Claim */}
            <div className="text-xs text-slate-300 mb-2.5">
              <span className="font-mono-code text-slate-400 uppercase text-[10px] block mb-0.5">Identified Claim:</span>
              <p className="text-slate-200 font-medium italic">"{card.aiData.claim}"</p>
            </div>

            {/* Manipulation Signals */}
            <div className="mb-2.5">
              <span className="font-mono-code text-slate-400 uppercase text-[10px] block mb-1">
                Detected Manipulation Signals ({card.aiData.manipulationSignals.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {card.aiData.manipulationSignals.map((signal, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-950/80 text-amber-300/90 border border-amber-500/20 font-mono-code"
                  >
                    <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                    {signal}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Explanation preview */}
            <div className="text-xs text-slate-300 mb-2.5">
              <span className="font-mono-code text-slate-400 uppercase text-[10px] block mb-0.5">AI Explanation:</span>
              <p className="text-slate-300 leading-snug line-clamp-2">
                {card.aiData.explanation}
              </p>
            </div>

            {/* Confidence & Deep Scan Indicator */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono-code text-slate-400">
              <span>Model Confidence: <strong className="text-cyan-300">{card.aiData.confidence}%</strong></span>
              {card.isDeepInvestigated ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> DEEP TELEMETRY ACTIVE
                </span>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenFullDossier(card);
                  }}
                  className="text-cyan-400 hover:text-cyan-200 flex items-center gap-1 underline underline-offset-2"
                >
                  <Eye className="w-3 h-3" /> Full Dossier
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Uninvestigated prompt banner */
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 mb-4 text-center">
            <p className="text-xs text-slate-400 mb-2.5">
              Source authenticity unverified. Investigate signals to assess malicious payload before deciding.
            </p>
            <button
              onClick={() => {
                if (hasCredits) {
                  sound.playScan();
                  onInvestigate(card.id);
                } else {
                  sound.playWarning();
                }
              }}
              disabled={isResolved || !hasCredits}
              className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-mono-code text-xs font-bold transition-all ${
                hasCredits
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/30'
                  : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>INVESTIGATE AI SIGNALS</span>
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300 text-[10px]">
                -5 CREDITS
              </span>
            </button>
            {!hasCredits && (
              <span className="block text-[10px] text-rose-400 font-mono-code mt-1.5">
                Insufficient Credits! Make your decision based on raw message analysis.
              </span>
            )}
          </div>
        )}

        {/* DECISION STATUS BADGE IF ALREADY DECIDED */}
        {isResolved && (
          <div className="mb-4 py-2 px-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono-code">
            <span className="text-slate-400">DECISION RECORDED:</span>
            <span className={`font-bold flex items-center gap-1.5 ${
              card.userDecision === 'BLOCK' ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {card.userDecision === 'BLOCK' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {card.userDecision}
            </span>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS BAR */}
      <div className="px-4 py-3 bg-slate-900/95 border-t border-slate-800 flex items-center gap-2">
        {/* If investigated and not deep investigated, option to INVESTIGATE MORE */}
        {card.isInvestigated && !card.isDeepInvestigated && !isResolved && (
          <button
            onClick={() => {
              if (hasCredits) {
                sound.playScan();
                onDeepInvestigate(card.id);
              } else {
                sound.playWarning();
              }
            }}
            disabled={!hasCredits}
            className={`flex-1 py-2 px-2 rounded-lg border font-mono-code text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
              hasCredits
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Perform deep origin, IP, and demographic propagation analysis"
          >
            <FileSearch className="w-3 h-3 text-amber-400" />
            <span>INVESTIGATE MORE</span>
            <span className="text-[9px] text-amber-400/90">(-5 CR)</span>
          </button>
        )}

        {/* If already deep investigated, provide full dossier button */}
        {card.isInvestigated && card.isDeepInvestigated && !isResolved && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenFullDossier(card);
            }}
            className="flex-1 py-2 px-2 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 font-mono-code text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>VIEW DOSSIER</span>
          </button>
        )}

        {/* TRUST BUTTON */}
        <button
          onClick={() => {
            sound.playClick();
            onDecision(card.id, 'TRUST');
          }}
          disabled={isResolved}
          className={`flex-1 py-2.5 px-3 rounded-lg font-mono-code text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            isResolved
              ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 active:scale-[0.98]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>TRUST</span>
        </button>

        {/* BLOCK BUTTON */}
        <button
          onClick={() => {
            sound.playClick();
            onDecision(card.id, 'BLOCK');
          }}
          disabled={isResolved}
          className={`flex-1 py-2.5 px-3 rounded-lg font-mono-code text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            isResolved
              ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40 active:scale-[0.98]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>BLOCK</span>
        </button>
      </div>
    </div>
  );
};
