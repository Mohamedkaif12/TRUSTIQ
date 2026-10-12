# TRUSTIQ — TRUST WAR
> *"Pause. Investigate. Decide."*

An AI + ML powered serious game that trains human decision-makers to evaluate suspicious, deceptive, and potentially fraudulent digital information online.

[![Tests](https://img.shields.io/badge/pytest-79%20passed-brightgreen.svg)](file:///f:/PROJECTS/TRUSTIQ/backend/tests)
[![Frontend](https://img.shields.io/badge/TypeScript-0%20errors-blue.svg)](file:///f:/PROJECTS/TRUSTIQ)
[![ML](https://img.shields.io/badge/RandomForest-92.3%25%20Accuracy-orange.svg)](file:///f:/PROJECTS/TRUSTIQ/backend/ml)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 🌟 The Core Philosophy
**"AI INVESTIGATES. HUMAN DECIDES."**

Most automated systems try to tell users what to believe. **TRUSTIQ trains users how to decide what to believe.**
- **Risk != Truth**: High risk means statistical & behavioral warning patterns, not objective falsity.
- **Suspicious != False**: A genuine municipal water maintenance notice can appear urgent without being fraudulent.
- **Unverified != False**: Lack of official proof warrants caution (`HOLD` or `VERIFY`), not immediate condemnation.
- **AI != Final Authority**: The human player can disagree with and override AI suggestions. Correctly overriding flawed AI recommendations rewards the player with **AI Skepticism** cognitive traits.

---

## 🔄 Complete Game Loop

```text
INCOMING INFORMATION
        ↓
FEATURE EXTRACTION (23 Deterministic Behavioral & Linguistic Features)
        ↓
STATISTICAL ANALYSIS (Z-Score Anomaly Engine: Z = (x - μ) / σ)
        ↓
ML RISK PREDICTION (Trained Random Forest Classifier → 0-100 Risk Score & Class)
        ↓
NOVA INVESTIGATION ASSISTANT (Contextual Dossier, Signals, Uncertainty, Advisory)
        ↓
OFFICIAL EVIDENCE REGISTRY (Cross-checks against Govt/RBI/CERT-In/Fact-Check Databases)
        ↓
HUMAN EXECUTIVE DECISION (ALLOW | VERIFY | HOLD | CONTAIN | ESCALATE)
        ↓
COMMUNITY SIMULATION IMPACT (Harm Prevented, Harm Caused, Civic Trust Delta)
        ↓
TRUST DNA SYNTHESIS (8-Dimensional Cognitive Radar Calibration)
        ↓
ADAPTIVE NEXT CHALLENGE (Weakness-targeted scenario selection)
```

---

## 🧠 Algorithmic Architecture & Separation of Concerns

TRUSTIQ does **not** force a single model to solve every problem. Different algorithms handle distinct responsibilities:

| Algorithm / Component | Core Responsibility | Why Selected |
| :--- | :--- | :--- |
| **Statistical Engine (Z-Score)** | Anomaly detection against communication baselines | Computes exact mathematical deviation `Z = (x - μ) / σ` for urgency, emotional pressure, caps, and punctuation without asserting subjective falsehood. |
| **Machine Learning (Random Forest)** | Structural risk pattern classification (`LOW`, `MEDIUM`, `HIGH`) | Learns non-linear interactions across 23 deterministic features with balanced class weights, robust against overfitting and highly interpretable. |
| **Generative AI (NOVA Assistant)** | Contextual reasoning, semantic claims, and uncertainty | Understands nuanced human intent, explains why signals were flagged, and structures investigation dossiers. |
| **Official Evidence Registry** | Factual corroboration | Directly verifies against official government, banking, and institutional sources without fabricating external queries. |
| **Rule-Based Consequence Engine** | Deterministic simulation consequences | Ensures transparent, predictable civic exposure calculations, harm prevention scoring, and credit accounting. |
| **Adaptive Gameplay Engine** | Skill-based challenge progression | Analyzes Trust DNA weaknesses and performance history to dynamically present targeted training missions. |
| **Human Guardian** | Executive decision-maker | Holds the final operational authority (`ALLOW`, `VERIFY`, `HOLD`, `CONTAIN`, `ESCALATE`). |

---

## 📊 Statistical Algorithm — Z-Score Anomaly Engine

Detects unusually extreme deviations in message linguistic and structural features:

$$\mathbf{Z} = \frac{x - \mu}{\sigma}$$

Where:
- $x$ = Current feature value
- $\mu$ = Baseline communication mean
- $\sigma$ = Baseline standard deviation

### Calibrated Thresholds:
- $|Z| < 1.0$: **NORMAL** — Within standard everyday variance.
- $1.0 \le |Z| < 2.0$: **SLIGHTLY UNUSUAL** — Minor statistical elevation.
- $2.0 \le |Z| < 3.0$: **UNUSUAL** — Elevated statistical anomaly.
- $|Z| \ge 3.0$: **HIGHLY UNUSUAL** — Extreme statistical outlier.

> ⚠️ **Statistical Disclaimer**: Z-score measures atypical phrasing or urgency density relative to baseline distributions. It is never presented as proof of misinformation or criminality.

---

## 🌲 Machine Learning — Random Forest Classifier

- **Algorithm**: `RandomForestClassifier(n_estimators=150, random_state=42, class_weight='balanced')`
- **Library**: `scikit-learn`, `joblib`, `numpy`
- **Output**: Calibrated **Risk Score** (0–100), **Risk Class** (`LOW`, `MEDIUM`, `HIGH`), **Confidence Percentage**, and **Top Predictive Feature Contributors**.

### 23 Deterministic Features Extracted:
1. `urgency_score`: Frequency of urgency keywords (immediate, act now, expire, etc.)
2. `financial_request`: Payment hooks, UPI, transfers, refunds, cashbacks
3. `fear_score`: Threats of arrest, police, legal action, account block, FIR
4. `anger_score`: Outrage and grievance triggers
5. `emotional_pressure`: Aggregate psychological pressure index
6. `authority_claim`: Mentions of RBI, Income Tax, CBI, Ministries, Police, Universities
7. `impersonation_signal`: Generic/unverified sender addresses claiming official authority
8. `suspicious_url`: IP address links, URL shorteners, suspicious TLDs (`.xyz`, `.buzz`, `.top`)
9. `account_threat`: Impending suspension, deactivation, or freezing
10. `social_pressure`: Viral chain forward requests ("forward to 15 people")
11. `forced_action`: "Click immediately", "download APK", "dial number"
12. `reward_claim`: Unsolicited lotteries, contest wins, cash prizes
13. `unusual_request`: Demands for secrecy, remote desktop tools (`AnyDesk`)
14. `request_for_credentials`: Passwords, PINs, CVVs, card numbers
15. `request_for_otp`: Requests for One-Time Passwords
16. `request_for_payment`: Direct transfers or registration charges
17. `external_link`: Presence of URLs and web links
18. `excessive_punctuation`: Density of exclamation marks and question marks
19. `excessive_caps`: Proportion of uppercase characters
20. `time_pressure`: Strict deadlines ("today only", "within 2 hours")
21. `source_available`: Clear sender attribution vs anonymous sender
22. `source_consistency`: Alignment between claimed institution and communication channel
23. `claim_specificity`: Presence of concrete dates, circular numbers, reference codes

### Holdout Test Evaluation:
- **Test Accuracy**: **92.31%**
- **Macro Precision**: **94.44%**
- **Macro Recall**: **83.33%**
- **Macro F1-Score**: **85.86%**
- **Top Predictive Feature**: `excessive_caps` & `urgency_score`

---

## 🤖 NOVA — Investigation Assistant

NOVA receives the original message, extracted feature vectors, Z-score anomalies, Random Forest probabilities, and available evidence.

Returns structured JSON:
```json
{
  "claim": "Summary of core factual claim",
  "risk_score": 88,
  "confidence": 92,
  "status": "POTENTIAL_THREAT",
  "signals": [
    {
      "type": "Urgency Language",
      "severity": "HIGH",
      "explanation": "Immediate 24-hour disconnection threat"
    }
  ],
  "evidence": [
    "State Electricity Department officially disallows WhatsApp payment demands."
  ],
  "uncertainty": "Sender identity cannot be cryptographically verified from SMS alone.",
  "recommended_action": "CONTAIN",
  "reasoning": "The message combines artificial urgency with financial demands. Final decision belongs to the player."
}
```

---

## 🛡️ Digital Guardian & Community Simulation

### Digital Guardian Progression:
- **Callsigns**: Customizable tactical callsign (`Agent Commander`, etc.)
- **Avatars**: 4 Humanoid Cyberpunk Avatars (`AGENT`, `SCOUT`, `ANALYST`, `DEFENDER`) with glowing cybernetic visors and helmets.
- **Ranks**:
  1. *Rookie Guardian* (0–99 XP)
  2. *Signal Scout* (100–249 XP)
  3. *Threat Analyst* (250–499 XP)
  4. *Trust Guardian* (500–999 XP)
  5. *TRUSTIQ Commander* (1000+ XP)
- **Investigation Credits**: 30 starting credits. Tiered tool costs:
  - Quick Scan: **3 CR**
  - Source Check: **6 CR**
  - Screenshot Analysis: **8 CR**
  - Voice Analysis: **10 CR**
  - Deep Investigation: **15 CR**

### Simulated Community State:
- **Population**: 1,000 citizens
- **Community Trust**: 0–100% civic confidence
- **Simulated Exposure**: Citizens reached by uncontained misinformation
- **Harm Prevented**: Citizens safeguarded by timely containment
- **Harm Caused**: Harm accrued when malicious payloads are allowed

---

## 🧬 Trust DNA (8 Cognitive Dimensions)

Calibrated deterministically from 0 to 100 with radar visualization:
1. **Source Verification**: Domain spoofing, sender consistency, registry checks.
2. **Manipulation Detection**: Detecting financial traps and deceptive lures.
3. **Emotional Manipulation**: Defending against panic triggers and fear narratives.
4. **Authority Bias**: Scrutinizing impersonated institutions, ministries, and banks.
5. **Urgency Detection**: Identifying artificial time scarcity and pressure tactics.
6. **Visual Verification**: Inspecting tampering, compression noise, and screenshot artefacts.
7. **AI Skepticism**: Challenging AI recommendations (+5 XP & badge for AI Override Success).
8. **Investigation Efficiency**: Reaching accurate verdicts with minimal credit waste.

---

## 🔬 Mode 2: Real-World Investigation Lab

In **Real Investigation Mode**, users can test **any** incoming message (custom text, suspicious forward, email, SMS).
- Operates on real-world inputs with **no hidden ground truth assumptions**.
- Executes the full pipeline:
  `Input Message → Feature Extraction → Z-Score Anomaly Engine → Random Forest → NOVA → Evidence Verification`.
- Includes built-in **Prompt Injection Defense** that sanitizes malicious instructions (e.g. `ignore previous instructions`).

---

## 🚀 Quickstart & Installation

### Prerequisites:
- Python 3.10+
- Node.js 18+

### 1. Clone & Setup Backend:
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Train the Random Forest Model
python ml/train_model.py

# Start Backend Server
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Setup Frontend:
```bash
# In project root
npm install

# Start Vite dev server
npm run dev
```

### 3. Run Automated Tests:
```bash
# Run all 79 unit, integration, and algorithmic tests
python -m pytest backend/tests -v
```

---

## 📡 Complete API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/game/start` | Initialize/load active game session |
| `GET` | `/api/scenarios` | Intercepted incident triage queue (ground truth hidden) |
| `GET` | `/api/scenarios/{id}` | Scenario detail (ground truth hidden until decided) |
| `POST` | `/api/investigate` | Execute forensic investigation tier (deducts credits) |
| `POST` | `/api/ml/predict` | Run Random Forest risk prediction on arbitrary text |
| `POST` | `/api/statistics/analyze` | Execute Z-score statistical anomaly analysis |
| `POST` | `/api/evidence/verify` | Cross-reference claims with official registries |
| `POST` | `/api/real-investigation` | Full Mode 2 Arbitrary Ingestion Forensic Pipeline |
| `POST` | `/api/decision` | Issue player verdict (`ALLOW`, `VERIFY`, `HOLD`, `CONTAIN`, `ESCALATE`) |
| `GET` | `/api/player` | Digital Guardian telemetry, XP, rank, level, avatar |
| `GET` | `/api/community` | Live civic simulation state |
| `GET` | `/api/player/trust-dna` | 8-trait cognitive radar profile |
| `POST` | `/api/next-challenge` | Adaptive gameplay skill-targeted scenario recommendation |
| `POST` | `/api/guardian/create` | Customize Guardian callsign and avatar style |
| `GET` | `/api/guardian/achievements` | Unlocked achievements and badges |
| `GET` | `/api/guardian/missions` | Active missions and XP rewards |
| `POST` | `/api/reset` | Clean simulation reset to starting parameters |

---

## 🏛️ Responsible AI Statement

> *"TRUSTIQ is an educational decision-training game. AI and ML risk assessments identify patterns and uncertainty; they do not independently establish factual truth, criminality, or intent."*

---

## 📜 Demo Walkthrough (3–5 Minutes)

1. **Open Command Center** (`http://localhost:5173`): Observe 1,000 community members, 30 credits, Rookie Guardian rank, and Cyberpunk Guardian avatar.
2. **Review Incident Queue**: Intercept an urgent electricity bill disconnection notice.
3. **Run Quick Scan**: Spend 3 Credits to activate NOVA.
4. **Inspect Hybrid Intelligence**:
   - Random Forest flags **High Risk (90/100)**.
   - Z-Score flags **Urgency Anomaly (Z = 4.33)**.
   - Official Evidence Registry confirms state discom advisory contradiction.
5. **Issue Human Decision**: Choose `CONTAIN`.
6. **Review Consequence Report**: Observe harm prevented, civic trust boost, and Trust DNA improvements.
7. **Experience AI Override**: In a subtle scenario, observe NOVA's recommendation, exercise independent human judgment to override, and unlock **AI OVERRIDE SUCCESS** (+5 AI Skepticism).
8. **Switch to Mode 2 (Real Lab)**: Ingest an arbitrary real-world message with full multi-algorithm breakdown and prompt injection defense.
