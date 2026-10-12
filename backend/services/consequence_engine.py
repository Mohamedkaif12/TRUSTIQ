"""
TRUSTIQ — Consequence Engine (Phase 5)
=======================================
Deterministic evaluation of player decisions against hidden ground truth.
Calculates:
- Correctness and trust score change (0–1000)
- Community state changes (trust 0–100, exposure, harm prevented, harm caused)
- Trust DNA skills (8 traits, 0–100, initial 50)
- AI override detection & skepticism tracking
- Responsible game simulation messaging

IMPORTANT:
Hidden ground truth is used strictly within this service to evaluate consequences.
It must never be provided to the AI agent or leaked to undecided scenarios.
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

DIFFICULTY_REWARDS = {
    "EASY": {"correct": 30, "penalty": 15},
    "MEDIUM": {"correct": 40, "penalty": 20},
    "HARD": {"correct": 50, "penalty": 25},
}


def clamp(val: int, min_val: int = 0, max_val: int = 100) -> int:
    """Clamps an integer between min_val and max_val."""
    return max(min_val, min(max_val, val))


def calculate_consequences(
    scenario: Dict[str, Any],
    player_decision: str,
    community_state: Dict[str, Any],
    investigations_done: List[str],
    credits_spent: int,
    current_trust_dna: Dict[str, int],
    current_trust_score: int,
    ai_recommendation: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Evaluates player decision consequences deterministically.
    
    Returns consequence payload with:
    - is_correct, verdict_label, correct_action, ground_truth
    - trust_points_delta, new_trust_score
    - community deltas (trust, exposure, harm_prevented, harm_caused)
    - new_community_state
    - trust_dna_deltas, new_trust_dna
    - ai_override_success, ai_reliability_info
    - simulation_impact_summary
    """
    player_action = player_decision.upper().strip()
    correct_action = scenario["correct_action"].upper().strip()
    ground_truth = scenario["ground_truth"].upper().strip()
    difficulty = scenario.get("difficulty", "MEDIUM").upper().strip()
    base_audience = int(scenario.get("base_audience", 250))
    content_type = scenario.get("content_type", "text")
    manipulation_signals = scenario.get("manipulation_signals", [])

    is_correct = (player_action == correct_action)
    verdict_label = "CORRECT DECISION" if is_correct else "INCORRECT DECISION"

    # ─────────────────────────────────────────────────────────────────────────
    # 1. Trust Score Delta (0–1000 range)
    # ─────────────────────────────────────────────────────────────────────────
    diff_cfg = DIFFICULTY_REWARDS.get(difficulty, DIFFICULTY_REWARDS["MEDIUM"])
    if is_correct:
        trust_points_delta = diff_cfg["correct"]
    else:
        trust_points_delta = -diff_cfg["penalty"]

    new_trust_score = clamp(current_trust_score + trust_points_delta, 0, 1000)

    # ─────────────────────────────────────────────────────────────────────────
    # 2. Community State Deltas
    # ─────────────────────────────────────────────────────────────────────────
    comm_trust_delta = 0
    exposure_delta = 0
    harm_prevented_delta = 0
    harm_caused_delta = 0
    safe_decisions_delta = 0
    unsafe_decisions_delta = 0
    simulation_impact_summary = ""

    is_harmful = ground_truth in ["SCAM", "MISINFORMATION", "HOAX"]

    if is_harmful:
        if player_action == "ALLOW":
            # Harmful content incorrectly ALLOWED
            exposure_delta = base_audience
            harm_caused_delta = base_audience
            harm_prevented_delta = 0
            comm_trust_delta = -25
            unsafe_decisions_delta = 1
            simulation_impact_summary = (
                f"Your decision allowed the information to spread. "
                f"(+{base_audience} simulated exposure, -25 community trust) [GAME SIMULATION]"
            )
        elif is_correct and player_action in ["CONTAIN", "ESCALATE"]:
            # Harmful content correctly CONTAINED or ESCALATED
            exposure_delta = 0
            harm_prevented_delta = base_audience
            harm_caused_delta = 0
            comm_trust_delta = +3
            safe_decisions_delta = 1
            simulation_impact_summary = (
                f"Threat contained before widespread exposure. "
                f"({base_audience} citizens protected, +3 community trust) [GAME SIMULATION]"
            )
        elif is_correct:
            # Correctly held or verified (e.g., HOAX requiring VERIFY)
            exposure_delta = 0
            harm_prevented_delta = base_audience
            harm_caused_delta = 0
            comm_trust_delta = +2
            safe_decisions_delta = 1
            simulation_impact_summary = (
                f"Precautionary containment active. Information quarantined pending audit. [GAME SIMULATION]"
            )
        else:
            # Sub-optimal response (e.g. HOLD instead of ESCALATE for critical vishing)
            exposure_delta = base_audience // 3
            harm_caused_delta = base_audience // 3
            harm_prevented_delta = base_audience - (base_audience // 3)
            comm_trust_delta = -10
            unsafe_decisions_delta = 1
            simulation_impact_summary = (
                f"Sub-optimal triage response allowed partial threat propagation. "
                f"(+{exposure_delta} simulated exposure, -10 community trust) [GAME SIMULATION]"
            )
    else:
        # Genuine information
        if is_correct and player_action == "ALLOW":
            # Genuine information correctly ALLOWED
            exposure_delta = 0
            harm_prevented_delta = 0
            harm_caused_delta = 0
            comm_trust_delta = +2
            safe_decisions_delta = 1
            simulation_impact_summary = (
                "Authentic civic dispatch transmitted to citizens. "
                "Community coordination reinforced. (+2 community trust) [GAME SIMULATION]"
            )
        else:
            # Genuine information incorrectly blocked or delayed
            exposure_delta = 0
            harm_prevented_delta = 0
            harm_caused_delta = 0
            comm_trust_delta = -8
            unsafe_decisions_delta = 1
            simulation_impact_summary = (
                "Useful information was unnecessarily blocked. "
                "Over-blocking creates community friction and distrust. (-8 community trust) [GAME SIMULATION]"
            )

    curr_comm_trust = community_state.get("community_trust", 100)
    curr_exposure = community_state.get("exposure", 0)
    curr_harm_prev = community_state.get("harm_prevented", 0)
    curr_harm_caused = community_state.get("harm_caused", 0)
    curr_safe = community_state.get("safe_decisions", 0)
    curr_unsafe = community_state.get("unsafe_decisions", 0)
    population = community_state.get("population", 1000)

    new_community_state = {
        "population": max(0, population),
        "community_trust": clamp(curr_comm_trust + comm_trust_delta, 0, 100),
        "exposure": max(0, curr_exposure + exposure_delta),
        "harm_prevented": max(0, curr_harm_prev + harm_prevented_delta),
        "harm_caused": max(0, curr_harm_caused + harm_caused_delta),
        "safe_decisions": max(0, curr_safe + safe_decisions_delta),
        "unsafe_decisions": max(0, curr_unsafe + unsafe_decisions_delta),
    }

    # ─────────────────────────────────────────────────────────────────────────
    # 3. AI Skepticism & AI Override Detection
    # ─────────────────────────────────────────────────────────────────────────
    ai_rec = (ai_recommendation or "").upper().strip()
    ai_override_success = False
    ai_override_message = ""
    ai_skepticism_delta = 0

    if ai_rec:
        if ai_rec != correct_action and player_action == correct_action:
            # Player challenged inaccurate AI recommendation and was right!
            ai_override_success = True
            ai_skepticism_delta = +5
            ai_override_message = "AI OVERRIDE SUCCESS: You correctly challenged the AI recommendation."
        elif ai_rec != correct_action and player_action == ai_rec:
            # Player blindly followed an inaccurate AI recommendation
            ai_skepticism_delta = -2
            ai_override_message = "BLIND AI RELIANCE: You followed an inaccurate AI recommendation."
        elif ai_rec == correct_action and player_action == correct_action:
            # Both were correct
            if len(investigations_done) >= 1:
                ai_skepticism_delta = +1
            ai_override_message = "CONSENSUS: Your forensic investigation confirmed the AI advisory."
        else:
            ai_override_message = f"AI recommended {ai_rec}, you selected {player_action}."

    # ─────────────────────────────────────────────────────────────────────────
    # 4. Trust DNA Update Rules (8 traits, each 0–100, deterministic)
    # ─────────────────────────────────────────────────────────────────────────
    dna_deltas: Dict[str, int] = {k: 0 for k in DNA_TRAITS}
    signals_text = " ".join(manipulation_signals).lower()
    scenario_content = scenario.get("content", "").lower()
    combined_text = f"{signals_text} {scenario_content}"

    # (a) Source Verification
    ran_source_check = "source_check" in investigations_done
    has_source_flag = any(k in combined_text for k in [
        "domain", "spoof", "sim", "vpa", "whois", "carrier", "impersonat", "unofficial", "voip"
    ])
    if ran_source_check and is_correct:
        dna_deltas["source_verification"] = +5
    elif has_source_flag and not ran_source_check and not is_correct:
        dna_deltas["source_verification"] = -4
    elif is_correct:
        dna_deltas["source_verification"] = +2
    else:
        dna_deltas["source_verification"] = -2

    # (b) Manipulation Detection
    if is_correct and is_harmful:
        dna_deltas["manipulation_detection"] = +5
    elif not is_correct and is_harmful:
        dna_deltas["manipulation_detection"] = -4
    elif is_correct:
        dna_deltas["manipulation_detection"] = +3
    else:
        dna_deltas["manipulation_detection"] = -2

    # (c) Emotional Manipulation
    has_emotional_flag = any(k in combined_text for k in [
        "emergency", "panic", "dad", "bhaiya", "hurry", "son", "hospital", "medicine", "save lives"
    ])
    if has_emotional_flag:
        dna_deltas["emotional_manipulation"] = +5 if is_correct else -4
    else:
        dna_deltas["emotional_manipulation"] = +2 if is_correct else -1

    # (d) Authority Bias
    has_authority_flag = any(k in combined_text for k in [
        "govt", "pm", "ugc", "police", "board", "axis", "council", "inspector", "icmr", "official"
    ])
    if has_authority_flag:
        if is_correct:
            dna_deltas["authority_bias"] = +5
        else:
            # Trusted fake authority or blocked genuine authority
            dna_deltas["authority_bias"] = -5
    else:
        dna_deltas["authority_bias"] = +1 if is_correct else -1

    # (e) Urgency Detection
    has_urgency_flag = any(k in combined_text for k in [
        "urgency", "urgent", "tonight", "closes", "hurry", "right now", "72 hours", "immediate"
    ])
    if has_urgency_flag:
        dna_deltas["urgency_detection"] = +5 if is_correct else -3
    else:
        dna_deltas["urgency_detection"] = +1 if is_correct else -1

    # (f) Visual Verification
    if content_type == "screenshot_image":
        ran_screenshot = "screenshot_analysis" in investigations_done
        if ran_screenshot and is_correct:
            dna_deltas["visual_verification"] = +6
        elif is_correct:
            dna_deltas["visual_verification"] = +3
        else:
            dna_deltas["visual_verification"] = -4
    else:
        dna_deltas["visual_verification"] = +1 if is_correct else 0

    # (g) AI Skepticism
    dna_deltas["ai_skepticism"] = ai_skepticism_delta

    # (h) Investigation Efficiency
    # Reward smart investigation without over-punishing thoroughness
    if is_correct:
        if credits_spent <= 6:
            dna_deltas["investigation_efficiency"] = +5  # Rapid accurate triage
        elif credits_spent <= 15:
            dna_deltas["investigation_efficiency"] = +3  # Balanced diligence
        else:
            dna_deltas["investigation_efficiency"] = +1  # Exhaustive, correct
    else:
        if credits_spent == 0:
            dna_deltas["investigation_efficiency"] = -4  # Blind snap judgment
        elif credits_spent > 15:
            dna_deltas["investigation_efficiency"] = -5  # Spent heavily and failed
        else:
            dna_deltas["investigation_efficiency"] = -3

    # Apply deltas and clamp to [0, 100]
    new_trust_dna: Dict[str, int] = {}
    for trait in DNA_TRAITS:
        curr_val = current_trust_dna.get(trait, 50)
        new_trust_dna[trait] = clamp(curr_val + dna_deltas[trait], 0, 100)

    # ─────────────────────────────────────────────────────────────────────────
    # 5. Determine Strongest & Weakest Skills
    # ─────────────────────────────────────────────────────────────────────────
    sorted_skills = sorted(new_trust_dna.items(), key=lambda x: x[1], reverse=True)
    strongest_skill = sorted_skills[0][0] if sorted_skills else "source_verification"
    weakest_skill = sorted_skills[-1][0] if sorted_skills else "ai_skepticism"

    return {
        "scenario_id": scenario["id"],
        "player_decision": player_action,
        "correct_action": correct_action,
        "ground_truth": ground_truth,
        "is_correct": is_correct,
        "verdict_label": verdict_label,
        "explanation": scenario.get("explanation", ""),
        "difficulty": difficulty,
        # Trust score
        "trust_points_delta": trust_points_delta,
        "new_trust_score": new_trust_score,
        # Community impact
        "community_trust_delta": comm_trust_delta,
        "exposure_delta": exposure_delta,
        "harm_prevented_delta": harm_prevented_delta,
        "harm_caused_delta": harm_caused_delta,
        "simulation_impact_summary": simulation_impact_summary,
        "new_community_state": new_community_state,
        # AI interaction
        "ai_recommendation": ai_rec if ai_rec else None,
        "ai_override_success": ai_override_success,
        "ai_override_message": ai_override_message,
        # Trust DNA
        "trust_dna_deltas": dna_deltas,
        "new_trust_dna": new_trust_dna,
        "strongest_skill": strongest_skill,
        "weakest_skill": weakest_skill,
    }
