import urllib.request
import json

def api_call(path, method='GET', data=None):
    url = f"http://localhost:8000/api/{path}"
    req = urllib.request.Request(url, method=method)
    if data is not None:
        req.add_header('Content-Type', 'application/json')
        body = json.dumps(data).encode('utf-8')
    else:
        body = None
    with urllib.request.urlopen(req, data=body) as res:
        return json.loads(res.read().decode('utf-8'))

print("=== TRUSTIQ PHASE 2 CORE GAME ENGINE INTEGRATION AUDIT ===")

# Reset first to clean state
api_call("reset", method="POST")

# 1. Verify Initial Player State
player = api_call("player")
print(f"[TEST 1] Initial Player State:")
print(f"  • Trust Score: {player['trust_score']} (Expected: 0)")
print(f"  • Credits: {player['investigation_credits']} (Expected: 30)")
print(f"  • Community Pop: {player['community_population']} (Expected: 1000)")
print(f"  • Community Trust: {player['community_trust']}% (Expected: 100)")
print(f"  • Community Exposure: {player['community_exposure']} (Expected: 0)")
assert player['trust_score'] == 0
assert player['investigation_credits'] == 30
assert player['community_population'] == 1000
assert player['community_trust'] == 100
assert player['community_exposure'] == 0
print("  => PASS: Player state exactly matches Phase 2 spec!")

# 2. Verify Scenarios
scenarios = api_call("scenarios")
print(f"\n[TEST 2] Scenarios Retrieval:")
print(f"  • Total Scenarios: {len(scenarios)} (Required: >= 6)")
assert len(scenarios) >= 6

scenario_titles = [s['title'] for s in scenarios]
for s in scenarios:
    assert s['ground_truth'] == "HIDDEN", f"Ground truth leaked for {s['id']}"
    assert s['correct_action'] == "HIDDEN", f"Correct action leaked for {s['id']}"
    print(f"  • [{s['difficulty']}] {s['id']}: {s['content_type']} - Ground truth: {s['ground_truth']}")

# Check required scenario types
assert any("UPI" in t for t in scenario_titles), "Missing UPI Scam scenario"
assert any("Government" in t or "Laptop" in t for t in scenario_titles), "Missing Government Scheme scenario"
assert any("College" in t or "Exam" in t for t in scenario_titles), "Missing Fake College Announcement"
assert any("Health" in t or "Guava" in t for t in scenario_titles), "Missing Health Claim scenario"
assert any("Voice" in t for t in scenario_titles), "Missing Voice Message scenario"
assert any("Screenshot" in t for t in scenario_titles), "Missing Manipulated Screenshot scenario"
print("  => PASS: All 6 required scenario categories present & ground truths hidden!")

# 3. Investigation Deductions
print(f"\n[TEST 3] Investigation Credits Logic:")
# Quick Scan on scenario-1 (Cost: 3)
inv1 = api_call("investigate", method="POST", data={"scenario_id": "scenario-1", "action_type": "quick_scan"})
assert inv1['credits_deducted'] == 3
assert inv1['remaining_credits'] == 27
print(f"  • Quick Scan (Cost 3): Remaining = {inv1['remaining_credits']} CR")

# Source Check on scenario-1 (Cost: 6)
inv2 = api_call("investigate", method="POST", data={"scenario_id": "scenario-1", "action_type": "source_check"})
assert inv2['credits_deducted'] == 6
assert inv2['remaining_credits'] == 21
print(f"  • Source Check (Cost 6): Remaining = {inv2['remaining_credits']} CR")

# Deep Investigation on scenario-2 (Cost: 15)
inv3 = api_call("investigate", method="POST", data={"scenario_id": "scenario-2", "action_type": "deep_investigation"})
assert inv3['credits_deducted'] == 15
assert inv3['remaining_credits'] == 6
print(f"  • Deep Investigation (Cost 15): Remaining = {inv3['remaining_credits']} CR")

# Attempt action requiring 10 credits when only 6 remain
insufficient_blocked = False
try:
    api_call("investigate", method="POST", data={"scenario_id": "scenario-5", "action_type": "voice_analysis"})
except urllib.error.HTTPError as e:
    if e.code == 400:
        insufficient_blocked = True
        print(f"  • Insufficient credits blocked properly (HTTP 400: {e.reason})")
assert insufficient_blocked, "Failed to block investigation when credits were insufficient"
print("  => PASS: Investigation credit costs deducted & insufficient credits prevented!")

# 4. Decision & Consequence Scoring
print(f"\n[TEST 4] Executive Decision & Consequence Scoring:")
# Correct CONTAIN on UPI Scam (scenario-1)
dec1 = api_call("decide", method="POST", data={"scenario_id": "scenario-1", "decision": "CONTAIN"})
print(f"  • Scenario-1 Decision: CONTAIN")
print(f"    - Is Correct: {dec1['is_correct']}")
print(f"    - Trust Points Delta: +{dec1['trust_points_delta']}")
print(f"    - Community Exposure: {dec1['community_exposure_delta']}")
print(f"    - New Trust Score: {dec1['updated_player']['trust_score']}")
assert dec1['is_correct'] == True
assert dec1['trust_points_delta'] > 0
assert dec1['community_exposure_delta'] == 0

# Duplicate decision block test:
dup_blocked = False
try:
    api_call("decide", method="POST", data={"scenario_id": "scenario-1", "decision": "ALLOW"})
except urllib.error.HTTPError as e:
    if e.code == 400:
        dup_blocked = True
        print(f"  • Duplicate decision blocked properly (HTTP 400: Only one final decision per scenario permitted)")
assert dup_blocked, "Failed to enforce one-decision-per-scenario rule!"

# Incorrect ALLOW on Government Scam (scenario-2)
dec2 = api_call("decide", method="POST", data={"scenario_id": "scenario-2", "decision": "ALLOW"})
print(f"\n  • Scenario-2 Decision: ALLOW (Incorrectly allowed harmful content)")
print(f"    - Is Correct: {dec2['is_correct']}")
print(f"    - Trust Points Delta: {dec2['trust_points_delta']}")
print(f"    - Community Exposure Delta: +{dec2['community_exposure_delta']} (Citizens compromised!)")
print(f"    - Community Trust Delta: {dec2['community_trust_delta']}%")
assert dec2['is_correct'] == False
assert dec2['trust_points_delta'] < 0
assert dec2['community_exposure_delta'] > 0
assert dec2['community_trust_delta'] < 0
print("  => PASS: Scoring rules, exposure penalties, and single-decision enforcement all verified!")

# 5. Results & Audit Logs
results = api_call("results")
print(f"\n[TEST 5] Results Audit Trail:")
print(f"  • Total Decisions: {results['total_decisions']}")
print(f"  • Correct Decisions: {results['correct_decisions']}")
print(f"  • Accuracy Rate: {results['accuracy_rate']}%")
print(f"  • Current Player Trust Score: {results['player']['trust_score']}")
print(f"  • Current Community Exposure: {results['player']['community_exposure']}")
assert results['total_decisions'] == 2

print("\n>>> ALL PHASE 2 CORE GAME ENGINE SPECIFICATIONS VERIFIED 100%! <<<")
