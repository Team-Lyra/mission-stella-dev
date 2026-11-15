// ============================================
// minigame.js — 4 Desafios Científicos Exclusivos da NASA (Mecânicas Únicas)
// ============================================

// Sintetizador procedural de áudio via Web Audio API (100% nativo)
const NasaAudio = {
  ctx: null,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  },
  playTone(freq, duration = 0.1, type = 'sine', gainVal = 0.08) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },
  typeKey() {
    this.playTone(700 + Math.random() * 200, 0.03, 'triangle', 0.04);
  },
  click() {
    this.playTone(520, 0.05, 'triangle', 0.05);
  },
  inspectChime() {
    this.playTone(659.25, 0.08, 'sine', 0.08);
    setTimeout(() => this.playTone(880, 0.12, 'sine', 0.09), 80);
  },
  alarmTone() {
    this.playTone(280, 0.12, 'sawtooth', 0.1);
    setTimeout(() => this.playTone(340, 0.14, 'sawtooth', 0.12), 120);
  },
  radarPing() {
    this.playTone(850, 0.18, 'sine', 0.12);
  },
  lockSuccess() {
    this.playTone(440, 0.1, 'sine', 0.1);
    setTimeout(() => this.playTone(554.37, 0.1, 'sine', 0.1), 90);
    setTimeout(() => this.playTone(659.25, 0.22, 'sine', 0.14), 180);
  },
  // Rugido de decolagem: explosão inicial + ruído filtrado + motor grave
  igniteRumble() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const ctx = this.ctx;
      const t0 = ctx.currentTime;
      const dur = 3.6;

      // 1) Ruído branco com envelope de tremor (fogos de artifício / exaustão)
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const tremor = 0.72 + 0.28 * Math.sin(t * 55) + 0.12 * Math.sin(t * 130);
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.45) * tremor;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(260, t0);
      lowpass.frequency.exponentialRampToValueAtTime(1400, t0 + 0.28); // entra no ignitor
      lowpass.frequency.exponentialRampToValueAtTime(110, t0 + dur);   // decai aos poucos
      lowpass.Q.setValueAtTime(9, t0);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, t0);
      noiseGain.gain.exponentialRampToValueAtTime(0.55, t0 + 0.06); // BUM de ignição
      noiseGain.gain.setValueAtTime(0.45, t0 + 0.45);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      noise.connect(lowpass);
      lowpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t0);
      noise.stop(t0 + dur);

      // 2) Motor grave que sobe no ignitar e desce ao esvair
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(34, t0);
      osc.frequency.exponentialRampToValueAtTime(150, t0 + 0.55); // sobe no ignitar
      osc.frequency.exponentialRampToValueAtTime(42, t0 + dur - 0.2);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.0001, t0);
      oscGain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur);

      // 3) Estalo agudo do ignitor (clique de acender)
      this.playTone(90, 0.09, 'square', 0.22);
    } catch (e) {}
  }
};

const LaunchMinigame = {
  active: false,
  stage: 0, // 0 = Desafio Específico, 1 = Pronto para Lançar, 2 = Subida do Foguete, 3 = Concluído
  problemType: 'agricultura',
  mission: null,
  score: 800,
  timer: 0,
  onComplete: null,

  // Foguete e partículas
  rocketY: 0,
  rocketVelocity: 0,
  particles: [],

  // ============================================
  // ESTADOS DOS 4 DESAFIOS EXCLUSIVOS
  // ============================================

  // 1. Dona Iracema — Point & Click (Lavouras de Estrela)
  iracema: {
    fields: [],
    foundCount: 0,
    totalTarget: 3,
    lastInspected: null,
    hoverIdx: -1
  },

  // 2. Professora Mariana — Terminal Typing (Escola de Pouso Novo)
  mariana: {
    commands: [
      { text: 'UPLINK TDRS', label: '1. Estabelecer canal com o satélite de retransmissão TDRS-13' },
      { text: 'FREQ 14GHZ', label: '2. Sintonizar transponder de micro-ondas Ku para alta velocidade' },
      { text: 'CONECTAR POUSO NOVO', label: '3. Ativar antena receptora da escola e postos de saúde' }
    ],
    step: 0,
    typed: '',
    history: [
      'NASA SCaN v4.8 • TERMINAL DE TELEMETRIA ESPACIAL',
      'ALVO: Escola Municipal e Comunidades de Pouso Novo, RS',
      'Digite os comandos de uplink e pressione [ENTER]:'
    ],
    errorMsg: '',
    cursorTimer: 0
  },

  // 3. Capitão Rodrigo — Radar SAR Timing (Encostas de Lajeado)
  rodrigo: {
    oscillator: 0, // 0 a 1
    dir: 1,
    speed: 1.1,
    hits: 0,
    neededHits: 3,
    sweetMin: 0.42,
    sweetMax: 0.58,
    flashTimer: 0,
    statusMsg: 'Aguardando pulso do radar...'
  },

  // 4. Cacique Karaí — Arrastar Filtro Térmico (Rio Taquari)
  karai: {
    lensX: 200,
    lensY: 200,
    lensRadius: 65,
    isDragging: false,
    fires: [],
    foundCount: 0,
    totalTarget: 3
  },

  init() {
    this.active = false;
    this.stage = 0;
  },

  start(missionOrCb, maybeCb) {
    let mission = null;
    let onComplete = null;

    if (typeof missionOrCb === 'function') {
      onComplete = missionOrCb;
      mission = typeof MissionManager !== 'undefined' ? MissionManager.getCurrent() : null;
    } else {
      mission = missionOrCb;
      onComplete = maybeCb;
    }

    if (!mission && typeof MissionManager !== 'undefined') {
      mission = MissionManager.getCurrent();
    }

    this.mission = mission;
    this.problemType = (mission && mission.problem_type) ? mission.problem_type : 'agricultura';
    this.onComplete = onComplete;
    this.active = true;
    this.stage = 0;
    this.score = 800;
    this.timer = 0;
    this.rocketY = 0;
    this.rocketVelocity = 0;
    this.particles = [];

    NasaAudio.init();

    // Inicializa o desafio correspondente à missão
    if (this.problemType === 'agricultura') {
      this.initIracemaChallenge();
    } else if (this.problemType === 'comunicacao') {
      this.initMarianaChallenge();
    } else if (this.problemType === 'deslizamentos') {
      this.initRodrigoChallenge();
    } else {
      this.initKaraiChallenge();
    }
  },

  // ============================================
  // INICIALIZAÇÃO DE CADA MECÂNICA
  // ============================================

  // 1. Iracema: Cria a grade de 16 talhões de lavoura
  initIracemaChallenge() {
    this.iracema.fields = [];
    this.iracema.foundCount = 0;
    this.iracema.lastInspected = null;
    this.iracema.hoverIdx = -1;

    // Define 3 posições de praga pré-determinadas (espalhadas)
    const pestIndices = [3, 9, 14];

    for (let i = 0; i < 16; i++) {
      const isPest = pestIndices.includes(i);
      this.iracema.fields.push({
        id: i,
        hasPest: isPest,
        inspected: false,
        ndvi: isPest ? (0.12 + Math.random() * 0.08) : (0.76 + Math.random() * 0.14)
      });
    }
  },

  // 2. Mariana: Inicializa o console de digitação
  initMarianaChallenge() {
    this.mariana.step = 0;
    this.mariana.typed = '';
    this.mariana.errorMsg = '';
    this.mariana.cursorTimer = 0;
    this.mariana.history = [
      'NASA SCaN v4.8 • TERMINAL DE TELEMETRIA ESPACIAL',
      'ALVO: Escola Municipal e Comunidades de Pouso Novo, RS',
      'Digite os comandos de uplink e pressione [ENTER]:'
    ];
  },

  // 3. Rodrigo: Inicializa o oscilador do radar SAR
  initRodrigoChallenge() {
    this.rodrigo.oscillator = 0.1;
    this.rodrigo.dir = 1;
    this.rodrigo.speed = 1.1;
    this.rodrigo.hits = 0;
    this.rodrigo.flashTimer = 0;
    this.rodrigo.statusMsg = 'Pressione [ESPAÇO] ou clique quando o feixe atingir a FAIXA VERDE!';
  },

  // 4. Karaí: Inicializa focos de queimada e lente móvel
  initKaraiChallenge() {
    this.karai.initialized = false;
    this.karai.lensX = 0;
    this.karai.lensY = 0;
    this.karai.lensRadius = 60;
    this.karai.isDragging = false;
    this.karai.foundCount = 0;
    this.karai.fires = [
      { xPct: 0.32, yPct: 0.35, scanned: false, name: 'Foco 01 (Margem Norte)' },
      { xPct: 0.68, yPct: 0.48, scanned: false, name: 'Foco 02 (Ilha Central)' },
      { xPct: 0.46, yPct: 0.72, scanned: false, name: 'Foco 03 (Margem Sul)' }
    ];
  },

  clampKaraiLens(cw, ch) {
    const dispX = cw * 0.12;
    const dispY = 110;
    const dispW = cw * 0.76;
    const dispH = ch - 210;
    const lr = this.karai.lensRadius;

    this.karai.lensX = Math.max(dispX + lr + 4, Math.min(dispX + dispW - lr - 4, this.karai.lensX));
    this.karai.lensY = Math.max(dispY + lr + 4, Math.min(dispY + dispH - lr - 4, this.karai.lensY));
  },

  // ============================================
  // ENTRADA DE TECLADO
  // ============================================
  handleInput(e) {
    if (!this.active) return;
    const code = e.code;
    const key = e.key;

    // Se estiver pronto para o lançamento do foguete
    if (this.stage === 1) {
      if (code === 'Space' || code === 'Enter') {
        this.launchRocket();
      }
      return;
    }

    if (this.stage !== 0) return;

    // 1. Dona Iracema (Agricultura)
    if (this.problemType === 'agricultura') {
      if (code === 'Space' || code === 'Enter') {
        if (this.iracema.hoverIdx >= 0) {
          this.inspectIracemaField(this.iracema.hoverIdx);
        }
      }
    }

    // 2. Professora Mariana (Digitação no Terminal)
    else if (this.problemType === 'comunicacao') {
      if (code === 'Enter') {
        this.submitMarianaCommand();
      } else if (code === 'Backspace') {
        this.mariana.typed = this.mariana.typed.slice(0, -1);
        NasaAudio.typeKey();
      } else if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (this.mariana.typed.length < 32) {
          this.mariana.typed += key.toUpperCase();
          NasaAudio.typeKey();
        }
      }
    }

    // 3. Capitão Rodrigo (Timing do Radar)
    else if (this.problemType === 'deslizamentos') {
      if (code === 'Space' || code === 'Enter') {
        this.triggerRodrigoPulse();
      }
    }

    // 4. Cacique Karaí (Mover Lente pelas Setas se desejar)
    else if (this.problemType === 'florestal') {
      const step = 20;
      if (code === 'ArrowLeft' || code === 'KeyA') this.karai.lensX -= step;
      if (code === 'ArrowRight' || code === 'KeyD') this.karai.lensX += step;
      if (code === 'ArrowUp' || code === 'KeyW') this.karai.lensY -= step;
      if (code === 'ArrowDown' || code === 'KeyS') this.karai.lensY += step;
      this.clampKaraiLens(window.innerWidth, window.innerHeight);
      this.checkKaraiFires();
    }
  },

  // ============================================
  // ENTRADA DE MOUSE / TOUCH
  // ============================================
  handlePointerDown(e, canvas) {
    if (!this.active) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Botão de lançamento (quando pronto)
    if (this.stage === 1) {
      const btnW = 420;
      const btnH = 52;
      const btnX = canvas.width / 2 - btnW / 2;
      const btnY = canvas.height - 80;
      if (mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH) {
        this.launchRocket();
      }
      return;
    }

    if (this.stage !== 0) return;

    // 1. Iracema: Clique no talhão da lavoura
    if (this.problemType === 'agricultura') {
      const clickedIdx = this.getIracemaCellAt(mx, my, canvas.width, canvas.height);
      if (clickedIdx >= 0) {
        this.inspectIracemaField(clickedIdx);
      }
    }

    // 3. Rodrigo: Clique no botão disparar pulso
    else if (this.problemType === 'deslizamentos') {
      this.triggerRodrigoPulse();
    }

    // 4. Karaí: Clique e início de arrastar a lente
    else if (this.problemType === 'florestal') {
      const dist = Math.hypot(mx - this.karai.lensX, my - this.karai.lensY);
      if (dist <= this.karai.lensRadius + 15) {
        this.karai.isDragging = true;
      }
    }
  },

  handlePointerMove(e, canvas) {
    if (!this.active || this.stage !== 0) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    // 1. Iracema: hover
    if (this.problemType === 'agricultura') {
      this.iracema.hoverIdx = this.getIracemaCellAt(mx, my, canvas.width, canvas.height);
    }

    // 4. Karaí: arrastar a lente estritamente dentro da moldura
    else if (this.problemType === 'florestal' && this.karai.isDragging) {
      this.karai.lensX = mx;
      this.karai.lensY = my;
      this.clampKaraiLens(canvas.width, canvas.height);
      this.checkKaraiFires();
    }
  },

  handlePointerUp() {
    if (this.problemType === 'florestal') {
      this.karai.isDragging = false;
    }
  },

  // ============================================
  // LÓGICA DAS 4 MECÂNICAS
  // ============================================

  // 1. Iracema: Inspeciona talhão ao clicar
  getIracemaCellAt(mx, my, cw, ch) {
    const gridX = cw * 0.12;
    const gridY = 130;
    const gridW = cw * 0.76;
    const gridH = ch - 230;
    const cols = 4;
    const rows = 4;
    const cellW = gridW / cols;
    const cellH = gridH / rows;

    if (mx >= gridX && mx <= gridX + gridW && my >= gridY && my <= gridY + gridH) {
      const c = Math.floor((mx - gridX) / cellW);
      const r = Math.floor((my - gridY) / cellH);
      return r * cols + c;
    }
    return -1;
  },

  inspectIracemaField(idx) {
    const field = this.iracema.fields[idx];
    if (!field || field.inspected) return;

    field.inspected = true;
    this.iracema.lastInspected = field;

    if (field.hasPest) {
      this.iracema.foundCount++;
      NasaAudio.alarmTone();
      if (this.iracema.foundCount >= this.iracema.totalTarget) {
        this.completeChallenge();
      }
    } else {
      NasaAudio.inspectChime();
    }
  },

  // 2. Mariana: Valida comando digitado no terminal
  submitMarianaCommand() {
    const expected = this.mariana.commands[this.mariana.step].text;
    const typedClean = this.mariana.typed.trim().toUpperCase();

    if (typedClean === expected) {
      this.mariana.history.push(`> ${typedClean}`);
      this.mariana.history.push(`[OK] COMANDO PROCESSADO: ETAPA ${this.mariana.step + 1} ATIVADA!`);
      this.mariana.typed = '';
      this.mariana.errorMsg = '';
      this.mariana.step++;
      NasaAudio.lockSuccess();

      if (this.mariana.step >= this.mariana.commands.length) {
        this.mariana.history.push('========================================================');
        this.mariana.history.push('🎉 SUCESSO! LINK DE 100 Mbps ESTABILIZADO COM A ESCOLA!');
        this.mariana.history.push('47 Comunidades e Postos de Saúde Conectados à Rede!');
        this.completeChallenge();
      }
    } else {
      this.mariana.errorMsg = `✗ Sintaxe incorreta! Digite exatamente: "${expected}"`;
      NasaAudio.alarmTone();
    }
  },

  // 3. Rodrigo: Disparo do pulso do Radar SAR no timing
  triggerRodrigoPulse() {
    const cur = this.rodrigo.oscillator;
    const inSweet = cur >= this.rodrigo.sweetMin && cur <= this.rodrigo.sweetMax;

    if (inSweet) {
      this.rodrigo.hits++;
      this.rodrigo.flashTimer = 0.5;
      NasaAudio.radarPing();
      this.rodrigo.statusMsg = `✓ PULSO PERFEITO (${this.rodrigo.hits}/${this.rodrigo.neededHits})! Radar penetrou as nuvens e mediu a encosta!`;

      if (this.rodrigo.hits >= this.rodrigo.neededHits) {
        this.rodrigo.statusMsg = '🎉 MAPEAMENTO DE ENCOSTA COMPLETO! Alerta emitido para a Defesa Civil!';
        this.completeChallenge();
      }
    } else {
      NasaAudio.alarmTone();
      this.rodrigo.statusMsg = '✗ FORA DA JANELA! O ruído de tempestade atenuou o radar. Tente de novo!';
    }
  },

  // 4. Karaí: Checa se a lente está cobrindo algum foco de queimada
  checkKaraiFires() {
    const lx = this.karai.lensX;
    const ly = this.karai.lensY;
    const rad = this.karai.lensRadius;

    this.karai.fires.forEach((f) => {
      if (!f.scanned && f.canvasX && f.canvasY) {
        const dist = Math.hypot(lx - f.canvasX, ly - f.canvasY);
        if (dist <= rad - 8) {
          f.scanned = true;
          this.karai.foundCount++;
          NasaAudio.lockSuccess();
          if (this.karai.foundCount >= this.karai.totalTarget) {
            this.completeChallenge();
          }
        }
      }
    });
  },

  completeChallenge() {
    this.stage = 1; // Pronto para lançamento
    NasaAudio.lockSuccess();
  },

  launchRocket() {
    if (this.stage >= 2) return;
    this.stage = 2; // Decolagem em andamento
    this.rocketY = 0;
    this.rocketVelocity = 0;
    NasaAudio.igniteRumble();

    // Partículas de fumaça e fogo
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 50,
        y: 80,
        vx: (Math.random() - 0.5) * 120,
        vy: Math.random() * 160 + 80,
        size: Math.random() * 12 + 4,
        color: Math.random() > 0.4 ? '#ff9e00' : '#d00000',
        life: 1.0
      });
    }

    setTimeout(() => {
      this.stage = 3;
      this.active = false;
      if (this.onComplete) {
        this.onComplete(this.score);
      }
    }, 3500);
  },

  // ============================================
  // UPDATE
  // ============================================
  update(dt) {
    if (!this.active) return;
    this.timer += dt;

    // Atualiza timing do Radar SAR do Capitão Rodrigo
    if (this.problemType === 'deslizamentos' && this.stage === 0) {
      this.rodrigo.oscillator += this.rodrigo.dir * this.rodrigo.speed * dt;
      if (this.rodrigo.oscillator >= 1) {
        this.rodrigo.oscillator = 1;
        this.rodrigo.dir = -1;
      } else if (this.rodrigo.oscillator <= 0) {
        this.rodrigo.oscillator = 0;
        this.rodrigo.dir = 1;
      }
      if (this.rodrigo.flashTimer > 0) this.rodrigo.flashTimer -= dt;
    }

    // Cursor do terminal da Professora Mariana
    if (this.problemType === 'comunicacao') {
      this.mariana.cursorTimer += dt * 4;
    }

    // Decolagem do foguete
    if (this.stage === 2) {
      this.rocketVelocity += dt * 550;
      this.rocketY += this.rocketVelocity * dt;

      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: (Math.random() - 0.5) * 24,
          y: 75,
          vx: (Math.random() - 0.5) * 50,
          vy: Math.random() * 140 + 120,
          size: Math.random() * 14 + 5,
          color: Math.random() > 0.5 ? '#ffd166' : '#d62828',
          life: 0.9
        });
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 1.4;
        p.size *= 0.96;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }
  },

  // ============================================
  // RENDERIZAÇÃO PRINCIPAL
  // ============================================
  render(ctx, w, h) {
    if (!this.active) return;
    ctx.save();

    // Se estiver decolando o foguete
    if (this.stage >= 2) {
      this.renderRocketLiftoff(ctx, w, h);
      ctx.restore();
      return;
    }

    // Fundo escuro aeroespacial
    ctx.fillStyle = '#060a1c';
    ctx.fillRect(0, 0, w, h);

    // Cabeçalho da NASA
    this.renderHeader(ctx, w, h);

    // Renderiza a mecânica correspondente
    if (this.problemType === 'agricultura') {
      this.renderIracemaChallenge(ctx, w, h);
    } else if (this.problemType === 'comunicacao') {
      this.renderMarianaChallenge(ctx, w, h);
    } else if (this.problemType === 'deslizamentos') {
      this.renderRodrigoChallenge(ctx, w, h);
    } else {
      this.renderKaraiChallenge(ctx, w, h);
    }

    // Botão de lançamento (quando liberado)
    if (this.stage === 1) {
      this.renderLaunchButton(ctx, w, h);
    }

    ctx.restore();
  },

  renderHeader(ctx, w, h) {
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(20, 16, w - 40, 72);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 16, w - 40, 72);

    // Logo NASA
    ctx.fillStyle = '#0077b6';
    ctx.beginPath();
    ctx.arc(58, 52, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NASA', 58, 56);

    let title = '';
    let subtitle = '';

    if (this.problemType === 'agricultura') {
      title = '🌿 NASA LANDSAT-9 • SCANNER NDVI DE LAVOURAS (POINT & CLICK)';
      subtitle = 'Missão: Dona Marta (Estrela) • Clique nos talhões para achar os 3 focos de praga';
    } else if (this.problemType === 'comunicacao') {
      title = '📡 NASA SCaN & TDRS • CONSOLE DE DIGITAÇÃO DE TELEMETRIA';
      subtitle = 'Missão: Profª Clara (Pouso Novo) • Digite os comandos de uplink pelo teclado e dê Enter';
    } else if (this.problemType === 'deslizamentos') {
      title = '⛰️ NASA NISAR • RADAR SAR DE PENETRAÇÃO (TIMING NO MOMENTO EXATO)';
      subtitle = 'Missão: Capitão Farias (Lajeado) • Aperte [ESPAÇO] na FAIXA VERDE para atravessar a chuva';
    } else {
      title = '🔥 NASA FIRMS • FILTRO RADIOMÉTRICO TERMAL (ARRASTAR COM O MOUSE)';
      subtitle = 'Missão: Seu Nilo (Rio Taquari) • Arraste a Lente Térmica sobre o rio para achar o fogo';
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(title, 95, 45, w - 120);

    ctx.fillStyle = '#90e0ef';
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillText(subtitle, 95, 68, w - 120);
  },

  // ============================================
  // 1. MECÂNICA DONA IRACEMA: POINT & CLICK
  // ============================================
  renderIracemaChallenge(ctx, w, h) {
    const gridX = w * 0.12;
    const gridY = 110;
    const gridW = w * 0.76;
    const gridH = h - 210;
    const cols = 4;
    const rows = 4;
    const cellW = gridW / cols;
    const cellH = gridH / rows;

    // Fundo da imagem de satélite
    ctx.fillStyle = '#1b263b';
    ctx.fillRect(gridX, gridY, gridW, gridH);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gridX, gridY, gridW, gridH);

    // Desenha cada talhão
    this.iracema.fields.forEach((f, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      const cx = gridX + c * cellW;
      const cy = gridY + r * cellH;
      const isHover = idx === this.iracema.hoverIdx;

      if (!f.inspected) {
        // Talhão não inspecionado (verde-oliva suave)
        ctx.fillStyle = isHover ? '#3a5a40' : '#283618';
        ctx.fillRect(cx + 4, cy + 4, cellW - 8, cellH - 8);

        ctx.fillStyle = '#adb5bd';
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Talhão ${idx + 1}`, cx + cellW / 2, cy + cellH / 2 - 8);
        ctx.fillStyle = '#606c38';
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.fillText('Clique para escanear', cx + cellW / 2, cy + cellH / 2 + 10);
      } else if (f.hasPest) {
        // Foco de praga (vermelho vivo com alerta)
        const pulse = (Math.sin(this.timer * 6) + 1) / 2;
        ctx.fillStyle = `rgba(230, 57, 70, ${0.75 + pulse * 0.25})`;
        ctx.fillRect(cx + 4, cy + 4, cellW - 8, cellH - 8);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(cx + 4, cy + 4, cellW - 8, cellH - 8);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 FOCO DE PRAGA!', cx + cellW / 2, cy + cellH / 2 - 8);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`NDVI: ${f.ndvi.toFixed(2)} (CRÍTICO)`, cx + cellW / 2, cy + cellH / 2 + 12);
      } else {
        // Talhão saudável (verde esmeralda da NASA)
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(cx + 4, cy + 4, cellW - 8, cellH - 8);

        ctx.fillStyle = '#00f5d4';
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓ VEGETAÇÃO SADIA', cx + cellW / 2, cy + cellH / 2 - 8);
        ctx.fillStyle = '#b7e4c7';
        ctx.font = '11px monospace';
        ctx.fillText(`NDVI: ${f.ndvi.toFixed(2)} (Ótimo)`, cx + cellW / 2, cy + cellH / 2 + 12);
      }

      ctx.strokeStyle = isHover ? '#ffd700' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = isHover ? 2 : 1;
      ctx.strokeRect(cx + 4, cy + 4, cellW - 8, cellH - 8);
    });

    // Contador no rodapé
    const statusY = h - 55;
    ctx.textAlign = 'center';
    ctx.fillStyle = this.iracema.foundCount >= 3 ? '#00f5d4' : '#ffd700';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(
      `FOCOS DE PRAGA ENCONTRADOS: ${this.iracema.foundCount} / 3  •  DICA: Clique nos talhões com o mouse!`,
      w / 2,
      statusY
    );
  },

  // ============================================
  // 2. MECÂNICA PROFESSORA MARIANA: TYPING NO TERMINAL
  // ============================================
  renderMarianaChallenge(ctx, w, h) {
    const termX = w * 0.12;
    const termY = 105;
    const termW = w * 0.76;
    const termH = h - 200;

    // Fundo de monitor CRT / Terminal hacker da NASA
    ctx.fillStyle = '#050a14';
    ctx.fillRect(termX, termY, termW, termH);
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(termX, termY, termW, termH);

    // Barra de título do terminal
    ctx.fillStyle = '#00f5d4';
    ctx.fillRect(termX, termY, termW, 26);
    ctx.fillStyle = '#050a14';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ROOT@NASA-COMM-TERMINAL-POUSO-NOVO: ~', termX + 12, termY + 18);

    // Área do Histórico de Log (com corte seguro para nunca vazar)
    ctx.save();
    ctx.beginPath();
    ctx.rect(termX + 10, termY + 30, termW - 20, termH - 150);
    ctx.clip();

    ctx.textAlign = 'left';
    ctx.font = '13px monospace';
    let lineY = termY + 50;

    // Mostra as últimas linhas do histórico
    const visibleLines = this.mariana.history.slice(-5);
    visibleLines.forEach((line) => {
      ctx.fillStyle = line.startsWith('>') ? '#ffd700' : (line.startsWith('[OK]') ? '#00f5d4' : '#74c69d');
      ctx.fillText(line, termX + 18, lineY);
      lineY += 20;
    });
    ctx.restore();

    // Área de Entrada de Comando (Posicionada com segurança na parte inferior)
    if (this.mariana.step < this.mariana.commands.length) {
      const targetCmd = this.mariana.commands[this.mariana.step];
      const inputPanelY = termY + termH - 110;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Segoe UI", sans-serif';
      ctx.fillText(`ETAPA ${this.mariana.step + 1} de 3: ${targetCmd.label}`, termX + 18, inputPanelY);

      // Caixa de digitação ativa
      const boxY = inputPanelY + 10;
      ctx.fillStyle = 'rgba(0, 245, 212, 0.12)';
      ctx.fillRect(termX + 18, boxY, termW - 36, 38);
      ctx.strokeStyle = '#00f5d4';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(termX + 18, boxY, termW - 36, 38);

      // Texto digitado pelo jogador
      const cursor = Math.floor(this.mariana.cursorTimer) % 2 === 0 ? '_' : ' ';
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`DIGITE > ${this.mariana.typed}${cursor}`, termX + 28, boxY + 25);

      // Dica de comando
      ctx.fillStyle = '#90e0ef';
      ctx.font = 'italic 12px "Segoe UI", sans-serif';
      ctx.fillText(`Comando esperado: "${targetCmd.text}" (Digite e aperte ENTER)`, termX + 18, boxY + 54);

      if (this.mariana.errorMsg) {
        ctx.fillStyle = '#e63946';
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        ctx.fillText(this.mariana.errorMsg, termX + 18, boxY + 70);
      }
    }
  },

  // ============================================
  // 3. MECÂNICA CAPITÃO RODRIGO: RADAR TIMING
  // ============================================
  renderRodrigoChallenge(ctx, w, h) {
    const dispX = w * 0.12;
    const dispY = 110;
    const dispW = w * 0.76;
    const dispH = h - 210;

    // Fundo da montanha e chuva
    ctx.fillStyle = '#08121e';
    ctx.fillRect(dispX, dispY, dispW, dispH);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2;
    ctx.strokeRect(dispX, dispY, dispW, dispH);

    // Chuva animada
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 40; i++) {
      const rx = dispX + ((i * 37 + this.timer * 400) % dispW);
      const ry = dispY + ((i * 47 + this.timer * 600) % (dispH * 0.6));
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 8, ry + 16);
      ctx.stroke();
    }

    // Perfil do morro
    ctx.fillStyle = '#1c2541';
    ctx.beginPath();
    ctx.moveTo(dispX, dispY + dispH * 0.75);
    ctx.lineTo(dispX + dispW * 0.45, dispY + dispH * 0.35);
    ctx.lineTo(dispX + dispW, dispY + dispH * 0.75);
    ctx.lineTo(dispX + dispW, dispY + dispH);
    ctx.lineTo(dispX, dispY + dispH);
    ctx.closePath();
    ctx.fill();

    // Pulso de flash quando acerta
    if (this.rodrigo.flashTimer > 0) {
      ctx.fillStyle = `rgba(0, 245, 212, ${this.rodrigo.flashTimer * 0.6})`;
      ctx.fillRect(dispX, dispY, dispW, dispH * 0.75);
    }

    // Barra de Oscilação de Timing do Radar na base
    const barW = dispW - 60;
    const barH = 34;
    const barX = dispX + 30;
    const barY = dispY + dispH - 75;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX, barY, barW, barH);

    // Zona Verde Ideal (Sweet Spot)
    const sweetX = barX + barW * this.rodrigo.sweetMin;
    const sweetW = barW * (this.rodrigo.sweetMax - this.rodrigo.sweetMin);
    ctx.fillStyle = 'rgba(0, 245, 212, 0.45)';
    ctx.fillRect(sweetX, barY, sweetW, barH);
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(sweetX, barY, sweetW, barH);

    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FAIXA IDEAL SAR', sweetX + sweetW / 2, barY - 8);

    // Cursor oscilante do radar
    const cursorX = barX + barW * this.rodrigo.oscillator;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(cursorX, barY + barH / 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Mensagem de status e instrução
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillText(this.rodrigo.statusMsg, w / 2, barY + barH + 26);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillText(`PULSOS CONFIRMADOS: ${this.rodrigo.hits} / ${this.rodrigo.neededHits}`, w / 2, dispY + 35);
  },

  // ============================================
  // 4. MECÂNICA CACIQUE KARAÍ: ARRASTAR LENTE TÉRMICA
  // ============================================
  renderKaraiChallenge(ctx, w, h) {
    const dispX = w * 0.12;
    const dispY = 110;
    const dispW = w * 0.76;
    const dispH = h - 210;
    const lr = this.karai.lensRadius;

    // Inicializa posição centralizada se ainda não foi feito
    if (!this.karai.initialized) {
      this.karai.lensX = dispX + dispW / 2;
      this.karai.lensY = dispY + dispH / 2;
      this.karai.initialized = true;
    }
    this.clampKaraiLens(w, h);

    // Mapeia coordenadas dos focos em pixels no canvas
    this.karai.fires.forEach((f) => {
      f.canvasX = dispX + dispW * f.xPct;
      f.canvasY = dispY + dispH * f.yPct;
    });

    // CLIPA TUDO rigorosamente dentro da moldura do display (impede que saia da tela)
    ctx.save();
    ctx.beginPath();
    ctx.rect(dispX, dispY, dispW, dispH);
    ctx.clip();

    // Fundo do Rio Taquari ofuscado pelo reflexo solar (amarelado)
    ctx.fillStyle = '#264653';
    ctx.fillRect(dispX, dispY, dispW, dispH);

    // Curso do Rio Taquari
    ctx.fillStyle = '#2a9d8f';
    ctx.beginPath();
    ctx.moveTo(dispX + dispW * 0.15, dispY);
    ctx.bezierCurveTo(dispX + dispW * 0.4, dispY + dispH * 0.3, dispX + dispW * 0.1, dispY + dispH * 0.7, dispX + dispW * 0.4, dispY + dispH);
    ctx.lineTo(dispX + dispW * 0.65, dispY + dispH);
    ctx.bezierCurveTo(dispX + dispW * 0.35, dispY + dispH * 0.7, dispX + dispW * 0.65, dispY + dispH * 0.3, dispX + dispW * 0.4, dispY);
    ctx.closePath();
    ctx.fill();

    // Reflexo solar na água (ofusca tudo fora da lente)
    ctx.fillStyle = 'rgba(255, 230, 100, 0.35)';
    ctx.fillRect(dispX, dispY, dispW, dispH);

    // Focos que já foram escaneados continuam visíveis com indicador
    this.karai.fires.forEach((f) => {
      if (f.scanned) {
        ctx.fillStyle = 'rgba(230, 57, 70, 0.7)';
        ctx.beginPath();
        ctx.arc(f.canvasX, f.canvasY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(f.canvasX - 12, f.canvasY - 12, 24, 24);
      }
    });

    // A LENTE TÉRMICA (CORTA O REFLEXO SOLAR E REVELA AS CHAMAS)
    const lx = this.karai.lensX;
    const ly = this.karai.lensY;

    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, Math.PI * 2);
    ctx.clip();

    // Dentro da lente: a água fica azul-marinho profundo (sem reflexo do sol)
    ctx.fillStyle = '#03071e';
    ctx.fillRect(lx - lr - 10, ly - lr - 10, (lr + 10) * 2, (lr + 10) * 2);

    // Desenha o curso do rio limpo dentro da lente
    ctx.fillStyle = '#001d3d';
    ctx.beginPath();
    ctx.moveTo(dispX + dispW * 0.15, dispY);
    ctx.bezierCurveTo(dispX + dispW * 0.4, dispY + dispH * 0.3, dispX + dispW * 0.1, dispY + dispH * 0.7, dispX + dispW * 0.4, dispY + dispH);
    ctx.lineTo(dispX + dispW * 0.65, dispY + dispH);
    ctx.bezierCurveTo(dispX + dispW * 0.35, dispY + dispH * 0.7, dispX + dispW * 0.65, dispY + dispH * 0.3, dispX + dispW * 0.4, dispY);
    ctx.closePath();
    ctx.fill();

    // Revela os focos de incêndio com chamas animadas dentro da lente
    this.karai.fires.forEach((f) => {
      const dist = Math.hypot(lx - f.canvasX, ly - f.canvasY);
      if (dist <= lr + 15) {
        const pulse = (Math.sin(this.timer * 8) + 1) / 2;
        ctx.fillStyle = `rgba(230, 57, 70, ${0.8 + pulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(f.canvasX, f.canvasY, 14 + pulse * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(f.canvasX, f.canvasY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('FOGO DETECTADO!', f.canvasX, f.canvasY - 22);
      }
    });

    ctx.restore(); // Fecha o clip da lente

    // Borda e alça da lente
    ctx.strokeStyle = this.karai.isDragging ? '#00f5d4' : '#ffd700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, Math.PI * 2);
    ctx.stroke();

    // Mira interna sutil
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lx - lr * 0.4, ly);
    ctx.lineTo(lx + lr * 0.4, ly);
    ctx.moveTo(lx, ly - lr * 0.4);
    ctx.lineTo(lx, ly + lr * 0.4);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 245, 212, 0.9)';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LENTE FIRMS 3.9µm', lx, ly + lr - 14);

    ctx.restore(); // Fecha o clip geral da caixa do display

    // Moldura exterior
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(dispX, dispY, dispW, dispH);

    // Contador e instrução
    ctx.fillStyle = this.karai.foundCount >= 3 ? '#00f5d4' : '#ffd700';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `FOCOS DE QUEIMADA LOCALIZADOS: ${this.karai.foundCount} / 3  •  Arraste a lente com o mouse sobre o rio!`,
      w / 2,
      h - 55
    );
  },

  // ============================================
  // BOTÃO DE AUTORIZAÇÃO DE LANÇAMENTO
  // ============================================
  renderLaunchButton(ctx, w, h) {
    const pulse = Math.sin(Date.now() / 150) * 4;
    const btnText = '🚀 LANÇAR MISSÃO! [ESPAÇO / CLIQUE]';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    const textWidth = ctx.measureText(btnText).width;
    const btnW = Math.min(540, Math.max(440, textWidth + 70));
    const btnH = 58;
    const btnX = w / 2 - btnW / 2;
    const btnY = h - 90 - pulse / 2;

    // Sombra brilhante
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 18;

    ctx.fillStyle = '#00f5d4';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(btnX, btnY, btnW, btnH, 12) : ctx.rect(btnX, btnY, btnW, btnH);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.fillStyle = '#060a1c';
    ctx.textAlign = 'center';
    ctx.fillText(btnText, w / 2, btnY + 36);

    // Mensagem da Lyra
    Lyra.render(ctx, btnX - 45, btnY + 29, 28, 'excited', '');
  },

  // ============================================
  // ANIMAÇÃO DE DECOLAGEM DO FOGUETE
  // ============================================
  renderRocketLiftoff(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2 + 100 - this.rocketY;

    // Fundo espacial dramático
    ctx.fillStyle = '#03071e';
    ctx.fillRect(0, 0, w, h);

    // Linhas de rastro de alta velocidade
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 30; i++) {
      const sx = (i * 37) % w;
      const sy = (this.timer * 700 + i * 53) % h;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx, sy + 30);
      ctx.stroke();
    }

    // Partículas de exaustão e fogo
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(cx + p.x, cy + p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Desenha o Foguete
    ctx.save();
    ctx.translate(cx, cy);

    // Ogiva
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.moveTo(0, -65);
    ctx.lineTo(18, -20);
    ctx.lineTo(-18, -20);
    ctx.closePath();
    ctx.fill();

    // Corpo
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(-18, -20, 36, 75);

    // Faixa NASA
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(-18, 5, 36, 16);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NASA', 0, 17);

    // Aletas
    ctx.fillStyle = '#d90429';
    ctx.beginPath();
    ctx.moveTo(-18, 35);
    ctx.lineTo(-35, 65);
    ctx.lineTo(-18, 58);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(18, 35);
    ctx.lineTo(35, 65);
    ctx.lineTo(18, 58);
    ctx.closePath();
    ctx.fill();

    // Bocal
    ctx.fillStyle = '#343a40';
    ctx.fillRect(-12, 55, 24, 12);
    ctx.restore();

    // Telemetria Lateral da NASA (Sem sobrepor títulos)
    const alt = Math.min(600, Math.round((this.rocketY / 300) * 150));
    const vel = Math.min(28000, Math.round((this.rocketY / 300) * 7000));

    // Título centralizado no topo limpo
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 26px "Segoe UI", sans-serif';
    ctx.fillText('🚀 DECOLAGEM AUTORIZADA!', w / 2, 48);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillText('Satélite calibrado entrando em órbita polar sobre o Vale do Taquari...', w / 2, 75);

    // Caixa de Telemetria Lateral abaixo do cabeçalho
    const teleX = 30;
    const teleY = 95;
    const teleW = 250;
    const teleH = 96;

    ctx.fillStyle = 'rgba(13, 27, 42, 0.9)';
    ctx.fillRect(teleX, teleY, teleW, teleH);
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(teleX, teleY, teleW, teleH);

    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🛰️ TELEMETRIA DE VÔO NASA', teleX + 14, teleY + 22);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(`ALTITUDE: ${alt} km (Órbita LEO)`, teleX + 14, teleY + 44);
    ctx.fillText(`VELOCIDADE: ${vel.toLocaleString()} km/h (7.8 km/s)`, teleX + 14, teleY + 65);
    ctx.fillText(`STATUS: INJEÇÃO ORBITAL OK`, teleX + 14, teleY + 85);
  }
};
