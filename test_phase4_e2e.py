import sys, urllib.request, json
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def call(path, method='GET', data=None):
    url = f'http://localhost:8000/api/{path}'
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        body = json.dumps(data).encode()
    else:
        body = None
    with urllib.request.urlopen(req, data=body) as r:
        return json.loads(r.read())

print("=== TRUSTIQ PHASE 4 END-TO-END VERIFICATION ===")

# Reset
call('reset', 'POST')
print("[PASS] Reset successful")

# Health
h = call('health')
assert h['status'] == 'healthy'
print("[PASS] Health endpoint OK")

# AI status
ai_status = call('ai-status')
print(f"[INFO] AI mode: {ai_status['analysis_mode']} ({ai_status['note']})")

# Get scenarios
scenarios = call('scenarios')
sid = scenarios[0]['id']
title = scenarios[0]['title']
print(f"[INFO] Testing scenario: {sid} - {title}")

# Run Quick Scan
result = call('investigate', 'POST', {'scenario_id': sid, 'action_type': 'quick_scan'})
inv = result['investigation_result']

assert 'risk_score' in inv
assert 'confidence' in inv
assert 'status' in inv
assert 'claim' in inv
assert 'signals' in inv
assert 'evidence' in inv
assert 'uncertainty' in inv
assert 'recommended_action' in inv
assert 'reasoning' in inv
assert 'analysis_source' in inv
assert 'external_verification' in inv

assert 0 <= inv['risk_score'] <= 100
assert 0 <= inv['confidence'] <= 100
assert inv['status'] in {'LIKELY_SAFE', 'UNVERIFIED', 'SUSPICIOUS', 'POTENTIAL_THREAT'}
assert inv['recommended_action'] in {'ALLOW', 'VERIFY', 'HOLD', 'CONTAIN', 'ESCALATE'}
assert inv['analysis_source'] in {'AI', 'FALLBACK'}

print(f"[PASS] Investigation result structure valid")
print(f"  analysis_source:    {inv['analysis_source']}")
print(f"  risk_score:         {inv['risk_score']}/100")
print(f"  status:             {inv['status']}")
print(f"  confidence:         {inv['confidence']}%")
print(f"  recommended_action: {inv['recommended_action']}")
print(f"  signals detected:   {len(inv['signals'])}")
print(f"  credits remaining:  {result['remaining_credits']}")

# Ground truth still hidden
s = call(f'scenarios/{sid}')
assert s['ground_truth'] == 'HIDDEN', f"SECURITY FAILURE: ground_truth leaked: {s['ground_truth']}"
assert s['correct_action'] == 'HIDDEN', f"SECURITY FAILURE: correct_action leaked: {s['correct_action']}"
print("[PASS] Ground truth correctly hidden from frontend")

print()
print(">>> PHASE 4 VERIFICATION COMPLETE <<<")
