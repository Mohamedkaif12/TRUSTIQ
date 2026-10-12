import { 
  PlayerState, 
  Scenario, 
  InvestigationActionType, 
  PlayerDecision, 
  InvestigationResult, 
  DecisionConsequence,
  ResultsData,
  CommunityState,
  TrustDna,
  PlayerProfile,
  AdaptiveChallenge,
  GuardianProfile,
  GuardianAchievement,
  GuardianMission,
  GuardianAvatarStyle,
  MLPrediction,
  StatisticalSignal,
  EvidenceSource,
  RealInvestigationResult,
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  async getAiStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/ai-status`);
      return await res.json();
    } catch {
      return { ai_available: false, analysis_mode: 'FALLBACK' };
    }
  },

  async getPlayer(): Promise<PlayerState> {
    const res = await fetch(`${API_BASE_URL}/player`);
    if (!res.ok) throw new Error('Failed to fetch player state');
    return await res.json();
  },

  async getCommunity(): Promise<CommunityState> {
    const res = await fetch(`${API_BASE_URL}/community`);
    if (!res.ok) throw new Error('Failed to fetch community state');
    return await res.json();
  },

  async getTrustDna(): Promise<{ player_id: string; trust_dna: TrustDna; strongest_skill: string; weakest_skill: string }> {
    const res = await fetch(`${API_BASE_URL}/player/trust-dna`);
    if (!res.ok) throw new Error('Failed to fetch Trust DNA');
    return await res.json();
  },

  async getProfile(): Promise<PlayerProfile> {
    const res = await fetch(`${API_BASE_URL}/player/profile`);
    if (!res.ok) throw new Error('Failed to fetch player profile');
    return await res.json();
  },

  async getHistory(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/player/history`);
    if (!res.ok) throw new Error('Failed to fetch decision history');
    return await res.json();
  },

  async getScenarios(): Promise<Scenario[]> {
    const res = await fetch(`${API_BASE_URL}/scenarios`);
    if (!res.ok) throw new Error('Failed to fetch scenarios');
    return await res.json();
  },

  async getScenario(id: string): Promise<Scenario> {
    const res = await fetch(`${API_BASE_URL}/scenarios/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch scenario ${id}`);
    return await res.json();
  },

  async investigate(scenarioId: string, actionType: InvestigationActionType): Promise<InvestigationResult> {
    const res = await fetch(`${API_BASE_URL}/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: scenarioId, action_type: actionType })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Investigation failed' }));
      throw new Error(err.detail || 'Investigation failed');
    }
    return await res.json();
  },

  async decide(scenarioId: string, decision: PlayerDecision): Promise<DecisionConsequence> {
    const res = await fetch(`${API_BASE_URL}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: scenarioId, decision })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Decision failed' }));
      throw new Error(err.detail || 'Decision failed');
    }
    return await res.json();
  },

  async getResults(): Promise<ResultsData> {
    const res = await fetch(`${API_BASE_URL}/results`);
    if (!res.ok) throw new Error('Failed to fetch results');
    return await res.json();
  },

  async getNextChallenge(): Promise<AdaptiveChallenge> {
    const res = await fetch(`${API_BASE_URL}/next-challenge`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to get adaptive challenge');
    return await res.json();
  },

  async createGuardian(name: string, avatar: GuardianAvatarStyle = 'AGENT'): Promise<GuardianProfile> {
    const res = await fetch(`${API_BASE_URL}/guardian/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, avatar })
    });
    if (!res.ok) throw new Error('Failed to create guardian');
    return await res.json();
  },

  async getGuardianProfile(): Promise<GuardianProfile> {
    const res = await fetch(`${API_BASE_URL}/guardian/profile`);
    if (!res.ok) throw new Error('Failed to fetch guardian profile');
    return await res.json();
  },

  async getGuardianAchievements(): Promise<GuardianAchievement[]> {
    const res = await fetch(`${API_BASE_URL}/guardian/achievements`);
    if (!res.ok) throw new Error('Failed to fetch guardian achievements');
    return await res.json();
  },

  async getGuardianMissions(): Promise<GuardianMission[]> {
    const res = await fetch(`${API_BASE_URL}/guardian/missions`);
    if (!res.ok) throw new Error('Failed to fetch guardian missions');
    return await res.json();
  },

  async reset(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset simulation');
  },

  async predictMl(text: string, sender: string = ''): Promise<MLPrediction> {
    const res = await fetch(`${API_BASE_URL}/ml/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sender })
    });
    if (!res.ok) throw new Error('Failed to run ML risk prediction');
    return await res.json();
  },

  async analyzeStatistics(text: string, sender: string = ''): Promise<{ features: Record<string, number>; statistical_signals: StatisticalSignal[]; summary: any }> {
    const res = await fetch(`${API_BASE_URL}/statistics/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sender })
    });
    if (!res.ok) throw new Error('Failed to run statistical analysis');
    return await res.json();
  },

  async verifyEvidence(text: string, sender: string = ''): Promise<{ text_checked: string; sender: string; evidence_sources: EvidenceSource[] }> {
    const res = await fetch(`${API_BASE_URL}/evidence/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sender })
    });
    if (!res.ok) throw new Error('Failed to verify evidence');
    return await res.json();
  },

  async realInvestigation(text: string, sender: string = '', url: string = ''): Promise<RealInvestigationResult> {
    const res = await fetch(`${API_BASE_URL}/real-investigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sender, url })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Real investigation failed' }));
      throw new Error(err.detail || 'Real investigation failed');
    }
    return await res.json();
  }
};

