import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Zap, Search, Globe, Mic, Image as ImageIcon, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import {
  MiniGame, QuickScanGame, SourceCheckGame, VoiceAnalysisGame, MediaScanGame,
  MiniGameType,
  buildQuickScanGame, buildSourceCheckGame, buildVoiceAnalysisGame, buildMediaScanGame,
} from './GameSystems';
import { InvestigationActionType } from '../types';

// ── Props ──────────────────────────────────────────────────────────────
interface ScanMiniGameProps {
  scenarioContent: string;
  senderOrContent: string;
  credits: number;
  alreadyScanned: InvestigationActionType[];
  onRunScan: (type: InvestigationActionType, cost: number) => Promise<void>;
  onClose: () => void;
}

// Cost map
const SCAN_COST: Record<MiniGameType, number> = {
  QUICK_SCAN: 3,
  SOURCE_CHECK: 6,
  VOICE_ANALYSIS: 10,
  MEDIA_SCAN: 8,
};

const SCAN_ACTION: Record<MiniGameType, InvestigationActionType> = {
  QUICK_SCAN: 'quick_scan',
  SOURCE_CHECK: 'source_check',
  VOICE_ANALYSIS: 'voice_analysis',
  MEDIA_SCAN: 'screenshot_analysis',
};

// ── Mini-game label / icon map ─────────────────────────────────────────
const SCAN_META: Record<MiniGameType, { label: string; icon: React.ReactNode; color: string }> = {
  QUICK_SCAN:    { label: 'Quick Scan',    icon: <Search className="w-3.5 h-3.5" />,   color: 'text-cyan-300 border-cyan-500/40' },
  SOURCE_CHECK:  { label: 'Source Check',  icon: <Globe className="w-3.5 h-3.5" />,    color: 'text-indigo-300 border-indigo-500/40' },
  VOICE_ANALYSIS:{ label: 'Voice Analysis',icon: <Mic className="w-3.5 h-3.5" />,      color: 'text-pink-300 border-pink-500/40' },
  MEDIA_SCAN:    { label: 'Media Scan',    icon: <ImageIcon className="w-3.5 h-3.5" />, color: 'text-amber-300 border-amber-500/40' },
};

// ── Sub-component: Quick Scan ──────────────────────────────────────────
const QuickScanPanel: React.FC<{
  game: QuickScanGame;
  onUpdate: (g: QuickScanGame) => void;
}> = ({ game, onUpdate }) => {
  const handleTap = (idx: number) => {
    if (game.words[idx].tapped) return;
    const updated = { ...game };
    updated.words = [...game.words];
    updated.words[idx] = { ...updated.words[idx], tapped: true };
    if (updated.words[idx].isTarget) {
      updated.tappedCount += 1;
    }
    onUpdate(updated);
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-400">
        Tap the <span className="text-amber-300 font-bold">urgency/fear phrases</span> in the message:
      </p>
      <div className="flex flex-wrap gap-1 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 max-h-32 overflow-y-auto">
        {game.words.map((w, i) => (
          <button
            key={i}
            onClick={() => handleTap(i)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-all border ${
              w.tapped && w.isTarget
                ? 'bg-amber-500/30 border-amber-500/60 text-amber-200 line-through'
                : w.tapped && !w.isTarget
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-300 line-through opacity-60'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-500/40 hover:text-amber-200'
            }`}
          >
            {w.word}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-400">Tap suspicious urgency words</span>
        <span className={`font-bold ${game.tappedCount >= game.requiredTaps ? 'text-emerald-400' : 'text-amber-400'}`}>
          {game.tappedCount} / {game.requiredTaps} found
        </span>
      </div>
    </div>
  );
};

// ── Sub-component: Source Check ────────────────────────────────────────
const SourceCheckPanel: React.FC<{
  game: SourceCheckGame;
  onUpdate: (g: SourceCheckGame) => void;
}> = ({ game, onUpdate }) => {
  const handleCharClick = (idx: number) => {
    if (game.clicked) return;
    const correct = idx === game.badCharIndex;
    onUpdate({ ...game, clicked: true });
    if (!correct) {
      // wrong click — still completes (cost still paid)
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-400">
        Click the <span className="text-rose-300 font-bold">suspicious character</span> that makes this domain fake:
      </p>
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
        <div className="font-mono text-sm text-white tracking-widest flex flex-wrap justify-center gap-0">
          {game.displayDomain.split('').map((ch, i) => (
            <button
              key={i}
              onClick={() => handleCharClick(i)}
              disabled={game.clicked}
              className={`px-0.5 py-0.5 rounded transition-all text-base font-bold ${
                game.clicked && i === game.badCharIndex
                  ? 'bg-rose-500/40 text-rose-200 ring-2 ring-rose-500'
                  : game.clicked
                  ? 'text-slate-500 cursor-default'
                  : 'hover:bg-slate-700 text-slate-100 cursor-pointer'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-slate-500 font-mono">
          Legitimate: <span className="text-emerald-400">{game.realDomain}</span>
        </div>
      </div>
      {game.clicked && (
        <div className="text-[10px] text-center font-mono text-emerald-300">
          ✓ Suspicious character at position {game.badCharIndex} flagged: "{game.displayDomain[game.badCharIndex]}"
        </div>
      )}
    </div>
  );
};

// ── Sub-component: Voice Analysis ──────────────────────────────────────
const VoiceAnalysisPanel: React.FC<{
  game: VoiceAnalysisGame;
  onUpdate: (g: VoiceAnalysisGame) => void;
}> = ({ game, onUpdate }) => {
  const handleSpikeClick = (idx: number) => {
    if (game.spikes[idx].clicked) return;
    const updated = { ...game };
    updated.spikes = [...game.spikes];
    updated.spikes[idx] = { ...updated.spikes[idx], clicked: true };
    if (updated.spikes[idx].isTarget) {
      updated.clickedCount += 1;
    }
    onUpdate(updated);
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-400">
        Click the <span className="text-pink-300 font-bold">anomalous spikes</span> on the voice waveform (3 targets):
      </p>
      <div className="flex items-end gap-0.5 h-20 bg-slate-950 rounded-xl p-2 border border-slate-800">
        {game.spikes.map((spike, i) => {
          const barH = Math.round(spike.height * 64);
          const isClicked = spike.clicked;
          const isTarget = spike.isTarget;
          return (
            <button
              key={i}
              onClick={() => handleSpikeClick(i)}
              style={{ height: `${barH}px`, minWidth: '6px' }}
              className={`flex-1 rounded-t transition-all ${
                isClicked && isTarget
                  ? 'bg-pink-400 ring-1 ring-pink-300'
                  : isClicked && !isTarget
                  ? 'bg-slate-600 opacity-60'
                  : isTarget
                  ? 'bg-pink-500/80 hover:bg-pink-400 cursor-pointer animate-pulse'
                  : 'bg-cyan-600/40 hover:bg-cyan-500/60 cursor-pointer'
              }`}
              title={isTarget ? 'Anomaly detected' : 'Normal region'}
            />
          );
        })}
      </div>
      <div className="text-[10px] font-mono text-center">
        <span className={game.clickedCount >= game.requiredClicks ? 'text-emerald-400' : 'text-pink-400'}>
          {game.clickedCount} / {game.requiredClicks} anomalies identified
        </span>
      </div>
    </div>
  );
};

// ── Sub-component: Media Scan ──────────────────────────────────────────
const MediaScanPanel: React.FC<{
  game: MediaScanGame;
  onUpdate: (g: MediaScanGame) => void;
}> = ({ game, onUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const dist = Math.hypot(nx - game.targetX, ny - game.targetY);
    const found = dist < 0.12;
    onUpdate({ ...game, lensX: nx, lensY: ny, found: game.found || found });
  }, [game, onUpdate]);

  const lensSize = 40; // px
  const containerW = 280;
  const containerH = 140;

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-400">
        Move the <span className="text-amber-300 font-bold">zoom lens</span> over the image to find the edited region:
      </p>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative rounded-xl overflow-hidden border border-slate-700 cursor-none bg-slate-900"
        style={{ width: containerW, height: containerH }}
      >
        {/* Simulated document background */}
        <div className="absolute inset-0 flex flex-col gap-1.5 p-3 opacity-60">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-2 rounded bg-slate-700"
              style={{ width: `${60 + Math.sin(i * 2.3) * 30}%` }}
            />
          ))}
          {/* The "tampered" region */}
          <div
            className="absolute rounded border border-dashed border-amber-500/0"
            style={{
              left: `${game.targetX * containerW - 20}px`,
              top: `${game.targetY * containerH - 15}px`,
              width: 40, height: 30,
              background: game.found ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0)',
              borderColor: game.found ? 'rgba(245,158,11,0.7)' : 'transparent',
            }}
          />
        </div>
        {/* Lens cursor */}
        <div
          className="absolute pointer-events-none rounded-full border-2 border-amber-400 bg-amber-400/10 backdrop-blur-sm flex items-center justify-center text-[8px] text-amber-300 font-mono"
          style={{
            width: lensSize, height: lensSize,
            left: game.lensX * containerW - lensSize / 2,
            top: game.lensY * containerH - lensSize / 2,
            boxShadow: '0 0 12px rgba(245,158,11,0.5)',
          }}
        >
          ×2
        </div>
      </div>
      {game.found && (
        <div className="text-[10px] font-mono text-amber-300 text-center">
          ✓ Tampered region detected at ({(game.targetX * 100).toFixed(0)}%, {(game.targetY * 100).toFixed(0)}%)
        </div>
      )}
    </div>
  );
};

// ── Main ScanMiniGame component ────────────────────────────────────────
export const ScanMiniGame: React.FC<ScanMiniGameProps> = ({
  scenarioContent,
  senderOrContent,
  credits,
  alreadyScanned,
  onRunScan,
  onClose,
}) => {
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGame | null>(null);
  const [activeType, setActiveType] = useState<MiniGameType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Check if mini-game is complete
  const isMiniGameComplete = useCallback((mg: MiniGame | null): boolean => {
    if (!mg) return false;
    if (mg.type === 'QUICK_SCAN') return mg.tappedCount >= mg.requiredTaps;
    if (mg.type === 'SOURCE_CHECK') return mg.clicked;
    if (mg.type === 'VOICE_ANALYSIS') return mg.clickedCount >= mg.requiredClicks;
    if (mg.type === 'MEDIA_SCAN') return mg.found;
    return false;
  }, []);

  const startMiniGame = (type: MiniGameType) => {
    setLastResult(null);
    let mg: MiniGame;
    if (type === 'QUICK_SCAN') mg = buildQuickScanGame(scenarioContent);
    else if (type === 'SOURCE_CHECK') mg = buildSourceCheckGame(senderOrContent);
    else if (type === 'VOICE_ANALYSIS') mg = buildVoiceAnalysisGame();
    else mg = buildMediaScanGame();
    setActiveMiniGame(mg);
    setActiveType(type);
  };

  const handleConfirmScan = async () => {
    if (!activeType || isSubmitting) return;
    const cost = SCAN_COST[activeType];
    const action = SCAN_ACTION[activeType];
    setIsSubmitting(true);
    try {
      await onRunScan(action, cost);
      const complete = isMiniGameComplete(activeMiniGame);
      setLastResult(complete
        ? '✓ Mini-game complete — bonus signal confidence'
        : '✓ Scan submitted — partial result (mini-game not finished)');
    } catch {
      setLastResult('⚠ Scan endpoint error — credits may have been spent');
    } finally {
      setIsSubmitting(false);
      setActiveMiniGame(null);
      setActiveType(null);
    }
  };

  const ALL_TYPES: MiniGameType[] = ['QUICK_SCAN', 'SOURCE_CHECK', 'MEDIA_SCAN', 'VOICE_ANALYSIS'];

  return (
    <div className="space-y-3">
      {/* Scan selector tabs */}
      {!activeMiniGame && (
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-cyan-400" />
            NOVA FORENSIC MINI-GAMES
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {ALL_TYPES.map((type) => {
              const meta = SCAN_META[type];
              const cost = SCAN_COST[type];
              const action = SCAN_ACTION[type];
              const done = alreadyScanned.includes(action);
              const canAfford = credits >= cost;
              return (
                <button
                  key={type}
                  disabled={!canAfford || isSubmitting}
                  onClick={() => startMiniGame(type)}
                  className={`p-2 rounded-lg border text-left transition-all min-h-[44px] ${
                    done
                      ? 'bg-emerald-950/20 border-emerald-500/30 opacity-70'
                      : canAfford
                      ? `bg-slate-900 hover:bg-slate-800 border-slate-700 hover:${meta.color.split(' ')[1]}`
                      : 'bg-slate-900/40 border-slate-800 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-1 text-[11px] font-bold ${done ? 'text-emerald-300' : 'text-slate-200'}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">-{cost} CR</span>
                  </div>
                  {done && <div className="text-[9px] text-emerald-400 mt-0.5">✓ DONE</div>}
                </button>
              );
            })}
          </div>
          {lastResult && (
            <div className={`text-[10px] font-mono p-2 rounded-lg border ${
              lastResult.startsWith('✓') ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
            }`}>
              {lastResult}
            </div>
          )}
        </div>
      )}

      {/* Active mini-game */}
      {activeMiniGame && activeType && (
        <div className="space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1.5 text-xs font-bold ${SCAN_META[activeType].color.split(' ')[0]}`}>
              {SCAN_META[activeType].icon}
              {SCAN_META[activeType].label}
            </div>
            <button
              onClick={() => { setActiveMiniGame(null); setActiveType(null); }}
              className="text-slate-500 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeMiniGame.type === 'QUICK_SCAN' && (
            <QuickScanPanel game={activeMiniGame} onUpdate={(g) => setActiveMiniGame(g)} />
          )}
          {activeMiniGame.type === 'SOURCE_CHECK' && (
            <SourceCheckPanel game={activeMiniGame} onUpdate={(g) => setActiveMiniGame(g)} />
          )}
          {activeMiniGame.type === 'VOICE_ANALYSIS' && (
            <VoiceAnalysisPanel game={activeMiniGame} onUpdate={(g) => setActiveMiniGame(g)} />
          )}
          {activeMiniGame.type === 'MEDIA_SCAN' && (
            <MediaScanPanel game={activeMiniGame} onUpdate={(g) => setActiveMiniGame(g)} />
          )}

          <button
            onClick={handleConfirmScan}
            disabled={isSubmitting}
            className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all min-h-[40px] ${
              isMiniGameComplete(activeMiniGame)
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
            } disabled:opacity-50`}
          >
            {isSubmitting ? '⟳ Scanning...' : isMiniGameComplete(activeMiniGame)
              ? `✓ Submit Scan (−${SCAN_COST[activeType]} CR)`
              : `Submit Anyway (−${SCAN_COST[activeType]} CR)`}
          </button>
        </div>
      )}
    </div>
  );
};
