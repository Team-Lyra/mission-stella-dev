const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/players - Listar jogadores
router.get('/', (req, res) => {
  try {
    res.json(db.getPlayers());
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar jogadores', details: err.message });
  }
});

// POST /api/players - Criar ou entrar como jogador
router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    const newPlayer = db.createPlayer(name);
    res.status(201).json(newPlayer);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar jogador', details: err.message });
  }
});

// GET /api/players/:id - Obter estado do jogador
router.get('/:id', (req, res) => {
  try {
    const player = db.getPlayer(req.params.id);
    if (!player) return res.status(404).json({ error: 'Jogador não encontrado' });
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar jogador', details: err.message });
  }
});

// PUT /api/players/:id - Atualizar progresso do jogador (save game)
router.put('/:id', (req, res) => {
  try {
    const updated = db.updatePlayer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Jogador não encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar jogador', details: err.message });
  }
});

module.exports = router;
