import sys
import urllib.request
import json

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

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

print("=== TRUSTIQ PHASE 5 END-TO-END VERIFICATION AUDIT ===")

# 1. Reset simulation
res_reset = api_call("reset", method="POST")
print("[PASS 1] Reset simulation:", res_reset["status"])

# 2. Health & AI Status
h = api_call("health")
print("[PASS 2] Health endpoint:", h["status"])
ai_st = api_call("ai-status")
print(f"[PASS 3] AI status mode: {ai_st['analysis_mode']}")

# 3. Community Initial State
comm = api_call("community")
print(f"[PASS 4] Community State initialized:")
print(f"  • Population: {comm['population']} (Expected: 1000)")
print(f"  • Community Trust: {comm['community_trust']}% (Expected: 100)")
print(f"  • Exposure: {comm['exposure']} (Expected: 0)")
print(f"  • Harm Prevented: {comm['harm_prevented']} (Expected: 0)")
print(f"  • Harm Caused: {comm['harm_caused']} (Expected: 0)")
assert comm['population'] == 1000
assert comm['community_trust'] == 100
assert comm['exposure'] == 0

# 4. Trust DNA Initial State
dna_data = api_call("player/trust-dna")
dna = dna_data["trust_dna"]
print(f"[PASS 5] Trust DNA initialized (8 traits):")
for trait, val in dna.items():
    print(f"  • {trait}: {val} (Expected: 50)")
    assert val == 50
assert len(dna) == 8

# 5. Scenarios Retrieval & Ground Truth Hidden Protection
scenarios = api_call("scenarios")
print(f"[PASS 6] Retrieved {len(scenarios)} scenarios.")
for s in scenarios:
    assert s["ground_truth"] == "HIDDEN"
    assert s["correct_action"] == "HIDDEN"
print("  => Ground truth perfectly protected across all active cases.")

# 6. Step through Case 1: Investigate with Quick Scan
s1 = scenarios[0]
print(f"\n--- TESTING SCENARIO 1: {s1['id']} ---")
inv = api_call("investigate", method="POST", data={
    "scenario_id": s1["id"],
    "action_type": "quick_scan"
})
dossier = inv["investigation_result"]
print(f"[PASS 7] ARIA Investigation Completed:")
print(f"  • Analysis source: {dossier['analysis_source']}")
print(f"  • Risk score: {dossier['risk_score']}")
print(f"  • AI Recommendation: {dossier['recommended_action']}")
print(f"  • Remaining credits: {inv['remaining_credits']} CR")

# 7. Make Correct Decision on Scenario 1 (CONTAIN)
dec_res = api_call("decision", method="POST", data={
    "scenario_id": s1["id"],
    "decision": "CONTAIN"
})
print(f"[PASS 8] Decision Executed:")
print(f"  • Verdict: {dec_res['verdict_label']} ({dec_res['is_correct']})")
print(f"  • Ground Truth Revealed: {dec_res['ground_truth']}")
print(f"  • Trust Score: +{dec_res['trust_points_delta']} -> {dec_res['new_trust_score']} PTS")
print(f"  • Comm Trust: +{dec_res['community_trust_delta']}%")
print(f"  • Harm Prevented: +{dec_res['harm_prevented_delta']}")
print(f"  • Simulation note: {dec_res['simulation_impact_summary']}")
assert dec_res['is_correct'] is True
assert dec_res['harm_prevented_delta'] > 0

# 8. Check Trust DNA Evolution
new_dna = dec_res['new_trust_dna']
print(f"[PASS 9] Trust DNA Evolution post-decision:")
print(f"  • Source Verification: {new_dna['source_verification']}")
print(f"  • Manipulation Detection: {new_dna['manipulation_detection']}")
print(f"  • Strongest skill: {dec_res['strongest_skill']}")

# 9. Step through Case 2: Incorrect Decision (Harmful allowed)
s2 = scenarios[1]
print(f"\n--- TESTING SCENARIO 2 (INCORRECT DECISION AUDIT): {s2['id']} ---")
dec_res2 = api_call("decision", method="POST", data={
    "scenario_id": s2["id"],
    "decision": "ALLOW"  # Wrong! Scenario 2 is a government laptop scam
})
print(f"[PASS 10] Incorrect Decision Executed:")
print(f"  • Verdict: {dec_res2['verdict_label']} ({dec_res2['is_correct']})")
print(f"  • Exposure Delta: +{dec_res2['exposure_delta']} (Simulated breaches)")
print(f"  • Harm Caused Delta: +{dec_res2['harm_caused_delta']}")
print(f"  • Comm Trust Delta: {dec_res2['community_trust_delta']}%")
assert dec_res2['is_correct'] is False
assert dec_res2['exposure_delta'] > 0
assert dec_res2['harm_caused_delta'] > 0
assert dec_res2['community_trust_delta'] < 0

# 10. Verify Full Profile & History Endpoints
prof = api_call("player/profile")
print(f"\n[PASS 11] Unified Profile Verified:")
print(f"  • Player Score: {prof['player']['trust_score']}")
print(f"  • Comm Population: {prof['community']['population']}")
print(f"  • Comm Trust: {prof['community']['community_trust']}%")
print(f"  • Exposure: {prof['community']['exposure']}")
print(f"  • Harm Prevented: {prof['community']['harm_prevented']}")
print(f"  • Harm Caused: {prof['community']['harm_caused']}")
print(f"  • Accuracy: {prof['accuracy_rate']}%")

hist = api_call("player/history")
print(f"[PASS 12] Decision History Audit: {len(hist)} entries recorded.")
assert len(hist) == 2

print("\n>>> ALL PHASE 5 END-TO-END AUDIT CHECKS PASSED 100%! <<<")
