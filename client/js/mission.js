// ============================================
// mission.js — Fluxo Oficial da Missão em 6 Passos, Cutscenes, XP e Recompensas
// ============================================

const MissionManager = {
  missions: [],
  currentMissionIndex: 0,
  currentMission: null,
  phase: 'EXPLORE',
  satelliteConfig: null,
  missionScore: 0,
  totalScore: 0,
  missionFailed: false,

  // Cutscenes e Tutorial
  tutorialActive: false,
  tutorialStep: 0,
  cutsceneActive: false,
  cutsceneMission: null,

  // Feedback do Passo 6
  choiceFeedback: '',
  xpGained: 0,
  coinsGained: 0,
  leveledUp: false,
  newRankTitle: '',

  async init() {
    this.missions = await API.getMissions();
    this.currentMission = null;
    this.currentMissionIndex = -1;
    this.phase = 'EXPLORE';

    // Se jogador novo, ativa tutorial da Lyra
    const hasSeenTutorial = localStorage.getItem('missaoTaquari_tutorialSeen');
    if (!hasSeenTutorial) {
      this.tutorialActive = true;
      this.tutorialStep = 0;
    }
  },

  hasActiveMission() {
    return this.currentMission !== null;
  },

  getCurrent() {
    return this.currentMission;
  },

  setActiveMission(missionOrId) {
    let mission = null;
    if (typeof missionOrId === 'number' || typeof missionOrId === 'string') {
      mission = this.missions.find(m => m.id === parseInt(missionOrId));
    } else {
      mission = missionOrId;
    }
    if (mission) {
      this.currentMission = mission;
      this.currentMissionIndex = this.missions.findIndex(m => m.id === mission.id);
      return true;
    }
    return false;
  },

  clearActiveMission() {
    this.currentMission = null;
    this.currentMissionIndex = -1;
    this.phase = 'EXPLORE';
    this.satelliteConfig = null;
  },

  // PASSO 1: Abre a Cutscene do Problema Local
  startMissionIntro(mission) {
    this.cutsceneActive = true;
    this.cutsceneMission = mission;
    NasaAudio.lockSuccess();
  },

  closeMissionIntro() {
    this.cutsceneActive = false;
    this.setActiveMission(this.cutsceneMission);
  },

  // PASSO 2: Inicia Montagem no Centro Espacial
  startSatelliteAssembly() {
    this.phase = 'PLAN';
    SatelliteBuilder.open(this.getCurrent());
  },

  // PASSO 3: Conclui montagem e vai para os TESTES CIENTÍFICOS
  completeSatelliteAssembly(config) {
    this.satelliteConfig = config;
    this.phase = 'TESTS';

    // Bônus do sensor adequado
    let bonus = 150;
    const missionProblem = this.getCurrent().problem_type;
    if (config.sensor && config.sensor.bestFor === missionProblem) {
      bonus = 450;
    }
    this.missionScore = bonus;

    // Inicia Minigame como Teste de Bancada
    LaunchMinigame.start(this.getCurrent(), (testPoints) => {
      this.completeLaunch(testPoints);
    });
  },

  // PASSO 4 & 5: Lançamento e Coleta de Dados Espaciais (com RNG de falha)
  completeLaunch(testPoints) {
    this.missionScore += testPoints;

    // ---- RNG FAILURE LOGIC ----
    const stats = this.satelliteConfig ? this.satelliteConfig.stats : null;
    const successRate = stats ? (stats.successRate || 80) : 80;
    this.missionFailed = false;

    if (successRate < 60) {
      // Alta chance de falha: 75% de fracasso
      const roll = Math.random();
      if (roll < 0.75) {
        this.missionFailed = true;
        // Marca como FAILED
        API.setMissionStatus(this.currentMission.id, 'FAILED');
        this.phase = 'COLLECT';
        return;
      }
    } else if (successRate < 75) {
      // Chance moderada: 30% de falha
      const roll = Math.random();
      if (roll < 0.30) {
        this.missionFailed = true;
        API.setMissionStatus(this.currentMission.id, 'FAILED');
        this.phase = 'COLLECT';
        return;
      }
    }

    // Sucesso — geração normal de feedback
    this.missionFailed = false;
    this.phase = 'COLLECT';
    this.generateChoiceFeedback();
  },

  // Gera o feedback divertido do Passo 6 baseado nas peças escolhidas
  generateChoiceFeedback() {
    const cfg = this.satelliteConfig || {};
    const bat = cfg.battery ? cfg.battery.name : 'Bateria Solar';
    const cpu = cfg.cpu ? cfg.cpu.name : 'Computador NASA';
    const comm = cfg.comms ? cfg.comms.name : 'Transponder Ku';
    const crew = cfg.crew ? cfg.crew.name : 'Sonda Automática';

    let fb = `⚡ A ${bat} que você escolheu manteve todos os instrumentos ligados no vácuo espacial! `;
    fb += `💻 O ${cpu} processou a telemetria sem falhas. `;
    fb += `📡 A comunicação via ${comm} enviou os mapas perfeitos para a base! `;
    if (crew.includes('Bit')) {
      fb += `🤖 O Robô Copiloto Bit ajudou a calibrar tudo 20% mais rápido!`;
    }

    this.choiceFeedback = fb;

    // Atualiza XP, Nível e Moedas
    const player = API.currentPlayer || {};
    const curXP = player.xp || 0;
    const curLevel = player.level || 1;
    const curCoins = player.coins || 500;

    this.xpGained = 450;
    this.coinsGained = 300;

    const newXP = curXP + this.xpGained;
    const nextLevelXP = Lyra.getNextLevelXP(curLevel);

    if (newXP >= nextLevelXP) {
      this.leveledUp = true;
      player.level = curLevel + 1;
      this.newRankTitle = Lyra.getRankTitle(player.level);
    } else {
      this.leveledUp = false;
    }

    player.xp = newXP;
    player.coins = curCoins + this.coinsGained;
    this.totalScore += this.missionScore;
    player.score = this.totalScore;

    // Persiste no backend / storage
    API.saveGame({
      score: this.totalScore,
      xp: player.xp,
      level: player.level,
      coins: player.coins,
      current_mission: this.currentMissionIndex + 2,
      satellite_config: this.satelliteConfig
    });
    API.submitScore(this.totalScore, this.getCurrent().id);
    // Marca missão como concluída com sucesso
    API.setMissionStatus(this.getCurrent().id, 'SUCCESS');
  },

  advanceToNextMission() {
    API.setMissionStatus(this.currentMission ? this.currentMission.id : -1, 'SUCCESS');
    const nextIdx = this.currentMissionIndex + 1;
    this.clearActiveMission();

    if (nextIdx >= this.missions.length) {
      Game.state = 'CREDITS';
      return;
    }

    NasaTips.show({
      title: 'Missão Cumprida com Sucesso!',
      text: 'Excelente trabalho, Comandante! Explore o Vale do Taquari para aceitar o próximo desafio.',
      icon: '🎉'
    });
  },

  // ============================================
  // PASSO 1: RENDERIZAÇÃO DA CUTSCENE DO PROBLEMA
  // ============================================
  renderCutscene(ctx, w, h) {
    if (!this.cutsceneActive || !this.cutsceneMission) return;
    const m = this.cutsceneMission;

    ctx.save();
    ctx.fillStyle = 'rgba(6, 10, 30, 0.96)';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    const boxW = Math.min(780, w - 60);
    const boxH = Math.min(520, h - 60);
    const boxX = w / 2 - boxW / 2;
    const boxY = h / 2 - boxH / 2;

    // Moldura de Cutscene de Alta Tecnologia
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Mascote Lyra apresentando
    Lyra.render(ctx, boxX + 65, boxY + 65, 38, 'excited', 'Lyra ⭐');

    // Título da Cutscene
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.fillText(`🚨 ALERTA NO VALE DO TAQUARI: ${m.npc_name}`, boxX + 130, boxY + 52);

    // Badge de Dificuldade Progressiva
    const diffText = m.difficulty === 1 ? '🟢 Dificuldade: Iniciante (Fácil)' :
                     m.difficulty === 2 ? '🟡 Dificuldade: Moderada' :
                     m.difficulty === 3 ? '🟠 Dificuldade: Avançada' : '🔴 Dificuldade: Especialista';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillText(diffText, boxX + 130, boxY + 80);

    // Bloco Ilustrado do Problema Local
    ctx.fillStyle = 'rgba(0, 180, 216, 0.12)';
    ctx.fillRect(boxX + 25, boxY + 115, boxW - 50, 150);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX + 25, boxY + 115, boxW - 50, 150);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(`Relato de ${m.npc_name}:`, boxX + 45, boxY + 142);

    ctx.fillStyle = '#e0e0ff';
    ctx.font = '16px "Segoe UI", sans-serif';
    this.wrapText(ctx, `"${m.npc_dialog}"`, boxX + 45, boxY + 172, boxW - 90, 24);

    // Bloco Objetivo Espacial da Missão
    ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
    ctx.fillRect(boxX + 25, boxY + 280, boxW - 50, 110);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(boxX + 25, boxY + 280, boxW - 50, 110);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText('🎯 SEU OBJETIVO ESPACIAL (PASSO 1):', boxX + 45, boxY + 308);

    ctx.fillStyle = '#ffffff';
    ctx.font = '15px "Segoe UI", sans-serif';
    this.wrapText(ctx, m.description, boxX + 45, boxY + 334, boxW - 90, 22);

    // Botão Grande Aceitar Desafio
    const btnW = 380;
    const btnH = 54;
    const bx = w / 2 - btnW / 2;
    const by = boxY + boxH - 75;

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, btnW, btnH, 12) : ctx.rect(bx, by, btnW, btnH);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✅ ACEITAR DESAFIO [ENTER] ➔', w / 2, by + 34);

    ctx.restore();
  },

  // ============================================
  // PASSO 5: VISÃO ESPACIAL & TELEMETRIA
  // ============================================
  renderSpaceCollect(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#03071e';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    // Curvatura do planeta Terra (Rio Grande do Sul / Vale do Taquari)
    const earthRadius = w * 0.85;
    const earthY = h + earthRadius - 200;
    ctx.fillStyle = '#1d3557';
    ctx.beginPath();
    ctx.arc(w / 2, earthY, earthRadius, Math.PI, Math.PI * 2);
    ctx.fill();

    // Relevo verde e Rio Taquari
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(w / 2, earthY, earthRadius - 4, Math.PI * 1.15, Math.PI * 1.85);
    ctx.fill();

    // Atmosfera azul brilhante
    ctx.strokeStyle = 'rgba(78, 168, 222, 0.6)';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Satélite em órbita
    const satX = w / 2;
    const satY = 175;
    const time = Date.now() / 300;

    // Feixes de dados (laser / micro-ondas) descendo para a Terra
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.lineDashOffset = -time * 20;
    ctx.beginPath();
    ctx.moveTo(satX, satY + 30);
    ctx.lineTo(w / 2 - 40, h - 90);
    ctx.lineTo(w / 2 + 40, h - 90);
    ctx.stroke();
    ctx.setLineDash([]);

    // Satélite
    ctx.save();
    ctx.translate(satX, satY);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(-22, -22, 44, 44);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-22, -22, 44, 44);

    // Painéis solares
    ctx.fillStyle = '#0077b6';
    ctx.strokeStyle = '#00f5d4';
    ctx.fillRect(-75, -16, 50, 32);
    ctx.strokeRect(-75, -16, 50, 32);
    ctx.fillRect(25, -16, 50, 32);
    ctx.strokeRect(25, -16, 50, 32);
    ctx.restore();

    // Lyra flutuando em traje espacial explicando
    Lyra.render(ctx, 110, 110, 42, 'excited', 'Lyra no Espaço');

    // Balão de fala da Lyra
    const bubbleW = Math.min(620, w - 240);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(180, 50, bubbleW, 95);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(180, 50, bubbleW, 95);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⭐ PASSO 5: COLETA DE DADOS EM ÓRBITA', 200, 78);

    ctx.fillStyle = '#ffffff';
    ctx.font = '15px "Segoe UI", sans-serif';
    this.wrapText(
      ctx,
      'Lyra: "Olha só que lindo! Nosso satélite está a 600 km de altitude sobrevoando o Vale do Taquari! Os feixes de dados já estão chegando às estações terrestres!"',
      200, 104, bubbleW - 40, 20
    );

    // Botão de prosseguir para o Impacto
    const btnW = 340;
    const btnH = 50;
    const bx = w / 2 - btnW / 2;
    const by = h - 75;

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, btnW, btnH, 10) : ctx.rect(bx, by, btnW, btnH);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    const collectBtnLabel = this.missionFailed ? '⚠️ VER RESULTADO [ESPAÇO]' : 'VER IMPACTO NA TERRA [ESPAÇO] ➔';
    ctx.fillText(collectBtnLabel, w / 2, by + 32);

    ctx.restore();
  },

  // ============================================
  // PASSO 6: IMPACTO, FEEDBACK DAS PEÇAS E RECOMPENSAS
  // ============================================
  renderImpactScreen(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 14, 38, 0.98)';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    const m = this.getCurrent();
    if (!m) return;

    const boxW = Math.min(780, w - 60);
    const boxX = w / 2 - boxW / 2;

    // Título Principal
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.fillText('🎉 PASSO 6: MISSÃO CUMPRIDA COM SUCESSO!', w / 2, 45);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillText(m.title, w / 2, 74);

    // 1. Bloco de Impacto no Vale do Taquari
    ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
    ctx.fillRect(boxX, 95, boxW, 85);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, 95, boxW, 85);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillText('🌍 Impacto Real no Vale do Taquari:', boxX + 18, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px "Segoe UI", sans-serif';
    this.wrapText(ctx, m.impact_text, boxX + 18, 142, boxW - 36, 20);

    // 2. Bloco Feedback das Peças Escolhidas (Requisito Explícito)
    ctx.fillStyle = 'rgba(0, 180, 216, 0.15)';
    ctx.fillRect(boxX, 192, boxW, 85);
    ctx.strokeStyle = '#00b4d8';
    ctx.strokeRect(boxX, 192, boxW, 85);

    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillText('🛠️ Feedback das Suas Escolhas de Engenharia:', boxX + 18, 217);

    ctx.fillStyle = '#e0e0ff';
    ctx.font = '14px "Segoe UI", sans-serif';
    this.wrapText(ctx, this.choiceFeedback, boxX + 18, 240, boxW - 36, 19);

    // 3. Bloco Recompensas (Space Coins + XP + Level Up)
    ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
    ctx.fillRect(boxX, 288, boxW, 95);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(boxX, 288, boxW, 95);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText('🏆 RECOMPENSAS DA AGÊNCIA ESPACIAL:', boxX + 18, 314);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px "Segoe UI", sans-serif';
    ctx.fillText(`⭐ +${this.xpGained} XP Ganho  •  🪙 +${this.coinsGained} Space Coins Liberadas!`, boxX + 18, 342);

    if (this.leveledUp) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 15px "Segoe UI", sans-serif';
      ctx.fillText(`🎉 SUBIU DE NÍVEL! Novo Cargo: ${this.newRankTitle}`, boxX + 18, 368);
    } else {
      const curLvl = API.currentPlayer ? API.currentPlayer.level : 1;
      ctx.fillStyle = '#adb5bd';
      ctx.font = '14px "Segoe UI", sans-serif';
      ctx.fillText(`Cargo Atual: ${Lyra.getRankTitle(curLvl)}`, boxX + 18, 368);
    }

    // 4. Bloco Dica NASA
    ctx.fillStyle = 'rgba(124, 58, 237, 0.12)';
    ctx.fillRect(boxX, 395, boxW, 70);
    ctx.strokeStyle = '#c084fc';
    ctx.strokeRect(boxX, 395, boxW, 70);

    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillText('🛰️ O Que Aprendemos com a NASA:', boxX + 18, 417);

    ctx.fillStyle = '#f8f9fa';
    ctx.font = '12px "Segoe UI", sans-serif';
    this.wrapText(ctx, m.nasa_tips, boxX + 18, 437, boxW - 36, 17);

    // Botão Avançar
    const btnW = 380;
    const btnH = 50;
    const bx = w / 2 - btnW / 2;
    const by = Math.max(480, h - 75);

    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, btnW, btnH, 10) : ctx.rect(bx, by, btnW, btnH);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CONTINUAR JORNADA [ENTER] ➔', w / 2, by + 32);

    ctx.restore();
  },

  // ============================================
  // CRÉDITOS FINAIS & LINKS DE DADOS REAIS
  // ============================================
  renderCreditsScreen(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#070b1e';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    // Lyra celebrando no topo
    Lyra.render(ctx, w / 2, 65, 42, 'excited', 'Missão Cumprida!');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.fillText('🎉 PARABÉNS, COMANDANTE DO VALE DO TAQUARI! 🎉', w / 2, 135);

    ctx.fillStyle = '#90e0ef';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText('Você transformou a tecnologia espacial em soluções reais para nosso planeta!', w / 2, 165);

    const boxW = Math.min(740, w - 80);
    const boxX = w / 2 - boxW / 2;

    // Painel de Fontes Reais de Dados (Requisito Explícito)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(boxX, 195, boxW, 230);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(boxX, 195, boxW, 230);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillText('🌐 FONTES DE DADOS REAIS UTILIZADAS NA SIMULAÇÃO:', boxX + 25, 230);

    // Link 1: Meteomatics API
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText('1. Meteomatics Weather & Climate API:', boxX + 25, 268);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px monospace';
    ctx.fillText('https://www.meteomatics.com/en/api/getting-started/', boxX + 45, 292);

    // Link 2: NASA Worldview
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText('2. NASA Worldview (Camadas MODIS, FIRMS e Alertas Climáticos):', boxX + 25, 335);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px monospace';
    ctx.fillText('https://worldview.earthdata.nasa.gov/', boxX + 45, 359);

    ctx.fillStyle = '#adb5bd';
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillText('Dados de satélites reais utilizados para monitoramento agrícola, prevenção de cheias e preservação.', boxX + 25, 400);

    // Botão Voltar ao Menu
    const btnW = 280;
    const btnH = 48;
    const bx = w / 2 - btnW / 2;
    const by = h - 75;

    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, btnW, btnH, 8) : ctx.rect(bx, by, btnW, btnH);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VOLTAR AO MENU [ESC]', w / 2, by + 30);

    ctx.restore();
  },

  // ============================================
  // TELA DE FALHA DA MISSÃO (RNG ou Baixa Chance)
  // ============================================
  renderFailScreen(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 4, 20, 0.98)';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    // Título de falha
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 20;
    ctx.fillText('💥 MISSÃO COMPROMETIDA!', w / 2, 70);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fca5a5';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillText('Falha técnica em órbita — a probabilidade era alta demais!', w / 2, 108);

    // Lyra triste
    Lyra.render(ctx, w / 2, 170, 42, 'sad', 'Lyra ⭐');

    const boxW = Math.min(640, w - 80);
    const boxX = w / 2 - boxW / 2;

    ctx.fillStyle = 'rgba(239,68,68,0.12)';
    ctx.fillRect(boxX, 215, boxW, 115);
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
    ctx.strokeRect(boxX, 215, boxW, 115);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('⚠️ O que aconteceu:', boxX + 20, 243);

    const cfg = this.satelliteConfig || {};
    const stats = cfg.stats || {};
    const sr = stats.successRate || 0;
    ctx.fillStyle = '#fca5a5';
    ctx.font = '15px "Segoe UI", sans-serif';
    ctx.fillText(`Sua nave tinha apenas ${sr}% de Chance de Sucesso.`, boxX + 20, 270);
    ctx.fillText('Para missões abaixo de 60%, o risco de falha é muito alto!', boxX + 20, 296);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillText('💡 Dica: Na próxima vez, melhore as peças (bateria RTG, CPU Quântica, sensor correto)!', boxX + 20, 322);

    // Regra: 1 tentativa — missão bloqueada
    ctx.fillStyle = 'rgba(100,100,100,0.3)';
    ctx.fillRect(boxX, 348, boxW, 50);
    ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, 348, boxW, 50);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔒 Esta operação está encerrada. Cada missão permite apenas 1 tentativa.', w / 2, 368);
    ctx.fillText('Vá ao Centro Espacial > Painel de Operações para ver o status de todas as missões.', w / 2, 390);

    // Botão voltar
    const btnW = 340; const btnH = 52;
    const bx = w / 2 - btnW / 2;
    const by = h - 80;
    ctx.fillStyle = '#374151';
    ctx.fillRect(bx, by, btnW, btnH);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, btnW, btnH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px "Segoe UI", sans-serif';
    ctx.fillText('VOLTAR AO CENTRO ESPACIAL [ENTER]', bx + btnW / 2, by + 33);

    ctx.restore();
  },

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    const words = text.split(' ');
    let line = '';
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
  }
};
