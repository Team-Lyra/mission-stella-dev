require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const playersRouter = require('./routes/players');
const missionsRouter = require('./routes/missions');
const scoresRouter = require('./routes/scores');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do cliente
app.use(express.static(path.join(__dirname, '..', 'client')));

// Rotas da API
app.use('/api/players', playersRouter);
app.use('/api/missions', missionsRouter);
app.use('/api/scores', scoresRouter);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor Missão Taquari operacional 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Fallback: servir index.html para rotas não-API (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Missão Taquari rodando na porta ${PORT}`);
  console.log(`🌍 Acesse: http://localhost:${PORT}`);
});
