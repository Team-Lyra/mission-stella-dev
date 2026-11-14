// ============================================
// nasaTips.js — Dicas educativas da NASA em Português
// ============================================

const NasaTips = {
  tips: [
    {
      title: "Teste de Vácuo",
      text: "Antes do lançamento, todos os satélites são testados em câmaras de vácuo que simulam as condições do espaço. Sem ar, o calor só se dissipa por radiação!",
      icon: "🔬"
    },
    {
      title: "Órbitas de Satélite",
      text: "Satélites de observação da Terra geralmente orbitam entre 200 km e 2.000 km de altitude. A órbita polar permite cobrir toda a superfície terrestre!",
      icon: "🛰️"
    },
    {
      title: "Sensoriamento Remoto",
      text: "Câmeras multiespectrais capturam luz além do visível. O infravermelho próximo revela a saúde da vegetação — plantas saudáveis refletem mais infravermelho!",
      icon: "📡"
    },
    {
      title: "Transmissão de Dados",
      text: "Satélites da NASA transmitem dados para estações terrestres usando ondas de rádio. Um satélite moderno pode enviar até 800 Mbps de dados!",
      icon: "📶"
    },
    {
      title: "Energia Solar no Espaço",
      text: "Painéis solares no espaço geram 40% mais energia que na Terra, pois não há atmosfera filtrando a luz solar. Por isso satélites usam energia solar!",
      icon: "☀️"
    },
    {
      title: "Programa Landsat",
      text: "O programa Landsat da NASA monitora a Terra desde 1972! São mais de 50 anos de dados que ajudam a rastrear mudanças climáticas e desmatamento.",
      icon: "🌍"
    },
    {
      title: "Radar SAR",
      text: "O radar SAR (Radar de Abertura Sintética) consegue enxergar através de nuvens e funciona de dia e de noite — perfeito para monitorar enchentes!",
      icon: "📊"
    },
    {
      title: "Monitoramento de Enchentes",
      text: "Satélites da NASA ajudam a prever enchentes analisando dados de precipitação, topografia e umidade do solo em tempo real!",
      icon: "🌊"
    },
    {
      title: "Agricultura de Precisão",
      text: "Dados de satélite ajudam agricultores a identificar áreas que precisam de mais água ou fertilizante, economizando recursos e aumentando a produção!",
      icon: "🌾"
    },
    {
      title: "Velocidade Orbital",
      text: "Um satélite em órbita baixa viaja a cerca de 28.000 km/h — isso é quase 8 km por segundo! Ele dá uma volta completa na Terra em ~90 minutos.",
      icon: "⚡"
    }
  ],

  // Índice da dica atual
  currentIndex: 0,
  // Se uma dica está sendo exibida
  showing: false,
  // Timer para auto-hide
  showTimer: 0,
  showDuration: 6000, // ms
  // Animação
  alpha: 0,
  targetAlpha: 0,

  /** Retorna uma dica aleatória */
  getRandom() {
    return this.tips[Math.floor(Math.random() * this.tips.length)];
  },

  /** Retorna a próxima dica em sequência */
  getNext() {
    const tip = this.tips[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.tips.length;
    return tip;
  },

  /** Mostra uma dica na tela */
  show(tip) {
    if (!tip) tip = this.getNext();
    this.currentTip = tip;
    this.showing = true;
    this.targetAlpha = 1;
    this.showTimer = Date.now();
  },

  /** Esconde a dica atual */
  hide() {
    this.targetAlpha = 0;
  },

  /** Atualiza animação */
  update(dt) {
    // Fade in/out
    if (this.alpha < this.targetAlpha) {
      this.alpha = Math.min(this.alpha + dt * 3, 1);
    } else if (this.alpha > this.targetAlpha) {
      this.alpha = Math.max(this.alpha - dt * 3, 0);
      if (this.alpha <= 0) this.showing = false;
    }
    // Auto hide
    if (this.showing && this.targetAlpha === 1 && Date.now() - this.showTimer > this.showDuration) {
      this.hide();
    }
  },

  /** Desenha a dica na tela */
  render(ctx, canvasW, canvasH) {
    if (!this.showing || this.alpha <= 0 || !this.currentTip) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    const boxW = Math.min(500, canvasW - 40);
    const boxH = 120;
    const boxX = canvasW - boxW - 20;
    const boxY = canvasH - boxH - 20;

    // Background
    ctx.fillStyle = 'rgba(10, 10, 46, 0.95)';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    roundRect(ctx, boxX, boxY, boxW, boxH, 12, true, true);

    // Icon + title
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.currentTip.icon} Dica NASA: ${this.currentTip.title}`, boxX + 15, boxY + 28);

    // Text (word wrap)
    ctx.fillStyle = '#c8c8ff';
    ctx.font = '13px "Segoe UI", sans-serif';
    wrapText(ctx, this.currentTip.text, boxX + 15, boxY + 50, boxW - 30, 18);

    ctx.restore();
  }
};

/** Helper: desenha retângulo arredondado */
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/** Helper: quebra texto em múltiplas linhas */
function wrapText(ctx, text, x, y, maxW, lineH) {
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
