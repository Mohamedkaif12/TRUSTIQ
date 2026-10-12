You are working on my existing TRUSTIQ project.



IMPORTANT:

This is NOT a dashboard project.

This is NOT a quiz application.

This is NOT a chatbot with multiple-choice questions.



TRUSTIQ MUST FEEL AND PLAY LIKE A REAL LEVEL-BASED SERIOUS GAME.



The player must feel like they are progressing through a game, completing missions, protecting a virtual community, earning XP, improving skills, unlocking levels, and eventually facing a final "TRUST WAR".



You must modify the existing implementation to make GAMEPLAY the primary experience while preserving the existing working AI, ML, investigation, consequence, Trust DNA, adaptive gameplay, and Guardian systems.



DO NOT throw away working functionality.



DO NOT rebuild unnecessarily.



Reuse the existing backend and systems wherever possible.



==================================================

1. CORE GAME CONCEPT

==================================================



TRUSTIQ is a serious game about misinformation, scams, manipulation and digital trust.



The player becomes:



DIGITAL GUARDIAN



Their mission:



"Protect your community from information attacks."



The player starts with:



👥 Community Population: 1,000

🛡️ Community Trust: 100

📈 Exposure: 0

🔎 Investigation Credits: 30

⭐ XP: 0

🏆 Rank: Rookie Guardian



The player must progress through levels.



The game progression MUST be:



LEVEL 1

Signal Scout



↓



LEVEL 2

Social Trap



↓



LEVEL 3

Authority Attack



↓



LEVEL 4

Visual Deception



↓



LEVEL 5

Voice & AI Threat



↓



FINAL

TRUST WAR



The player must NOT be able to simply jump directly to the final level.



Levels unlock progressively.



==================================================

2. ABSOLUTE GAMEPLAY REQUIREMENT

==================================================



The application must feel like:



ENTER LEVEL

↓

ENTER MISSION

↓

INFORMATION ATTACK ARRIVES

↓

PLAYER INSPECTS THE ATTACK

↓

PLAYER DECIDES WHETHER TO INVESTIGATE

↓

PLAYER SPENDS INVESTIGATION CREDITS

↓

NOVA INVESTIGATES

↓

PLAYER MAKES FINAL DECISION

↓

GAME WORLD REACTS

↓

PLAYER EARNS/LOSES XP

↓

TRUST DNA CHANGES

↓

MISSION RESULT

↓

NEXT MISSION

↓

LEVEL COMPLETION

↓

NEXT LEVEL UNLOCKED



This loop is the HEART of TRUSTIQ.



Do not replace this with a question-answer interface.



==================================================

3. GAME START SCREEN

==================================================



Create a cinematic but lightweight 2D game start screen.



Show:



TRUSTIQ

TRUST WAR



"PAUSE. INVESTIGATE. DECIDE."



Then:



🛡️ BECOME THE DIGITAL GUARDIAN



Show:



Community:

1,000 Citizens



Community Trust:

100%



Investigation Credits:

30



Guardian Rank:

Rookie Guardian



XP:

0



Primary button:



▶ START MISSION



Secondary:



🧬 VIEW TRUST DNA



Do NOT make this look like an admin dashboard.



It should look like a game command center.



==================================================

4. LEVEL SELECT / WORLD MAP

==================================================



Create a GAME LEVEL MAP.



The player should visually see their progression.



Example:



        🛡️ TRUSTIQ WORLD



        🟢 LEVEL 1

        SIGNAL SCOUT

        "Learn to spot the signal."



                 ↓



        🔒 LEVEL 2

        SOCIAL TRAP

        "Manipulation spreads socially."



                 ↓



        🔒 LEVEL 3

        AUTHORITY ATTACK

        "Not every official-looking message is real."



                 ↓



        🔒 LEVEL 4

        VISUAL DECEPTION

        "Images can lie."



                 ↓



        🔒 LEVEL 5

        VOICE & AI THREAT

        "Seeing and hearing isn't always believing."



                 ↓



        🔒 FINAL

        TRUST WAR

        "Protect the entire community."



Only completed levels unlock the next level.



Locked levels must visibly appear locked.



The player must feel progression.



==================================================

5. LEVEL STRUCTURE

==================================================



Each level must contain MULTIPLE MISSIONS.



Do NOT make one scenario equal one level.



Example:



LEVEL 1 — SIGNAL SCOUT



Mission 1

UPI Refund Alert



Mission 2

College Announcement



Mission 3

Health Forward



Mission 4

Genuine Civic Notice



After completing required missions:



LEVEL COMPLETE



Then unlock Level 2.



Use existing scenario data wherever possible.



If more scenarios are required, create simple additional scenarios following the existing data structure.



==================================================

6. LEVEL 1 — SIGNAL SCOUT

==================================================



Purpose:



Teach the player the basic TRUSTIQ gameplay.



Scenario types:



- suspicious text

- simple scam

- misleading health claim

- genuine information



Difficulty:



EASY



Focus skills:



- Source Verification

- Urgency Detection

- Basic Manipulation Detection



The player learns:



INVESTIGATE → DECIDE → SEE CONSEQUENCE



==================================================

7. LEVEL 2 — SOCIAL TRAP

==================================================



Introduce:



- viral messages

- family forwards

- social pressure

- emotional manipulation

- "everyone is sharing this"

- fear

- anger

- guilt



Difficulty:



EASY → MEDIUM



Focus:



Emotional Manipulation

Manipulation Detection

Urgency Detection



Gameplay should teach:



"Popularity does not equal truth."



==================================================

8. LEVEL 3 — AUTHORITY ATTACK

==================================================



Introduce:



- fake government messages

- fake bank alerts

- fake college notices

- impersonation

- authority pressure

- financial requests



Difficulty:



MEDIUM



Focus:



Authority Bias

Source Verification

Urgency Detection



Gameplay message:



"Official-looking does not automatically mean official."



==================================================

9. LEVEL 4 — VISUAL DECEPTION

==================================================



Introduce:



- manipulated screenshots

- fake certificates

- fake notices

- edited payment screenshots

- misleading images



Difficulty:



MEDIUM → HARD



Focus:



Visual Verification

Manipulation Detection

Source Verification



Player should inspect visual evidence before deciding.



==================================================

10. LEVEL 5 — VOICE & AI THREAT

==================================================



Introduce:



- voice messages

- impersonation

- AI-generated content

- deepfake-style scenarios

- emotional emergency messages

- multimodal attacks



Difficulty:



HARD



Focus:



AI Skepticism

Emotional Manipulation

Authority Bias

Investigation Efficiency



IMPORTANT:



Do not claim that the AI can perfectly detect deepfakes.



The game should teach:



"AI-generated does not automatically mean false."



and:



"AI detection itself can be wrong."



==================================================

11. FINAL LEVEL — TRUST WAR

==================================================



This is the FINAL GAME.



It must feel substantially different from normal missions.



The player receives a large information attack.



Example:



8–10 incoming information events.



Mixed content:



- scam

- genuine message

- misinformation

- manipulated screenshot

- emotional voice message

- fake authority message

- suspicious URL

- AI-generated content



Resources:



👥 Citizens: 1,000



🔎 Investigation Credits: 30



⏱️ Time Limit: 5 minutes



The player must protect the community.



The player cannot deeply investigate everything.



They must prioritize.



This is the strategic climax of the game.



==================================================

12. FINAL TRUST WAR GAME LOOP

==================================================



Information attacks appear dynamically.



Example:



INCOMING ALERT #01

🚨 BANK ALERT



INCOMING ALERT #02

🏫 COLLEGE NOTICE



INCOMING ALERT #03

👨👩👧 FAMILY VOICE MESSAGE



INCOMING ALERT #04

📸 PAYMENT SCREENSHOT



INCOMING ALERT #05

🏛️ GOVERNMENT ANNOUNCEMENT



The player chooses which threat to investigate first.



This is IMPORTANT.



The player should NOT automatically process everything.



Limited resources create strategy.



==================================================

13. INFORMATION ATTACK CARD

==================================================



Every incoming information event must appear as a GAME CARD.



Example:



┌───────────────────────────────┐

│ 🚨 INFORMATION ALERT          │

│                               │

│ "Your UPI refund is waiting." │

│                               │

│ ₹2,500 REFUND                 │

│                               │

│ ACT WITHIN 30 MINUTES         │

│                               │

│ Threat Type: Financial        │

│ Urgency: HIGH                 │

│                               │

│ [ INVESTIGATE ]               │

└───────────────────────────────┘



Do not immediately show the correct answer.



Do not reveal hidden ground truth.



==================================================

14. INVESTIGATION GAMEPLAY

==================================================



When the player selects:



[ INVESTIGATE ]



Open the Investigation Interface.



Show:



🔎 INVESTIGATION CREDITS



30 → 27



Available tools:



QUICK SCAN

Cost: 3



SOURCE CHECK

Cost: 6



SCREENSHOT ANALYSIS

Cost: 8



VOICE ANALYSIS

Cost: 10



DEEP INVESTIGATION

Cost: 15



The player must choose how much investigation to perform.



This is a GAME MECHANIC.



Do not automatically run every tool.



==================================================

15. NOVA AI

==================================================



NOVA is the player's AI Investigation Assistant.



NOVA must NOT be presented as the final authority.



Display:



NOVA

TRUSTIQ INVESTIGATION ASSISTANT



Example:



Risk:

87%



Confidence:

82%



Status:

SUSPICIOUS



Signals:



⚠️ Urgency

⚠️ Financial Request

⚠️ External Link

⚠️ Pressure to Act



Evidence:

Available evidence / verified evidence / unavailable evidence



Uncertainty:

"Signals indicate elevated risk, but they do not independently prove fraud."



Recommendation:



CONTAIN



Then show:



"YOU DECIDE."



==================================================

16. HUMAN DECISION

==================================================



After investigation, the player must personally decide.



Actions:



🟢 ALLOW

🟡 VERIFY

🟠 HOLD

🔴 CONTAIN

🔵 ESCALATE



The player must make the final decision.



NOVA must never automatically execute the decision.



This is a HUMAN-IN-THE-LOOP GAME.



==================================================

17. GAME WORLD CONSEQUENCES

==================================================



After every decision, create a visible game reaction.



CORRECT DECISION:



🛡️ THREAT CONTAINED



Citizens Protected:

+173



Community Trust:

+5



Exposure:

-12



Harm Prevented:

+1



XP:

+40



Trust DNA:

Authority Bias +4



Animate the community reacting positively.



Examples:



- citizens become safe

- warning disappears

- shield animation

- trust meter increases

- XP animation

- Guardian reaction



==================================================

18. WRONG DECISION

==================================================



If the player makes a harmful decision:



⚠️ INFORMATION BREACH



Citizens Exposed:

+240



Community Trust:

-8



Exposure:

+18



Harm Caused:

+1



XP:

-10



Trust DNA weakness detected.



Show a clear but non-punishing explanation.



Example:



"Your decision allowed a high-risk message to spread."



Do NOT reveal hidden ground truth before the decision.



==================================================

19. GENUINE INFORMATION

==================================================



The game MUST contain genuine information.



This is extremely important.



The player should NOT learn:



"Suspicious = Fake."



Include cases where information appears unusual but is genuine.



Correct action may be:



ALLOW



or:



VERIFY



The lesson is:



"Suspicious does not automatically mean false."



==================================================

20. TRUST DNA

==================================================



Trust DNA is the player's skill-development system.



Track:



Source Verification

Manipulation Detection

Emotional Manipulation

Authority Bias

Urgency Detection

Visual Verification

AI Skepticism

Investigation Efficiency



Display these as RPG-style skill bars.



Example:



🧬 TRUST DNA



Source Verification       ████████░░

Manipulation Detection    ██████░░░░

Emotional Manipulation    ████░░░░░░

Authority Bias            ███░░░░░░░

Urgency Detection         ████████░░

Visual Verification       █████░░░░░

AI Skepticism             ███████░░░

Investigation Efficiency  ██████░░░░



The game should identify weak skills.



==================================================

21. ADAPTIVE GAMEPLAY

==================================================



Use the existing adaptive engine.



The next mission should be influenced by the player's weaknesses.



Example:



Player repeatedly fails authority-based messages.



System:



Weakness detected:

AUTHORITY BIAS



Next mission:



🏛️ AUTHORITY ATTACK



This makes the game feel like it is learning about the player.



The game should not simply give random questions.



It should train weaknesses.



==================================================

22. PLAYER PROGRESSION

==================================================



Create RPG-style progression.



XP is earned through gameplay.



XP sources:



Correct decision

+ XP



Correct difficult decision

+ additional XP



Efficient investigation

+ XP



Successful AI override

+ XP



Protecting citizens

+ XP



Bad decisions reduce rewards but should not make the game frustrating.



Ranks:



ROOKIE GUARDIAN



↓



SIGNAL SCOUT



↓



THREAT ANALYST



↓



TRUST GUARDIAN



↓



TRUSTIQ COMMANDER



Show rank-up animations.



==================================================

23. ACHIEVEMENTS

==================================================



Use existing achievement system.



Examples:



🛡️ FIRST LINE OF DEFENSE

Complete first successful containment.



🔎 EVIDENCE HUNTER

Complete multiple evidence-based investigations.



🤖 AI CHALLENGER

Correctly override NOVA.



🧠 MANIPULATION DETECTOR

Identify multiple manipulation attacks.



⏱️ URGENCY BREAKER

Successfully resist urgency pressure.



🏆 TRUST MASTER

Complete advanced challenges.



==================================================

24. AI OVERRIDE GAME MECHANIC

==================================================



This is an important gameplay feature.



Sometimes NOVA can be wrong or uncertain.



If:



NOVA recommends ALLOW



but the player investigates independently and correctly chooses CONTAIN,



show:



🤖 NOVA OVERRIDE SUCCESS



"You challenged the AI and protected the community."



Reward:



AI Skepticism +5

XP +30



This teaches:



"Don't blindly trust AI either."



==================================================

25. COMMUNITY VISUALIZATION

==================================================



The community must feel alive.



Do NOT just show numbers.



Create a lightweight 2D community representation.



Example:



🏙️ TRUST CITY



👥 👥 👥 👥 👥

🏠 🏢 🏫 🏥 🏦

👥 👥 👥 👥 👥



When community trust is high:



- citizens appear safe

- city appears stable

- shield indicator appears



When exposure increases:



- warning indicators appear

- affected zones appear

- citizens react

- city stability decreases



Keep this lightweight.



DO NOT build a 3D game.



DO NOT use Unity.



DO NOT introduce unnecessary game engines.



Use React/CSS animations.



==================================================

26. MISSION RESULT SCREEN

==================================================



After each mission:



MISSION COMPLETE



Show:



Decision:

CONTAIN



Result:

CORRECT



Citizens Protected:

173



Harm Prevented:

1



Community Trust:

+5



XP:

+40



Trust DNA:



Urgency Detection

+4



Investigation Efficiency

+2



Then:



[ CONTINUE MISSION ]



If the final mission of the level is completed:



LEVEL COMPLETE 🎉



Show:



LEVEL 1 COMPLETE



Performance:

87%



Citizens Protected:

743



Investigation Efficiency:

78%



Trust DNA Improvement:

+12



Reward:



🏆 SIGNAL SCOUT UNLOCKED



Then:



[ UNLOCK LEVEL 2 ]



==================================================

27. GAME OVER / FAILURE

==================================================



Do NOT make one wrong answer immediately end the game.



The player should be able to recover.



Only the FINAL TRUST WAR can have a meaningful overall success/failure state.



Example:



TRUST WAR RESULT



Community Protected:

82%



Final Community Trust:

74%



Exposure:

21%



Decision Accuracy:

88%



Investigation Efficiency:

76%



Result:



🏆 COMMUNITY SECURED



OR



⚠️ COMMUNITY COMPROMISED



Then provide:



"Replay Trust War"



==================================================

28. UI/UX RULE

==================================================



The UI must look like a GAME.



NOT:



❌ Admin dashboard

❌ Analytics dashboard

❌ Survey

❌ Exam

❌ Chatbot

❌ Form



Instead:



✅ Mission cards

✅ Level map

✅ XP

✅ Rank

✅ Unlock system

✅ Game resources

✅ Animated consequences

✅ Progress bars

✅ Guardian identity

✅ Community world

✅ Mission result screens

✅ Achievements

✅ Trust DNA

✅ Final boss-style challenge



Use modern dark futuristic UI.



Keep it clean and professional.



Avoid excessive animations that affect performance.



==================================================

29. NAVIGATION

==================================================



Main navigation:



🏠 COMMAND CENTER



🗺️ LEVELS



🎮 PLAY



🧬 TRUST DNA



🏆 ACHIEVEMENTS



👤 GUARDIAN



Do not make the application primarily dashboard-oriented.



PLAY must be the central experience.



==================================================

30. EXISTING BACKEND PRESERVATION

==================================================



Preserve existing:



FastAPI

SQLite

Game Engine

AI Agent

NOVA

Trust DNA

Adaptive Engine

Decision Engine

Community State

Guardian System

Scenario System

Investigation Tools



Do not rewrite working systems unnecessarily.



Integrate the new gameplay layer with existing APIs.



==================================================

31. GAME STATE

==================================================



Maintain persistent game state.



At minimum:



player_id



current_level



current_mission



completed_missions



unlocked_levels



xp



rank



investigation_credits



community_population



community_trust



exposure



harm_prevented



harm_caused



trust_dna



achievements



mission_history



guardian_profile



Do not reset the player after every page refresh.



==================================================

32. GAME STATE MACHINE

==================================================



Implement a clear gameplay state machine.



States:



LEVEL_LOCKED



LEVEL_READY



MISSION_INTRO



INCOMING_ATTACK



INVESTIGATION



DECISION



CONSEQUENCE



MISSION_RESULT



NEXT_MISSION



LEVEL_COMPLETE



NEXT_LEVEL_UNLOCKED



FINAL_TRUST_WAR



FINAL_RESULT



The UI should visually transition between these states.



==================================================

33. LEVEL UNLOCK RULES

==================================================



Example:



Level 1:

Unlocked by default.



Level 2:

Unlock after Level 1 completion.



Level 3:

Unlock after Level 2 completion.



Level 4:

Unlock after Level 3 completion.



Level 5:

Unlock after Level 4 completion.



Trust War:

Unlock after Level 5 completion.



The player must experience progression.



==================================================

34. DO NOT MAKE THESE MISTAKES

==================================================



DO NOT:



- turn the game into a questionnaire

- show the correct answer before the player decides

- automatically investigate every message

- automatically make decisions

- allow all levels from the beginning

- make every message fake

- treat suspicious as false

- treat AI output as truth

- reveal hidden ground truth to the player

- make NOVA the decision maker

- remove investigation credits

- remove consequences

- remove Trust DNA

- remove adaptive gameplay

- replace the game with charts

- build a 3D game

- add unnecessary multiplayer

- add blockchain

- add unnecessary microservices

- over-engineer the game



==================================================

35. IMPORTANT GAME DESIGN PRINCIPLE

==================================================



The player's experience must always be:



"I am protecting my community."



NOT:



"I am answering questions."



Every feature must support this feeling.



==================================================

36. CORE GAME LOOP — FINAL

==================================================



The final implementation must revolve around:



        INFORMATION ATTACK

                ↓

        PLAYER OBSERVES

                ↓

        CHOOSE INVESTIGATION

                ↓

        SPEND CREDITS

                ↓

        NOVA INVESTIGATES

                ↓

        PLAYER DECIDES

                ↓

       COMMUNITY REACTS

                ↓

         XP + REWARDS

                ↓

        TRUST DNA UPDATE

                ↓

       ADAPTIVE NEXT MISSION

                ↓

          LEVEL PROGRESS

                ↓

           NEXT LEVEL



==================================================

37. FINAL TRUSTIQ GAME JOURNEY

==================================================



The complete player journey must feel like:



START GAME



↓



CREATE DIGITAL GUARDIAN



↓



COMMAND CENTER



↓



LEVEL 1

SIGNAL SCOUT



↓



COMPLETE MISSIONS



↓



EARN XP



↓



IMPROVE TRUST DNA



↓



LEVEL 2 UNLOCKED



↓



SOCIAL TRAP



↓



LEVEL 3



AUTHORITY ATTACK



↓



LEVEL 4



VISUAL DECEPTION



↓



LEVEL 5



VOICE & AI THREAT



↓



FINAL TRUST WAR



↓



PROTECT 1,000 CITIZENS



↓



FINAL SCORE



↓



TRUSTIQ COMMANDER



==================================================

38. IMPLEMENTATION PRIORITY

==================================================



Prioritize in this exact order:



1. Actual playable level progression

2. Mission system

3. Information attack cards

4. Investigation gameplay

5. Decision gameplay

6. Visible community consequences

7. XP and progression

8. Trust DNA

9. Adaptive missions

10. Guardian progression

11. Level map

12. Final Trust War

13. Animations and polish



If time is limited, gameplay MUST be prioritized over visual polish.



==================================================

39. TESTING

==================================================



Test the complete gameplay flow:



START GAME

→ LEVEL 1

→ MISSION 1

→ INVESTIGATE

→ SPEND CREDITS

→ NOVA RESULT

→ PLAYER DECISION

→ CONSEQUENCE

→ XP

→ TRUST DNA

→ NEXT MISSION

→ COMPLETE LEVEL

→ UNLOCK LEVEL 2



Then test:



Level 2 → Level 3 → Level 4 → Level 5 → Trust War.



Test:



- level locking

- level unlocking

- mission progression

- credits

- XP

- rank

- Trust DNA

- community trust

- exposure

- consequences

- adaptive mission selection

- Guardian profile

- refresh persistence

- AI override

- genuine information scenario

- wrong decision recovery



==================================================

40. AUTONOMOUS EXECUTION

==================================================



WORK AUTONOMOUSLY.



Do not ask me for permission for routine implementation decisions.



Inspect the existing project first.



Understand the existing architecture.



Reuse existing functionality.



Implement the gameplay layer directly.



Run the application.



Run tests.



Fix errors.



Verify the complete playable flow.



Do not stop after making UI changes.



Do not simply describe what should be done.



ACTUALLY IMPLEMENT IT.



At the end, provide:



1. What was changed

2. Gameplay flow implemented

3. Levels implemented

4. Existing systems integrated

5. Tests performed

6. Any remaining limitations



MOST IMPORTANT:



TRUSTIQ MUST NOW BE A PLAYABLE LEVEL-BASED GAME.



The player must feel:



"I am playing a game.

I am the Digital Guardian.

I am protecting 1,000 citizens.

I have limited investigation resources.

I must decide what information to trust.

My decisions change the world.

My skills improve.

The game adapts to my weaknesses.

I progress through levels.

Finally, I face the TRUST WAR."



Core tagline:



PAUSE. INVESTIGATE. DECIDE.



Core gameplay principle:



AI investigates.

Human decides.

The community reacts.

The player learns.

The next challenge adapts.

<ADDITIONAL_METADATA>
The current local time is: 2026-10-08T17:23:58+05:30.

The user's current state is as follows:
Active Document: f:\PROJECTS\TRUSTIQ\backend\database.py (LANGUAGE_PYTHON)
Cursor is on line: 1
Other open documents:
- f:\PROJECTS\TRUSTIQ\package.json (LANGUAGE_JSON)
- f:\PROJECTS\TRUSTIQ\backend\services\evidence_service.py (LANGUAGE_PYTHON)
- f:\PROJECTS\TRUSTIQ\backend\database.py (LANGUAGE_PYTHON)
- f:\PROJECTS\TRUSTIQ\README.md (LANGUAGE_MARKDOWN)
No browser pages are currently open.
Running terminal commands:
- npm run dev -- --host 0.0.0.0
 (in f:\PROJECTS\TRUSTIQ, running for 4h40m32s)
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from Gemini 3.8 Flash (Medium) to Claude Sonnet 4.6 (Thinking). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>