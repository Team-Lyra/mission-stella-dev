// ============================================
// ui.js — Interface do usuário (HUD, menus, diálogos)
// ============================================

const UI = {
  // Estado do diálogo
  dialog: {
    active: false,
    text: '',
    displayText: '',
    charIndex: 0,
    speaker: '',
    speakerColor: '#ffd700',
    options: null,
    selectedOption: 0,
    onComplete: null,
    typeSpeed: 30, // ms por caractere
    lastCharTime: 0,
    finished: false
  },

  // Menu state
  menu: {
    selected: 0,
    items: []
  },

  // Transição entre fases
  transition: {
    active: false,
    alpha: 0,
    text: '',
    subtext: '',
    callback: null,
    phase: 'in' // 'in', 'hold', 'out'
  },
  transitionTimer: 0,

  // Partículas de fundo do menu
  stars: [],

  init(canvasW, canvasH) {
    // Gera estrelas para fundo
    this.stars = [];
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        size: Math.random() * 2.5 + 0.5,
        speed: Math.random() * 0.3 + 0.05,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  },

  // ===== DIÁLOGO =====

  /** Inicia um diálogo com efeito typewriter */
  showDialog(speaker, text, color, options, onComplete) {
    this.dialog.active = true;
    this.dialog.text = text;
    this.dialog.displayText = '';
    this.dialog.charIndex = 0;
    this.dialog.speaker = speaker;
    this.dialog.speakerColor = color || '#ffd700';
    this.dialog.options = options || null;
    this.dialog.selectedOption = 0;
    this.dialog.onComplete = onComplete || null;
    this.dialog.lastCharTime = 0;
    this.dialog.finished = false;
  },

  /** Avança ou completa o diálogo */
  advanceDialog() {
    if (!this.dialog.active) return null;

    if (!this.dialog.finished) {
      // Mostra texto completo
      this.dialog.displayText = this.dialog.text;
      this.dialog.charIndex = this.dialog.text.length;
      this.dialog.finished = true;
      return 'skipped';
    }

    if (this.dialog.options) {
      // Retorna opção selecionada
      const selected = this.dialog.selectedOption;
      this.dialog.active = false;
      if (this.dialog.onComplete) this.dialog.onComplete(selected);
      return selected;
    }

    // Fecha diálogo
    this.dialog.active = false;
    if (this.dialog.onComplete) this.dialog.onComplete();
    return 'closed';
  },

  /** Navega opções do diálogo */
  navigateDialog(dir) {
    if (!this.dialog.options || !this.dialog.finished) return;
    this.dialog.selectedOption += dir;
    if (this.dialog.selectedOption < 0) this.dialog.selectedOption = this.dialog.options.length - 1;
    if (this.dialog.selectedOption >= this.dialog.options.length) this.dialog.selectedOption = 0;
  },

  // ===== TRANSIÇÃO =====

  /** Inicia transição de fase */
  startTransition(text, subtext, callback) {
    this.transition.active = true;
    this.transition.text = text;
    this.transition.subtext = subtext || '';
    this.transition.alpha = 0;
    this.transition.phase = 'in';
    this.transition.callback = callback;
    this.transitionTimer = 0;
  },

  // ===== UPDATE =====

  update(dt) {
    const now = Date.now();

    // Atualiza typewriter
    if (this.dialog.active && !this.dialog.finished) {
      if (now - this.dialog.lastCharTime > this.dialog.typeSpeed) {
        if (this.dialog.charIndex < this.dialog.text.length) {
          this.dialog.displayText += this.dialog.text[this.dialog.charIndex];
          this.dialog.charIndex++;
          this.dialog.lastCharTime = now;
        } else {
          this.dialog.finished = true;
        }
      }
    }

    // Atualiza transição
    if (this.transition.active) {
      this.transitionTimer += dt;
      if (this.transition.phase === 'in') {
        this.transition.alpha = Math.min(this.transition.alpha + dt * 2.5, 1);
        if (this.transition.alpha >= 1) {
          this.transition.phase = 'hold';
          this.transitionTimer = 0;
          if (this.transition.callback) {
            this.transition.callback();
            this.transition.callback = null;
          }
        }
      } else if (this.transition.phase === 'hold') {
        if (this.transitionTimer > 1.5) {
          this.transition.phase = 'out';
        }
      } else if (this.transition.phase === 'out') {
        this.transition.alpha = Math.max(this.transition.alpha - dt * 2, 0);
        if (this.transition.alpha <= 0) {
          this.transition.active = false;
        }
      }
    }

    // Atualiza estrelas
    for (const s of this.stars) {
      s.twinkle += dt * 2;
      s.y += s.speed;
      if (s.y > 2000) { s.y = 0; s.x = Math.random() * 2000; }
    }
  },

  // ===== RENDER =====

  /** Desenha estrelas de fundo */
  renderStars(ctx, w, h) {
    for (const s of this.stars) {
      const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.twinkle));
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(s.x % w, s.y % h, s.size, s.size);
    }
  },

  /** Desenha tela de menu principal */
  renderMenu(ctx, w, h, selected) {
    // Fundo escuro com estrelas
    ctx.fillStyle = '#0a0a2e';
    ctx.fillRect(0, 0, w, h);
    this.renderStars(ctx, w, h);

    // Título com glow
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#ffd700';
    ctx.font = `bold ${Math.min(60, w / 14)}px "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🚀 Missão Taquari', w / 2, h * 0.22);
    ctx.restore();

    // Subtítulo
    ctx.fillStyle = '#8888cc';
    ctx.font = `${Math.min(20, w / 40)}px "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Exploração Espacial no Vale do Taquari', w / 2, h * 0.30);

    // Ilustração: satélite simples
    this.drawMenuSatellite(ctx, w / 2, h * 0.45, Date.now() / 1000);

    // Opções do menu
    const items = ['Nova Missão', 'Continuar', 'Créditos'];
    const startY = h * 0.62;
    for (let i = 0; i < items.length; i++) {
      const y = startY + i * 55;
      const isSelected = i === selected;

      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        roundRect(ctx, w / 2 - 140, y - 22, 280, 44, 8, true, false);
        ctx.fillStyle = '#ffd700';
        ctx.font = `bold 22px "Segoe UI", sans-serif`;
        ctx.fillText('▸ ' + items[i], w / 2, y + 7);
      } else {
        ctx.fillStyle = '#6666aa';
        ctx.font = `20px "Segoe UI", sans-serif`;
        ctx.fillText(items[i], w / 2, y + 7);
      }
    }

    // Rodapé
    ctx.fillStyle = '#444477';
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillText('Use ↑↓ e ENTER para selecionar', w / 2, h - 40);

    const hs = API.getHighScore();
    if (hs > 0) {
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`Recorde: ${hs} pontos`, w / 2, h - 20);
    }
  },

  /** Desenha um satélite animado para o menu */
  drawMenuSatellite(ctx, cx, cy, t) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(t * 0.5) * 0.1);

    // Corpo
    ctx.fillStyle = '#b0b0d0';
    ctx.fillRect(-20, -12, 40, 24);
    ctx.fillStyle = '#8080b0';
    ctx.fillRect(-16, -8, 32, 16);

    // Painéis solares
    ctx.fillStyle = '#2244aa';
    ctx.fillRect(-65, -8, 40, 16);
    ctx.fillRect(25, -8, 40, 16);
    // Grade dos painéis
    ctx.strokeStyle = '#4466cc';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-65 + i * 10, -8);
      ctx.lineTo(-65 + i * 10, 8);
      ctx.moveTo(25 + i * 10, -8);
      ctx.lineTo(25 + i * 10, 8);
      ctx.stroke();
    }

    // Antena
    ctx.strokeStyle = '#d0d0e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, -28);
    ctx.stroke();
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(0, -30, 3, 0, Math.PI * 2);
    ctx.fill();

    // Brilho pulsante
    const glow = 0.3 + 0.3 * Math.sin(t * 3);
    ctx.fillStyle = `rgba(100, 200, 255, ${glow})`;
    ctx.beginPath();
    ctx.arc(0, -30, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /** Desenha HUD durante gameplay */
  renderHUD(ctx, w, h, gameState) {
    ctx.save();

    // Barra superior
    const barH = 44;
    ctx.fillStyle = 'rgba(10, 10, 46, 0.85)';
    ctx.fillRect(0, 0, w, barH);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, barH);
    ctx.lineTo(w, barH);
    ctx.stroke();

    // Nome do jogador
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`👨‍🚀 ${gameState.playerName}`, 15, 28);

    // Missão atual
    ctx.fillStyle = '#88aaff';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    const missionText = gameState.currentMission ? `📋 ${gameState.currentMission.name}` : '📋 Selecione uma missão';
    ctx.fillText(missionText, w / 2, 28);

    // Pontuação
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`⭐ ${gameState.score} pts`, w - 15, 28);

    // Fase atual (canto inferior esquerdo)
    if (gameState.phase) {
      ctx.fillStyle = 'rgba(10, 10, 46, 0.8)';
      roundRect(ctx, 10, h - 40, 180, 30, 6, true, false);
      ctx.fillStyle = '#40916c';
      ctx.font = '13px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      const phaseNames = {
        'EXPLORE': '🔍 Explorar',
        'PLAN': '🛠️ Planejar',
        'LAUNCH': '🚀 Lançar',
        'COLLECT': '📡 Coletar',
        'IMPACT': '🌟 Impacto'
      };
      ctx.fillText(phaseNames[gameState.phase] || gameState.phase, 20, h - 20);
    }

    // Instrução contextual (canto inferior direito)
    if (gameState.hint) {
      ctx.fillStyle = 'rgba(10, 10, 46, 0.8)';
      const hintW = ctx.measureText(gameState.hint).width + 30;
      roundRect(ctx, w - hintW - 10, h - 40, hintW, 30, 6, true, false);
      ctx.fillStyle = '#aaaadd';
      ctx.font = '13px "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(gameState.hint, w - 25, h - 20);
    }

    ctx.restore();
  },

  /** Desenha caixa de diálogo */
  renderDialog(ctx, w, h) {
    if (!this.dialog.active) return;

    ctx.save();

    const boxW = Math.min(700, w - 40);
    const boxH = 160;
    const boxX = (w - boxW) / 2;
    const boxY = h - boxH - 20;

    // Fundo do diálogo
    ctx.fillStyle = 'rgba(10, 10, 46, 0.95)';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    roundRect(ctx, boxX, boxY, boxW, boxH, 12, true, true);

    // Retrato do personagem (círculo com inicial)
    const portraitX = boxX + 45;
    const portraitY = boxY + 45;
    ctx.fillStyle = this.dialog.speakerColor;
    ctx.beginPath();
    ctx.arc(portraitX, portraitY, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0a2e';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.dialog.speaker.charAt(0).toUpperCase(), portraitX, portraitY);

    // Nome do personagem
    ctx.fillStyle = this.dialog.speakerColor;
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(this.dialog.speaker, boxX + 85, boxY + 15);

    // Texto com typewriter
    ctx.fillStyle = '#d0d0ff';
    ctx.font = '14px "Segoe UI", sans-serif';
    wrapText(ctx, this.dialog.displayText, boxX + 85, boxY + 40, boxW - 110, 20);

    // Opções (se disponíveis e texto completo)
    if (this.dialog.options && this.dialog.finished) {
      const optY = boxY + boxH - 45;
      for (let i = 0; i < this.dialog.options.length; i++) {
        const ox = boxX + 85 + i * 200;
        const isSelected = i === this.dialog.selectedOption;
        ctx.fillStyle = isSelected ? '#ffd700' : '#6666aa';
        ctx.font = isSelected ? 'bold 14px "Segoe UI", sans-serif' : '14px "Segoe UI", sans-serif';
        ctx.fillText((isSelected ? '▸ ' : '  ') + this.dialog.options[i], ox, optY);
      }
    }

    // Indicador de "continuar"
    if (this.dialog.finished && !this.dialog.options) {
      const blink = Math.sin(Date.now() / 200) > 0;
      if (blink) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('▼ Pressione ENTER', boxX + boxW - 15, boxY + boxH - 15);
      }
    }

    ctx.restore();
  },

  /** Desenha tela de transição */
  renderTransition(ctx, w, h) {
    if (!this.transition.active) return;

    ctx.save();
    ctx.fillStyle = `rgba(10, 10, 46, ${this.transition.alpha})`;
    ctx.fillRect(0, 0, w, h);

    if (this.transition.alpha > 0.5) {
      const textAlpha = (this.transition.alpha - 0.5) * 2;
      ctx.globalAlpha = textAlpha;

      ctx.fillStyle = '#ffd700';
      ctx.font = `bold ${Math.min(40, w / 20)}px "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(this.transition.text, w / 2, h / 2 - 15);

      ctx.fillStyle = '#8888cc';
      ctx.font = `${Math.min(18, w / 40)}px "Segoe UI", sans-serif`;
      ctx.fillText(this.transition.subtext, w / 2, h / 2 + 25);
    }

    ctx.restore();
  },

  /** Desenha tela de créditos */
  renderCredits(ctx, w, h) {
    ctx.fillStyle = '#0a0a2e';
    ctx.fillRect(0, 0, w, h);
    this.renderStars(ctx, w, h);

    ctx.textAlign = 'center';

    ctx.fillStyle = '#ffd700';
    ctx.font = `bold 32px "Segoe UI", sans-serif`;
    ctx.fillText('Créditos', w / 2, 80);

    const credits = [
      '',
      '🚀 Missão Taquari 🚀',
      '',
      'Um jogo educativo sobre exploração espacial',
      'ambientado no Vale do Taquari, RS, Brasil',
      '',
      'Desenvolvido com HTML5 Canvas',
      '',
      'Inspirado pelos programas da NASA de',
      'observação da Terra e sensoriamento remoto',
      '',
      'Dados de satélite salvam vidas e',
      'melhoram a agricultura no mundo todo!',
      '',
      '🌍 NASA • INPE • Vale do Taquari 🌍',
      '',
      '',
      'Pressione ESC para voltar'
    ];

    ctx.fillStyle = '#b0b0dd';
    ctx.font = '16px "Segoe UI", sans-serif';
    credits.forEach((line, i) => {
      ctx.fillStyle = line.includes('🚀') || line.includes('🌍') ? '#ffd700' : '#b0b0dd';
      ctx.fillText(line, w / 2, 130 + i * 28);
    });
  },

  /** Desenha Game Over */
  renderGameOver(ctx, w, h, score, selected) {
    ctx.fillStyle = '#0a0a2e';
    ctx.fillRect(0, 0, w, h);
    this.renderStars(ctx, w, h);

    ctx.textAlign = 'center';

    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 42px "Segoe UI", sans-serif';
    ctx.fillText('🎉 Missão Completa!', w / 2, h * 0.25);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.fillText(`Pontuação Final: ${score}`, w / 2, h * 0.40);

    const hs = API.getHighScore();
    ctx.fillStyle = '#ffd700';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillText(`Recorde: ${hs}`, w / 2, h * 0.48);

    const items = ['Nova Missão', 'Menu Principal'];
    for (let i = 0; i < items.length; i++) {
      const y = h * 0.60 + i * 50;
      const sel = i === selected;
      ctx.fillStyle = sel ? '#ffd700' : '#6666aa';
      ctx.font = sel ? 'bold 20px "Segoe UI", sans-serif' : '18px "Segoe UI", sans-serif';
      ctx.fillText((sel ? '▸ ' : '') + items[i], w / 2, y);
    }
  }
};
