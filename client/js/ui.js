// ============================================
// ui.js — Interface do Usuário, Diálogos Acessíveis & Mascote Lyra
// ============================================

const UI = {
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
    typeSpeed: 25,
    lastCharTime: 0,
    finished: false
  },

  transition: {
    active: false,
    alpha: 0,
    text: '',
    subtext: '',
    callback: null,
    phase: 'in'
  },
  transitionTimer: 0,
  stars: [],

  init(canvasW, canvasH) {
    this.stars = [];
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        size: Math.random() * 2.8 + 0.8,
        speed: Math.random() * 0.35 + 0.05,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  },

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
    NasaAudio.typeKey();
  },

  advanceDialog() {
    if (!this.dialog.active) return null;

    if (!this.dialog.finished) {
      this.dialog.displayText = this.dialog.text;
      this.dialog.charIndex = this.dialog.text.length;
      this.dialog.finished = true;
      NasaAudio.click();
      return 'skipped';
    }

    if (this.dialog.options) {
      const selected = this.dialog.selectedOption;
      this.dialog.active = false;
      if (this.dialog.onComplete) this.dialog.onComplete(selected);
      NasaAudio.click();
      return selected;
    }

    this.dialog.active = false;
    if (this.dialog.onComplete) this.dialog.onComplete();
    NasaAudio.click();
    return 'closed';
  },

  navigateDialog(dir) {
    if (!this.dialog.options || !this.dialog.finished) return;
    this.dialog.selectedOption += dir;
    if (this.dialog.selectedOption < 0) this.dialog.selectedOption = this.dialog.options.length - 1;
    if (this.dialog.selectedOption >= this.dialog.options.length) this.dialog.selectedOption = 0;
    NasaAudio.click();
  },

  update(dt) {
    const now = Date.now();

    if (this.dialog.active && !this.dialog.finished) {
      if (now - this.dialog.lastCharTime > this.dialog.typeSpeed) {
        if (this.dialog.charIndex < this.dialog.text.length) {
          this.dialog.displayText += this.dialog.text[this.dialog.charIndex];
          this.dialog.charIndex++;
          this.dialog.lastCharTime = now;
          if (this.dialog.charIndex % 3 === 0) {
            NasaAudio.typeKey();
          }
        } else {
          this.dialog.finished = true;
        }
      }
    }

    for (const s of this.stars) {
      s.twinkle += dt * 2.5;
      s.y += s.speed;
      if (s.y > 2000) { s.y = 0; s.x = Math.random() * 2000; }
    }
  },

  renderStars(ctx, w, h) {
    for (const s of this.stars) {
      const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.twinkle));
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(s.x % w, s.y % h, s.size, s.size);
    }
  },

  // Desenha caixa de diálogo com fontes ampliadas para acessibilidade (8 a 12 anos)
  renderDialog(ctx, w, h) {
    if (!this.dialog.active) return;

    ctx.save();
    const boxW = Math.min(760, w - 40);
    const boxH = 185;
    const boxX = (w - boxW) / 2;
    const boxY = h - boxH - 25;

    // Fundo do diálogo com borda dourada
    ctx.fillStyle = 'rgba(10, 16, 42, 0.96)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    const isLyra = this.dialog.speaker.includes('Lyra') || this.dialog.speaker.includes('⭐');
    const portraitX = boxX + 50;
    const portraitY = boxY + 52;

    if (isLyra) {
      // Mascote Lyra expressiva no diálogo
      Lyra.render(ctx, portraitX, portraitY, 32, 'happy', '');
    } else {
      // Retrato estilizado
      ctx.fillStyle = this.dialog.speakerColor || '#00b4d8';
      ctx.beginPath();
      ctx.arc(portraitX, portraitY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0a0a2e';
      ctx.font = 'bold 24px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.dialog.speaker.charAt(0).toUpperCase(), portraitX, portraitY);
    }

    // Nome do personagem (fonte grande 18px)
    ctx.fillStyle = this.dialog.speakerColor || '#ffd700';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(this.dialog.speaker, boxX + 95, boxY + 18);

    // Texto do diálogo (fonte grande 17px com entrelinha de 25px para fácil leitura)
    ctx.fillStyle = '#f0f4ff';
    ctx.font = '17px "Segoe UI", sans-serif';
    this.wrapText(ctx, this.dialog.displayText, boxX + 95, boxY + 48, boxW - 120, 24);

    // Opções de escolha se houver
    if (this.dialog.options && this.dialog.finished) {
      const optY = boxY + boxH - 48;
      const optW = 200;
      for (let i = 0; i < this.dialog.options.length; i++) {
        const ox = boxX + 95 + i * (optW + 15);
        const isSelected = i === this.dialog.selectedOption;

        ctx.fillStyle = isSelected ? 'rgba(0, 180, 216, 0.4)' : 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(ox, optY - 8, optW, 36);
        ctx.strokeStyle = isSelected ? '#ffd700' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(ox, optY - 8, optW, 36);

        ctx.fillStyle = isSelected ? '#ffd700' : '#ffffff';
        ctx.font = isSelected ? 'bold 16px "Segoe UI", sans-serif' : '15px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((isSelected ? '▸ ' : '') + this.dialog.options[i], ox + optW / 2, optY + 16);
      }
    }

    // Indicador de "Pressione ENTER / ESPAÇO"
    if (this.dialog.finished && !this.dialog.options) {
      const blink = Math.sin(Date.now() / 200) > 0;
      if (blink) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px "Segoe UI", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('Pressione [ESPAÇO] ou [ENTER] ▼', boxX + boxW - 20, boxY + boxH - 18);
      }
    }

    ctx.restore();
  },

  wrapText(ctx, text, x, y, maxW, lineH) {
    if (!text) return;
    const words = text.split(' ');
    let line = '';
    let ly = y;
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxW && i > 0) {
        ctx.fillText(line.trim(), x, ly);
        line = words[i] + ' ';
        ly += lineH;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), x, ly);
  }
};
