"""
TRUSTIQ — Adaptive Gameplay Engine (Phase 6)
==============================================
Analyzes player Trust DNA, recent decision history, and behavioral patterns
to dynamically select the optimal training scenario and calibrated difficulty.

Core Responsibilities:
1. Classify Trust DNA skills (WEAK, DEVELOPING, STRONG, EXPERT)
2. Detect primary training target / weakness (with recent-failure tie-breaking)
3. Calibrate difficulty (EASY, MEDIUM, HARD) based on skill mastery
4. Score candidate scenarios (weakness match + recent failure match + difficulty match + variety - repetition penalty)
5. Prevent recent scenario repetition (avoids last 2 rounds unless no alternative)
6. Generate constructive, responsible Training Insights
7. Strictly protect hidden ground truth from being leaked
"""

from typing import Dict, Any, List, Optional, Tuple

DNA_TRAITS = [
    "source_verification",
    "manipulation_detection",
    "emotional_manipulation",
    "authority_bias",
    "urgency_detection",
    "visual_verification",
    "ai_skepticism",
    "investigation_efficiency",
]

TRAIT_LABELS = {
    "source_verification": "Source Verification",
    "manipulation_detection": "Manipulation Detection",
    "emotional_manipulation": "Emotional Defense",
    "authority_bias": "Authority Bias Control",
    "urgency_detection": "Urgency Detection",
    "visual_verification": "Visual Verification",
    "ai_skepticism": "AI Skepticism",
    "investigation_efficiency": "Investigation Efficiency",
}

DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD"]

# Mapping scenarios to their primary & secondary target skills
SCENARIO_SKILL_MAP: Dict[str, Dict[str, Any]] = {
    "scenario-1": {
        "primary": "urgency_detection",
        "secondary": ["emotional_manipulation", "source_verification"],
        "difficulty": "EASY",
        "content_type": "text_upi_link",
    },
    "scenario-2": {
        "primary": "authority_bias",
        "secondary": ["source_verification", "urgency_detection"],
        "difficulty": "MEDIUM",
        "content_type": "link",
    },
    "scenario-3": {
        "primary": "authority_bias",
        "secondary": ["manipulation_detection", "investigation_efficiency"],
        "difficulty": "MEDIUM",
        "content_type": "text",
    },
    "scenario-4": {
        "primary": "manipulation_detection",
        "secondary": ["emotional_manipulation", "investigation_efficiency"],
        "difficulty": "EASY",
        "content_type": "text",
    },
    "scenario-5": {
        "primary": "emotional_manipulation",
        "secondary": ["urgency_detection", "ai_skepticism"],
        "difficulty": "HARD",
        "content_type": "voice_message",
    },
    "scenario-6": {
        "primary": "visual_verification",
        "secondary": ["authority_bias", "manipulation_detection"],
        "difficulty": "HARD",
        "content_type": "screenshot_image",
    },
    "scenario-7": {
        "primary": "source_verification",
        "secondary": ["authority_bias", "manipulation_detection"],
        "difficulty": "EASY",
        "content_type": "text",
    },
    # Phase 6 Expansion Scenarios
    "scenario-8": {
        "primary": "ai_skepticism",
        "secondary": ["source_verification", "manipulation_detection"],
        "difficulty": "MEDIUM",
        "content_type": "link",
    },
    "scenario-9": {
        "primary": "visual_verification",
        "secondary": ["manipulation_detection", "investigation_efficiency"],
        "difficulty": "MEDIUM",
        "content_type": "screenshot_image",
    },
    "scenario-10": {
        "primary": "investigation_efficiency",
        "secondary": ["urgency_detection", "source_verification"],
        "difficulty": "EASY",
        "content_type": "text",
    },
    "scenario-11": {
        "primary": "urgency_detection",
        "secondary": ["authority_bias", "emotional_manipulation"],
        "difficulty": "HARD",
        "content_type": "link",
    },
    "scenario-12": {
        "primary": "source_verification",
        "secondary": ["authority_bias", "investigation_efficiency"],
        "difficulty": "HARD",
        "content_type": "link",
    },
}


def classify_skill(score: int) -> str:
    """
    Classifies a Trust DNA skill score:
    < 40: WEAK
    40–59: DEVELOPING
    60–79: STRONG
    80–100: EXPERT
    """
    if score < 40:
        return "WEAK"
    elif score <= 59:
        return "DEVELOPING"
    elif score <= 79:
        return "STRONG"
    else:
        return "EXPERT"


def analyze_recent_performance(history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes player's last 5 decisions from history to count recent failures by skill,
    consecutive successes/failures, and recent scenario IDs.
    """
    last_5 = history[-5:] if len(history) >= 5 else history[:]
    recent_failures_by_skill: Dict[str, int] = {k: 0 for k in DNA_TRAITS}
    recent_scenario_ids = [d["scenario_id"] for d in reversed(history)]
    last_decisions_correct = [bool(d.get("is_correct", 0)) for d in last_5]

    for d in last_5:
        if not d.get("is_correct", 0):
            sid = d.get("scenario_id", "")
            mapping = SCENARIO_SKILL_MAP.get(sid, {})
            primary = mapping.get("primary")
            if primary and primary in recent_failures_by_skill:
                recent_failures_by_skill[primary] += 2
            for sec in mapping.get("secondary", []):
                if sec in recent_failures_by_skill:
                    recent_failures_by_skill[sec] += 1

            # Also inspect recorded trust_dna_deltas if available
            deltas = d.get("trust_dna_deltas")
            if isinstance(deltas, dict):
                for trait, delta in deltas.items():
                    if delta < 0 and trait in recent_failures_by_skill:
                        recent_failures_by_skill[trait] += 1

    # Consecutive success / failure count
    consecutive_success = 0
    consecutive_failure = 0
    for is_corr in reversed(last_decisions_correct):
        if is_corr:
            if consecutive_failure == 0:
                consecutive_success += 1
            else:
                break
        else:
            if consecutive_success == 0:
                consecutive_failure += 1
            else:
                break

    return {
        "recent_failures_by_skill": recent_failures_by_skill,
        "recent_scenario_ids": recent_scenario_ids,
        "consecutive_success": consecutive_success,
        "consecutive_failure": consecutive_failure,
        "total_recent": len(last_5),
    }


def identify_training_target(
    trust_dna: Dict[str, int],
    history: List[Dict[str, Any]],
) -> Tuple[str, str, Dict[str, str]]:
    """
    Identifies the primary training target (weakest skill), considering both
    lifetime Trust DNA score and recent performance. Breaks ties using recent errors.
    Returns: (target_skill, classification, all_classifications)
    """
    classifications = {trait: classify_skill(trust_dna.get(trait, 50)) for trait in DNA_TRAITS}
    perf = analyze_recent_performance(history)
    recent_failures = perf["recent_failures_by_skill"]

    # Effective weakness weight: lower DNA score + higher recent failures = higher priority
    # Score formula: (100 - dna_score) + (recent_failures * 15)
    priority_scores: List[Tuple[str, int, int]] = []
    for trait in DNA_TRAITS:
        dna_val = trust_dna.get(trait, 50)
        rec_fails = recent_failures.get(trait, 0)
        # Priority weight
        weight = (100 - dna_val) + (rec_fails * 15)
        priority_scores.append((trait, weight, dna_val))

    # Sort descending by priority weight, then ascending by dna_val
    priority_scores.sort(key=lambda x: (x[1], -x[2]), reverse=True)
    target_skill = priority_scores[0][0]
    return target_skill, classifications[target_skill], classifications


def determine_adapted_difficulty(
    target_skill: str,
    skill_score: int,
    history: List[Dict[str, Any]],
) -> str:
    """
    Determines suitable difficulty (EASY, MEDIUM, HARD).
    Rules:
    - If player repeatedly fails or skill is WEAK (<40): start with EASY.
    - If skill is DEVELOPING (40-59): MEDIUM.
    - If skill is STRONG or EXPERT (>=60) and recent success: HARD.
    - Gradual progression:
      If 2+ consecutive correct decisions recently: step up difficulty.
      If 2+ consecutive incorrect decisions recently: step down difficulty.
    """
    perf = analyze_recent_performance(history)
    succ = perf["consecutive_success"]
    fail = perf["consecutive_failure"]

    if skill_score < 40:
        base_diff = "EASY"
    elif skill_score <= 65:
        base_diff = "MEDIUM"
    else:
        base_diff = "HARD"

    # Adjust based on consecutive success / failure
    if succ >= 2:
        # Step up
        if base_diff == "EASY":
            return "MEDIUM"
        else:
            return "HARD"
    elif fail >= 2:
        # Step down
        if base_diff == "HARD":
            return "MEDIUM"
        else:
            return "EASY"

    return base_diff


def score_candidate_scenario(
    scenario: Dict[str, Any],
    target_skill: str,
    target_difficulty: str,
    recent_scenario_ids: List[str],
    recent_failures_by_skill: Dict[str, int],
    last_content_type: Optional[str] = None,
) -> float:
    """
    Calculates scenario match score:
    scenario_score = weakness_match + recent_failure_match + difficulty_match + variety_bonus - repetition_penalty
    """
    sid = scenario["id"]
    mapping = SCENARIO_SKILL_MAP.get(sid, {})
    sc_primary = mapping.get("primary", "")
    sc_secondary = mapping.get("secondary", [])
    sc_diff = scenario.get("difficulty", "MEDIUM").upper()
    sc_content_type = scenario.get("content_type", "text")

    # 1. Weakness Match (+40 for primary, +20 for secondary)
    weakness_match = 0
    if sc_primary == target_skill:
        weakness_match = 40
    elif target_skill in sc_secondary:
        weakness_match = 20

    # 2. Recent Failure Match (+25 if player made a recent mistake on scenario's primary)
    recent_failure_match = 0
    if recent_failures_by_skill.get(sc_primary, 0) > 0:
        recent_failure_match = 25

    # 3. Difficulty Match (+30 exact match, +10 1-step away, 0 2-steps away)
    diff_order = {"EASY": 0, "MEDIUM": 1, "HARD": 2}
    dist = abs(diff_order.get(sc_diff, 1) - diff_order.get(target_difficulty, 1))
    if dist == 0:
        difficulty_match = 30
    elif dist == 1:
        difficulty_match = 10
    else:
        difficulty_match = 0

    # 4. Variety Bonus (+15 if content_type differs from previous)
    variety_bonus = 15 if (last_content_type and sc_content_type != last_content_type) else 5

    # 5. Repetition Penalty (-100 if in last 2 rounds, -40 if in rounds 3-4)
    repetition_penalty = 0
    if len(recent_scenario_ids) >= 1 and sid in recent_scenario_ids[:2]:
        repetition_penalty = 120  # Strongly avoid last 2 rounds
    elif len(recent_scenario_ids) >= 3 and sid in recent_scenario_ids[2:4]:
        repetition_penalty = 40

    total_score = (
        weakness_match
        + recent_failure_match
        + difficulty_match
        + variety_bonus
        - repetition_penalty
    )
    return total_score


def select_adaptive_scenario(
    all_scenarios: List[Dict[str, Any]],
    trust_dna: Dict[str, int],
    history: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Selects the optimal scenario tailored to player's Trust DNA and performance.
    Guarantees:
    - Never returns ground truth or correct action in result
    - Returns scenario_id, difficulty, training_focus, reason, skill_target
    """
    if not all_scenarios:
        raise ValueError("No candidate scenarios available for adaptive selection.")

    target_skill, classification, all_classifications = identify_training_target(trust_dna, history)
    skill_score = trust_dna.get(target_skill, 50)
    target_difficulty = determine_adapted_difficulty(target_skill, skill_score, history)

    perf = analyze_recent_performance(history)
    recent_ids = perf["recent_scenario_ids"]
    recent_failures = perf["recent_failures_by_skill"]
    last_content_type = None
    if history:
        last_sid = history[-1].get("scenario_id")
        matching_last = next((s for s in all_scenarios if s["id"] == last_sid), None)
        if matching_last:
            last_content_type = matching_last.get("content_type")

    # Score candidate scenarios
    scored_candidates: List[Tuple[Dict[str, Any], float]] = []
    for sc in all_scenarios:
        # Ground truth must be stripped if not already stripped
        clean_sc = dict(sc)
        clean_sc.pop("ground_truth", None)
        clean_sc.pop("correct_action", None)

        score = score_candidate_scenario(
            scenario=sc,
            target_skill=target_skill,
            target_difficulty=target_difficulty,
            recent_scenario_ids=recent_ids,
            recent_failures_by_skill=recent_failures,
            last_content_type=last_content_type,
        )
        scored_candidates.append((clean_sc, score))

    # Sort descending by score
    scored_candidates.sort(key=lambda x: x[1], reverse=True)
    best_scenario = scored_candidates[0][0]

    # Generate constructive Training Insight (Responsible Game Design)
    skill_label = TRAIT_LABELS.get(target_skill, target_skill.replace("_", " ").title())
    if classification == "WEAK":
        reason = (
            f"Training opportunity detected: Your biometric signature indicates vulnerability in {skill_label}. "
            f"Calibrating a targeted scenario to reinforce foundational forensic protocols."
        )
    elif classification == "DEVELOPING":
        reason = (
            f"Skill calibration active: {skill_label} is currently developing. "
            f"Presenting a scenario calibrated to sharpen discrimination thresholds."
        )
    elif perf["recent_failures_by_skill"].get(target_skill, 0) > 0:
        reason = (
            f"Recent decision variance detected in {skill_label}. "
            f"Deploying targeted verification challenge to stabilize accuracy."
        )
    else:
        reason = (
            f"Progressive difficulty adjustment: Testing high-level mastery in {skill_label}."
        )

    return {
        "scenario_id": best_scenario["id"],
        "difficulty": best_scenario.get("difficulty", target_difficulty),
        "training_focus": skill_label,
        "skill_target": target_skill,
        "reason": reason,
        "target_classification": classification,
        "selection_score": scored_candidates[0][1],
    }
