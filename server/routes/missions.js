const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/missions - Listar todas as missões
router.get('/', (req, res) => {
  try {
    res.json(db.getMissions());
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar missões', details: err.message });
  }
});

// GET /api/missions/:id - Obter detalhes de uma missão
router.get('/:id', (req, res) => {
  try {
    const mission = db.getMission(req.params.id);
    if (!mission) return res.status(404).json({ error: 'Missão não encontrada' });
    res.json(mission);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar missão', details: err.message });
  }
});

module.exports = router;
