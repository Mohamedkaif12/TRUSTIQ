import sys
from pathlib import Path
import json

# Ensure backend directory is in sys.path
backend_dir = str(Path(__file__).parent.resolve())
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load .env before importing ai_agent (ai_agent also loads, this is a safety belt)
from dotenv import load_dotenv
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from database import init_db, get_connection
from seed_data import seed_database
from services import ai_agent
from services import consequence_engine
from services import adaptive_engine
from services import guardian_service
from services import evidence_service
from ml.predictor import predict_message_risk
from ml.feature_extractor import extract_features
from statistics.zscore import analyze_features_z_score, get_statistical_summary

# Initialize DB on startup
init_db()
seed_database()

app = FastAPI(
    title="TRUSTIQ — TRUST WAR // Phase 6 Digital Guardian & Adaptive Engine",
    description="Deterministic decision-training game engine with Digital Guardian progression",
    version="6.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INVESTIGATION_COSTS = {
    "quick_scan": 3,
    "source_check": 6,
    "screenshot_analysis": 8,
    "voice_analysis": 10,
    "deep_investigation": 15
}

class InvestigateRequest(BaseModel):
    scenario_id: str
    action_type: str  # quick_scan | source_check | screenshot_analysis | voice_analysis | deep_investigation

class DecideRequest(BaseModel):
    scenario_id: str
    decision: str  # ALLOW | VERIFY | HOLD | CONTAIN | ESCALATE

class GuardianCreateRequest(BaseModel):
    name: str
    avatar: Optional[str] = "AGENT"

class MLPredictRequest(BaseModel):
    text: str
    sender: Optional[str] = ""

class StatisticsAnalyzeRequest(BaseModel):
    text: str
    sender: Optional[str] = ""
    features: Optional[Dict[str, float]] = None

class RealInvestigationRequest(BaseModel):
    text: str
    sender: Optional[str] = ""
    url: Optional[str] = ""

class EvidenceVerifyRequest(BaseModel):
    text: str
    sender: Optional[str] = ""

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TRUSTIQ — TRUST WAR Core Game Engine",
        "phase": 2,
        "tagline": "Pause. Investigate. Decide."
    }

@app.get("/api/player")
def get_player():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM player_state WHERE id = 'player-1'")
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Player state not found")

    player = dict(row)
    xp = player.get("xp", 0)
    level, rank_title, next_xp = guardian_service.calculate_rank_and_level(xp)
    player["level"] = level
    player["rank"] = rank_title
    player["xp_for_next_level"] = next_xp
    if "avatar" not in player or not player["avatar"]:
        player["avatar"] = "AGENT"
    return player

# Backwards compatibility for Phase 1 session endpoint
@app.get("/api/session")
def get_session():
    player = get_player()
    # Map to common fields for frontend
    player["investigation_credits"] = player["investigation_credits"]
    player["total_community_members"] = player["community_population"]
    return player

@app.get("/api/scenarios")
def list_scenarios():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scenarios")
    rows = cursor.fetchall()

    # Fetch recorded decisions
    cursor.execute("SELECT scenario_id, decision, is_correct, explanation FROM player_decisions WHERE player_id = 'player-1'")
    decisions = {d["scenario_id"]: dict(d) for d in cursor.fetchall()}

    # Fetch investigation history
    cursor.execute("SELECT scenario_id, action_type FROM scenario_investigations WHERE player_id = 'player-1'")
    investigations_map: Dict[str, List[str]] = {}
    for inv in cursor.fetchall():
        sid = inv["scenario_id"]
        investigations_map.setdefault(sid, []).append(inv["action_type"])

    conn.close()

    results = []
    for r in rows:
        item = dict(r)
        item["manipulation_signals"] = json.loads(item["manipulation_signals"])
        inv_data = json.loads(item["investigation_data"])
        
        sid = item["id"]
        is_decided = sid in decisions
        item["is_decided"] = is_decided
        item["user_decision"] = decisions[sid]["decision"] if is_decided else None
        item["is_correct"] = decisions[sid]["is_correct"] if is_decided else None
        item["investigations_done"] = investigations_map.get(sid, [])

        # Filter unlocked investigation data
        unlocked_data = {}
        for action in item["investigations_done"]:
            if action in inv_data:
                unlocked_data[action] = inv_data[action]
        item["unlocked_investigations"] = unlocked_data

        # CRITICAL RULE: Ground truth remains hidden until player decides!
        if not is_decided:
            item["ground_truth"] = "HIDDEN"
            item["correct_action"] = "HIDDEN"
            item["explanation"] = "Complete investigation and issue verdict to reveal debrief."

        results.append(item)

    return results

@app.get("/api/scenarios/{scenario_id}")
def get_scenario(scenario_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scenarios WHERE id = ?", (scenario_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Scenario not found")

    cursor.execute("SELECT * FROM player_decisions WHERE scenario_id = ? AND player_id = 'player-1'", (scenario_id,))
    dec_row = cursor.fetchone()

    cursor.execute("SELECT action_type FROM scenario_investigations WHERE scenario_id = ? AND player_id = 'player-1'", (scenario_id,))
    inv_actions = [i["action_type"] for i in cursor.fetchall()]
    conn.close()

    item = dict(row)
    item["manipulation_signals"] = json.loads(item["manipulation_signals"])
    inv_data = json.loads(item["investigation_data"])

    is_decided = bool(dec_row)
    item["is_decided"] = is_decided
    item["user_decision"] = dec_row["decision"] if dec_row else None
    item["is_correct"] = dec_row["is_correct"] if dec_row else None
    item["investigations_done"] = inv_actions

    unlocked = {}
    for a in inv_actions:
        if a in inv_data:
            unlocked[a] = inv_data[a]
    item["unlocked_investigations"] = unlocked

    # Hide ground truth until decided
    if not is_decided:
        item["ground_truth"] = "HIDDEN"
        item["correct_action"] = "HIDDEN"
        item["explanation"] = "Complete investigation and issue verdict to reveal debrief."

    return item

@app.post("/api/investigate")
def investigate(req: InvestigateRequest):
    action = req.action_type.lower()
    if action not in INVESTIGATION_COSTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid investigation action '{action}'. Valid actions: {list(INVESTIGATION_COSTS.keys())}"
        )

    cost = INVESTIGATION_COSTS[action]

    conn = get_connection()
    cursor = conn.cursor()

    # Check player credits
    cursor.execute("SELECT * FROM player_state WHERE id = 'player-1'")
    player = dict(cursor.fetchone())

    if player["investigation_credits"] < cost:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient investigation credits! Action '{action}' requires {cost} credits, but you have {player['investigation_credits']} credits."
        )

    # Fetch scenario — CRITICAL: never expose ground_truth/correct_action to AI
    cursor.execute("SELECT * FROM scenarios WHERE id = ?", (req.scenario_id,))
    scenario_row = cursor.fetchone()
    if not scenario_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Scenario not found")

    scenario = dict(scenario_row)
    manipulation_signals: list = json.loads(scenario.get("manipulation_signals", "[]"))

    # ── Phase 4: Call AI investigation agent ──────────────────────────────
    # Only player-visible fields are passed — ground_truth and correct_action
    # are explicitly EXCLUDED from the AI call.
    url_field = ""
    if "https://" in scenario["content"] or "http://" in scenario["content"]:
        # Extract first URL from content for AI context
        import re as _re
        m = _re.search(r'https?://[^\s]+', scenario["content"])
        url_field = m.group(0) if m else ""

    ai_result: Dict[str, Any] = ai_agent.investigate(
        investigation_type=action,
        content=scenario["content"],
        source=scenario["sender"],
        url=url_field,
        ocr_text="",      # OCR not yet integrated — AI will note this
        transcript="",    # Audio not yet integrated — AI will note this
        manipulation_signals=manipulation_signals,
        content_type=scenario.get("content_type", "text"),
        scenario_title=scenario["title"],
        scenario_difficulty=scenario["difficulty"],
        # ground_truth and correct_action are intentionally NOT passed
    )

    # ── Deduct credits ────────────────────────────────────────────────────
    new_credits = player["investigation_credits"] - cost
    cursor.execute(
        "UPDATE player_state SET investigation_credits = ? WHERE id = 'player-1'",
        (new_credits,)
    )

    # Record investigation with AI recommendation
    cursor.execute("""
    INSERT INTO scenario_investigations (player_id, scenario_id, action_type, credits_cost, ai_recommendation)
    VALUES ('player-1', ?, ?, ?, ?)
    """, (req.scenario_id, action, cost, ai_result.get("recommended_action")))

    conn.commit()
    conn.close()

    return {
        "scenario_id": req.scenario_id,
        "action_type": action,
        "credits_deducted": cost,
        "remaining_credits": new_credits,
        "investigation_result": ai_result,
    }


@app.get("/api/ai-status")
def ai_status():
    """Returns AI provider availability without exposing keys."""
    return {
        "ai_available": ai_agent.is_ai_available(),
        "analysis_mode": "AI" if ai_agent.is_ai_available() else "FALLBACK",
        "model": ai_agent.AI_MODEL if ai_agent.is_ai_available() else "deterministic-fallback",
        "note": "API key is configured" if ai_agent.is_ai_available() else "No API key — using deterministic fallback engine",
    }

def _handle_decision(req: DecideRequest):
    decision = req.decision.upper().strip()
    valid_decisions = ["ALLOW", "VERIFY", "HOLD", "CONTAIN", "ESCALATE"]
    if decision not in valid_decisions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid decision '{decision}'. Must be one of: {valid_decisions}"
        )

    conn = get_connection()
    cursor = conn.cursor()

    # Rule: The player must be able to make only one final decision per scenario!
    cursor.execute("SELECT * FROM player_decisions WHERE scenario_id = ? AND player_id = 'player-1'", (req.scenario_id,))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="A final decision has already been executed for this scenario. Decisions cannot be altered."
        )

    # Fetch scenario
    cursor.execute("SELECT * FROM scenarios WHERE id = ?", (req.scenario_id,))
    scenario_row = cursor.fetchone()
    if not scenario_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Scenario not found")

    scenario = dict(scenario_row)
    scenario["manipulation_signals"] = json.loads(scenario.get("manipulation_signals", "[]"))

    # Fetch investigation history for this scenario
    cursor.execute("""
    SELECT action_type, credits_cost, ai_recommendation
    FROM scenario_investigations
    WHERE scenario_id = ? AND player_id = 'player-1'
    ORDER BY id ASC
    """, (req.scenario_id,))
    inv_rows = [dict(r) for r in cursor.fetchall()]

    investigations_done = [r["action_type"] for r in inv_rows]
    credits_spent = sum(r["credits_cost"] for r in inv_rows)

    # Retrieve latest AI recommendation if player ran any investigation
    ai_recs = [r["ai_recommendation"] for r in inv_rows if r["ai_recommendation"]]
    latest_ai_rec = ai_recs[-1] if ai_recs else None

    # Fetch current community state
    cursor.execute("SELECT * FROM community_state WHERE id = 'community-1'")
    comm_row = cursor.fetchone()
    if comm_row:
        community_state = dict(comm_row)
    else:
        community_state = {
            "population": 1000,
            "community_trust": 100,
            "exposure": 0,
            "harm_prevented": 0,
            "harm_caused": 0,
            "safe_decisions": 0,
            "unsafe_decisions": 0,
        }

    # Fetch current trust DNA
    cursor.execute("SELECT * FROM trust_dna WHERE player_id = 'player-1'")
    dna_row = cursor.fetchone()
    if dna_row:
        current_dna = {k: dna_row[k] for k in consequence_engine.DNA_TRAITS if k in dna_row.keys()}
    else:
        current_dna = {k: 50 for k in consequence_engine.DNA_TRAITS}

    # Fetch player state
    cursor.execute("SELECT * FROM player_state WHERE id = 'player-1'")
    player = dict(cursor.fetchone())

    # ── Evaluate Consequences via Consequence Engine ────────────────────────
    evaluation = consequence_engine.calculate_consequences(
        scenario=scenario,
        player_decision=decision,
        community_state=community_state,
        investigations_done=investigations_done,
        credits_spent=credits_spent,
        current_trust_dna=current_dna,
        current_trust_score=player["trust_score"],
        ai_recommendation=latest_ai_rec,
    )

    new_comm = evaluation["new_community_state"]
    new_dna = evaluation["new_trust_dna"]
    new_trust_score = evaluation["new_trust_score"]

    # Phase 6: Guardian XP, Rank, and Reaction
    xp_gain = guardian_service.calculate_xp_gain(
        difficulty=scenario.get("difficulty", "MEDIUM"),
        is_correct=evaluation["is_correct"],
        ai_override_success=evaluation["ai_override_success"],
        credits_spent=credits_spent
    )
    current_xp = player.get("xp", 0)
    new_xp = current_xp + xp_gain["total_xp"]
    guardian_level, guardian_rank, next_level_xp = guardian_service.calculate_rank_and_level(new_xp)
    guardian_reaction = guardian_service.get_guardian_reaction(
        is_correct=evaluation["is_correct"],
        ground_truth=scenario["ground_truth"],
        ai_override_success=evaluation["ai_override_success"]
    )
    new_missions = player.get("missions_completed", 0) + (1 if evaluation["is_correct"] else 0)

    # Update player state
    cursor.execute("""
    UPDATE player_state SET
        trust_score = ?,
        community_trust = ?,
        community_exposure = ?,
        level = ?,
        xp = ?,
        rank = ?,
        missions_completed = ?
    WHERE id = 'player-1'
    """, (
        new_trust_score,
        new_comm["community_trust"],
        new_comm["exposure"],
        guardian_level,
        new_xp,
        guardian_rank,
        new_missions
    ))

    # Update community state
    cursor.execute("""
    UPDATE community_state SET
        population = ?,
        community_trust = ?,
        exposure = ?,
        harm_prevented = ?,
        harm_caused = ?,
        safe_decisions = ?,
        unsafe_decisions = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 'community-1'
    """, (
        new_comm["population"],
        new_comm["community_trust"],
        new_comm["exposure"],
        new_comm["harm_prevented"],
        new_comm["harm_caused"],
        new_comm["safe_decisions"],
        new_comm["unsafe_decisions"],
    ))

    # Update Trust DNA
    cursor.execute("""
    UPDATE trust_dna SET
        source_verification = ?,
        manipulation_detection = ?,
        emotional_manipulation = ?,
        authority_bias = ?,
        urgency_detection = ?,
        visual_verification = ?,
        ai_skepticism = ?,
        investigation_efficiency = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE player_id = 'player-1'
    """, (
        new_dna["source_verification"],
        new_dna["manipulation_detection"],
        new_dna["emotional_manipulation"],
        new_dna["authority_bias"],
        new_dna["urgency_detection"],
        new_dna["visual_verification"],
        new_dna["ai_skepticism"],
        new_dna["investigation_efficiency"],
    ))

    # Insert into player_decisions
    cursor.execute("""
    INSERT INTO player_decisions (
        scenario_id, player_id, decision, ai_recommendation, is_correct,
        credits_spent, trust_points_delta, community_trust_delta,
        community_exposure_delta, harm_prevented_delta, harm_caused_delta,
        ai_override_success, explanation, simulation_impact_summary,
        trust_dna_deltas
    ) VALUES (?, 'player-1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        req.scenario_id,
        decision,
        latest_ai_rec,
        1 if evaluation["is_correct"] else 0,
        credits_spent,
        evaluation["trust_points_delta"],
        evaluation["community_trust_delta"],
        evaluation["exposure_delta"],
        evaluation["harm_prevented_delta"],
        evaluation["harm_caused_delta"],
        1 if evaluation["ai_override_success"] else 0,
        scenario["explanation"],
        evaluation["simulation_impact_summary"],
        json.dumps(evaluation["trust_dna_deltas"]),
    ))

    conn.commit()
    conn.close()

    updated_player = {
        "id": "player-1",
        "name": player["name"],
        "avatar": player.get("avatar", "AGENT"),
        "level": guardian_level,
        "rank": guardian_rank,
        "xp": new_xp,
        "xp_for_next_level": next_level_xp,
        "missions_completed": new_missions,
        "trust_score": new_trust_score,
        "investigation_credits": player["investigation_credits"],
        "community_population": new_comm["population"],
        "community_trust": new_comm["community_trust"],
        "community_exposure": new_comm["exposure"],
    }

    return {
        "scenario_id": req.scenario_id,
        "decision": decision,
        "player_action": decision,
        "verdict_label": evaluation["verdict_label"],
        "is_correct": evaluation["is_correct"],
        "correct_action": evaluation["correct_action"],
        "ground_truth": evaluation["ground_truth"],
        "difficulty": evaluation["difficulty"],
        "explanation": scenario["explanation"],
        # Trust score
        "trust_points_delta": evaluation["trust_points_delta"],
        "new_trust_score": new_trust_score,
        # Community impact
        "community_trust_delta": evaluation["community_trust_delta"],
        "exposure_delta": evaluation["exposure_delta"],
        "community_exposure_delta": evaluation["exposure_delta"],
        "harm_prevented_delta": evaluation["harm_prevented_delta"],
        "harm_caused_delta": evaluation["harm_caused_delta"],
        "simulation_impact_summary": evaluation["simulation_impact_summary"],
        "new_community_state": new_comm,
        # AI interaction
        "ai_recommendation": latest_ai_rec,
        "ai_override_success": evaluation["ai_override_success"],
        "ai_override_message": evaluation["ai_override_message"],
        # Trust DNA
        "trust_dna_deltas": evaluation["trust_dna_deltas"],
        "new_trust_dna": new_dna,
        "strongest_skill": evaluation["strongest_skill"],
        "weakest_skill": evaluation["weakest_skill"],
        # Phase 6 Digital Guardian Progression
        "xp_earned": xp_gain["total_xp"],
        "xp_breakdown": xp_gain,
        "guardian_rank": guardian_rank,
        "guardian_level": guardian_level,
        "guardian_reaction": guardian_reaction,
        # Player state
        "updated_player": updated_player,
    }


# Phase 5 API: Both /api/decision and /api/decide supported
@app.post("/api/decision")
def post_decision(req: DecideRequest):
    return _handle_decision(req)


@app.post("/api/decide")
def post_decide(req: DecideRequest):
    return _handle_decision(req)


@app.get("/api/community")
def get_community():
    """Returns current Community State metrics."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM community_state WHERE id = 'community-1'")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {
            "population": 1000,
            "community_trust": 100,
            "exposure": 0,
            "harm_prevented": 0,
            "harm_caused": 0,
            "safe_decisions": 0,
            "unsafe_decisions": 0,
        }
    return dict(row)


@app.get("/api/player/trust-dna")
def get_player_trust_dna():
    """Returns the player's 8-attribute Trust DNA cognitive profile with skill classifications."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM trust_dna WHERE player_id = 'player-1'")
    row = cursor.fetchone()
    conn.close()
    if not row:
        dna = {k: 50 for k in consequence_engine.DNA_TRAITS}
    else:
        dna = {k: row[k] for k in consequence_engine.DNA_TRAITS if k in row.keys()}

    sorted_skills = sorted(dna.items(), key=lambda x: x[1], reverse=True)
    strongest = sorted_skills[0][0] if sorted_skills else "source_verification"
    weakest = sorted_skills[-1][0] if sorted_skills else "ai_skepticism"
    
    # Classify all skills (WEAK, DEVELOPING, STRONG, EXPERT)
    classifications = {
        k: adaptive_engine.classify_skill(v) for k, v in dna.items()
    }
    training_focus = adaptive_engine.TRAIT_LABELS.get(weakest, "Authority Bias Control")

    return {
        "player_id": "player-1",
        "trust_dna": dna,
        "skill_classifications": classifications,
        "strongest_skill": strongest,
        "weakest_skill": weakest,
        "training_focus": training_focus,
    }


# ── Phase 6: Digital Guardian Endpoints ────────────────────────────────────────

@app.post("/api/guardian/create")
def create_guardian(req: GuardianCreateRequest):
    """Creates or updates the Digital Guardian callsign and avatar."""
    profile = guardian_service.create_or_update_guardian(
        name=req.name,
        avatar=req.avatar or "AGENT",
        player_id="player-1"
    )
    return profile


@app.get("/api/guardian/profile")
def get_guardian_profile():
    """Returns the comprehensive Digital Guardian profile with Rank, XP, and stats."""
    profile = guardian_service.get_guardian_profile(player_id="player-1")
    if not profile:
        raise HTTPException(status_code=404, detail="Guardian profile not found")
    return profile


@app.get("/api/guardian/achievements")
def get_guardian_achievements():
    """Returns all Guardian achievements with current progression status."""
    return guardian_service.get_guardian_achievements(player_id="player-1")


@app.get("/api/guardian/missions")
def get_guardian_missions():
    """Returns training missions generated from scenarios and adaptive targets."""
    return guardian_service.get_guardian_missions(player_id="player-1")



@app.get("/api/player/profile")
def get_player_profile():
    """Returns unified profile: player stats, community state, Trust DNA, accuracy."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM player_state WHERE id = 'player-1'")
    player_row = cursor.fetchone()

    cursor.execute("SELECT * FROM community_state WHERE id = 'community-1'")
    comm_row = cursor.fetchone()

    cursor.execute("SELECT * FROM trust_dna WHERE player_id = 'player-1'")
    dna_row = cursor.fetchone()

    cursor.execute("SELECT is_correct FROM player_decisions WHERE player_id = 'player-1'")
    decisions = cursor.fetchall()
    conn.close()

    total = len(decisions)
    correct = sum(1 for d in decisions if d["is_correct"])
    accuracy = round((correct / total * 100) if total > 0 else 0)

    player = dict(player_row) if player_row else {}
    community = dict(comm_row) if comm_row else {
        "population": 1000, "community_trust": 100, "exposure": 0,
        "harm_prevented": 0, "harm_caused": 0, "safe_decisions": 0, "unsafe_decisions": 0
    }
    dna = {k: dna_row[k] for k in consequence_engine.DNA_TRAITS if dna_row and k in dna_row.keys()} if dna_row else {
        k: 50 for k in consequence_engine.DNA_TRAITS
    }

    sorted_skills = sorted(dna.items(), key=lambda x: x[1], reverse=True)

    return {
        "player": player,
        "community": community,
        "trust_dna": dna,
        "strongest_skill": sorted_skills[0][0] if sorted_skills else "source_verification",
        "weakest_skill": sorted_skills[-1][0] if sorted_skills else "ai_skepticism",
        "total_decisions": total,
        "correct_decisions": correct,
        "accuracy_rate": accuracy,
    }


@app.get("/api/player/history")
def get_player_history():
    """Returns chronological audit trail of all executed decisions."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT d.*, s.title, s.sender, s.difficulty, s.ground_truth, s.correct_action
    FROM player_decisions d
    JOIN scenarios s ON d.scenario_id = s.id
    WHERE d.player_id = 'player-1'
    ORDER BY d.decided_at ASC
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    for r in rows:
        if r.get("trust_dna_deltas"):
            try:
                r["trust_dna_deltas"] = json.loads(r["trust_dna_deltas"])
            except Exception:
                pass
    return rows


@app.get("/api/results")
def get_results():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM player_state WHERE id = 'player-1'")
    player = dict(cursor.fetchone())

    cursor.execute("SELECT * FROM community_state WHERE id = 'community-1'")
    comm_row = cursor.fetchone()
    community = dict(comm_row) if comm_row else {}

    cursor.execute("SELECT * FROM trust_dna WHERE player_id = 'player-1'")
    dna_row = cursor.fetchone()
    trust_dna = {k: dna_row[k] for k in consequence_engine.DNA_TRAITS if dna_row and k in dna_row.keys()} if dna_row else {}

    cursor.execute("""
    SELECT d.*, s.title, s.sender, s.difficulty, s.ground_truth, s.correct_action
    FROM player_decisions d
    JOIN scenarios s ON d.scenario_id = s.id
    WHERE d.player_id = 'player-1'
    ORDER BY d.decided_at ASC
    """)
    logs = [dict(r) for r in cursor.fetchall()]
    conn.close()

    for l in logs:
        if l.get("trust_dna_deltas"):
            try:
                l["trust_dna_deltas"] = json.loads(l["trust_dna_deltas"])
            except Exception:
                pass

    total = len(logs)
    correct = sum(1 for l in logs if l["is_correct"])
    accuracy = round((correct / total * 100) if total > 0 else 0)

    return {
        "player": player,
        "community": community,
        "trust_dna": trust_dna,
        "total_decisions": total,
        "correct_decisions": correct,
        "accuracy_rate": accuracy,
        "decision_logs": logs
    }


@app.post("/api/next-challenge")
@app.get("/api/next-challenge")
def get_next_challenge():
    """Adaptive Gameplay Engine: Evaluates player Trust DNA and history to select the next targeted training scenario."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Fetch scenarios (only candidate metadata)
    cursor.execute("SELECT id, title, content_type, difficulty FROM scenarios")
    all_scenarios = [dict(r) for r in cursor.fetchall()]

    # 2. Fetch current Trust DNA
    cursor.execute("SELECT * FROM trust_dna WHERE player_id = 'player-1'")
    dna_row = cursor.fetchone()
    if dna_row:
        trust_dna = {k: dna_row[k] for k in consequence_engine.DNA_TRAITS if k in dna_row.keys()}
    else:
        trust_dna = {k: 50 for k in consequence_engine.DNA_TRAITS}

    # 3. Fetch decision history
    cursor.execute("""
    SELECT scenario_id, decision, is_correct, trust_dna_deltas, decided_at
    FROM player_decisions
    WHERE player_id = 'player-1'
    ORDER BY decided_at ASC
    """)
    history = [dict(r) for r in cursor.fetchall()]
    conn.close()

    for h in history:
        if h.get("trust_dna_deltas"):
            try:
                h["trust_dna_deltas"] = json.loads(h["trust_dna_deltas"])
            except Exception:
                pass

    # Run adaptive selection
    adaptive_res = adaptive_engine.select_adaptive_scenario(
        all_scenarios=all_scenarios,
        trust_dna=trust_dna,
        history=history
    )

    # Clean response strictly omitting hidden ground truth
    return {
        "scenario_id": adaptive_res["scenario_id"],
        "difficulty": adaptive_res["difficulty"],
        "training_focus": adaptive_res["training_focus"],
        "reason": adaptive_res["reason"],
        "skill_target": adaptive_res["skill_target"],
    }


@app.post("/api/reset")
def reset_simulation():
    seed_database()
    return {
        "status": "reset_successful",
        "message": "Player state, community state, Trust DNA, and scenarios reset to Phase 6 starting parameters."
    }

# ── Phase 7 & 8: Statistical, ML, and Real Investigation Endpoints ──────────

@app.get("/api/game/start")
def game_start():
    """Initializes or checks the active game session with current guardian and community state."""
    player = get_player()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM scenarios")
    scenario_count = cursor.fetchone()["count"]
    cursor.execute("SELECT * FROM community_state WHERE id = 'community-1'")
    comm = dict(cursor.fetchone())
    conn.close()

    return {
        "status": "active",
        "session_id": "session-live",
        "player": player,
        "community": comm,
        "total_scenarios": scenario_count,
        "message": "TRUSTIQ // TRUST WAR Operational. AI investigates. Human decides."
    }

@app.get("/api/scenario/{scenario_id}")
def get_scenario_singular(scenario_id: str):
    """Singular scenario route alias for spec compliance."""
    return get_scenario(scenario_id)

@app.post("/api/ml/predict")
def ml_predict(req: MLPredictRequest):
    """
    Executes Random Forest Risk Model inference on input message.
    Returns: continuous Risk Score (0-100), Risk Class (LOW/MEDIUM/HIGH), Confidence, Top Features.
    """
    prediction = predict_message_risk(req.text, req.sender)
    return prediction

@app.post("/api/statistics/analyze")
def statistics_analyze(req: StatisticsAnalyzeRequest):
    """
    Executes Z-score anomaly detection against communication baselines.
    Formula: Z = (x - μ) / σ
    """
    features = req.features or extract_features(req.text, req.sender)
    z_signals = analyze_features_z_score(features)
    summary = get_statistical_summary(z_signals)
    return {
        "features": features,
        "statistical_signals": z_signals,
        "summary": summary
    }

@app.post("/api/evidence/verify")
def evidence_verify(req: EvidenceVerifyRequest):
    """
    Cross-references claims against verified institutional and regulatory registries.
    Returns official citations and support levels (SUPPORTED, CONTRADICTED, UNVERIFIED).
    """
    results = evidence_service.verify_claims_against_evidence(req.text, req.sender)
    return {
        "text_checked": req.text[:120] + "..." if len(req.text) > 120 else req.text,
        "sender": req.sender,
        "evidence_sources": results,
        "sources_count": len(results)
    }

@app.post("/api/real-investigation")
def real_investigation(req: RealInvestigationRequest):
    """
    MODE 2: Real Investigation Mode
    Allows arbitrary user-provided messages to be audited through the full pipeline:
    Feature Extraction -> Z-Score Analysis -> Random Forest ML -> NOVA Reasoning -> Evidence Verification.
    No hidden ground truth is assumed.
    """
    clean_text = evidence_service.sanitize_input(req.text)
    
    # 1. ML and Statistics
    ml_pred = predict_message_risk(clean_text, req.sender)
    
    # 2. Evidence Verification
    evidence_items = evidence_service.verify_claims_against_evidence(clean_text, req.sender)
    
    # 3. NOVA Contextual Dossier
    nova_dossier = ai_agent.investigate(
        investigation_type="deep_investigation",
        content=clean_text,
        source=req.sender,
        url=req.url,
        content_type="text",
        scenario_title="Live Ingestion Audit"
    )

    return {
        "mode": "REAL_INVESTIGATION",
        "input_message": clean_text,
        "sender": req.sender or "Unspecified",
        "url": req.url or "",
        "ml_risk": {
            "score": ml_pred["risk_score"],
            "risk_class": ml_pred["risk_class"],
            "confidence": ml_pred["confidence"],
            "top_features": ml_pred["top_features"],
            "probabilities": ml_pred["probabilities"]
        },
        "statistical_signals": ml_pred["statistical_signals"],
        "statistical_summary": ml_pred["statistical_summary"],
        "nova_dossier": {
            "status": nova_dossier.get("status"),
            "claim": nova_dossier.get("claim"),
            "signals": nova_dossier.get("signals", []),
            "uncertainty": nova_dossier.get("uncertainty"),
            "recommended_action": nova_dossier.get("recommended_action"),
            "reasoning": nova_dossier.get("reasoning")
        },
        "evidence_verification": evidence_items,
        "disclaimer": "TRUSTIQ is an educational decision-training game. AI and ML risk assessments identify patterns and uncertainty; they do not independently establish factual truth, criminality, or intent."
    }



