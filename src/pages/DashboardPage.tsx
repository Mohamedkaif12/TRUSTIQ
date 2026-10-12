import React, { useState, useEffect } from 'react';
import { 
  Scenario, 
  PlayerState, 
  CommunityState,
  DecisionConsequence,
  GuardianProfile,
  GuardianMission,
  GuardianAchievement,
  GuardianAvatarStyle
} from '../types';
import { MetricHud } from '../components/MetricHud';
import { ScenarioCard } from '../components/ScenarioCard';
import { GuardianProfileCard } from '../components/GuardianProfileCard';
import { GuardianCreationModal } from '../components/GuardianCreationModal';
import { GuardianAchievementsModal } from '../components/GuardianAchievementsModal';
import { GuardianMissionsCard } from '../components/GuardianMissionsCard';
import { api } from '../services/api';
import { 
  Search, 
  RefreshCw, 
  AlertCircle,
  ShieldCheck,
  Zap,
  Radio,
  Target,
  Crosshair,
  ArrowRight,
  Bot,
  Sparkles,
  Trophy,
  UserCheck
} from 'lucide-react';
import { sound } from '../utils/audio';

interface DashboardPageProps {
  scenarios: Scenario[];
  player: PlayerState;
  community?: CommunityState;
  onOpenInvestigation: (id: string) => void;
  latestConsequence?: DecisionConsequence | null;
  onCloseConsequence?: () => void;
  onRefreshData: () => void;
  onStartAdaptiveChallenge?: () => void;
  onGuardianUpdated?: (profile: GuardianProfile) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  scenarios,
  player,
  community,
  onOpenInvestigation,
  latestConsequence,
  onCloseConsequence,
  onRefreshData,
  onStartAdaptiveChallenge,
  onGuardianUpdated,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'DECIDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [missions, setMissions] = useState<GuardianMission[]>([]);
  const [achievements, setAchievements] = useState<GuardianAchievement[]>([]);

  // Load missions and achievements
  const loadGuardianMeta = async () => {
    try {
      const [fetchedMissions, fetchedAchievements] = await Promise.all([
        api.getGuardianMissions().catch(() => []),
        api.getGuardianAchievements().catch(() => [])
      ]);
      setMissions(fetchedMissions);
      setAchievements(fetchedAchievements);
    } catch (e) {
      console.warn('Could not load guardian missions/achievements:', e);
    }
  };

  useEffect(() => {
    loadGuardianMeta();
  }, [player.missions_completed, player.xp]);

  const filteredScenarios = scenarios.filter((s) => {
    const matchesFilter = 
      filter === 'ALL' ? true :
      filter === 'PENDING' ? !s.is_decided :
      filter === 'DECIDED' ? s.is_decided : true;

    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const resolvedCount = scenarios.filter(s => s.is_decided).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 cyber-grid-bg">
      {/* ── Top Header & Telemetry Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-cyan-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>TRUSTIQ COMMAND CENTER // PROTOCOL 6 ACTIVE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide">
            DIGITAL GUARDIAN OPERATIONS DESK
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Coordinate digital defense across the simulation. AI investigates — human discretion decides.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => {
              sound.playClick();
              setIsGuardianModalOpen(true);
            }}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 font-mono-code text-xs flex items-center gap-1.5 transition-all"
          >
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>CUSTOMIZE CALLSIGN</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsAchievementsModalOpen(true);
            }}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 font-mono-code text-xs flex items-center gap-1.5 transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>BADGES ({achievements.filter(a => a.unlocked).length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onRefreshData();
              loadGuardianMeta();
            }}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 font-mono-code text-xs flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>SYNC TELEMETRY</span>
          </button>
        </div>
      </div>

      {/* ── 1. DIGITAL GUARDIAN PROFILE CARD ── */}
      <GuardianProfileCard
        player={player}
        onEditGuardian={() => setIsGuardianModalOpen(true)}
        onOpenAchievements={() => setIsAchievementsModalOpen(true)}
      />

      {/* ── 2. COMMUNITY COMMAND-CENTER HUD ── */}
      <MetricHud player={player} community={community} />

      {/* ── 3. NOVA AI ASSISTANT TACTICAL STATUS ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-cyan-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-indigo-950/20">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-code uppercase font-bold text-indigo-300 tracking-wider">
                NOVA // TRUSTIQ INVESTIGATION ASSISTANT
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-code bg-indigo-900/60 text-indigo-200 border border-indigo-700/50">
                Advisory AI
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans italic">
              "Tactical monitoring active. Standing by to analyze URLs, payment intents, synthetic audio, and pixel compression. Remember: I advise — you decide."
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono-code text-indigo-300/80 shrink-0 flex items-center gap-1.5 pl-2 sm:pl-0 border-l sm:border-l-0 border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Credits: {player.investigation_credits} CR Available</span>
        </div>
      </div>

      {/* ── 4. GUARDIAN TRAINING MISSIONS ── */}
      {missions.length > 0 && (
        <GuardianMissionsCard
          missions={missions}
          onDeployMission={(scenarioId) => {
            if (scenarioId) {
              onOpenInvestigation(scenarioId);
            } else if (onStartAdaptiveChallenge) {
              onStartAdaptiveChallenge();
            }
          }}
        />
      )}

      {/* ── 5. ADAPTIVE TRAINING CO-PILOT CALLOUT ── */}
      {scenarios.some(s => !s.is_decided) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900/80 to-cyan-950/40 border border-violet-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-violet-950/20">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-code uppercase font-bold text-violet-300 tracking-wider">
                  ADAPTIVE TRAINING ENGINE ACTIVE
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-code bg-violet-900/60 text-violet-200 border border-violet-700/50">
                  AI Calibrated
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans">
                Cognitive algorithms analyze your Trust DNA to serve calibrated challenges targeting developing skills.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              if (onStartAdaptiveChallenge) {
                onStartAdaptiveChallenge();
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono-code text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-950/50 shrink-0"
          >
            <Crosshair className="w-4 h-4 text-cyan-300" />
            <span>DEPLOY NEXT ADAPTIVE MISSION</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 6. Filter and Search Bar ── */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search scenario title, sender, or payload..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono-code text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: `All Scenarios (${scenarios.length})` },
            { id: 'PENDING', label: `Pending Triage (${scenarios.length - resolvedCount})` },
            { id: 'DECIDED', label: `Resolved (${resolvedCount})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                setFilter(item.id as typeof filter);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code font-semibold transition-all ${
                filter === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 7. Scenarios Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            availableCredits={player.investigation_credits}
            onOpenInvestigation={(id) => onOpenInvestigation(id)}
          />
        ))}
      </div>

      {filteredScenarios.length === 0 && (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-base font-heading font-bold text-slate-300">
            No Scenarios Match Your Query
          </h4>
          <p className="text-xs text-slate-500 font-mono-code">
            Reset filters or clear your search input.
          </p>
        </div>
      )}

      {/* ── 8. Modals ── */}
      <GuardianCreationModal
        isOpen={isGuardianModalOpen}
        onClose={() => setIsGuardianModalOpen(false)}
        currentName={player.name}
        currentAvatar={(player.avatar as GuardianAvatarStyle) || 'AGENT'}
        onGuardianCreated={(profile) => {
          if (onGuardianUpdated) {
            onGuardianUpdated(profile);
          }
          onRefreshData();
          loadGuardianMeta();
        }}
      />

      <GuardianAchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        achievements={achievements}
      />
    </div>
  );
};
