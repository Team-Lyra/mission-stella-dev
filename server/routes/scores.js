const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/scores - Obter ranking / leaderboard
router.get('/', (req, res) => {
  try {
    res.json(db.getScores());
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ranking', details: err.message });
  }
});

// POST /api/scores - Registrar pontuação de missão completada
router.post('/', (req, res) => {
  try {
    const { player_id, mission_id, score } = req.body;
    if (!player_id || !mission_id || score === undefined) {
      return res.status(400).json({ error: 'player_id, mission_id e score são obrigatórios' });
    }

    const newScore = db.addScore(player_id, mission_id, score);
    res.status(201).json(newScore);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar pontuação', details: err.message });
  }
});

module.exports = router;
