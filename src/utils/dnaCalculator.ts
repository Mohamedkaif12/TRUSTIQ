import { GameStats, InformationCard, TrustDnaProfile } from '../types/game';

export function calculateTrustDna(stats: GameStats, cards: InformationCard[]): TrustDnaProfile {
  const decidedCards = cards.filter(c => c.status === 'DECIDED');
  const total = decidedCards.length || 1;
  const accuracy = Math.round((stats.correctDecisions / total) * 100);
  
  // Count blocks vs trusts
  const blockCount = decidedCards.filter(c => c.userDecision === 'BLOCK').length;
  const trustCount = decidedCards.filter(c => c.userDecision === 'TRUST').length;
  
  let skepticismBias: 'BALANCED' | 'OVER_CAUTIOUS' | 'CREDULOUS' = 'BALANCED';
  if (blockCount >= 5 && stats.falsePositives >= 1) {
    skepticismBias = 'OVER_CAUTIOUS';
  } else if (trustCount >= 4 && (stats.totalDecisions - stats.correctDecisions) >= 2) {
    skepticismBias = 'CREDULOUS';
  }

  // Archetype resolution
  let archetype = 'Tactical Information Strategist';
  let tagline = 'Maintains a calculated defense perimeter with measured investigative spending.';
  
  if (accuracy >= 85 && stats.falsePositives === 0) {
    archetype = 'Apex Digital Sentinel';
    tagline = 'Zero compromises. Flawless forensic threat discrimination protecting 100% of citizens.';
  } else if (skepticismBias === 'OVER_CAUTIOUS') {
    archetype = 'Hyper-Cautious Censor';
    tagline = 'Zero malicious breaches, but disrupted community operations through false alarms.';
  } else if (skepticismBias === 'CREDULOUS') {
    archetype = 'Gullible Broadcast Node';
    tagline = 'Overly trusting of urgent messages, allowing malicious campaigns into the network.';
  } else if (stats.investigationsPerformed <= 1 && accuracy >= 65) {
    archetype = 'Instinctive Cyber Recon';
    tagline = 'Relies on raw intuition rather than AI scanning, defying the odds through street-smarts.';
  } else if (stats.communityTrust < 50 || stats.trustLives <= 0) {
    archetype = 'Compromised Network Operator';
    tagline = 'Community defenses collapsed under coordinated social engineering waves.';
  }

  const strengths: string[] = [];
  const vulnerabilities: string[] = [];

  if (stats.threatsNeutralized >= 3) {
    strengths.push('High-velocity malicious payload interception');
  }
  if (stats.falsePositives === 0) {
    strengths.push('Zero legitimate public communications censored');
  }
  if (stats.investigationsPerformed >= 3) {
    strengths.push('Disciplined AI investigation protocol adherence');
  }
  if (strengths.length === 0) {
    strengths.push('Quick reaction speed during information triage');
  }

  if (stats.falsePositives > 0) {
    vulnerabilities.push('Tendency to panic and censor verified municipal/academic alerts');
  }
  if (stats.peopleDamagedTotal > 0) {
    vulnerabilities.push('Vulnerability to urgency-based financial phishing lures');
  }
  if (stats.investigationCredits >= 20 && accuracy < 70) {
    vulnerabilities.push('Underutilizing available forensic investigation credits');
  }
  if (vulnerabilities.length === 0) {
    vulnerabilities.push('Slight latency during high-volume ambiguous broadcasts');
  }

  const survivalRate = Math.max(0, Math.min(100, Math.round((stats.communityMembers / 1000) * 100)));
  const threatAwarenessScore = Math.min(100, Math.max(10, Math.round((accuracy * 0.6) + (stats.communityTrust * 0.4))));

  return {
    archetype,
    tagline,
    accuracyRate: accuracy,
    skepticismBias,
    investigationEfficiency: `${stats.investigationsPerformed} Scans / ${30 - stats.investigationCredits} Cr Used`,
    survivalRate,
    strengths,
    vulnerabilities,
    threatAwarenessScore
  };
}
