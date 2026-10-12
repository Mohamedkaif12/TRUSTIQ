import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).parent / "trustiq.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(drop_existing: bool = False):
    conn = get_connection()
    cursor = conn.cursor()

    if drop_existing:
        cursor.execute("DROP TABLE IF EXISTS scenarios")
        cursor.execute("DROP TABLE IF EXISTS player_state")
        cursor.execute("DROP TABLE IF EXISTS community_state")
        cursor.execute("DROP TABLE IF EXISTS trust_dna")
        cursor.execute("DROP TABLE IF EXISTS scenario_investigations")
        cursor.execute("DROP TABLE IF EXISTS player_decisions")

    # Scenarios Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scenarios (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        sender TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        content TEXT NOT NULL,
        content_type TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        ground_truth TEXT NOT NULL,
        correct_action TEXT NOT NULL,
        explanation TEXT NOT NULL,
        manipulation_signals TEXT NOT NULL,
        investigation_data TEXT NOT NULL,
        base_audience INTEGER NOT NULL DEFAULT 250
    )
    """)

    # Player State Table (Phase 6 Digital Guardian)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS player_state (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT 'Agent Commander',
        avatar TEXT NOT NULL DEFAULT 'AGENT',
        level INTEGER NOT NULL DEFAULT 1,
        rank TEXT NOT NULL DEFAULT 'ROOKIE GUARDIAN',
        xp INTEGER NOT NULL DEFAULT 0,
        trust_score INTEGER NOT NULL DEFAULT 0,
        investigation_credits INTEGER NOT NULL DEFAULT 30,
        community_population INTEGER NOT NULL DEFAULT 1000,
        community_trust INTEGER NOT NULL DEFAULT 100,
        community_exposure INTEGER NOT NULL DEFAULT 0,
        missions_completed INTEGER NOT NULL DEFAULT 0
    )
    """)

    # Community State Table (Phase 5)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS community_state (
        id TEXT PRIMARY KEY,
        population INTEGER NOT NULL DEFAULT 1000,
        community_trust INTEGER NOT NULL DEFAULT 100,
        exposure INTEGER NOT NULL DEFAULT 0,
        harm_prevented INTEGER NOT NULL DEFAULT 0,
        harm_caused INTEGER NOT NULL DEFAULT 0,
        safe_decisions INTEGER NOT NULL DEFAULT 0,
        unsafe_decisions INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Trust DNA Table (Phase 5)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trust_dna (
        player_id TEXT PRIMARY KEY,
        source_verification INTEGER NOT NULL DEFAULT 50,
        manipulation_detection INTEGER NOT NULL DEFAULT 50,
        emotional_manipulation INTEGER NOT NULL DEFAULT 50,
        authority_bias INTEGER NOT NULL DEFAULT 50,
        urgency_detection INTEGER NOT NULL DEFAULT 50,
        visual_verification INTEGER NOT NULL DEFAULT 50,
        ai_skepticism INTEGER NOT NULL DEFAULT 50,
        investigation_efficiency INTEGER NOT NULL DEFAULT 50,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Scenario Investigation History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scenario_investigations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id TEXT NOT NULL,
        scenario_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        credits_cost INTEGER NOT NULL,
        ai_recommendation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Safe migration for existing DB: add any missing columns to scenario_investigations
    cursor.execute("PRAGMA table_info(scenario_investigations)")
    si_cols = {col["name"] for col in cursor.fetchall()}
    if "ai_recommendation" not in si_cols:
        cursor.execute("ALTER TABLE scenario_investigations ADD COLUMN ai_recommendation TEXT")

    # Final Decisions Table (Phase 5 expanded)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS player_decisions (
        scenario_id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        decision TEXT NOT NULL,
        ai_recommendation TEXT,
        is_correct INTEGER NOT NULL,
        credits_spent INTEGER NOT NULL DEFAULT 0,
        trust_points_delta INTEGER NOT NULL,
        community_trust_delta INTEGER NOT NULL,
        community_exposure_delta INTEGER NOT NULL,
        harm_prevented_delta INTEGER NOT NULL DEFAULT 0,
        harm_caused_delta INTEGER NOT NULL DEFAULT 0,
        ai_override_success INTEGER NOT NULL DEFAULT 0,
        explanation TEXT NOT NULL,
        simulation_impact_summary TEXT,
        trust_dna_deltas TEXT,
        decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Safe migration for existing DB: add any missing columns to player_decisions
    cursor.execute("PRAGMA table_info(player_decisions)")
    existing_cols = {col["name"] for col in cursor.fetchall()}
    columns_to_add = {
        "ai_recommendation": "TEXT",
        "credits_spent": "INTEGER NOT NULL DEFAULT 0",
        "harm_prevented_delta": "INTEGER NOT NULL DEFAULT 0",
        "harm_caused_delta": "INTEGER NOT NULL DEFAULT 0",
        "ai_override_success": "INTEGER NOT NULL DEFAULT 0",
        "simulation_impact_summary": "TEXT",
        "trust_dna_deltas": "TEXT",
    }
    for col_name, col_type in columns_to_add.items():
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE player_decisions ADD COLUMN {col_name} {col_type}")

    # Safe migration for existing DB: add any missing columns to player_state
    cursor.execute("PRAGMA table_info(player_state)")
    existing_player_cols = {col["name"] for col in cursor.fetchall()}
    player_cols_to_add = {
        "avatar": "TEXT NOT NULL DEFAULT 'AGENT'",
        "xp": "INTEGER NOT NULL DEFAULT 0",
        "rank": "TEXT NOT NULL DEFAULT 'ROOKIE GUARDIAN'",
        "missions_completed": "INTEGER NOT NULL DEFAULT 0",
    }
    for col_name, col_type in player_cols_to_add.items():
        if col_name not in existing_player_cols:
            cursor.execute(f"ALTER TABLE player_state ADD COLUMN {col_name} {col_type}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
