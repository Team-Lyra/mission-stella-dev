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

  /** Primeira missão com status FAILED (o Diretor é quem libera o refazer) */
  getFailedMission() {
    return this.missions.find(m => API.getMissionStatus(m.id) === 'FAILED') || null;
  },

  /** Libera o refazer: limpa o status FAILED e zera a tentativa (peças, pontos, fases) */
  unlockFailedMission(mission) {
    if (!mission) return;
    API.setMissionStatus(mission.id, null);
    this.missionScore = 0;
    this.missionFailed = false;
    this.phase = 'EXPLORE';
    this.satelliteConfig = null;
    this.currentMission = null;
    this.currentMissionIndex = -1;
    NasaAudio.lockSuccess();
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

    // Mascote Lyra apresentando (sem rótulo para não sobrepor o texto)
    Lyra.render(ctx, boxX + 65, boxY + 65, 38, 'excited', '');

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

    // Lyra flutuando em traje espacial explicando (sem rótulo para não sobrepor o balão)
    Lyra.render(ctx, 110, 110, 42, 'excited', '');

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

    const boxW = Math.min(820, w - 60);
    const boxX = w / 2 - boxW / 2;

    // Título Principal
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 30px "Segoe UI", sans-serif';
    ctx.fillText('🎉 MISSÃO CUMPRIDA COM SUCESSO!', w / 2, 45);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText(m.title, w / 2, 76);

    // Layout dinâmico: caixas se ajustam ao texto (cabe sempre)
    ctx.textAlign = 'left';
    const innerW = boxW - 40;
    let y = 95;

    const drawBlock = (header, headerColor, body, bodyColor, bodyFont, lineH) => {
      ctx.font = bodyFont;
      const lines = this.countWrapLines(ctx, body, innerW);
      const blockH = 34 + lines * lineH + 16;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(boxX, y, boxW, blockH);
      ctx.strokeStyle = headerColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, y, boxW, blockH);

      ctx.fillStyle = headerColor;
      ctx.font = 'bold 17px "Segoe UI", sans-serif';
      ctx.fillText(header, boxX + 20, y + 26);

      ctx.fillStyle = bodyColor;
      ctx.font = bodyFont;
      this.wrapText(ctx, body, boxX + 20, y + 52, innerW, lineH);
      y += blockH + 12;
    };

    // 1. Impacto no Vale do Taquari
    drawBlock('🌍 Impacto Real no Vale do Taquari:', '#22c55e',
      m.impact_text, '#ffffff', '16px "Segoe UI", sans-serif', 22);

    // 2. Feedback das peças escolhidas
    if (this.choiceFeedback) {
      drawBlock('🛠️ Feedback das Suas Escolhas de Engenharia:', '#00f5d4',
        this.choiceFeedback, '#e0e0ff', '16px "Segoe UI", sans-serif', 22);
    }

    // 3. Recompensas (Space Coins + XP + Level Up)
    ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
    const rewH = this.leveledUp ? 100 : 78;
    ctx.fillRect(boxX, y, boxW, rewH);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(boxX, y, boxW, rewH);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 17px "Segoe UI", sans-serif';
    ctx.fillText('🏆 RECOMPENSAS DA AGÊNCIA ESPACIAL:', boxX + 20, y + 26);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillText(`⭐ +${this.xpGained} XP  •  🪙 +${this.coinsGained} Space Coins!`, boxX + 20, y + 52);

    if (this.leveledUp) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 16px "Segoe UI", sans-serif';
      ctx.fillText(`🎉 SUBIU DE NÍVEL! Novo Cargo: ${this.newRankTitle}`, boxX + 20, y + 78);
    } else {
      const curLvl = API.currentPlayer ? API.currentPlayer.level : 1;
      ctx.fillStyle = '#adb5bd';
      ctx.font = '15px "Segoe UI", sans-serif';
      ctx.fillText(`Cargo Atual: ${Lyra.getRankTitle(curLvl)}`, boxX + 20, y + 74);
    }
    y += rewH + 12;

    // 4. Dica NASA
    drawBlock('🛰️ O Que Aprendemos com a NASA:', '#c084fc',
      m.nasa_tips, '#f8f9fa', '15px "Segoe UI", sans-serif', 20);

    // Botão Avançar
    const btnW = 380;
    const btnH = 50;
    const bx = w / 2 - btnW / 2;
    const by = Math.min(Math.max(y + 5, h - 75), h - btnH - 10);

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

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 34px "Segoe UI", sans-serif';
    ctx.fillText('🎉 PARABÉNS, COMANDANTE! 🎉', w / 2, 100);

    ctx.fillStyle = '#90e0ef';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText('Você usou o espaço para ajudar o nosso planeta!', w / 2, 138);

    const boxW = Math.min(760, w - 80);
    const boxX = w / 2 - boxW / 2;

    // Painel de Fontes Reais de Dados (Requisito Explícito)
    const panelY = 170;
    const panelH = 250;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(boxX, panelY, boxW, panelH);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(boxX, panelY, boxW, panelH);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText('🌐 DADOS REAIS UTILIZADOS NO JOGO:', boxX + 25, panelY + 35);

    // Link 1: Meteomatics API
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 17px "Segoe UI", sans-serif';
    ctx.fillText('1. Meteomatics Weather & Climate API (clima em tempo real):', boxX + 25, panelY + 72);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '15px monospace';
    ctx.fillText('https://www.meteomatics.com/en/api/getting-started/', boxX + 45, panelY + 96);

    // Link 2: NASA Worldview
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 17px "Segoe UI", sans-serif';
    ctx.fillText('2. NASA Worldview (Camadas MODIS, FIRMS e Alertas Climáticos):', boxX + 25, panelY + 128);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '15px monospace';
    ctx.fillText('https://worldview.earthdata.nasa.gov/', boxX + 45, panelY + 152);

    ctx.fillStyle = '#adb5bd';
    ctx.font = '15px "Segoe UI", sans-serif';
    this.wrapText(ctx, 'Missões inspiradas em dados NASA.', boxX + 25, panelY + 185, boxW - 50, 20);

    // Lyra comemorando ABAIXO do quadro de dados
    Lyra.render(ctx, w / 2, panelY + panelH + 55, 45, 'excited', '');

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
    ctx.fillText('💥 O lançamento não deu certo desta vez!', w / 2, 108);

    // Lyra triste (sem rótulo para não sobrepor o texto)
    Lyra.render(ctx, w / 2, 170, 42, 'sad', '');

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
    ctx.fillText(`Sua nave tinha ${sr}% de Chance de Sucesso.`, boxX + 20, 270);
    ctx.fillText('Naves com menos de 75% de chance podem falhar! Melhore as peças! 🔧', boxX + 20, 296);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillText('💡 Dica: Melhore as peças e refaça com confiança!', boxX + 20, 322);

    // Caminho para refazer: falar com o DIRETOR no Centro Espacial
    const hintW = Math.min(520, boxW - 40);
    const hintH = 66;
    const hx = w / 2 - hintW / 2;
    const hy = 350;
    const pulse = 0.75 + 0.25 * Math.sin(Date.now() / 300);
    ctx.fillStyle = `rgba(0, 180, 216, ${0.25 + 0.2 * pulse})`;
    ctx.fillRect(hx, hy, hintW, hintH);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(hx, hy, hintW, hintH);
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 17px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🗺️ Fale com o DIRETOR no Centro Espacial', w / 2, hy + 27);
    ctx.fillText('para refazer a missão! 💪', w / 2, hy + 50);

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

  /** Conta quantas linhas um texto ocupa ao ser quebrado (para caixas dinâmicas) */
  countWrapLines(ctx, text, maxWidth) {
    if (!text) return 1;
    const words = text.split(' ');
    let lines = 1;
    let line = '';
    for (const word of words) {
      const testLine = line + word + ' ';
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines++;
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    return lines;
  },

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;    const words = text.split(' ');
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
