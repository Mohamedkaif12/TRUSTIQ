import { InformationCard } from '../types/game';

export const INITIAL_CARDS: InformationCard[] = [
  {
    id: 'card-1',
    category: 'bank',
    categoryLabel: 'Bank Security Warning',
    sender: 'HDFC-Alert-Desk',
    timestamp: '10 mins ago',
    channel: 'Priority SMS Gateway',
    title: 'Urgent: Account Suspension Notice',
    content: 'CRITICAL ALERT: Your HDFC net-banking KYC registration expired at 00:00. Your savings account & debit card will be indefinitely frozen in 2 hours. Update credentials immediately at: https://hdfc-kyc-verify-portal.top to avert total account freeze.',
    groundTruth: 'SCAM',
    isLegitimate: false,
    baseAudienceImpact: 320,
    isInvestigated: false,
    isDeepInvestigated: false,
    status: 'PENDING',
    aiData: {
      claim: 'Bank account will be locked within 2 hours unless immediate KYC verification is completed via the link.',
      manipulationSignals: [
        'Artificial Extreme Urgency (2-hour ultimatum)',
        'Fear/Panic trigger of asset freezing',
        'Suspicious top-level domain (.top instead of official .com/.bank)',
        'Unsolicited SMS linking to external credential harvester'
      ],
      riskScore: 95,
      riskLevel: 'CRITICAL',
      confidence: 99,
      explanation: 'Domain registered less than 48 hours ago in an offshore registrar with hidden WHOIS data. Financial institutions strictly never mandate emergency credential verification via SMS hyperlinks.',
      deepForensics: {
        sourceOrigin: 'IP 185.220.101.42 (Anonymous VPN / Proxy Node)',
        domainAge: '31 hours old (Registrar: NameCheap Offshore)',
        propagationRate: 'High (SMS blast detected across 15,000 numbers in city region)',
        networkThreatLevel: 'Active Credential Harvesting Phishing Kit',
        threatActors: 'FinScam Syndicate Alpha (known for OTP interception)',
        targetDemographic: 'Community account holders with active mobile banking',
        technicalFingerprint: 'Spoofed sender ID "HDFC-Alert"; SSL issued by free Let\'s Encrypt 1 day ago'
      }
    }
  },
  {
    id: 'card-2',
    category: 'college',
    categoryLabel: 'College Announcement',
    sender: 'Office of Academic Registrar',
    timestamp: '25 mins ago',
    channel: 'Campus Intranet Broadcast',
    title: 'Scheduled Portal Downtime & Maintenance',
    content: 'Attention Students & Faculty: The University ERP and Exam Hall Ticket portal will undergo scheduled database maintenance this Saturday between 11:00 PM and 3:00 AM IST. All student services will resume normally on Sunday morning. For urgent inquiries, email helpdesk@university.edu.in.',
    groundTruth: 'SAFE',
    isLegitimate: true,
    baseAudienceImpact: 280,
    isInvestigated: false,
    isDeepInvestigated: false,
    status: 'PENDING',
    aiData: {
      claim: 'University portal will be temporarily unavailable for standard maintenance during late night Saturday.',
      manipulationSignals: [
        'Zero coercive or psychological pressure',
        'Official institutional domain (@university.edu.in)',
        'Reasonable off-peak maintenance window (11 PM - 3 AM)',
        'No request for passwords, OTPs, or payments'
      ],
      riskScore: 4,
      riskLevel: 'SAFE',
      confidence: 97,
      explanation: 'Verified official administrative communication. DKIM, SPF, and DMARC cryptographic signatures validate origin from authorized university servers.',
      deepForensics: {
        sourceOrigin: 'Campus Internal Server 10.14.2.11 / AS55824 National Knowledge Network',
        domainAge: '14 years old (Official verified educational registrar)',
        propagationRate: 'Scheduled administrative dispatch',
        networkThreatLevel: 'Clean / Zero Malicious Signatures',
        technicalFingerprint: 'Validated SHA-256 Certificate signed by DigiCert CA; SPF: Pass; DKIM: Pass',
        targetDemographic: 'Enrolled students and campus faculty',
      }
    }
  },
  {
    id: 'card-3',
    category: 'government',
    categoryLabel: 'Government Scheme',
    sender: 'PM-Direct-Benefit-Portal',
    timestamp: '1 hour ago',
    channel: 'Sponsored Telegram Channel',
    title: 'PM Youth Digital Empowerment Grant: Rs. 25,000 Direct Transfer',
    content: 'Special Diwali Digital Initiative: Every Indian citizen aged 18-35 is approved for Rs. 25,000 direct bank transfer under PM-DBT 2026. Limited seats for first 50,000 applicants. Link your Aadhaar card and pay Rs. 99 verification stamp duty to claim funds within 15 minutes: http://pm-dbt-grant-apply.in-claim.net',
    groundTruth: 'SCAM',
    isLegitimate: false,
    baseAudienceImpact: 450,
    isInvestigated: false,
    isDeepInvestigated: false,
    status: 'PENDING',
    aiData: {
      claim: 'Government is giving ₹25,000 direct cash transfers to youth on first-come-first-serve basis with a ₹99 fee.',
      manipulationSignals: [
        'Advance-fee fraud pattern (pay small amount to receive huge cash)',
        'Artificial urgency & scarcity ("Limited seats for first 50,000")',
        'Fraudulent domain mimicry (in-claim.net imitating gov.in)',
        'Harvesting sensitive national identity data (Aadhaar)'
      ],
      riskScore: 96,
      riskLevel: 'CRITICAL',
      confidence: 99,
      explanation: 'Direct Benefit Transfer (DBT) schemes never charge "verification stamp duties" or operate on .net non-governmental domains. Classic advance-fee phishing campaign.',
      deepForensics: {
        sourceOrigin: 'Cloudflare Proxied IP (Origin host: Eastern Europe Bulletproof Hosting)',
        domainAge: '5 days old',
        propagationRate: 'Viral aggressive paid ads on social channels',
        networkThreatLevel: 'Identity Theft & Micro-Payment Siphon Engine',
        threatActors: 'AadhaarPhish Network',
        targetDemographic: 'Job-seeking students and young community members',
        technicalFingerprint: 'Fake Razorpay/UPI gateway intent mimicking national payment portal'
      }
    }
  },
  {
    id: 'card-4',
    category: 'health',
    categoryLabel: 'Health & Medical Claim',
    sender: 'Holistic Miracle Wellness',
    timestamp: '2 hours ago',
    channel: 'Health & Life Facebook Feed',
    title: 'Top Doctor Reveals: Boiled Clove Water Replaces Insulin 100%',
    content: 'BIG PHARMA HATES THIS! Renowned Swiss endocrinologist Dr. Klaus reveals in a banned video that drinking boiled clove and star-anise water every morning permanently revives beta-cells and cures Type-1 and Type-2 diabetes in 14 days without injections. Stop taking toxic prescription meds today!',
    groundTruth: 'MISINFORMATION',
    isLegitimate: false,
    baseAudienceImpact: 390,
    isInvestigated: false,
    isDeepInvestigated: false,
    status: 'PENDING',
    aiData: {
      claim: 'Drinking boiled clove water permanently cures diabetes and eliminates the need for insulin in 14 days.',
      manipulationSignals: [
        'Conspiracy baiting ("Big Pharma hates this", "banned video")',
        'Dangerous medical instruction ("Stop taking prescription meds")',
        'Miraculous cure claim for incurable chronic disease',
        'Fabricated medical authority without journal citations'
      ],
      riskScore: 89,
      riskLevel: 'HIGH',
      confidence: 96,
      explanation: 'Extremely hazardous medical misinformation. Ceasing prescribed insulin can trigger fatal diabetic ketoacidosis. The named doctor has no record in the Swiss Medical Board.',
      deepForensics: {
        sourceOrigin: 'Monetized Click-Farming Blog Network (AdSense arbitrage)',
        domainAge: '8 months old',
        propagationRate: 'High engagement algorithm velocity via emotive health anxiety',
        networkThreatLevel: 'Direct Physical Harm / Medical Disinformation',
        threatActors: 'Alternative Health Affiliate Network selling $49 herbal extract kits',
        targetDemographic: 'Diabetic elders and vulnerable community families',
        technicalFingerprint: 'Auto-translated text from Russian disinformation health-spam farms'
      }
    }
  },
  {
    id: 'card-5',
    category: 'whatsapp',
    categoryLabel: 'Family WhatsApp Forward',
    sender: 'Auntie Sunita (Family Group)',
    timestamp: '3 hours ago',
    channel: 'WhatsApp Family Network',
    title: 'Forwarded Many Times: Cosmic Rays Warning Tonight',
    content: '⚠️ FORWARD TO ALL LOVED ONES: Tonight from 12:30 AM to 03:30 AM, dangerous cosmic radiation will penetrate Earth according to NASA alert. Please switch off all mobile phones, tablets and keep them away from your bedroom, otherwise body will absorb lethal radiation shocks. Confirmed on BBC News!',
    groundTruth: 'HOAX',
    isLegitimate: false,
    baseAudienceImpact: 310,
    isInvestigated: false,
    isDeepInvestigated: false,
    status: 'PENDING',
    aiData: {
      claim: 'NASA warned that phones must be switched off tonight due to lethal cosmic ray penetration.',
      manipulationSignals: [
        'Iconic chain message signature ("Forwarded many times")',
        'False authority attribution (NASA & BBC News never published this)',
        'Unscientific pseudoscience panic regarding cellphones & cosmic rays',
        'Specific midnight time window to prevent real-time fact-checking'
      ],
      riskScore: 68,
      riskLevel: 'MEDIUM',
      confidence: 98,
      explanation: 'Decade-old recurring urban legend circulating globally since 2008. NASA has explicitly debunked this. Cosmic rays do not interact with cellular radio modules to cause radiation injuries.',
      deepForensics: {
        sourceOrigin: 'Viral peer-to-peer dark social messaging',
        domainAge: 'N/A (Decentralized forward chain dating back to 2008)',
        propagationRate: 'Exponential viral looping inside family/elder cohorts',
        networkThreatLevel: 'Psychological Panic & Mass Media Illiteracy',
        threatActors: 'Troll origin / viral memetic contagion',
        targetDemographic: 'Elderly community members and family WhatsApp groups',
        technicalFingerprint: 'Classic forward metadata: >5 forwards chain hash match'
      }
    }
  },
  {
    id: 'card-6',
    category: 'social',
    categoryLabel: 'Viral Social Media Post',
    sender: '@CityMetroOfficial',
    timestamp: '4 hours ago',
    channel: 'X (formerly Twitter) Public Dispatch',
    title: 'Metro Blue Line Transit Maintenance Advisory',
    content: 'Metro Commuters Notice: Due to preventive rail track inspection between Sector 14 and Cyber City, Blue Line trains will run at 10-minute intervals between 12:00 PM and 4:00 PM today. High-frequency AC feeder shuttles have been deployed at both terminal stations to avoid passenger crowding.',
    groundTruth: 'SAFE',
    isLegitimate: true,
    baseAudienceImpact: 410,
    isInvestigated: false,
    isDeepInvestigated: false,
    status: 'PENDING',
    aiData: {
      claim: 'Blue Line metro operating with 10-minute frequency for scheduled track inspection with feeder bus support.',
      manipulationSignals: [
        'Verified municipal transit organization handle',
        'Factual, non-emotive logistical announcement',
        'Matches live city municipal dispatch log telemetry',
        'No external links asking for credentials or payments'
      ],
      riskScore: 5,
      riskLevel: 'SAFE',
      confidence: 98,
      explanation: 'Verified public transit advisory from authentic municipal agency. Cross-checked with Metro Rail Control Room logs and local city news feeds.',
      deepForensics: {
        sourceOrigin: 'Verified Government Twitter API client via City Transport Corp',
        domainAge: '9 years verified account',
        propagationRate: 'Organic municipal broadcast',
        networkThreatLevel: 'Clean / Verified Public Utility',
        technicalFingerprint: 'Official Gold-badge verification; cross-verified against GTFS transit feed',
        targetDemographic: 'Daily office commuters and students using metro corridor'
      }
    }
  }
];
