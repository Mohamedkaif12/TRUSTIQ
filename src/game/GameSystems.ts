// ── GameSystems.ts ─────────────────────────────────────────────────────
// New types for Steps 1-5: Aimed decisions, skills, threat variants,
// scan mini-games. Does NOT touch any backend types.

// ── Step 1: Aimed Tool System ─────────────────────────────────────────
export type AimedToolKey =
  | 'BEACON'       // Advisory Beacon → VERIFY
  | 'FREEZE'       // Freeze Field → HOLD (placed on ground)
  | 'BOLT'         // Firewall Bolt → CONTAIN (projectile)
  | 'CERTIN'       // CERT-In Strike → ESCALATE (long cooldown)
  | 'CORRIDOR';    // Green Corridor → ALLOW

export interface AimedTool {
  key: AimedToolKey;
  label: string;
  shortLabel: string;
  protocol: string; // maps to existing PlayerDecision
  hotkey: string;
  color: string;
  accentColor: string;
  description: string;
  requiresScan: boolean;  // must complete ≥1 scan before targeting
  isProjectile: boolean;  // flies toward packet on click
  isPlaced: boolean;      // placed on ground (Freeze Field)
  cooldown: number;       // seconds
  icon: string;           // emoji for canvas
}

export const AIMED_TOOLS: AimedTool[] = [
  {
    key: 'BEACON',
    label: 'Advisory Beacon',
    shortLabel: 'VERIFY',
    protocol: 'VERIFY',
    hotkey: '1',
    color: '#22d3ee',
    accentColor: '#06b6d4',
    description: 'Tags packet with citizen advisory. Balanced.',
    requiresScan: false,
    isProjectile: true,
    isPlaced: false,
    cooldown: 0,
    icon: '◈',
  },
  {
    key: 'FREEZE',
    label: 'Freeze Field',
    shortLabel: 'HOLD',
    protocol: 'HOLD',
    hotkey: '2',
    color: '#38bdf8',
    accentColor: '#0ea5e9',
    description: 'Place on ground — slows crossing packets for 6s.',
    requiresScan: false,
    isProjectile: false,
    isPlaced: true,
    cooldown: 8,
    icon: '❄',
  },
  {
    key: 'BOLT',
    label: 'Firewall Bolt',
    shortLabel: 'CONTAIN',
    protocol: 'CONTAIN',
    hotkey: '3',
    color: '#fb7185',
    accentColor: '#f43f5e',
    description: 'Fast projectile — destroys packet on hit.',
    requiresScan: true,
    isProjectile: true,
    isPlaced: false,
    cooldown: 0,
    icon: '⚡',
  },
  {
    key: 'CERTIN',
    label: 'CERT-In Strike',
    shortLabel: 'ESCALATE',
    protocol: 'ESCALATE',
    hotkey: '4',
    color: '#ef4444',
    accentColor: '#dc2626',
    description: 'Federal takedown — max XP but long cooldown.',
    requiresScan: true,
    isProjectile: true,
    isPlaced: false,
    cooldown: 20,
    icon: '🛡',
  },
  {
    key: 'CORRIDOR',
    label: 'Green Corridor',
    shortLabel: 'ALLOW',
    protocol: 'ALLOW',
    hotkey: '5',
    color: '#34d399',
    accentColor: '#10b981',
    description: 'Open safe lane — let genuine alerts through.',
    requiresScan: false,
    isProjectile: true,
    isPlaced: false,
    cooldown: 0,
    icon: '▶',
  },
];

// ── Projectile flying toward packet ─────────────────────────────────
export interface ToolProjectile {
  id: string;
  toolKey: AimedToolKey;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  currentX: number;
  currentY: number;
  speed: number;       // pixels/sec
  color: string;
  targetPacketId: string;
  hit: boolean;
}

// ── Freeze Field placed on canvas ────────────────────────────────────
export interface FreezeField {
  id: string;
  x: number;
  y: number;
  radius: number;
  timer: number;    // seconds remaining
  maxTimer: number;
  alpha: number;
}

// ── Step 3: Movement Skill Cooldowns ─────────────────────────────────
export interface SkillState {
  dashCooldown: number;      // seconds remaining
  scanPulseCooldown: number;
  shieldCooldown: number;
  shieldActive: boolean;
  shieldTimer: number;
  scanPulseActive: boolean;
  scanPulseRadius: number;
  scanPulseAlpha: number;
  isDashing: boolean;
  dashTimer: number;
}

export const INITIAL_SKILL_STATE: SkillState = {
  dashCooldown: 0,
  scanPulseCooldown: 0,
  shieldCooldown: 0,
  shieldActive: false,
  shieldTimer: 0,
  scanPulseActive: false,
  scanPulseRadius: 0,
  scanPulseAlpha: 0,
  isDashing: false,
  dashTimer: 0,
};

// ── Step 4: Threat Variant Extensions ────────────────────────────────
export type ThreatVariant =
  | 'NORMAL'
  | 'SPLITTER'     // splits into copies after 10s unhandled
  | 'DISGUISER'    // scam but uses genuine colour
  | 'DECOY'        // genuine but looks alarming
  | 'RUNNER'       // 2× speed
  | 'ELITE';       // needs 2 distinct scans before tool can fire

// ── Step 2: Scan Mini-Game State ─────────────────────────────────────
export type MiniGameType = 'QUICK_SCAN' | 'SOURCE_CHECK' | 'VOICE_ANALYSIS' | 'MEDIA_SCAN';

export interface QuickScanGame {
  type: 'QUICK_SCAN';
  words: Array<{ word: string; isTarget: boolean; tapped: boolean }>;
  requiredTaps: number;
  tappedCount: number;
}

export interface SourceCheckGame {
  type: 'SOURCE_CHECK';
  displayDomain: string;       // e.g. "sbi-yono.co" (fake)
  realDomain: string;          // e.g. "sbi.co.in"
  badCharIndex: number;        // index of the suspicious char
  clicked: boolean;
}

export interface VoiceAnalysisGame {
  type: 'VOICE_ANALYSIS';
  spikes: Array<{ x: number; height: number; isTarget: boolean; clicked: boolean }>;
  requiredClicks: number;
  clickedCount: number;
}

export interface MediaScanGame {
  type: 'MEDIA_SCAN';
  lensX: number;
  lensY: number;
  targetX: number;
  targetY: number;
  found: boolean;
  dragging: boolean;
}

export type MiniGame =
  | QuickScanGame
  | SourceCheckGame
  | VoiceAnalysisGame
  | MediaScanGame;

// ── Mini-map packet blip ─────────────────────────────────────────────
export interface MiniMapBlip {
  nx: number; // normalized 0-1
  ny: number;
  color: string;
  isGuardian?: boolean;
}

// ── Urgency / fear phrases for Quick Scan ────────────────────────────
export const URGENCY_PHRASES = [
  'immediately', 'urgent', 'urgent:', 'warning', 'alert', 'action required',
  'tonight', 'within 24', 'do not ignore', 'failure to comply', 'penalty',
  'blocked', 'disconnected', 'arrested', 'deactivated', 'final notice',
  'suspended', 'click here', 'verify now', 'limited time', 'expire',
  'act now', 'last chance', 'government order', 'legal action', 'FIR',
  'warrant', 'frozen', 'forfeit', 'prize', 'won', 'congratulations',
  'claim', 'reward', 'free', 'lottery', 'selected',
];

// ── Build a Quick Scan game from message text ─────────────────────────
export function buildQuickScanGame(messageText: string): QuickScanGame {
  const lower = messageText.toLowerCase();
  const allWords = messageText.split(/\s+/).slice(0, 50);

  const words = allWords.map((word) => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    const isTarget = URGENCY_PHRASES.some((p) => lower.includes(p) && clean && p.includes(clean));
    return { word, isTarget, tapped: false };
  });

  // Ensure at least 2 targets exist
  let targetCount = words.filter((w) => w.isTarget).length;
  if (targetCount < 2) {
    // Mark some high-emotion-looking words
    words.forEach((w) => {
      if (!w.isTarget && w.word.length > 5 && targetCount < 3) {
        w.isTarget = true;
        targetCount++;
      }
    });
  }

  return {
    type: 'QUICK_SCAN',
    words,
    requiredTaps: Math.min(targetCount, 3),
    tappedCount: 0,
  };
}

// ── Build a Source Check game ─────────────────────────────────────────
export function buildSourceCheckGame(senderOrContent: string): SourceCheckGame {
  // Extract or fabricate a lookalike domain
  const urlMatch = senderOrContent.match(/https?:\/\/([^\s/]+)/);
  const emailMatch = senderOrContent.match(/[\w.-]+@([\w.-]+)/);

  let displayDomain = urlMatch?.[1] || emailMatch?.[1] || 'sbi-yono-kyc.in';
  let realDomain = 'sbi.co.in';

  if (displayDomain.includes('sbi')) realDomain = 'sbi.co.in';
  else if (displayDomain.includes('hdfc')) realDomain = 'hdfcbank.com';
  else if (displayDomain.includes('paytm')) realDomain = 'paytm.com';
  else if (displayDomain.includes('upi')) realDomain = 'npci.org.in';
  else if (displayDomain.includes('gov')) realDomain = 'india.gov.in';
  else {
    // Generic suspicious domain
    displayDomain = 'verify-portal-india.xyz';
    realDomain = 'india.gov.in';
  }

  // Pick a bad char index — usually a hyphen or extra segment
  const badCharIndex = displayDomain.indexOf('-') !== -1
    ? displayDomain.indexOf('-')
    : Math.floor(displayDomain.length * 0.4);

  return {
    type: 'SOURCE_CHECK',
    displayDomain,
    realDomain,
    badCharIndex,
    clicked: false,
  };
}

// ── Build Voice Analysis game ─────────────────────────────────────────
export function buildVoiceAnalysisGame(): VoiceAnalysisGame {
  const numSpikes = 32;
  const spikes = Array.from({ length: numSpikes }, (_, i) => {
    const isTarget = [6, 14, 22].includes(i); // 3 anomaly spikes
    return {
      x: i / numSpikes,
      height: isTarget ? 0.75 + Math.random() * 0.25 : 0.15 + Math.random() * 0.45,
      isTarget,
      clicked: false,
    };
  });
  return { type: 'VOICE_ANALYSIS', spikes, requiredClicks: 3, clickedCount: 0 };
}

// ── Build Media Scan game ─────────────────────────────────────────────
export function buildMediaScanGame(): MediaScanGame {
  return {
    type: 'MEDIA_SCAN',
    lensX: 0.1,
    lensY: 0.1,
    targetX: 0.5 + Math.random() * 0.35,
    targetY: 0.3 + Math.random() * 0.4,
    found: false,
    dragging: false,
  };
}
