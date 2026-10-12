import React, { useState, useEffect } from 'react';
import { 
  PlayerState, 
  ResultsData,
  TrustDna
} from '../types';
import { api } from '../services/api';
import { 
  Dna, 
  Award, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Brain,
  Zap,
  Target,
  RotateCcw,
  Eye,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TrustDnaPageProps {
  player: PlayerState;
  results: ResultsData | null;
  onResetGame: () => void;
  onBackToDashboard: () => void;
}

const TRAIT_CONFIG: { key: keyof TrustDna; label: string; desc: string; icon: string }[] = [
  { key: 'source_verification', label: 'Source Verification', desc: 'Registry age, WHOIS authenticity, carrier integrity, domain spoofing analysis.', icon: 'Globe' },
  { key: 'manipulation_detection', label: 'Manipulation Detection', desc: 'Detecting deceptive psychological tricks, reverse-payments, and financial traps.', icon: 'AlertTriangle' },
  { key: 'emotional_manipulation', label: 'Emotional Defense', desc: 'Resisting panic triggers, hostage stories, and artificial medical emergencies.', icon: 'HeartHandshake' },
  { key: 'authority_bias', label: 'Authority Bias Control', desc: 'Critical scrutiny of perceived institutions, ministries, exams, and banks.', icon: 'ShieldCheck' },
  { key: 'urgency_detection', label: 'Urgency Detection', desc: 'Identifying artificial scarcity, countdown timers, and midnight quotas.', icon: 'Zap' },
  { key: 'visual_verification', label: 'Visual Verification', desc: 'Forensic inspection of image compression, font misalignment, and digital edits.', icon: 'Eye' },
  { key: 'ai_skepticism', label: 'AI Skepticism', desc: 'Challenging automated AI advisories when forensic evidence suggests otherwise.', icon: 'Brain' },
  { key: 'investigation_efficiency', label: 'Investigation Efficiency', desc: 'Optimizing credit consumption to achieve maximum decision precision.', icon: 'Target' },
];

export const TrustDnaPage: React.FC<TrustDnaPageProps> = ({
  player,
  results,
  onResetGame,
  onBackToDashboard,
}) => {
  const [trustDna, setTrustDna] = useState<TrustDna>({
    source_verification: 50,
    manipulation_detection: 50,
    emotional_manipulation: 50,
    authority_bias: 50,
    urgency_detection: 50,
    visual_verification: 50,
    ai_skepticism: 50,
    investigation_efficiency: 50,
  });
  const [strongestSkill, setStrongestSkill] = useState<string>('source_verification');
  const [weakestSkill, setWeakestSkill] = useState<string>('ai_skepticism');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getTrustDna()
      .then((data) => {
        if (data.trust_dna) setTrustDna(data.trust_dna);
        if (data.strongest_skill) setStrongestSkill(data.strongest_skill);
        if (data.weakest_skill) setWeakestSkill(data.weakest_skill);
      })
      .catch((err) => {
        console.error('Failed to fetch Trust DNA:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const accuracy = results?.accuracy_rate || 0;
  const totalDecisions = results?.total_decisions || 0;

  // Resolve Cognitive Archetype
  let archetype = 'Tactical Information Strategist';
  let tagline = 'Maintains measured verification rigor across financial and civic intelligence channels.';

  const avgDna = Object.values(trustDna).reduce((a, b) => a + b, 0) / 8;

  if (trustDna.ai_skepticism >= 60 && accuracy >= 80) {
    archetype = 'Autonomous Cyber Commander';
    tagline = 'Independent forensic powerhouse. Challenges automated AI advice and isolates complex social engineering.';
  } else if (accuracy >= 80) {
    archetype = 'Apex Digital Sentinel';
    tagline = 'Surgical discernment. Intercepts sophisticated multi-vector attacks with flawless accuracy.';
  } else if (player.community_exposure > 300) {
    archetype = 'Permeable Defense Node';
    tagline = 'Vulnerable to urgency triggers, allowing high-risk financial and medical fraud into the stream.';
  } else if (player.community_trust < 70) {
    archetype = 'Hyper-Cautious Quarantine Agent';
    tagline = 'Zero tolerance firewall that causes public friction by blocking authentic civic notices.';
  } else if (avgDna >= 60) {
    archetype = 'Forensic Trust Engineer';
    tagline = 'Balanced verification protocols with disciplined credit management.';
  }

  // Radar Chart Geometry (8 axes, 45 degrees each)
  const size = 320;
  const center = size / 2;
  const maxRadius = 110;
  const numAxes = TRAIT_CONFIG.length;
  const angleStep = (2 * Math.PI) / numAxes;

  const getCoordinates = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = TRAIT_CONFIG.map((trait, idx) => {
    const val = trustDna[trait.key] ?? 50;
    const { x, y } = getCoordinates(idx, val);
    return `${x},${y}`;
  }).join(' ');

  const gridCircles = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 cyber-grid-bg">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-indigo-400 mb-1">
            <Dna className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>PHASE 5 // TRUST DNA COGNITIVE RADAR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide">
            TRUST DNA PROFILING ENGINE
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time biometric assessment of your decision-making psychology, manipulation resilience, and AI skepticism.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onBackToDashboard();
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 font-mono-code text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>DASHBOARD</span>
        </button>
      </div>

      {/* Primary Archetype Hero Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/40 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-code px-2.5 py-1 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-bold uppercase tracking-widest">
                COGNITIVE ARCHETYPE
              </span>
              <span className="text-xs font-mono-code px-2.5 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
                Level {player.level}
              </span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black font-heading text-white">
              {archetype}
            </h3>
            <p className="text-sm sm:text-base text-slate-300 font-sans max-w-xl italic leading-relaxed">
              "{tagline}"
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 text-center min-w-[130px]">
              <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-1">
                ACCURACY
              </span>
              <span className="text-3xl font-black font-mono-code text-cyan-300">
                {accuracy}%
              </span>
              <span className="text-[9px] font-mono-code text-slate-500 block mt-0.5">
                {totalDecisions} cases resolved
              </span>
            </div>

            <div className="flex-1 md:flex-none p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 text-center min-w-[130px]">
              <span className="text-[10px] font-mono-code text-slate-400 uppercase block mb-1">
                TRUST SCORE
              </span>
              <span className="text-3xl font-black font-mono-code text-indigo-300">
                {player.trust_score}
              </span>
              <span className="text-[9px] font-mono-code text-slate-500 block mt-0.5">
                / 1000 PTS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strongest & Weakest Skill Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strongest Skill */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-slate-950/70 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono-code uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                STRONGEST SKILL // PRIMARY ASSET
              </span>
              <h4 className="text-xl font-black font-heading text-white capitalize">
                {strongestSkill.replace(/_/g, ' ')}
              </h4>
              <p className="text-xs text-slate-300 font-sans">
                {TRAIT_CONFIG.find(t => t.key === strongestSkill)?.desc || 'Consistently accurate forensic judgment.'}
              </p>
            </div>
            <div className="text-right pl-3">
              <span className="text-3xl font-black font-mono-code text-emerald-400">
                {trustDna[strongestSkill as keyof TrustDna] ?? 50}
              </span>
              <span className="text-[10px] font-mono-code text-slate-500 block">/ 100 PTS</span>
            </div>
          </div>
        </div>

        {/* Weakest Skill */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-slate-950/70 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono-code uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                WEAKEST SKILL // ATTENTION REQUIRED
              </span>
              <h4 className="text-xl font-black font-heading text-white capitalize">
                {weakestSkill.replace(/_/g, ' ')}
              </h4>
              <p className="text-xs text-slate-300 font-sans">
                {TRAIT_CONFIG.find(t => t.key === weakestSkill)?.desc || 'Higher vulnerability detected; spend investigation credits.'}
              </p>
            </div>
            <div className="text-right pl-3">
              <span className="text-3xl font-black font-mono-code text-amber-400">
                {trustDna[weakestSkill as keyof TrustDna] ?? 50}
              </span>
              <span className="text-[10px] font-mono-code text-slate-500 block">/ 100 PTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar Chart Visualization + Trait Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Chart (Left 5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-indigo-500/30 flex flex-col items-center justify-center space-y-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono-code text-cyan-400 uppercase font-bold block">
              COGNITIVE OCTAGON RADAR
            </span>
            <span className="text-[10px] font-mono-code text-slate-500 block">
              8-Axis Dimensional Profile (0–100 Scale)
            </span>
          </div>

          <div className="relative flex items-center justify-center p-2">
            <svg width={size} height={size} className="overflow-visible">
              {/* Concentric grid circles */}
              {gridCircles.map((factor, i) => (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={maxRadius * factor}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray={i < 3 ? '3 3' : 'none'}
                />
              ))}

              {/* Grid Axis lines */}
              {TRAIT_CONFIG.map((_, idx) => {
                const { x, y } = getCoordinates(idx, 100);
                return (
                  <line
                    key={idx}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data polygon filled */}
              <polygon
                points={polygonPoints}
                fill="rgba(99, 102, 241, 0.25)"
                stroke="#818cf8"
                strokeWidth="2.5"
                style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))', transition: 'all 0.5s ease' }}
              />

              {/* Data points */}
              {TRAIT_CONFIG.map((trait, idx) => {
                const val = trustDna[trait.key] ?? 50;
                const { x, y } = getCoordinates(idx, val);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#38bdf8"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Axis labels */}
              {TRAIT_CONFIG.map((trait, idx) => {
                const angle = idx * angleStep - Math.PI / 2;
                const labelRadius = maxRadius + 22;
                const lx = center + labelRadius * Math.cos(angle);
                const ly = center + labelRadius * Math.sin(angle);
                const isTop = ly < center - 40;
                const isBottom = ly > center + 40;

                return (
                  <text
                    key={idx}
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[9px] font-mono-code font-bold fill-slate-400"
                  >
                    {trait.label.split(' ')[0]}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono-code text-slate-500 pt-2 border-t border-slate-800/80 w-full justify-center">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/40 border border-indigo-400" />
              <span>Evaluated Persona</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span>Base Level (50)</span>
            </span>
          </div>
        </div>

        {/* 8 Detailed Traits Breakdown (Right 7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono-code text-slate-300 uppercase font-bold flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>8 CORE COGNITIVE CAPABILITIES</span>
            </span>
            <span className="text-[10px] font-mono-code text-slate-500">
              Deterministic Calibration
            </span>
          </div>

          <div className="space-y-3">
            {TRAIT_CONFIG.map((trait) => {
              const score = trustDna[trait.key] ?? 50;
              const isStrongest = trait.key === strongestSkill;
              const isWeakest = trait.key === weakestSkill;

              return (
                <div 
                  key={trait.key}
                  className={`p-3 rounded-xl border transition-all ${
                    isStrongest
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : isWeakest
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-code font-bold text-white">
                        {trait.label}
                      </span>
                      {isStrongest && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-code bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-bold uppercase">
                          PEAK
                        </span>
                      )}
                      {isWeakest && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono-code bg-amber-950 border border-amber-500/50 text-amber-400 font-bold uppercase">
                          LOW
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono-code font-black text-cyan-300">
                      {score} <span className="text-[9px] text-slate-500 font-normal">/ 100</span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mb-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        score >= 70
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                          : score >= 50
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                          : 'bg-gradient-to-r from-amber-500 to-rose-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {trait.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
