// ============================================
// map.js — Mapa 2D Tile-based do Vale do Taquari
// ============================================

const GameMap = {
  tileSize: 48,
  cols: 28,
  rows: 20,
  waterTick: 0,

  // Tipos de tile:
  // 0 = Grama, 1 = Rua/Caminho, 2 = Rio Taquari, 3 = Árvores/Mata,
  // 4 = Casas/Edifícios, 5 = Centro de Comando Espacial, 6 = Lavoura/Fazenda, 7 = Antena de Satélite
  data: [
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    [3,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,2,2,0,6,6,6,6,6,6,6,0,3],
    [3,0,4,4,0,0,0,1,1,0,5,5,5,0,0,0,2,2,0,6,6,6,6,6,6,6,0,3],
    [3,0,4,4,0,0,0,1,1,0,5,5,5,0,7,0,2,2,0,6,6,6,6,6,6,6,0,3],
    [3,0,0,0,0,0,0,1,1,0,0,1,0,0,0,0,2,2,0,0,0,1,1,0,0,0,0,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [3,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,2,2,0,0,0,1,1,0,0,0,0,3],
    [3,0,4,4,1,1,0,4,4,0,0,1,1,0,0,0,2,2,0,4,4,1,1,0,4,4,0,3],
    [3,0,4,4,1,1,0,4,4,0,0,1,1,0,0,0,2,2,0,4,4,1,1,0,4,4,0,3],
    [3,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,2,2,0,0,0,1,1,0,0,0,0,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3],
    [3,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,2,2,0,0,0,0,1,1,0,0,0,3],
    [3,0,3,3,0,1,1,0,3,3,0,0,1,1,0,0,2,2,0,3,3,0,1,1,0,7,0,3],
    [3,0,3,3,0,1,1,0,3,3,0,0,1,1,0,0,2,2,0,3,3,0,1,1,0,0,0,3],
    [3,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,2,2,0,0,0,0,1,1,0,0,0,3],
    [3,0,6,6,6,1,1,6,6,6,0,0,1,1,0,0,2,2,0,6,6,6,1,1,6,6,0,3],
    [3,0,6,6,6,1,1,6,6,6,0,0,1,1,0,0,2,2,0,6,6,6,1,1,6,6,0,3],
    [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
  ],

  // Locais de interesse (coordenadas em pixels)
  commandCenter: { x: 11 * 48, y: 3 * 48, w: 3 * 48, h: 2 * 48 },

  init() {
    this.waterTick = 0;
  },

  update(dt) {
    this.waterTick += dt * 3;
  },

  isSolid(pixelX, pixelY, width = 24, height = 24) {
    // Checa os 4 cantos da bounding box
    const checkPoints = [
      { x: pixelX, y: pixelY },
      { x: pixelX + width, y: pixelY },
      { x: pixelX, y: pixelY + height },
      { x: pixelX + width, y: pixelY + height }
    ];

    for (const pt of checkPoints) {
      const col = Math.floor(pt.x / this.tileSize);
      const row = Math.floor(pt.y / this.tileSize);

      // Fora dos limites
      if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return true;

      const tile = this.data[row][col];
      // 3 = Árvore sólida, 2 = Rio (exceto nas pontes na linha 5,6,11,12), 4 = Prédios
      if (tile === 3 || tile === 4) return true;
      if (tile === 2) {
        // As pontes estão nas ruas (linhas com tile 1)
        if (row !== 5 && row !== 6 && row !== 11 && row !== 12) {
          return true;
        }
      }
    }
    return false;
  },

  render(ctx, cameraX, cameraY, viewportW, viewportH) {
    const startCol = Math.max(0, Math.floor(cameraX / this.tileSize));
    const endCol = Math.min(this.cols - 1, Math.ceil((cameraX + viewportW) / this.tileSize));
    const startRow = Math.max(0, Math.floor(cameraY / this.tileSize));
    const endRow = Math.min(this.rows - 1, Math.ceil((cameraY + viewportH) / this.tileSize));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const x = c * this.tileSize - cameraX;
        const y = r * this.tileSize - cameraY;
        const tile = this.data[r][c];

        this.drawTile(ctx, tile, x, y, c, r);
      }
    }

    // Desenha ponte sobre o Rio Taquari
    this.drawBridges(ctx, cameraX, cameraY);
    // Desenha rótulos e placas informativas do Vale do Taquari
    this.drawWorldLabels(ctx, cameraX, cameraY);
  },

  drawTile(ctx, tile, x, y, col, row) {
    const s = this.tileSize;

    switch (tile) {
      case 0: // Grama
        ctx.fillStyle = (col + row) % 2 === 0 ? '#2d6a4f' : '#275d45';
        ctx.fillRect(x, y, s, s);
        // Pequenas folhinhas
        ctx.fillStyle = '#40916c';
        ctx.fillRect(x + 12, y + 14, 3, 5);
        ctx.fillRect(x + 32, y + 28, 3, 4);
        break;

      case 1: // Rua / Calçada
        ctx.fillStyle = '#495057';
        ctx.fillRect(x, y, s, s);
        // Faixa central se for rua horizontal
        if (row === 5 || row === 11) {
          ctx.fillStyle = '#ffd166';
          ctx.fillRect(x + 4, y + s - 2, s - 8, 2);
        }
        break;

      case 2: // Rio Taquari
        ctx.fillStyle = '#1d3557';
        ctx.fillRect(x, y, s, s);
        // Ondulações de água animadas
        const waveOffset = Math.sin(this.waterTick + col + row) * 4;
        ctx.fillStyle = '#457b9d';
        ctx.fillRect(x + 6 + waveOffset, y + 12, 18, 3);
        ctx.fillRect(x + 20 - waveOffset, y + 28, 16, 3);
        break;

      case 3: // Árvores / Mata Ciliar
        ctx.fillStyle = '#1b4332';
        ctx.fillRect(x, y, s, s);
        // Copa da árvore redonda
        ctx.fillStyle = '#081c15';
        ctx.beginPath();
        ctx.arc(x + s / 2 + 2, y + s / 2 + 2, s * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2d6a4f';
        ctx.beginPath();
        ctx.arc(x + s / 2, y + s / 2, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#52b788';
        ctx.beginPath();
        ctx.arc(x + s / 2 - 4, y + s / 2 - 4, s * 0.22, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 4: // Casas / Construções
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(x, y, s, s);
        // Estrutura da casa
        ctx.fillStyle = '#343a40';
        ctx.fillRect(x + 4, y + 8, s - 8, s - 12);
        // Telhado
        ctx.fillStyle = '#b7094c';
        ctx.fillRect(x + 2, y + 4, s - 4, 8);
        // Janela iluminada
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(x + 10, y + 18, 8, 8);
        ctx.fillRect(x + 28, y + 18, 8, 8);
        // Porta
        ctx.fillStyle = '#892b64';
        ctx.fillRect(x + 20, y + 28, 8, 14);
        break;

      case 5: // Centro de Comando Espacial (NASA / Taquari Space Agency)
        ctx.fillStyle = '#0d1b2a';
        ctx.fillRect(x, y, s, s);
        // Painéis metálicos de laboratório
        ctx.strokeStyle = '#415a77';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, s - 4, s - 4);
        ctx.fillStyle = '#1b263b';
        ctx.fillRect(x + 4, y + 4, s - 8, s - 8);
        // Detalhe de luz LED azul de alta tecnologia
        ctx.fillStyle = '#00b4d8';
        ctx.fillRect(x + 10, y + 10, 6, 6);
        ctx.fillStyle = '#72efdd';
        ctx.fillRect(x + 28, y + 10, 6, 6);
        break;

      case 6: // Lavoura / Fazenda (Estrela / Lajeado)
        ctx.fillStyle = '#6c584c'; // Terra fértil
        ctx.fillRect(x, y, s, s);
        // Fileiras de plantação verdejante (milho/soja)
        ctx.fillStyle = '#a7c957';
        ctx.fillRect(x + 4, y + 6, s - 8, 6);
        ctx.fillRect(x + 4, y + 20, s - 8, 6);
        ctx.fillRect(x + 4, y + 34, s - 8, 6);
        break;

      case 7: // Antena Parabólica de Telemetria
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(x, y, s, s);
        // Base de concreto
        ctx.fillStyle = '#6c757d';
        ctx.fillRect(x + 14, y + 32, 20, 10);
        // Suporte
        ctx.strokeStyle = '#adb5bd';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 24, y + 32);
        ctx.lineTo(x + 24, y + 16);
        ctx.stroke();
        // Prato parabólico
        ctx.fillStyle = '#f8f9fa';
        ctx.beginPath();
        ctx.arc(x + 24, y + 16, 14, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
        ctx.strokeStyle = '#00b4d8';
        ctx.stroke();
        // Sinal de rádio piscando
        ctx.fillStyle = '#00f5d4';
        ctx.beginPath();
        ctx.arc(x + 24, y + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  },

  drawBridges(ctx, cameraX, cameraY) {
    const s = this.tileSize;
    // Duas pontes cruzando o rio nas colunas 16 e 17
    const bridges = [
      { r1: 5, r2: 6, c1: 16, c2: 17, name: 'Ponte Lajeado-Estrela' },
      { r1: 11, r2: 12, c1: 16, c2: 17, name: 'Ponte Taquari Sul' }
    ];

    bridges.forEach(b => {
      const x = b.c1 * s - cameraX;
      const y = b.r1 * s - cameraY;
      const w = 2 * s;
      const h = 2 * s;

      // Pista da ponte
      ctx.fillStyle = '#343a40';
      ctx.fillRect(x, y, w, h);

      // Guarda-corpos da ponte
      ctx.fillStyle = '#e9ecef';
      ctx.fillRect(x, y, w, 4);
      ctx.fillRect(x, y + h - 4, w, 4);

      // Linha amarela na ponte
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(x, y + h / 2 - 1, w, 2);
    });
  },

  drawWorldLabels(ctx, cameraX, cameraY) {
    const s = this.tileSize;

    ctx.save();
    ctx.textAlign = 'center';

    // Fachada do Centro de Comando Espacial
    const ccX = 12.5 * s - cameraX;
    const ccY = 2.4 * s - cameraY;
    ctx.fillStyle = 'rgba(10, 15, 35, 0.85)';
    ctx.fillRect(ccX - 110, ccY - 18, 220, 24);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ccX - 110, ccY - 18, 220, 24);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillText('🚀 CENTRO ESPACIAL TAQUARI', ccX, ccY - 2);

    // Placa Rio Taquari
    const rioX = 17 * s - cameraX;
    const rioY = 9 * s - cameraY;
    ctx.fillStyle = 'rgba(0, 50, 100, 0.75)';
    ctx.fillRect(rioX - 50, rioY - 12, 100, 20);
    ctx.fillStyle = '#90e0ef';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.fillText('🌊 Rio Taquari', rioX, rioY + 2);

    // Placa Lavoura de Estrela
    const lavX = 22 * s - cameraX;
    const lavY = 2 * s - cameraY;
    ctx.fillStyle = 'rgba(40, 25, 10, 0.75)';
    ctx.fillRect(lavX - 60, lavY - 12, 120, 20);
    ctx.fillStyle = '#e9d8a6';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.fillText('🌾 Lavouras de Estrela', lavX, lavY + 2);

    ctx.restore();
  }
};

