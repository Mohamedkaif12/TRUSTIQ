export type ContentType =
  | 'text_upi_link'
  | 'link'
  | 'text'
  | 'voice_message'
  | 'screenshot_image';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export type GroundTruth = 'GENUINE' | 'SCAM' | 'MISINFORMATION' | 'HOAX' | 'HIDDEN';

export type PlayerDecision = 'ALLOW' | 'VERIFY' | 'HOLD' | 'CONTAIN' | 'ESCALATE';

export type InvestigationActionType =
  | 'quick_scan'
  | 'source_check'
  | 'screenshot_analysis'
  | 'voice_analysis'
  | 'deep_investigation';

export interface InvestigationActionMeta {
  type: InvestigationActionType;
  label: string;
  cost: number;
  description: string;
  iconName: string;
}

export const INVESTIGATION_TIERS: InvestigationActionMeta[] = [
  {
    type: 'quick_scan',
    label: 'Quick Scan',
    cost: 3,
    description: 'Fast semantic scan for urgency triggers, panic patterns, and threat index.',
    iconName: 'Zap'
  },
  {
    type: 'source_check',
    label: 'Source Check',
    cost: 6,
    description: 'Verify domain registry age, carrier info, VPA validity, and reputation logs.',
    iconName: 'Globe'
  },
  {
    type: 'screenshot_analysis',
    label: 'Screenshot Analysis',
    cost: 8,
    description: 'Inspect image compression, font misalignment, ELA noise, and pixel tampering.',
    iconName: 'Image'
  },
  {
    type: 'voice_analysis',
    label: 'Voice Analysis',
    cost: 10,
    description: 'Spectrogram analysis for ElevenLabs / neural vocoder AI voice cloning artifacts.',
    iconName: 'Mic'
  },
  {
    type: 'deep_investigation',
    label: 'Deep Investigation',
    cost: 15,
    description: 'Full technical forensic report, syndicate attribution, and containment advice.',
    iconName: 'ShieldAlert'
  }
];

export interface PlayerState {
  id: string;
  name: string;
  avatar?: 'AGENT' | 'SCOUT' | 'ANALYST' | 'DEFENDER';
  level: number;
  rank?: string;
  xp?: number;
  xp_for_next_level?: number;
  missions_completed?: number;
  trust_score: number;
  investigation_credits: number;
  community_population: number;
  community_trust: number;
  community_exposure: number;
}

export interface CommunityState {
  population: number;
  community_trust: number;
  exposure: number;
  harm_prevented: number;
  harm_caused: number;
  safe_decisions: number;
  unsafe_decisions: number;
}

export interface TrustDna {
  source_verification: number;
  manipulation_detection: number;
  emotional_manipulation: number;
  authority_bias: number;
  urgency_detection: number;
  visual_verification: number;
  ai_skepticism: number;
  investigation_efficiency: number;
}

export interface Scenario {
  id: string;
  title: string;
  sender: string;
  timestamp: string;
  content: string;
  content_type: ContentType;
  difficulty: DifficultyLevel;
  ground_truth: GroundTruth;
  correct_action: PlayerDecision | 'HIDDEN';
  explanation: string;
  manipulation_signals: string[];
  base_audience?: number;
  
  // Game state
  is_decided: boolean;
  user_decision: PlayerDecision | null;
  is_correct?: boolean | null;
  investigations_done: InvestigationActionType[];
  unlocked_investigations: Record<string, AIInvestigationDossier>;
}

export interface AISignal {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
}

export type AIStatus = 'LIKELY_SAFE' | 'UNVERIFIED' | 'SUSPICIOUS' | 'POTENTIAL_THREAT';
export type AnalysisSource = 'AI' | 'FALLBACK';

export interface AIInvestigationDossier {
  risk_score: number;
  confidence: number;
  status: AIStatus;
  claim: string;
  signals: AISignal[];
  evidence: string[];
  uncertainty: string;
  recommended_action: PlayerDecision;
  reasoning: string;
  analysis_source: AnalysisSource;
  model_used: string;
  external_verification: string;
  ml_prediction?: MLPrediction;
  statistical_signals?: StatisticalSignal[];
  statistical_summary?: StatisticalSummary;
  evidence_items?: EvidenceSource[];
}

export interface InvestigationResult {
  scenario_id: string;
  action_type: InvestigationActionType;
  credits_deducted: number;
  remaining_credits: number;
  investigation_result: AIInvestigationDossier;
}

export interface DecisionConsequence {
  scenario_id: string;
  decision: PlayerDecision;
  player_action?: PlayerDecision;
  verdict_label: string;
  is_correct: boolean;
  correct_action: PlayerDecision;
  ground_truth: GroundTruth;
  difficulty?: DifficultyLevel;
  explanation: string;
  // Trust score
  trust_points_delta: number;
  new_trust_score?: number;
  // Community impact
  community_trust_delta: number;
  exposure_delta?: number;
  community_exposure_delta: number;
  harm_prevented_delta?: number;
  harm_caused_delta?: number;
  simulation_impact_summary?: string;
  new_community_state?: CommunityState;
  // AI reliability
  ai_recommendation?: PlayerDecision | null;
  ai_override_success?: boolean;
  ai_override_message?: string;
  // Trust DNA
  trust_dna_deltas?: Record<string, number>;
  new_trust_dna?: TrustDna;
  strongest_skill?: string;
  weakest_skill?: string;
  // Phase 6 Digital Guardian Progression
  xp_earned?: number;
  xp_breakdown?: {
    total_xp: number;
    base_xp: number;
    override_bonus: number;
    efficiency_bonus: number;
  };
  guardian_rank?: string;
  guardian_level?: number;
  guardian_reaction?: string;
  // Player state
  updated_player: PlayerState;
}

export interface DecisionLog {
  id: number;
  scenario_id: string;
  title: string;
  sender: string;
  difficulty: string;
  ground_truth: string;
  correct_action: string;
  decision: PlayerDecision;
  ai_recommendation?: string;
  is_correct: boolean;
  credits_spent?: number;
  trust_points_delta: number;
  community_trust_delta: number;
  community_exposure_delta: number;
  harm_prevented_delta?: number;
  harm_caused_delta?: number;
  ai_override_success?: number | boolean;
  simulation_impact_summary?: string;
  trust_dna_deltas?: Record<string, number>;
  explanation: string;
  decided_at: string;
}

export interface ResultsData {
  player: PlayerState;
  community?: CommunityState;
  trust_dna?: TrustDna;
  total_decisions: number;
  correct_decisions: number;
  accuracy_rate: number;
  decision_logs: DecisionLog[];
}

export interface PlayerProfile {
  player: PlayerState;
  community: CommunityState;
  trust_dna: TrustDna;
  strongest_skill: string;
  weakest_skill: string;
  total_decisions: number;
  correct_decisions: number;
  accuracy_rate: number;
}

export interface AdaptiveChallenge {
  scenario_id: string;
  difficulty: DifficultyLevel;
  training_focus: string;
  reason: string;
  skill_target: string;
}

export type GuardianAvatarStyle = 'AGENT' | 'SCOUT' | 'ANALYST' | 'DEFENDER';

export interface GuardianProfile {
  id: string;
  name: string;
  avatar: GuardianAvatarStyle;
  rank: string;
  level: number;
  xp: number;
  xp_for_next_level: number;
  trust_score: number;
  investigation_credits: number;
  community_population: number;
  community_trust: number;
  community_exposure: number;
  community_protected: number;
  missions_completed: number;
  total_decisions: number;
  correct_decisions: number;
  accuracy_rate: number;
  weakest_skill: string;
  strongest_skill: string;
  training_focus: string;
}

export interface GuardianAchievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
  category: string;
}

export interface GuardianMission {
  id: string;
  title: string;
  description: string;
  target_skill: string;
  status: 'ACTIVE' | 'COMPLETED' | 'LOCKED';
  xp_reward: number;
  linked_scenarios: string[];
}

export interface MLPrediction {
  risk_score: number;
  risk_class: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  probabilities: Record<string, number>;
  top_features: string[];
  top_feature_details?: Array<{
    feature: string;
    label: string;
    value: number;
    impact_score: number;
  }>;
  features?: Record<string, number>;
  statistical_signals?: StatisticalSignal[];
  statistical_summary?: StatisticalSummary;
  model_status?: string;
  prediction_disclaimer?: string;
}

export interface StatisticalSignal {
  feature: string;
  label: string;
  value: number;
  baseline_mean: number;
  baseline_std: number;
  z_score: number;
  level: 'NORMAL' | 'SLIGHTLY_UNUSUAL' | 'UNUSUAL' | 'HIGHLY_UNUSUAL';
  interpretation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_anomaly: boolean;
}

export interface StatisticalSummary {
  total_signals_evaluated: number;
  anomalies_detected: number;
  max_z_score: number;
  has_high_deviation: boolean;
  signals: StatisticalSignal[];
  statistical_disclaimer: string;
}

export interface EvidenceSource {
  source_name: string;
  source_url: string;
  source_type: 'GOVERNMENT' | 'BANK' | 'INSTITUTION' | 'FACT_CHECK';
  support_level: 'SUPPORTED' | 'CONTRADICTED' | 'PARTIALLY_SUPPORTED' | 'UNVERIFIED';
  summary: string;
  relevance: number;
  matched_signals_count?: number;
}

export interface RealInvestigationResult {
  mode: 'REAL_INVESTIGATION';
  input_message: string;
  sender: string;
  url: string;
  ml_risk: {
    score: number;
    risk_class: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number;
    top_features: string[];
    probabilities: Record<string, number>;
  };
  statistical_signals: StatisticalSignal[];
  statistical_summary: StatisticalSummary;
  nova_dossier: {
    status: AIStatus;
    claim: string;
    signals: AISignal[];
    uncertainty: string;
    recommended_action: PlayerDecision;
    reasoning: string;
  };
  evidence_verification: EvidenceSource[];
  disclaimer: string;
}

