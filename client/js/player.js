// ============================================
// player.js — Personagem do Líder Espacial
// ============================================

const Player = {
  x: 12 * 48 + 12,
  y: 6 * 48 + 12,
  w: 24,
  h: 24,
  speed: 160, // pixels por segundo
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

      // Normaliza vetor para manter velocidade uniforme nas diagonais
      const len = Math.hypot(dx, dy);
      const moveX = (dx / len) * this.speed * dt;
      const moveY = (dy / len) * this.speed * dt;

      // Movimentação eixo X com colisão
      const nextX = this.x + moveX;
      if (!map.isSolid(nextX, this.y, this.w, this.h)) {
        this.x = nextX;
      }

      // Movimentação eixo Y com colisão
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

    ctx.save();

    // Sombra oval no chão
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(rx + this.w / 2, ry + this.h + 2, this.w * 0.6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corpo do astronauta / líder espacial
    // Traje espacial azul-escuro com detalhes dourados
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(rx + 4, ry + 10 + bob, this.w - 8, 12);

    // Emblema NASA no peito
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(rx + this.w / 2 - 2, ry + 13 + bob, 4, 4);

    // Pernas / Botas
    ctx.fillStyle = '#023e8a';
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
    ctx.strokeStyle = '#0077b6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Viseira dourada com reflexo
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    if (this.facing === 'down') {
      ctx.ellipse(rx + this.w / 2, ry + 7 + bob, 5, 3.5, 0, 0, Math.PI * 2);
    } else if (this.facing === 'up') {
      // De costas, sem viseira visível, apenas capacete
      ctx.fillStyle = '#caf0f8';
      ctx.ellipse(rx + this.w / 2, ry + 7 + bob, 2, 2, 0, 0, Math.PI * 2);
    } else if (this.facing === 'left') {
      ctx.ellipse(rx + this.w / 2 - 2, ry + 7 + bob, 4, 3, 0, 0, Math.PI * 2);
    } else if (this.facing === 'right') {
      ctx.ellipse(rx + this.w / 2 + 2, ry + 7 + bob, 4, 3, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Mini balão / indicador "VOCÊ" sutil acima do personagem
    ctx.fillStyle = '#00f5d4';
    ctx.beginPath();
    ctx.moveTo(rx + this.w / 2, ry - 3);
    ctx.lineTo(rx + this.w / 2 - 4, ry - 9);
    ctx.lineTo(rx + this.w / 2 + 4, ry - 9);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
};

