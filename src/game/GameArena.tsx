import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Zap, 
  Crosshair, 
  Activity,
  ArrowLeft,
  Navigation,
  FileText,
  Volume2,
  VolumeX,
  X,
  Clock,
  Sparkles,
  Lock,
  Play,
  Globe,
  Search,
  Mic,
  ShieldAlert,
  ChevronRight,
  Eye,
  Trophy,
  Swords,
  CreditCard,
  Target,
  Dna,
  Award,
  ShieldCheck,
  Brain,
  Map as MapIcon,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Radio,
  ArrowUp,
  ArrowDown,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon
} from 'lucide-react';
import { 
  PlayerState, 
  CommunityState, 
  Scenario, 
  PlayerDecision, 
  AIInvestigationDossier,
  InvestigationActionType,
  TrustDna,
  AdaptiveChallenge,
  GuardianAvatarStyle
} from '../types';
import { api } from '../services/api';
import { sound } from '../utils/audio';
import {
  AimedToolKey, AimedTool, AIMED_TOOLS,
  ToolProjectile, FreezeField,
  SkillState, INITIAL_SKILL_STATE,
  ThreatVariant,
} from './GameSystems';
import { ScanMiniGame } from './ScanMiniGame';

export interface GameArenaProps {
  player: PlayerState;
  community?: CommunityState;
  initialLevelId?: number;
  onUpdatePlayer?: (player: PlayerState) => void;
  onUpdateCommunity?: (community: CommunityState) => void;
  onBackToMap: () => void;
  onNavigateToMissions?: () => void;
}

// ── Sector Configuration ──────────────────────────────────────────────
export interface SectorDef {
  id: 'alpha' | 'beta' | 'gamma' | 'delta';
  name: string;
  demographic: string;
  population: number;
  color: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  iconText: string;
  xRange: [number, number];
  yRange: [number, number];
}

export const SECTOR_DEFS: SectorDef[] = [
  {
    id: 'alpha',
    name: 'SECTOR ALPHA',
    demographic: 'Pensioners & Seniors',
    population: 250,
    color: '#fbbf24',       // Amber
    accentColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    iconText: 'PENSION SERVICES',
    xRange: [0.03, 0.48],
    yRange: [0.05, 0.48],
  },
  {
    id: 'beta',
    name: 'SECTOR BETA',
    demographic: 'Youth & Tech Hub',
    population: 300,
    color: '#06b6d4',       // Cyan
    accentColor: '#0ea5e9',
    bgColor: 'rgba(6, 182, 212, 0.05)',
    borderColor: 'rgba(6, 182, 212, 0.35)',
    iconText: 'DIGITAL COMMONS',
    xRange: [0.52, 0.97],
    yRange: [0.05, 0.48],
  },
  {
    id: 'gamma',
    name: 'SECTOR GAMMA',
    demographic: 'Merchants & Bazaar',
    population: 250,
    color: '#10b981',       // Emerald
    accentColor: '#059669',
    bgColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    iconText: 'UPI MARKET EXCHANGE',
    xRange: [0.03, 0.48],
    yRange: [0.52, 0.95],
  },
  {
    id: 'delta',
    name: 'SECTOR DELTA',
    demographic: 'Healthcare & Critical Care',
    population: 200,
    color: '#ec4899',       // Pink
    accentColor: '#db2777',
    bgColor: 'rgba(236, 72, 153, 0.05)',
    borderColor: 'rgba(236, 72, 153, 0.35)',
    iconText: 'CIVIC HEALTH GRID',
    xRange: [0.52, 0.97],
    yRange: [0.52, 0.95],
  },
];

// ── Level System Definitions ──────────────────────────────────────────
export interface GameLevelDef {
  id: number;
  code: string;
  title: string;
  theme: string;
  subtitle: string;
  description: string;
  threatType: string;
  categoryFilter: string[];
  scenarioIds: string[];
  xpRequired: number;
  missionsRequired: number;
  waveDuration: number;
  totalThreats: number;
  concurrentSpawns: number;
  accentColor: string;
  borderColor: string;
  badge: string;
  lore: string;
}

export const GAME_LEVELS: GameLevelDef[] = [
  {
    id: 1,
    code: 'L1',
    title: 'Signal Scout',
    theme: 'phishing/UPI',
    subtitle: 'Level 1 — Rural & P2P Finance Grid',
    description: 'First perimeter deployment. Intercept high-velocity UPI reverse collect traps and urgent refund phishing links targeting elderly citizens.',
    threatType: 'UPI Traps & Phishing Links',
    categoryFilter: ['upi', 'refund', 'collect', 'phish'],
    scenarioIds: ['scenario-1', 'scenario-2'],
    xpRequired: 0,
    missionsRequired: 0,
    waveDuration: 90,
    totalThreats: 5,
    concurrentSpawns: 1,
    accentColor: '#10b981',
    borderColor: 'border-emerald-500/40',
    badge: 'LEVEL 1',
    lore: 'Jamtara syndicate cells targeting Sector Alpha. Secure the community payment nodes.'
  },
  {
    id: 2,
    code: 'L2',
    title: 'Social Trap',
    theme: 'misinformation/fake schemes',
    subtitle: 'Level 2 — Campus & Civic Networks',
    description: 'Civic misinformation surges. Neutralize fake government welfare schemes, exam postponement rumors, and viral hoaxes.',
    threatType: 'Fake Welfare & Civic Hoaxes',
    categoryFilter: ['scheme', 'student', 'exam', 'health', 'misinformation'],
    scenarioIds: ['scenario-3', 'scenario-4'],
    xpRequired: 50,
    missionsRequired: 1,
    waveDuration: 90,
    totalThreats: 5,
    concurrentSpawns: 1,
    accentColor: '#38bdf8',
    borderColor: 'border-sky-500/40',
    badge: 'LEVEL 2',
    lore: 'Disinformation cells weaponizing social channels to induce panic and false enrollment.'
  },
  {
    id: 3,
    code: 'L3',
    title: 'Authority Attack',
    theme: 'authority impersonation',
    subtitle: 'Level 3 — Institutional Spoofing',
    description: 'Hostile syndicates impersonating cyber police, fake digital arrest warrants, and judicial summonses targeting merchant terminals.',
    threatType: 'Digital Arrest & Police Impersonation',
    categoryFilter: ['police', 'arrest', 'challan', 'court', 'authority'],
    scenarioIds: ['scenario-5', 'scenario-6'],
    xpRequired: 120,
    missionsRequired: 3,
    waveDuration: 90,
    totalThreats: 5,
    concurrentSpawns: 1,
    accentColor: '#a855f7',
    borderColor: 'border-purple-500/40',
    badge: 'LEVEL 3',
    lore: 'Coordinated syndicate exploiting fear of law enforcement. Demand institutional proof.'
  },
  {
    id: 4,
    code: 'L4',
    title: 'Visual Deception',
    theme: 'visual manipulation',
    subtitle: 'Level 4 — Forged Media & Documents',
    description: 'Inspect forged government circulars, altered ministry seals, and counterfeit RBI notices. Authentic civic dispatches must be allowed through!',
    threatType: 'Forged Circulars & Visual Hoaxes',
    categoryFilter: ['circular', 'rbi', 'screenshot', 'seal', 'relief'],
    scenarioIds: ['scenario-7', 'scenario-8'],
    xpRequired: 220,
    missionsRequired: 5,
    waveDuration: 90,
    totalThreats: 5,
    concurrentSpawns: 1,
    accentColor: '#f59e0b',
    borderColor: 'border-amber-500/40',
    badge: 'LEVEL 4',
    lore: 'High-fidelity visual hoaxes designed to bypass casual checks. Scrutinize visual metadata.'
  },
  {
    id: 5,
    code: 'L5',
    title: 'Voice & AI Threat',
    theme: 'AI deepfakes & audio',
    subtitle: 'Level 5 — Synthetic Acoustic Warfare',
    description: 'Neural voice clones impersonating relatives in distress, AI-generated kidnapping ransoms, and synthetic ministerial broadcasts.',
    threatType: 'Voice Clones & Deepfake Audio',
    categoryFilter: ['voice', 'audio', 'clone', 'deepfake', 'ai'],
    scenarioIds: ['scenario-9', 'scenario-10'],
    xpRequired: 350,
    missionsRequired: 7,
    waveDuration: 90,
    totalThreats: 5,
    concurrentSpawns: 1,
    accentColor: '#ec4899',
    borderColor: 'border-pink-500/40',
    badge: 'LEVEL 5',
    lore: 'ElevenLabs-grade AI voice clones weaponized for panic ransoms. Run forensic acoustic analysis.'
  },
  {
    id: 6,
    code: 'L6',
    title: 'TRUST WAR',
    theme: 'multi-vector crisis',
    subtitle: 'Level 6 — Total Grid Assault',
    description: 'RED ALERT: Multi-vector crisis event. 3 simultaneous threat packets strike across multiple sectors simultaneously! Rapid tactical triage required.',
    threatType: 'MULTI-VECTOR SIMULTANEOUS CRISIS',
    categoryFilter: ['grid', 'blackout', 'crisis', 'war', 'all'],
    scenarioIds: ['scenario-11', 'scenario-12'],
    xpRequired: 500,
    missionsRequired: 9,
    waveDuration: 90,
    totalThreats: 6,
    concurrentSpawns: 3,
    accentColor: '#ef4444',
    borderColor: 'border-red-500/60',
    badge: 'CRITICAL ALERT',
    lore: 'CLASSIFIED. State-level threat actors assault all civic communication nodes simultaneously.'
  }
];

// Citizen State
interface Citizen {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  sectorId: 'alpha' | 'beta' | 'gamma' | 'delta';
  color: string;
  baseColor: string;
  pulseOffset: number;
  isInfected?: boolean;
  infectionTimer?: number;
  infectionDelay?: number;
  isShielded?: boolean;
  shieldTimer?: number;
  isPanicked?: boolean;
  panicTimer?: number;
}

// Particle Effect
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

// Floating Combat Text
interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  size: number;
}

// Firewall Barrier Wall FX
interface FirewallWall {
  x: number;
  y: number;
  width: number;
  height: number;
  alpha: number;
  duration: number;
}

// Shield Ring FX
interface ShieldRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

// Threat Packet in transit
export interface ThreatPacket {
  id: string;
  scenario: Scenario;
  isGenuine: boolean;
  formatType: 'UPI' | 'SMS' | 'AUDIO' | 'CIRC';
  targetSectorId: 'alpha' | 'beta' | 'gamma' | 'delta';
  targetSectorName: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  progress: number;
  duration: number;
  elapsedTime: number;
  pulsePhase: number;
  isHandled: boolean;
  isFrozen?: boolean;
  frozenTimer?: number;
  // Step 4: Threat variants
  variant?: ThreatVariant;
  scansDone?: number;
  displayAsGenuine?: boolean;
  splitTimer?: number;
  isSplit?: boolean;
  speedMultiplier?: number;
}

// Guardian Speech Bubble
interface GuardianSpeechBubble {
  text: string;
  type: 'success' | 'warning' | 'danger';
  timer: number;
}

// Ability Tooltip Impact Forecast
interface AbilityMeta {
  key: string;
  numberKey: string;
  label: string;
  protocol: PlayerDecision;
  color: string;
  borderColor: string;
  hoverBg: string;
  description: string;
  trustForecast: string;
  exposureForecast: string;
  tacticalRole: string;
}

const ABILITY_CONFIG: AbilityMeta[] = [
  {
    key: 'VERIFY',
    numberKey: '1',
    label: 'VERIFY',
    protocol: 'VERIFY',
    color: 'text-cyan-300',
    borderColor: 'border-cyan-500/40',
    hoverBg: 'hover:bg-cyan-600/80',
    description: 'Deploys authentic citizen advisory banner. Demands confirmation before processing.',
    trustForecast: '+2 to +5% on suspicious; minimal friction on genuine',
    exposureForecast: 'Halts viral propagation immediately',
    tacticalRole: 'Balanced verification when evidence is ambiguous'
  },
  {
    key: 'HOLD',
    numberKey: '2',
    label: 'HOLD (FREEZE)',
    protocol: 'HOLD',
    color: 'text-sky-300',
    borderColor: 'border-sky-500/40',
    hoverBg: 'hover:bg-sky-600/80',
    description: 'Tactical cryogenic quarantine. Freezes packet transit and glows ice-blue for extended analysis.',
    trustForecast: 'Preserves citizen confidence during active inspection',
    exposureForecast: '0% exposure spread while buffer holds',
    tacticalRole: 'Buys time when multi-vector assault is detected'
  },
  {
    key: 'CONTAIN',
    numberKey: '3',
    label: 'CONTAIN (FIREWALL)',
    protocol: 'CONTAIN',
    color: 'text-rose-300',
    borderColor: 'border-rose-500/40',
    hoverBg: 'hover:bg-rose-600/80',
    description: 'Slams down perimeter firewall grid. Obliterates the threat packet before sector entry.',
    trustForecast: '+10% trust bonus on scam termination; -5% penalty on false alarm',
    exposureForecast: 'Eliminates 100% of payload harm',
    tacticalRole: 'Decisive kill-switch against verified scams'
  },
  {
    key: 'ESCALATE',
    numberKey: '4',
    label: 'ESCALATE (CERT-IN)',
    protocol: 'ESCALATE',
    color: 'text-red-400',
    borderColor: 'border-red-500/50',
    hoverBg: 'hover:bg-red-600/80',
    description: 'Triggers federal CERT-In incident dispatch and legal takedown with law enforcement uplink.',
    trustForecast: 'Maximum XP (+120 XP) & institutional hardening',
    exposureForecast: 'Permanent neutralization of criminal syndicate vectors',
    tacticalRole: 'Extreme threat containment with federal cooldown'
  },
  {
    key: 'ALLOW',
    numberKey: '5',
    label: 'ALLOW (CORRIDOR)',
    protocol: 'ALLOW',
    color: 'text-emerald-300',
    borderColor: 'border-emerald-500/40',
    hoverBg: 'hover:bg-emerald-600/80',
    description: 'Opens green corridor allowing unhindered transit to destination terminals.',
    trustForecast: '+8% on authentic dispatches; Severe -20% collapse if scam',
    exposureForecast: 'No containment: full payload delivered',
    tacticalRole: 'Safe passage for verified civic notices'
  }
];

// ── 8-Axis Trust DNA Radar Chart Component ─────────────────────────────
const RADAR_TRAITS: { key: keyof TrustDna; label: string }[] = [
  { key: 'source_verification', label: 'Source Verification' },
  { key: 'manipulation_detection', label: 'Manipulation' },
  { key: 'emotional_manipulation', label: 'Emotional Defense' },
  { key: 'authority_bias', label: 'Authority Bias' },
  { key: 'urgency_detection', label: 'Urgency Detection' },
  { key: 'visual_verification', label: 'Visual Forensics' },
  { key: 'ai_skepticism', label: 'AI Skepticism' },
  { key: 'investigation_efficiency', label: 'Efficiency' },
];

export const TrustDnaRadar: React.FC<{ dna: TrustDna; size?: number }> = ({ dna, size = 260 }) => {
  const center = size / 2;
  const maxR = size * 0.36;
  const numAxes = RADAR_TRAITS.length;
  const angleStep = (2 * Math.PI) / numAxes;

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const points = RADAR_TRAITS.map((trait, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const val = dna[trait.key] || 50;
    const r = (val / 100) * maxR;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      val,
      label: trait.label,
    };
  });

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <filter id="radar-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {gridLevels.map((lvl, idx) => {
          const gridPoints = RADAR_TRAITS.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = lvl * maxR;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(' ');
          return (
            <polygon
              key={idx}
              points={gridPoints}
              fill="none"
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray={lvl === 1 ? 'none' : '2 2'}
            />
          );
        })}

        {RADAR_TRAITS.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x2 = center + maxR * Math.cos(angle);
          const y2 = center + maxR * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="#334155"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="rgba(6, 182, 212, 0.25)"
          stroke="#06b6d4"
          strokeWidth="2.5"
          filter="url(#radar-glow-filter)"
        />

        {points.map((p, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelDist = maxR + 18;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="#22d3ee" stroke="#083344" strokeWidth="1.5" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-slate-400 font-mono text-[9px] font-semibold"
              >
                {p.label}
              </text>
              <text
                x={lx}
                y={ly + 10}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-cyan-300 font-mono text-[9px] font-bold"
              >
                {Math.round(p.val)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── Main Game Arena Component ──────────────────────────────────────────
export const GameArena: React.FC<GameArenaProps> = ({
  player: initialPlayer,
  community: initialCommunity,
  initialLevelId = 1,
  onUpdatePlayer,
  onUpdateCommunity,
  onBackToMap,
  onNavigateToMissions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synced local state
  const [localPlayer, setLocalPlayer] = useState<PlayerState>(initialPlayer);
  const [localCommunity, setLocalCommunity] = useState<CommunityState>(
    initialCommunity || {
      population: 1000,
      community_trust: 100,
      exposure: 0,
      harm_prevented: 0,
      harm_caused: 0,
      safe_decisions: 0,
      unsafe_decisions: 0,
    }
  );

  useEffect(() => { setLocalPlayer(initialPlayer); }, [initialPlayer]);
  useEffect(() => { if (initialCommunity) setLocalCommunity(initialCommunity); }, [initialCommunity]);

  // Audio State
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(!sound.enabled);

  // ── Cinematic Intro State ────────────────────────────────────────────
  const [showCinematic, setShowCinematic] = useState<boolean>(() => {
    return !sessionStorage.getItem('trustiq_intro_seen');
  });
  const [cinematicPhase, setCinematicPhase] = useState<number>(0); // 0: Title, 1: Quote, 2: Avatar Select, 3: Guardian Enters

  // ── First-Play Tutorial State ────────────────────────────────────────
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    return !localStorage.getItem('trustiq_tutorial_seen');
  });

  // Judge Play Mode Toast State
  const [judgeModeActive, setJudgeModeActive] = useState<boolean>(false);
  const [judgeToast, setJudgeToast] = useState<string | null>(null);

  // ── Wave & Level State Machine ───────────────────────────────────────
  const [currentLevelId, setCurrentLevelId] = useState<number>(initialLevelId);
  const currentLevel = GAME_LEVELS.find((l) => l.id === currentLevelId) || GAME_LEVELS[0];

  const [waveState, setWaveState] = useState<'PLAYING' | 'WAVE_COMPLETE' | 'GAME_OVER' | 'LEVEL_SELECT'>('PLAYING');
  const [waveTimer, setWaveTimer] = useState<number>(90);
  const [threatsSpawned, setThreatsSpawned] = useState<number>(0);
  const [threatsResolved, setThreatsResolved] = useState<number>(0);

  // Wave Performance Trackers
  const [waveStartTrust, setWaveStartTrust] = useState<number>(initialCommunity?.community_trust ?? 100);
  const [waveStartXp, setWaveStartXp] = useState<number>(initialPlayer.xp ?? 0);
  const [waveStartRank, setWaveStartRank] = useState<string>(initialPlayer.rank ?? 'ROOKIE GUARDIAN');
  const [waveStartLevel, setWaveStartLevel] = useState<number>(initialPlayer.level ?? 1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([1]);

  // Trust DNA & Adaptive Data
  const [trustDnaData, setTrustDnaData] = useState<TrustDna>({
    source_verification: 65,
    manipulation_detection: 70,
    emotional_manipulation: 55,
    authority_bias: 48,
    urgency_detection: 62,
    visual_verification: 75,
    ai_skepticism: 58,
    investigation_efficiency: 80,
  });
  const [weakestSkill, setWeakestSkill] = useState<string>('authority_bias');
  const [strongestSkill, setStrongestSkill] = useState<string>('investigation_efficiency');
  const [, setAdaptiveChallengeData] = useState<AdaptiveChallenge | null>(null);

  // Guardian Physics State
  const guardianPos = useRef<{ x: number; y: number; vx: number; vy: number; angle: number }>({
    x: 0, y: 0, vx: 0, vy: 0, angle: 0,
  });

  // Tap-to-Move Target
  const targetPos = useRef<{ x: number; y: number } | null>(null);
  const waypointPulse = useRef<number>(0);

  // Key tracking
  const keysDown = useRef<Record<string, boolean>>({});

  // Citizens, Particles, FX
  const citizensRef = useRef<Citizen[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const shieldRingsRef = useRef<ShieldRing[]>([]);
  const firewallsRef = useRef<FirewallWall[]>([]);
  const speechBubbleRef = useRef<GuardianSpeechBubble | null>(null);

  // Threat Packets
  const packetsRef = useRef<ThreatPacket[]>([]);
  const screenShake = useRef<number>(0);
  const screenFlash = useRef<number>(0);

  // Step 1 & 3: Aimed Projectiles, Freeze Fields, Skills, Aiming
  const projectilesRef = useRef<ToolProjectile[]>([]);
  const freezeFieldsRef = useRef<FreezeField[]>([]);
  const skillStateRef = useRef<SkillState>({ ...INITIAL_SKILL_STATE });
  const mouseAimRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const shieldedSectorRef = useRef<{ sectorId: string; timer: number } | null>(null);

  const [selectedTool, setSelectedTool] = useState<AimedToolKey>('BEACON');
  const [toolCooldowns, setToolCooldowns] = useState<Record<AimedToolKey, number>>({
    BEACON: 0,
    FREEZE: 0,
    BOLT: 0,
    CERTIN: 0,
    CORRIDOR: 0,
  });
  const [skillCooldowns, setSkillCooldowns] = useState<{ dash: number; pulse: number; shield: number }>({
    dash: 0,
    pulse: 0,
    shield: 0,
  });

  // Side Panel Telemetry Dock
  const [inspectedPacket, setInspectedPacket] = useState<ThreatPacket | null>(null);
  const [inspectTimeLeft, setInspectTimeLeft] = useState<number>(20);
  const [hoveredAbility, setHoveredAbility] = useState<AbilityMeta | null>(null);
  const [investigationDossier, setInvestigationDossier] = useState<AIInvestigationDossier | null>(null);
  const [scanningType, setScanningType] = useState<string | null>(null);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);
  const [escalateCooldown, setEscalateCooldown] = useState<number>(0);
  const [nearestInspectablePacket, setNearestInspectablePacket] = useState<ThreatPacket | null>(null);

  // Current Sector detection
  const [currentSector, setCurrentSector] = useState<SectorDef>(SECTOR_DEFS[0]);
  const [nearestCitizensCount, setNearestCitizensCount] = useState<number>(0);

  // Derived Stats
  const trustScore = localCommunity.community_trust ?? 100;
  const exposureScore = localCommunity.exposure ?? 0;
  const credits = localPlayer.investigation_credits ?? 30;
  const playerXp = localPlayer.xp ?? 0;
  const nextXp = localPlayer.xp_for_next_level ?? 100;
  const avatarStyle = (localPlayer.avatar || 'AGENT').toUpperCase();
  const isTrustWarMode = currentLevel.id === 6;

  // Toggle Sound Mute
  const handleToggleSound = () => {
    const isNowEnabled = sound.toggleMute();
    setIsAudioMuted(!isNowEnabled);
  };

  // Escalate Cooldown Ticker
  useEffect(() => {
    if (escalateCooldown <= 0) return;
    const interval = setInterval(() => {
      setEscalateCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [escalateCooldown]);

  // Tool & Skill Cooldowns Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setToolCooldowns((prev) => {
        let changed = false;
        const next = { ...prev };
        (Object.keys(next) as AimedToolKey[]).forEach((k) => {
          if (next[k] > 0) {
            next[k] = Math.max(0, Number((next[k] - 0.2).toFixed(1)));
            changed = true;
          }
        });
        return changed ? next : prev;
      });

      setSkillCooldowns({
        dash: Math.max(0, Number(skillStateRef.current.dashCooldown.toFixed(1))),
        pulse: Math.max(0, Number(skillStateRef.current.scanPulseCooldown.toFixed(1))),
        shield: Math.max(0, Number(skillStateRef.current.shieldCooldown.toFixed(1))),
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // Synchronize initialLevelId
  useEffect(() => {
    if (initialLevelId && initialLevelId !== currentLevelId) {
      startLevel(initialLevelId);
    }
  }, [initialLevelId]);

  // Cinematic Intro Progression (25 seconds total)
  useEffect(() => {
    if (!showCinematic) return;

    const t1 = setTimeout(() => setCinematicPhase(1), 5000);  // Quote
    const t2 = setTimeout(() => setCinematicPhase(2), 11000); // Avatar selection
    const t3 = setTimeout(() => {
      setCinematicPhase(3); // Guardian enters map
      // Walk guardian from bottom to center
      if (canvasRef.current) {
        guardianPos.current.x = canvasRef.current.clientWidth / 2;
        guardianPos.current.y = canvasRef.current.clientHeight - 30;
        targetPos.current = {
          x: canvasRef.current.clientWidth / 2,
          y: canvasRef.current.clientHeight / 2,
        };
      }
    }, 18000);
    const t4 = setTimeout(() => {
      handleCompleteCinematic();
    }, 25000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [showCinematic]);

  const handleCompleteCinematic = () => {
    sessionStorage.setItem('trustiq_intro_seen', 'true');
    setShowCinematic(false);
    sound.playClick();
  };

  // Judge Play Mode Handler
  const handleActivateJudgeMode = () => {
    setJudgeModeActive(true);
    sound.playLevelComplete();

    // Unlock all levels
    setCompletedLevels([1, 2, 3, 4, 5, 6]);

    // Give 60 credits and set 100% trust
    const boostedPlayer: PlayerState = {
      ...localPlayer,
      investigation_credits: 60,
      xp: Math.max(localPlayer.xp ?? 0, 500),
      missions_completed: Math.max(localPlayer.missions_completed ?? 0, 9),
    };
    const boostedCommunity: CommunityState = {
      ...localCommunity,
      community_trust: 100,
      exposure: 0,
    };

    setLocalPlayer(boostedPlayer);
    setLocalCommunity(boostedCommunity);
    onUpdatePlayer?.(boostedPlayer);
    onUpdateCommunity?.(boostedCommunity);

    setJudgeToast('JUDGE MODE ACTIVE // ALL 6 ZONES UNLOCKED · 60 CREDITS GRANTED');
    setTimeout(() => setJudgeToast(null), 5000);

    // Skip cinematic if in intro
    if (showCinematic) {
      handleCompleteCinematic();
    }
  };

  // Use refs for spawner internals to avoid useEffect re-firing on every tick
  const threatsSpawnedRef = useRef<number>(0);
  const waveTimerRef = useRef<number>(90);
  const waveStateRef = useRef<'PLAYING' | 'WAVE_COMPLETE' | 'GAME_OVER' | 'LEVEL_SELECT'>('PLAYING');

  // Wave 90-Second Countdown Timer
  useEffect(() => {
    if (waveState !== 'PLAYING' || showCinematic) return;
    waveTimerRef.current = 90;

    const timer = setInterval(() => {
      waveTimerRef.current = Math.max(0, waveTimerRef.current - 1);
      setWaveTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [waveState, showCinematic]);

  // Check Game Over (0% Trust)
  useEffect(() => {
    if (waveState !== 'PLAYING' || showCinematic) return;
    if (trustScore <= 0 || (localCommunity.community_trust !== undefined && localCommunity.community_trust <= 0)) {
      handleGameOver();
    }
  }, [trustScore, localCommunity.community_trust, waveState, showCinematic]);

  // Check Wave Complete
  useEffect(() => {
    if (waveState !== 'PLAYING' || showCinematic) return;

    const allHandled = threatsResolved >= currentLevel.totalThreats && threatsResolved > 0;
    const timeExpiredAndClear = waveTimer <= 0 && packetsRef.current.length === 0 && threatsSpawned > 0;

    if (allHandled || timeExpiredAndClear) {
      handleWaveComplete();
    }
  }, [threatsResolved, waveTimer, waveState, currentLevel.totalThreats, threatsSpawned, showCinematic]);

  // Start / Reset Wave
  const startLevel = (levelId: number) => {
    setCurrentLevelId(levelId);
    setWaveState('PLAYING');
    waveStateRef.current = 'PLAYING';
    setWaveTimer(90);
    waveTimerRef.current = 90;
    setThreatsSpawned(0);
    threatsSpawnedRef.current = 0;
    setThreatsResolved(0);
    setWaveStartTrust(localCommunity.community_trust ?? 100);
    setWaveStartXp(localPlayer.xp ?? 0);
    setWaveStartRank(localPlayer.rank ?? 'ROOKIE GUARDIAN');
    setWaveStartLevel(localPlayer.level ?? 1);
    packetsRef.current = [];
    setInspectedPacket(null);
    setInvestigationDossier(null);
    sound.playClick();

    if (levelId === 6) {
      sound.playAlarm();
    }
  };

  const handleGameOver = () => {
    setWaveState('GAME_OVER');
    waveStateRef.current = 'GAME_OVER';
    sound.playBreach();
    screenShake.current = 24;
    screenFlash.current = 0.85;
    speechBubbleRef.current = {
      text: 'CRITICAL FAILURE! Public trust collapsed to 0%. Syndicate has overrun the town.',
      type: 'danger',
      timer: 6.0,
    };
  };

  const handleWaveComplete = async () => {
    setWaveState('WAVE_COMPLETE');
    waveStateRef.current = 'WAVE_COMPLETE';
    sound.playLevelComplete();
    setCompletedLevels((prev) => Array.from(new Set([...prev, currentLevel.id])));

    shieldRingsRef.current.push({
      x: guardianPos.current.x,
      y: guardianPos.current.y,
      radius: 20,
      maxRadius: 280,
      alpha: 1.0,
      color: '#10b981',
    });

    floatingTextsRef.current.push({
      id: `clear-${Date.now()}`,
      x: guardianPos.current.x,
      y: guardianPos.current.y - 45,
      text: `ZONE SECURED // WAVE COMPLETE!`,
      color: '#34d399',
      alpha: 1.0,
      vy: -40,
      size: 16,
    });

    try {
      const [dnaRes, challengeRes] = await Promise.all([
        api.getTrustDna().catch(() => null),
        api.getNextChallenge().catch(() => null),
      ]);
      if (dnaRes?.trust_dna) setTrustDnaData(dnaRes.trust_dna);
      if (dnaRes?.weakest_skill) setWeakestSkill(dnaRes.weakest_skill);
      if (dnaRes?.strongest_skill) setStrongestSkill(dnaRes.strongest_skill);
      if (challengeRes) setAdaptiveChallengeData(challengeRes);
    } catch (err) {
      console.warn('Post-wave fetch info:', err);
    }
  };

  const handleRetryWave = () => {
    const restoredCommunity: CommunityState = {
      ...localCommunity,
      community_trust: 100,
      exposure: 0,
    };
    setLocalCommunity(restoredCommunity);
    onUpdateCommunity?.(restoredCommunity);
    startLevel(currentLevelId);
  };

  // Determine Target Sector based on scenario audience/content
  const getTargetSectorForScenario = useCallback((s: Scenario, preferredSectorIndex?: number): SectorDef => {
    if (preferredSectorIndex !== undefined) {
      return SECTOR_DEFS[preferredSectorIndex % SECTOR_DEFS.length];
    }
    const title = (s.title + ' ' + s.content).toLowerCase();
    if (s.id === 'scenario-1' || s.id === 'scenario-5' || title.includes('upi') || title.includes('police') || title.includes('pension')) {
      return SECTOR_DEFS[0]; // Alpha: Pensioners
    }
    if (s.id === 'scenario-2' || s.id === 'scenario-3' || s.id === 'scenario-8' || title.includes('student') || title.includes('college') || title.includes('laptop')) {
      return SECTOR_DEFS[1]; // Beta: Youth
    }
    if (s.id === 'scenario-6' || s.id === 'scenario-9' || s.id === 'scenario-10' || title.includes('receipt') || title.includes('delivery') || title.includes('donation')) {
      return SECTOR_DEFS[2]; // Gamma: Merchants
    }
    return SECTOR_DEFS[3]; // Delta: Healthcare
  }, []);

  const getFormatType = useCallback((contentType: string): 'UPI' | 'SMS' | 'AUDIO' | 'CIRC' => {
    if (contentType === 'text_upi_link') return 'UPI';
    if (contentType === 'voice_message') return 'AUDIO';
    if (contentType === 'screenshot_image') return 'CIRC';
    return 'SMS';
  }, []);

  // Citizen Reactions
  const triggerSectorGreenFlash = useCallback((sectorId: 'alpha' | 'beta' | 'gamma' | 'delta') => {
    const sectorCitizens = citizensRef.current.filter((c) => c.sectorId === sectorId);
    sectorCitizens.forEach((c) => {
      c.isShielded = true;
      c.shieldTimer = 3.5;
      c.color = '#10b981';
    });
  }, []);

  const triggerSectorAmberPanic = useCallback((sectorId: 'alpha' | 'beta' | 'gamma' | 'delta') => {
    const sectorCitizens = citizensRef.current.filter((c) => c.sectorId === sectorId);
    sectorCitizens.forEach((c) => {
      c.isPanicked = true;
      c.panicTimer = 4.0;
      c.color = '#f59e0b';
    });
  }, []);

  const triggerSectorInfection = useCallback((sectorId: 'alpha' | 'beta' | 'gamma' | 'delta') => {
    const sectorCitizens = citizensRef.current.filter((c) => c.sectorId === sectorId);
    const countToInfect = Math.min(50, sectorCitizens.length);
    for (let i = 0; i < countToInfect; i++) {
      const idx = Math.floor(Math.random() * sectorCitizens.length);
      const c = sectorCitizens[idx];
      c.isInfected = true;
      c.infectionDelay = Math.random() * 2.2;
      c.infectionTimer = 16.0;
    }
  }, []);

  // Unhandled Arrival
  const handleUnhandledArrival = useCallback(async (packet: ThreatPacket) => {
    if (packet.isHandled) return;
    packet.isHandled = true;

    // Check if Sector is protected by Trust Shield (Q skill)
    if (shieldedSectorRef.current && shieldedSectorRef.current.sectorId === packet.targetSectorId && shieldedSectorRef.current.timer > 0) {
      sound.playShield();
      shieldRingsRef.current.push({
        x: packet.currentX,
        y: packet.currentY,
        radius: 20,
        maxRadius: 150,
        alpha: 1.0,
        color: '#38bdf8',
      });
      floatingTextsRef.current.push({
        id: `shield-absorb-${Date.now()}`,
        x: packet.currentX,
        y: packet.currentY - 30,
        text: 'TRUST SHIELD BLOCKED BREACH!',
        color: '#38bdf8',
        alpha: 1.0,
        vy: -40,
        size: 13,
      });
      speechBubbleRef.current = {
        text: 'Trust Shield held! Sector safe from disinformation payload.',
        type: 'success',
        timer: 4.0,
      };
      setThreatsResolved((prev) => prev + 1);
      packet.isHandled = true;
      packetsRef.current = packetsRef.current.filter((p) => p.id !== packet.id);
      setInspectedPacket((prev) => (prev?.id === packet.id ? null : prev));
      return;
    }

    try {
      const res = await api.decide(packet.scenario.id, 'ALLOW');
      setThreatsResolved((prev) => prev + 1);

      if (!res.is_correct || res.ground_truth !== 'GENUINE') {
        sound.playBreach();
        screenShake.current = isTrustWarMode ? 18 : 14;
        screenFlash.current = 0.65;
        triggerSectorInfection(packet.targetSectorId);

        speechBubbleRef.current = {
          text: 'PERIMETER BREACH! Disinformation payload reached citizens.',
          type: 'danger',
          timer: 4.5,
        };
      } else {
        sound.playShield();
        triggerSectorGreenFlash(packet.targetSectorId);
        speechBubbleRef.current = {
          text: 'Civic transmission verified and delivered safely.',
          type: 'success',
          timer: 4.0,
        };
      }

      if (res.updated_player) {
        setLocalPlayer(res.updated_player);
        onUpdatePlayer?.(res.updated_player);
      }
      if (res.new_community_state) {
        setLocalCommunity(res.new_community_state);
        onUpdateCommunity?.(res.new_community_state);
      }
    } catch (err) {
      console.warn('Unhandled arrival note:', err);
      setThreatsResolved((prev) => prev + 1);
    } finally {
      packetsRef.current = packetsRef.current.filter((p) => p.id !== packet.id);
      setInspectedPacket((prev) => (prev?.id === packet.id ? null : prev));
    }
  }, [triggerSectorInfection, triggerSectorGreenFlash, onUpdatePlayer, onUpdateCommunity, isTrustWarMode]);

  // Unified Decision Execution on a Threat Packet (called by aimed hits, hotbar, and inspection panel)
  const handleResolvePacket = useCallback(async (packet: ThreatPacket, protocol: PlayerDecision) => {
    if (!packet || packet.isHandled || isSubmittingDecision) return;

    if (protocol === 'ESCALATE' && escalateCooldown > 0) {
      sound.playWarning();
      return;
    }

    setIsSubmittingDecision(true);

    if (protocol === 'HOLD') {
      packet.isFrozen = true;
      packet.frozenTimer = 8.0;
      sound.playScan();
      floatingTextsRef.current.push({
        id: `txt-${Date.now()}`,
        x: packet.currentX,
        y: packet.currentY - 20,
        text: 'FREEZE PROTOCOL ACTIVE',
        color: '#38bdf8',
        alpha: 1.0,
        vy: -30,
        size: 11,
      });
    }

    if (protocol === 'CONTAIN') {
      firewallsRef.current.push({
        x: packet.currentX,
        y: packet.currentY,
        width: 44,
        height: 60,
        alpha: 1.0,
        duration: 1.2,
      });
      sound.playShield();
    }

    try {
      const res = await api.decide(packet.scenario.id, protocol);
      setThreatsResolved((prev) => prev + 1);

      if (protocol === 'ESCALATE') {
        setEscalateCooldown(20);
        setToolCooldowns((prev) => ({ ...prev, CERTIN: 20 }));
      }

      if (res.is_correct) {
        sound.playShield();
        triggerSectorGreenFlash(packet.targetSectorId);

        shieldRingsRef.current.push({
          x: guardianPos.current.x,
          y: guardianPos.current.y,
          radius: 10,
          maxRadius: 110,
          alpha: 1.0,
          color: '#10b981',
        });

        floatingTextsRef.current.push({
          id: `xp-${Date.now()}`,
          x: packet.currentX,
          y: packet.currentY - 35,
          text: `+${res.xp_earned} XP [ACCURATE PROTOCOL]`,
          color: '#34d399',
          alpha: 1.0,
          vy: -40,
          size: 13,
        });

        // 16 burst particles on correct containment/verification
        for (let i = 0; i < 16; i++) {
          const ang = (Math.PI * 2 * i) / 16;
          const spd = 2 + Math.random() * 2.5;
          particlesRef.current.push({
            x: packet.currentX,
            y: packet.currentY,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            alpha: 1.0,
            color: '#10b981',
            size: 2.5,
          });
        }

        speechBubbleRef.current = {
          text: res.guardian_reaction || 'Threat contained. Sector perimeter secured.',
          type: 'success',
          timer: 4.5,
        };
      } else if (!res.is_correct && res.ground_truth === 'GENUINE') {
        sound.playWarning();
        triggerSectorAmberPanic(packet.targetSectorId);

        floatingTextsRef.current.push({
          id: `warn-${Date.now()}`,
          x: packet.currentX,
          y: packet.currentY - 35,
          text: `FALSE ALARM: TRUST ERODED`,
          color: '#f59e0b',
          alpha: 1.0,
          vy: -35,
          size: 12,
        });

        speechBubbleRef.current = {
          text: res.guardian_reaction || 'Authentic dispatch improperly blocked. Trust eroded.',
          type: 'warning',
          timer: 4.5,
        };
      } else {
        sound.playBreach();
        screenShake.current = isTrustWarMode ? 16 : 12;
        triggerSectorInfection(packet.targetSectorId);

        floatingTextsRef.current.push({
          id: `err-${Date.now()}`,
          x: packet.currentX,
          y: packet.currentY - 35,
          text: `PROTOCOL FAILURE // ${res.verdict_label}`,
          color: '#ef4444',
          alpha: 1.0,
          vy: -35,
          size: 12,
        });

        speechBubbleRef.current = {
          text: res.guardian_reaction || 'Adversary bypassed protocol. Investigate deeper next time.',
          type: 'danger',
          timer: 4.5,
        };
      }

      if (res.updated_player) {
        setLocalPlayer(res.updated_player);
        onUpdatePlayer?.(res.updated_player);
      }
      if (res.new_community_state) {
        setLocalCommunity(res.new_community_state);
        onUpdateCommunity?.(res.new_community_state);
      }

      packet.isHandled = true;
      packetsRef.current = packetsRef.current.filter((p) => p.id !== packet.id);
      setInspectedPacket((prev) => (prev?.id === packet.id ? null : prev));
      setInvestigationDossier(null);
    } catch (err) {
      console.error('Ability execution error:', err);
      sound.playWarning();
      setThreatsResolved((prev) => prev + 1);
    } finally {
      setIsSubmittingDecision(false);
    }
  }, [isSubmittingDecision, escalateCooldown, triggerSectorGreenFlash, triggerSectorAmberPanic, triggerSectorInfection, onUpdatePlayer, onUpdateCommunity, isTrustWarMode]);

  const handleResolvePacketRef = useRef(handleResolvePacket);
  handleResolvePacketRef.current = handleResolvePacket;

  // Execute Decision Protocol (adapter for panel / hotbar callers)
  const handleExecuteAbility = useCallback(async (protocol: PlayerDecision) => {
    if (inspectedPacket) {
      await handleResolvePacket(inspectedPacket, protocol);
    }
  }, [inspectedPacket, handleResolvePacket]);

  // Run NOVA Forensic Scans
  const handleRunInvestigationTier = async (tier: InvestigationActionType, cost: number) => {
    if (!inspectedPacket || scanningType || credits < cost) return;

    setScanningType(tier);
    sound.playScan();

    try {
      const res = await api.investigate(inspectedPacket.scenario.id, tier);
      setInvestigationDossier(res.investigation_result);

      setLocalPlayer((prev) => ({
        ...prev,
        investigation_credits: res.remaining_credits,
      }));
      onUpdatePlayer?.({
        ...localPlayer,
        investigation_credits: res.remaining_credits,
      });

      floatingTextsRef.current.push({
        id: `scan-${Date.now()}`,
        x: guardianPos.current.x,
        y: guardianPos.current.y - 25,
        text: `NOVA INTEL RETURNED (-${cost} CR)`,
        color: '#38bdf8',
        alpha: 1.0,
        vy: -25,
        size: 10,
      });
    } catch (err: any) {
      sound.playWarning();
    } finally {
      setScanningType(null);
    }
  };

  // Helper: Fetch Candidate Scenario for Active Level Theme
  const fetchScenarioForActiveLevel = useCallback(async (activeIds: string[]): Promise<Scenario | null> => {
    try {
      const allScenarios = await api.getScenarios();

      const mapped = allScenarios.filter((s) => currentLevel.scenarioIds.includes(s.id) && !activeIds.includes(s.id));
      if (mapped.length > 0) {
        const undecided = mapped.find((s) => !s.is_decided);
        return undecided || mapped[Math.floor(Math.random() * mapped.length)];
      }

      const categoryMatches = allScenarios.filter((s) => {
        if (activeIds.includes(s.id)) return false;
        const text = (s.title + ' ' + s.content + ' ' + s.content_type).toLowerCase();
        return currentLevel.categoryFilter.some((k) => text.includes(k));
      });
      if (categoryMatches.length > 0) {
        const undecided = categoryMatches.find((s) => !s.is_decided);
        return undecided || categoryMatches[Math.floor(Math.random() * categoryMatches.length)];
      }

      const available = allScenarios.filter((s) => !activeIds.includes(s.id));
      if (available.length > 0) {
        const undecided = available.find((s) => !s.is_decided);
        return undecided || available[Math.floor(Math.random() * available.length)];
      }

      return allScenarios[Math.floor(Math.random() * allScenarios.length)] || null;
    } catch {
      return null;
    }
  }, [currentLevel]);

  // Spawn Threat Packet
  const spawnPacketInstance = useCallback(async (targetSectorOverride?: SectorDef) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w <= 0 || h <= 0) return;

    const activeIds = packetsRef.current.map((p) => p.scenario.id);
    const targetScenario = await fetchScenarioForActiveLevel(activeIds);
    if (!targetScenario) return;

    const targetSec = targetSectorOverride || getTargetSectorForScenario(targetScenario);
    const targetX = (targetSec.xRange[0] + (targetSec.xRange[1] - targetSec.xRange[0]) * 0.5) * w;
    const targetY = (targetSec.yRange[0] + (targetSec.yRange[1] - targetSec.yRange[0]) * 0.5) * h;

    const edge = Math.floor(Math.random() * 4);
    let startX = 0;
    let startY = 0;
    if (edge === 0) { startX = Math.random() * w; startY = 10; }
    else if (edge === 1) { startX = w - 10; startY = Math.random() * h; }
    else if (edge === 2) { startX = Math.random() * w; startY = h - 10; }
    else { startX = 10; startY = Math.random() * h; }

    const isGenuine = targetScenario.ground_truth === 'GENUINE' || 
                      targetScenario.id === 'scenario-7' || 
                      targetScenario.id === 'scenario-11';

    const formatType = getFormatType(targetScenario.content_type);

    const roll = Math.random();
    const variant: ThreatVariant =
      roll < 0.15 ? 'SPLITTER' :
      roll < 0.28 ? 'DISGUISER' :
      roll < 0.40 ? 'DECOY' :
      roll < 0.52 ? 'RUNNER' :
      roll < 0.64 ? 'ELITE' : 'NORMAL';

    const packet: ThreatPacket = {
      id: `packet-${Date.now()}-${Math.random()}`,
      scenario: targetScenario,
      isGenuine,
      formatType,
      targetSectorId: targetSec.id,
      targetSectorName: targetSec.name,
      startX,
      startY,
      targetX,
      targetY,
      currentX: startX,
      currentY: startY,
      progress: 0.0,
      duration: variant === 'RUNNER' ? 10.0 : 20.0,
      elapsedTime: 0.0,
      pulsePhase: Math.random() * Math.PI * 2,
      isHandled: false,
      variant,
      scansDone: 0,
      displayAsGenuine: variant === 'DISGUISER' ? true : variant === 'DECOY' ? false : isGenuine,
      splitTimer: variant === 'SPLITTER' ? 10.0 : undefined,
      isSplit: false,
      speedMultiplier: variant === 'RUNNER' ? 2.0 : 1.0,
    };

    packetsRef.current.push(packet);
    sound.playScan();
  }, [fetchScenarioForActiveLevel, getTargetSectorForScenario, getFormatType]);

  // Wave Spawner Loop — uses refs to avoid restarting on every state tick
  useEffect(() => {
    if (waveState !== 'PLAYING' || showCinematic) return;

    // Sync ref on each level start
    threatsSpawnedRef.current = 0;
    waveStateRef.current = 'PLAYING';

    let timerId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const runWaveSpawner = async () => {
      if (cancelled) return;
      // Read from refs — no stale closure
      if (threatsSpawnedRef.current >= currentLevel.totalThreats) return;
      if (waveTimerRef.current <= 0) return;
      if (waveStateRef.current !== 'PLAYING') return;

      if (currentLevel.id === 6 && threatsSpawnedRef.current === 0) {
        // L6 TRUST WAR: Crimson Alert! Spawn 3 threats simultaneously
        sound.playAlarm();
        screenShake.current = 10;
        await spawnPacketInstance(SECTOR_DEFS[0]);
        await spawnPacketInstance(SECTOR_DEFS[1]);
        await spawnPacketInstance(SECTOR_DEFS[2]);
        threatsSpawnedRef.current = 3;
        setThreatsSpawned(3);

        timerId = setTimeout(async () => {
          if (!cancelled && waveStateRef.current === 'PLAYING') {
            sound.playAlarm();
            await spawnPacketInstance(SECTOR_DEFS[3]);
            await spawnPacketInstance(SECTOR_DEFS[0]);
            await spawnPacketInstance(SECTOR_DEFS[2]);
            threatsSpawnedRef.current = 6;
            setThreatsSpawned(6);
          }
        }, 25000);
        return;
      }

      if (packetsRef.current.length < 2 && threatsSpawnedRef.current < currentLevel.totalThreats) {
        await spawnPacketInstance();
        threatsSpawnedRef.current += 1;
        setThreatsSpawned(threatsSpawnedRef.current);
      }

      if (threatsSpawnedRef.current < currentLevel.totalThreats) {
        const nextDelay = 10000 + Math.random() * 5000;
        timerId = setTimeout(runWaveSpawner, nextDelay);
      }
    };

    // First spawn quickly at 3 seconds
    timerId = setTimeout(runWaveSpawner, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  // Only re-run when waveState or level changes — NOT on threatsSpawned/waveTimer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waveState, currentLevel.id, spawnPacketInstance, showCinematic]);

  // Step 3: Movement Skills
  const triggerDashSkill = () => {
    if (skillStateRef.current.dashCooldown > 0) return;
    skillStateRef.current.isDashing = true;
    skillStateRef.current.dashTimer = 0.4;
    skillStateRef.current.dashCooldown = 3.0;
    setSkillCooldowns((prev) => ({ ...prev, dash: 3.0 }));
    sound.playScan();
    floatingTextsRef.current.push({
      id: `dash-${Date.now()}`,
      x: guardianPos.current.x,
      y: guardianPos.current.y - 20,
      text: 'DASH // 2.5x VELOCITY',
      color: '#06b6d4',
      alpha: 1.0,
      vy: -30,
      size: 11,
    });
  };

  const triggerScanPulseSkill = () => {
    if (skillStateRef.current.scanPulseCooldown > 0) return;
    if (credits < 1) {
      sound.playWarning();
      floatingTextsRef.current.push({
        id: `pulse-err-${Date.now()}`,
        x: guardianPos.current.x,
        y: guardianPos.current.y - 20,
        text: 'SCAN PULSE REQUIRES 1 CR',
        color: '#fb7185',
        alpha: 1.0,
        vy: -25,
        size: 11,
      });
      return;
    }

    setLocalPlayer((p) => {
      const updated = { ...p, investigation_credits: Math.max(0, (p.investigation_credits || 1) - 1) };
      onUpdatePlayer?.(updated);
      return updated;
    });

    skillStateRef.current.scanPulseActive = true;
    skillStateRef.current.scanPulseRadius = 15;
    skillStateRef.current.scanPulseAlpha = 1.0;
    skillStateRef.current.scanPulseCooldown = 5.0;
    setSkillCooldowns((prev) => ({ ...prev, pulse: 5.0 }));
    sound.playScan();

    floatingTextsRef.current.push({
      id: `pulse-${Date.now()}`,
      x: guardianPos.current.x,
      y: guardianPos.current.y - 20,
      text: 'SCAN PULSE (-1 CR)',
      color: '#22d3ee',
      alpha: 1.0,
      vy: -30,
      size: 11,
    });
  };

  const triggerTrustShieldSkill = () => {
    if (skillStateRef.current.shieldCooldown > 0) return;
    const sec = currentSector;
    shieldedSectorRef.current = { sectorId: sec.id, timer: 4.0 };
    skillStateRef.current.shieldCooldown = 15.0;
    setSkillCooldowns((prev) => ({ ...prev, shield: 15.0 }));
    sound.playShield();

    floatingTextsRef.current.push({
      id: `shield-${Date.now()}`,
      x: guardianPos.current.x,
      y: guardianPos.current.y - 20,
      text: `TRUST SHIELD // ${sec.name.split(' ')[1]} (4s)`,
      color: '#38bdf8',
      alpha: 1.0,
      vy: -30,
      size: 11,
    });
  };

  // Keyboard Event Listeners (WASD, 'E' to inspect, 1-5 for abilities, SPACE to skip intro)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (showCinematic && (key === ' ' || key === 'escape' || key === 'enter')) {
        e.preventDefault();
        handleCompleteCinematic();
        return;
      }

      if (showTutorial && ['w', 'a', 's', 'd', ' ', 'escape', 'enter'].includes(key)) {
        setShowTutorial(false);
        localStorage.setItem('trustiq_tutorial_seen', 'true');
      }

      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        keysDown.current[key] = true;
        targetPos.current = null;
      }

      if (key === 'e') {
        if (nearestInspectablePacket) {
          sound.playClick();
          setInspectedPacket(nearestInspectablePacket);
          setInvestigationDossier(null);
        }
      }

      if (['1', '2', '3', '4', '5'].includes(key)) {
        e.preventDefault();
        const toolMap: Record<string, AimedToolKey> = {
          '1': 'BEACON',
          '2': 'FREEZE',
          '3': 'BOLT',
          '4': 'CERTIN',
          '5': 'CORRIDOR',
        };
        const selected = toolMap[key];
        setSelectedTool(selected);
        sound.playClick();

        // If packet currently inspected, also resolve directly with that protocol
        const ability = ABILITY_CONFIG.find((a) => a.numberKey === key);
        if (ability && inspectedPacket) {
          handleExecuteAbility(ability.protocol);
        }
      }

      if (e.key === 'Shift') {
        e.preventDefault();
        triggerDashSkill();
      }

      if (e.key === ' ') {
        e.preventDefault();
        triggerScanPulseSkill();
      }

      if (key === 'q') {
        e.preventDefault();
        triggerTrustShieldSkill();
      }

      if (key === 'escape') {
        setInspectedPacket(null);
        if (waveState === 'LEVEL_SELECT') {
          setWaveState('PLAYING');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysDown.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearestInspectablePacket, inspectedPacket, handleExecuteAbility, waveState, showCinematic, showTutorial]);

  // Touch Virtual Controls for Mobile
  const handleTouchDirection = (dir: 'up' | 'down' | 'left' | 'right', isPressed: boolean) => {
    const keyMap: Record<string, string> = {
      up: 'w',
      down: 's',
      left: 'a',
      right: 'd',
    };
    keysDown.current[keyMap[dir]] = isPressed;
    if (isPressed) {
      targetPos.current = null;
      if (showTutorial) {
        setShowTutorial(false);
        localStorage.setItem('trustiq_tutorial_seen', 'true');
      }
    }
  };

  // Avatar Selection during Intro
  const handleSelectAvatar = (style: GuardianAvatarStyle) => {
    const updated: PlayerState = { ...localPlayer, avatar: style };
    setLocalPlayer(updated);
    onUpdatePlayer?.(updated);
    sound.playClick();
  };

  // Initialize Citizens
  const initCitizens = useCallback((width: number, height: number) => {
    const list: Citizen[] = [];
    SECTOR_DEFS.forEach((sec) => {
      const minX = sec.xRange[0] * width;
      const maxX = sec.xRange[1] * width;
      const minY = sec.yRange[0] * height;
      const maxY = sec.yRange[1] * height;

      for (let i = 0; i < sec.population; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.2 + Math.random() * 0.45;
        list.push({
          x: minX + Math.random() * (maxX - minX),
          y: minY + Math.random() * (maxY - minY),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.6 + Math.random() * 1.2,
          sectorId: sec.id,
          color: sec.color,
          baseColor: sec.color,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    });
    citizensRef.current = list;
  }, []);

  // Pointer Down (Aimed Tool Firing, Packet Inspection, or Movement)
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (showCinematic) {
      handleCompleteCinematic();
      return;
    }

    if (showTutorial) {
      setShowTutorial(false);
      localStorage.setItem('trustiq_tutorial_seen', 'true');
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Direct tap on packet opens telemetry dock
    const clickedPacket = packetsRef.current.find((p) => {
      const d = Math.hypot(p.currentX - clickX, p.currentY - clickY);
      return d < 32;
    });

    if (clickedPacket) {
      sound.playClick();
      setInspectedPacket(clickedPacket);
      setInvestigationDossier(null);
      return;
    }

    const gx = guardianPos.current.x;
    const gy = guardianPos.current.y;
    const distFromGuardian = Math.hypot(clickX - gx, clickY - gy);

    // Tap close to guardian acts as tap-to-move
    if (distFromGuardian < 35) {
      targetPos.current = { x: clickX, y: clickY };
      waypointPulse.current = 1.0;
      sound.playClick();
      return;
    }

    const toolDef = AIMED_TOOLS.find((t) => t.key === selectedTool);

    // Tool: Freeze Field placed on ground
    if (selectedTool === 'FREEZE') {
      if (toolCooldowns.FREEZE > 0) {
        sound.playWarning();
        floatingTextsRef.current.push({
          id: `cd-${Date.now()}`,
          x: clickX,
          y: clickY - 15,
          text: `FREEZE COOLDOWN (${toolCooldowns.FREEZE.toFixed(0)}s)`,
          color: '#38bdf8',
          alpha: 1.0,
          vy: -25,
          size: 11,
        });
        return;
      }

      freezeFieldsRef.current.push({
        id: `ff-${Date.now()}`,
        x: clickX,
        y: clickY,
        radius: 65,
        timer: 6.0,
        maxTimer: 6.0,
        alpha: 0.95,
      });
      setToolCooldowns((prev) => ({ ...prev, FREEZE: 8 }));
      sound.playScan();

      floatingTextsRef.current.push({
        id: `freeze-${Date.now()}`,
        x: clickX,
        y: clickY - 20,
        text: 'FREEZE FIELD DEPLOYED [6s]',
        color: '#38bdf8',
        alpha: 1.0,
        vy: -25,
        size: 11,
      });

      for (let i = 0; i < 12; i++) {
        const ang = (Math.PI * 2 * i) / 12;
        particlesRef.current.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(ang) * 1.8,
          vy: Math.sin(ang) * 1.8,
          alpha: 0.9,
          color: '#38bdf8',
          size: 2.5,
        });
      }
      return;
    }

    // Tool: CERT-In Strike cooldown check
    if (selectedTool === 'CERTIN' && (toolCooldowns.CERTIN > 0 || escalateCooldown > 0)) {
      sound.playWarning();
      floatingTextsRef.current.push({
        id: `cd-${Date.now()}`,
        x: gx,
        y: gy - 25,
        text: `CERT-IN COOLDOWN (${Math.max(toolCooldowns.CERTIN, escalateCooldown).toFixed(0)}s)`,
        color: '#ef4444',
        alpha: 1.0,
        vy: -25,
        size: 11,
      });
      return;
    }

    // Aimed Projectile (BEACON, BOLT, CERTIN, CORRIDOR)
    const angle = Math.atan2(clickY - gy, clickX - gx);
    const flightDist = Math.max(distFromGuardian, 500);
    const speed = selectedTool === 'BOLT' ? 680 : selectedTool === 'CERTIN' ? 580 : 500;
    const color = toolDef?.color || '#22d3ee';

    projectilesRef.current.push({
      id: `proj-${Date.now()}-${Math.random()}`,
      toolKey: selectedTool,
      fromX: gx,
      fromY: gy,
      toX: gx + Math.cos(angle) * flightDist,
      toY: gy + Math.sin(angle) * flightDist,
      currentX: gx,
      currentY: gy,
      speed,
      color,
      targetPacketId: '',
      hit: false,
    });

    if (selectedTool === 'CERTIN') {
      setToolCooldowns((prev) => ({ ...prev, CERTIN: 20 }));
      setEscalateCooldown(20);
    }

    sound.playScan();

    // Muzzle sparks
    for (let i = 0; i < 6; i++) {
      const spread = angle + (Math.random() - 0.5) * 0.4;
      particlesRef.current.push({
        x: gx + Math.cos(angle) * 15,
        y: gy + Math.sin(angle) * 15,
        vx: Math.cos(spread) * 2.5,
        vy: Math.sin(spread) * 2.5,
        alpha: 0.9,
        color,
        size: 2,
      });
    }
  };

  // ── Canvas Animation Loop (GAME NEVER PAUSES) ────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      if (citizensRef.current.length === 0) {
        initCitizens(width, height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // 1. Guardian Movement (with Dash skill)
      const isDashing = skillStateRef.current.isDashing;
      const MAX_SPEED = isDashing ? 680 : 280;
      const ACCEL = (isDashing ? 2200 : 900) * dt;
      const FRICTION = 0.88;

      if (skillStateRef.current.dashTimer > 0) {
        skillStateRef.current.dashTimer -= dt;
        // Cyan ghost trail
        particlesRef.current.push({
          x: guardianPos.current.x + (Math.random() - 0.5) * 8,
          y: guardianPos.current.y + (Math.random() - 0.5) * 8,
          vx: -guardianPos.current.vx * 0.15,
          vy: -guardianPos.current.vy * 0.15,
          alpha: 0.8,
          color: '#06b6d4',
          size: 3.5,
        });
        if (skillStateRef.current.dashTimer <= 0) {
          skillStateRef.current.isDashing = false;
        }
      }

      skillStateRef.current.dashCooldown = Math.max(0, skillStateRef.current.dashCooldown - dt);
      skillStateRef.current.scanPulseCooldown = Math.max(0, skillStateRef.current.scanPulseCooldown - dt);
      skillStateRef.current.shieldCooldown = Math.max(0, skillStateRef.current.shieldCooldown - dt);

      let ax = 0;
      let ay = 0;
      const k = keysDown.current;
      if (k['w'] || k['arrowup']) ay -= 1;
      if (k['s'] || k['arrowdown']) ay += 1;
      if (k['a'] || k['arrowleft']) ax -= 1;
      if (k['d'] || k['arrowright']) ax += 1;

      if (ax !== 0 || ay !== 0) {
        const len = Math.hypot(ax, ay);
        guardianPos.current.vx += (ax / len) * ACCEL;
        guardianPos.current.vy += (ay / len) * ACCEL;
      } else if (targetPos.current) {
        const dx = targetPos.current.x - guardianPos.current.x;
        const dy = targetPos.current.y - guardianPos.current.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 6) {
          guardianPos.current.vx += (dx / dist) * ACCEL * 1.1;
          guardianPos.current.vy += (dy / dist) * ACCEL * 1.1;
        } else {
          targetPos.current = null;
        }
      }

      guardianPos.current.vx *= FRICTION;
      guardianPos.current.vy *= FRICTION;

      const speed = Math.hypot(guardianPos.current.vx, guardianPos.current.vy);
      if (speed > MAX_SPEED) {
        guardianPos.current.vx = (guardianPos.current.vx / speed) * MAX_SPEED;
        guardianPos.current.vy = (guardianPos.current.vy / speed) * MAX_SPEED;
      }

      guardianPos.current.x += guardianPos.current.vx * dt;
      guardianPos.current.y += guardianPos.current.vy * dt;

      // Boundaries
      const P_PAD = 24;
      if (guardianPos.current.x < P_PAD) { guardianPos.current.x = P_PAD; guardianPos.current.vx = 0; }
      if (guardianPos.current.x > w - P_PAD) { guardianPos.current.x = w - P_PAD; guardianPos.current.vx = 0; }
      if (guardianPos.current.y < P_PAD) { guardianPos.current.y = P_PAD; guardianPos.current.vy = 0; }
      if (guardianPos.current.y > h - P_PAD) { guardianPos.current.y = h - P_PAD; guardianPos.current.vy = 0; }

      if (speed > 5) {
        guardianPos.current.angle = Math.atan2(guardianPos.current.vy, guardianPos.current.vx);
      }

      // Current Sector Check
      const normX = guardianPos.current.x / w;
      const normY = guardianPos.current.y / h;
      let activeSec = SECTOR_DEFS[0];
      if (normX >= 0.5 && normY < 0.5) activeSec = SECTOR_DEFS[1];
      else if (normX < 0.5 && normY >= 0.5) activeSec = SECTOR_DEFS[2];
      else if (normX >= 0.5 && normY >= 0.5) activeSec = SECTOR_DEFS[3];
      setCurrentSector(activeSec);

      // 2. Threat Packets Update & Proximity Detection
      let nearestP: ThreatPacket | null = null;
      let minDist = 65;

      const currentPackets = [...packetsRef.current];
      for (const packet of currentPackets) {
        if (packet.isHandled) continue;

        if (packet.isFrozen) {
          if (packet.frozenTimer && packet.frozenTimer > 0) {
            packet.frozenTimer -= dt;
            if (packet.frozenTimer <= 0) {
              packet.isFrozen = false;
            }
          }
        } else {
          const mult = packet.speedMultiplier || 1.0;
          packet.elapsedTime += dt * mult;
          packet.progress = Math.min(1.0, packet.elapsedTime / packet.duration);
          packet.currentX = packet.startX + (packet.targetX - packet.startX) * packet.progress;
          packet.currentY = packet.startY + (packet.targetY - packet.startY) * packet.progress;
          // Reset multiplier so freeze field can re-apply if packet is inside
          packet.speedMultiplier = packet.variant === 'RUNNER' ? 2.0 : 1.0;

          // Runner trail
          if (packet.variant === 'RUNNER') {
            particlesRef.current.push({
              x: packet.currentX + (Math.random() - 0.5) * 6,
              y: packet.currentY + (Math.random() - 0.5) * 6,
              vx: 0,
              vy: 0,
              alpha: 0.45,
              color: '#fb7185',
              size: 2,
            });
          }

          // Splitter countdown
          if (packet.variant === 'SPLITTER' && !packet.isSplit && packet.splitTimer !== undefined) {
            packet.splitTimer -= dt;
            if (packet.splitTimer <= 0) {
              packet.isSplit = true;
              sound.playAlarm();
              floatingTextsRef.current.push({
                id: `split-${Date.now()}`,
                x: packet.currentX,
                y: packet.currentY - 25,
                text: 'SPLITTER DIVIDED // MULTI-VECTOR!',
                color: '#ef4444',
                alpha: 1.0,
                vy: -35,
                size: 12,
              });

              // Clone 2 child packets to adjacent sectors
              const nextSec1 = SECTOR_DEFS[(SECTOR_DEFS.findIndex((s) => s.id === packet.targetSectorId) + 1) % 4];
              const nextSec2 = SECTOR_DEFS[(SECTOR_DEFS.findIndex((s) => s.id === packet.targetSectorId) + 2) % 4];

              [nextSec1, nextSec2].forEach((sec) => {
                const tx = (sec.xRange[0] + (sec.xRange[1] - sec.xRange[0]) * 0.5) * w;
                const ty = (sec.yRange[0] + (sec.yRange[1] - sec.yRange[0]) * 0.5) * h;
                packetsRef.current.push({
                  ...packet,
                  id: `split-child-${Date.now()}-${Math.random()}`,
                  targetSectorId: sec.id,
                  targetSectorName: sec.name,
                  startX: packet.currentX,
                  startY: packet.currentY,
                  targetX: tx,
                  targetY: ty,
                  currentX: packet.currentX,
                  currentY: packet.currentY,
                  progress: 0,
                  elapsedTime: 0,
                  duration: 12.0,
                  variant: 'NORMAL',
                  isSplit: true,
                  splitTimer: undefined,
                  scansDone: 0,
                });
              });
            }
          }
        }

        packet.pulsePhase += dt * 3.5;

        if (packet.progress >= 1.0) {
          handleUnhandledArrival(packet);
        }

        const d = Math.hypot(packet.currentX - guardianPos.current.x, packet.currentY - guardianPos.current.y);
        if (d < minDist) {
          minDist = d;
          nearestP = packet;
        }

        if (inspectedPacket && inspectedPacket.id === packet.id) {
          setInspectTimeLeft(Math.max(0, packet.duration - packet.elapsedTime));
        }
      }

      setNearestInspectablePacket(nearestP);

      // 3. Citizens Count in Aura
      let inAura = 0;
      citizensRef.current.forEach((c) => {
        const d = Math.hypot(c.x - guardianPos.current.x, c.y - guardianPos.current.y);
        if (d < 120) inAura++;
      });
      setNearestCitizensCount(inAura);

      // ── RENDERING ──────────────────────────────────────────────────
      ctx.save();

      // Screen Shake
      if (screenShake.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake.current;
        const shakeY = (Math.random() - 0.5) * screenShake.current;
        ctx.translate(shakeX, shakeY);
        screenShake.current = Math.max(0, screenShake.current - dt * 32);
      }

      // Background (Crimson tint if Trust War)
      ctx.fillStyle = isTrustWarMode ? '#0a0407' : '#050813';
      ctx.fillRect(0, 0, w, h);

      // Cyber Grid
      ctx.strokeStyle = isTrustWarMode ? 'rgba(239, 68, 68, 0.08)' : 'rgba(6, 182, 212, 0.04)';
      ctx.lineWidth = 1;
      const GRID = 40;
      for (let x = 0; x < w; x += GRID) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += GRID) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Sector Boundaries & Banners
      SECTOR_DEFS.forEach((sec) => {
        const sx = sec.xRange[0] * w;
        const sy = sec.yRange[0] * h;
        const sw = (sec.xRange[1] - sec.xRange[0]) * w;
        const sh = (sec.yRange[1] - sec.yRange[0]) * h;

        ctx.fillStyle = sec.bgColor;
        ctx.fillRect(sx, sy, sw, sh);

        ctx.strokeStyle = sec.borderColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sx, sy, sw, sh);

        ctx.fillStyle = sec.color;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`${sec.name} // ${sec.demographic.toUpperCase()}`, sx + 12, sy + 22);
      });

      // 4. Citizens Render
      citizensRef.current.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;

        const sec = SECTOR_DEFS.find((s) => s.id === c.sectorId)!;
        const minX = sec.xRange[0] * w + 8;
        const maxX = sec.xRange[1] * w - 8;
        const minY = sec.yRange[0] * h + 28;
        const maxY = sec.yRange[1] * h - 8;

        if (c.x < minX || c.x > maxX) { c.vx *= -1; c.x = Math.max(minX, Math.min(maxX, c.x)); }
        if (c.y < minY || c.y > maxY) { c.vy *= -1; c.y = Math.max(minY, Math.min(maxY, c.y)); }

        if (c.isShielded && c.shieldTimer) {
          c.shieldTimer -= dt;
          if (c.shieldTimer <= 0) { c.isShielded = false; c.color = c.baseColor; }
        }
        if (c.isPanicked && c.panicTimer) {
          c.panicTimer -= dt;
          if (c.panicTimer <= 0) { c.isPanicked = false; c.color = c.baseColor; }
        }
        if (c.isInfected) {
          if (c.infectionDelay && c.infectionDelay > 0) {
            c.infectionDelay -= dt;
          } else {
            c.color = '#ef4444';
          }
        }

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = c.isInfected ? 6 : (c.isShielded ? 8 : 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 5. Threat Packets Render
      packetsRef.current.forEach((packet) => {
        if (packet.isHandled) return;

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = packet.isGenuine ? 'rgba(56, 189, 248, 0.4)' : 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(packet.startX, packet.startY);
        ctx.lineTo(packet.targetX, packet.targetY);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = packet.isGenuine ? '#38bdf8' : '#ef4444';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(packet.targetX, packet.targetY, 14 + Math.sin(packet.pulsePhase) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        const pulse = 1 + Math.sin(packet.pulsePhase) * 0.22;
        const orbRadius = 13 * pulse;

        if (packet.isFrozen) {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 24;
          ctx.fillStyle = '#0284c7';
        } else if (packet.isGenuine) {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 18;
          ctx.fillStyle = '#0ea5e9';
        } else {
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 22;
          ctx.fillStyle = '#dc2626';
        }

        ctx.beginPath();
        ctx.arc(packet.currentX, packet.currentY, orbRadius, 0, Math.PI * 2);
        ctx.fill();

        const remProgress = 1 - packet.progress;
        ctx.beginPath();
        ctx.arc(packet.currentX, packet.currentY, orbRadius + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remProgress, false);
        ctx.strokeStyle = packet.isGenuine ? '#38bdf8' : '#fb7185';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(packet.formatType, packet.currentX, packet.currentY);
        ctx.restore();

        const dGuardian = Math.hypot(packet.currentX - guardianPos.current.x, packet.currentY - guardianPos.current.y);
        if (dGuardian < 65) {
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1;
          const px = packet.currentX;
          const py = packet.currentY - 28;
          ctx.fillRect(px - 44, py - 10, 88, 20);
          ctx.strokeRect(px - 44, py - 10, 88, 20);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('[E] INSPECT', px, py);
          ctx.restore();
        }

        // Special Variant Overlays
        if (packet.variant === 'ELITE') {
          ctx.save();
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(packet.currentX, packet.currentY, orbRadius + 11, packet.pulsePhase, packet.pulsePhase + Math.PI * 1.5);
          ctx.stroke();
          ctx.strokeStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(packet.currentX, packet.currentY, orbRadius + 15, -packet.pulsePhase, -packet.pulsePhase + Math.PI * 1.5);
          ctx.stroke();
          ctx.restore();
        }

        if (packet.variant === 'SPLITTER' && packet.splitTimer !== undefined && packet.splitTimer > 0) {
          ctx.save();
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`⚡ SPLIT: ${Math.ceil(packet.splitTimer)}s`, packet.currentX, packet.currentY - 22);
          ctx.restore();
        }
      });

      // ── Step 1 & 3 Systems: Freeze Fields ──
      freezeFieldsRef.current.forEach((ff) => {
        ff.timer -= dt;
        ctx.save();
        ctx.beginPath();
        ctx.arc(ff.x, ff.y, ff.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`❄ FREEZE FIELD [${Math.ceil(ff.timer)}s]`, ff.x, ff.y);
        ctx.restore();

        // Slow down crossing packets
        packetsRef.current.forEach((pkt) => {
          if (pkt.isHandled) return;
          const dist = Math.hypot(pkt.currentX - ff.x, pkt.currentY - ff.y);
          if (dist < ff.radius) {
            pkt.speedMultiplier = 0.3;
          }
        });
      });
      freezeFieldsRef.current = freezeFieldsRef.current.filter((ff) => ff.timer > 0);

      // ── Step 3: Scan Pulse Ring ──
      if (skillStateRef.current.scanPulseActive) {
        skillStateRef.current.scanPulseRadius += 380 * dt;
        skillStateRef.current.scanPulseAlpha -= dt * 1.25;

        ctx.save();
        ctx.beginPath();
        ctx.arc(guardianPos.current.x, guardianPos.current.y, skillStateRef.current.scanPulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${Math.max(0, skillStateRef.current.scanPulseAlpha)})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();

        // Illuminate packets in pulse range
        packetsRef.current.forEach((pkt) => {
          if (pkt.isHandled) return;
          const dist = Math.hypot(pkt.currentX - guardianPos.current.x, pkt.currentY - guardianPos.current.y);
          if (Math.abs(dist - skillStateRef.current.scanPulseRadius) < 30) {
            ctx.save();
            ctx.strokeStyle = pkt.isGenuine ? '#10b981' : '#f43f5e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(pkt.currentX, pkt.currentY, 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
        });

        if (skillStateRef.current.scanPulseRadius >= 320 || skillStateRef.current.scanPulseAlpha <= 0) {
          skillStateRef.current.scanPulseActive = false;
        }
      }

      // ── Step 3: Sector Trust Shield ──
      if (shieldedSectorRef.current && shieldedSectorRef.current.timer > 0) {
        shieldedSectorRef.current.timer -= dt;
        const secDef = SECTOR_DEFS.find((s) => s.id === shieldedSectorRef.current?.sectorId);
        if (secDef) {
          const sx = secDef.xRange[0] * w;
          const sy = secDef.yRange[0] * h;
          const sw = (secDef.xRange[1] - secDef.xRange[0]) * w;
          const sh = (secDef.yRange[1] - secDef.yRange[0]) * h;

          ctx.save();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3.5;
          ctx.setLineDash([8, 8]);
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 18;
          ctx.strokeRect(sx + 3, sy + 3, sw - 6, sh - 6);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
          ctx.fillRect(sx + 3, sy + 3, sw - 6, sh - 6);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`🛡 TRUST SHIELD ACTIVE [${shieldedSectorRef.current.timer.toFixed(1)}s]`, sx + 14, sy + 40);
          ctx.restore();
        }
        if (shieldedSectorRef.current.timer <= 0) {
          shieldedSectorRef.current = null;
        }
      }

      // ── Step 1: Projectiles Update & Collision ──
      projectilesRef.current.forEach((proj) => {
        if (proj.hit) return;
        const dx = proj.toX - proj.currentX;
        const dy = proj.toY - proj.currentY;
        const dist = Math.hypot(dx, dy);
        const step = proj.speed * dt;

        if (dist <= step) {
          proj.hit = true;
          floatingTextsRef.current.push({
            id: `miss-${Date.now()}`,
            x: proj.currentX,
            y: proj.currentY - 15,
            text: 'MISSED',
            color: '#94a3b8',
            alpha: 0.8,
            vy: -20,
            size: 10,
          });
          return;
        }

        proj.currentX += (dx / dist) * step;
        proj.currentY += (dy / dist) * step;

        for (const packet of packetsRef.current) {
          if (packet.isHandled || proj.hit) continue;
          const hitDist = Math.hypot(packet.currentX - proj.currentX, packet.currentY - proj.currentY);
          if (hitDist < 26) {
            proj.hit = true;
            const tool = AIMED_TOOLS.find((t) => t.key === proj.toolKey);
            const scansCompleted = packet.scansDone || 0;
            const reqScans = packet.variant === 'ELITE' ? 2 : (tool?.requiresScan ? 1 : 0);

            if (reqScans > 0 && scansCompleted < reqScans) {
              sound.playWarning();
              floatingTextsRef.current.push({
                id: `lock-${Date.now()}`,
                x: packet.currentX,
                y: packet.currentY - 30,
                text: packet.variant === 'ELITE' ? 'ELITE THREAT: 2 SCANS REQUIRED!' : 'LOCKED: SCAN PACKET FIRST [E]!',
                color: '#fb7185',
                alpha: 1.0,
                vy: -35,
                size: 11,
              });
              for (let i = 0; i < 8; i++) {
                const a = Math.random() * Math.PI * 2;
                particlesRef.current.push({
                  x: proj.currentX,
                  y: proj.currentY,
                  vx: Math.cos(a) * 2,
                  vy: Math.sin(a) * 2,
                  alpha: 0.9,
                  color: '#fb7185',
                  size: 2,
                });
              }
            } else {
              sound.playShield();
              handleResolvePacketRef.current(packet, (tool?.protocol || 'VERIFY') as PlayerDecision);
            }
            break;
          }
        }

        // Render projectile
        ctx.save();
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(proj.currentX, proj.currentY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });
      projectilesRef.current = projectilesRef.current.filter((p) => !p.hit);

      // Aiming laser guide from Guardian
      if (mouseAimRef.current && (mouseAimRef.current.x !== 0 || mouseAimRef.current.y !== 0)) {
        const tool = AIMED_TOOLS.find((t) => t.key === selectedTool);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(guardianPos.current.x, guardianPos.current.y);
        ctx.lineTo(mouseAimRef.current.x, mouseAimRef.current.y);
        ctx.strokeStyle = tool ? `${tool.color}33` : 'rgba(34, 211, 238, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mouseAimRef.current.x, mouseAimRef.current.y, 7, 0, Math.PI * 2);
        ctx.strokeStyle = tool ? tool.color : '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.stroke();
        ctx.restore();
      }

      // ── Step 5: Mini-Map Tactical Radar HUD ──
      const mmW = 124;
      const mmH = 80;
      const mmX = 14;
      const mmY = h - mmH - 58;

      ctx.save();
      ctx.fillStyle = 'rgba(10, 15, 30, 0.85)';
      ctx.fillRect(mmX, mmY, mmW, mmH);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(mmX, mmY, mmW, mmH);

      // Radar sweep
      const sweepAng = (time / 1000) * 2;
      const mmCenterX = mmX + mmW / 2;
      const mmCenterY = mmY + mmH / 2;
      ctx.beginPath();
      ctx.moveTo(mmCenterX, mmCenterY);
      ctx.lineTo(mmCenterX + Math.cos(sweepAng) * 45, mmCenterY + Math.sin(sweepAng) * 35);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Quadrant lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(mmCenterX, mmY); ctx.lineTo(mmCenterX, mmY + mmH);
      ctx.moveTo(mmX, mmCenterY); ctx.lineTo(mmX + mmW, mmCenterY);
      ctx.stroke();

      // Threat blips
      packetsRef.current.forEach((p) => {
        if (p.isHandled) return;
        const px = mmX + (p.currentX / w) * mmW;
        const py = mmY + (p.currentY / h) * mmH;
        ctx.fillStyle = p.isGenuine ? '#38bdf8' : '#ef4444';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Guardian blip
      const gmx = mmX + (guardianPos.current.x / w) * mmW;
      const gmy = mmY + (guardianPos.current.y / h) * mmH;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(gmx, gmy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('RADAR HUD', mmX + 4, mmY + 10);
      ctx.restore();

      // 6. Firewall Barriers
      firewallsRef.current.forEach((fw) => {
        ctx.save();
        ctx.globalAlpha = fw.alpha;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.fillRect(fw.x - fw.width / 2, fw.y - fw.height / 2, fw.width, fw.height);
        ctx.strokeRect(fw.x - fw.width / 2, fw.y - fw.height / 2, fw.width, fw.height);
        ctx.restore();
        fw.alpha -= dt * 0.9;
      });
      firewallsRef.current = firewallsRef.current.filter((fw) => fw.alpha > 0);

      // 7. Shield Rings
      shieldRingsRef.current.forEach((sr) => {
        ctx.save();
        ctx.globalAlpha = sr.alpha;
        ctx.strokeStyle = sr.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sr.x, sr.y, sr.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        sr.radius += 240 * dt;
        sr.alpha -= dt * 1.2;
      });
      shieldRingsRef.current = shieldRingsRef.current.filter((sr) => sr.alpha > 0);

      // 8. Guardian Sprite Render
      ctx.save();
      const gx = guardianPos.current.x;
      const gy = guardianPos.current.y;
      const gAngle = guardianPos.current.angle;

      ctx.beginPath();
      ctx.arc(gx, gy, 120, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.035)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.translate(gx, gy);
      ctx.rotate(gAngle);

      let bodyColor = '#06b6d4';
      if (avatarStyle === 'SCOUT') bodyColor = '#10b981';
      else if (avatarStyle === 'ANALYST') bodyColor = '#8b5cf6';
      else if (avatarStyle === 'DEFENDER') bodyColor = '#f59e0b';

      ctx.shadowColor = bodyColor;
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-12, -12);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-12, 12);
      ctx.closePath();
      ctx.fillStyle = bodyColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore();

      // Guardian Speech Bubble
      if (speechBubbleRef.current && speechBubbleRef.current.timer > 0) {
        speechBubbleRef.current.timer -= dt;
        const b = speechBubbleRef.current;
        ctx.save();
        ctx.font = 'bold 10px monospace';
        const tw = ctx.measureText(b.text).width;
        const bx = gx - tw / 2 - 10;
        const by = gy - 42;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = b.type === 'danger' ? '#ef4444' : (b.type === 'warning' ? '#f59e0b' : '#10b981');
        ctx.lineWidth = 1.2;
        ctx.fillRect(bx, by, tw + 20, 22);
        ctx.strokeRect(bx, by, tw + 20, 22);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.text, gx, by + 11);
        ctx.restore();
      }

      // Tap-to-Move Waypoint Indicator
      if (targetPos.current) {
        waypointPulse.current += dt * 5;
        const r = 10 + Math.sin(waypointPulse.current) * 4;
        ctx.save();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(targetPos.current.x, targetPos.current.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= dt * 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

      // Floating Texts
      floatingTextsRef.current.forEach((ft) => {
        ft.y += ft.vy * dt;
        ft.alpha -= dt * 0.9;
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `bold ${ft.size}px monospace`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.alpha > 0);

      // Screen Flash
      if (screenFlash.current > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${screenFlash.current * 0.35})`;
        ctx.fillRect(0, 0, w, h);
        screenFlash.current = Math.max(0, screenFlash.current - dt * 2.5);
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [initCitizens, avatarStyle, handleUnhandledArrival, inspectedPacket, isTrustWarMode]);

  // Dynamic Archetype Calculation
  const resolveCognitiveArchetype = () => {
    const accuracy = localCommunity.safe_decisions ? Math.round((localCommunity.safe_decisions / (localCommunity.safe_decisions + (localCommunity.unsafe_decisions || 1))) * 100) : 85;
    const avg = Object.values(trustDnaData).reduce((a, b) => a + b, 0) / 8;

    if (trustDnaData.ai_skepticism >= 65 && accuracy >= 80) {
      return {
        title: 'Autonomous Cyber Commander',
        tagline: 'Challenges automated AI advice and isolates complex social engineering vectors with high autonomy.',
        badge: 'APEX COMMANDER',
        color: 'text-cyan-300'
      };
    }
    if (accuracy >= 80) {
      return {
        title: 'Apex Digital Sentinel',
        tagline: 'Surgical discernment. Intercepts sophisticated multi-vector attacks with flawless operational accuracy.',
        badge: 'SENTINEL PRIME',
        color: 'text-emerald-300'
      };
    }
    if (trustScore <= 60) {
      return {
        title: 'Hyper-Cautious Quarantine Agent',
        tagline: 'Zero tolerance firewalling causes civic friction by occasionally quarantining authentic public notices.',
        badge: 'QUARANTINE ENFORCER',
        color: 'text-amber-300'
      };
    }
    if (exposureScore >= 250) {
      return {
        title: 'Permeable Defense Node',
        tagline: 'Vulnerable to emotional urgency triggers, allowing high-risk financial and medical fraud through the perimeter.',
        badge: 'PERMEABLE NODE',
        color: 'text-rose-300'
      };
    }
    if (avg >= 60) {
      return {
        title: 'Forensic Trust Engineer',
        tagline: 'Disciplined forensic analysis, balanced verification protocols, and calibrated credit utilization.',
        badge: 'TRUST ENGINEER',
        color: 'text-sky-300'
      };
    }
    return {
      title: 'Tactical Signal Analyst',
      tagline: 'Methodical verification across financial and civic intelligence channels as threat levels escalate.',
      badge: 'TACTICAL ANALYST',
      color: 'text-violet-300'
    };
  };

  const archetype = resolveCognitiveArchetype();
  const citizensSavedCount = Math.max(0, localCommunity.population - (localCommunity.harm_caused || 0));
  const trustDelta = (localCommunity.community_trust ?? 100) - waveStartTrust;
  const waveXpEarned = Math.max(0, (localPlayer.xp ?? 0) - waveStartXp);
  const isRankedUp = (localPlayer.level ?? 1) > waveStartLevel || (localPlayer.rank !== waveStartRank);

  return (
    <div className={`relative w-full h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden select-none font-sans ${isTrustWarMode ? 'border-2 border-red-600/70 shadow-[inset_0_0_80px_rgba(220,38,38,0.25)]' : ''}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mouseAimRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
        }}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Crimson Alert Overlay for L6 TRUST WAR */}
      {isTrustWarMode && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-red-950/20 via-transparent to-red-950/30 animate-pulse" style={{ animationDuration: '3s' }} />
      )}

      {/* Judge Mode Toast Banner */}
      {judgeToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-amber-950/90 border border-amber-500/60 text-amber-200 text-xs font-mono font-bold shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{judgeToast}</span>
        </div>
      )}

      {/* ── CINEMATIC INTRO (25 SECONDS, SKIPPABLE) ── */}
      {showCinematic && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-500">
          <div className="max-w-2xl w-full space-y-6">
            {/* Phase 0: Title & Tagline */}
            {cinematicPhase === 0 && (
              <div className="space-y-4 animate-in zoom-in-95 duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>SECURE EMERGENCY SATELLITE UPLINK</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 tracking-wider">
                  TRUSTIQ — TRUST WAR
                </h1>
                <p className="text-xl sm:text-2xl font-mono text-cyan-200 tracking-widest uppercase font-bold">
                  Pause. Investigate. Decide.
                </p>
              </div>
            )}

            {/* Phase 1: Core Quote */}
            {cinematicPhase === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                  DOCTRINE OF COGNITIVE DEFENSE
                </div>
                <blockquote className="text-lg sm:text-2xl font-serif italic text-slate-200 leading-relaxed max-w-xl mx-auto border-l-2 border-cyan-500 pl-4 text-left">
                  "In an era where synthetic deceptions and automated panic spread in milliseconds, your community's greatest defense is not a firewall — it is discernment."
                </blockquote>
              </div>
            )}

            {/* Phase 2: Avatar Selection */}
            {cinematicPhase === 2 && (
              <div className="space-y-5 animate-in fade-in duration-500">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    CHOOSE YOUR GUARDIAN SPECIALIZATION
                  </div>
                  <h3 className="text-xl font-black text-white">Select Your Tactical Avatar</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
                  {(['AGENT', 'SCOUT', 'ANALYST', 'DEFENDER'] as GuardianAvatarStyle[]).map((style) => {
                    const isSelected = avatarStyle === style;
                    const colors: Record<string, { border: string; bg: string; text: string }> = {
                      AGENT: { border: 'border-cyan-500', bg: 'bg-cyan-950/60', text: 'text-cyan-300' },
                      SCOUT: { border: 'border-emerald-500', bg: 'bg-emerald-950/60', text: 'text-emerald-300' },
                      ANALYST: { border: 'border-purple-500', bg: 'bg-purple-950/60', text: 'text-purple-300' },
                      DEFENDER: { border: 'border-amber-500', bg: 'bg-amber-950/60', text: 'text-amber-300' },
                    };
                    const c = colors[style];

                    return (
                      <button
                        key={style}
                        onClick={() => handleSelectAvatar(style)}
                        className={`p-3 rounded-xl border transition-all text-center group ${
                          isSelected ? `${c.border} ${c.bg} shadow-[0_0_20px_rgba(6,182,212,0.4)]` : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                        }`}
                      >
                        <div className={`text-2xl font-black ${c.text} mb-1`}>
                          {style[0]}
                        </div>
                        <div className="text-xs font-bold text-white">{style}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {style === 'AGENT' && 'Strategic'}
                          {style === 'SCOUT' && 'Speed'}
                          {style === 'ANALYST' && 'Forensic'}
                          {style === 'DEFENDER' && 'Shield'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Phase 3: Walking onto Map */}
            {cinematicPhase === 3 && (
              <div className="space-y-3 animate-in fade-in duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>GUARDIAN DEPLOYED ON-SITE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Protect your community from information attacks.
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  1,000 citizens in Sectors Alpha, Beta, Gamma, and Delta depend on your decisions.
                </p>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={handleCompleteCinematic}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)]"
              >
                <span>{cinematicPhase === 3 ? 'ENTER ARENA' : 'SKIP INTRO (SPACE)'}</span>
              </button>

              <button
                onClick={handleActivateJudgeMode}
                className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs uppercase transition-all flex items-center gap-1.5"
                title="Unlock all 6 levels & grant 60 credits for fast 2-minute evaluation"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>JUDGE PLAY MODE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FIRST-PLAY TUTORIAL OVERLAY ── */}
      {showTutorial && !showCinematic && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-md w-full px-4 animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/60 backdrop-blur-2xl shadow-[0_0_35px_rgba(6,182,212,0.3)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-cyan-300">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>COMBAT DEFENSE CONTROLS</span>
              </div>
              <button
                onClick={() => {
                  setShowTutorial(false);
                  localStorage.setItem('trustiq_tutorial_seen', 'true');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-mono text-cyan-400 font-black text-sm">WASD</div>
                <div className="text-[10px] text-slate-300">Move Guardian</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-mono text-amber-400 font-black text-sm">[E] KEY</div>
                <div className="text-[10px] text-slate-300">Inspect Threat</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-mono text-emerald-400 font-black text-sm">[1 - 5]</div>
                <div className="text-[10px] text-slate-300">Defend Sector</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">Tap anywhere on map to move via touch.</span>
              <button
                onClick={() => {
                  setShowTutorial(false);
                  localStorage.setItem('trustiq_tutorial_seen', 'true');
                  sound.playClick();
                }}
                className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-black text-[11px] uppercase"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP HUD (RESPONSIVE) ── */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 pointer-events-none flex flex-wrap items-center justify-between gap-2 z-20">
        {/* Left: Community & Resources */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-md shadow-lg pointer-events-auto">
          <button
            onClick={() => {
              sound.playClick();
              onBackToMap();
            }}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all mr-0.5"
            title="Return to World Map"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider">TRUST</div>
              <div className={`text-xs sm:text-sm font-black ${trustScore < 40 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {trustScore}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <div>
              <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider">EXPOSURE</div>
              <div className="text-xs sm:text-sm font-black text-rose-400">
                {exposureScore}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider">CREDITS</div>
              <div className="text-xs sm:text-sm font-black text-cyan-400">
                {credits} <span className="text-[9px] text-slate-500">CR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Wave Operations Deck (Timer & Threat Counter) */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-md shadow-lg pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded font-mono"
              style={{ backgroundColor: `${currentLevel.accentColor}25`, color: currentLevel.accentColor, border: `1px solid ${currentLevel.accentColor}60` }}
            >
              {currentLevel.code}
            </span>
            <div className="text-left hidden sm:block">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">WAVE OPERATION</div>
              <div className="text-xs font-black text-white">{currentLevel.title.toUpperCase()}</div>
            </div>
          </div>

          <div className="h-5 sm:h-6 w-px bg-slate-800" />

          {/* Countdown Timer */}
          <div className="flex items-center gap-1 font-mono">
            <Clock className={`w-3.5 h-3.5 ${waveTimer <= 20 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className={`text-xs sm:text-sm font-black ${waveTimer <= 20 ? 'text-red-400 font-bold' : 'text-cyan-300'}`}>
              {Math.floor(waveTimer / 60).toString().padStart(2, '0')}:{(waveTimer % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="h-5 sm:h-6 w-px bg-slate-800" />

          {/* Threats Counter */}
          <div className="flex items-center gap-1.5">
            <div className="text-right">
              <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider">THREATS</div>
              <div className="text-xs font-black text-amber-400 font-mono">
                {Math.max(0, currentLevel.totalThreats - threatsResolved)}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: currentLevel.totalThreats }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i < threatsResolved
                      ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                      : i < threatsSpawned
                      ? 'bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Zone Select Map Button */}
          <button
            onClick={() => {
              sound.playClick();
              setWaveState('LEVEL_SELECT');
            }}
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-[9px] sm:text-[10px] font-bold uppercase transition-all flex items-center gap-1"
          >
            <MapIcon className="w-3 h-3" />
            <span>ZONES</span>
          </button>
        </div>

        {/* Right: Audio Toggle, Judge Mode & Guardian Identity */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Audio Mute Button */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition-all ${
              isAudioMuted
                ? 'bg-slate-900 border-slate-700 text-slate-500'
                : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300 hover:text-white'
            }`}
            title={isAudioMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Judge Mode Button */}
          <button
            onClick={handleActivateJudgeMode}
            className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
              judgeModeActive
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-500/40'
            }`}
            title="Fast Judge Mode: Unlocks all 6 levels & grants 60 credits"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">JUDGE MODE</span>
          </button>

          {/* Player Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-md shadow-lg">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center font-bold text-xs text-cyan-300">
              {avatarStyle[0]}
            </div>
            <div className="hidden sm:block">
              <div className="text-[11px] font-extrabold text-white flex items-center gap-1">
                <span>{localPlayer.name || 'Agent'}</span>
                <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono">
                  {avatarStyle}
                </span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {playerXp} XP · LVL {localPlayer.level ?? 1}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE TOUCH D-PAD (TOUCH CONTROLS) ── */}
      <div className="absolute bottom-20 left-4 z-20 sm:hidden pointer-events-auto flex flex-col items-center gap-1 select-none">
        <button
          onTouchStart={() => handleTouchDirection('up', true)}
          onTouchEnd={() => handleTouchDirection('up', false)}
          onMouseDown={() => handleTouchDirection('up', true)}
          onMouseUp={() => handleTouchDirection('up', false)}
          className="w-11 h-11 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-cyan-300 flex items-center justify-center active:bg-cyan-500 active:text-slate-950"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex gap-1">
          <button
            onTouchStart={() => handleTouchDirection('left', true)}
            onTouchEnd={() => handleTouchDirection('left', false)}
            onMouseDown={() => handleTouchDirection('left', true)}
            onMouseUp={() => handleTouchDirection('left', false)}
            className="w-11 h-11 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-cyan-300 flex items-center justify-center active:bg-cyan-500 active:text-slate-950"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <button
            onTouchStart={() => handleTouchDirection('down', true)}
            onTouchEnd={() => handleTouchDirection('down', false)}
            onMouseDown={() => handleTouchDirection('down', true)}
            onMouseUp={() => handleTouchDirection('down', false)}
            className="w-11 h-11 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-cyan-300 flex items-center justify-center active:bg-cyan-500 active:text-slate-950"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onTouchStart={() => handleTouchDirection('right', true)}
            onTouchEnd={() => handleTouchDirection('right', false)}
            onMouseDown={() => handleTouchDirection('right', true)}
            onMouseUp={() => handleTouchDirection('right', false)}
            className="w-11 h-11 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-cyan-300 flex items-center justify-center active:bg-cyan-500 active:text-slate-950"
          >
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── COMPACT INTERACTIVE SIDE PANEL (SLIDE-IN, NON-PAUSING) ── */}
      {inspectedPacket && (
        <div className="absolute top-16 sm:top-20 right-2 sm:right-4 w-[410px] max-w-[calc(100vw-1rem)] max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-2xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] z-30 p-3 sm:p-4 space-y-3 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <div className="text-xs font-black text-cyan-300 tracking-wider">
                TELEMETRY INSPECTION // {inspectedPacket.formatType}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 font-bold">
                {inspectedPacket.scenario.difficulty}
              </span>
              <button
                onClick={() => setInspectedPacket(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Countdown Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1 font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>SECTOR ARRIVAL:</span>
              </span>
              <span className={`font-black font-mono ${inspectTimeLeft < 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                {inspectTimeLeft.toFixed(1)}s
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  inspectTimeLeft < 5 ? 'bg-red-500' : 'bg-gradient-to-r from-amber-400 to-rose-500'
                }`}
                style={{ width: `${Math.min(100, (inspectTimeLeft / 20.0) * 100)}%` }}
              />
            </div>
          </div>

          {/* Metadata Card */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase">SENDER</span>
              <span className="font-bold text-white font-mono text-[11px] truncate max-w-[200px]">
                {inspectedPacket.scenario.sender}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase">TARGET SECTOR</span>
              <span className="font-bold text-cyan-300 flex items-center gap-1 text-[11px]">
                <Crosshair className="w-3 h-3 text-rose-400" />
                {inspectedPacket.targetSectorName}
              </span>
            </div>
          </div>

          {/* Raw Payload Preview */}
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-cyan-400" />
              <span>RAW PAYLOAD TRANSCRIPTION</span>
            </div>
            <p className="text-slate-200 text-xs font-mono bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed max-h-24 overflow-y-auto">
              "{inspectedPacket.scenario.content}"
            </p>
          </div>

          {/* Step 2: Interactive Scan Mini-Games Suite */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <ScanMiniGame
              scenarioContent={inspectedPacket.scenario.content}
              senderOrContent={inspectedPacket.scenario.sender + ' ' + inspectedPacket.scenario.content}
              credits={credits}
              alreadyScanned={(inspectedPacket.scenario.investigations_done as InvestigationActionType[]) || []}
              onRunScan={async (type, cost) => {
                await handleRunInvestigationTier(type, cost);
                if (inspectedPacket) {
                  inspectedPacket.scansDone = (inspectedPacket.scansDone || 0) + 1;
                }
              }}
              onClose={() => setInspectedPacket(null)}
            />
          </div>

          {/* Dossier Results */}
          {investigationDossier && (
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="font-bold text-cyan-300 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>NOVA DOSSIER INTEL</span>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200">
                  CONFIDENCE: {investigationDossier.confidence}%
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {investigationDossier.reasoning}
              </p>
              {investigationDossier.signals?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {investigationDossier.signals.map((s, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-500/20">
                      {s.type}: {s.explanation}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Decision Hotbar inside Panel (Touch-friendly 44px buttons) */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase">TACTICAL RESOLUTION HOTBAR</div>
            <div className="grid grid-cols-5 gap-1.5">
              {ABILITY_CONFIG.map((a) => (
                <button
                  key={a.key}
                  disabled={isSubmittingDecision || (a.protocol === 'ESCALATE' && escalateCooldown > 0)}
                  onClick={() => handleExecuteAbility(a.protocol)}
                  onMouseEnter={() => setHoveredAbility(a)}
                  onMouseLeave={() => setHoveredAbility(null)}
                  className={`min-h-[44px] p-2 rounded-xl bg-slate-900 border ${a.borderColor} hover:bg-slate-800 active:scale-95 transition-all text-center group disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <div className="text-[9px] font-mono text-slate-400 group-hover:text-white">[{a.numberKey}]</div>
                  <div className={`text-[10px] font-extrabold ${a.color}`}>{a.label.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LEVEL COMPLETE MODAL ── */}
      {waveState === 'WAVE_COMPLETE' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-2xl bg-slate-950 border border-cyan-500/50 p-5 sm:p-6 space-y-4 shadow-[0_0_60px_rgba(6,182,212,0.35)] animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5" />
                <span>WAVE SECURED // LEVEL COMPLETED</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {currentLevel.code}: {currentLevel.title.toUpperCase()}
              </h2>
              <p className="text-xs text-slate-400">
                {currentLevel.threatType} contained. Citizen infrastructure stabilized.
              </p>
            </div>

            {isRankedUp && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-emerald-500/20 border border-amber-500/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400 animate-bounce" />
                  <div>
                    <div className="text-xs font-extrabold text-amber-300">GUARDIAN PROMOTION CONFIRMED</div>
                    <div className="text-[11px] text-slate-300">
                      Rank advanced to <strong>{localPlayer.rank}</strong> (Level {localPlayer.level})
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 font-mono font-bold">
                  PROMOTED
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase font-bold">CITIZENS SAVED</div>
                <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                  {citizensSavedCount} <span className="text-[9px] text-slate-500">/ 1000</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase font-bold">TRUST CHANGE</div>
                <div className={`text-base sm:text-lg font-black font-mono ${trustDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trustDelta >= 0 ? `+${trustDelta}%` : `${trustDelta}%`}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase font-bold">XP EARNED</div>
                <div className="text-base sm:text-lg font-black text-cyan-400 font-mono">
                  +{waveXpEarned} <span className="text-[9px] text-slate-500">XP</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[9px] text-slate-400 uppercase font-bold">THREATS DEALT</div>
                <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                  {threatsResolved} <span className="text-[9px] text-slate-500">/ {currentLevel.totalThreats}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Dna className="w-3.5 h-3.5 text-cyan-400" />
                  <span>TRUST DNA RADAR (8 AXES)</span>
                </div>
                <TrustDnaRadar dna={trustDnaData} size={220} />
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">ARCHETYPE</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
                      {archetype.badge}
                    </span>
                  </div>
                  <div className={`text-sm font-black ${archetype.color}`}>
                    {archetype.title}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {archetype.tagline}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300">
                      <Brain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>ADAPTIVE DIRECTIVE</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Cognitive vulnerability identified on <strong>{weakestSkill.replace(/_/g, ' ').toUpperCase()}</strong> ({trustDnaData[weakestSkill as keyof TrustDna] || 48}%). Next wave recalibrated toward {currentLevel.id < 6 ? GAME_LEVELS[currentLevel.id].threatType : 'Simultaneous 3-Vector Assault'} to test systemic resilience.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setWaveState('LEVEL_SELECT');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase transition-all flex items-center gap-1.5 min-h-[44px]"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>LEVEL SELECT</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    startLevel(currentLevel.id);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs uppercase transition-all flex items-center gap-1.5 min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>REPLAY WAVE</span>
                </button>

                {currentLevel.id < 6 && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      const nextL = currentLevel.id + 1;
                      startLevel(nextL);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-1.5 min-h-[44px]"
                  >
                    <span>NEXT WAVE (L{currentLevel.id + 1})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GAME OVER MODAL (0% TRUST) ── */}
      {waveState === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-slate-950 border border-red-500/60 p-6 space-y-5 text-center shadow-[0_0_60px_rgba(239,68,68,0.4)] animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-red-400 tracking-wider">
                CRITICAL SYSTEM BREACH
              </h2>
              <p className="text-xs text-slate-300">
                Civic Trust Reached 0%. Disinformation payload has completely overrun all community sectors.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Time Survived:</span>
                <span className="font-mono text-white font-bold">{(90 - waveTimer).toFixed(0)}s</span>
              </div>
              <div className="flex justify-between">
                <span>Threats Intercepted:</span>
                <span className="font-mono text-white font-bold">{threatsResolved} / {currentLevel.totalThreats}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setWaveState('LEVEL_SELECT');
                }}
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase transition-all min-h-[44px]"
              >
                LEVEL SELECT
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  handleRetryWave();
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] min-h-[44px]"
              >
                RETRY WAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LEVEL SELECT SCREEN (WORLD MAP WITH 6 ZONES) ── */}
      {waveState === 'LEVEL_SELECT' && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl z-50 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-5xl mx-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                  <MapIcon className="w-4 h-4" />
                  <span>GUARDIAN WORLD THEATER // 6 CAMPAIGN ZONES</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                  TACTICAL ZONE SELECT
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleActivateJudgeMode}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold uppercase flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>JUDGE UNLOCK ALL</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setWaveState('PLAYING');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
                >
                  <X className="w-4 h-4" />
                  <span>CLOSE MAP</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GAME_LEVELS.map((lvl) => {
                const isUnlocked = judgeModeActive || (playerXp >= lvl.xpRequired && (localPlayer.missions_completed ?? 0) >= lvl.missionsRequired);
                const isCompleted = completedLevels.includes(lvl.id);
                const isCurrent = lvl.id === currentLevel.id;

                return (
                  <div
                    key={lvl.id}
                    className={`rounded-2xl border p-4 space-y-3 transition-all relative overflow-hidden ${
                      isCurrent
                        ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                        : isUnlocked
                        ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${lvl.accentColor}25`, color: lvl.accentColor, border: `1px solid ${lvl.accentColor}50` }}
                        >
                          {lvl.code}
                        </span>
                        <span className="text-xs font-bold text-white">{lvl.title}</span>
                      </div>

                      {isCompleted ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          SECURED
                        </span>
                      ) : !isUnlocked ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          LOCKED
                        </span>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                          READY
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-semibold" style={{ color: lvl.accentColor }}>
                      {lvl.threatType}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                      {lvl.description}
                    </p>

                    <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-850 text-[10px] space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>REQUIREMENT:</span>
                        <span className="font-mono text-slate-200">{lvl.xpRequired} XP & {lvl.missionsRequired} MISSIONS</span>
                      </div>
                      {!isUnlocked && (
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500"
                            style={{ width: `${Math.min(100, (playerXp / (lvl.xpRequired || 1)) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      {isUnlocked ? (
                        <button
                          onClick={() => {
                            sound.playClick();
                            startLevel(lvl.id);
                          }}
                          className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
                            isCompleted
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                              : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{isCompleted ? 'REPLAY ZONE' : 'DEPLOY GUARDIAN'}</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed min-h-[44px]"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>LOCKED</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM HUD DECK (RESPONSIVE) ── */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 pointer-events-none flex flex-wrap items-end justify-between gap-2 z-10">
        <div className="pointer-events-auto p-3 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-xl shadow-lg max-w-sm space-y-1.5 hidden md:block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Activity className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>GUARDIAN SURVEILLANCE RADAR</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              ACTIVE
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Guarding <strong className="text-white">1,000 citizens</strong> across 4 sectors. 
            Active threats in transit: <strong className="text-amber-400">{packetsRef.current.length}</strong>.
          </p>

          <div className="grid grid-cols-4 gap-1.5 pt-0.5 text-[10px] text-center">
            {SECTOR_DEFS.map((s) => (
              <div
                key={s.id}
                className={`p-1 rounded border transition-all ${
                  currentSector.id === s.id
                    ? 'border-cyan-400 bg-cyan-950/40 text-white font-bold'
                    : 'border-slate-800 bg-slate-900/40 text-slate-500'
                }`}
              >
                <div style={{ color: s.color }}>{s.name.split(' ')[1]}</div>
                <div className="text-[9px] text-slate-400">{s.population} pop</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 & 3: Tactical Aimed Tools & Movement Skills Hotbar */}
        <div className="pointer-events-auto mx-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-2xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.2)]">
          {/* Aimed Decision Tools 1-5 */}
          <div className="flex items-center gap-1">
            {AIMED_TOOLS.map((tool) => {
              const isSelected = selectedTool === tool.key;
              const cd = toolCooldowns[tool.key];
              const isLockedByEscalate = tool.key === 'CERTIN' && escalateCooldown > 0;
              const activeCd = Math.max(cd, isLockedByEscalate ? escalateCooldown : 0);

              return (
                <button
                  key={tool.key}
                  onClick={() => {
                    setSelectedTool(tool.key);
                    sound.playClick();
                  }}
                  className={`relative px-2.5 py-1.5 rounded-xl border text-left transition-all min-h-[42px] flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                  title={`${tool.label} [${tool.hotkey}]: ${tool.description}`}
                >
                  <span className="text-[11px] font-mono font-bold text-slate-400">[{tool.hotkey}]</span>
                  <span className="text-xs" style={{ color: tool.color }}>{tool.icon}</span>
                  <span className="text-[11px] font-bold hidden md:inline" style={{ color: tool.color }}>{tool.shortLabel}</span>
                  {activeCd > 0 && (
                    <span className="ml-1 text-[9px] font-mono font-extrabold px-1 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                      {Math.ceil(activeCd)}s
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block mx-1" />

          {/* Movement Skills (Shift Dash, Space Pulse, Q Shield) */}
          <div className="flex items-center gap-1">
            {/* Dash */}
            <button
              onClick={() => triggerDashSkill()}
              disabled={skillCooldowns.dash > 0}
              className="px-2 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[10px] font-bold min-h-[42px] flex items-center gap-1 disabled:opacity-40 transition-all"
              title="Dash [Shift]: 2.5x speed burst for 0.4s (3s CD)"
            >
              <span className="font-mono text-slate-400">[Shift]</span>
              <span>DASH</span>
              {skillCooldowns.dash > 0 && <span className="font-mono text-red-400">({Math.ceil(skillCooldowns.dash)}s)</span>}
            </button>

            {/* Scan Pulse */}
            <button
              onClick={() => triggerScanPulseSkill()}
              disabled={skillCooldowns.pulse > 0 || credits < 1}
              className="px-2 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[10px] font-bold min-h-[42px] flex items-center gap-1 disabled:opacity-40 transition-all"
              title="Scan Pulse [Space]: 300px radar flash revealing threat natures (-1 CR)"
            >
              <span className="font-mono text-slate-400">[Space]</span>
              <span>PULSE</span>
              <span className="text-[9px] font-mono text-amber-400">-1CR</span>
              {skillCooldowns.pulse > 0 && <span className="font-mono text-red-400">({Math.ceil(skillCooldowns.pulse)}s)</span>}
            </button>

            {/* Trust Shield */}
            <button
              onClick={() => triggerTrustShieldSkill()}
              disabled={skillCooldowns.shield > 0}
              className="px-2 py-1.5 rounded-xl bg-slate-900/80 border border-sky-500/30 hover:border-sky-400 text-sky-300 text-[10px] font-bold min-h-[42px] flex items-center gap-1 disabled:opacity-40 transition-all"
              title="Trust Shield [Q]: Drops sector shield absorbing breach for 4s (15s CD)"
            >
              <span className="font-mono text-slate-400">[Q]</span>
              <span>SHIELD</span>
              {skillCooldowns.shield > 0 && <span className="font-mono text-red-400">({Math.ceil(skillCooldowns.shield)}s)</span>}
            </button>
          </div>
        </div>

        {/* Right CTA */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setShowCinematic(true);
              setCinematicPhase(0);
            }}
            className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase transition-all hidden lg:block"
            title="Replay Cinematic Intro"
          >
            INTRO
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setWaveState('LEVEL_SELECT');
            }}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95 flex items-center gap-2 min-h-[44px]"
          >
            <Crosshair className="w-4 h-4 text-slate-950" />
            <span>CAMPAIGN ZONES MAP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
