"""
TRUSTIQ — Phase 4 Tests
========================
Tests for the AI investigation agent, fallback engine, and API integration.
Designed to run alongside Phase 1–3 tests without breaking them.

Run with:
    cd backend && python -m pytest tests/test_phase4.py -v
"""

import sys
import os
import json
from pathlib import Path
from unittest.mock import patch, MagicMock

# Ensure backend is importable
backend_dir = str(Path(__file__).parent.parent.resolve())
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import pytest


# ─────────────────────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────────────────────

@pytest.fixture
def ai_agent_module():
    """Import ai_agent fresh for each test (avoids env contamination)."""
    import importlib
    import services.ai_agent as agent_mod
    importlib.reload(agent_mod)
    return agent_mod


@pytest.fixture
def sample_scenario_content():
    return {
        "content": "Bhaiya I sent ₹2,500 to your Google Pay by mistake. Click this refund link: https://refund-agent98.xyz/pay",
        "source": "Unknown (+91 98451 22104)",
        "url": "https://refund-agent98.xyz/pay",
        "ocr_text": "",
        "transcript": "",
        "manipulation_signals": [
            "Emotional urgency (emergency framing)",
            "Reverse payment bait",
            "Suspicious domain (.xyz)"
        ],
        "content_type": "text_upi_link",
        "scenario_title": "UPI Scam Test",
        "scenario_difficulty": "EASY",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Test 1: AI service initialisation
# ─────────────────────────────────────────────────────────────────────────────

def test_ai_agent_module_imports():
    """AI agent module must import without errors."""
    from services import ai_agent
    assert hasattr(ai_agent, "investigate")
    assert hasattr(ai_agent, "is_ai_available")
    assert hasattr(ai_agent, "VALID_STATUSES")
    assert hasattr(ai_agent, "VALID_ACTIONS")


def test_ai_agent_constants():
    """Required constants are defined correctly."""
    from services import ai_agent
    assert "LIKELY_SAFE" in ai_agent.VALID_STATUSES
    assert "UNVERIFIED" in ai_agent.VALID_STATUSES
    assert "SUSPICIOUS" in ai_agent.VALID_STATUSES
    assert "POTENTIAL_THREAT" in ai_agent.VALID_STATUSES
    assert "ALLOW" in ai_agent.VALID_ACTIONS
    assert "VERIFY" in ai_agent.VALID_ACTIONS
    assert "HOLD" in ai_agent.VALID_ACTIONS
    assert "CONTAIN" in ai_agent.VALID_ACTIONS
    assert "ESCALATE" in ai_agent.VALID_ACTIONS


# ─────────────────────────────────────────────────────────────────────────────
# Test 2: Missing API key → fallback
# ─────────────────────────────────────────────────────────────────────────────

def test_missing_api_key_triggers_fallback(sample_scenario_content):
    """When OPENROUTER_API_KEY is empty, the result must come from FALLBACK."""
    with patch.dict(os.environ, {"OPENROUTER_API_KEY": ""}, clear=False):
        from services import ai_agent
        import importlib
        importlib.reload(ai_agent)

        result = ai_agent.investigate(
            investigation_type="quick_scan",
            **sample_scenario_content
        )

    assert result["analysis_source"] == "FALLBACK"
    assert result["model_used"] == "deterministic-fallback"


def test_is_ai_available_false_without_key():
    """is_ai_available() must return False when no key is set."""
    with patch.dict(os.environ, {"OPENROUTER_API_KEY": ""}, clear=False):
        from services import ai_agent
        import importlib
        importlib.reload(ai_agent)
        assert ai_agent.is_ai_available() is False


# ─────────────────────────────────────────────────────────────────────────────
# Test 3: AI response validation — valid structure
# ─────────────────────────────────────────────────────────────────────────────

def test_validate_and_normalise_valid_response():
    """A correctly formed AI response is accepted and normalised."""
    from services.ai_agent import _validate_and_normalise
    raw = {
        "risk_score": 82,
        "confidence": 88,
        "status": "SUSPICIOUS",
        "claim": "Sender claims money was sent by mistake and requests a refund via link.",
        "signals": [
            {"type": "Urgency", "severity": "HIGH", "explanation": "Emergency framing detected."},
        ],
        "evidence": ["Suspicious domain (.xyz) in payment link."],
        "uncertainty": "External verification was not performed.",
        "recommended_action": "HOLD",
        "reasoning": "High urgency with suspicious payment link. Final decision belongs to the player.",
    }
    result = _validate_and_normalise(raw, "gpt-4o-mini")
    assert result.risk_score == 82
    assert result.confidence == 88
    assert result.status == "SUSPICIOUS"
    assert result.recommended_action == "HOLD"
    assert result.analysis_source == "AI"
    assert "Final decision belongs to the player." in result.reasoning


# ─────────────────────────────────────────────────────────────────────────────
# Test 4: Malformed AI response → fallback values
# ─────────────────────────────────────────────────────────────────────────────

def test_validate_and_normalise_clamping():
    """Out-of-range values are clamped, invalid status/action are corrected."""
    from services.ai_agent import _validate_and_normalise
    raw = {
        "risk_score": 150,       # should clamp to 100
        "confidence": -10,       # should clamp to 0
        "status": "DEFINITELY_A_CRIMINAL",  # invalid → UNVERIFIED
        "claim": "test",
        "signals": [],
        "evidence": [],
        "uncertainty": "",
        "recommended_action": "NUKE_THEM",  # invalid → VERIFY
        "reasoning": "",
    }
    result = _validate_and_normalise(raw, "test-model")
    assert result.risk_score == 100
    assert result.confidence == 0
    assert result.status == "UNVERIFIED"
    assert result.recommended_action == "VERIFY"
    assert "Final decision belongs to the player." in result.reasoning


def test_malformed_json_triggers_fallback(sample_scenario_content):
    """If AI returns non-JSON, fallback result is returned without crash."""
    with patch("httpx.Client") as mock_client_cls:
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_response.json.return_value = {
            "choices": [{"message": {"content": "NOT JSON AT ALL!!!"}}],
            "model": "test-model"
        }
        mock_client_cls.return_value.__enter__.return_value.post.return_value = mock_response

        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "test-key-abc"}, clear=False):
            from services import ai_agent
            import importlib
            importlib.reload(ai_agent)

            result = ai_agent.investigate(
                investigation_type="quick_scan",
                **sample_scenario_content
            )

    # Should not crash; should return fallback
    assert result is not None
    assert "risk_score" in result
    assert result["analysis_source"] in {"AI", "FALLBACK"}


# ─────────────────────────────────────────────────────────────────────────────
# Test 5: Investigate endpoint (API layer)
# ─────────────────────────────────────────────────────────────────────────────

def test_investigate_endpoint_via_client():
    """POST /api/investigate returns expected structure with AI result."""
    from fastapi.testclient import TestClient
    import main as app_module
    client = TestClient(app_module.app)

    # First get scenarios to find a valid ID
    res = client.get("/api/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    assert len(scenarios) > 0
    scenario_id = scenarios[0]["id"]

    # Run investigation
    res = client.post("/api/investigate", json={
        "scenario_id": scenario_id,
        "action_type": "quick_scan"
    })
    assert res.status_code == 200
    data = res.json()
    assert "investigation_result" in data
    assert "remaining_credits" in data
    assert "credits_deducted" in data
    assert data["credits_deducted"] == 3  # quick_scan costs 3


# ─────────────────────────────────────────────────────────────────────────────
# Test 6: Credits deduction
# ─────────────────────────────────────────────────────────────────────────────

def test_credits_deduction_quick_scan():
    """Quick scan deducts exactly 3 credits from player balance."""
    from fastapi.testclient import TestClient
    import main as app_module
    client = TestClient(app_module.app)

    # Reset first to ensure clean state
    client.post("/api/reset")

    credits_before = client.get("/api/player").json()["investigation_credits"]

    scenarios = client.get("/api/scenarios").json()
    scenario_id = scenarios[0]["id"]

    res = client.post("/api/investigate", json={
        "scenario_id": scenario_id,
        "action_type": "quick_scan"
    })
    assert res.status_code == 200

    credits_after = client.get("/api/player").json()["investigation_credits"]
    assert credits_after == credits_before - 3


def test_insufficient_credits_error():
    """Investigation with insufficient credits returns 400 error."""
    from fastapi.testclient import TestClient
    import main as app_module
    client = TestClient(app_module.app)

    # Set credits to 0 via DB directly
    from database import get_connection
    conn = get_connection()
    conn.execute("UPDATE player_state SET investigation_credits = 0 WHERE id = 'player-1'")
    conn.commit()
    conn.close()

    scenarios = client.get("/api/scenarios").json()
    res = client.post("/api/investigate", json={
        "scenario_id": scenarios[0]["id"],
        "action_type": "quick_scan"
    })
    assert res.status_code == 400
    assert "credits" in res.json()["detail"].lower()

    # Restore
    client.post("/api/reset")


# ─────────────────────────────────────────────────────────────────────────────
# Test 7: Ground truth protection — hidden from scenarios endpoint
# ─────────────────────────────────────────────────────────────────────────────

def test_ground_truth_hidden_before_decision():
    """Scenarios endpoint must return HIDDEN ground_truth for undecided scenarios."""
    from fastapi.testclient import TestClient
    import main as app_module
    client = TestClient(app_module.app)
    client.post("/api/reset")

    scenarios = client.get("/api/scenarios").json()
    undecided = [s for s in scenarios if not s["is_decided"]]
    assert len(undecided) > 0

    for s in undecided:
        assert s["ground_truth"] == "HIDDEN", (
            f"Scenario {s['id']} leaked ground_truth: {s['ground_truth']}"
        )
        assert s["correct_action"] == "HIDDEN", (
            f"Scenario {s['id']} leaked correct_action: {s['correct_action']}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Test 8: No correct_action passed to AI
# ─────────────────────────────────────────────────────────────────────────────

def test_correct_action_not_in_ai_prompt(sample_scenario_content, capsys):
    """The AI investigate() function signature must not accept correct_action."""
    import inspect
    from services import ai_agent
    sig = inspect.signature(ai_agent.investigate)
    params = list(sig.parameters.keys())
    assert "correct_action" not in params, (
        "SECURITY: correct_action must never be a parameter of ai_agent.investigate()"
    )
    assert "ground_truth" not in params, (
        "SECURITY: ground_truth must never be a parameter of ai_agent.investigate()"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Test 9: Valid status values in all fallback outputs
# ─────────────────────────────────────────────────────────────────────────────

def test_fallback_status_always_valid(sample_scenario_content):
    """Fallback engine must always return a valid status value."""
    from services import ai_agent
    # Force fallback by clearing key
    with patch.dict(os.environ, {"OPENROUTER_API_KEY": ""}, clear=False):
        import importlib
        importlib.reload(ai_agent)

        for inv_type in ["quick_scan", "source_check", "screenshot_analysis", "voice_analysis", "deep_investigation"]:
            result = ai_agent.investigate(
                investigation_type=inv_type,
                **sample_scenario_content
            )
            assert result["status"] in ai_agent.VALID_STATUSES, (
                f"Invalid status '{result['status']}' for {inv_type}"
            )


# ─────────────────────────────────────────────────────────────────────────────
# Test 10: Valid recommended_action values
# ─────────────────────────────────────────────────────────────────────────────

def test_fallback_recommended_action_always_valid(sample_scenario_content):
    """Fallback engine must always return a valid recommended_action."""
    from services import ai_agent
    with patch.dict(os.environ, {"OPENROUTER_API_KEY": ""}, clear=False):
        import importlib
        importlib.reload(ai_agent)

        for inv_type in ["quick_scan", "source_check", "deep_investigation"]:
            result = ai_agent.investigate(
                investigation_type=inv_type,
                **sample_scenario_content
            )
            assert result["recommended_action"] in ai_agent.VALID_ACTIONS, (
                f"Invalid recommended_action '{result['recommended_action']}' for {inv_type}"
            )


# ─────────────────────────────────────────────────────────────────────────────
# Test 11: Risk score range 0–100
# ─────────────────────────────────────────────────────────────────────────────

def test_fallback_risk_score_in_range(sample_scenario_content):
    """Risk score must always be between 0 and 100 inclusive."""
    from services import ai_agent
    with patch.dict(os.environ, {"OPENROUTER_API_KEY": ""}, clear=False):
        import importlib
        importlib.reload(ai_agent)

        result = ai_agent.investigate(
            investigation_type="deep_investigation",
            **sample_scenario_content
        )
        assert 0 <= result["risk_score"] <= 100, (
            f"risk_score {result['risk_score']} out of range"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Test 12: Confidence range 0–100
# ─────────────────────────────────────────────────────────────────────────────

def test_fallback_confidence_in_range(sample_scenario_content):
    """Confidence must always be between 0 and 100 inclusive."""
    from services import ai_agent
    with patch.dict(os.environ, {"OPENROUTER_API_KEY": ""}, clear=False):
        import importlib
        importlib.reload(ai_agent)

        result = ai_agent.investigate(
            investigation_type="source_check",
            **sample_scenario_content
        )
        assert 0 <= result["confidence"] <= 100, (
            f"confidence {result['confidence']} out of range"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Test: AI status endpoint
# ─────────────────────────────────────────────────────────────────────────────

def test_ai_status_endpoint():
    """GET /api/ai-status returns expected structure."""
    from fastapi.testclient import TestClient
    import main as app_module
    client = TestClient(app_module.app)

    res = client.get("/api/ai-status")
    assert res.status_code == 200
    data = res.json()
    assert "ai_available" in data
    assert "analysis_mode" in data
    assert data["analysis_mode"] in {"AI", "FALLBACK"}


# ─────────────────────────────────────────────────────────────────────────────
# Test: Network error → fallback (not crash)
# ─────────────────────────────────────────────────────────────────────────────

def test_network_error_triggers_fallback(sample_scenario_content):
    """A network error during AI call must trigger fallback, not crash."""
    import httpx
    with patch("httpx.Client") as mock_client_cls:
        mock_client_cls.return_value.__enter__.return_value.post.side_effect = (
            httpx.NetworkError("Connection refused")
        )

        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "test-key"}, clear=False):
            from services import ai_agent
            import importlib
            importlib.reload(ai_agent)

            result = ai_agent.investigate(
                investigation_type="quick_scan",
                **sample_scenario_content
            )

    assert result is not None
    assert "risk_score" in result
    # Should have used fallback due to network error
    assert result["analysis_source"] == "FALLBACK"


# ─────────────────────────────────────────────────────────────────────────────
# Test: Timeout → fallback (not crash)
# ─────────────────────────────────────────────────────────────────────────────

def test_timeout_triggers_fallback(sample_scenario_content):
    """A timeout during AI call must trigger fallback, not crash."""
    import httpx
    with patch("httpx.Client") as mock_client_cls:
        mock_client_cls.return_value.__enter__.return_value.post.side_effect = (
            httpx.TimeoutException("Timed out")
        )

        with patch.dict(os.environ, {"OPENROUTER_API_KEY": "test-key"}, clear=False):
            from services import ai_agent
            import importlib
            importlib.reload(ai_agent)

            result = ai_agent.investigate(
                investigation_type="deep_investigation",
                **sample_scenario_content
            )

    assert result is not None
    assert result["analysis_source"] == "FALLBACK"


# ─────────────────────────────────────────────────────────────────────────────
# Test: analysis_source field present in all responses
# ─────────────────────────────────────────────────────────────────────────────

def test_analysis_source_field_present(sample_scenario_content):
    """Every investigation result must include analysis_source."""
    with patch.dict(os.environ, {"OPENROUTER_API_KEY": ""}, clear=False):
        from services import ai_agent
        import importlib
        importlib.reload(ai_agent)

        result = ai_agent.investigate(
            investigation_type="quick_scan",
            **sample_scenario_content
        )
    assert "analysis_source" in result
    assert result["analysis_source"] in {"AI", "FALLBACK"}


# ─────────────────────────────────────────────────────────────────────────────
# Test: Phase 1–3 health endpoint still works
# ─────────────────────────────────────────────────────────────────────────────

def test_health_endpoint_still_works():
    """Phase 1 health endpoint must not be broken by Phase 4."""
    from fastapi.testclient import TestClient
    import main as app_module
    client = TestClient(app_module.app)

    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"


def test_reset_endpoint_still_works():
    """Phase 2 reset endpoint must not be broken by Phase 4."""
    from fastapi.testclient import TestClient
    import main as app_module
    client = TestClient(app_module.app)

    res = client.post("/api/reset")
    assert res.status_code == 200
    assert "reset_successful" in res.json().get("status", "")
