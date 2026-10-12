import urllib.request
import json

def test_endpoint(name, url, method='GET', data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        body = json.dumps(data).encode('utf-8')
    else:
        body = None
    with urllib.request.urlopen(req, data=body) as res:
        code = res.getcode()
        payload = json.loads(res.read().decode('utf-8'))
        print(f"[PASS] {name} (HTTP {code})")
        return payload

if __name__ == '__main__':
    print("=== TRUSTIQ PHASE 1 INTEGRATION AUDIT ===")

    # 1. Health Check
    health = test_endpoint("Health Check", "http://localhost:8000/api/health")
    print("  Backend:", health["service"], "|", health["tagline"])

    # 2. Session Stats
    session = test_endpoint("Session Stats", "http://localhost:8000/api/session")
    print(f"  Level: {session.get('player_level', session.get('level', 1))} | Trust: {session['community_trust']}% | Credits: {session['investigation_credits']} | Exposure: {session['community_exposure']}")

    # 3. Scenarios List
    scenarios = test_endpoint("Scenarios Retrieval", "http://localhost:8000/api/scenarios")
    print(f"  Total Scenarios Intercepted: {len(scenarios)}")
    for s in scenarios:
        print(f"   • [{s['category_label']}] '{s['title']}' from {s['sender']} (Risk Score: {s['risk_score']}%)")

    # 4. Investigate Endpoint
    inv = test_endpoint("Investigation Operation", "http://localhost:8000/api/investigate", method="POST", data={"scenario_id": "scenario-1", "is_deep": False})
    print(f"  AI Investigation on {inv['id']}: Claim='{inv['claim'][:40]}...' | Remaining Credits={inv['remaining_credits']}")

    # 5. Executive Decision Endpoint
    dec = test_endpoint("Decision Record (BLOCK)", "http://localhost:8000/api/decide", method="POST", data={"scenario_id": "scenario-1", "decision": "BLOCK"})
    print(f"  Verdict: {dec['verdict']} | Accurate: {dec['is_correct']} | Trust Delta: +{dec['trust_delta']}% | XP: +{dec['xp_delta']}")

    # 6. Results Endpoint
    results = test_endpoint("Audit Results", "http://localhost:8000/api/results")
    print(f"  Audit Logs Count: {len(results['decision_logs'])} | Accuracy Rate: {results['accuracy_rate']}%")

    # 7. Trust DNA Endpoint
    dna = test_endpoint("Trust DNA Synthesis", "http://localhost:8000/api/trust-dna")
    print(f"  Cognitive Archetype: {dna['archetype']} ({dna['tagline']})")

    # 8. Frontend HTML & Bundling Check
    with urllib.request.urlopen("http://localhost:5173") as frontend_res:
        html = frontend_res.read().decode('utf-8')
        assert "<title>TRUSTIQ" in html
        assert "id=\"root\"" in html
        print("[PASS] Frontend Dev Server responding at http://localhost:5173 (HTTP 200)")

    print("\n>>> ALL PHASE 1 INTEGRATION TESTS PASSED WITH 0 ERRORS! <<<")

