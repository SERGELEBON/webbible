-- ==============================================
--  MIGRATION DATABASE – VERSION PRODUCTION
--  Auteur : POEGNAN SERGE GUEHI
--  Description : Création des tables, indexes,
--  contraintes, triggers et fonctions.
-- ==============================================

-- ==============================================
-- 1. FONCTION GÉNÉRIQUE : updated_at automatique
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 2. CRÉATION DES TABLES
-- ==============================================

-------------------------------------------------
-- TABLE : users
-------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
                             );

-------------------------------------------------
-- TABLE : chat_messages
-------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
                                             id SERIAL PRIMARY KEY,
                                             user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general','bible','ai','system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );

-------------------------------------------------
-- TABLE : audio_files
-------------------------------------------------
CREATE TABLE IF NOT EXISTS audio_files (
                                           id SERIAL PRIMARY KEY,
                                           book_id VARCHAR(50) NOT NULL,
    chapter INTEGER NOT NULL CHECK (chapter > 0),
    file_url TEXT NOT NULL,
    duration INTEGER CHECK (duration >= 0),
    file_size INTEGER CHECK (file_size >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(book_id, chapter)
    );

-------------------------------------------------
-- TABLE : strongs_entries
-------------------------------------------------
CREATE TABLE IF NOT EXISTS strongs_entries (
                                               id SERIAL PRIMARY KEY,
                                               code VARCHAR(10) UNIQUE NOT NULL,
    language VARCHAR(10) NOT NULL CHECK (language IN ('hebrew','greek')),
    word VARCHAR(255) NOT NULL,
    transliteration VARCHAR(255),
    definition TEXT NOT NULL,
    usage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );

-------------------------------------------------
-- TABLE : reading_plans
-------------------------------------------------
CREATE TABLE IF NOT EXISTS reading_plans (
                                             id SERIAL PRIMARY KEY,
                                             user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) DEFAULT 'yearly' CHECK (plan_type IN ('yearly','monthly','custom')),
    current_day INTEGER DEFAULT 1 CHECK (current_day >= 1),
    completed_days JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );

-- ==============================================
-- 3. TRIGGERS
-- ==============================================

-- Trigger mise à jour updated_at (version idempotente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'tr_reading_plans_updated_at'
    ) THEN
CREATE TRIGGER tr_reading_plans_updated_at
    BEFORE UPDATE ON reading_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END IF;
END
$$;

-- ==============================================
-- 4. INDEXES
-- ==============================================

-- chat_messages : réactivité + tri
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id
    ON chat_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
    ON chat_messages(created_at DESC);

-- reading_plans
CREATE INDEX IF NOT EXISTS idx_reading_plans_user_id
    ON reading_plans(user_id);

-- strongs_entries : recherches rapides Strong’s
CREATE INDEX IF NOT EXISTS idx_strongs_code
    ON strongs_entries(code);

-- audio_files
CREATE INDEX IF NOT EXISTS idx_audio_book_chapter
    ON audio_files(book_id, chapter);
