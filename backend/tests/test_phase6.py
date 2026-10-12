"""
TRUSTIQ — Phase 6 Tests: Adaptive Gameplay Engine & Digital Guardian
====================================================================
Comprehensive tests covering the 20 requirements:
1. Guardian creation
2. Guardian profile
3. XP progression
4. Rank progression
5. Achievement unlocking
6. Mission generation
7. Weakest skill detection
8. Strongest skill detection
9. Recent performance
10. Skill-to-scenario mapping
11. Adaptive scenario selection
12. Difficulty increase
13. Difficulty decrease
14. Repetition prevention
15. Training focus
16. Hidden ground truth protection
17. next-challenge API
18. Existing decision engine
19. Existing Trust DNA
20. Existing AI investigation
"""

import sys
import os
import json
from pathlib import Path
import pytest

# Ensure backend directory is in path
backend_dir = str(Path(__file__).parent.parent.resolve())
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
import main as app_module
from services import adaptive_engine
from services import guardian_service
from services.adaptive_engine import (
    classify_skill,
    analyze_recent_performance,
    identify_training_target,
    determine_adapted_difficulty,
    score_candidate_scenario,
    select_adaptive_scenario,
    SCENARIO_SKILL_MAP,
    DNA_TRAITS
)


@pytest.fixture
def client():
    c = TestClient(app_module.app)
    c.post("/api/reset")
    return c


@pytest.fixture
def mock_scenarios():
    return [
        {"id": "scenario-1", "title": "UPI Scam", "content_type": "text_upi_link", "difficulty": "EASY"},
        {"id": "scenario-2", "title": "Govt Scheme", "content_type": "link", "difficulty": "MEDIUM"},
        {"id": "scenario-3", "title": "Fake College Notice", "content_type": "text", "difficulty": "MEDIUM"},
        {"id": "scenario-4", "title": "Health Claim", "content_type": "text", "difficulty": "EASY"},
        {"id": "scenario-5", "title": "Voice Note", "content_type": "voice_message", "difficulty": "HARD"},
        {"id": "scenario-6", "title": "Manipulated Screenshot", "content_type": "screenshot_image", "difficulty": "HARD"},
        {"id": "scenario-7", "title": "Civic Notice", "content_type": "text", "difficulty": "EASY"},
        {"id": "scenario-8", "title": "AI Arbitrage", "content_type": "link", "difficulty": "MEDIUM"},
        {"id": "scenario-9", "title": "Cybercrime Summons", "content_type": "screenshot_image", "difficulty": "MEDIUM"},
        {"id": "scenario-10", "title": "Postal SMS", "content_type": "text", "difficulty": "EASY"},
    ]


# ─────────────────────────────────────────────────────────────────────────────
# 1. Guardian Creation
# ─────────────────────────────────────────────────────────────────────────────
def test_1_guardian_creation(client):
    res = client.post("/api/guardian/create", json={
        "name": "Cipher Sentinel",
        "avatar": "ANALYST"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Cipher Sentinel"
    assert data["avatar"] == "ANALYST"
    assert data["rank"] in ["ROOKIE GUARDIAN", "SIGNAL SCOUT", "THREAT ANALYST", "TRUST GUARDIAN", "TRUSTIQ COMMANDER"]


# ─────────────────────────────────────────────────────────────────────────────
# 2. Guardian Profile
# ─────────────────────────────────────────────────────────────────────────────
def test_2_guardian_profile(client):
    res = client.get("/api/guardian/profile")
    assert res.status_code == 200
    data = res.json()
    assert "name" in data
    assert "rank" in data
    assert "level" in data
    assert "xp" in data
    assert "xp_for_next_level" in data
    assert "trust_score" in data
    assert "community_protected" in data
    assert "missions_completed" in data


# ─────────────────────────────────────────────────────────────────────────────
# 3. XP Progression
# ─────────────────────────────────────────────────────────────────────────────
def test_3_xp_progression():
    # Easy correct
    xp_easy = guardian_service.calculate_xp_gain("EASY", is_correct=True)
    assert xp_easy["total_xp"] == 80

    # Medium correct
    xp_med = guardian_service.calculate_xp_gain("MEDIUM", is_correct=True)
    assert xp_med["total_xp"] == 120

    # Hard correct
    xp_hard = guardian_service.calculate_xp_gain("HARD", is_correct=True)
    assert xp_hard["total_xp"] == 180

    # AI Override bonus
    xp_override = guardian_service.calculate_xp_gain("MEDIUM", is_correct=True, ai_override_success=True)
    assert xp_override["override_bonus"] == 50
    assert xp_override["total_xp"] == 170

    # Efficiency bonus
    xp_eff = guardian_service.calculate_xp_gain("MEDIUM", is_correct=True, credits_spent=6)
    assert xp_eff["efficiency_bonus"] == 30
    assert xp_eff["total_xp"] == 150

    # Incorrect decision (learning bonus, avoids frustration)
    xp_wrong = guardian_service.calculate_xp_gain("HARD", is_correct=False)
    assert xp_wrong["total_xp"] == 10


# ─────────────────────────────────────────────────────────────────────────────
# 4. Rank Progression
# ─────────────────────────────────────────────────────────────────────────────
def test_4_rank_progression():
    lvl1, rank1, next1 = guardian_service.calculate_rank_and_level(100)
    assert lvl1 == 1
    assert rank1 == "ROOKIE GUARDIAN"
    assert next1 == 250

    lvl2, rank2, next2 = guardian_service.calculate_rank_and_level(300)
    assert lvl2 == 2
    assert rank2 == "SIGNAL SCOUT"
    assert next2 == 550

    lvl3, rank3, next3 = guardian_service.calculate_rank_and_level(650)
    assert lvl3 == 3
    assert rank3 == "THREAT ANALYST"
    assert next3 == 1000

    lvl4, rank4, next4 = guardian_service.calculate_rank_and_level(1200)
    assert lvl4 == 4
    assert rank4 == "TRUST GUARDIAN"
    assert next4 == 1600

    lvl5, rank5, _ = guardian_service.calculate_rank_and_level(2000)
    assert lvl5 == 5
    assert rank5 == "TRUSTIQ COMMANDER"


# ─────────────────────────────────────────────────────────────────────────────
# 5. Achievement Unlocking
# ─────────────────────────────────────────────────────────────────────────────
def test_5_achievement_unlocking(client):
    # Initially no achievements unlocked
    res = client.get("/api/guardian/achievements")
    assert res.status_code == 200
    achievements = res.json()
    assert len(achievements) >= 5
    first_defense = next((a for a in achievements if a["id"] == "first_line_of_defense"), None)
    assert first_defense is not None
    assert first_defense["unlocked"] is False

    # Contain scenario-1 (harmful scam)
    client.post("/api/decision", json={"scenario_id": "scenario-1", "decision": "CONTAIN"})

    # Now first line of defense should unlock!
    res_after = client.get("/api/guardian/achievements")
    data_after = res_after.json()
    first_defense_after = next((a for a in data_after if a["id"] == "first_line_of_defense"), None)
    assert first_defense_after["unlocked"] is True


# ─────────────────────────────────────────────────────────────────────────────
# 6. Mission Generation
# ─────────────────────────────────────────────────────────────────────────────
def test_6_mission_generation(client):
    res = client.get("/api/guardian/missions")
    assert res.status_code == 200
    missions = res.json()
    assert len(missions) >= 5
    assert missions[0]["id"] == "mission-01"
    assert missions[0]["status"] in ["ACTIVE", "COMPLETED", "LOCKED"]
    assert "target_skill" in missions[0]
    assert "xp_reward" in missions[0]


# ─────────────────────────────────────────────────────────────────────────────
# 7. Weakest Skill Detection
# ─────────────────────────────────────────────────────────────────────────────
def test_7_weakest_skill_detection():
    dna = {trait: 60 for trait in DNA_TRAITS}
    dna["authority_bias"] = 32  # Lowest
    target_skill, classification, _ = identify_training_target(dna, [])
    assert target_skill == "authority_bias"
    assert classification == "WEAK"


# ─────────────────────────────────────────────────────────────────────────────
# 8. Strongest Skill Detection
# ─────────────────────────────────────────────────────────────────────────────
def test_8_strongest_skill_detection(client):
    res = client.get("/api/player/trust-dna")
    assert res.status_code == 200
    data = res.json()
    assert "strongest_skill" in data
    assert "weakest_skill" in data
    assert "skill_classifications" in data


# ─────────────────────────────────────────────────────────────────────────────
# 9. Recent Performance Analysis
# ─────────────────────────────────────────────────────────────────────────────
def test_9_recent_performance():
    history = [
        {"scenario_id": "scenario-1", "is_correct": 1},
        {"scenario_id": "scenario-2", "is_correct": 0},
        {"scenario_id": "scenario-3", "is_correct": 0},
    ]
    perf = analyze_recent_performance(history)
    assert perf["total_recent"] == 3
    assert perf["consecutive_failure"] == 2
    assert perf["recent_failures_by_skill"]["authority_bias"] > 0


# ─────────────────────────────────────────────────────────────────────────────
# 10. Skill-to-Scenario Mapping
# ─────────────────────────────────────────────────────────────────────────────
def test_10_skill_to_scenario_mapping():
    assert "scenario-1" in SCENARIO_SKILL_MAP
    assert SCENARIO_SKILL_MAP["scenario-1"]["primary"] == "urgency_detection"
    assert SCENARIO_SKILL_MAP["scenario-2"]["primary"] == "authority_bias"
    assert SCENARIO_SKILL_MAP["scenario-4"]["primary"] == "manipulation_detection"


# ─────────────────────────────────────────────────────────────────────────────
# 11. Adaptive Scenario Selection
# ─────────────────────────────────────────────────────────────────────────────
def test_11_adaptive_scenario_selection(mock_scenarios):
    dna = {trait: 50 for trait in DNA_TRAITS}
    dna["authority_bias"] = 30  # Authority bias weakness
    selected = select_adaptive_scenario(mock_scenarios, dna, [])
    assert selected["skill_target"] == "authority_bias"
    assert selected["scenario_id"] in ["scenario-2", "scenario-3", "scenario-7"]


# ─────────────────────────────────────────────────────────────────────────────
# 12. Difficulty Increase on Mastery
# ─────────────────────────────────────────────────────────────────────────────
def test_12_difficulty_increase():
    history_success = [
        {"scenario_id": "scenario-1", "is_correct": 1},
        {"scenario_id": "scenario-2", "is_correct": 1},
    ]
    diff_expert = determine_adapted_difficulty("authority_bias", 85, history_success)
    assert diff_expert == "HARD"
    diff_step_up = determine_adapted_difficulty("authority_bias", 35, history_success)
    assert diff_step_up == "MEDIUM"


# ─────────────────────────────────────────────────────────────────────────────
# 13. Difficulty Decrease on Repeated Failure
# ─────────────────────────────────────────────────────────────────────────────
def test_13_difficulty_decrease():
    history_failure = [
        {"scenario_id": "scenario-1", "is_correct": 0},
        {"scenario_id": "scenario-2", "is_correct": 0},
    ]
    diff_weak = determine_adapted_difficulty("authority_bias", 30, history_failure)
    assert diff_weak == "EASY"
    diff_step_down = determine_adapted_difficulty("authority_bias", 55, history_failure)
    assert diff_step_down == "EASY"


# ─────────────────────────────────────────────────────────────────────────────
# 14. Repetition Prevention
# ─────────────────────────────────────────────────────────────────────────────
def test_14_repetition_prevention(mock_scenarios):
    history = [
        {"scenario_id": "scenario-2", "is_correct": 1},
        {"scenario_id": "scenario-3", "is_correct": 1},
    ]
    dna = {trait: 50 for trait in DNA_TRAITS}
    dna["authority_bias"] = 30
    res = select_adaptive_scenario(mock_scenarios, dna, history)
    # Scenario 2 and 3 were in last 2 rounds, so engine prefers an alternative
    assert res["scenario_id"] not in ["scenario-2", "scenario-3"]


# ─────────────────────────────────────────────────────────────────────────────
# 15. Training Focus & Constructive Phrasing
# ─────────────────────────────────────────────────────────────────────────────
def test_15_training_focus(mock_scenarios):
    dna = {trait: 60 for trait in DNA_TRAITS}
    dna["emotional_manipulation"] = 35
    res = select_adaptive_scenario(mock_scenarios, dna, [])
    assert res["training_focus"] == "Emotional Defense"
    assert "Training opportunity detected" in res["reason"]
    # Never insulting
    assert "bad" not in res["reason"].lower()
    assert "stupid" not in res["reason"].lower()


# ─────────────────────────────────────────────────────────────────────────────
# 16. Hidden Ground Truth Protection
# ─────────────────────────────────────────────────────────────────────────────
def test_16_hidden_ground_truth_protection(mock_scenarios):
    dna = {trait: 50 for trait in DNA_TRAITS}
    res = select_adaptive_scenario(mock_scenarios, dna, [])
    assert "ground_truth" not in res
    assert "correct_action" not in res
    assert "hidden_answer" not in res


# ─────────────────────────────────────────────────────────────────────────────
# 17. Next-Challenge API Endpoint
# ─────────────────────────────────────────────────────────────────────────────
def test_17_next_challenge_api(client):
    res = client.post("/api/next-challenge")
    assert res.status_code == 200
    data = res.json()
    assert "scenario_id" in data
    assert "difficulty" in data
    assert "training_focus" in data
    assert "reason" in data
    assert "skill_target" in data
    # Security check
    assert "ground_truth" not in data
    assert "correct_action" not in data


# ─────────────────────────────────────────────────────────────────────────────
# 18. Existing Decision Engine
# ─────────────────────────────────────────────────────────────────────────────
def test_18_existing_decision_engine(client):
    res = client.post("/api/decision", json={
        "scenario_id": "scenario-1",
        "decision": "CONTAIN"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["is_correct"] is True
    assert data["verdict_label"] == "CORRECT DECISION"
    assert "xp_earned" in data
    assert "guardian_rank" in data
    assert "guardian_reaction" in data


# ─────────────────────────────────────────────────────────────────────────────
# 19. Existing Trust DNA
# ─────────────────────────────────────────────────────────────────────────────
def test_19_existing_trust_dna(client):
    res = client.get("/api/player/trust-dna")
    assert res.status_code == 200
    data = res.json()
    assert len(data["trust_dna"]) == 8
    assert "source_verification" in data["trust_dna"]
    assert "ai_skepticism" in data["trust_dna"]


# ─────────────────────────────────────────────────────────────────────────────
# 20. Existing AI Investigation
# ─────────────────────────────────────────────────────────────────────────────
def test_20_existing_ai_investigation(client):
    res = client.post("/api/investigate", json={
        "scenario_id": "scenario-1",
        "action_type": "quick_scan"
    })
    assert res.status_code == 200
    data = res.json()
    assert "investigation_result" in data
    assert data["action_type"] == "quick_scan"
    assert data["remaining_credits"] == 27
