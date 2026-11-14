// ============================================
// minigame.js — Testes da NASA e Sequência de Lançamento
// ============================================

const LaunchMinigame = {
  active: false,
  stage: 0, // 0 = Teste Vácuo, 1 = Teste Vibração, 2 = Ignição & Lançamento, 3 = Sucesso
  sequence: [],
  playerSequence: [],
  keysAllowed: ['KeyQ', 'KeyW', 'KeyE', 'KeyR'],
  keyLabels: { 'KeyQ': 'Q', 'KeyW': 'W', 'KeyE': 'E', 'KeyR': 'R' },
  keyColors: {
    'KeyQ': '#e63946',
    'KeyW': '#457b9d',
    'KeyE': '#2a9d8f',
    'KeyR': '#e76f51'
  },
  timer: 0,
  maxTime: 7.0, // segundos por sequência
  score: 0,
  rocketY: 0,
  particles: [],
  onComplete: null,
  feedbackText: '',
  feedbackColor: '#ffffff',
  feedbackTimer: 0,

  stageNames: [
    'FASE 1: TESTE DE CÂMARA DE VÁCUO TÉRMICO',
    'FASE 2: TESTE DE RESISTÊNCIA À VIBRAÇÃO ACÚSTICA',
    'FASE 3: SEQUÊNCIA DE IGNIÇÃO E INJEÇÃO ORBITAL'
  ],

  stageTips: [
    'No vácuo espacial não há ar; o calor do satélite se dissipa apenas por radiação.',
    'Durante a subida do foguete, ondas sonoras intensas vibram toda a fuselagem.',
    'Ignição dos motores a propelente criogênico e controle de empuxo!'
  ],

  init() {
    this.active = false;
    this.stage = 0;
    this.particles = [];
  },

  start(onComplete) {
    this.active = true;
    this.stage = 0;
    this.score = 500;
    this.rocketY = 0;
    this.particles = [];
    this.onComplete = onComplete;
    this.nextSequence();
  },

  nextSequence() {
    this.playerSequence = [];
    this.sequence = [];
    this.timer = this.maxTime;
    this.feedbackText = '';

    // Gera de 3 a 5 botões na sequência
    const length = 3 + this.stage;
    for (let i = 0; i < length; i++) {
      const randomKey = this.keysAllowed[Math.floor(Math.random() * this.keysAllowed.length)];
      this.sequence.push(randomKey);
    }
  },

  handleInput(e) {
    if (!this.active || this.stage >= 3) return;

    const code = e.code;
    if (!this.keysAllowed.includes(code)) return;

    const expected = this.sequence[this.playerSequence.length];
    if (code === expected) {
      this.playerSequence.push(code);
      this.feedbackText = '✓ COMANDO CORRETO!';
      this.feedbackColor = '#52b788';
      this.feedbackTimer = 0.5;

      // Completou esta fase?
      if (this.playerSequence.length === this.sequence.length) {
        this.score += 250 + Math.round(this.timer * 40);
        this.stage++;

        if (this.stage < 3) {
          this.feedbackText = 'TESTE APROVADO! AVANÇANDO...';
          this.feedbackColor = '#ffd700';
          setTimeout(() => {
            if (this.active) this.nextSequence();
          }, 600);
        } else {
          // Lançamento com sucesso!
          this.stage = 3;
          this.feedbackText = '🚀 DECOLAGEM AUTORIZADA! SATÉLITE EM ÓRBITA!';
          this.feedbackColor = '#00f5d4';
          this.launchRocket();
        }
      }
    } else {
      // Errou botão
      this.feedbackText = '✗ SEQUÊNCIA INCORRETA! TENTE NOVAMENTE!';
      this.feedbackColor = '#e63946';
      this.feedbackTimer = 0.8;
      this.playerSequence = [];
      this.score = Math.max(100, this.score - 50);
    }
  },

  launchRocket() {
    this.rocketY = 0;
    // Dispara partículas de fogo
    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: 0,
        y: 80,
        vx: (Math.random() - 0.5) * 80,
        vy: Math.random() * 120 + 80,
        size: Math.random() * 8 + 3,
        color: Math.random() > 0.5 ? '#ff9e00' : '#d00000',
        life: 1.0
      });
    }

    setTimeout(() => {
      this.active = false;
      if (this.onComplete) {
        this.onComplete(this.score);
      }
    }, 3200);
  },

  update(dt) {
    if (!this.active) return;

    if (this.feedbackTimer > 0) {
      this.feedbackTimer -= dt;
    }

    if (this.stage < 3) {
      this.timer -= dt;
      if (this.timer <= 0) {
        // Tempo esgotado para a sequência
        this.feedbackText = 'TEMPO ESGOTADO! REINICIANDO TESTE...';
        this.feedbackColor = '#e63946';
        this.nextSequence();
      }
    } else {
      // Animação do foguete subindo
      this.rocketY += dt * 380;

      // Gerador contínuo de chamas
      for (let i = 0; i < 4; i++) {
        this.particles.push({
          x: (Math.random() - 0.5) * 20,
          y: 75,
          vx: (Math.random() - 0.5) * 40,
          vy: Math.random() * 100 + 100,
          size: Math.random() * 10 + 4,
          color: Math.random() > 0.4 ? '#ffb703' : '#fb8500',
          life: 0.8
        });
      }

      // Atualiza partículas
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 1.5;
        p.size *= 0.95;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }
  },

  render(ctx, w, h) {
    if (!this.active) return;

    ctx.save();

    // Fundo espacial dramático
    ctx.fillStyle = '#060a1c';
    ctx.fillRect(0, 0, w, h);

    // Linhas de monitor e HUD da NASA
    ctx.strokeStyle = 'rgba(0, 180, 216, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // Título do Minigame
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛰️ CENTRO DE CONTROLE DE MISSÃO — PADRÃO NASA', w / 2, 60);

    if (this.stage < 3) {
      // Nome da fase atual
      ctx.fillStyle = '#00f5d4';
      ctx.font = 'bold 16px "Segoe UI", sans-serif';
      ctx.fillText(this.stageNames[this.stage], w / 2, 95);

      // Dica educacional da NASA sobre o teste
      ctx.fillStyle = '#adb5bd';
      ctx.font = 'italic 13px "Segoe UI", sans-serif';
      ctx.fillText(this.stageTips[this.stage], w / 2, 122);

      // Barra de tempo
      const barW = 320;
      const barH = 14;
      const barX = w / 2 - barW / 2;
      const barY = 145;
      const pct = Math.max(0, this.timer / this.maxTime);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = pct > 0.3 ? '#52b788' : '#e63946';
      ctx.fillRect(barX, barY, barW * pct, barH);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      // Instrução de comando
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Segoe UI", sans-serif';
      ctx.fillText('Digite a sequência de telemetria exata:', w / 2, 195);

      // Caixa da Sequência de Teclas
      const totalKeys = this.sequence.length;
      const keyBoxSize = 58;
      const spacing = 16;
      const startX = w / 2 - ((totalKeys * keyBoxSize) + (totalKeys - 1) * spacing) / 2;
      const keyY = 220;

      for (let i = 0; i < totalKeys; i++) {
        const k = this.sequence[i];
        const kx = startX + i * (keyBoxSize + spacing);
        const isDone = i < this.playerSequence.length;
        const isCurrent = i === this.playerSequence.length;

        // Fundo da tecla
        ctx.fillStyle = isDone ? '#52b788' : (isCurrent ? '#ffd700' : 'rgba(255, 255, 255, 0.1)');
        ctx.beginPath();
        ctx.roundRect(kx, keyY, keyBoxSize, keyBoxSize, 8);
        ctx.fill();

        ctx.strokeStyle = isCurrent ? '#ffffff' : (isDone ? '#2d6a4f' : 'rgba(255, 255, 255, 0.3)');
        ctx.lineWidth = isCurrent ? 3 : 1.5;
        ctx.stroke();

        // Letra da tecla
        ctx.fillStyle = (isDone || isCurrent) ? '#0a0a2e' : '#ffffff';
        ctx.font = 'bold 24px "Segoe UI", sans-serif';
        ctx.fillText(this.keyLabels[k] || k, kx + keyBoxSize / 2, keyY + 38);
      }

      // Feedback em tempo real
      if (this.feedbackText) {
        ctx.fillStyle = this.feedbackColor;
        ctx.font = 'bold 18px "Segoe UI", sans-serif';
        ctx.fillText(this.feedbackText, w / 2, 320);
      }

      // Pontuação acumulada
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 15px "Segoe UI", sans-serif';
      ctx.fillText(`Pontuação do Teste: ${this.score} pts`, w / 2, h - 50);

    } else {
      // ANIMAÇÃO DE LANÇAMENTO DO FOGUETE
      const cx = w / 2;
      const cy = h / 2 + 100 - this.rocketY;

      // Desenha rastro de chamas e fumaça
      for (const p of this.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(cx + p.x, cy + p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Corpo do Foguete
      ctx.save();
      ctx.translate(cx, cy);

      // Ogiva (topo pontudo)
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(16, -20);
      ctx.lineTo(-16, -20);
      ctx.closePath();
      ctx.fill();

      // Fuselagem
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(-16, -20, 32, 70);

      // Faixa NASA azul com bandeira do Brasil
      ctx.fillStyle = '#0077b6';
      ctx.fillRect(-16, 0, 32, 14);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 9px "Segoe UI", sans-serif';
      ctx.fillText('NASA', 0, 10);

      // Aletas laterais
      ctx.fillStyle = '#d90429';
      ctx.beginPath();
      ctx.moveTo(-16, 30);
      ctx.lineTo(-32, 55);
      ctx.lineTo(-16, 50);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(16, 30);
      ctx.lineTo(32, 55);
      ctx.lineTo(16, 50);
      ctx.closePath();
      ctx.fill();

      // Bocal de exaustão
      ctx.fillStyle = '#343a40';
      ctx.fillRect(-10, 50, 20, 10);

      ctx.restore();

      // Texto de celebração de lançamento
      ctx.fillStyle = '#00f5d4';
      ctx.font = 'bold 28px "Segoe UI", sans-serif';
      ctx.fillText('🚀 LANÇAMENTO PERFEITO!', w / 2, 130);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 18px "Segoe UI", sans-serif';
      ctx.fillText('Satélite em órbita capturando telemetria do Vale do Taquari...', w / 2, 170);
    }

    ctx.restore();
  }
};

