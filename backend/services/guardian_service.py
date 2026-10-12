"""
TRUSTIQ — Digital Guardian Service (Phase 6)
============================================
Manages Guardian progression, ranks, XP, achievements, missions,
and cyber-command tactical feedback.

Ranks:
LEVEL 1: ROOKIE GUARDIAN   (XP 0 - 249)
LEVEL 2: SIGNAL SCOUT      (XP 250 - 549)
LEVEL 3: THREAT ANALYST    (XP 550 - 999)
LEVEL 4: TRUST GUARDIAN    (XP 1000 - 1599)
LEVEL 5: TRUSTIQ COMMANDER (XP 1600+)

Avatars:
- AGENT
- SCOUT
- ANALYST
- DEFENDER
"""

import json
from typing import Dict, Any, List, Optional, Tuple
from database import get_connection

RANKS_CONFIG = [
    {"level": 1, "title": "ROOKIE GUARDIAN", "min_xp": 0, "max_xp": 249, "next_xp": 250},
    {"level": 2, "title": "SIGNAL SCOUT", "min_xp": 250, "max_xp": 549, "next_xp": 550},
    {"level": 3, "title": "THREAT ANALYST", "min_xp": 550, "max_xp": 999, "next_xp": 1000},
    {"level": 4, "title": "TRUST GUARDIAN", "min_xp": 1000, "max_xp": 1599, "next_xp": 1600},
    {"level": 5, "title": "TRUSTIQ COMMANDER", "min_xp": 1600, "max_xp": 999999, "next_xp": 2500},
]

VALID_AVATARS = ["AGENT", "SCOUT", "ANALYST", "DEFENDER"]


def calculate_rank_and_level(xp: int) -> Tuple[int, str, int]:
    """
    Deterministically computes level (1-5), rank title, and XP needed for next level.
    """
    for tier in RANKS_CONFIG:
        if tier["min_xp"] <= xp <= tier["max_xp"]:
            return tier["level"], tier["title"], tier["next_xp"]
    return 5, "TRUSTIQ COMMANDER", 2500


def calculate_xp_gain(
    difficulty: str,
    is_correct: bool,
    ai_override_success: bool = False,
    credits_spent: int = 0
) -> Dict[str, Any]:
    """
    Calculates deterministic XP gain:
    - Correct:
      - EASY: +80 XP
      - MEDIUM: +120 XP
      - HARD: +180 XP
    - Incorrect: +10 XP (learning bonus, avoids player frustration)
    - AI Override Success bonus: +50 XP
    - Investigation Efficiency bonus (spent <= 10 CR on correct decision): +30 XP
    """
    diff = (difficulty or "MEDIUM").upper()
    diff_xp = {"EASY": 80, "MEDIUM": 120, "HARD": 180}.get(diff, 120)

    base_xp = diff_xp if is_correct else 10
    override_bonus = 50 if (is_correct and ai_override_success) else 0
    efficiency_bonus = 30 if (is_correct and 1 <= credits_spent <= 10) else 0

    total_xp = base_xp + override_bonus + efficiency_bonus

    return {
        "total_xp": total_xp,
        "base_xp": base_xp,
        "override_bonus": override_bonus,
        "efficiency_bonus": efficiency_bonus,
    }


def get_guardian_reaction(
    is_correct: bool,
    ground_truth: str,
    ai_override_success: bool = False
) -> str:
    """
    Generates contextual, cyber-tactical feedback from the Guardian.
    """
    gt = (ground_truth or "").upper()
    is_harmful = gt in ["SCAM", "MISINFORMATION", "HOAX"]

    if ai_override_success:
        return "AI recommendation challenged successfully. Human discretion superseded algorithmic advisory."

    if is_correct:
        if is_harmful:
            return "Threat contained. Digital community perimeter secured."
        else:
            return "Authentic transmission verified. Digital public square kept open and functional."
    else:
        if is_harmful:
            return "Adversary slipped past perimeter. We need to investigate more carefully next time."
        else:
            return "Authentic information improperly blocked. Over-quarantining weakens civic coordination."


def create_or_update_guardian(
    name: str,
    avatar: str = "AGENT",
    player_id: str = "player-1"
) -> Dict[str, Any]:
    """
    Creates or updates the Guardian's callsign and visual style.
    """
    av = avatar.upper().strip()
    if av not in VALID_AVATARS:
        av = "AGENT"

    clean_name = name.strip() or "Agent Commander"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE player_state
    SET name = ?, avatar = ?
    WHERE id = ?
    """, (clean_name, av, player_id))
    conn.commit()
    conn.close()

    return get_guardian_profile(player_id)


def get_guardian_profile(player_id: str = "player-1") -> Dict[str, Any]:
    """
    Retrieves full Guardian profile with stats, level, rank, and metrics.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM player_state WHERE id = ?", (player_id,))
    player_row = cursor.fetchone()

    cursor.execute("SELECT * FROM community_state WHERE id = 'community-1'")
    comm_row = cursor.fetchone()

    cursor.execute("SELECT * FROM trust_dna WHERE player_id = ?", (player_id,))
    dna_row = cursor.fetchone()

    cursor.execute("""
    SELECT is_correct, harm_prevented_delta, ai_override_success
    FROM player_decisions
    WHERE player_id = ?
    """, (player_id,))
    decisions = cursor.fetchall()
    conn.close()

    if not player_row:
        return {}

    player = dict(player_row)
    xp = player.get("xp", 0)
    level, rank_title, next_xp = calculate_rank_and_level(xp)

    # Sync calculated level/rank into dictionary
    player["level"] = level
    player["rank"] = rank_title
    player["xp_for_next_level"] = next_xp

    total_decisions = len(decisions)
    correct_decisions = sum(1 for d in decisions if d["is_correct"])
    accuracy = round((correct_decisions / total_decisions * 100) if total_decisions > 0 else 0)
    harm_prevented_total = sum(d["harm_prevented_delta"] for d in decisions if d["harm_prevented_delta"])

    # DNA sorting for training focus
    dna = dict(dna_row) if dna_row else {}
    trait_keys = [
        "source_verification", "manipulation_detection", "emotional_manipulation",
        "authority_bias", "urgency_detection", "visual_verification",
        "ai_skepticism", "investigation_efficiency"
    ]
    trait_scores = {k: dna.get(k, 50) for k in trait_keys}
    sorted_skills = sorted(trait_scores.items(), key=lambda x: x[1])
    weakest_skill = sorted_skills[0][0] if sorted_skills else "authority_bias"
    strongest_skill = sorted_skills[-1][0] if sorted_skills else "source_verification"

    # Human-readable focus label
    from services.adaptive_engine import TRAIT_LABELS
    training_focus = TRAIT_LABELS.get(weakest_skill, "Authority Bias Control")

    community_protected = harm_prevented_total or (correct_decisions * 150)

    return {
        "id": player.get("id", "player-1"),
        "name": player.get("name", "Agent Commander"),
        "avatar": player.get("avatar", "AGENT"),
        "rank": rank_title,
        "level": level,
        "xp": xp,
        "xp_for_next_level": next_xp,
        "trust_score": player.get("trust_score", 0),
        "investigation_credits": player.get("investigation_credits", 30),
        "community_population": comm_row["population"] if comm_row else 1000,
        "community_trust": comm_row["community_trust"] if comm_row else 100,
        "community_exposure": comm_row["exposure"] if comm_row else 0,
        "community_protected": community_protected,
        "missions_completed": correct_decisions,
        "total_decisions": total_decisions,
        "correct_decisions": correct_decisions,
        "accuracy_rate": accuracy,
        "weakest_skill": weakest_skill,
        "strongest_skill": strongest_skill,
        "training_focus": training_focus,
    }


def get_guardian_achievements(player_id: str = "player-1") -> List[Dict[str, Any]]:
    """
    Evaluates player progress against achievement criteria deterministically.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT d.scenario_id, d.decision, d.is_correct, d.ai_override_success, s.ground_truth, s.difficulty
    FROM player_decisions d
    JOIN scenarios s ON d.scenario_id = s.id
    WHERE d.player_id = ?
    """, (player_id,))
    decisions = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT COUNT(*) as count FROM scenario_investigations WHERE player_id = ?", (player_id,))
    inv_count = cursor.fetchone()["count"]

    cursor.execute("SELECT * FROM trust_dna WHERE player_id = ?", (player_id,))
    dna_row = cursor.fetchone()
    conn.close()

    dna = dict(dna_row) if dna_row else {}
    traits = [
        "source_verification", "manipulation_detection", "emotional_manipulation",
        "authority_bias", "urgency_detection", "visual_verification",
        "ai_skepticism", "investigation_efficiency"
    ]

    # Metrics
    harmful_contained = sum(
        1 for d in decisions
        if d["is_correct"] and d["ground_truth"] in ["SCAM", "MISINFORMATION", "HOAX"]
    )
    ai_overrides = sum(1 for d in decisions if d.get("ai_override_success"))
    manipulation_correct = sum(
        1 for d in decisions
        if d["is_correct"] and d["scenario_id"] in ["scenario-4", "scenario-6", "scenario-9", "scenario-10"]
    )
    urgency_correct = sum(
        1 for d in decisions
        if d["is_correct"] and d["scenario_id"] in ["scenario-1", "scenario-11"]
    )
    all_dna_80 = all(dna.get(t, 50) >= 80 for t in traits) if dna else False
    dna_80_count = sum(1 for t in traits if dna.get(t, 50) >= 80) if dna else 0

    achievements = [
        {
            "id": "first_line_of_defense",
            "title": "FIRST LINE OF DEFENSE",
            "description": "Successfully contain your first harmful digital threat.",
            "unlocked": harmful_contained >= 1,
            "progress": min(1, harmful_contained),
            "target": 1,
            "category": "CONTAINMENT",
        },
        {
            "id": "evidence_hunter",
            "title": "EVIDENCE HUNTER",
            "description": "Conduct 5 forensic investigations before issuing verdicts.",
            "unlocked": inv_count >= 5,
            "progress": min(5, inv_count),
            "target": 5,
            "category": "INVESTIGATION",
        },
        {
            "id": "ai_challenger",
            "title": "AI CHALLENGER",
            "description": "Correctly override an erroneous AI recommendation.",
            "unlocked": ai_overrides >= 1,
            "progress": min(1, ai_overrides),
            "target": 1,
            "category": "DISCRETION",
        },
        {
            "id": "manipulation_detector",
            "title": "MANIPULATION DETECTOR",
            "description": "Identify and neutralize 2 manipulation/hoax scenarios.",
            "unlocked": manipulation_correct >= 2,
            "progress": min(2, manipulation_correct),
            "target": 2,
            "category": "FORENSICS",
        },
        {
            "id": "urgency_breaker",
            "title": "URGENCY BREAKER",
            "description": "Identify 2 high-urgency manipulation vectors without panic.",
            "unlocked": urgency_correct >= 2,
            "progress": min(2, urgency_correct),
            "target": 2,
            "category": "PSYCHOLOGY",
        },
        {
            "id": "trust_master",
            "title": "TRUST MASTER",
            "description": "Reach 80+ in all 8 Trust DNA cognitive categories.",
            "unlocked": all_dna_80,
            "progress": dna_80_count,
            "target": 8,
            "category": "MASTERY",
        },
    ]

    return achievements


def get_guardian_missions(player_id: str = "player-1") -> List[Dict[str, Any]]:
    """
    Returns lightweight mission progression generated from current scenarios & adaptive targets.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT scenario_id, decision, is_correct, ai_override_success
    FROM player_decisions
    WHERE player_id = ?
    """, (player_id,))
    decisions = {r["scenario_id"]: dict(r) for r in cursor.fetchall()}
    conn.close()

    # Mission definitions tied to scenarios
    mission_defs = [
        {
            "id": "mission-01",
            "title": "MISSION 01: IMPERSONATION INTERCEPT",
            "description": "Identify an authority impersonation attempt disguised as an official dispatch.",
            "scenarios": ["scenario-2", "scenario-3", "scenario-7"],
            "target_skill": "authority_bias",
            "xp_reward": 150,
        },
        {
            "id": "mission-02",
            "title": "MISSION 02: URGENCY REFLEX CHECK",
            "description": "Detect an artificial urgency-based panic trigger designed to force quick mistakes.",
            "scenarios": ["scenario-1", "scenario-11"],
            "target_skill": "urgency_detection",
            "xp_reward": 150,
        },
        {
            "id": "mission-03",
            "title": "MISSION 03: AUTONOMOUS DISCRETION",
            "description": "Evaluate independent evidence and challenge the AI recommendation when incomplete.",
            "scenarios": ["scenario-5", "scenario-8"],
            "target_skill": "ai_skepticism",
            "xp_reward": 200,
        },
        {
            "id": "mission-04",
            "title": "MISSION 04: EVIDENCE CORROBORATION",
            "description": "Verify external sources and domain indicators before passing communications.",
            "scenarios": ["scenario-2", "scenario-7", "scenario-12"],
            "target_skill": "source_verification",
            "xp_reward": 150,
        },
        {
            "id": "mission-05",
            "title": "MISSION 05: COMMUNITY SHIELD",
            "description": "Neutralize synthetic screenshots and protect community trust from disinformation panic.",
            "scenarios": ["scenario-4", "scenario-6", "scenario-9", "scenario-10"],
            "target_skill": "manipulation_detection",
            "xp_reward": 250,
        },
    ]

    missions: List[Dict[str, Any]] = []
    active_found = False

    for m in mission_defs:
        # Check if any linked scenario was completed correctly
        is_completed = any(
            decisions.get(sc_id, {}).get("is_correct") == 1
            for sc_id in m["scenarios"]
        )

        if is_completed:
            status = "COMPLETED"
        elif not active_found:
            status = "ACTIVE"
            active_found = True
        else:
            status = "LOCKED"

        missions.append({
            "id": m["id"],
            "title": m["title"],
            "description": m["description"],
            "target_skill": m["target_skill"],
            "status": status,
            "xp_reward": m["xp_reward"],
            "linked_scenarios": m["scenarios"],
        })

    return missions
