import React, { useState, useEffect } from 'react';
import { 
  Scenario, 
  PlayerState, 
  CommunityState, 
  PlayerDecision, 
  InvestigationActionType,
  DecisionConsequence,
  ResultsData,
  AdaptiveChallenge
} from './types';
import { api } from './services/api';
import { Navbar, PageId } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { ResultsPage } from './pages/ResultsPage';
import { TrustDnaPage } from './pages/TrustDnaPage';
import { RealInvestigationPage } from './pages/RealInvestigationPage';
import { LevelMapPage } from './pages/LevelMapPage';
import { GamePage } from './pages/GamePage';
import { GameArena } from './game/GameArena';
import { sound } from './utils/audio';

const LEVEL_SCENARIO_MAPPING: Record<number, string[]> = {
  1: ['scenario-1', 'scenario-2'],
  2: ['scenario-3', 'scenario-4'],
  3: ['scenario-5', 'scenario-6'],
  4: ['scenario-7', 'scenario-8'],
  5: ['scenario-9', 'scenario-10'],
  6: ['scenario-11', 'scenario-12'],
};

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [player, setPlayer] = useState<PlayerState>({
    id: 'player-1',
    name: 'Agent Commander',
    avatar: 'AGENT',
    level: 1,
    rank: 'ROOKIE GUARDIAN',
    xp: 0,
    xp_for_next_level: 100,
    missions_completed: 0,
    trust_score: 0,
    investigation_credits: 30,
    community_population: 1000,
    community_trust: 100,
    community_exposure: 0
  });
  const [community, setCommunity] = useState<CommunityState>({
    population: 1000,
    community_trust: 100,
    exposure: 0,
    harm_prevented: 0,
    harm_caused: 0,
    safe_decisions: 0,
    unsafe_decisions: 0
  });
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [latestConsequence, setLatestConsequence] = useState<DecisionConsequence | null>(null);
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);
  const [adaptiveBriefing, setAdaptiveBriefing] = useState<AdaptiveChallenge | null>(null);

  const loadData = async () => {
    try {
      const [fetchedPlayer, fetchedCommunity, fetchedScenarios] = await Promise.all([
        api.getPlayer(),
        api.getCommunity().catch(() => ({
          population: 1000, community_trust: 100, exposure: 0,
          harm_prevented: 0, harm_caused: 0, safe_decisions: 0, unsafe_decisions: 0
        })),
        api.getScenarios()
      ]);
      setPlayer(fetchedPlayer);
      setCommunity(fetchedCommunity);
      setScenarios(fetchedScenarios);
      if (!selectedScenarioId && fetchedScenarios.length > 0) {
        setSelectedScenarioId(fetchedScenarios[0].id);
      }
    } catch (err) { console.error('Failed to load data:', err); }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (currentPage === 'results' || currentPage === 'dna') {
      api.getResults().then(setResultsData).catch(console.error);
    }
  }, [currentPage]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  const handleInvestigateAction = async (scenarioId: string, actionType: InvestigationActionType) => {
    try {
      const res = await api.investigate(scenarioId, actionType);
      setPlayer(prev => ({ ...prev, investigation_credits: res.remaining_credits }));
      setScenarios(prev => prev.map(s => {
        if (s.id === scenarioId) {
          return {
            ...s,
            investigations_done: Array.from(new Set([...s.investigations_done, actionType])),
            unlocked_investigations: { ...s.unlocked_investigations, [actionType]: res.investigation_result }
          };
        }
        return s;
      }));
    } catch (err) { console.error('Investigation failed:', err); throw err; }
  };

  const handleMakeDecision = async (scenarioId: string, decision: PlayerDecision) => {
    setIsSubmittingDecision(true);
    try {
      const res = await api.decide(scenarioId, decision);
      if (res.is_correct) sound.playSuccess(); else sound.playDanger();
      setLatestConsequence(res);
      setPlayer(res.updated_player);
      if (res.new_community_state) setCommunity(res.new_community_state);
      const updatedScenarios = await api.getScenarios();
      setScenarios(updatedScenarios);
      try {
        const nextChallenge = await api.getNextChallenge();
        setAdaptiveBriefing(nextChallenge);
      } catch (e) { console.warn('Adaptive pre-fetch failed:', e); }
    } catch (err) {
      console.error('Decision failed:', err);
      sound.playWarning();
    } finally { setIsSubmittingDecision(false); }
  };

  const handleNextChallenge = async () => {
    const existingBriefing = adaptiveBriefing;
    setLatestConsequence(null);
    try {
      const challenge = existingBriefing || await api.getNextChallenge();
      setAdaptiveBriefing(challenge);
      const updatedScenarios = await api.getScenarios();
      setScenarios(updatedScenarios);
      const targetScenario = updatedScenarios.find(s => s.id === challenge.scenario_id);
      if (targetScenario && !targetScenario.is_decided) {
        setSelectedScenarioId(challenge.scenario_id);
        setCurrentPage('game');
      } else {
        const fallback = updatedScenarios.find(s => !s.is_decided);
        if (fallback) { setSelectedScenarioId(fallback.id); setCurrentPage('game'); }
        else setCurrentPage('levelmap');
      }
    } catch (err) {
      const nextUndecided = scenarios.find(s => !s.is_decided && s.id !== selectedScenarioId);
      if (nextUndecided) { setSelectedScenarioId(nextUndecided.id); setCurrentPage('game'); }
      else setCurrentPage('levelmap');
    }
  };

  const handleGameNextMission = () => {
    setLatestConsequence(null);
    const targetScenarios = scenarios.filter(s => (LEVEL_SCENARIO_MAPPING[currentLevelId] || []).includes(s.id));
    const nextUndecided = targetScenarios.find(s => !s.is_decided && s.id !== selectedScenarioId);
    if (nextUndecided) {
      setSelectedScenarioId(nextUndecided.id);
    } else {
      // Zone complete! Return to level map so guardian can proceed
      setCurrentPage('levelmap');
    }
  };

  const handleStartLevel = (levelId: number, scenarioId?: string) => {
    setCurrentLevelId(levelId);
    const targetScenarios = scenarios.filter(s => (LEVEL_SCENARIO_MAPPING[levelId] || []).includes(s.id));
    if (scenarioId && targetScenarios.some(s => s.id === scenarioId)) {
      setSelectedScenarioId(scenarioId);
    } else {
      const firstUndecided = targetScenarios.find(s => !s.is_decided);
      setSelectedScenarioId(firstUndecided?.id || targetScenarios[0]?.id || scenarios[0]?.id || null);
    }
    setCurrentPage('play');
  };

  const handleResetGame = async () => {
    try {
      await api.reset();
      await loadData();
      setLatestConsequence(null);
      setAdaptiveBriefing(null);
      setCurrentPage('levelmap');
      sound.playSuccess();
    } catch (err) { console.error('Reset failed:', err); }
  };

  const currentScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0] || null;
  const activeLevelScenarioIds = LEVEL_SCENARIO_MAPPING[currentLevelId] || [];
  const activeLevelScenarios = scenarios.filter(s => activeLevelScenarioIds.includes(s.id));
  const gameScenarios = activeLevelScenarios.length > 0 ? activeLevelScenarios : scenarios;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      <Navbar
        currentPage={currentPage}
        onNavigate={(p) => setCurrentPage(p)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onResetGame={handleResetGame}
        selectedScenarioId={selectedScenarioId}
        player={player}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onStartGame={() => setCurrentPage('play')}
            onExploreDna={() => setCurrentPage('dna')}
          />
        )}

        {currentPage === 'play' && (
          <GameArena
            player={player}
            community={community}
            initialLevelId={currentLevelId}
            onUpdatePlayer={setPlayer}
            onUpdateCommunity={setCommunity}
            onBackToMap={() => setCurrentPage('levelmap')}
            onNavigateToMissions={() => setCurrentPage('levelmap')}
          />
        )}

        {currentPage === 'levelmap' && (
          <LevelMapPage
            player={player}
            community={community}
            onStartLevel={handleStartLevel}
            onViewResults={() => setCurrentPage('results')}
            onBackToDashboard={() => setCurrentPage('dashboard')}
            onResetCampaign={handleResetGame}
          />
        )}

        {currentPage === 'game' && (
          <GamePage
            levelId={currentLevelId}
            scenarios={gameScenarios}
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={(id) => setSelectedScenarioId(id)}
            player={player}
            community={community}
            adaptiveBriefing={adaptiveBriefing}
            onInvestigateAction={handleInvestigateAction}
            onMakeDecision={handleMakeDecision}
            onNextMission={handleGameNextMission}
            onExitToMap={() => setCurrentPage('levelmap')}
            isSubmitting={isSubmittingDecision}
            latestConsequence={latestConsequence}
            onCloseConsequence={() => setLatestConsequence(null)}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            scenarios={scenarios}
            player={player}
            community={community}
            onOpenInvestigation={(id) => { setSelectedScenarioId(id); setCurrentPage('investigation'); }}
            latestConsequence={latestConsequence}
            onCloseConsequence={() => setLatestConsequence(null)}
            onRefreshData={loadData}
            onStartAdaptiveChallenge={handleNextChallenge}
            onGuardianUpdated={(profile) => {
              setPlayer(prev => ({ ...prev, name: profile.name, avatar: profile.avatar }));
            }}
          />
        )}

        {currentPage === 'investigation' && (
          <InvestigationPage
            scenario={currentScenario}
            scenarios={scenarios}
            player={player}
            adaptiveBriefing={adaptiveBriefing}
            onSelectScenario={(id) => {
              setSelectedScenarioId(id);
              if (adaptiveBriefing && adaptiveBriefing.scenario_id !== id) setAdaptiveBriefing(null);
            }}
            onInvestigateAction={handleInvestigateAction}
            onMakeDecision={handleMakeDecision}
            onBackToDashboard={() => setCurrentPage('dashboard')}
            isSubmittingDecision={isSubmittingDecision}
          />
        )}

        {currentPage === 'results' && (
          <ResultsPage
            results={resultsData}
            player={player}
            onNavigateToDna={() => setCurrentPage('dna')}
            onReturnToDashboard={() => setCurrentPage('levelmap')}
          />
        )}

        {currentPage === 'dna' && (
          <TrustDnaPage
            player={player}
            results={resultsData}
            onResetGame={handleResetGame}
            onBackToDashboard={() => setCurrentPage('levelmap')}
          />
        )}

        {currentPage === 'real-investigation' && (
          <RealInvestigationPage />
        )}
      </main>


    </div>
  );
}

export default App;
