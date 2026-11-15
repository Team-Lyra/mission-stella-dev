// ============================================
// nasaTips.js — CURIOSIDADES Espaciais & Científicas (renomeado de "Dicas NASA")
// ============================================

const NasaTips = {
  tips: [
    { title: "Teste de Vácuo", text: "Antes do lançamento, todos os satélites são testados em câmaras de vácuo que simulam o espaço. Sem ar, o calor só se dissipa por radiação!", icon: "🔬" },
    { title: "Órbitas de Satélite", text: "Satélites de observação da Terra orbitam entre 200 km e 2.000 km de altitude. A órbita polar cobre toda a superfície do planeta!", icon: "🛰️" },
    { title: "Sensoriamento Remoto", text: "Câmeras multiespectrais capturam luz além do visível. O infravermelho próximo revela a saúde das plantas — saudáveis refletem mais infravermelho!", icon: "📡" },
    { title: "Transmissão de Dados", text: "Satélites da NASA transmitem dados para estações terrestres via ondas de rádio. Um satélite moderno pode enviar até 800 Mbps!", icon: "📶" },
    { title: "Energia Solar no Espaço", text: "Painéis solares no espaço geram 40% mais energia que na Terra, pois não há atmosfera filtrando a luz solar!", icon: "☀️" },
    { title: "Programa Landsat", text: "O Landsat da NASA monitora a Terra desde 1972! São mais de 50 anos de dados para rastrear mudanças climáticas e desmatamento.", icon: "🌍" },
    { title: "Radar SAR", text: "O radar SAR consegue enxergar através de nuvens e funciona de dia e de noite — perfeito para monitorar enchentes!", icon: "📊" },
    { title: "Monitoramento de Enchentes", text: "Satélites da NASA ajudam a prever enchentes analisando dados de precipitação, topografia e umidade do solo em tempo real!", icon: "🌊" },
    { title: "Agricultura de Precisão", text: "Dados de satélite ajudam agricultores a identificar áreas que precisam de mais água ou fertilizante, economizando recursos!", icon: "🌾" },
    { title: "Velocidade Orbital", text: "Um satélite em órbita baixa viaja a cerca de 28.000 km/h — 8 km por segundo! Ele dá uma volta completa na Terra em ~90 minutos.", icon: "⚡" },
    { title: "Microgravidade", text: "Em órbita, astronautas experimentam microgravidade — não ausência de gravidade, mas queda livre constante ao redor da Terra!", icon: "🚀" },
    { title: "Lixo Espacial", text: "Existem mais de 27.000 pedaços de lixo espacial rastreados pela NASA! Por isso os satélites seguem rotas cuidadosamente calculadas.", icon: "🗑️" }
  ],

  // Modal de Curiosidades (tela cheia no menu)
  modalActive: false,
  modalIndex: 0,

  // Banner flutuante (durante gameplay)
  currentTip: null,
  showing: false,
  showTimer: 0,
  showDuration: 7000,
  alpha: 0,
  targetAlpha: 0,
  _btn1: null,
  _btn2: null,

  getRandom() {
    return this.tips[Math.floor(Math.random() * this.tips.length)];
  },

  /** Abre o modal de curiosidades (menu) */
  openModal() {
    this.modalActive = true;
    this.modalIndex = Math.floor(Math.random() * this.tips.length);
  },

  closeModal() {
    this.modalActive = false;
  },

  nextModalFact() {
    this.modalIndex = (this.modalIndex + 1) % this.tips.length;
  },

  /** Exibe banner flutuante durante gameplay */
  show(tip) {
    if (!tip) tip = this.getRandom();
    this.currentTip = tip;
    this.showing = true;
    this.targetAlpha = 1;
    this.showTimer = Date.now();
  },

  hide() {
    this.targetAlpha = 0;
  },

  update(dt) {
    if (this.alpha < this.targetAlpha) {
      this.alpha = Math.min(this.alpha + dt * 3, 1);
    } else if (this.alpha > this.targetAlpha) {
      this.alpha = Math.max(this.alpha - dt * 3, 0);
      if (this.alpha <= 0) this.showing = false;
    }
    if (this.showing && this.targetAlpha === 1 && Date.now() - this.showTimer > this.showDuration) {
      this.hide();
    }
  },

  /** Renderiza o MODAL de curiosidades (tela cheia) */
  renderModal(ctx, w, h) {
    if (!this.modalActive) return;
    const tip = this.tips[this.modalIndex];

    ctx.save();
    ctx.fillStyle = 'rgba(6, 10, 30, 0.97)';
    ctx.fillRect(0, 0, w, h);
    if (typeof UI !== 'undefined') UI.renderStars(ctx, w, h);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 15;
    ctx.fillText(I18n.text('🛰️ CURIOSIDADES ESPACIAIS'), w / 2, 70);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#90e0ef';
    ctx.font = '17px "Segoe UI", sans-serif';
    ctx.fillText(I18n.text('Fatos incríveis sobre satélites, espaço e a NASA!'), w / 2, 105);

    const cardW = Math.min(680, w - 80);
    const cardH = 280;
    const cardX = w / 2 - cardW / 2;
    const cardY = h / 2 - cardH / 2 - 20;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    ctx.font = '64px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(tip.icon, w / 2, cardY + 85);

    ctx.fillStyle = '#00f5d4';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText(I18n.text(tip.title), w / 2, cardY + 130);

    ctx.fillStyle = '#e0e0ff';
    ctx.font = '17px "Segoe UI", sans-serif';
    const words = I18n.text(tip.text).split(' ');
    let line = '';
    let ly = cardY + 165;
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > cardW - 60 && i > 0) {
        ctx.fillText(line.trim(), w / 2, ly);
        line = words[i] + ' ';
        ly += 24;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), w / 2, ly);

    ctx.fillStyle = '#6b7280';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText(`${this.modalIndex + 1} / ${this.tips.length}`, w / 2, cardY + cardH - 15);

    const btn1W = 260; const btn1H = 50;
    const b1x = w / 2 - btn1W - 10;
    const by = cardY + cardH + 30;
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(b1x, by, btn1W, btn1H);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2;
    ctx.strokeRect(b1x, by, btn1W, btn1H);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px "Segoe UI", sans-serif';
    ctx.fillText(I18n.text('PRÓXIMA ➔'), b1x + btn1W / 2, by + 32);

    const btn2W = 260;
    const b2x = w / 2 + 10;
    ctx.fillStyle = '#e63946';
    ctx.fillRect(b2x, by, btn2W, btn1H);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(b2x, by, btn2W, btn1H);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(I18n.text('FECHAR [ESC]'), b2x + btn2W / 2, by + 32);

    this._btn1 = { x: b1x, y: by, w: btn1W, h: btn1H };
    this._btn2 = { x: b2x, y: by, w: btn2W, h: btn1H };

    ctx.restore();
  },

  handleModalClick(mx, my) {
    if (!this.modalActive) return false;
    if (this._btn1 && mx >= this._btn1.x && mx <= this._btn1.x + this._btn1.w && my >= this._btn1.y && my <= this._btn1.y + this._btn1.h) {
      this.nextModalFact(); return true;
    }
    if (this._btn2 && mx >= this._btn2.x && mx <= this._btn2.x + this._btn2.w && my >= this._btn2.y && my <= this._btn2.y + this._btn2.h) {
      this.closeModal(); return true;
    }
    return true;
  },

  /** Renderiza banner flutuante durante gameplay */
  render(ctx, canvasW, canvasH) {
    if (!this.showing || this.alpha <= 0 || !this.currentTip) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    const boxW = Math.min(500, canvasW - 40);
    const boxH = 120;
    const boxX = canvasW - boxW - 20;
    const boxY = canvasH - boxH - 20;
    ctx.fillStyle = 'rgba(10, 10, 46, 0.95)';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    roundRect(ctx, boxX, boxY, boxW, boxH, 12, true, true);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.currentTip.icon} ${I18n.text('Curiosidade:')} ${I18n.text(this.currentTip.title)}`, boxX + 15, boxY + 28);
    ctx.fillStyle = '#c8c8ff';
    ctx.font = '13px "Segoe UI", sans-serif';
    wrapText(ctx, I18n.text(this.currentTip.text), boxX + 15, boxY + 50, boxW - 30, 18);
    ctx.restore();
  }
};

/** Helper: retângulo arredondado */
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
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
    } else { line = test; }
  }
  ctx.fillText(line.trim(), x, ly);
}
