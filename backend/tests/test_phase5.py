"""
TRUSTIQ — Phase 5 Tests: Decision Consequences + Trust DNA
===========================================================
Comprehensive test suite verifying:
1. Correct decision evaluation
2. Incorrect decision evaluation
3. Harmful content incorrectly allowed (exposure +, community trust -, harm caused +)
4. Harmful content correctly contained (harm prevented +, community trust +)
5. Genuine information incorrectly blocked (small trust penalty, over-blocking lesson)
6. Trust score updates (difficulty multipliers, clamped 0–1000)
7. Community trust update (clamped 0–100)
8. Exposure update (>= 0)
9. Harm prevented tracking
10. Harm caused tracking
11. Trust DNA updates (8 traits, each 0–100, deterministic)
12. AI override success (+5 AI skepticism, override badge)
13. AI skepticism update (penalty on blind reliance, boost on override)
14. Investigation efficiency (scoring based on credits spent vs accuracy)
15. Value clamping (trust score 0–1000, community trust 0–100, DNA 0–100)
16. Hidden ground truth protection (hidden before verdict, never leaked to AI)
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
from services import consequence_engine
from services.consequence_engine import DNA_TRAITS, calculate_consequences, clamp


@pytest.fixture
def client():
    c = TestClient(app_module.app)
    c.post("/api/reset")
    return c


@pytest.fixture
def mock_scam_scenario():
    return {
        "id": "scenario-test-scam",
        "title": "UPI Urgent Scam",
        "content": "Send refund urgently or face police action: upi://pay?pa=scam@ybl",
        "content_type": "text_upi_link",
        "difficulty": "EASY",
        "ground_truth": "SCAM",
        "correct_action": "CONTAIN",
        "base_audience": 280,
        "manipulation_signals": [
            "Emotional urgency ('police action')",
            "Reverse payment bait",
            "Unregistered VPA"
        ],
        "explanation": "UPI collect scam."
    }


@pytest.fixture
def mock_genuine_scenario():
    return {
        "id": "scenario-test-genuine",
        "title": "Municipal Water Notice",
        "content": "Water maintenance scheduled in Sector 4-9 tomorrow. Helpline: 1916.",
        "content_type": "text",
        "difficulty": "EASY",
        "ground_truth": "GENUINE",
        "correct_action": "ALLOW",
        "base_audience": 340,
        "manipulation_signals": [
            "No coercion",
            "Verified civic source"
        ],
        "explanation": "Authentic municipal alert."
    }


@pytest.fixture
def base_community():
    return {
        "population": 1000,
        "community_trust": 100,
        "exposure": 0,
        "harm_prevented": 0,
        "harm_caused": 0,
        "safe_decisions": 0,
        "unsafe_decisions": 0,
    }


@pytest.fixture
def base_dna():
    return {k: 50 for k in DNA_TRAITS}


# ─────────────────────────────────────────────────────────────────────────────
# 1. Correct Decision
# ─────────────────────────────────────────────────────────────────────────────
def test_1_correct_decision(mock_scam_scenario, base_community, base_dna):
    res = calculate_consequences(
        scenario=mock_scam_scenario,
        player_decision="CONTAIN",
        community_state=base_community,
        investigations_done=["quick_scan"],
        credits_spent=3,
        current_trust_dna=base_dna,
        current_trust_score=0,
    )
    assert res["is_correct"] is True
    assert res["verdict_label"] == "CORRECT DECISION"
    assert res["trust_points_delta"] > 0
    assert res["new_trust_score"] == 30


# ─────────────────────────────────────────────────────────────────────────────
# 2. Incorrect Decision
# ─────────────────────────────────────────────────────────────────────────────
def test_2_incorrect_decision(mock_scam_scenario, base_community, base_dna):
    res = calculate_consequences(
        scenario=mock_scam_scenario,
        player_decision="ALLOW",
        community_state=base_community,
        investigations_done=[],
        credits_spent=0,
        current_trust_dna=base_dna,
        current_trust_score=100,
    )
    assert res["is_correct"] is False
    assert res["verdict_label"] == "INCORRECT DECISION"
    assert res["trust_points_delta"] < 0
    assert res["new_trust_score"] == 85  # 100 - 15 (EASY penalty)


# ─────────────────────────────────────────────────────────────────────────────
# 3. Harmful Content Incorrectly Allowed
# ─────────────────────────────────────────────────────────────────────────────
def test_3_harmful_content_incorrectly_allowed(mock_scam_scenario, base_community, base_dna):
    res = calculate_consequences(
        scenario=mock_scam_scenario,
        player_decision="ALLOW",
        community_state=base_community,
        investigations_done=[],
        credits_spent=0,
        current_trust_dna=base_dna,
        current_trust_score=50,
    )
    assert res["exposure_delta"] == 280
    assert res["harm_caused_delta"] == 280
    assert res["community_trust_delta"] == -25
    assert "Your decision allowed the information to spread" in res["simulation_impact_summary"]
    assert "[GAME SIMULATION]" in res["simulation_impact_summary"]
    assert res["new_community_state"]["exposure"] == 280
    assert res["new_community_state"]["community_trust"] == 75


# ─────────────────────────────────────────────────────────────────────────────
# 4. Harmful Content Correctly Contained
# ─────────────────────────────────────────────────────────────────────────────
def test_4_harmful_content_correctly_contained(mock_scam_scenario, base_community, base_dna):
    res = calculate_consequences(
        scenario=mock_scam_scenario,
        player_decision="CONTAIN",
        community_state=base_community,
        investigations_done=["quick_scan"],
        credits_spent=3,
        current_trust_dna=base_dna,
        current_trust_score=0,
    )
    assert res["exposure_delta"] == 0
    assert res["harm_prevented_delta"] == 280
    assert res["harm_caused_delta"] == 0
    assert res["community_trust_delta"] > 0
    assert "Threat contained before widespread exposure" in res["simulation_impact_summary"]
    assert res["new_community_state"]["harm_prevented"] == 280
    assert res["new_community_state"]["safe_decisions"] == 1


# ─────────────────────────────────────────────────────────────────────────────
# 5. Genuine Information Incorrectly Blocked
# ─────────────────────────────────────────────────────────────────────────────
def test_5_genuine_information_incorrectly_blocked(mock_genuine_scenario, base_community, base_dna):
    res = calculate_consequences(
        scenario=mock_genuine_scenario,
        player_decision="CONTAIN",
        community_state=base_community,
        investigations_done=["quick_scan"],
        credits_spent=3,
        current_trust_dna=base_dna,
        current_trust_score=50,
    )
    assert res["is_correct"] is False
    assert res["exposure_delta"] == 0
    assert res["community_trust_delta"] < 0
    assert res["community_trust_delta"] == -8  # Measured civic penalty
    assert "Useful information was unnecessarily blocked" in res["simulation_impact_summary"]
    assert res["new_community_state"]["community_trust"] == 92


# ─────────────────────────────────────────────────────────────────────────────
# 6. Trust Score Multipliers (EASY, MEDIUM, HARD)
# ─────────────────────────────────────────────────────────────────────────────
def test_6_trust_score_multipliers(base_community, base_dna):
    # EASY
    easy_sc = {"id": "1", "correct_action": "ALLOW", "ground_truth": "GENUINE", "difficulty": "EASY", "base_audience": 100}
    r_easy = calculate_consequences(easy_sc, "ALLOW", base_community, [], 0, base_dna, 0)
    assert r_easy["trust_points_delta"] == 30

    # MEDIUM
    med_sc = {"id": "2", "correct_action": "HOLD", "ground_truth": "MISINFORMATION", "difficulty": "MEDIUM", "base_audience": 100}
    r_med = calculate_consequences(med_sc, "HOLD", base_community, [], 0, base_dna, 0)
    assert r_med["trust_points_delta"] == 40

    # HARD
    hard_sc = {"id": "3", "correct_action": "ESCALATE", "ground_truth": "SCAM", "difficulty": "HARD", "base_audience": 100}
    r_hard = calculate_consequences(hard_sc, "ESCALATE", base_community, [], 0, base_dna, 0)
    assert r_hard["trust_points_delta"] == 50


# ─────────────────────────────────────────────────────────────────────────────
# 7. Community Trust Bounds (0–100)
# ─────────────────────────────────────────────────────────────────────────────
def test_7_community_trust_bounds(mock_scam_scenario, base_dna):
    # Upper bound
    high_comm = {"population": 1000, "community_trust": 99, "exposure": 0, "harm_prevented": 0, "harm_caused": 0, "safe_decisions": 0, "unsafe_decisions": 0}
    r1 = calculate_consequences(mock_scam_scenario, "CONTAIN", high_comm, [], 0, base_dna, 0)
    assert r1["new_community_state"]["community_trust"] <= 100

    # Lower bound
    low_comm = {"population": 1000, "community_trust": 10, "exposure": 0, "harm_prevented": 0, "harm_caused": 0, "safe_decisions": 0, "unsafe_decisions": 0}
    r2 = calculate_consequences(mock_scam_scenario, "ALLOW", low_comm, [], 0, base_dna, 0)
    assert r2["new_community_state"]["community_trust"] >= 0


# ─────────────────────────────────────────────────────────────────────────────
# 8. Exposure Update (>= 0)
# ─────────────────────────────────────────────────────────────────────────────
def test_8_exposure_update(mock_scam_scenario, base_community, base_dna):
    r = calculate_consequences(mock_scam_scenario, "ALLOW", base_community, [], 0, base_dna, 0)
    assert r["new_community_state"]["exposure"] >= 0
    assert r["new_community_state"]["exposure"] == 280


# ─────────────────────────────────────────────────────────────────────────────
# 9. Harm Prevented
# ─────────────────────────────────────────────────────────────────────────────
def test_9_harm_prevented(mock_scam_scenario, base_community, base_dna):
    r = calculate_consequences(mock_scam_scenario, "CONTAIN", base_community, [], 0, base_dna, 0)
    assert r["harm_prevented_delta"] == 280
    assert r["new_community_state"]["harm_prevented"] == 280


# ─────────────────────────────────────────────────────────────────────────────
# 10. Harm Caused
# ─────────────────────────────────────────────────────────────────────────────
def test_10_harm_caused(mock_scam_scenario, base_community, base_dna):
    r = calculate_consequences(mock_scam_scenario, "ALLOW", base_community, [], 0, base_dna, 0)
    assert r["harm_caused_delta"] == 280
    assert r["new_community_state"]["harm_caused"] == 280


# ─────────────────────────────────────────────────────────────────────────────
# 11. Trust DNA Updates (8 traits)
# ─────────────────────────────────────────────────────────────────────────────
def test_11_trust_dna_updates(mock_scam_scenario, base_community, base_dna):
    r = calculate_consequences(
        scenario=mock_scam_scenario,
        player_decision="CONTAIN",
        community_state=base_community,
        investigations_done=["source_check", "quick_scan"],
        credits_spent=9,
        current_trust_dna=base_dna,
        current_trust_score=0,
    )
    deltas = r["trust_dna_deltas"]
    new_dna = r["new_trust_dna"]

    # All 8 traits must be present
    for trait in DNA_TRAITS:
        assert trait in deltas
        assert trait in new_dna
        assert 0 <= new_dna[trait] <= 100

    # Source verification checked + correct → positive delta
    assert deltas["source_verification"] > 0
    # Manipulation detection correct → positive delta
    assert deltas["manipulation_detection"] > 0


# ─────────────────────────────────────────────────────────────────────────────
# 12. AI Override Success
# ─────────────────────────────────────────────────────────────────────────────
def test_12_ai_override_success(mock_scam_scenario, base_community, base_dna):
    # AI recommends ALLOW (wrong), but player chooses CONTAIN (correct)
    r = calculate_consequences(
        scenario=mock_scam_scenario,
        player_decision="CONTAIN",
        community_state=base_community,
        investigations_done=["quick_scan"],
        credits_spent=3,
        current_trust_dna=base_dna,
        current_trust_score=0,
        ai_recommendation="ALLOW",  # AI is wrong!
    )
    assert r["ai_override_success"] is True
    assert "AI OVERRIDE SUCCESS" in r["ai_override_message"]
    assert r["trust_dna_deltas"]["ai_skepticism"] == 5
    assert r["new_trust_dna"]["ai_skepticism"] == 55


# ─────────────────────────────────────────────────────────────────────────────
# 13. AI Skepticism Penalty on Blind Reliance
# ─────────────────────────────────────────────────────────────────────────────
def test_13_ai_skepticism_blind_reliance(mock_scam_scenario, base_community, base_dna):
    # AI recommends ALLOW (wrong), and player blindly follows ALLOW (wrong)
    r = calculate_consequences(
        scenario=mock_scam_scenario,
        player_decision="ALLOW",
        community_state=base_community,
        investigations_done=[],
        credits_spent=0,
        current_trust_dna=base_dna,
        current_trust_score=50,
        ai_recommendation="ALLOW",  # AI was wrong and player followed
    )
    assert r["ai_override_success"] is False
    assert r["trust_dna_deltas"]["ai_skepticism"] == -2
    assert r["new_trust_dna"]["ai_skepticism"] == 48


# ─────────────────────────────────────────────────────────────────────────────
# 14. Investigation Efficiency
# ─────────────────────────────────────────────────────────────────────────────
def test_14_investigation_efficiency(mock_scam_scenario, base_community, base_dna):
    # Correct with low credits spent (<= 6) → +5 efficiency
    r_efficient = calculate_consequences(
        mock_scam_scenario, "CONTAIN", base_community, ["quick_scan"], 3, base_dna, 0
    )
    assert r_efficient["trust_dna_deltas"]["investigation_efficiency"] == 5

    # Incorrect with zero investigation → -4 penalty
    r_guess = calculate_consequences(
        mock_scam_scenario, "ALLOW", base_community, [], 0, base_dna, 0
    )
    assert r_guess["trust_dna_deltas"]["investigation_efficiency"] == -4


# ─────────────────────────────────────────────────────────────────────────────
# 15. Value Clamping
# ─────────────────────────────────────────────────────────────────────────────
def test_15_value_clamping():
    assert clamp(-50, 0, 100) == 0
    assert clamp(150, 0, 100) == 100
    assert clamp(55, 0, 100) == 55
    assert clamp(-10, 0, 1000) == 0
    assert clamp(1200, 0, 1000) == 1000


# ─────────────────────────────────────────────────────────────────────────────
# 16. Hidden Ground Truth Protection
# ─────────────────────────────────────────────────────────────────────────────
def test_16_ground_truth_protection(client):
    # Ensure fresh reset
    client.post("/api/reset")
    res = client.get("/api/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    for s in scenarios:
        if not s.get("is_decided"):
            assert s["ground_truth"] == "HIDDEN", f"Leak in scenario {s['id']}"
            assert s["correct_action"] == "HIDDEN", f"Leak in scenario {s['id']}"


# ─────────────────────────────────────────────────────────────────────────────
# API Endpoints Integration Tests
# ─────────────────────────────────────────────────────────────────────────────
def test_api_post_decision(client):
    scenarios = client.get("/api/scenarios").json()
    s = scenarios[0]

    res = client.post("/api/decision", json={
        "scenario_id": s["id"],
        "decision": "CONTAIN"
    })
    assert res.status_code == 200
    data = res.json()
    assert "verdict_label" in data
    assert "is_correct" in data
    assert "new_community_state" in data
    assert "new_trust_dna" in data
    assert "simulation_impact_summary" in data


def test_api_community_endpoint(client):
    res = client.get("/api/community")
    assert res.status_code == 200
    data = res.json()
    assert "population" in data
    assert "community_trust" in data
    assert "exposure" in data
    assert "harm_prevented" in data
    assert "harm_caused" in data


def test_api_trust_dna_endpoint(client):
    res = client.get("/api/player/trust-dna")
    assert res.status_code == 200
    data = res.json()
    assert "trust_dna" in data
    assert len(data["trust_dna"]) == 8
    assert "strongest_skill" in data
    assert "weakest_skill" in data


def test_api_player_profile_endpoint(client):
    res = client.get("/api/player/profile")
    assert res.status_code == 200
    data = res.json()
    assert "player" in data
    assert "community" in data
    assert "trust_dna" in data
    assert "accuracy_rate" in data


def test_api_player_history_endpoint(client):
    scenarios = client.get("/api/scenarios").json()
    client.post("/api/decision", json={
        "scenario_id": scenarios[0]["id"],
        "decision": "CONTAIN"
    })

    res = client.get("/api/player/history")
    assert res.status_code == 200
    history = res.json()
    assert len(history) >= 1
    assert history[0]["scenario_id"] == scenarios[0]["id"]
    assert "decision" in history[0]
