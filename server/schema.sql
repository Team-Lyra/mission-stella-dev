-- =============================================
-- Missão Taquari - Schema do Banco de Dados
-- =============================================

-- Criar banco de dados (executar separadamente se necessário)
-- CREATE DATABASE missao_taquari;

-- Tabela de jogadores
CREATE TABLE IF NOT EXISTS players (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    score           INTEGER DEFAULT 0,
    current_mission INTEGER DEFAULT 1,
    satellite_config JSONB DEFAULT '{}',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de missões
CREATE TABLE IF NOT EXISTS missions (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    problem_type    VARCHAR(100) NOT NULL,
    difficulty      INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    npc_name        VARCHAR(100) NOT NULL,
    npc_dialog      TEXT NOT NULL,
    solution_text   TEXT NOT NULL,
    impact_text     TEXT NOT NULL,
    nasa_tips       TEXT NOT NULL
);

-- Tabela de pontuações
CREATE TABLE IF NOT EXISTS scores (
    id              SERIAL PRIMARY KEY,
    player_id       INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    mission_id      INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    score           INTEGER NOT NULL CHECK (score >= 0),
    completed_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, mission_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_scores_player_id ON scores(player_id);
CREATE INDEX IF NOT EXISTS idx_scores_mission_id ON scores(mission_id);
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_players_score ON players(score DESC);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at na tabela players
DROP TRIGGER IF EXISTS trigger_update_players_updated_at ON players;
CREATE TRIGGER trigger_update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
