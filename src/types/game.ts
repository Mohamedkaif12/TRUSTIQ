export type CardCategory =
  | 'bank'
  | 'college'
  | 'government'
  | 'health'
  | 'whatsapp'
  | 'social';

export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type GroundTruth = 'SAFE' | 'SCAM' | 'HOAX' | 'MISINFORMATION';

export type DecisionType = 'TRUST' | 'BLOCK';

export interface DeepForensics {
  sourceOrigin: string;
  domainAge: string;
  propagationRate: string;
  networkThreatLevel: string;
  threatActors?: string;
  targetDemographic: string;
  technicalFingerprint: string;
}

export interface MockAIData {
  claim: string;
  manipulationSignals: string[];
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidence: number; // percentage 0 - 100
  explanation: string;
  deepForensics: DeepForensics;
}

export interface InformationCard {
  id: string;
  category: CardCategory;
  categoryLabel: string;
  sender: string;
  timestamp: string;
  channel: string;
  title: string;
  content: string;
  groundTruth: GroundTruth;
  isLegitimate: boolean;
  baseAudienceImpact: number; // Number of people who would read this
  
  // Investigation state
  isInvestigated: boolean;
  isDeepInvestigated: boolean;
  aiData: MockAIData;
  
  // Resolution state
  status: 'PENDING' | 'DECIDED';
  userDecision?: DecisionType;
}

export interface GameStats {
  communityMembers: number; // starts 1000
  investigationCredits: number; // starts 30
  trustLives: number; // starts 3
  trustXp: number; // starts 0
  communityTrust: number; // starts 100 (%)
  
  totalDecisions: number;
  correctDecisions: number;
  threatsNeutralized: number;
  falsePositives: number;
  investigationsPerformed: number;
  deepScansPerformed: number;
  peopleProtectedTotal: number;
  peopleDamagedTotal: number;
}

export interface DecisionConsequence {
  cardId: string;
  cardTitle: string;
  decision: DecisionType;
  isCorrect: boolean;
  verdictTitle: string;
  outcomeType: 'SUCCESS' | 'BREACH' | 'FALSE_POSITIVE' | 'NEUTRAL';
  impactTrustDelta: number;
  impactMembersDelta: number; // positive = protected, negative = scammed/damaged
  impactXpDelta: number;
  impactLivesDelta: number;
  debriefSummary: string;
  realWorldLesson: string;
}

export interface TrustDnaProfile {
  archetype: string;
  tagline: string;
  accuracyRate: number;
  skepticismBias: 'BALANCED' | 'OVER_CAUTIOUS' | 'CREDULOUS';
  investigationEfficiency: string;
  survivalRate: number;
  strengths: string[];
  vulnerabilities: string[];
  threatAwarenessScore: number;
}
