import React from 'react';
import { 
  Building2, 
  Landmark, 
  HeartPulse, 
  GraduationCap, 
  Mic, 
  Image, 
  Search, 
  Clock, 
  Radio, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ShieldAlert,
  Zap,
  Lock
} from 'lucide-react';
import { Scenario, ContentType, DifficultyLevel } from '../types';
import { CyberBadge } from './CyberBadge';
import { sound } from '../utils/audio';

interface ScenarioCardProps {
  scenario: Scenario;
  availableCredits: number;
  onOpenInvestigation: (scenarioId: string) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  availableCredits,
  onOpenInvestigation,
}) => {
  const isDecided = scenario.is_decided;

  // Icon & Type formatting
  const getContentMeta = (type: ContentType) => {
    switch (type) {
      case 'text_upi_link':
        return {
          icon: <Zap className="w-4 h-4 text-rose-400" />,
          label: 'UPI Transfer Link',
          badge: 'critical' as const,
          border: 'border-rose-500/30 hover:border-rose-500/60'
        };
      case 'link':
        return {
          icon: <Landmark className="w-4 h-4 text-amber-400" />,
          label: 'Web Scheme Link',
          badge: 'warning' as const,
          border: 'border-amber-500/30 hover:border-amber-500/60'
        };
      case 'voice_message':
        return {
          icon: <Mic className="w-4 h-4 text-purple-400" />,
          label: 'Audio Note',
          badge: 'critical' as const,
          border: 'border-purple-500/30 hover:border-purple-500/60'
        };
      case 'screenshot_image':
        return {
          icon: <Image className="w-4 h-4 text-cyan-400" />,
          label: 'Image Slip',
          badge: 'active' as const,
          border: 'border-cyan-500/30 hover:border-cyan-500/60'
        };
      case 'text':
      default:
        return {
          icon: <Radio className="w-4 h-4 text-emerald-400" />,
          label: 'Broadcast Text',
          badge: 'neutral' as const,
          border: 'border-slate-700 hover:border-slate-500'
        };
    }
  };

  const getDifficultyBadge = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'EASY': return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';
      case 'MEDIUM': return 'text-amber-400 bg-amber-950/60 border-amber-500/30';
      case 'HARD': return 'text-rose-400 bg-rose-950/60 border-rose-500/30';
    }
  };

  const meta = getContentMeta(scenario.content_type);
  const investigationsCount = scenario.investigations_done.length;

  return (
    <div
      className={`glass-panel rounded-xl border ${meta.border} flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
        isDecided ? 'opacity-85 saturate-75' : 'hover:shadow-2xl hover:shadow-cyan-950/30'
      }`}
    >
      {/* Top Header: Content Type & Timestamp */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {meta.icon}
          <CyberBadge status={meta.badge} className="text-[11px] py-0.5">
            {meta.label}
          </CyberBadge>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono-code px-1.5 py-0.2 rounded border font-bold ${getDifficultyBadge(scenario.difficulty)}`}>
            {scenario.difficulty}
          </span>
          <div className="flex items-center gap-1 text-slate-400 text-xs font-mono-code">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{scenario.timestamp}</span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Sender Info */}
        <div className="flex items-center justify-between text-xs mb-2.5 font-mono-code">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-500 text-[10px] uppercase">FROM:</span>
            <span className="text-slate-200 font-semibold truncate max-w-[200px]">{scenario.sender}</span>
          </div>
          {investigationsCount > 0 && (
            <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-1.5 py-0.2 rounded">
              {investigationsCount} Scan{investigationsCount > 1 ? 's' : ''} Done
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="font-heading font-bold text-slate-100 text-base mb-2.5 leading-snug group-hover:text-cyan-300 transition-colors">
          {scenario.title}
        </h4>

        {/* Message Preview in Tactical Frame */}
        <div className="bg-slate-950/90 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 leading-relaxed font-sans mb-4 relative flex-1">
          <div className="text-[9px] font-mono-code text-slate-500 uppercase mb-1 flex items-center justify-between">
            <span>INTERCEPTED PAYLOAD</span>
            <span className="text-slate-600">ENCRYPTED STREAM</span>
          </div>
          <p className="line-clamp-3 italic text-slate-300">
            "{scenario.content}"
          </p>
        </div>

        {/* Signals preview if investigated */}
        {scenario.investigations_done.length > 0 && (
          <div className="mb-3.5 p-2 rounded bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono-code flex items-center justify-between">
            <span className="text-cyan-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{scenario.manipulation_signals.length} Signals Identified</span>
            </span>
            <span className="text-slate-400 text-[10px]">Telemetry Active</span>
          </div>
        )}

        {/* If Decided, show decision badge */}
        {isDecided && (
          <div className="mb-3.5 p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono-code">
            <span className="text-slate-400">VERDICT RECORDED:</span>
            <span className={`font-bold flex items-center gap-1 ${
              scenario.is_correct ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {scenario.is_correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {scenario.user_decision}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer: Investigation & Decision Button */}
      <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => {
            sound.playClick();
            onOpenInvestigation(scenario.id);
          }}
          className={`w-full py-2.5 px-3 rounded-lg font-mono-code text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            isDecided
              ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              : 'bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-950/40 active:scale-95'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>{isDecided ? 'REVIEW CASE DOSSIER' : 'INVESTIGATE & DECIDE'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
