import React from 'react';
import { GuardianAvatarStyle } from '../types';

interface GuardianAvatarProps {
  style?: GuardianAvatarStyle;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

const themes: Record<string, {
  bg1: string; bg2: string; border: string; glow: string;
  primary: string; secondary: string; accent: string;
}> = {
  AGENT: {
    bg1: '#050d1a', bg2: '#0a1f35',
    border: '#0e7490', glow: 'rgba(6,182,212,0.55)',
    primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee',
  },
  SCOUT: {
    bg1: '#1a0f00', bg2: '#2d1a00',
    border: '#b45309', glow: 'rgba(245,158,11,0.55)',
    primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24',
  },
  ANALYST: {
    bg1: '#120818', bg2: '#1f0a2d',
    border: '#7c3aed', glow: 'rgba(168,85,247,0.55)',
    primary: '#a855f7', secondary: '#7c3aed', accent: '#c084fc',
  },
  DEFENDER: {
    bg1: '#021a10', bg2: '#042d1a',
    border: '#047857', glow: 'rgba(16,185,129,0.55)',
    primary: '#10b981', secondary: '#047857', accent: '#34d399',
  },
};

type Theme = typeof themes[string];

const AgentSVG: React.FC<{ t: Theme }> = ({ t }) => (
  <g>
    {/* Neck */}
    <rect x="43" y="68" width="14" height="10" rx="2" fill={t.secondary} />
    {/* Shoulders */}
    <path d="M10 100 L15 82 Q28 75 43 78 L57 78 Q72 75 85 82 L90 100 Z" fill={t.bg2} />
    <line x1="15" y1="85" x2="42" y2="79" stroke={t.primary} strokeWidth="1.5" strokeOpacity="0.6" />
    <line x1="85" y1="85" x2="58" y2="79" stroke={t.primary} strokeWidth="1.5" strokeOpacity="0.6" />
    {/* Head */}
    <rect x="26" y="26" width="48" height="44" rx="8" fill={t.bg2} stroke={t.border} strokeWidth="2" />
    {/* Top panel */}
    <rect x="30" y="26" width="40" height="5" rx="2" fill={t.primary} fillOpacity="0.3" />
    <rect x="44" y="22" width="12" height="5" rx="2" fill={t.secondary} />
    {/* Visor band */}
    <rect x="28" y="38" width="44" height="12" rx="3" fill={t.primary} fillOpacity="0.2" stroke={t.accent} strokeWidth="1.2" />
    <rect x="29" y="42" width="42" height="2" rx="1" fill={t.accent} fillOpacity="0.4" />
    {/* Eyes */}
    <ellipse cx="39" cy="44" rx="6" ry="5" fill={t.primary} fillOpacity="0.3" stroke={t.accent} strokeWidth="1.5" />
    <circle cx="39" cy="44" r="2.5" fill={t.accent} fillOpacity="0.9" />
    <circle cx="40" cy="43" r="1" fill="#fff" fillOpacity="0.9" />
    <ellipse cx="61" cy="44" rx="6" ry="5" fill={t.primary} fillOpacity="0.3" stroke={t.accent} strokeWidth="1.5" />
    <circle cx="61" cy="44" r="2.5" fill={t.accent} fillOpacity="0.9" />
    <circle cx="62" cy="43" r="1" fill="#fff" fillOpacity="0.9" />
    {/* Nose */}
    <rect x="48" y="51" width="4" height="5" rx="1" fill={t.secondary} />
    {/* Mouth grille */}
    <rect x="34" y="59" width="32" height="7" rx="3" fill={t.secondary} fillOpacity="0.8" />
    {[36, 41, 46, 51, 56, 61].map(x => (
      <rect key={x} x={x} y="60" width="2" height="5" rx="0.5" fill={t.accent} fillOpacity="0.6" />
    ))}
    {/* Ears */}
    <rect x="19" y="37" width="7" height="16" rx="2" fill={t.secondary} />
    <rect x="74" y="37" width="7" height="16" rx="2" fill={t.secondary} />
  </g>
);

const ScoutSVG: React.FC<{ t: Theme }> = ({ t }) => (
  <g>
    {/* Neck */}
    <rect x="43" y="68" width="14" height="10" rx="2" fill={t.secondary} />
    {/* Shoulders */}
    <path d="M10 100 L15 82 Q28 75 43 78 L57 78 Q72 75 85 82 L90 100 Z" fill={t.bg2} />
    {/* Head */}
    <rect x="26" y="28" width="48" height="42" rx="8" fill={t.bg2} stroke={t.border} strokeWidth="2" />
    {/* Antennae */}
    <line x1="35" y1="28" x2="20" y2="10" stroke={t.primary} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="20" cy="10" r="4" fill={t.accent} />
    <circle cx="20" cy="10" r="2" fill="#fff" fillOpacity="0.9" />
    <line x1="65" y1="28" x2="80" y2="10" stroke={t.primary} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="80" cy="10" r="4" fill={t.accent} />
    <circle cx="80" cy="10" r="2" fill="#fff" fillOpacity="0.5" />
    {/* Big monocle left eye */}
    <circle cx="38" cy="46" r="9" fill={t.primary} fillOpacity="0.12" stroke={t.accent} strokeWidth="2" />
    <circle cx="38" cy="46" r="5" fill={t.primary} fillOpacity="0.35" />
    <circle cx="38" cy="46" r="2.5" fill="#fff" fillOpacity="0.9" />
    <circle cx="36.5" cy="44.5" r="1" fill={t.accent} fillOpacity="0.6" />
    {/* Right data-stream eye */}
    <rect x="55" y="42" width="13" height="4" rx="2" fill={t.primary} fillOpacity="0.5" />
    <rect x="57" y="48" width="9" height="3" rx="1.5" fill={t.secondary} fillOpacity="0.6" />
    <circle cx="65" cy="44" r="2" fill={t.accent} />
    {/* Mouth */}
    <path d="M36 62 Q50 68 64 62" stroke={t.primary} strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Ears */}
    <rect x="19" y="40" width="7" height="14" rx="2" fill={t.secondary} />
    <circle cx="22.5" cy="47" r="2" fill={t.accent} fillOpacity="0.7" />
    <rect x="74" y="40" width="7" height="14" rx="2" fill={t.secondary} />
  </g>
);

const AnalystSVG: React.FC<{ t: Theme }> = ({ t }) => (
  <g>
    {/* Neck */}
    <rect x="43" y="68" width="14" height="10" rx="2" fill={t.secondary} />
    {/* Shoulders */}
    <path d="M10 100 L15 82 Q28 75 43 78 L57 78 Q72 75 85 82 L90 100 Z" fill={t.bg2} />
    {/* Head */}
    <rect x="26" y="28" width="48" height="42" rx="8" fill={t.bg2} stroke={t.border} strokeWidth="2" />
    {/* Hex overlay */}
    <polygon points="50,22 67,28 73,42 67,56 50,62 33,56 27,42 33,28"
      fill={t.primary} fillOpacity="0.06" stroke={t.primary} strokeWidth="1.2" strokeOpacity="0.4" />
    {/* Crown node */}
    <line x1="50" y1="28" x2="50" y2="20" stroke={t.accent} strokeWidth="2" strokeDasharray="2 1" />
    <circle cx="50" cy="19" r="3.5" fill={t.accent} />
    <circle cx="50" cy="19" r="1.5" fill="#fff" fillOpacity="0.8" />
    {/* Left rectangular sensor eye */}
    <rect x="29" y="40" width="15" height="9" rx="2" fill={t.primary} fillOpacity="0.3" stroke={t.accent} strokeWidth="1.5" />
    <rect x="31" y="42" width="11" height="5" rx="1" fill={t.accent} fillOpacity="0.5" />
    <circle cx="36.5" cy="44.5" r="2" fill="#fff" fillOpacity="0.9" />
    {/* Right sensor eye */}
    <rect x="56" y="40" width="15" height="9" rx="2" fill={t.primary} fillOpacity="0.3" stroke={t.accent} strokeWidth="1.5" />
    <rect x="58" y="42" width="11" height="5" rx="1" fill={t.accent} fillOpacity="0.5" />
    <circle cx="63.5" cy="44.5" r="2" fill="#fff" fillOpacity="0.9" />
    {/* Eye bridge */}
    <line x1="44" y1="44.5" x2="56" y2="44.5" stroke={t.secondary} strokeWidth="1.5" strokeDasharray="2 1" />
    {/* Nose */}
    <polygon points="50,53 47,59 53,59" fill={t.secondary} fillOpacity="0.8" />
    {/* Cryptic mouth dots */}
    <rect x="35" y="62" width="30" height="5" rx="2.5" fill={t.secondary} fillOpacity="0.7" />
    {[40, 46.5, 53, 59.5].map(x => (
      <circle key={x} cx={x} cy="64.5" r="1.2" fill={t.accent} fillOpacity="0.7" />
    ))}
    {/* Side panels */}
    <rect x="19" y="36" width="7" height="18" rx="2" fill={t.secondary} />
    <line x1="20" y1="40" x2="25" y2="40" stroke={t.accent} strokeWidth="1" />
    <line x1="20" y1="44" x2="25" y2="44" stroke={t.accent} strokeWidth="1" />
    <rect x="74" y="36" width="7" height="18" rx="2" fill={t.secondary} />
    <line x1="75" y1="40" x2="80" y2="40" stroke={t.accent} strokeWidth="1" />
  </g>
);

const DefenderSVG: React.FC<{ t: Theme }> = ({ t }) => (
  <g>
    {/* Neck */}
    <rect x="43" y="68" width="14" height="10" rx="2" fill={t.secondary} />
    {/* Shoulders — wider/heavier */}
    <path d="M6 100 L10 80 Q25 72 43 76 L57 76 Q75 72 90 80 L94 100 Z" fill={t.bg2} />
    <line x1="10" y1="84" x2="42" y2="77" stroke={t.primary} strokeWidth="2" strokeOpacity="0.5" />
    <line x1="90" y1="84" x2="58" y2="77" stroke={t.primary} strokeWidth="2" strokeOpacity="0.5" />
    {/* Head */}
    <rect x="24" y="26" width="52" height="44" rx="7" fill={t.bg2} stroke={t.border} strokeWidth="2.5" />
    {/* Crest */}
    <path d="M38 26 L50 14 L62 26" fill={t.primary} fillOpacity="0.5" stroke={t.accent} strokeWidth="1.5" />
    <line x1="50" y1="14" x2="50" y2="26" stroke={t.accent} strokeWidth="2" />
    <circle cx="50" cy="13" r="2.5" fill={t.accent} />
    {/* Brow plate */}
    <rect x="24" y="34" width="52" height="7" rx="2" fill={t.primary} fillOpacity="0.35" />
    {/* T-visor slit */}
    <rect x="28" y="41" width="44" height="9" rx="3" fill="#000" fillOpacity="0.7" stroke={t.accent} strokeWidth="1.5" />
    {/* Glowing eyes in visor */}
    <rect x="30" y="43" width="16" height="5" rx="2.5" fill={t.accent} fillOpacity="0.5" />
    <circle cx="38" cy="45.5" r="2.5" fill={t.accent} />
    <circle cx="39" cy="44.5" r="1" fill="#fff" fillOpacity="0.9" />
    <rect x="54" y="43" width="16" height="5" rx="2.5" fill={t.accent} fillOpacity="0.5" />
    <circle cx="62" cy="45.5" r="2.5" fill={t.accent} />
    <circle cx="63" cy="44.5" r="1" fill="#fff" fillOpacity="0.9" />
    {/* Vertical T-bar */}
    <rect x="48" y="41" width="4" height="9" fill="#000" fillOpacity="0.5" />
    {/* Chin guard */}
    <rect x="28" y="57" width="44" height="13" rx="4" fill={t.secondary} fillOpacity="0.75" stroke={t.border} strokeWidth="1" />
    {[34, 40, 46, 52, 58, 64].map(x => (
      <rect key={x} x={x} y="61" width="3" height="5" rx="1" fill={t.accent} fillOpacity="0.4" />
    ))}
    {/* Heavy ear guards */}
    <rect x="15" y="32" width="9" height="24" rx="3" fill={t.secondary} stroke={t.border} strokeWidth="1" />
    <circle cx="19.5" cy="44" r="2.5" fill={t.accent} fillOpacity="0.6" />
    <rect x="76" y="32" width="9" height="24" rx="3" fill={t.secondary} stroke={t.border} strokeWidth="1" />
    <circle cx="80.5" cy="44" r="2.5" fill={t.accent} fillOpacity="0.6" />
  </g>
);

export const GuardianAvatar: React.FC<GuardianAvatarProps> = ({
  style = 'AGENT',
  size = 'md',
  className = '',
  showGlow = true,
}) => {
  const t = themes[style] ?? themes['AGENT'];
  const dim = sizeMap[size] ?? sizeMap.md;

  const renderBody = () => {
    switch (style) {
      case 'SCOUT':    return <ScoutSVG t={t} />;
      case 'ANALYST':  return <AnalystSVG t={t} />;
      case 'DEFENDER': return <DefenderSVG t={t} />;
      case 'AGENT':
      default:         return <AgentSVG t={t} />;
    }
  };

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden rounded-xl select-none ${className}`}
      style={{
        width: dim,
        height: dim,
        background: `linear-gradient(145deg, ${t.bg1}, ${t.bg2})`,
        border: `2px solid ${t.border}`,
        boxShadow: showGlow
          ? `0 0 20px ${t.glow}, 0 0 6px ${t.glow}, inset 0 0 10px rgba(0,0,0,0.5)`
          : undefined,
      }}
    >
      {/* Corner tech marks */}
      {[
        'top-0.5 left-0.5 border-t-2 border-l-2',
        'top-0.5 right-0.5 border-t-2 border-r-2',
        'bottom-0.5 left-0.5 border-b-2 border-l-2',
        'bottom-0.5 right-0.5 border-b-2 border-r-2',
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 ${cls}`}
          style={{ borderColor: t.accent, opacity: 0.7 }}
        />
      ))}

      {/* SVG character */}
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderBody()}
      </svg>

      {/* Scanline overlay */}
      {size !== 'sm' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px)',
          }}
        />
      )}
    </div>
  );
};

