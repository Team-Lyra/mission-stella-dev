// ============================================
// player.js — Personagem do Líder Espacial & Suporte a Skins
// ============================================

const Player = {
  x: 12 * 48 + 12,
  y: 6 * 48 + 12,
  w: 24,
  h: 24,
  speed: 170, // pixels por segundo
  facing: 'down', // 'up', 'down', 'left', 'right'
  isMoving: false,
  walkTimer: 0,

  init(startX, startY) {
    if (startX !== undefined && startY !== undefined) {
      this.x = startX;
      this.y = startY;
    } else {
      this.x = 12 * 48 + 12;
      this.y = 6 * 48 + 12;
    }
    this.facing = 'down';
    this.isMoving = false;
  },

  update(dt, input, map) {
    let dx = 0;
    let dy = 0;

    if (input.left) {
      dx -= 1;
      this.facing = 'left';
    }
    if (input.right) {
      dx += 1;
      this.facing = 'right';
    }
    if (input.up) {
      dy -= 1;
      this.facing = 'up';
    }
    if (input.down) {
      dy += 1;
      this.facing = 'down';
    }

    if (dx !== 0 || dy !== 0) {
      this.isMoving = true;
      this.walkTimer += dt * 8;

      const len = Math.hypot(dx, dy);
      const moveX = (dx / len) * this.speed * dt;
      const moveY = (dy / len) * this.speed * dt;

      const nextX = this.x + moveX;
      if (!map.isSolid(nextX, this.y, this.w, this.h)) {
        this.x = nextX;
      }

      const nextY = this.y + moveY;
      if (!map.isSolid(this.x, nextY, this.w, this.h)) {
        this.y = nextY;
      }
    } else {
      this.isMoving = false;
      this.walkTimer = 0;
    }
  },

  render(ctx, cameraX, cameraY) {
    const rx = Math.round(this.x - cameraX);
    const ry = Math.round(this.y - cameraY);
    const bob = this.isMoving ? Math.sin(this.walkTimer) * 2 : 0;

    const activeSkin = (API.currentPlayer && API.currentPlayer.active_skin) ? API.currentPlayer.active_skin : 'skin_default';
    const hasBit = API.currentPlayer && API.currentPlayer.inventory && API.currentPlayer.inventory.includes('pet_bit');

    ctx.save();

    // Sombra oval no chão
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(rx + this.w / 2, ry + this.h + 2, this.w * 0.6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cores do traje conforme a skin equipada
    let suitColor = '#0077b6';
    let bootsColor = '#023e8a';
    let badgeColor = '#ffd700';

    if (activeSkin === 'neon') {
      suitColor = '#00f5d4';
      bootsColor = '#0b525b';
      badgeColor = '#ffffff';
    } else if (activeSkin === 'gold') {
      suitColor = '#ffd700';
      bootsColor = '#b38a00';
      badgeColor = '#ff0054';
    }

    // Corpo do astronauta
    ctx.fillStyle = suitColor;
    ctx.fillRect(rx + 4, ry + 10 + bob, this.w - 8, 12);

    // Emblema no peito
    ctx.fillStyle = badgeColor;
    ctx.fillRect(rx + this.w / 2 - 2, ry + 13 + bob, 4, 4);

    // Pernas / Botas
    ctx.fillStyle = bootsColor;
    if (this.isMoving) {
      const legOffset = Math.sin(this.walkTimer) * 3;
      ctx.fillRect(rx + 5, ry + 22, 5, 5 + legOffset);
      ctx.fillRect(rx + 14, ry + 22, 5, 5 - legOffset);
    } else {
      ctx.fillRect(rx + 5, ry + 22, 5, 5);
      ctx.fillRect(rx + 14, ry + 22, 5, 5);
    }

    // Capacete espacial com viseira de ouro reflexiva
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(rx + this.w / 2, ry + 7 + bob, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = suitColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Viseira dourada com reflexo
    ctx.fillStyle = activeSkin === 'neon' ? '#00f5d4' : '#ffd166';
    ctx.beginPath();
    if (this.facing === 'down') {
      ctx.ellipse(rx + this.w / 2, ry + 7 + bob, 5, 3.5, 0, 0, Math.PI * 2);
    } else if (this.facing === 'up') {
      ctx.fillStyle = '#caf0f8';
      ctx.ellipse(rx + this.w / 2, ry + 7 + bob, 2, 2, 0, 0, Math.PI * 2);
    } else if (this.facing === 'left') {
      ctx.ellipse(rx + this.w / 2 - 2, ry + 7 + bob, 4, 3, 0, 0, Math.PI * 2);
    } else if (this.facing === 'right') {
      ctx.ellipse(rx + this.w / 2 + 2, ry + 7 + bob, 4, 3, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Mini seta/indicador "VOCÊ" acima do personagem
    ctx.fillStyle = '#00f5d4';
    ctx.beginPath();
    ctx.moveTo(rx + this.w / 2, ry - 4);
    ctx.lineTo(rx + this.w / 2 - 4, ry - 10);
    ctx.lineTo(rx + this.w / 2 + 4, ry - 10);
    ctx.closePath();
    ctx.fill();

    // Se tiver o mascote Copiloto Bit, desenha ele flutuando do lado!
    if (hasBit) {
      const bitX = rx + (this.facing === 'left' ? 32 : -18);
      const bitY = ry - 2 + Math.sin(Date.now() / 250) * 4;
      ctx.fillStyle = '#64dfdf';
      ctx.fillRect(bitX, bitY, 12, 12);
      ctx.strokeStyle = '#0077b6';
      ctx.lineWidth = 1;
      ctx.strokeRect(bitX, bitY, 12, 12);
      // Olhinho do robô
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bitX + 3, bitY + 3, 3, 3);
      ctx.fillRect(bitX + 7, bitY + 3, 3, 3);
      // Antena do robô
      ctx.strokeStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(bitX + 6, bitY);
      ctx.lineTo(bitX + 6, bitY - 4);
      ctx.stroke();
    }

    ctx.restore();
  }
};
