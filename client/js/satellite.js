// ============================================
// satellite.js — Montagem de Satélite (Centro de Comando)
// ============================================

const SatelliteBuilder = {
  active: false,
  step: 0, // 0 = Sensor, 1 = Material, 2 = Painel/Órbita, 3 = Revisão
  selectedIndices: [0, 0, 0],
  hoverIndex: 0,

  sensors: [
    {
      id: 'multiespectral',
      name: 'Câmera Multiespectral (NIR)',
      desc: 'Capta luz no infravermelho próximo. Ideal para saúde da vegetação (NDVI) e agricultura.',
      bestFor: 'agricultura',
      icon: '🌿'
    },
    {
      id: 'sar_radar',
      name: 'Radar SAR (Micro-ondas)',
      desc: 'Penetra nuvens e escuridão. Mede relevo milimétrico e encostas para risco de deslizamento.',
      bestFor: 'deslizamentos',
      icon: '📡'
    },
    {
      id: 'comms_ku',
      name: 'Transponder Banda Ku',
      desc: 'Retransmissão de rádio e internet em alta velocidade para conectar comunidades rurais.',
      bestFor: 'comunicacao',
      icon: '📶'
    },
    {
      id: 'thermal_ir',
      name: 'Sensor Termal Infravermelho',
      desc: 'Detecta focos de calor, queimadas em tempo real e monitora cobertura florestal.',
      bestFor: 'florestal',
      icon: '🔥'
    }
  ],

  materials: [
    {
      id: 'aluminio',
      name: 'Liga de Alumínio Aeroespacial',
      desc: 'Padrão NASA: excelente relação resistência/peso e dissipa calor de forma equilibrada.',
      bonus: '+150 pts de Confiabilidade Estrutural',
      color: '#adb5bd'
    },
    {
      id: 'carbono',
      name: 'Composto de Fibra de Carbono',
      desc: 'Ultra leve e rígido, imune a dilatação térmica extrema no vácuo espacial.',
      bonus: '+200 pts de Eficiência de Lançamento',
      color: '#343a40'
    },
    {
      id: 'titanio',
      name: 'Estrutura de Titânio Blindado',
      desc: 'Máxima durabilidade contra radiação cósmica e impactos de micrometeoritos.',
      bonus: '+180 pts de Vida Útil em Órbita',
      color: '#6c757d'
    }
  ],

  orbits: [
    {
      id: 'leo',
      name: 'Órbita Baixa Polar (LEO 600 km)',
      desc: 'Varre toda a superfície da Terra e do Vale do Taquari em alta resolução a cada 90 minutos.',
      ideal: true
    },
    {
      id: 'geo',
      name: 'Órbita Geoestacionária (GEO 35.786 km)',
      desc: 'Permanece fixa sobre o mesmo ponto do continente para cobertura contínua.',
      ideal: false
    }
  ],

  init() {
    this.step = 0;
    this.selectedIndices = [0, 0, 0];
    this.hoverIndex = 0;
  },

  open(currentMission) {
    this.active = true;
    this.step = 0;
    this.currentMission = currentMission;
    this.hoverIndex = 0;
  },

  close() {
    this.active = false;
  },

  handleInput(key) {
    if (!this.active) return null;

    let maxOptions = 0;
    if (this.step === 0) maxOptions = this.sensors.length;
    else if (this.step === 1) maxOptions = this.materials.length;
    else if (this.step === 2) maxOptions = this.orbits.length;
    else if (this.step === 3) maxOptions = 1; // Botão confirmar lançamento

    if (key === 'ArrowUp' || key === 'KeyW') {
      this.hoverIndex = (this.hoverIndex - 1 + maxOptions) % maxOptions;
    } else if (key === 'ArrowDown' || key === 'KeyS') {
      this.hoverIndex = (this.hoverIndex + 1) % maxOptions;
    } else if (key === 'Enter' || key === 'Space' || key === 'KeyE') {
      if (this.step < 3) {
        this.selectedIndices[this.step] = this.hoverIndex;
        this.step++;
        this.hoverIndex = 0;
      } else {
        // Confirmou a montagem completa!
        const config = {
          sensor: this.sensors[this.selectedIndices[0]],
          material: this.materials[this.selectedIndices[1]],
          orbit: this.orbits[this.selectedIndices[2]]
        };
        this.active = false;
        return config;
      }
    } else if (key === 'Escape' || key === 'Backspace') {
      if (this.step > 0) {
        this.step--;
        this.hoverIndex = this.selectedIndices[this.step];
      }
    }
    return null;
  },

  render(ctx, w, h) {
    if (!this.active) return;

    ctx.save();

    // Fundo escuro semi-transparente
    ctx.fillStyle = 'rgba(10, 14, 35, 0.96)';
    ctx.fillRect(0, 0, w, h);

    // Borda tecnológica
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Cabeçalho
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔬 CENTRO DE COMANDO — MONTAGEM DO SATÉLITE', w / 2, 70);

    ctx.fillStyle = '#90e0ef';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText(
      `Passo ${this.step + 1} de 4: ${
        this.step === 0 ? 'Escolha do Sensor Principal' :
        this.step === 1 ? 'Escolha do Material da Estrutura' :
        this.step === 2 ? 'Definição da Órbita Espacial' : 'Revisão Final e Verificação de Sistemas'
      }`,
      w / 2, 98
    );

    // Divisão de tela: Esquerda (Opções), Direita (Visualização gráfica do Satélite)
    const colW = (w - 100) / 2;

    // Renderiza a etapa
    if (this.step === 0) {
      this.renderOptions(ctx, 50, 130, colW, this.sensors, this.hoverIndex, 'Escolha o sensor ideal para a missão:');
    } else if (this.step === 1) {
      this.renderOptions(ctx, 50, 130, colW, this.materials, this.hoverIndex, 'Escolha o material estrutural resistente:');
    } else if (this.step === 2) {
      this.renderOptions(ctx, 50, 130, colW, this.orbits, this.hoverIndex, 'Defina a altitude e órbita de operação:');
    } else {
      this.renderSummary(ctx, 50, 130, colW);
    }

    // Renderiza o Satélite no lado direito em tempo real
    this.renderSatellitePreview(ctx, w / 2 + 20, 130, colW, h - 230);

    // Rodapé de instruções
    ctx.fillStyle = '#caf0f8';
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Navegue com [↑/↓] • Selecione com [ENTER / ESPAÇO] • Voltar com [ESC]', w / 2, h - 45);

    ctx.restore();
  },

  renderOptions(ctx, x, y, width, list, selectedIdx, subtitle) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(subtitle, x, y);

    const cardH = 75;
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const cardY = y + 25 + i * (cardH + 12);
      const isSel = i === selectedIdx;

      // Card fundo
      ctx.fillStyle = isSel ? 'rgba(0, 180, 216, 0.25)' : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(x, cardY, width, cardH);

      // Card borda
      ctx.strokeStyle = isSel ? '#ffd700' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isSel ? 2.5 : 1;
      ctx.strokeRect(x, cardY, width, cardH);

      // Ícone ou marcador
      const marker = isSel ? '▸ ' : '  ';
      ctx.fillStyle = isSel ? '#ffd700' : '#ffffff';
      ctx.font = 'bold 15px "Segoe UI", sans-serif';
      ctx.fillText(marker + (item.icon ? item.icon + ' ' : '') + item.name, x + 12, cardY + 26);

      // Descrição
      ctx.fillStyle = '#adb5bd';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.fillText(item.desc, x + 24, cardY + 46, width - 36);

      if (item.bonus) {
        ctx.fillStyle = '#52b788';
        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        ctx.fillText(item.bonus, x + 24, cardY + 64);
      }
    }
  },

  renderSummary(ctx, x, y, width) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📋 Configuração Final do Satélite:', x, y);

    const s = this.sensors[this.selectedIndices[0]];
    const m = this.materials[this.selectedIndices[1]];
    const o = this.orbits[this.selectedIndices[2]];

    const items = [
      { label: 'Sensor Principal', val: s.name, color: '#90e0ef' },
      { label: 'Material da Estrutura', val: m.name, color: '#e9d8a6' },
      { label: 'Órbita de Operação', val: o.name, color: '#a7c957' }
    ];

    items.forEach((item, idx) => {
      const iy = y + 35 + idx * 55;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(x, iy, width, 45);
      ctx.strokeStyle = '#415a77';
      ctx.strokeRect(x, iy, width, 45);

      ctx.fillStyle = '#adb5bd';
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillText(item.label, x + 12, iy + 17);

      ctx.fillStyle = item.color;
      ctx.font = 'bold 14px "Segoe UI", sans-serif';
      ctx.fillText(item.val, x + 12, iy + 35);
    });

    // Botão de prosseguir para Lançamento
    const btnY = y + 225;
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, btnY, width, 55, 8) : ctx.rect(x, btnY, width, 55);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚀 INICIAR LANÇAMENTO DA NASA [ENTER] 🚀', x + width / 2, btnY + 34);
  },

  renderSatellitePreview(ctx, x, y, width, height) {
    // Moldura do laboratório
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#415a77';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = '#64dfdf';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛰️ VISUALIZAÇÃO ESQUEMÁTICA', x + width / 2, y + 25);

    const cx = x + width / 2;
    const cy = y + height / 2;
    const time = Date.now() / 600;

    ctx.save();
    ctx.translate(cx, cy);
    // Leve flutuação no laboratório de gravidade zero
    ctx.rotate(Math.sin(time) * 0.05);

    const mat = this.materials[this.selectedIndices[1]] || this.materials[0];

    // Painéis Solares
    ctx.fillStyle = '#0077b6';
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 1.5;

    // Asa solar esquerda
    ctx.fillRect(-120, -25, 70, 50);
    ctx.strokeRect(-120, -25, 70, 50);
    // Linhas das células solares
    ctx.strokeStyle = '#023e8a';
    ctx.beginPath();
    ctx.moveTo(-85, -25); ctx.lineTo(-85, 25);
    ctx.moveTo(-120, 0); ctx.lineTo(-50, 0);
    ctx.stroke();

    // Asa solar direita
    ctx.fillStyle = '#0077b6';
    ctx.strokeStyle = '#00f5d4';
    ctx.fillRect(50, -25, 70, 50);
    ctx.strokeRect(50, -25, 70, 50);
    ctx.strokeStyle = '#023e8a';
    ctx.beginPath();
    ctx.moveTo(85, -25); ctx.lineTo(85, 25);
    ctx.moveTo(50, 0); ctx.lineTo(120, 0);
    ctx.stroke();

    // Haste de sustentação
    ctx.fillStyle = '#6c757d';
    ctx.fillRect(-50, -6, 100, 12);

    // Corpo central do satélite
    ctx.fillStyle = mat.color;
    ctx.fillRect(-35, -35, 70, 70);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(-35, -35, 70, 70);

    // Manta térmica dourada
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(-28, -28, 56, 56);

    // Sensor selecionado
    const sens = this.sensors[this.selectedIndices[0]] || this.sensors[0];
    ctx.fillStyle = '#1b263b';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00b4d8';
    ctx.stroke();

    // Lente do sensor
    ctx.fillStyle = sens.bestFor === 'agricultura' ? '#2ec4b6' :
                    sens.bestFor === 'deslizamentos' ? '#e71d36' :
                    sens.bestFor === 'comunicacao' ? '#3a86ff' : '#ff9f1c';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Antena de comunicação superior
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.lineTo(0, -60);
    ctx.lineTo(15, -68);
    ctx.stroke();
    // Pratinho no topo
    ctx.fillStyle = '#e0e1dd';
    ctx.beginPath();
    ctx.arc(15, -68, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Informação de status
    ctx.fillStyle = '#52b788';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓ SISTEMAS PRONTOS PARA O TESTE DA NASA', cx, y + height - 20);
  }
};

