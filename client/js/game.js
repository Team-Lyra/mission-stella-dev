// ============================================
// game.js — Ciclo Central, Câmera e Máquina de Estados do Jogo
// ============================================

const Game = {
  state: 'MENU', // 'MENU', 'PLAYING', 'SATELLITE_BUILD', 'LAUNCH', 'SPACE_COLLECT', 'MISSION_IMPACT', 'LEADERBOARD'
  canvas: null,
  ctx: null,
  width: 800,
  height: 600,
  lastTime: 0,

  // Câmera
  camera: { x: 0, y: 0 },

  // Inputs
  input: {
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false
  },

  menuSelected: 0,
  menuItems: ['🚀 Iniciar Exploração', '🏆 Placar de Líderes', '🛰️ Dicas da NASA', '📜 Créditos'],
  leaderboardData: [],

  async init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();

    // Inicializa subsistemas
    await API.init();
    await MissionManager.init();
    GameMap.init();
    Player.init();
    NPCManager.init();
    UI.init(this.width, this.height);
    NasaTips.show(); // Exibe a primeira dica da NASA

    this.bindEvents();
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  },

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    if (UI.stars.length === 0) {
      UI.init(this.width, this.height);
    }
  },

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('keydown', (e) => {
      // Ignora repetição excessiva em alguns navegadores
      this.handleKeyDown(e);
    });

    window.addEventListener('keyup', (e) => {
      this.handleKeyUp(e);
    });
  },

  handleKeyDown(e) {
    const code = e.code;

    // Se estiver no diálogo ativo
    if (UI.dialog.active) {
      if (code === 'Space' || code === 'Enter' || code === 'KeyE') {
        UI.advanceDialog();
        return;
      }
    }

    // Máquina de estados
    if (this.state === 'MENU') {
      if (code === 'ArrowUp' || code === 'KeyW') {
        this.menuSelected = (this.menuSelected - 1 + this.menuItems.length) % this.menuItems.length;
      } else if (code === 'ArrowDown' || code === 'KeyS') {
        this.menuSelected = (this.menuSelected + 1) % this.menuItems.length;
      } else if (code === 'Enter' || code === 'Space') {
        this.selectMenuItem(this.menuSelected);
      }
    } else if (this.state === 'PLAYING') {
      if (code === 'ArrowLeft' || code === 'KeyA') this.input.left = true;
      if (code === 'ArrowRight' || code === 'KeyD') this.input.right = true;
      if (code === 'ArrowUp' || code === 'KeyW') this.input.up = true;
      if (code === 'ArrowDown' || code === 'KeyS') this.input.down = true;

      if (code === 'KeyE' || code === 'Enter' || code === 'Space') {
        this.tryInteract();
      }

      if (code === 'Escape') {
        this.state = 'MENU';
      }
    } else if (this.state === 'SATELLITE_BUILD') {
      const config = SatelliteBuilder.handleInput(code);
      if (config) {
        // Finalizou montagem, inicia lançamento
        this.state = 'LAUNCH';
        MissionManager.completeSatelliteAssembly(config);
      }
    } else if (this.state === 'LAUNCH') {
      LaunchMinigame.handleInput(e);
    } else if (this.state === 'MISSION_IMPACT') {
      if (code === 'Space' || code === 'Enter' || code === 'KeyE') {
        MissionManager.advanceToNextMission();
        this.state = 'PLAYING';
      }
    } else if (this.state === 'LEADERBOARD') {
      if (code === 'Escape' || code === 'Enter' || code === 'Space') {
        this.state = 'MENU';
      }
    }
  },

  handleKeyUp(e) {
    const code = e.code;
    if (code === 'ArrowLeft' || code === 'KeyA') this.input.left = false;
    if (code === 'ArrowRight' || code === 'KeyD') this.input.right = false;
    if (code === 'ArrowUp' || code === 'KeyW') this.input.up = false;
    if (code === 'ArrowDown' || code === 'KeyS') this.input.down = false;
  },

  async selectMenuItem(index) {
    if (index === 0) {
      // Iniciar Exploração
      this.state = 'PLAYING';
    } else if (index === 1) {
      // Placar de Líderes / Ranking Local
      this.leaderboardData = await API.getLeaderboard();
      this.state = 'LEADERBOARD';
    } else if (index === 2) {
      // Dicas da NASA
      NasaTips.show();
    } else if (index === 3) {
      // Diálogo de Créditos
      UI.showDialog(
        'Missão Taquari',
        'Desenvolvido com JavaScript para estudantes de até 18 anos. Conectando tecnologia espacial padrão NASA aos desafios reais do Vale do Taquari!',
        '#ffd700'
      );
    }
  },

  tryInteract() {
    const nearby = NPCManager.getNearbyNPC(Player.x, Player.y);
    if (nearby) {
      // Se for o diretor do Centro Espacial ou o jogador estiver no centro
      if (nearby.id === 'diretor_nasa') {
        UI.showDialog(nearby.name, nearby.dialog, nearby.color, null, () => {
          // Abre montagem de satélite
          this.state = 'SATELLITE_BUILD';
          MissionManager.startSatelliteAssembly();
        });
        return;
      }

      // Moradores (Dona Iracema, Capitão Rodrigo, etc.)
      UI.showDialog(nearby.name, nearby.dialog, nearby.color, null, () => {
        // Orienta a ir ao Centro Espacial
        NasaTips.show({
          title: "Vá ao Centro Espacial!",
          text: "Problema identificado! Dirija-se ao Centro de Comando no mapa para projetar o satélite adequado.",
          icon: "🚀"
        });
      });
      return;
    }

    // Checa se está na porta do Centro de Comando Espacial
    const cc = GameMap.commandCenter;
    const distToCC = Math.hypot((cc.x + cc.w / 2) - (Player.x + 12), (cc.y + cc.h) - (Player.y + 12));
    if (distToCC < 60) {
      this.state = 'SATELLITE_BUILD';
      MissionManager.startSatelliteAssembly();
    }
  },

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  },

  update(dt) {
    NasaTips.update(dt);

    if (this.state === 'PLAYING') {
      GameMap.update(dt);
      Player.update(dt, this.input, GameMap);
      NPCManager.update(dt);

      // Câmera segue o jogador suavemente
      const targetCamX = Player.x + Player.w / 2 - this.width / 2;
      const targetCamY = Player.y + Player.h / 2 - this.height / 2;
      const maxX = GameMap.cols * GameMap.tileSize - this.width;
      const maxY = GameMap.rows * GameMap.tileSize - this.height;

      this.camera.x += (Math.max(0, Math.min(maxX, targetCamX)) - this.camera.x) * 0.1;
      this.camera.y += (Math.max(0, Math.min(maxY, targetCamY)) - this.camera.y) * 0.1;
    } else if (this.state === 'LAUNCH') {
      LaunchMinigame.update(dt);
      if (!LaunchMinigame.active && LaunchMinigame.stage === 3) {
        this.state = 'SPACE_COLLECT';
      }
    } else if (this.state === 'SPACE_COLLECT') {
      if (MissionManager.phase === 'IMPACT') {
        this.state = 'MISSION_IMPACT';
      }
    }
  },

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    if (this.state === 'MENU') {
      this.renderMenu(ctx, w, h);
    } else if (this.state === 'PLAYING') {
      // 1. Renderiza Mapa 2D
      GameMap.render(ctx, this.camera.x, this.camera.y, w, h);

      // 2. Renderiza NPCs
      const nearby = NPCManager.getNearbyNPC(Player.x, Player.y);
      NPCManager.render(ctx, this.camera.x, this.camera.y, nearby);

      // 3. Renderiza Jogador
      Player.render(ctx, this.camera.x, this.camera.y);

      // 4. Renderiza HUD
      this.renderHUD(ctx, w, h);
    } else if (this.state === 'SATELLITE_BUILD') {
      SatelliteBuilder.render(ctx, w, h);
    } else if (this.state === 'LAUNCH') {
      LaunchMinigame.render(ctx, w, h);
    } else if (this.state === 'SPACE_COLLECT') {
      MissionManager.renderSpaceCollect(ctx, w, h);
    } else if (this.state === 'MISSION_IMPACT') {
      MissionManager.renderImpactScreen(ctx, w, h);
    } else if (this.state === 'LEADERBOARD') {
      this.renderLeaderboard(ctx, w, h);
    }

    // Renderiza Diálogo (se ativo)
    if (UI.dialog.active) {
      UI.renderDialog(ctx, w, h);
    }

    // Renderiza Banner flutuante de Dica da NASA
    if (NasaTips.showing || NasaTips.alpha > 0) {
      this.renderNasaTipBanner(ctx, w, h);
    }
  },

  renderHUD(ctx, w, h) {
    ctx.save();

    // Barra superior semi-transparente
    ctx.fillStyle = 'rgba(10, 14, 46, 0.88)';
    ctx.fillRect(15, 15, w - 30, 48);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(15, 15, w - 30, 48);

    // Nome e Missão Atual
    const curMission = MissionManager.getCurrent();
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🚀 MISSÃO ATUAL: ${curMission.title}`, 30, 43);

    // Pontuação e Status do Banco de Dados
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillText(`⭐ Pontos: ${MissionManager.totalScore}`, w - 170, 43);

    // Indicador de Conexão com o Servidor
    ctx.fillStyle = API.online ? '#52b788' : '#ffd166';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillText(API.online ? '🟢 Servidor Conectado' : '🟡 Modo Local (Storage)', w - 35, 43);

    // Dica de navegação no rodapé
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(10, 14, 46, 0.75)';
    ctx.fillRect(w / 2 - 210, h - 38, 420, 28);
    ctx.fillStyle = '#e0e0ff';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillText('Ande com [WASD / Setas] • Fale com moradores e acesse o Centro Espacial com [E]', w / 2, h - 20);

    ctx.restore();
  },

  renderMenu(ctx, w, h) {
    ctx.save();

    // Espaço com estrelas
    ctx.fillStyle = '#070b19';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    // Título Principal com brilho
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 44px "Segoe UI", sans-serif';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 18;
    ctx.fillText('🚀 MISSÃO TAQUARI', w / 2, h * 0.28);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#90e0ef';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillText('Jogo Educativo Espacial no Vale do Taquari • Padrão NASA', w / 2, h * 0.35);

    // Itens do menu
    for (let i = 0; i < this.menuItems.length; i++) {
      const isSel = i === this.menuSelected;
      const itemY = h * 0.48 + i * 52;

      ctx.fillStyle = isSel ? 'rgba(0, 180, 216, 0.3)' : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(w / 2 - 160, itemY - 26, 320, 42);

      ctx.strokeStyle = isSel ? '#ffd700' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.strokeRect(w / 2 - 160, itemY - 26, 320, 42);

      ctx.fillStyle = isSel ? '#ffd700' : '#ffffff';
      ctx.font = isSel ? 'bold 18px "Segoe UI", sans-serif' : '16px "Segoe UI", sans-serif';
      ctx.fillText((isSel ? '▸ ' : '') + this.menuItems[i], w / 2, itemY + 2);
    }

    ctx.fillStyle = '#adb5bd';
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillText('Use [↑/↓] para navegar e [ENTER / ESPAÇO] para selecionar', w / 2, h - 50);

    ctx.restore();
  },

  renderLeaderboard(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#070b19';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.fillText('🏆 PLACAR DE LÍDERES ESPACIAIS', w / 2, 80);

    ctx.fillStyle = '#90e0ef';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText('Dados registrados e persistidos no Servidor (db.json)', w / 2, 110);

    const tableW = Math.min(650, w - 80);
    const tableX = w / 2 - tableW / 2;

    // Cabeçalho da tabela
    ctx.fillStyle = 'rgba(0, 180, 216, 0.25)';
    ctx.fillRect(tableX, 140, tableW, 35);
    ctx.strokeStyle = '#00b4d8';
    ctx.strokeRect(tableX, 140, tableW, 35);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Posição / Agência', tableX + 20, 162);
    ctx.textAlign = 'right';
    ctx.fillText('Pontuação', tableX + tableW - 20, 162);

    const list = this.leaderboardData && this.leaderboardData.length > 0 ? this.leaderboardData : [
      { player_name: 'Comandante Taquari (Você)', score: MissionManager.totalScore || 1500 }
    ];

    list.slice(0, 8).forEach((item, idx) => {
      const rowY = 185 + idx * 42;
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(tableX, rowY, tableW, 36);

      ctx.fillStyle = idx === 0 ? '#ffd700' : '#ffffff';
      ctx.font = '14px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${idx + 1}º  ${item.player_name || 'Líder Espacial'}`, tableX + 20, rowY + 23);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`${item.score} pts`, tableX + tableW - 20, rowY + 23);
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#adb5bd';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText('Pressione [ESC / ENTER] para voltar ao Menu', w / 2, h - 60);

    ctx.restore();
  },

  renderNasaTipBanner(ctx, w, h) {
    const tip = NasaTips.currentTip || NasaTips.tips[0];
    ctx.save();
    ctx.globalAlpha = NasaTips.alpha;

    const bannerW = Math.min(700, w - 60);
    const bannerH = 70;
    const bx = w / 2 - bannerW / 2;
    const by = h - 120;

    ctx.fillStyle = 'rgba(10, 20, 50, 0.95)';
    ctx.fillRect(bx, by, bannerW, bannerH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bannerW, bannerH);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🛰️ DICA DA NASA: ${tip.title}`, bx + 16, by + 24);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillText(tip.text, bx + 16, by + 48, bannerW - 32);

    ctx.restore();
  }
};

