"""
TRUSTIQ — Deterministic Feature Extraction Engine
Extracts 23 behavioral, linguistic, and structural signals from text and metadata.
Guarantees strict schema consistency between training, testing, and live inference.
"""

import re
from typing import Dict, Any, List

# Ordered list of all 23 ML features
FEATURE_SCHEMA: List[str] = [
    "urgency_score",
    "financial_request",
    "fear_score",
    "anger_score",
    "emotional_pressure",
    "authority_claim",
    "impersonation_signal",
    "suspicious_url",
    "account_threat",
    "social_pressure",
    "forced_action",
    "reward_claim",
    "unusual_request",
    "request_for_credentials",
    "request_for_otp",
    "request_for_payment",
    "external_link",
    "excessive_punctuation",
    "excessive_caps",
    "time_pressure",
    "source_available",
    "source_consistency",
    "claim_specificity"
]

# Linguistic trigger vocabularies
URGENCY_KEYWORDS = [
    "urgent", "immediately", "hurry", "act now", "immediate", "instantly", 
    "expires", "expiring", "last chance", "final notice", "within 24 hours",
    "within 2 hours", "within 15 minutes", "don't delay", "right now", "emergency"
]

FINANCIAL_KEYWORDS = [
    "upi", "refund", "cashback", "payment", "rupees", "rs.", "inr", "bank", 
    "account", "credit", "debit", "wallet", "transfer", "bonus", "reward", 
    "prize", "lottery", "deposit", "crypto", "bitcoin", "loan", "kyc"
]

FEAR_KEYWORDS = [
    "blocked", "suspended", "deactivated", "arrest", "fir", "police", "court",
    "legal action", "penalty", "fine", "jail", "terminated", "frozen", "danger",
    "disaster", "seized", "investigation"
]

ANGER_KEYWORDS = [
    "corrupt", "scam", "cheat", "traitor", "outrage", "exposed", "conspiracy",
    "shameful", "boycott", "protest", "riot", "destroy", "fraudulent"
]

AUTHORITY_KEYWORDS = [
    "rbi", "reserve bank", "income tax", "ministry", "government", "govt",
    "police", "cbi", "sbi", "hdfc", "icici", "uidai", "aadhaar", "dept",
    "director", "dean", "registrar", "university", "official notice"
]

IMPERSONATION_KEYWORDS = [
    "support desk", "customer care", "helpdesk", "admin team", "executive officer",
    "system admin", "security team", "bank manager", "official representative"
]

CREDENTIAL_KEYWORDS = [
    "password", "pin", "cvv", "card number", "expiry date", "netbanking password",
    "secret answer", "passcode"
]

OTP_KEYWORDS = [
    "otp", "one time password", "verification code", "security code", "6-digit code"
]

SUSPICIOUS_TLDS = [".xyz", ".top", ".work", ".click", ".link", ".buzz", ".live", ".fit", ".icu", ".gq", ".cf", ".tk", ".ml"]
URL_SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly", "cutt.ly"]

def extract_features(text: str, sender: str = "", metadata: Dict[str, Any] = None) -> Dict[str, float]:
    """
    Deterministically computes the 23 ML feature vector for given text and sender metadata.
    Returns a dictionary of {feature_name: float_value}.
    """
    if not text:
        text = ""
    lower_text = text.lower()
    lower_sender = (sender or "").lower()
    meta = metadata or {}

    total_chars = max(len(text), 1)
    words = re.findall(r'\b\w+\b', lower_text)
    word_count = max(len(words), 1)

    # 1. Urgency score (count of distinct urgency phrases)
    urgency_count = sum(1 for kw in URGENCY_KEYWORDS if kw in lower_text)
    urgency_score = float(min(urgency_count, 10))

    # 2. Financial request
    fin_count = sum(1 for kw in FINANCIAL_KEYWORDS if kw in lower_text)
    financial_request = 1.0 if fin_count >= 2 else (0.5 if fin_count == 1 else 0.0)

    # 3. Fear score
    fear_count = sum(1 for kw in FEAR_KEYWORDS if kw in lower_text)
    fear_score = float(min(fear_count, 8))

    # 4. Anger score
    anger_count = sum(1 for kw in ANGER_KEYWORDS if kw in lower_text)
    anger_score = float(min(anger_count, 6))

    # 5. Emotional pressure index (combined psychological load)
    emotional_pressure = float(min(urgency_score * 0.4 + fear_score * 0.4 + anger_score * 0.2, 10.0))

    # 6. Authority claim
    auth_matches = sum(1 for kw in AUTHORITY_KEYWORDS if kw in lower_text or kw in lower_sender)
    authority_claim = 1.0 if auth_matches >= 1 else 0.0

    # 7. Impersonation signal (claims authority or support while sender is ambiguous or generic)
    impers_kw = sum(1 for kw in IMPERSONATION_KEYWORDS if kw in lower_text)
    has_unverified_sender = any(domain in lower_sender for domain in ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com"]) or lower_sender.startswith("+91") or lower_sender.isdigit()
    impersonation_signal = 1.0 if (authority_claim and has_unverified_sender) or (impers_kw >= 1) else 0.0

    # 8. Suspicious URL detection
    urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', lower_text)
    has_suspicious_url = 0.0
    for u in urls:
        if any(tld in u for tld in SUSPICIOUS_TLDS):
            has_suspicious_url = 1.0
            break
        if any(sh in u for sh in URL_SHORTENERS):
            has_suspicious_url = 1.0
            break
        # IP address URL (e.g., http://192.168.1.1 or http://103.21.x.x)
        if re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', u):
            has_suspicious_url = 1.0
            break
    suspicious_url = has_suspicious_url

    # 9. Account threat
    account_threat = 1.0 if any(kw in lower_text for kw in ["account blocked", "account suspended", "card blocked", "sim deactivated", "deactivation"]) else 0.0

    # 10. Social pressure
    social_pressure = 1.0 if any(kw in lower_text for kw in ["forward to", "share with 10", "viral", "everyone is sharing", "don't ignore", "must share"]) else 0.0

    # 11. Forced action
    forced_action = 1.0 if any(kw in lower_text for kw in ["click here immediately", "call now", "install this", "dial *", "download apk", "tap link"]) or (urgency_score >= 2 and len(urls) >= 1) else 0.0

    # 12. Reward claim
    reward_claim = 1.0 if any(kw in lower_text for kw in ["lottery", "congratulations you won", "cash prize", "free recharge", "selected for bonus", "claim reward"]) else 0.0

    # 13. Unusual request
    unusual_request = 1.0 if any(kw in lower_text for kw in ["do not disclose", "keep secret", "download anydesk", "rustdesk", "teamviewer", "apk file"]) else 0.0

    # 14. Request for credentials
    request_for_credentials = 1.0 if any(kw in lower_text for kw in CREDENTIAL_KEYWORDS) else 0.0

    # 15. Request for OTP
    request_for_otp = 1.0 if any(kw in lower_text for kw in OTP_KEYWORDS) else 0.0

    # 16. Request for payment
    request_for_payment = 1.0 if (financial_request > 0 and any(kw in lower_text for kw in ["send to upi", "pay rs", "processing fee", "registration charge", "pay now"])) else 0.0

    # 17. External link present
    external_link = 1.0 if len(urls) > 0 else 0.0

    # 18. Excessive punctuation count (! and ? frequency)
    punc_count = len(re.findall(r'[!?]{1,}', text))
    excessive_punctuation = float(punc_count)

    # 19. Excessive uppercase ratio
    upper_chars = sum(1 for c in text if c.isupper())
    excessive_caps = round(upper_chars / total_chars, 4)

    # 20. Time pressure (explicit deadlines)
    time_pressure = 1.0 if any(kw in lower_text for kw in ["today only", "by midnight", "before 12", "in 2 hours", "10 minutes", "valid till today"]) else 0.0

    # 21. Source available (identifiable sender vs anonymous)
    source_available = 1.0 if sender and sender.strip() and sender != "Unknown" else 0.0

    # 22. Source consistency (official claim vs legitimate domain)
    if authority_claim:
        source_consistency = 0.0 if has_unverified_sender else 1.0
    else:
        source_consistency = 1.0

    # 23. Claim specificity (dates, official notification codes, reference numbers)
    has_ref_num = bool(re.search(r'\b[A-Z0-9]{6,12}\b', text)) or bool(re.search(r'circular\s+no|ref\s*:', lower_text))
    claim_specificity = 1.0 if has_ref_num else 0.0

    return {
        "urgency_score": urgency_score,
        "financial_request": financial_request,
        "fear_score": fear_score,
        "anger_score": anger_score,
        "emotional_pressure": emotional_pressure,
        "authority_claim": authority_claim,
        "impersonation_signal": impersonation_signal,
        "suspicious_url": suspicious_url,
        "account_threat": account_threat,
        "social_pressure": social_pressure,
        "forced_action": forced_action,
        "reward_claim": reward_claim,
        "unusual_request": unusual_request,
        "request_for_credentials": request_for_credentials,
        "request_for_otp": request_for_otp,
        "request_for_payment": request_for_payment,
        "external_link": external_link,
        "excessive_punctuation": excessive_punctuation,
        "excessive_caps": excessive_caps,
        "time_pressure": time_pressure,
        "source_available": source_available,
        "source_consistency": source_consistency,
        "claim_specificity": claim_specificity
    }

def feature_dict_to_vector(features: Dict[str, float]) -> List[float]:
    """
    Converts feature dictionary to an ordered vector strictly matching FEATURE_SCHEMA.
    """
    return [float(features.get(f, 0.0)) for f in FEATURE_SCHEMA]
