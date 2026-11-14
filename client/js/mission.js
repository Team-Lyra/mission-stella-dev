// ============================================
// mission.js — Sistema e Ciclo Completo de Missões (Core Loop)
// ============================================

const MissionManager = {
  missions: [],
  currentMissionIndex: 0,
  currentMission: null,
  phase: 'EXPLORE', // 'EXPLORE', 'PLAN', 'LAUNCH', 'COLLECT', 'IMPACT'
  satelliteConfig: null,
  missionScore: 0,
  totalScore: 0,

  async init() {
    this.missions = await API.getMissions();
    // Começa sem nenhuma missão ativa: o jogador precisa falar com o morador
    this.currentMission = null;
    this.currentMissionIndex = -1;
    this.phase = 'EXPLORE';
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

  setMissionById(id) {
    return this.setActiveMission(id);
  },

  setMissionByIndex(idx) {
    if (idx >= 0 && idx < this.missions.length) {
      this.currentMissionIndex = idx;
      this.currentMission = this.missions[idx];
      return true;
    }
    return false;
  },

  setPhase(newPhase) {
    this.phase = newPhase;
    console.log(`[Missão] Fase atual alterada para: ${newPhase}`);
  },

  startSatelliteAssembly() {
    this.phase = 'PLAN';
    SatelliteBuilder.open(this.getCurrent());
  },

  completeSatelliteAssembly(config) {
    this.satelliteConfig = config;
    this.phase = 'LAUNCH';

    // Calcula bônus de compatibilidade do sensor com a missão
    let bonus = 100;
    const missionProblem = this.getCurrent().problem_type;
    if (config.sensor && config.sensor.bestFor === missionProblem) {
      bonus = 400; // Sensor ideal escolhido!
    }
    this.missionScore = bonus;

    // Inicia Minigame de Calibração Científica NASA e Lançamento
    LaunchMinigame.start(this.getCurrent(), (launchPoints) => {
      this.completeLaunch(launchPoints);
    });
  },

  completeLaunch(launchPoints) {
    this.missionScore += launchPoints;
    this.phase = 'COLLECT';

    // Mostra Dica da NASA após o lançamento
    NasaTips.show({
      title: "Órbita e Coleta de Dados",
      text: this.getCurrent().nasa_tips || "Os dados coletados pelo satélite são recebidos pelas antenas no Vale do Taquari!",
      icon: "🛰️"
    });

    // Após 3.5 segundos de coleta de dados no espaço, vai para a fase de IMPACTO
    setTimeout(() => {
      this.phase = 'IMPACT';
      this.totalScore += this.missionScore;

      // Salva no PostgreSQL via API
      API.saveGame({
        score: this.totalScore,
        current_mission: this.currentMissionIndex + 2,
        satellite_config: this.satelliteConfig
      });
      API.submitScore(this.totalScore, this.getCurrent().id);
    }, 3800);
  },

  advanceToNextMission() {
    // Concluiu a missão: limpa a missão ativa para o jogador escolher a próxima andando no mapa!
    this.clearActiveMission();

    NasaTips.show({
      title: "Missão Cumprida com Sucesso!",
      text: "Excelente trabalho, Comandante! Explore o mapa e converse com outro morador para aceitar um novo desafio.",
      icon: "🎉"
    });
  },

  renderSpaceCollect(ctx, w, h) {
    ctx.save();

    // Espaço sideral com a Terra abaixo
    ctx.fillStyle = '#03071e';
    ctx.fillRect(0, 0, w, h);

    // Curvatura do planeta Terra (Rio Grande do Sul / Vale do Taquari)
    const earthRadius = w * 0.9;
    const earthY = h + earthRadius - 220;
    ctx.fillStyle = '#1d3557';
    ctx.beginPath();
    ctx.arc(w / 2, earthY, earthRadius, Math.PI, Math.PI * 2);
    ctx.fill();

    // Continente verde e Rio Taquari
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(w / 2, earthY, earthRadius - 4, Math.PI * 1.15, Math.PI * 1.85);
    ctx.fill();

    // Atmosfera azul brilhante
    ctx.strokeStyle = 'rgba(78, 168, 222, 0.5)';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Satélite em órbita
    const satX = w / 2;
    const satY = 160;
    const time = Date.now() / 300;

    // Feixes de dados (laser / ondas de rádio) descendo para a Terra
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -time * 15;
    ctx.beginPath();
    ctx.moveTo(satX, satY + 25);
    ctx.lineTo(w / 2 - 30, h - 80);
    ctx.lineTo(w / 2 + 30, h - 80);
    ctx.stroke();
    ctx.setLineDash([]);

    // Satélite
    ctx.save();
    ctx.translate(satX, satY);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(-20, -20, 40, 40);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(-20, -20, 40, 40);

    // Painéis
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(-70, -14, 45, 28);
    ctx.fillRect(25, -14, 45, 28);
    ctx.restore();

    // Textos informativos no topo (com espaço seguro para não sobrepor o satélite)
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📡 RECEBENDO DADOS ESPACIAIS NO VALE DO TAQUARI', w / 2, 45);

    ctx.fillStyle = '#90e0ef';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText('Sensoriamento remoto em andamento... Processando telemetria!', w / 2, 75);

    ctx.restore();
  },

  renderImpactScreen(ctx, w, h) {
    ctx.save();

    // Fundo escuro com partículas de sucesso
    ctx.fillStyle = 'rgba(10, 14, 35, 0.98)';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    const mission = this.getCurrent();

    // Título de Impacto
    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 MISSÃO CONCLUÍDA COM SUCESSO!', w / 2, 75);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText(mission.title, w / 2, 115);

    // Caixa de Solução e Impacto Positivo no Vale do Taquari
    const boxW = Math.min(760, w - 100);
    const boxX = w / 2 - boxW / 2;

    // Bloco Solução
    ctx.fillStyle = 'rgba(64, 145, 108, 0.15)';
    ctx.fillRect(boxX, 140, boxW, 80);
    ctx.strokeStyle = '#40916c';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, 140, boxW, 80);

    ctx.fillStyle = '#52b788';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('💡 Solução Científica Aplicada:', boxX + 16, 162);

    ctx.fillStyle = '#e0e0ff';
    ctx.font = '13px "Segoe UI", sans-serif';
    this.wrapText(ctx, mission.solution_text, boxX + 16, 184, boxW - 32, 18);

    // Bloco Impacto no Vale
    ctx.fillStyle = 'rgba(0, 180, 216, 0.15)';
    ctx.fillRect(boxX, 235, boxW, 90);
    ctx.strokeStyle = '#00b4d8';
    ctx.strokeRect(boxX, 235, boxW, 90);

    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillText('🌍 Impacto Real no Vale do Taquari:', boxX + 16, 258);

    ctx.fillStyle = '#ffffff';
    ctx.font = '13px "Segoe UI", sans-serif';
    this.wrapText(ctx, mission.impact_text, boxX + 16, 280, boxW - 32, 18);

    // Bloco Dica Educativa da NASA
    ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
    ctx.fillRect(boxX, 340, boxW, 80);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(boxX, 340, boxW, 80);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillText('🛰️ O Que Aprendemos (Padrão NASA):', boxX + 16, 362);

    ctx.fillStyle = '#f8f9fa';
    ctx.font = '12px "Segoe UI", sans-serif';
    this.wrapText(ctx, mission.nasa_tips, boxX + 16, 382, boxW - 32, 17);

    // Pontuação
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillText(`+${this.missionScore} Pontos!  •  Pontuação Total: ${this.totalScore}`, w / 2, 445);

    // Botão continuar perfeitamente dimensionado com margem interna
    const btnText = 'PRÓXIMA MISSÃO [ESPAÇO / ENTER]';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    const textWidth = ctx.measureText(btnText).width;
    const btnW = Math.min(460, Math.max(360, textWidth + 60));
    const btnH = 48;
    const btnX = w / 2 - btnW / 2;
    const btnY = Math.max(470, h - 85);

    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(btnX, btnY, btnW, btnH, 8) : ctx.rect(btnX, btnY, btnW, btnH);
    ctx.fill();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(btnText, w / 2, btnY + 29);

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

