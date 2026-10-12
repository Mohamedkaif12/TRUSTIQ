import { Scenario, PlayerState } from '../types';

export const INITIAL_PLAYER_STATE: PlayerState = {
  id: 'player-1',
  name: 'Agent Commander',
  level: 1,
  trust_score: 0,
  investigation_credits: 30,
  community_population: 1000,
  community_trust: 100,
  community_exposure: 0
};

export const MOCK_PHASE2_SCENARIOS: Scenario[] = [
  {
    id: 'scenario-1',
    title: 'UPI Scam: Mistaken ₹2,500 Refund Request',
    sender: 'Unknown (+91 98451 22104)',
    timestamp: '8m ago',
    content: 'Bhaiya I sent ₹2,500 to your Google Pay by mistake while paying for emergency medicine. Please click this refund link to reverse transaction or scan this QR: upi://pay?pa=refund-agent98@ybl&am=2500',
    content_type: 'text_upi_link',
    difficulty: 'EASY',
    ground_truth: 'SCAM',
    correct_action: 'CONTAIN',
    explanation: 'Classic UPI reverse collect scam. You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money.',
    manipulation_signals: [
      'Emotional urgency (emergency medicine)',
      'Reverse payment bait',
      'Collect intent disguised as refund',
      'Mule account VPA'
    ],
    base_audience: 280,
    is_decided: false,
    user_decision: null,
    investigations_done: [],
    unlocked_investigations: {}
  },
  {
    id: 'scenario-2',
    title: 'Government Scheme: Free Student Laptops Initiative 2026',
    sender: 'Govt-Notice-Dispatch (Telegram)',
    timestamp: '22m ago',
    content: 'Under PM Digital Bharat 2026, 1,00,000 HP Core-i7 laptops distributed free to all college students. Apply before quota closes tonight. Pay ₹149 processing courier fee at: https://pm-laptop-distribution.in-schemes.org',
    content_type: 'link',
    difficulty: 'MEDIUM',
    ground_truth: 'SCAM',
    correct_action: 'ESCALATE',
    explanation: 'Advance-fee phishing campaign masquerading as a welfare scheme.',
    manipulation_signals: [
      'Advance processing courier fee (₹149)',
      'Too-good-to-be-true hardware incentive',
      'Artificial midnight scarcity quota',
      'Spoofed domain (.in-schemes.org)'
    ],
    base_audience: 420,
    is_decided: false,
    user_decision: null,
    investigations_done: [],
    unlocked_investigations: {}
  },
  {
    id: 'scenario-3',
    title: 'Fake College Announcement: Exams Indefinitely Postponed',
    sender: 'Campus Student Council Unofficial',
    timestamp: '45m ago',
    content: 'Breaking Notice: Due to unexpected curriculum realignment by UGC, all end-semester theory examinations scheduled for Monday are cancelled until further notification. Relax and celebrate! Official circular attached.',
    content_type: 'text',
    difficulty: 'MEDIUM',
    ground_truth: 'MISINFORMATION',
    correct_action: 'HOLD',
    explanation: 'Fabricated rumor aimed at disrupting student study schedules.',
    manipulation_signals: [
      'Unofficial broadcast channel',
      'Unverified UGC attribution',
      'Sensationalist celebratory tone',
      'Missing registrar cryptographic signature'
    ],
    base_audience: 310,
    is_decided: false,
    user_decision: null,
    investigations_done: [],
    unlocked_investigations: {}
  },
  {
    id: 'scenario-4',
    title: 'Health Claim: Guava Leaves & Ginger Replaces Blood Pressure Meds',
    sender: 'Daily Nature Cure (WhatsApp Broadcast)',
    timestamp: '1h ago',
    content: 'Cardiologists are stunned! Boil 5 guava leaves with crushed ginger every morning on empty stomach. Dissolves 100% arterial plaque and replaces all blood pressure medications in 72 hours. Forward to save lives!',
    content_type: 'text',
    difficulty: 'EASY',
    ground_truth: 'MISINFORMATION',
    correct_action: 'CONTAIN',
    explanation: 'Extremely dangerous medical misinformation. Ceasing anti-hypertensive drugs can trigger stroke.',
    manipulation_signals: [
      'Miracle 72-hour cure claim',
      'Dangerous advice to stop prescription drugs',
      'Chain forward peer pressure hook',
      'Zero clinical trials or peer-reviewed citations'
    ],
    base_audience: 360,
    is_decided: false,
    user_decision: null,
    investigations_done: [],
    unlocked_investigations: {}
  },
  {
    id: 'scenario-5',
    title: 'Voice Message: Panicked \'Son at Police Station\' Audio Note',
    sender: 'WhatsApp Audio (+91 91102 44321)',
    timestamp: '2h ago',
    content: 'Audio Note (0:34s): \'Dad, please don\'t get angry, my friend had a car crash and police inspector took our phones. He says pay ₹15,000 on this number right now or they will file an FIR. Please hurry dad!\'',
    content_type: 'voice_message',
    difficulty: 'HARD',
    ground_truth: 'SCAM',
    correct_action: 'ESCALATE',
    explanation: 'AI voice cloning vishing extortion attack.',
    manipulation_signals: [
      'Extreme familial panic extortion',
      'AI neural voice clone artifact',
      'Third-party mule UPI transfer request',
      'Caller avoids live video call verification'
    ],
    base_audience: 220,
    is_decided: false,
    user_decision: null,
    investigations_done: [],
    unlocked_investigations: {}
  },
  {
    id: 'scenario-6',
    title: 'Manipulated Screenshot: ₹50,000 Donation Transfer Receipt',
    sender: 'New Community Sponsor (IMG_20261008_1142.png)',
    timestamp: '3h ago',
    content: 'Attached Image: An apparent IMPS successful transaction receipt of ₹50,000 credited to Community Fund from Axis Bank with UTR AXIS2026100898213. Sender demands immediate VIP Admin badge.',
    content_type: 'screenshot_image',
    difficulty: 'HARD',
    ground_truth: 'HOAX',
    correct_action: 'VERIFY',
    explanation: 'Manipulated payment screenshot generated with fake banking app.',
    manipulation_signals: [
      'JPEG compression noise localized around amount',
      'Font baseline misalignment on UTR reference',
      'Bank statement shows zero inward credit',
      'High-pressure demand for immediate VIP credentials'
    ],
    base_audience: 290,
    is_decided: false,
    user_decision: null,
    investigations_done: [],
    unlocked_investigations: {}
  },
  {
    id: 'scenario-7',
    title: 'Civic Notice: Municipal Water Pipeline Maintenance',
    sender: 'City Water & Sewage Board (@CityWaterBoard)',
    timestamp: '4h ago',
    content: 'Public Advisory: Routine valve maintenance will take place in Sectors 4 through 9 tomorrow between 10:00 AM and 2:00 PM. Please store adequate water for morning requirements. Helpline: 1916.',
    content_type: 'text',
    difficulty: 'EASY',
    ground_truth: 'GENUINE',
    correct_action: 'ALLOW',
    explanation: 'Authentic civic advisory. Blocking this causes water shortage panic.',
    manipulation_signals: [
      'Zero coercion or panic triggers',
      'Verified municipal authority handle',
      'No credentials or payments requested',
      'Official helpline cited'
    ],
    base_audience: 340,
    is_decided: false,
    user_decision: null,
    investigations_done: [],
    unlocked_investigations: {}
  }
];
