// ============================================
// shop.js — Lojinha Espacial do Centro de Comando (Space Coins)
// ============================================

const SpaceShop = {
  active: false,
  selectedIndex: 0,

  items: [
    {
      id: 'battery_graphene',
      name: 'Super Bateria de Grafeno',
      type: 'part',
      price: 250,
      icon: '🔋',
      desc: 'Bateria ultraleve com carga infinita. Dá +25 de Energia para a nave!',
      statBonus: { energy: 25 }
    },
    {
      id: 'quantum_cpu',
      name: 'Processador Quântico NASA',
      type: 'part',
      price: 300,
      icon: '💻',
      desc: 'Computador de bordo ultrarrápido. Aumenta a Confiabilidade em +20%!',
      statBonus: { reliability: 20 }
    },
    {
      id: 'gold_antenna',
      name: 'Antena Dourada de Banda Ku',
      type: 'part',
      price: 350,
      icon: '📡',
      desc: 'Transmissão com sinal puro. Garante 100% de precisão de dados!',
      statBonus: { reliability: 15, energy: 10 }
    },
    {
      id: 'skin_neon',
      name: 'Traje Espacial Neon Ciano',
      type: 'skin',
      price: 300,
      icon: '✨',
      skinId: 'neon',
      desc: 'Visual moderno com luzes neon brilhantes para seu astronauta!'
    },
    {
      id: 'skin_gold',
      name: 'Traje de Comandante Estelar',
      type: 'skin',
      price: 450,
      icon: '👑',
      skinId: 'gold',
      desc: 'Traje de gala espacial com capacete de ouro maciço reflexivo!'
    },
    {
      id: 'pet_bit',
      name: 'Copiloto Robô Bit',
      type: 'companion',
      price: 400,
      icon: '🤖',
      desc: 'Robôzinho mascote que ajuda nos diagnósticos e na pilotagem!'
    }
  ],

  open() {
    this.active = true;
    this.selectedIndex = 0;
    NasaAudio.lockSuccess();
  },

  close() {
    this.active = false;
  },

  handleInput(key) {
    if (!this.active) return;

    if (key === 'ArrowUp' || key === 'KeyW') {
      this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
      NasaAudio.click();
    } else if (key === 'ArrowDown' || key === 'KeyS') {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
      NasaAudio.click();
    } else if (key === 'Enter' || key === 'Space' || key === 'KeyE') {
      this.buySelectedItem();
    } else if (key === 'Escape') {
      this.close();
    }
  },

  handleClick(mx, my, w, h) {
    if (!this.active) return;
    const cardW = Math.min(680, w - 80);
    const cardX = w / 2 - cardW / 2;
    const startY = 140;
    const itemH = 68;

    for (let i = 0; i < this.items.length; i++) {
      const iy = startY + i * (itemH + 10);
      if (mx >= cardX && mx <= cardX + cardW && my >= iy && my <= iy + itemH) {
        if (this.selectedIndex === i) {
          this.buySelectedItem();
        } else {
          this.selectedIndex = i;
          NasaAudio.click();
        }
        return;
      }
    }

    // Botão Voltar no rodapé
    const btnW = 200;
    const btnH = 44;
    const bx = w / 2 - btnW / 2;
    const by = h - 65;
    if (mx >= bx && mx <= bx + btnW && my >= by && my <= by + btnH) {
      this.close();
    }
  },

  buySelectedItem() {
    const item = this.items[this.selectedIndex];
    const player = API.currentPlayer;
    if (!player) return;

    player.inventory = player.inventory || ['skin_default'];
    player.coins = player.coins !== undefined ? player.coins : 500;

    // Checa se já possui
    if (player.inventory.includes(item.id)) {
      if (item.type === 'skin') {
        player.active_skin = item.skinId;
        API.saveGame({ active_skin: item.skinId, inventory: player.inventory });
        NasaAudio.inspectChime();
        return;
      }
      NasaAudio.alarmTone();
      return;
    }

    // Checa se tem moedas suficientes
    if (player.coins < item.price) {
      NasaAudio.alarmTone();
      return;
    }

    // Compra aprovada
    player.coins -= item.price;
    player.inventory.push(item.id);
    if (item.type === 'skin') {
      player.active_skin = item.skinId;
    }

    API.saveGame({
      coins: player.coins,
      inventory: player.inventory,
      active_skin: player.active_skin
    });

    NasaAudio.lockSuccess();
  },

  render(ctx, w, h) {
    if (!this.active) return;

    ctx.save();
    // Fundo escuro holográfico
    ctx.fillStyle = 'rgba(10, 16, 40, 0.95)';
    ctx.fillRect(0, 0, w, h);

    // Borda tecnológica
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 25, w - 60, h - 50);

    // Mascote Lyra na lojinha
    Lyra.render(ctx, 80, 80, 36, 'excited', '');

    // Cabeçalho da Loja
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 26px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(I18n.text('🛍️ LOJINHA ESPACIAL STELA'), 135, 75);

    ctx.fillStyle = '#90e0ef';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText(I18n.text('Equipe sua nave com tecnologia de ponta e skins divertidas!'), 135, 102);

    // Saldo de Space Coins no topo direito
    const player = API.currentPlayer;
    const coins = player ? (player.coins || 0) : 500;

    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.fillRect(w - 260, 50, 210, 48);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(w - 260, 50, 210, 48);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText(I18n.text('🪙 {coins} Space Coins', { coins }), w - 70, 82);

    // Lista de Itens
    const cardW = Math.min(680, w - 80);
    const cardX = w / 2 - cardW / 2;
    const startY = 135;
    const itemH = 68;

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const isSel = i === this.selectedIndex;
      const iy = startY + i * (itemH + 10);
      const isOwned = player && player.inventory && player.inventory.includes(item.id);
      const isEquipped = item.type === 'skin' && player && player.active_skin === item.skinId;

      // Card fundo — seleção bem viva (brilhante) para as crianças
      if (isSel) {
        const glow = 0.75 + 0.25 * Math.sin(Date.now() / 200);
        ctx.fillStyle = `rgba(0, 180, 216, ${0.35 * glow + 0.25})`;
      } else if (isOwned) {
        ctx.fillStyle = 'rgba(82, 183, 136, 0.18)';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      }
      ctx.fillRect(cardX, iy, cardW, itemH);

      ctx.strokeStyle = isSel ? '#ffd700' : (isOwned ? '#52b788' : 'rgba(255, 255, 255, 0.25)');
      ctx.lineWidth = isSel ? 3 : (isOwned ? 2 : 1);
      ctx.strokeRect(cardX, iy, cardW, itemH);

      // Ícone — grande e brilhante quando selecionado
      ctx.font = isSel ? '36px "Segoe UI", sans-serif' : '28px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      if (isSel) {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 18;
      }
      ctx.fillText(item.icon, cardX + (isSel ? 38 : 35), iy + (isSel ? 47 : 45));
      ctx.shadowBlur = 0;

      // Nome do item
      ctx.textAlign = 'left';
      ctx.fillStyle = isSel ? '#ffd700' : (isOwned ? '#7ee2b8' : '#ffffff');
      ctx.font = 'bold 18px "Segoe UI", sans-serif';
      ctx.fillText((isSel ? '▸ ' : '') + I18n.text(item.name), cardX + 70, iy + 28);

      // Descrição simples e legível (8-12 anos)
      ctx.fillStyle = isSel ? '#e0f2fe' : '#adb5bd';
      ctx.font = '15px "Segoe UI", sans-serif';
      ctx.fillText(I18n.text(item.desc), cardX + 70, iy + 52, cardW - 240);

      // Preço ou Status
      ctx.textAlign = 'right';
      if (isEquipped) {
        ctx.fillStyle = '#00f5d4';
        ctx.font = 'bold 16px "Segoe UI", sans-serif';
        ctx.fillText(I18n.text('✓ EQUIPADO'), cardX + cardW - 20, iy + 42);
      } else if (isOwned) {
        ctx.fillStyle = isSel ? '#52ff9d' : '#52b788';
        ctx.font = 'bold 16px "Segoe UI", sans-serif';
        ctx.fillText(I18n.text(item.type === 'skin' ? 'USAR [ENTER]' : '✓ ADQUIRIDO'), cardX + cardW - 20, iy + 42);
      } else {
        const canAfford = coins >= item.price;
        ctx.fillStyle = canAfford ? '#ffd700' : '#e63946';
        ctx.font = 'bold 17px "Segoe UI", sans-serif';
        ctx.fillText(I18n.text('🪙 {price} coins', { price: item.price }), cardX + cardW - 20, iy + 42);
      }
    }

    // Botão Voltar
    const btnW = 200;
    const btnH = 44;
    const bx = w / 2 - btnW / 2;
    const by = h - 65;

    ctx.fillStyle = '#e63946';
    ctx.fillRect(bx, by, btnW, btnH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, btnW, btnH);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(I18n.text('VOLTAR [ESC]'), bx + btnW / 2, by + 28);

    ctx.restore();
  }
};
