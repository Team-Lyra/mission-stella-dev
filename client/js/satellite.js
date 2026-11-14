// ============================================
// satellite.js — Design & Construção de Satélites (Passo 2 do Core Loop)
// ============================================

const SatelliteBuilder = {
  active: false,
  subStep: 0, // 0 = Briefing/Customização, 1 = Bancada Drag & Drop, 2 = Status Final
  currentMission: null,

  // Customização da Missão
  missionNameIndex: 0,
  missionNames: ['STELA-1 (Guardiã do Vale)', 'Eco-Taquari Orbital', 'Astro-Lajeado', 'Pioneiro RS-1'],
  crewIndex: 0,
  crewOptions: [
    { id: 'auto', name: 'Sonda Robótica Automática', icon: '🛰️', desc: '100% autônoma, leve e rápida', bonus: '+15 Eficiência de Voo' },
    { id: 'bit', name: 'Copiloto Robô Bit', icon: '🤖', desc: 'Robô auxiliar com IA da NASA', bonus: '+25 Confiabilidade de Sistemas' }
  ],
  budget: 1000,

  // Categorias de Peças
  categories: [
    { id: 'battery', name: 'Bateria', icon: '🔋' },
    { id: 'cpu', name: 'Computador', icon: '💻' },
    { id: 'comms', name: 'Comunicação', icon: '📡' },
    { id: 'sensor', name: 'Sensor', icon: '🔬' }
  ],
  selectedCategory: 0,

  // Peças Disponíveis
  parts: {
    battery: [
      { id: 'bat_solar', name: 'Bateria Solar NASA', energy: 35, mass: 8, icon: '☀️', desc: 'Recarrega com a luz do Sol no espaço.' },
      { id: 'bat_lithium', name: 'Bateria Íon-Lítio Turbo', energy: 50, mass: 12, icon: '🔋', desc: 'Alta densidade de energia para missões longas.' },
      { id: 'bat_rtg', name: 'Gerador Térmico Nuclear (RTG)', energy: 65, mass: 18, icon: '⚡', desc: 'Potência máxima e imune a noites escuras.' }
    ],
    cpu: [
      { id: 'cpu_basic', name: 'Processador SCaN Básico', rel: 35, mass: 4, icon: '📟', desc: 'Processador estável e de baixo consumo.' },
      { id: 'cpu_nasa', name: 'Computador de Voo Blindado NASA', rel: 55, mass: 7, icon: '💻', desc: 'Resistente a tempestades solares e radiação.' },
      { id: 'cpu_quantum', name: 'IA Quântica de Telemetria', rel: 70, mass: 10, icon: '🧠', desc: 'Calcula trajetórias e dados em milissegundos.' }
    ],
    comms: [
      { id: 'comm_dipole', name: 'Antena Dipolo Simples', rel: 30, mass: 3, icon: '📻', desc: 'Comunicação de rádio padrão confiável.' },
      { id: 'comm_ku', name: 'Transponder Banda Ku de Alta Velocidade', rel: 55, mass: 6, icon: '📡', desc: 'Transmite imagens e mapas em alta definição.' },
      { id: 'comm_laser', name: 'Laser Óptico de Comunicação Profunda', rel: 70, mass: 8, icon: '✨', desc: 'Feixe de luz ultrarrápido conectado à Terra.' }
    ],
    sensor: [
      { id: 'multiespectral', name: 'Câmera Multiespectral (NIR)', bestFor: 'agricultura', rel: 60, mass: 10, icon: '🌿', desc: 'Índice NDVI de folhas: detecta pragas invisíveis a olho nu!' },
      { id: 'sar_radar', name: 'Radar SAR de Micro-ondas', bestFor: 'deslizamentos', rel: 60, mass: 14, icon: '📡', desc: 'Atravessa nuvens de chuva e mede o relevo das encostas!' },
      { id: 'comms_ku', name: 'Transponder Rural Banda Ku', bestFor: 'comunicacao', rel: 60, mass: 10, icon: '📶', desc: 'Retransmite internet e sinal telefônico para áreas rurais!' },
      { id: 'thermal_ir', name: 'Sensor Térmico Infravermelho', bestFor: 'florestal', rel: 60, mass: 12, icon: '🔥', desc: 'Enxerga calor à noite para evitar queimadas no Rio Taquari!' }
    ]
  },

  // Slots equipados na nave (índices selecionados)
  equipped: {
    battery: 1, // default Íon-Lítio
    cpu: 1,     // default NASA
    comms: 1,   // default Banda Ku
    sensor: 0   // depende da missão
  },

  // Drag & drop state
  draggingPart: null,
  dragPos: { x: 0, y: 0 },

  init() {
    this.active = false;
    this.subStep = 0;
  },

  open(currentMission) {
    this.active = true;
    this.currentMission = currentMission;
    this.subStep = 0;
    this.selectedCategory = 0;

    // Sugere o sensor ideal automaticamente para a missão
    if (currentMission) {
      const ptype = currentMission.problem_type;
      const sensIdx = this.parts.sensor.findIndex(s => s.bestFor === ptype);
      if (sensIdx >= 0) this.equipped.sensor = sensIdx;
    }

    NasaAudio.lockSuccess();
  },

  close() {
    this.active = false;
  },

  // Cálculos gamificados das estatísticas
  getStats() {
    const bat = this.parts.battery[this.equipped.battery] || this.parts.battery[0];
    const cpu = this.parts.cpu[this.equipped.cpu] || this.parts.cpu[0];
    const comm = this.parts.comms[this.equipped.comms] || this.parts.comms[0];
    const sens = this.parts.sensor[this.equipped.sensor] || this.parts.sensor[0];
    const crew = this.crewOptions[this.crewIndex];

    // Checa bônus da loja
    const player = API.currentPlayer;
    const inv = player ? (player.inventory || []) : [];
    let bonusEnergy = 0;
    let bonusRel = 0;

    if (inv.includes('battery_graphene')) bonusEnergy += 25;
    if (inv.includes('quantum_cpu')) bonusRel += 20;
    if (inv.includes('gold_antenna')) { bonusEnergy += 10; bonusRel += 15; }

    const energy = Math.min(100, (bat.energy + 30 + (crew.id === 'auto' ? 10 : 0)) + bonusEnergy);
    const mass = 25 + bat.mass + cpu.mass + comm.mass + sens.mass;
    const reliability = Math.min(100, Math.round((cpu.rel + comm.rel + sens.rel) / 3 + (crew.id === 'bit' ? 15 : 5) + bonusRel));

    // Chance de Sucesso
    const isBestSensor = this.currentMission && sens.bestFor === this.currentMission.problem_type;
    const successRate = Math.min(99, Math.max(65, Math.round(energy * 0.35 + reliability * 0.45 + (isBestSensor ? 20 : 0))));

    return {
      energy,
      mass,
      reliability,
      successRate,
      isBestSensor,
      bat,
      cpu,
      comm,
      sens,
      crew
    };
  },

  handleInput(key) {
    if (!this.active) return null;

    if (this.subStep === 0) {
      if (key === 'ArrowLeft' || key === 'KeyA') {
        this.missionNameIndex = (this.missionNameIndex - 1 + this.missionNames.length) % this.missionNames.length;
        NasaAudio.click();
      } else if (key === 'ArrowRight' || key === 'KeyD') {
        this.missionNameIndex = (this.missionNameIndex + 1) % this.missionNames.length;
        NasaAudio.click();
      } else if (key === 'Tab') {
        this.crewIndex = (this.crewIndex + 1) % this.crewOptions.length;
        NasaAudio.click();
      } else if (key === 'Enter' || key === 'Space') {
        this.subStep = 1; // Vai para a bancada
        NasaAudio.lockSuccess();
      } else if (key === 'Escape') {
        this.close();
      }
    } else if (this.subStep === 1) {
      if (key === 'Tab') {
        this.selectedCategory = (this.selectedCategory + 1) % this.categories.length;
        NasaAudio.click();
      } else if (key === 'ArrowLeft' || key === 'KeyA') {
        const catId = this.categories[this.selectedCategory].id;
        const count = this.parts[catId].length;
        this.equipped[catId] = (this.equipped[catId] - 1 + count) % count;
        NasaAudio.click();
      } else if (key === 'ArrowRight' || key === 'KeyD') {
        const catId = this.categories[this.selectedCategory].id;
        const count = this.parts[catId].length;
        this.equipped[catId] = (this.equipped[catId] + 1) % count;
        NasaAudio.click();
      } else if (key === 'Enter' || key === 'Space') {
        this.subStep = 2; // Vai para a revisão final
        NasaAudio.lockSuccess();
      } else if (key === 'Escape') {
        this.subStep = 0;
      }
    } else if (this.subStep === 2) {
      if (key === 'Enter' || key === 'Space') {
        // Concluiu a montagem! Retorna configuração pronta para os testes
        const stats = this.getStats();
        const config = {
          name: this.missionNames[this.missionNameIndex],
          crew: stats.crew,
          sensor: stats.sens,
          battery: stats.bat,
          cpu: stats.cpu,
          comms: stats.comm,
          stats: stats
        };
        this.active = false;
        return config;
      } else if (key === 'Escape') {
        this.subStep = 1;
      }
    }
    return null;
  },

  handlePointerDown(mx, my, w, h) {
    if (!this.active) return null;

    if (this.subStep === 0) {
      // Botão Próximo
      const btnW = 340;
      const btnH = 55;
      const bx = w / 2 - btnW / 2;
      const by = h - 90;
      if (mx >= bx && mx <= bx + btnW && my >= by && my <= by + btnH) {
        this.subStep = 1;
        NasaAudio.lockSuccess();
        return null;
      }
      // Troca de Nome
      if (my >= 160 && my <= 230) {
        this.missionNameIndex = (this.missionNameIndex + 1) % this.missionNames.length;
        NasaAudio.click();
      }
      // Troca de Tripulante
      if (my >= 250 && my <= 340) {
        this.crewIndex = (this.crewIndex + 1) % this.crewOptions.length;
        NasaAudio.click();
      }
    } else if (this.subStep === 1) {
      // Botão Concluir Montagem
      const btnW = 360;
      const btnH = 50;
      const bx = w / 2 - btnW / 2;
      const by = h - 75;
      if (mx >= bx && mx <= bx + btnW && my >= by && my <= by + btnH) {
        this.subStep = 2;
        NasaAudio.lockSuccess();
        return null;
      }

      // Tabs de categorias no topo
      const tabW = 140;
      const tabStartX = 60;
      for (let i = 0; i < this.categories.length; i++) {
        const tx = tabStartX + i * (tabW + 12);
        if (mx >= tx && mx <= tx + tabW && my >= 100 && my <= 145) {
          this.selectedCategory = i;
          NasaAudio.click();
          return null;
        }
      }

      // Seleção de peças na prateleira esquerda
      const catId = this.categories[this.selectedCategory].id;
      const list = this.parts[catId];
      const cardW = Math.min(380, w * 0.42);
      const cardStartX = 60;
      const startY = 160;
      const cardH = 80;

      for (let i = 0; i < list.length; i++) {
        const cy = startY + i * (cardH + 12);
        if (mx >= cardStartX && mx <= cardStartX + cardW && my >= cy && my <= cy + cardH) {
          this.equipped[catId] = i;
          NasaAudio.inspectChime();
          return null;
        }
      }
    } else if (this.subStep === 2) {
      // Botão Iniciar Testes Científicos
      const btnW = 420;
      const btnH = 58;
      const bx = w / 2 - btnW / 2;
      const by = h - 85;
      if (mx >= bx && mx <= bx + btnW && my >= by && my <= by + btnH) {
        const stats = this.getStats();
        const config = {
          name: this.missionNames[this.missionNameIndex],
          crew: stats.crew,
          sensor: stats.sens,
          battery: stats.bat,
          cpu: stats.cpu,
          comms: stats.comm,
          stats: stats
        };
        this.active = false;
        return config;
      }
    }
    return null;
  },

  render(ctx, w, h) {
    if (!this.active) return;

    ctx.save();
    // Fundo espacial tecnológico
    ctx.fillStyle = '#080d24';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    if (this.subStep === 0) {
      this.renderBriefing(ctx, w, h);
    } else if (this.subStep === 1) {
      this.renderWorkbench(ctx, w, h);
    } else {
      this.renderFinalReview(ctx, w, h);
    }

    ctx.restore();
  },

  // 1. Briefing e Customização Inicial
  renderBriefing(ctx, w, h) {
    // Guia Lyra no topo
    Lyra.render(ctx, w / 2, 70, 36, 'happy', '');

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ PASSO 2: BASTIDORES DA MISSÃO STELA', w / 2, 135);

    ctx.fillStyle = '#90e0ef';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText('Lyra: "Comandante, escolha o nome oficial da nossa nave e quem vai com a gente!"', w / 2, 162);

    const boxW = Math.min(680, w - 60);
    const boxX = w / 2 - boxW / 2;

    // Card 1: Nome da Missão
    ctx.fillStyle = 'rgba(0, 180, 216, 0.15)';
    ctx.fillRect(boxX, 185, boxW, 85);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, 185, boxW, 85);

    ctx.fillStyle = '#adb5bd';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('NOME DA SONDA / SATÉLITE (Clique ou use [←/→] para trocar):', boxX + 20, 208);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText(`🚀 ${this.missionNames[this.missionNameIndex]}`, boxX + 20, 245);

    // Card 2: Tripulação / Copiloto
    ctx.fillStyle = 'rgba(124, 58, 237, 0.15)';
    ctx.fillRect(boxX, 285, boxW, 95);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, 285, boxW, 95);

    ctx.fillStyle = '#adb5bd';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillText('SISTEMA DE PILOTAGEM (Clique ou use [TAB] para alternar):', boxX + 20, 308);

    const crew = this.crewOptions[this.crewIndex];
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText(`${crew.icon} ${crew.name}`, boxX + 20, 342);

    ctx.fillStyle = '#52b788';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillText(crew.bonus, boxX + 20, 366);

    // Card 3: Orçamento fornecido
    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.fillRect(boxX, 395, boxW, 65);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(boxX, 395, boxW, 65);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillText('🪙 Orçamento Governamental: 1.000 Space Credits Liberados!', boxX + 20, 434);

    // Botão de prosseguir
    const btnW = 340;
    const btnH = 52;
    const bx = w / 2 - btnW / 2;
    const by = h - 90;

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, btnW, btnH, 10) : ctx.rect(bx, by, btnW, btnH);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IR PARA A BANCADA [ENTER] ➔', w / 2, by + 33);
  },

  // 2. Bancada Drag & Drop e Montagem Visual
  renderWorkbench(ctx, w, h) {
    // Topo
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔬 BANCADA DE ENGENHARIA — MONTAGEM VISUAL', w / 2, 40);

    ctx.fillStyle = '#90e0ef';
    ctx.font = '15px "Segoe UI", sans-serif';
    ctx.fillText('Clique nas peças na estante para equipar cada módulo do seu satélite!', w / 2, 65);

    // Tabs de Categorias
    const tabW = 140;
    const tabStartX = 60;
    for (let i = 0; i < this.categories.length; i++) {
      const cat = this.categories[i];
      const isSel = i === this.selectedCategory;
      const tx = tabStartX + i * (tabW + 12);

      ctx.fillStyle = isSel ? '#00b4d8' : 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(tx, 90, tabW, 40, 8) : ctx.rect(tx, 90, tabW, 40);
      ctx.fill();
      ctx.strokeStyle = isSel ? '#ffd700' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isSel ? '#000000' : '#ffffff';
      ctx.font = 'bold 15px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${cat.icon} ${cat.name}`, tx + tabW / 2, 116);
    }

    // Lado Esquerdo: Peças da Categoria Ativa
    const catId = this.categories[this.selectedCategory].id;
    const list = this.parts[catId];
    const cardW = Math.min(420, w * 0.44);
    const cardStartX = 60;
    const startY = 145;
    const cardH = 75;

    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const isEquipped = this.equipped[catId] === i;
      const iy = startY + i * (cardH + 12);

      ctx.fillStyle = isEquipped ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(cardStartX, iy, cardW, cardH);
      ctx.strokeStyle = isEquipped ? '#22c55e' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isEquipped ? 2.5 : 1;
      ctx.strokeRect(cardStartX, iy, cardW, cardH);

      // Ícone
      ctx.font = '28px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.icon, cardStartX + 30, iy + 48);

      // Título
      ctx.textAlign = 'left';
      ctx.fillStyle = isEquipped ? '#ffd700' : '#ffffff';
      ctx.font = 'bold 16px "Segoe UI", sans-serif';
      ctx.fillText((isEquipped ? '✓ ' : '') + item.name, cardStartX + 60, iy + 28);

      // Descrição simples para crianças
      ctx.fillStyle = '#adb5bd';
      ctx.font = '13px "Segoe UI", sans-serif';
      ctx.fillText(item.desc, cardStartX + 60, iy + 52, cardW - 75);
    }

    // Lado Direito: Visualização Esquemática da Nave montada em tempo real
    const previewX = w * 0.53;
    const previewY = 145;
    const previewW = w * 0.42;
    const previewH = h - 235;

    this.renderSatelliteModel(ctx, previewX, previewY, previewW, previewH);

    // Botão Concluir Montagem no Rodapé
    const btnW = 380;
    const btnH = 50;
    const bx = w / 2 - btnW / 2;
    const by = h - 70;

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
    ctx.fillText('AVANÇAR PARA STATUS FINAL [ENTER] ➔', w / 2, by + 32);
  },

  // 3. Revisão Final com Estatísticas e Chance de Sucesso
  renderFinalReview(ctx, w, h) {
    const stats = this.getStats();

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🚀 NAVE PRONTA: ${this.missionNames[this.missionNameIndex]}`, w / 2, 50);

    ctx.fillStyle = '#90e0ef';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText('A Lyra analisou todas as peças da sua nave espacial!', w / 2, 78);

    const boxW = Math.min(760, w - 80);
    const boxX = w / 2 - boxW / 2;

    // Mascote Lyra avaliando
    Lyra.render(ctx, boxX + 60, 160, 42, 'excited', 'Inspetora Lyra');

    // Painel de Estatísticas Gamificadas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(boxX + 130, 115, boxW - 130, 195);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX + 130, 115, boxW - 130, 195);

    ctx.textAlign = 'left';

    // Barra 1: Energia / Força
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillText(`⚡ Força / Energia: ${stats.energy} / 100`, boxX + 150, 145);
    this.drawProgressBar(ctx, boxX + 150, 155, 380, 14, stats.energy / 100, '#ffd700');

    // Barra 2: Confiabilidade dos Sistemas
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`🛡️ Confiabilidade dos Sensores: ${stats.reliability}%`, boxX + 150, 195);
    this.drawProgressBar(ctx, boxX + 150, 205, 380, 14, stats.reliability / 100, '#38bdf8');

    // Massa Total
    ctx.fillStyle = '#adb5bd';
    ctx.fillText(`⚖️ Massa Total: ${stats.mass} kg (Carga Leve e Aerodinâmica)`, boxX + 150, 245);

    // CHANCE DE SUCESSO DA MISSÃO (Grande destaque para crianças)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.fillRect(boxX, 325, boxW, 85);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(boxX, 325, boxW, 85);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText(`🎯 CHANCE DE SUCESSO DA MISSÃO: ${stats.successRate}%`, boxX + 25, 360);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText(
      stats.isBestSensor
        ? '✓ Sensor perfeito para o problema do Vale do Taquari! Ganha bônus de pontuação!'
        : '⚠️ Dica: Você pode testar este sensor, mas o ideal para esta região seria o sensor especializado.',
      boxX + 25, 390
    );

    // Botão de prosseguir para os TESTES CIENTÍFICOS (Passo 3)
    const btnW = 440;
    const btnH = 56;
    const bx = w / 2 - btnW / 2;
    const by = h - 85;

    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(bx, by, btnW, btnH, 12) : ctx.rect(bx, by, btnW, btnH);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔬 INICIAR TESTES CIENTÍFICOS DA NASA [ENTER] ➔', w / 2, by + 35);
  },

  drawProgressBar(ctx, x, y, w, h, pct, color) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w * Math.max(0, Math.min(1, pct)), h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.strokeRect(x, y, w, h);
  },

  // Desenha a nave montada graficamente com asas e lente
  renderSatelliteModel(ctx, x, y, width, height) {
    ctx.fillStyle = 'rgba(10, 16, 38, 0.85)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛰️ MONTAGEM EM TEMPO REAL', x + width / 2, y + 25);

    const cx = x + width / 2;
    const cy = y + height / 2;
    const time = Date.now() / 600;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(time) * 0.04);

    // Asas / Painéis Solares
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;

    // Asa esquerda
    ctx.fillRect(-110, -22, 60, 44);
    ctx.strokeRect(-110, -22, 60, 44);
    // Linhas fotovoltaicas
    ctx.strokeStyle = '#0369a1';
    ctx.beginPath();
    ctx.moveTo(-80, -22); ctx.lineTo(-80, 22);
    ctx.moveTo(-110, 0); ctx.lineTo(-50, 0);
    ctx.stroke();

    // Asa direita
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#38bdf8';
    ctx.fillRect(50, -22, 60, 44);
    ctx.strokeRect(50, -22, 60, 44);
    ctx.strokeStyle = '#0369a1';
    ctx.beginPath();
    ctx.moveTo(80, -22); ctx.lineTo(80, 22);
    ctx.moveTo(50, 0); ctx.lineTo(110, 0);
    ctx.stroke();

    // Haste de metal
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-50, -6, 100, 12);

    // Corpo central dourado com isolamento térmico
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-35, -35, 70, 70);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-35, -35, 70, 70);

    // Núcleo do processador / CPU
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-20, -20, 40, 40);

    // Sensor Lente Central
    const sens = this.parts.sensor[this.equipped.sensor] || this.parts.sensor[0];
    ctx.fillStyle = sens.bestFor === 'agricultura' ? '#10b981' :
      sens.bestFor === 'deslizamentos' ? '#ef4444' :
        sens.bestFor === 'comunicacao' ? '#3b82f6' : '#f97316';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Antena no topo
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.lineTo(0, -58);
    ctx.lineTo(14, -64);
    ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(14, -64, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};
