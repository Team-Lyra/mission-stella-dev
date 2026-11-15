// ============================================
// lyra.js — Lyra: A Mascote Estelar & Guia Oficial do Jogo
// ============================================

const Lyra = {
  blinkTimer: 0,
  isBlinking: false,
  bobTimer: 0,
  sparkles: [],

  init() {
    this.blinkTimer = 0;
    this.bobTimer = 0;
    this.sparkles = [];
    for (let i = 0; i < 15; i++) {
      this.sparkles.push({
        x: (Math.random() - 0.5) * 50,
        y: (Math.random() - 0.5) * 50,
        size: Math.random() * 3 + 1,
        alpha: Math.random(),
        speed: Math.random() * 1.5 + 0.5
      });
    }
  },

  update(dt) {
    this.bobTimer += dt * 3;
    this.blinkTimer += dt;
    if (this.blinkTimer > 3.5) {
      this.isBlinking = true;
      if (this.blinkTimer > 3.7) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    this.sparkles.forEach(s => {
      s.alpha += s.speed * dt;
      if (s.alpha > 1) {
        s.alpha = 0;
        s.x = (Math.random() - 0.5) * 60;
        s.y = (Math.random() - 0.5) * 60;
      }
    });
  },

  // Retorna título de cargo por nível
  getRankTitle(level = 1) {
    if (level <= 1) return I18n.t('rank_1');
    if (level === 2) return I18n.t('rank_2');
    if (level === 3) return I18n.t('rank_3');
    if (level === 4) return I18n.t('rank_4');
    return I18n.lang === 'en'
      ? `Level ${level} • Orbital Commander`
      : `Nível ${level} • Comandante Orbital`;
  },

  // Retorna XP necessário para o próximo nível
  getNextLevelXP(level = 1) {
    return level * 600;
  },

  // Desenha Lyra centralizada em (x, y) com tamanho base (size)
  render(ctx, x, y, size = 40, mood = 'happy', label = 'Lyra ⭐') {
    ctx.save();
    ctx.translate(x, y + Math.sin(this.bobTimer) * 4);

    // Efeito de brilho / glow estelar
    const glow = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size * 1.3);
    glow.addColorStop(0, 'rgba(255, 230, 100, 0.5)');
    glow.addColorStop(0.6, 'rgba(255, 215, 0, 0.2)');
    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Partículas de poeira estelar
    this.sparkles.forEach(s => {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Corpo da Estrela Dourada (5 pontas arredondadas e fofas)
    ctx.fillStyle = '#ffdf00';
    ctx.strokeStyle = '#f4a261';
    ctx.lineWidth = size * 0.06;

    this.drawStar(ctx, 0, 0, 5, size, size * 0.48);
    ctx.fill();
    ctx.stroke();

    // Reflexo dourado interno
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(-size * 0.2, -size * 0.2, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Bochechinhas rosadas
    ctx.fillStyle = '#ff8fa3';
    ctx.beginPath();
    ctx.arc(-size * 0.28, size * 0.1, size * 0.1, 0, Math.PI * 2);
    ctx.arc(size * 0.28, size * 0.1, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Olhos brilhantes estilo kawaii
    if (this.isBlinking) {
      // Olhinhos fechados (curva feliz ^_^)
      ctx.strokeStyle = '#3d2645';
      ctx.lineWidth = size * 0.08;
      ctx.beginPath();
      ctx.arc(-size * 0.2, 0, size * 0.09, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(size * 0.2, 0, size * 0.09, Math.PI, Math.PI * 2);
      ctx.stroke();
    } else {
      // Olho esquerdo
      ctx.fillStyle = '#261132';
      ctx.beginPath();
      ctx.ellipse(-size * 0.2, 0, size * 0.09, size * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
      // Brilho estrela no olho esquerdo
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-size * 0.22, -size * 0.04, size * 0.045, 0, Math.PI * 2);
      ctx.arc(-size * 0.16, size * 0.04, size * 0.02, 0, Math.PI * 2);
      ctx.fill();

      // Olho direito
      ctx.fillStyle = '#261132';
      ctx.beginPath();
      ctx.ellipse(size * 0.2, 0, size * 0.09, size * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
      // Brilho estrela no olho direito
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(size * 0.18, -size * 0.04, size * 0.045, 0, Math.PI * 2);
      ctx.arc(size * 0.24, size * 0.04, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }

    // Boquinha sorridente
    ctx.strokeStyle = '#8338ec';
    ctx.lineWidth = size * 0.06;
    ctx.beginPath();
    if (mood === 'excited') {
      ctx.fillStyle = '#d90429';
      ctx.arc(0, size * 0.1, size * 0.12, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.arc(0, size * 0.08, size * 0.1, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }

    // Mini Capacete / Auréola espacial no topo da estrela
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = size * 0.05;
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.72, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Mini plaquinha "Lyra" se solicitada
    if (label) {
      ctx.fillStyle = 'rgba(10, 14, 38, 0.85)';
      ctx.fillRect(-38, size + 6, 76, 20);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.strokeRect(-38, size + 6, 76, 20);

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, 0, size + 20);
    }

    ctx.restore();
  },

  // Auxiliar para desenhar estrela
  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }
};
