import React, { useState } from 'react';
import { GuardianAvatarStyle, GuardianProfile } from '../types';
import { GuardianAvatar } from './GuardianAvatar';
import { api } from '../services/api';
import { sound } from '../utils/audio';
import { Shield, Sparkles, X, Check, Dna, UserCheck } from 'lucide-react';

interface GuardianCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuardianCreated: (profile: GuardianProfile) => void;
  currentName?: string;
  currentAvatar?: GuardianAvatarStyle;
}

const AVATAR_OPTIONS: {
  style: GuardianAvatarStyle;
  title: string;
  role: string;
  description: string;
  borderActive: string;
  accentColor: string;
}[] = [
  {
    style: 'AGENT',
    title: 'OPERATIVE AGENT',
    role: 'Tactical Incident Command',
    description: 'Equipped with adaptive HUD visor. Balanced in field triage and quick containment.',
    borderActive: 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    accentColor: 'text-cyan-400',
  },
  {
    style: 'SCOUT',
    title: 'SIGNAL SCOUT',
    role: 'Acoustic & Urgency Recon',
    description: 'Equipped with dual signal antennae. Specialized in sniffing synthetic panic and voice lures.',
    borderActive: 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    accentColor: 'text-amber-400',
  },
  {
    style: 'ANALYST',
    title: 'THREAT ANALYST',
    role: 'Cryptographic & Forensic Intel',
    description: 'Equipped with hexagonal neural halo. Excels at detecting forged sources and spoofed VPAs.',
    borderActive: 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    accentColor: 'text-purple-400',
  },
  {
    style: 'DEFENDER',
    title: 'BASTION DEFENDER',
    role: 'Community Resilience Shield',
    description: 'Reinforced with titanium crest plating. Minimizes public panic and halts coordinated hoaxes.',
    borderActive: 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    accentColor: 'text-emerald-400',
  },
];

const CALLSIGN_SUGGESTIONS = [
  'Agent Vector',
  'Sentinel Ray',
  'Cipher Scout',
  'Aegis Prime',
  'Nexus Warden',
  'Phantom Key',
  'Echo Guardian',
  'Vanguard Unit 7',
];

export const GuardianCreationModal: React.FC<GuardianCreationModalProps> = ({
  isOpen,
  onClose,
  onGuardianCreated,
  currentName = 'Agent Commander',
  currentAvatar = 'AGENT',
}) => {
  const [name, setName] = useState(currentName);
  const [selectedAvatar, setSelectedAvatar] = useState<GuardianAvatarStyle>(currentAvatar);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRandomizeCallsign = () => {
    sound.playClick();
    const randomName = CALLSIGN_SUGGESTIONS[Math.floor(Math.random() * CALLSIGN_SUGGESTIONS.length)];
    setName(randomName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a Guardian callsign.');
      sound.playWarning();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const profile = await api.createGuardian(name.trim(), selectedAvatar);
      sound.playSuccess();
      onGuardianCreated(profile);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update Guardian.');
      sound.playWarning();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090d1a] border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-code text-cyan-400 uppercase tracking-widest font-bold block">
                DIGITAL GUARDIAN ONBOARDING // PROTOCOL 6
              </span>
              <h2 className="text-lg font-heading font-black text-white tracking-wide">
                INITIALIZE OPERATIVE CALLSIGN & AVATAR
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono-code">
              {error}
            </div>
          )}

          {/* Callsign Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-code text-slate-300 uppercase font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Guardian Callsign</span>
              </label>
              <button
                type="button"
                onClick={handleRandomizeCallsign}
                className="text-[11px] font-mono-code text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Randomize</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={name}
                maxLength={28}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Operative Name (e.g. Agent Commander)..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800 text-sm font-mono-code text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40"
              />
            </div>
          </div>

          {/* Avatar Style Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-code text-slate-300 uppercase font-bold flex items-center gap-1.5">
                <Dna className="w-4 h-4 text-cyan-400" />
                <span>Select Guardian Class & Avatar</span>
              </label>
              <span className="text-[10px] font-mono-code text-slate-500">
                Lightweight 2D HUD Profile
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected = selectedAvatar === opt.style;
                return (
                  <div
                    key={opt.style}
                    onClick={() => {
                      sound.playClick();
                      setSelectedAvatar(opt.style);
                    }}
                    className={`p-3.5 rounded-xl bg-slate-950/60 border cursor-pointer transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? opt.borderActive + ' bg-slate-900/80 ring-1 ring-cyan-500/30'
                        : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <GuardianAvatar style={opt.style} size="md" />

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono-code font-bold ${opt.accentColor}`}>
                          {opt.title}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-cyan-300" />
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] font-mono-code text-slate-400">
                        {opt.role}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 pt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <span className="text-[10px] font-mono-code text-slate-500">
              Rank advances from Rookie Guardian to TRUSTIQ Commander as XP accumulates.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono-code text-slate-400 hover:text-white transition-all"
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono-code text-xs font-bold transition-all shadow-lg shadow-cyan-950/50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>COMMITTING...</span>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>CONFIRM GUARDIAN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
