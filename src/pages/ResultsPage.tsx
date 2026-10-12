import React from 'react';
import { 
  ResultsData, 
  PlayerState 
} from '../types';
import { 
  BarChart3, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Radio,
  Dna,
  HeartHandshake,
  Brain,
  Siren,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ResultsPageProps {
  results: ResultsData | null;
  player: PlayerState;
  onNavigateToDna: () => void;
  onReturnToDashboard: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  results,
  player,
  onNavigateToDna,
  onReturnToDashboard,
}) => {
  const logs = results?.decision_logs || [];
  const total = results?.total_decisions || 0;
  const correct = results?.correct_decisions || 0;
  const accuracy = results?.accuracy_rate || 0;
  const community = results?.community;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 cyber-grid-bg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-cyan-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>PHASE 5 // DECISION AUDIT & CIVIC IMPACT REPORT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
            DECISION CONSEQUENCE REPORT
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological audit of every executive decision, citizen exposure risk, AI override behavior, and Trust DNA evolution.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onNavigateToDna();
          }}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono-code text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-950/40"
        >
          <Dna className="w-4 h-4" />
          <span>VIEW TRUST DNA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5 Summary Dials */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Accuracy */}
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
          <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-1">
            Accuracy Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono-code text-cyan-300">
              {accuracy}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-code mt-1 block">
            {correct} of {total} correct decisions
          </span>
        </div>

        {/* Current Trust Score */}
        <div className="glass-panel p-4 rounded-xl border border-indigo-500/30">
          <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-1">
            Total Trust Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono-code text-indigo-300">
              {player.trust_score}
            </span>
            <span className="text-xs text-indigo-400 font-mono-code">/ 1000</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-code mt-1 block">
            Player Level: {player.level}
          </span>
        </div>

        {/* Community Trust */}
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30">
          <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-1">
            Community Trust
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono-code text-emerald-400">
              {community?.community_trust ?? player.community_trust}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-code mt-1 block">
            Pop: {community?.population ?? player.community_population} Citizens
          </span>
        </div>

        {/* Community Exposure */}
        <div className="glass-panel p-4 rounded-xl border border-rose-500/30">
          <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-1">
            Simulated Exposure
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black font-mono-code ${
              (community?.exposure ?? player.community_exposure) === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {community?.exposure ?? player.community_exposure}
            </span>
            <span className="text-xs text-slate-500 font-mono-code">CITIZENS</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-code mt-1 block">
            Game simulation exposure
          </span>
        </div>

        {/* Harm Prevented */}
        <div className="glass-panel p-4 rounded-xl border border-sky-500/30 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-1">
            Harm Prevented
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono-code text-sky-400">
              {community?.harm_prevented ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-mono-code">SHIELDED</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono-code mt-1 block">
            Harm caused: {community?.harm_caused ?? 0}
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-heading font-bold text-white text-base">
              Decisions Audit Trail & Forensic Telemetry
            </h3>
          </div>
          <span className="text-xs font-mono-code text-slate-400">
            {logs.length} Logged Decisions
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono-code text-xs">
            No decisions recorded yet. Triage communications in the dashboard to build your audit log.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-code">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Scenario / Sender</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">AI Rec</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Trust Pts</th>
                  <th className="py-3 px-4">Comm. Trust</th>
                  <th className="py-3 px-4">Exposure</th>
                  <th className="py-3 px-4">Civic Simulation Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logs.map((log) => {
                  const isOverride = Boolean(log.ai_override_success);
                  return (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-200">{log.title}</div>
                        <div className="text-[11px] text-slate-500">{log.sender}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-900 text-slate-200 border border-slate-700">
                          {log.decision}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {log.ai_recommendation ? (
                          <div className="flex items-center gap-1">
                            <span className="text-indigo-300 font-bold">{log.ai_recommendation}</span>
                            {isOverride && (
                              <span className="px-1 py-0.2 rounded text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                                OVERRIDE
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`flex items-center gap-1.5 font-bold ${
                          log.is_correct ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {log.is_correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {log.is_correct ? 'CORRECT' : 'INCORRECT'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={log.trust_points_delta >= 0 ? 'text-cyan-400' : 'text-rose-400'}>
                          {log.trust_points_delta >= 0 ? `+${log.trust_points_delta}` : log.trust_points_delta}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={log.community_trust_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {log.community_trust_delta >= 0 ? `+${log.community_trust_delta}%` : `${log.community_trust_delta}%`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={log.community_exposure_delta === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {log.community_exposure_delta === 0 ? '0' : `+${log.community_exposure_delta}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-400 line-clamp-2">
                        {log.simulation_impact_summary || log.explanation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            sound.playClick();
            onReturnToDashboard();
          }}
          className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono-code text-xs font-bold"
        >
          RETURN TO DASHBOARD
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onNavigateToDna();
          }}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono-code text-xs font-bold flex items-center gap-2"
        >
          <span>VIEW TRUST DNA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
