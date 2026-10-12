import json
from database import get_connection

PHASE2_SCENARIOS = [
    {
        "id": "scenario-1",
        "title": "UPI Scam: Mistaken ₹2,500 Refund Request",
        "sender": "Unknown (+91 98451 22104)",
        "timestamp": "8m ago",
        "content": "Bhaiya I sent ₹2,500 to your Google Pay by mistake while paying for emergency medicine. Please click this refund link to reverse transaction or scan this QR: upi://pay?pa=refund-agent98@ybl&am=2500",
        "content_type": "text_upi_link",
        "difficulty": "EASY",
        "ground_truth": "SCAM",
        "correct_action": "CONTAIN",
        "base_audience": 280,
        "manipulation_signals": [
            "Emotional urgency ('emergency medicine')",
            "Reverse payment bait (claims money was sent by mistake)",
            "Deep link triggers 'Collect Money' intent requiring your PIN",
            "Unregistered peer-to-peer VPA masquerading as refund gateway"
        ],
        "explanation": "Classic UPI reverse collect scam. You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE or refund money. Legitimate bank reversals are processed via bank grievance portals, never through personal UPI collect requests.",
        "investigation_data": {
            "quick_scan": {
                "summary": "Flagged high-risk financial collect intent embedded inside message payload.",
                "confidence": 94,
                "risk_rating": "CRITICAL",
                "signals": ["Reverse-Payment Pattern", "Artificial Emergency", "Malicious UPI URI Scheme"]
            },
            "source_check": {
                "carrier": "Prepaid burner SIM activated in Bihar 72 hours ago",
                "spam_reports": "42 reports on Truecaller in last 6 hours: 'UPI Refund Scam'",
                "vpa_status": "refund-agent98@ybl flagged in NPCI Mule Account Registry"
            },
            "screenshot_analysis": {
                "applicable": False,
                "message": "No visual media attached to this communication. Use Source Check or Deep Investigation."
            },
            "voice_analysis": {
                "applicable": False,
                "message": "No acoustic media attached to this communication."
            },
            "deep_investigation": {
                "threat_actor": "Jamtara Mule Syndicate Sub-Cell 4",
                "destination_vpa": "Money auto-routed to dynamic crypto P2P wallet upon PIN entry",
                "estimated_casualty_cost": "₹2,500 direct deduction from victim bank balance per approval",
                "remediation": "Block VPA, notify NPCI cyber fraud gateway, quarantine broadcast immediately"
            }
        }
    },
    {
        "id": "scenario-2",
        "title": "Government Scheme: Free Student Laptops Initiative 2026",
        "sender": "Govt-Notice-Dispatch (Telegram Channel)",
        "timestamp": "22m ago",
        "content": "Under PM Digital Bharat 2026, 1,00,000 HP Core-i7 laptops distributed free to all college students. Apply before quota closes tonight. Pay ₹149 processing courier fee at: https://pm-laptop-distribution.in-schemes.org",
        "content_type": "link",
        "difficulty": "MEDIUM",
        "ground_truth": "SCAM",
        "correct_action": "ESCALATE",
        "base_audience": 420,
        "manipulation_signals": [
            "Advance processing courier fee (₹149)",
            "Unrealistic premium hardware incentive (HP Core-i7)",
            "Artificial midnight scarcity deadline",
            "Spoofed domain extension (.in-schemes.org imitating gov.in)"
        ],
        "explanation": "Advance-fee phishing campaign masquerading as a welfare scheme. Central ministries never operate under third-party non-.gov domains or demand registration/courier fees through private payment gateways.",
        "investigation_data": {
            "quick_scan": {
                "summary": "Advance-fee scam signature detected mimicking Ministry of Electronics & IT.",
                "confidence": 98,
                "risk_rating": "CRITICAL",
                "signals": ["Advance-Fee Fraud", "Domain Impersonation", "Artificial Scarcity Hook"]
            },
            "source_check": {
                "domain_age": "Registered 4 days ago with hidden WHOIS via NameSilo",
                "server_ip": "185.196.220.14 (Hosting located in Eastern Europe, no government routing)",
                "ssl_cert": "Free 90-day Let's Encrypt certificate (Official schemes use National Informatics Centre SSL)"
            },
            "screenshot_analysis": {
                "applicable": False,
                "message": "Visual metadata not present. Recommended: Source Check or Deep Investigation."
            },
            "voice_analysis": {
                "applicable": False,
                "message": "Acoustic telemetry not applicable."
            },
            "deep_investigation": {
                "threat_actor": "SchemePhish Network Group",
                "harvesting_payload": "Landing page captures Aadhaar number, student ID, and ₹149 micro-payment",
                "active_campaign_reach": "38,000 students reached across 14 Telegram channels in state",
                "remediation": "Issue urgent CERT-In domain takedown and alert community student body"
            }
        }
    },
    {
        "id": "scenario-3",
        "title": "Fake College Announcement: Exams Indefinitely Postponed",
        "sender": "Campus Student Council Unofficial",
        "timestamp": "45m ago",
        "content": "Breaking Notice: Due to unexpected curriculum realignment by UGC, all end-semester theory examinations scheduled for Monday are cancelled until further notification. Relax and celebrate! Official circular attached.",
        "content_type": "text",
        "difficulty": "MEDIUM",
        "ground_truth": "MISINFORMATION",
        "correct_action": "HOLD",
        "base_audience": 310,
        "manipulation_signals": [
            "Unofficial channel broadcast masquerading as administration",
            "Unverified UGC authority attribution",
            "Premature celebration tone ('Relax and celebrate')",
            "Missing university registrar cryptographic seal and circular reference ID"
        ],
        "explanation": "Fabricated rumor aimed at disrupting student preparation. Examination postponements are only valid when published on the authenticated university portal with registrar verification.",
        "investigation_data": {
            "quick_scan": {
                "summary": "High probability of disruptive student hoax. Lacks institutional authentication markers.",
                "confidence": 88,
                "risk_rating": "MEDIUM",
                "signals": ["Unofficial Origin", "Sensational Disruption", "Missing Official Dispatch Serial"]
            },
            "source_check": {
                "account_age": "Created 2 months ago, unverified student community page",
                "university_cross_ref": "Controller of Examinations office reports normal exam schedule on official portal",
                "dispatch_signature": "Zero matching PGP/DKIM cryptographic records"
            },
            "screenshot_analysis": {
                "applicable": False,
                "message": "No visual asset analyzed."
            },
            "voice_analysis": {
                "applicable": False,
                "message": "No voice asset present."
            },
            "deep_investigation": {
                "origin_analysis": "Traceable to campus dormitory IP address subnet",
                "intent": "Deliberate disruptive prank before major engineering finals",
                "community_impact": "Over 300 students at risk of missing exams if taken as fact",
                "remediation": "Hold propagation, issue official university clarification broadcast"
            }
        }
    },
    {
        "id": "scenario-4",
        "title": "Health Claim: Guava Leaves & Ginger Replaces Blood Pressure Meds",
        "sender": "Daily Nature Cure (WhatsApp Broadcast)",
        "timestamp": "1h ago",
        "content": "Cardiologists are stunned! Boil 5 guava leaves with crushed ginger every morning on empty stomach. Dissolves 100% arterial plaque and replaces all blood pressure medications in 72 hours. Forward to save lives!",
        "content_type": "text",
        "difficulty": "EASY",
        "ground_truth": "MISINFORMATION",
        "correct_action": "CONTAIN",
        "base_audience": 360,
        "manipulation_signals": [
            "Miracle 72-hour cure claim for chronic cardiovascular disease",
            "Dangerous guidance to stop prescribed anti-hypertensive drugs",
            "Emotional viral forward command ('Forward to save lives!')",
            "Zero clinical trial citations or verified medical board references"
        ],
        "explanation": "Extremely dangerous health misinformation. Abrupt cessation of prescribed blood pressure medication can trigger severe hypertensive crises and strokes. Guava leaves have antioxidant properties but cannot replace emergency cardiovascular drugs.",
        "investigation_data": {
            "quick_scan": {
                "summary": "Critical health misinformation hazard. Direct medical harm potential.",
                "confidence": 96,
                "risk_rating": "CRITICAL",
                "signals": ["Miracle Cure Narrative", "Anti-Pharmacology Advice", "Viral Forward Contagion"]
            },
            "source_check": {
                "channel_history": "Repeatedly flags false cancer cures, detox teas, and banned herbal supplements",
                "author_credentials": "No licensed medical practitioners associated with this broadcast channel"
            },
            "screenshot_analysis": {
                "applicable": False,
                "message": "No screenshot media."
            },
            "voice_analysis": {
                "applicable": False,
                "message": "No voice media."
            },
            "deep_investigation": {
                "medical_consensus": "Indian Council of Medical Research (ICMR) explicitly condemns stopping hypertension meds",
                "lethality_risk": "High stroke risk for vulnerable elderly population within 48 hours of drug cessation",
                "remediation": "Quarantine message, add medical fact-checking advisory to community channel"
            }
        }
    },
    {
        "id": "scenario-5",
        "title": "Voice Message: Panicked 'Son at Police Station' Audio Note",
        "sender": "WhatsApp Audio (+91 91102 44321)",
        "timestamp": "2h ago",
        "content": "Audio Note (0:34s): 'Dad, please don't get angry, my friend had a car crash and police inspector took our phones. He says pay ₹15,000 on this number right now or they will file an FIR. Please hurry dad!'",
        "content_type": "voice_message",
        "difficulty": "HARD",
        "ground_truth": "SCAM",
        "correct_action": "ESCALATE",
        "base_audience": 220,
        "manipulation_signals": [
            "Extreme psychological panic and familial distress trigger",
            "AI neural voice clone replicating family member's vocal timber",
            "Urgent request to transfer funds to third-party mule UPI",
            "Caller disconnects when asked to switch to live video call"
        ],
        "explanation": "AI voice cloning vishing attack. Threat actors scrape social media audio to clone vocal timber and generate panicked family scenarios. Protocol requires calling the person on their known original number or requesting shared secret phrase.",
        "investigation_data": {
            "quick_scan": {
                "summary": "Urgent extortion pattern detected mimicking family emergency.",
                "confidence": 85,
                "risk_rating": "CRITICAL",
                "signals": ["Family Impersonation", "Psychological Hostage Trick", "Immediate Cash Extortion"]
            },
            "source_check": {
                "origin_number": "VOIP virtual number routed via Cambodia gateway",
                "upi_receiver": "Account registered 2 hours ago under fake KYC identity"
            },
            "screenshot_analysis": {
                "applicable": False,
                "message": "Audio file, not an image."
            },
            "voice_analysis": {
                "acoustic_score": "98.7% Synthetic Generation Probability",
                "spectral_telemetry": "Pitch jitter and formant continuity match ElevenLabs v2 neural voice synthesis model",
                "background_noise": "Synthetic background police siren inserted as looping 4-second audio loop"
            },
            "deep_investigation": {
                "threat_actor": "Southeast Asia Cyber Vishing Ring",
                "modus_operandi": "Scraped Instagram video clips of the student to train 3-second voice clone",
                "remediation": "Escalate to Cyber Cell, verify family member safety via alternate authenticated channel"
            }
        }
    },
    {
        "id": "scenario-6",
        "title": "Manipulated Screenshot: ₹50,000 Donation Transfer Receipt",
        "sender": "New Community Sponsor (IMG_20261008_1142.png)",
        "timestamp": "3h ago",
        "content": "Attached Image: An apparent IMPS successful transaction receipt of ₹50,000 credited to Community Fund from Axis Bank with UTR AXIS2026100898213. Sender demands immediate VIP Admin badge.",
        "content_type": "screenshot_image",
        "difficulty": "HARD",
        "ground_truth": "HOAX",
        "correct_action": "VERIFY",
        "base_audience": 290,
        "manipulation_signals": [
            "JPEG compression noise localized strictly around the amount '₹50,000'",
            "Font baseline misalignment on the UTR reference number",
            "Bank statement ledger shows zero inward credit matching transaction",
            "High social pressure demanding immediate elevated VIP credentials"
        ],
        "explanation": "Manipulated banking receipt generated using a fake payment screenshot editor. The UTR number is mathematically invalid and the bank reconciliation ledger shows zero inward credit.",
        "investigation_data": {
            "quick_scan": {
                "summary": "High financial credential leverage attempt. Verification pending ledger sync.",
                "confidence": 78,
                "risk_rating": "MEDIUM",
                "signals": ["Social Engineering", "Privilege Escalation Bait", "Unsettled Payment Claim"]
            },
            "source_check": {
                "bank_settlement": "Bank API returns: 'UTR AXIS2026100898213 not found in clearing cycle'",
                "account_standing": "Sender account joined community 1 hour ago"
            },
            "screenshot_analysis": {
                "image_forensics": "Error Level Analysis (ELA) reveals high digital modification around balance text",
                "font_metadata": "Amount rendered in Roboto 18pt while official bank slip uses custom Axis Sans font",
                "canvas_dimensions": "Image altered with Android screenshot spoofing utility"
            },
            "voice_analysis": {
                "applicable": False,
                "message": "Visual image, not an acoustic voice file."
            },
            "deep_investigation": {
                "forensic_conclusion": "Fake receipt designed to gain admin/VIP privileges without actual payment",
                "risk": "Privilege escalation leading to community takeover",
                "remediation": "Place on VERIFY hold until bank statement settles; deny VIP access"
            }
        }
    },
    {
        "id": "scenario-7",
        "title": "Civic Notice: Municipal Water Pipeline Maintenance",
        "sender": "City Water & Sewage Board (@CityWaterBoard)",
        "timestamp": "4h ago",
        "content": "Public Advisory: Routine valve maintenance will take place in Sectors 4 through 9 tomorrow between 10:00 AM and 2:00 PM. Please store adequate water for morning requirements. Helpline: 1916.",
        "content_type": "text",
        "difficulty": "EASY",
        "ground_truth": "GENUINE",
        "correct_action": "ALLOW",
        "base_audience": 340,
        "manipulation_signals": [
            "Zero urgency or psychological coercion triggers",
            "Verified official municipal handle with published history",
            "No links, fees, or credentials requested",
            "Standard off-peak scheduled municipal maintenance window"
        ],
        "explanation": "Authentic civic advisory. Verified against municipal dispatch logs and city municipal portal. Blocking this genuine notice causes unnecessary disruption to citizens.",
        "investigation_data": {
            "quick_scan": {
                "summary": "Verified civic notice with zero malicious indicators.",
                "confidence": 99,
                "risk_rating": "SAFE",
                "signals": ["Official Civic Source", "Non-Coercive", "Verified Utility Advisory"]
            },
            "source_check": {
                "handle_status": "Official Gold verified public utility handle",
                "municipal_registry": "Matches dispatch log #WTR-2026-9014 at Central Control Room",
                "contact_number": "Helpline 1916 verified official municipal number"
            },
            "screenshot_analysis": {
                "applicable": False,
                "message": "Text notice."
            },
            "voice_analysis": {
                "applicable": False,
                "message": "Text notice."
            },
            "deep_investigation": {
                "authenticity": "100% Genuine civic communication",
                "risk": "None. Blocking this communication causes water shortage panic.",
                "remediation": "ALLOW broadcast immediately to ensure citizens store water"
            }
        }
    },
    {
        "id": "scenario-8",
        "title": "AI Skepticism: Automated Arbitrage Bot Advisory",
        "sender": "FinTech Pulse AI (@FinPulse_Bot)",
        "timestamp": "5h ago",
        "content": "AI Alert: Algorithmic trading model detects 99.4% probability arbitrage surge in $NEO_VIRTUAL token over next 60 minutes. Guaranteed 4.5x return. Automated gateway: https://finpulse-trade.ai/arbitrage",
        "content_type": "link",
        "difficulty": "MEDIUM",
        "ground_truth": "SCAM",
        "correct_action": "CONTAIN",
        "base_audience": 390,
        "manipulation_signals": [
            "Guaranteed 4.5x financial return promises",
            "Artificial 60-minute countdown deadline",
            "Pseudo-scientific AI probability framing",
            "Unregistered offshore crypto gateway"
        ],
        "explanation": "Algorithmic pump-and-dump fraud exploiting automated AI credibility. Legitimate financial markets never promise guaranteed arbitrage multiples.",
        "investigation_data": {
            "quick_scan": {
                "summary": "High risk financial deception using algorithmic buzzwords.",
                "confidence": 92,
                "risk_rating": "CRITICAL",
                "signals": ["Guaranteed Profit Fraud", "AI Credibility Hijacking", "Micro-Window Urgency"]
            },
            "source_check": {
                "domain_age": "Domain registered 6 days ago via anonymous crypto registrar",
                "regulatory_status": "Not registered with SEBI or RBI financial registries"
            },
            "screenshot_analysis": {
                "applicable": False,
                "message": "Text/link payload."
            },
            "voice_analysis": {
                "applicable": False,
                "message": "No acoustic media."
            },
            "deep_investigation": {
                "threat_actor": "Telegram Crypto Drainer Syndicate",
                "payload": "Smart contract contains hidden unlimited token drainer function",
                "remediation": "Quarantine link, issue algorithmic fraud warning to citizens"
            }
        }
    },
    {
        "id": "scenario-9",
        "title": "Visual Verification: Forged Cyber Crime Cell Summons Notice",
        "sender": "National Legal Dispatch (notice_img_892.png)",
        "timestamp": "6h ago",
        "content": "Attached Image: An official summons letterhead with National Crime Records Bureau seal alleging your IP was involved in illicit transactions. Pay ₹10,000 compromise penalty to avoid immediate arrest.",
        "content_type": "screenshot_image",
        "difficulty": "MEDIUM",
        "ground_truth": "SCAM",
        "correct_action": "ESCALATE",
        "base_audience": 320,
        "manipulation_signals": [
            "Forged government emblem and mismatched seal colors",
            "Font baseline distortion around legal penalty amount",
            "Direct fine payment demanded via private UPI QR code",
            "Intimidation with immediate arrest within 2 hours"
        ],
        "explanation": "Forged digital police summons. Government law enforcement agencies never issue legal summons demanding instant settlement fines via private UPI.",
        "investigation_data": {
            "quick_scan": {
                "summary": "Severe extortion pattern with legal authority spoofing.",
                "confidence": 95,
                "risk_rating": "CRITICAL",
                "signals": ["Legal Impersonation", "Extortion Coercion", "Direct UPI Payment Demand"]
            },
            "source_check": {
                "official_cross_check": "NCRB does not issue notices via WhatsApp or Telegram channels",
                "upi_payee": "Private individual wallet flagged for digital arrest scams"
            },
            "screenshot_analysis": {
                "image_forensics": "High JPEG ELA noise around emblem and amount",
                "font_metadata": "Government seals pasted over template with visible edge artifacts"
            },
            "voice_analysis": {
                "applicable": False,
                "message": "Image asset only."
            },
            "deep_investigation": {
                "threat_actor": "Digital Arrest Extortion Gang",
                "psychological_vector": "Leverages fear of arrest to force hasty UPI transfers",
                "remediation": "Escalate to Cyber Police, warn citizens of digital summons scam"
            }
        }
    },
    {
        "id": "scenario-10",
        "title": "Investigation Efficiency: Delivery Parcel Address Correction SMS",
        "sender": "IndiaSpeed Post (SMS #8192)",
        "timestamp": "7h ago",
        "content": "Your parcel #IN-90812 cannot be delivered due to incomplete street address. Please update delivery address within 12 hours: http://speedpost-addr-verify.com",
        "content_type": "text",
        "difficulty": "EASY",
        "ground_truth": "SCAM",
        "correct_action": "CONTAIN",
        "base_audience": 260,
        "manipulation_signals": [
            "Spoofed domain using .com instead of official .gov.in",
            "Artificial 12-hour return-to-sender deadline",
            "Generic parcel number lacking recipient name or order details"
        ],
        "explanation": "High-volume smishing attack. India Post uses official indiapost.gov.in domains and does not request address updates via third-party .com domains.",
        "investigation_data": {
            "quick_scan": {
                "summary": "Obvious smishing parcel delivery lure.",
                "confidence": 97,
                "risk_rating": "CRITICAL",
                "signals": ["Domain Spoofing", "Parcel Phishing", "Scarcity Deadline"]
            },
            "source_check": {
                "domain_origin": "Registered 48 hours ago in Eastern Europe",
                "ssl_certificate": "Domain uses free cPanel certificate, zero government affiliation"
            },
            "screenshot_analysis": {
                "applicable": False,
                "message": "SMS text."
            },
            "voice_analysis": {
                "applicable": False,
                "message": "SMS text."
            },
            "deep_investigation": {
                "payload": "Collects credit card details and OTP disguised as ₹5 re-delivery fee",
                "remediation": "Block domain, broadcast package scam advisory"
            }
        }
    },
    {
        "id": "scenario-11",
        "title": "Urgency Detection: Critical Power Grid Maintenance Alert",
        "sender": "State Electricity Board (@PowerDiscomState)",
        "timestamp": "8h ago",
        "content": "URGENT NOTICE: Crucial 220kV transformer maintenance scheduled tonight from 11:30 PM to 12:15 AM. Power will be interrupted in Industrial Sector 2. Engage emergency backup generators. Updates at: https://discom.state.gov.in",
        "content_type": "link",
        "difficulty": "HARD",
        "ground_truth": "GENUINE",
        "correct_action": "ALLOW",
        "base_audience": 450,
        "manipulation_signals": [
            "High urgency and immediate evening timeframe",
            "Verified state electricity board handle with historical records",
            "Official state.gov.in web address",
            "Zero fees, personal details, or account logins requested"
        ],
        "explanation": "Authentic operational advisory. Genuine utilities frequently issue urgent notices before critical maintenance. Blocking this notice leaves industrial units unprepared for power outages.",
        "investigation_data": {
            "quick_scan": {
                "summary": "Legitimate urgent utility advisory from verified government infrastructure.",
                "confidence": 98,
                "risk_rating": "SAFE",
                "signals": ["Official .gov.in Domain", "Public Grid Notice", "Zero Financial Solicitation"]
            },
            "source_check": {
                "domain_verification": "Direct sub-domain under state.gov.in with valid NIC digital certificate",
                "handle_history": "Active verified municipal account operating since 2018"
            },
            "screenshot_analysis": {
                "applicable": False,
                "message": "Text bulletin."
            },
            "voice_analysis": {
                "applicable": False,
                "message": "Text bulletin."
            },
            "deep_investigation": {
                "utility_dispatch": "Confirmed by State Load Dispatch Centre operations log #OPS-8812",
                "remediation": "ALLOW dissemination immediately to enable industrial preparation"
            }
        }
    },
    {
        "id": "scenario-12",
        "title": "Source Verification: Spoofed WHO Medical Research Fellowship",
        "sender": "Global Health Scholars (Telegram)",
        "timestamp": "9h ago",
        "content": "WHO announces $25,000 Global Health Research Fellowships for graduate students. Submit application before international quota fills: https://who-fellowships-application.org/apply",
        "content_type": "link",
        "difficulty": "HARD",
        "ground_truth": "SCAM",
        "correct_action": "ESCALATE",
        "base_audience": 370,
        "manipulation_signals": [
            "Domain who-fellowships-application.org imitating official who.int",
            "High monetary incentive ($25,000 grant) designed to attract graduate applicants",
            "Application form requests passport scans and banking details",
            "Hidden WHOIS registry hiding actual registrar jurisdiction"
        ],
        "explanation": "Advanced credential harvesting campaign. The World Health Organization exclusively operates under who.int and never accepts grant applications through third-party .org lookalikes.",
        "investigation_data": {
            "quick_scan": {
                "summary": "Sophisticated academic grant lure with domain lookalike indicators.",
                "confidence": 93,
                "risk_rating": "CRITICAL",
                "signals": ["Grant Phishing", "Lookalike Domain", "Identity Harvesting"]
            },
            "source_check": {
                "official_dns": "who.int domain has zero affiliation with who-fellowships-application.org",
                "ip_location": "Server hosted on bulletproof offshore provider"
            },
            "screenshot_analysis": {
                "applicable": False,
                "message": "Web link."
            },
            "voice_analysis": {
                "applicable": False,
                "message": "Web link."
            },
            "deep_investigation": {
                "threat_actor": "Academic Harvester Cell",
                "impact": "Captures student identity documents for synthetic KYC fraud",
                "remediation": "Issue domain takedown via CERT-In, broadcast university advisory"
            }
        }
    }
]

def seed_database():
    conn = get_connection()
    cursor = conn.cursor()

    # Clear and re-seed scenarios
    cursor.execute("DELETE FROM scenarios")
    for sc in PHASE2_SCENARIOS:
        cursor.execute("""
        INSERT INTO scenarios (
            id, title, sender, timestamp, content, content_type,
            difficulty, ground_truth, correct_action, explanation,
            manipulation_signals, investigation_data, base_audience
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sc["id"],
            sc["title"],
            sc["sender"],
            sc["timestamp"],
            sc["content"],
            sc["content_type"],
            sc["difficulty"],
            sc["ground_truth"],
            sc["correct_action"],
            sc["explanation"],
            json.dumps(sc["manipulation_signals"]),
            json.dumps(sc["investigation_data"]),
            sc["base_audience"]
        ))

    # Reset player state to clean Phase 6 Digital Guardian starting metrics:
    cursor.execute("DELETE FROM player_state")
    cursor.execute("""
    INSERT INTO player_state (
        id, name, avatar, level, rank, xp, trust_score, investigation_credits,
        community_population, community_trust, community_exposure, missions_completed
    ) VALUES ('player-1', 'Agent Commander', 'AGENT', 1, 'ROOKIE GUARDIAN', 0, 0, 30, 1000, 100, 0, 0)
    """)

    # Reset community state (Phase 5)
    cursor.execute("DELETE FROM community_state")
    cursor.execute("""
    INSERT INTO community_state (
        id, population, community_trust, exposure, harm_prevented, harm_caused, safe_decisions, unsafe_decisions
    ) VALUES ('community-1', 1000, 100, 0, 0, 0, 0, 0)
    """)

    # Reset Trust DNA (Phase 5: 8 traits, each starting at 50)
    cursor.execute("DELETE FROM trust_dna")
    cursor.execute("""
    INSERT INTO trust_dna (
        player_id, source_verification, manipulation_detection, emotional_manipulation,
        authority_bias, urgency_detection, visual_verification, ai_skepticism, investigation_efficiency
    ) VALUES ('player-1', 50, 50, 50, 50, 50, 50, 50, 50)
    """)

    # Clear previous logs
    cursor.execute("DELETE FROM scenario_investigations")
    cursor.execute("DELETE FROM player_decisions")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    from database import init_db
    init_db()
    seed_database()
    print("Phase 2 Core Game Engine scenarios and player state seeded successfully.")
