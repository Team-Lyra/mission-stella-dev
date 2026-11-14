// ============================================
// map.js — Mapa 2D com Ambientes Externo (Vale do Taquari) e Interno (Centro Espacial STELA)
// ============================================

const GameMap = {
  tileSize: 48,
  currentZone: 'OUTDOOR', // 'OUTDOOR' ou 'SPACE_CENTER'
  cols: 28,
  rows: 20,
  waterTick: 0,

  // Mapa Externo: Vale do Taquari
  // 0 = Grama, 1 = Rua, 2 = Rio Taquari, 3 = Árvores/Mata,
  // 4 = Casas/Escola, 5 = Fachada Centro Espacial, 6 = Lavouras Estrela, 7 = Antenas
  outdoorData: [
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

  // Mapa Interno: Centro Espacial STELA (Sala de Comando & Laboratório)
  // 10 = Parede de Aço/Laboratório, 11 = Piso de Alta Tecnologia, 12 = Bancada Montagem,
  // 13 = Telão de Ranking, 14 = Balcão Lojinha, 15 = Porta de Saída, 16 = Servidores/Consoles
  spaceCenterCols: 18,
  spaceCenterRows: 13,
  spaceCenterData: [
    [10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],
    [10,16,16,11,11,11,11,13,13,13,11,11,11,11,16,16,16,10],
    [10,16,16,11,11,11,11,13,13,13,11,11,11,11,16,16,16,10],
    [10,11,11,12,12,11,11,11,11,11,11,11,14,14,11,11,11,10],
    [10,11,11,12,12,11,11,11,11,11,11,11,14,14,11,11,11,10],
    [10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,10],
    [10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,10],
    [10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,10],
    [10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,10],
    [10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,10],
    [10,11,11,11,11,11,11,15,15,15,11,11,11,11,11,11,11,10],
    [10,11,11,11,11,11,11,15,15,15,11,11,11,11,11,11,11,10],
    [10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10]
  ],

  // Locais interativos
  commandCenter: { x: 10 * 48, y: 2 * 48, w: 3 * 48, h: 2 * 48 },

  // Estações do Centro Espacial
  stations: {
    workshop: { x: 3.5 * 48, y: 3.5 * 48, w: 2 * 48, h: 2 * 48, label: '🔬 Bancada de Engenharia' },
    ranking: { x: 8 * 48, y: 1.5 * 48, w: 3 * 48, h: 2 * 48, label: '🏆 Telão de Ranking' },
    shop: { x: 12.5 * 48, y: 3.5 * 48, w: 2 * 48, h: 2 * 48, label: '🛍️ Lojinha Espacial' },
    missionOps: { x: 8 * 48, y: 5.5 * 48, w: 2 * 48, h: 1.5 * 48, label: '🗺️ Painel de Operações' },
    exit: { x: 8 * 48, y: 10.5 * 48, w: 3 * 48, h: 1.5 * 48, label: '🚪 Sair para o Vale' }
  },

  init() {
    this.currentZone = 'OUTDOOR';
    this.cols = 28;
    this.rows = 20;
    this.data = this.outdoorData;
    this.waterTick = 0;
  },

  switchZone(newZone, spawnX, spawnY) {
    this.currentZone = newZone;
    if (newZone === 'SPACE_CENTER') {
      this.cols = this.spaceCenterCols;
      this.rows = this.spaceCenterRows;
      this.data = this.spaceCenterData;
      if (spawnX !== undefined && spawnY !== undefined) {
        Player.x = spawnX;
        Player.y = spawnY;
      } else {
        Player.x = 8.5 * this.tileSize;
        Player.y = 8.5 * this.tileSize;
      }
      NasaAudio.lockSuccess();
      Lyra.playCheer && Lyra.playCheer();
    } else {
      this.cols = 28;
      this.rows = 20;
      this.data = this.outdoorData;
      if (spawnX !== undefined && spawnY !== undefined) {
        Player.x = spawnX;
        Player.y = spawnY;
      } else {
        Player.x = 11.5 * this.tileSize;
        Player.y = 4.8 * this.tileSize;
      }
      NasaAudio.click();
    }
  },

  update(dt) {
    this.waterTick += dt * 3;
  },

  isSolid(pixelX, pixelY, width = 24, height = 24) {
    const checkPoints = [
      { x: pixelX, y: pixelY },
      { x: pixelX + width, y: pixelY },
      { x: pixelX, y: pixelY + height },
      { x: pixelX + width, y: pixelY + height }
    ];

    for (const pt of checkPoints) {
      const col = Math.floor(pt.x / this.tileSize);
      const row = Math.floor(pt.y / this.tileSize);

      if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return true;

      const tile = this.data[row][col];

      if (this.currentZone === 'OUTDOOR') {
        if (tile === 3 || tile === 4) return true;
        if (tile === 2) {
          if (row !== 5 && row !== 6 && row !== 11 && row !== 12) return true;
        }
      } else {
        // Interior do Centro Espacial
        // 10 = Parede, 16 = Servidores são sólidos
        if (tile === 10 || tile === 16) return true;
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

    if (this.currentZone === 'OUTDOOR') {
      this.drawBridges(ctx, cameraX, cameraY);
      this.drawWorldLabels(ctx, cameraX, cameraY);
    } else {
      this.drawSpaceCenterOverlay(ctx, cameraX, cameraY);
    }
  },

  drawTile(ctx, tile, x, y, col, row) {
    const s = this.tileSize;

    if (this.currentZone === 'SPACE_CENTER') {
      // Tiles do Centro Espacial
      switch (tile) {
        case 10: // Parede de aço escuro com luzes LED ciano
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, s, s);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, s, s);
          // Painel de ventilação ou luz
          ctx.fillStyle = '#00b4d8';
          ctx.fillRect(x + 10, y + 18, s - 20, 3);
          break;

        case 11: // Piso tecnológico quadriculado com juntas iluminadas
          ctx.fillStyle = (col + row) % 2 === 0 ? '#1e293b' : '#182234';
          ctx.fillRect(x, y, s, s);
          ctx.strokeStyle = 'rgba(0, 180, 216, 0.15)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, s, s);
          // Pequeno ponto de circuito
          if ((col * row) % 5 === 0) {
            ctx.fillStyle = '#00f5d4';
            ctx.fillRect(x + s / 2 - 2, y + s / 2 - 2, 4, 4);
          }
          break;

        case 12: // Bancada de Montagem
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(x + 4, y + 4, s - 8, s - 8);
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 4, y + 4, s - 8, s - 8);
          // Desenho esquemático de satélite na bancada
          ctx.fillStyle = '#ffd166';
          ctx.fillRect(x + 14, y + 16, 20, 16);
          break;

        case 13: // Telão de Ranking
          ctx.fillStyle = '#030712';
          ctx.fillRect(x, y, s, s);
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 2, y + 2, s - 4, s - 4);
          // Gráficos holográficos
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(x + 8, y + 10, 10, 14);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 22, y + 6, 12, 18);
          break;

        case 14: // Balcão da Lojinha
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = '#7c3aed';
          ctx.fillRect(x + 4, y + 6, s - 8, s - 10);
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 4, y + 6, s - 8, s - 10);
          // Ícone de moeda/brilho no balcão
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(x + s / 2, y + s / 2, 7, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 15: // Porta de saída
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = '#e11d48';
          ctx.fillRect(x + 6, y + 10, s - 12, s - 14);
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 6, y + 10, s - 12, s - 14);
          // Seta de saída
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(x + s / 2, y + 28);
          ctx.lineTo(x + s / 2 - 8, y + 18);
          ctx.lineTo(x + s / 2 + 8, y + 18);
          ctx.closePath();
          ctx.fill();
          break;

        case 16: // Servidores / Computadores NASA
          ctx.fillStyle = '#0b0f19';
          ctx.fillRect(x, y, s, s);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 4, y + 4, s - 8, s - 8);
          // LEDs piscando nos servidores
          const blink = Math.sin(Date.now() / 250 + col) > 0;
          ctx.fillStyle = blink ? '#22c55e' : '#15803d';
          ctx.fillRect(x + 10, y + 12, 6, 4);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x + 22, y + 12, 6, 4);
          ctx.fillStyle = blink ? '#ef4444' : '#991b1b';
          ctx.fillRect(x + 10, y + 24, 6, 4);
          ctx.fillStyle = '#eab308';
          ctx.fillRect(x + 22, y + 24, 6, 4);
          break;
      }
      return;
    }

    // Tiles do Vale do Taquari (Ambiente Externo)
    switch (tile) {
      case 0: // Grama
        ctx.fillStyle = (col + row) % 2 === 0 ? '#2d6a4f' : '#275d45';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#40916c';
        ctx.fillRect(x + 12, y + 14, 3, 5);
        ctx.fillRect(x + 32, y + 28, 3, 4);
        break;

      case 1: // Rua / Calçada
        ctx.fillStyle = '#495057';
        ctx.fillRect(x, y, s, s);
        if (row === 5 || row === 11) {
          ctx.fillStyle = '#ffd166';
          ctx.fillRect(x + 4, y + s - 2, s - 8, 2);
        }
        break;

      case 2: // Rio Taquari
        ctx.fillStyle = '#1d3557';
        ctx.fillRect(x, y, s, s);
        const waveOffset = Math.sin(this.waterTick + col + row) * 4;
        ctx.fillStyle = '#457b9d';
        ctx.fillRect(x + 6 + waveOffset, y + 12, 18, 3);
        ctx.fillRect(x + 20 - waveOffset, y + 28, 16, 3);
        break;

      case 3: // Árvores / Mata Ciliar
        ctx.fillStyle = '#1b4332';
        ctx.fillRect(x, y, s, s);
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
        ctx.fillStyle = '#343a40';
        ctx.fillRect(x + 4, y + 8, s - 8, s - 12);
        ctx.fillStyle = '#b7094c';
        ctx.fillRect(x + 2, y + 4, s - 4, 8);
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(x + 10, y + 18, 8, 8);
        ctx.fillRect(x + 28, y + 18, 8, 8);
        ctx.fillStyle = '#892b64';
        ctx.fillRect(x + 20, y + 28, 8, 14);
        break;

      case 5: // Centro de Comando Espacial STELA
        ctx.fillStyle = '#0d1b2a';
        ctx.fillRect(x, y, s, s);
        ctx.strokeStyle = '#00b4d8';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, s - 4, s - 4);
        ctx.fillStyle = '#1b263b';
        ctx.fillRect(x + 4, y + 4, s - 8, s - 8);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + 10, y + 10, 8, 8);
        ctx.fillStyle = '#72efdd';
        ctx.fillRect(x + 26, y + 10, 8, 8);
        break;

      case 6: // Lavoura / Fazenda
        ctx.fillStyle = '#6c584c';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#a7c957';
        ctx.fillRect(x + 4, y + 6, s - 8, 6);
        ctx.fillRect(x + 4, y + 20, s - 8, 6);
        ctx.fillRect(x + 4, y + 34, s - 8, 6);
        break;

      case 7: // Antena Parabólica
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = '#6c757d';
        ctx.fillRect(x + 14, y + 32, 20, 10);
        ctx.strokeStyle = '#adb5bd';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 24, y + 32);
        ctx.lineTo(x + 24, y + 16);
        ctx.stroke();
        ctx.fillStyle = '#f8f9fa';
        ctx.beginPath();
        ctx.arc(x + 24, y + 16, 14, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
        ctx.strokeStyle = '#00b4d8';
        ctx.stroke();
        ctx.fillStyle = '#00f5d4';
        ctx.beginPath();
        ctx.arc(x + 24, y + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  },

  drawBridges(ctx, cameraX, cameraY) {
    const s = this.tileSize;
    const bridges = [
      { r1: 5, r2: 6, c1: 16, c2: 17, name: 'Ponte Lajeado-Estrela' },
      { r1: 11, r2: 12, c1: 16, c2: 17, name: 'Ponte Taquari Sul' }
    ];

    bridges.forEach(b => {
      const x = b.c1 * s - cameraX;
      const y = b.r1 * s - cameraY;
      const w = 2 * s;
      const h = 2 * s;

      ctx.fillStyle = '#343a40';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#e9ecef';
      ctx.fillRect(x, y, w, 4);
      ctx.fillRect(x, y + h - 4, w, 4);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(x, y + h / 2 - 1, w, 2);
    });
  },

  drawWorldLabels(ctx, cameraX, cameraY) {
    const s = this.tileSize;
    ctx.save();
    ctx.textAlign = 'center';

    // Fachada do Centro de Comando Espacial STELA
    const ccX = 11.5 * s - cameraX;
    const ccY = 1.8 * s - cameraY;
    ctx.fillStyle = 'rgba(10, 15, 35, 0.95)';
    ctx.fillRect(ccX - 140, ccY - 18, 280, 28);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2;
    ctx.strokeRect(ccX - 140, ccY - 18, 280, 28);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillText('🚀 CENTRO ESPACIAL STELA', ccX, ccY + 1);

    // Entrada Neon da Porta Principal
    const doorX = 11.5 * s - cameraX;
    const doorY = 3.6 * s - cameraY;
    const pulse = Math.sin(Date.now() / 200) * 3;

    ctx.fillStyle = 'rgba(0, 245, 212, 0.25)';
    ctx.fillRect(doorX - 28, doorY - 10, 56, 36);
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(doorX - 28, doorY - 10, 56, 36);

    ctx.fillStyle = 'rgba(10, 15, 35, 0.95)';
    ctx.fillRect(doorX - 110, doorY - 38 + pulse, 220, 24);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(doorX - 110, doorY - 38 + pulse, 220, 24);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillText('🚪 ENTRADA [Pressione E ou Entre]', doorX, doorY - 22 + pulse);

    // Placa Rio Taquari
    const rioX = 17 * s - cameraX;
    const rioY = 9 * s - cameraY;
    ctx.fillStyle = 'rgba(0, 50, 100, 0.85)';
    ctx.fillRect(rioX - 60, rioY - 14, 120, 24);
    ctx.fillStyle = '#90e0ef';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillText('🌊 Rio Taquari', rioX, rioY + 2);

    // Placa Lavoura de Estrela
    const lavX = 22 * s - cameraX;
    const lavY = 2 * s - cameraY;
    ctx.fillStyle = 'rgba(40, 25, 10, 0.85)';
    ctx.fillRect(lavX - 70, lavY - 14, 140, 24);
    ctx.fillStyle = '#e9d8a6';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillText('🌾 Lavouras de Estrela', lavX, lavY + 2);

    ctx.restore();
  },

  drawSpaceCenterOverlay(ctx, cameraX, cameraY) {
    const s = this.tileSize;
    ctx.save();
    ctx.textAlign = 'center';

    // Rótulo da Bancada de Montagem
    const wX = 4.5 * s - cameraX;
    const wY = 2.5 * s - cameraY;
    ctx.fillStyle = 'rgba(2, 132, 199, 0.9)';
    ctx.fillRect(wX - 85, wY - 16, 170, 26);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(wX - 85, wY - 16, 170, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillText('🔬 BANCADA DE PROJETOS', wX, wY + 2);

    // Rótulo do Telão de Ranking
    const rX = 9.5 * s - cameraX;
    const rY = 0.8 * s - cameraY;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(rX - 95, rY - 16, 190, 26);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rX - 95, rY - 16, 190, 26);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillText('🏆 TELÃO DE RANKING DA NASA', rX, rY + 2);

    // Rótulo da Lojinha Espacial
    const sX = 14.5 * s - cameraX;
    const sY = 2.5 * s - cameraY;
    ctx.fillStyle = 'rgba(124, 58, 237, 0.9)';
    ctx.fillRect(sX - 85, sY - 16, 170, 26);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sX - 85, sY - 16, 170, 26);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillText('🛍️ LOJINHA ESPACIAL', sX, sY + 2);

    // Rótulo da Porta de Saída
    const eX = 9.5 * s - cameraX;
    const eY = 12 * s - cameraY;
    ctx.fillStyle = 'rgba(225, 29, 72, 0.9)';
    ctx.fillRect(eX - 80, eY - 14, 160, 24);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(eX - 80, eY - 14, 160, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillText('🚪 SAÍDA (VALE DO TAQUARI)', eX, eY + 2);

    // Rótulo do Painel de Operações (Terminal Central)
    const opX = 9 * s - cameraX;
    const opY = 5.5 * s - cameraY;
    const opPulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(0, 180, 216, ${opPulse * 0.9})`;
    ctx.fillRect(opX - 100, opY - 16, 200, 26);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(opX - 100, opY - 16, 200, 26);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillText('🗺️ PAINEL DE OPERAÇÕES [E]', opX, opY + 2);

    ctx.restore();
  }
};
