import React from 'react';

interface CyberBadgeProps {
  status: 'safe' | 'warning' | 'critical' | 'neutral' | 'active';
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

export const CyberBadge: React.FC<CyberBadgeProps> = ({
  status,
  children,
  pulse = false,
  className = ''
}) => {
  const getColors = () => {
    switch (status) {
      case 'safe':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'warning':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'critical':
        return 'bg-rose-950/70 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(239,68,68,0.25)]';
      case 'active':
        return 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]';
      default:
        return 'bg-slate-900/80 text-slate-300 border-slate-700/60';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'safe': return 'bg-emerald-400';
      case 'warning': return 'bg-amber-400';
      case 'critical': return 'bg-rose-400';
      case 'active': return 'bg-cyan-400';
      default: return 'bg-slate-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono-code font-semibold border backdrop-blur-sm tracking-wide ${getColors()} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getDotColor()}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${getDotColor()}`} />
      </span>
      {children}
    </span>
  );
};
