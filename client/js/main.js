// ============================================
// main.js — Ponto de Entrada do Jogo Missão Taquari
// ============================================

window.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Inicializando Missão Taquari...');

  const canvas = document.getElementById('gameCanvas');
  const loading = document.getElementById('loading');

  try {
    // Inicializa o motor do jogo
    await Game.init(canvas);

    // Widget de clima real (Meteomatics) — falha silenciosa se servidor offline
    Weather.init().catch(() => {});

    // Remove tela de loading com transição suave
    if (loading) {
      loading.classList.add('hidden');
      setTimeout(() => {
        loading.style.display = 'none';
      }, 500);
    }

    console.log('✅ Missão Taquari carregada com sucesso! Pronto para jogar.');
  } catch (err) {
    console.error('❌ Erro na inicialização:', err);
    if (loading) {
      loading.innerHTML = `
        <h1 style="color:#e63946;">Erro ao Carregar</h1>
        <p style="color:#ffffff;">${err.message}</p>
        <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;background:#ffd700;border:none;cursor:pointer;font-weight:bold;">Tentar Novamente</button>
      `;
    }
  }
});

