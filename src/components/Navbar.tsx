import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  BarChart3, 
  Dna, 
  Home, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Cpu,
  Map,
  Gamepad2
} from 'lucide-react';
import { sound } from '../utils/audio';
import { GuardianAvatar } from './GuardianAvatar';
import { PlayerState } from '../types';


export type PageId = 'home' | 'dashboard' | 'investigation' | 'results' | 'dna' | 'real-investigation' | 'levelmap' | 'game' | 'play';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetGame: () => void;
  selectedScenarioId?: string | null;
  player?: PlayerState;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  soundEnabled,
  onToggleSound,
  onResetGame,
  selectedScenarioId,
  player,
}) => {
  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'play', label: 'Play Arena', icon: <Gamepad2 className="w-4 h-4 text-cyan-400" />, badge: 'ARENA' },
    { id: 'levelmap', label: 'Mission Map', icon: <Map className="w-4 h-4" />, badge: 'GAME' },
    { id: 'dashboard', label: 'Ops Desk', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'results', label: 'Results', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'dna', label: 'Trust DNA', icon: <Dna className="w-4 h-4" /> },
    { 
      id: 'real-investigation', 
      label: 'Real Lab', 
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      badge: 'AI'
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-cyan-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => {
              sound.playClick();
              onNavigate('home');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 text-lg">
                  TRUSTIQ
                </span>
                <span className="text-[10px] font-mono-code px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest">
                  WAR
                </span>
              </div>
              <div className="text-[10px] font-mono-code text-slate-400 tracking-wider">
                Pause. Investigate. Decide.
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    onNavigate(item.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono-code font-semibold transition-all relative ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1 py-0.2 text-[9px] rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Utility buttons */}
          <div className="flex items-center gap-2">
            {player && (
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('dashboard');
                }}
                className="flex items-center gap-2 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 transition-all text-xs font-mono-code group cursor-pointer"
                title={`Guardian: ${player.name} (${player.avatar || 'AGENT'})`}
              >
                <div className="relative flex items-center justify-center">
                  <GuardianAvatar 
                    style={(player.avatar as any) || 'AGENT'} 
                    size="sm" 
                    showGlow={false} 
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900" />
                </div>
                <div className="hidden lg:flex flex-col text-left leading-none">
                  <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {player.name || 'Guardian'}
                  </span>
                  <span className="text-[9px] text-cyan-400 font-mono-code">
                    LVL {player.level || 1} • {player.rank || 'RECRUIT'}
                  </span>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onResetGame();
              }}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-amber-300 transition-all text-xs font-mono-code flex items-center gap-1.5"
              title="Reset Game Session to Phase 1 Initial State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">RESET</span>
            </button>

            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-cyan-300 transition-all"
              title={soundEnabled ? 'Mute Cyber Audio' : 'Enable Cyber Audio'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 overflow-x-auto gap-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onNavigate(item.id);
                }}
                className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono-code transition-all ${
                  isActive ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30' : 'text-slate-400'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
