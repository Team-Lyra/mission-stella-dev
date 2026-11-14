// ============================================
// game.js — Ciclo Central, Câmera, Máquina de Estados & Ambientes
// ============================================

const Game = {
  state: 'MENU', // MENU, ONBOARDING, PLAYING, SATELLITE_BUILD, LAUNCH, SPACE_COLLECT, MISSION_IMPACT, MISSION_FAILED, MISSION_OPS, LEADERBOARD, CREDITS, ENDGAME, DEV_END
  canvas: null,
  ctx: null,
  width: 800,
  height: 600,
  lastTime: 0,
  logoImg: null,

  camera: { x: 0, y: 0 },

  input: { up: false, down: false, left: false, right: false, interact: false },

  menuSelected: 0,
  menuItems: ['🚀 Iniciar Exploração', '🏆 Placar de Líderes', '🛍️ Lojinha Espacial', '🛰️ Curiosidades', '📜 Créditos & Fontes'],
  leaderboardData: [],

  // Onboarding state
  onboarding: { nameInput: '', cityInput: '', focusField: 'name', domShown: false },

  // Endgame fireworks
  fireworks: [],
  endgamePhase: 0, // 0=fireworks+report, 1=credits, 2=dev_end
  creditsScroll: 0,

  async init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();

    this.logoImg = new Image();
    this.logoImg.src = 'assets/logo.jpg';

    Lyra.init();
    await API.init();
    await MissionManager.init();
    GameMap.init();
    Player.init();
    NPCManager.init();
    UI.init(this.width, this.height);
    NasaTips.show();

    this.bindEvents();
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  },

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    if (UI.stars.length === 0) UI.init(this.width, this.height);
  },

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    window.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    window.addEventListener('pointermove', (e) => {
      if (this.state === 'LAUNCH' && LaunchMinigame.active) LaunchMinigame.handlePointerMove(e, this.canvas);
    });
    window.addEventListener('pointerup', (e) => {
      if (this.state === 'LAUNCH' && LaunchMinigame.active) LaunchMinigame.handlePointerUp(e, this.canvas);
    });
  },

  handlePointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (this.canvas.height / rect.height);

    // Curiosidades modal
    if (NasaTips.modalActive) { NasaTips.handleModalClick(mx, my); return; }

    // Lojinha
    if (SpaceShop.active) { SpaceShop.handleClick(mx, my, this.width, this.height); return; }

    // Diálogo
    if (UI.dialog.active) { UI.advanceDialog(); return; }

    // Cutscene Passo 1
    if (MissionManager.cutsceneActive) {
      MissionManager.closeMissionIntro();
      NasaTips.show({ title: "Problema Assumido!", text: "Agora entre no Centro Espacial STELA e use a Bancada de Projetos para montar sua nave!", icon: "🚀" });
      return;
    }

    // Menu principal
    if (this.state === 'MENU') {
      const startY = this.height * 0.52;
      for (let i = 0; i < this.menuItems.length; i++) {
        const iy = startY + i * 52;
        if (mx >= this.width / 2 - 190 && mx <= this.width / 2 + 190 && my >= iy - 24 && my <= iy + 24) {
          this.menuSelected = i; this.selectMenuItem(i); return;
        }
      }
      // Language switcher click
      const lx = this.width / 2; const ly2 = this.height - 55;
      if (mx >= lx - 150 && mx <= lx + 150 && my >= ly2 - 18 && my <= ly2 + 18) {
        I18n.toggleLang();
        this.updateMenuLabels();
        return;
      }
      return;
    }

    // Onboarding
    if (this.state === 'ONBOARDING') { this.handleOnboardingClick(mx, my); return; }

    // Bancada
    if (this.state === 'SATELLITE_BUILD') {
      const config = SatelliteBuilder.handlePointerDown(mx, my, this.width, this.height);
      if (config) { this.state = 'LAUNCH'; MissionManager.completeSatelliteAssembly(config); }
      return;
    }

    // Minigame
    if (this.state === 'LAUNCH' && LaunchMinigame.active) { LaunchMinigame.handlePointerDown(e, this.canvas); return; }

    // Passo 5
    if (this.state === 'SPACE_COLLECT') { this.state = MissionManager.missionFailed ? 'MISSION_FAILED' : 'MISSION_IMPACT'; return; }

    // Passo 6
    if (this.state === 'MISSION_IMPACT') { this.advanceAfterImpact(); return; }

    // Falha
    if (this.state === 'MISSION_FAILED') { this.state = 'PLAYING'; MissionManager.clearActiveMission(); return; }

    // Mapa de Operações
    if (this.state === 'MISSION_OPS') { this.state = 'PLAYING'; return; }

    // Leaderboard / Credits
    if (this.state === 'LEADERBOARD' || this.state === 'CREDITS') {
      this.state = GameMap.currentZone === 'SPACE_CENTER' ? 'PLAYING' : 'MENU'; return;
    }

    // Endgame
    if (this.state === 'ENDGAME') { this.advanceEndgame(); return; }

    // Dev end screen
    if (this.state === 'DEV_END') { this.state = 'MENU'; return; }
  },

  handleKeyDown(e) {
    const code = e.code;

    if (NasaTips.modalActive) {
      if (code === 'Escape') { NasaTips.closeModal(); return; }
      if (code === 'ArrowRight' || code === 'Enter' || code === 'Space') { NasaTips.nextModalFact(); return; }
      return;
    }

    if (SpaceShop.active) { SpaceShop.handleInput(code); return; }

    if (UI.dialog.active) {
      if (code === 'ArrowUp' || code === 'KeyW' || code === 'ArrowLeft' || code === 'KeyA') { UI.navigateDialog(-1); return; }
      if (code === 'ArrowDown' || code === 'KeyS' || code === 'ArrowRight' || code === 'KeyD') { UI.navigateDialog(1); return; }
      if (code === 'Space' || code === 'Enter' || code === 'KeyE') { UI.advanceDialog(); return; }
    }

    if (MissionManager.cutsceneActive) {
      if (code === 'Space' || code === 'Enter' || code === 'KeyE') {
        MissionManager.closeMissionIntro();
        NasaTips.show({ title: "Problema Assumido!", text: "Agora entre no Centro Espacial STELA e use a Bancada de Projetos para montar sua nave!", icon: "🚀" });
        return;
      }
    }

    if (this.state === 'MENU') {
      if (code === 'ArrowUp' || code === 'KeyW') {
        this.menuSelected = (this.menuSelected - 1 + this.menuItems.length) % this.menuItems.length;
        NasaAudio.click();
      } else if (code === 'ArrowDown' || code === 'KeyS') {
        this.menuSelected = (this.menuSelected + 1) % this.menuItems.length;
        NasaAudio.click();
      } else if (code === 'Enter' || code === 'Space') {
        this.selectMenuItem(this.menuSelected);
      } else if (code === 'KeyL') {
        I18n.toggleLang(); this.updateMenuLabels();
      }
    } else if (this.state === 'ONBOARDING') {
      this.handleOnboardingKey(e);
    } else if (this.state === 'PLAYING') {
      if (code === 'ArrowLeft' || code === 'KeyA') this.input.left = true;
      if (code === 'ArrowRight' || code === 'KeyD') this.input.right = true;
      if (code === 'ArrowUp' || code === 'KeyW') this.input.up = true;
      if (code === 'ArrowDown' || code === 'KeyS') this.input.down = true;
      if (code === 'KeyE' || code === 'Enter' || code === 'Space') this.tryInteract();
      if (code === 'Escape') this.state = 'MENU';
    } else if (this.state === 'SATELLITE_BUILD') {
      const config = SatelliteBuilder.handleInput(code);
      if (config) { this.state = 'LAUNCH'; MissionManager.completeSatelliteAssembly(config); }
    } else if (this.state === 'LAUNCH') {
      LaunchMinigame.handleInput(e);
    } else if (this.state === 'SPACE_COLLECT') {
      if (code === 'Space' || code === 'Enter') {
        this.state = MissionManager.missionFailed ? 'MISSION_FAILED' : 'MISSION_IMPACT';
      }
    } else if (this.state === 'MISSION_IMPACT') {
      if (code === 'Space' || code === 'Enter' || code === 'KeyE') this.advanceAfterImpact();
    } else if (this.state === 'MISSION_FAILED') {
      if (code === 'Space' || code === 'Enter' || code === 'Escape') { this.state = 'PLAYING'; MissionManager.clearActiveMission(); }
    } else if (this.state === 'MISSION_OPS') {
      if (code === 'Escape' || code === 'Enter' || code === 'Space') this.state = 'PLAYING';
    } else if (this.state === 'LEADERBOARD' || this.state === 'CREDITS') {
      if (code === 'Escape' || code === 'Enter' || code === 'Space') {
        this.state = GameMap.currentZone === 'SPACE_CENTER' ? 'PLAYING' : 'MENU';
      }
    } else if (this.state === 'ENDGAME') {
      if (code === 'Space' || code === 'Enter') this.advanceEndgame();
    } else if (this.state === 'DEV_END') {
      if (code === 'Space' || code === 'Enter' || code === 'Escape') this.state = 'MENU';
    }
  },

  handleKeyUp(e) {
    const code = e.code;
    if (code === 'ArrowLeft' || code === 'KeyA') this.input.left = false;
    if (code === 'ArrowRight' || code === 'KeyD') this.input.right = false;
    if (code === 'ArrowUp' || code === 'KeyW') this.input.up = false;
    if (code === 'ArrowDown' || code === 'KeyS') this.input.down = false;
  },

  updateMenuLabels() {
    this.menuItems = [
      I18n.t('menu_start'), I18n.t('menu_leaderboard'),
      I18n.t('menu_shop'), I18n.t('menu_curiosities'), I18n.t('menu_credits')
    ];
  },

  async selectMenuItem(index) {
    if (index === 0) {
      // Check onboarding
      const player = API.currentPlayer || {};
      if (!player.onboarded) {
        this.state = 'ONBOARDING';
        this.onboarding.nameInput = player.name === 'Líder Espacial' ? '' : (player.name || '');
        this.onboarding.cityInput = player.city && player.city !== 'Vale do Taquari' ? player.city : '';
        this.onboarding.focusField = 'name';
        this.showOnboardingDOM();
        return;
      }
      this.state = 'PLAYING';
      if (MissionManager.tutorialActive) {
        const name = player.name || 'Comandante';
        UI.showDialog('⭐ Lyra (Sua Guia)',
          `Oiii, ${name}! Eu sou a Lyra, sua guia estelar! Bem-vindo à Missão STELA no Vale do Taquari! Usamos satélites da NASA para resolver problemas reais aqui!`,
          '#ffd700', ['VAMOS NESSA! ⭐'], () => {
            UI.showDialog('⭐ Lyra (Sua Guia)',
              'Explore o mapa com [WASD], fale com os moradores [E] para descobrir os desafios e venha ao Centro Espacial para projetar sua nave!',
              '#ffd700');
            localStorage.setItem('missaoTaquari_tutorialSeen', 'true');
            MissionManager.tutorialActive = false;
          });
      }
    } else if (index === 1) {
      this.leaderboardData = await API.getLeaderboard();
      this.state = 'LEADERBOARD';
    } else if (index === 2) {
      SpaceShop.open();
    } else if (index === 3) {
      NasaTips.openModal();
    } else if (index === 4) {
      this.state = 'CREDITS';
    }
  },

  // ============================================
  // ONBOARDING DOM OVERLAY
  // ============================================
  showOnboardingDOM() {
    if (document.getElementById('onboardingOverlay')) return;
    this.onboarding.domShown = true;
    const overlay = document.createElement('div');
    overlay.id = 'onboardingOverlay';
    overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(6,10,30,0.97);display:flex;align-items:center;justify-content:center;z-index:9999;flex-direction:column;font-family:"Segoe UI",sans-serif;`;

    overlay.innerHTML = `
      <div style="background:rgba(15,23,42,0.98);border:3px solid #ffd700;border-radius:20px;padding:48px 56px;max-width:560px;width:90%;text-align:center;box-shadow:0 0 40px rgba(255,215,0,0.3);">
        <div style="font-size:52px;margin-bottom:12px;">⭐</div>
        <h1 style="color:#ffd700;font-size:26px;margin:0 0 8px;">IDENTIFICAÇÃO DO EXPLORADOR</h1>
        <p style="color:#90e0ef;font-size:16px;margin:0 0 32px;">A Lyra quer te conhecer antes da decolagem!</p>
        <label style="color:#adb5bd;font-size:15px;display:block;text-align:left;margin-bottom:6px;">Seu Nome de Comandante:</label>
        <input id="ob_name" type="text" placeholder="Ex: Alex" maxlength="24" style="width:100%;padding:14px 16px;font-size:18px;border-radius:10px;border:2px solid #00b4d8;background:#0a1628;color:#fff;margin-bottom:20px;box-sizing:border-box;outline:none;" value="${this.onboarding.nameInput}">
        <label style="color:#adb5bd;font-size:15px;display:block;text-align:left;margin-bottom:6px;">Sua Cidade:</label>
        <input id="ob_city" type="text" placeholder="Ex: Estrela, Lajeado..." maxlength="32" style="width:100%;padding:14px 16px;font-size:18px;border-radius:10px;border:2px solid #00b4d8;background:#0a1628;color:#fff;margin-bottom:28px;box-sizing:border-box;outline:none;" value="${this.onboarding.cityInput}">
        <button id="ob_btn" style="width:100%;padding:16px;font-size:19px;font-weight:bold;border:none;border-radius:12px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;cursor:pointer;letter-spacing:1px;">DECOLAR COM A LYRA! 🚀</button>
        <p id="ob_err" style="color:#ef4444;font-size:14px;margin-top:12px;min-height:20px;"></p>
      </div>`;

    document.body.appendChild(overlay);
    setTimeout(() => { const n = document.getElementById('ob_name'); if (n) n.focus(); }, 100);

    document.getElementById('ob_btn').addEventListener('click', () => this.submitOnboarding());
    document.getElementById('ob_name').addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('ob_city').focus(); });
    document.getElementById('ob_city').addEventListener('keydown', (e) => { if (e.key === 'Enter') this.submitOnboarding(); });
  },

  submitOnboarding() {
    const name = (document.getElementById('ob_name').value || '').trim();
    const city = (document.getElementById('ob_city').value || '').trim();
    const err = document.getElementById('ob_err');
    if (!name) { if (err) err.textContent = 'Digite seu nome de Comandante!'; return; }
    if (!city) { if (err) err.textContent = 'Digite sua cidade!'; return; }

    API.setOnboarding(name, city);
    const overlay = document.getElementById('onboardingOverlay');
    if (overlay) overlay.remove();
    this.onboarding.domShown = false;

    this.state = 'PLAYING';
    if (MissionManager.tutorialActive) {
      UI.showDialog('⭐ Lyra (Sua Guia)',
        `Oiii, ${name}! Eu sou a Lyra, sua guia estelar! Que bom que você está aqui em ${city}! Bem-vindo à Missão STELA no Vale do Taquari!`,
        '#ffd700', ['VAMOS NESSA! ⭐'], () => {
          UI.showDialog('⭐ Lyra (Sua Guia)',
            'Explore o mapa com [WASD], fale com os moradores [E] para descobrir os desafios e venha ao Centro Espacial para projetar sua nave!',
            '#ffd700');
          localStorage.setItem('missaoTaquari_tutorialSeen', 'true');
          MissionManager.tutorialActive = false;
        });
    }
  },

  handleOnboardingClick(mx, my) { /* handled via DOM */ },
  handleOnboardingKey(e) {
    if (e.code === 'Escape') {
      const overlay = document.getElementById('onboardingOverlay');
      if (overlay) overlay.remove();
      this.state = 'MENU';
    }
  },

  // ============================================
  // INTERAÇÕES NO MAPA
  // ============================================
  tryInteract() {
    if (GameMap.currentZone === 'OUTDOOR') {
      const px = Player.x + 12;
      const py = Player.y + 12;

      const doorCenterX = 11.5 * GameMap.tileSize;
      const doorCenterY = 3.6 * GameMap.tileSize;
      const distToDoor = Math.hypot(doorCenterX - px, doorCenterY - py);
      if (distToDoor < 95 || (Player.x >= 9.5 * 48 && Player.x <= 13.5 * 48 && Player.y >= 2.2 * 48 && Player.y <= 4.8 * 48)) {
        GameMap.switchZone('SPACE_CENTER');
        return;
      }

      const nearby = NPCManager.getNearbyNPC(Player.x, Player.y);
      if (nearby) {
        if (nearby.id === 'recepcionista') {
          UI.showDialog(nearby.name,
            'Olá, Comandante! A porta de entrada do Centro Espacial STELA está logo aqui ao lado. Quer entrar na Sala de Comando?',
            nearby.color, ['🚀 ENTRAR NO CENTRO ESPACIAL', 'CONTINUAR NO VALE'],
            (choice) => { if (choice === 0) GameMap.switchZone('SPACE_CENTER'); });
          return;
        }
        if (MissionManager.hasActiveMission()) {
          const activeM = MissionManager.getCurrent();
          if (activeM.id !== nearby.missionId) {
            UI.showDialog('⭐ Lyra', `Comandante, você já está em "${activeM.title}"! Entre no Centro Espacial para projetar o satélite!`, '#ffd700');
          } else {
            UI.showDialog(nearby.name, `Obrigado por nos ajudar, Comandante! Vá ao Centro Espacial para projetar seu satélite!`, nearby.color);
          }
          return;
        }
        // Checa se missão já foi concluída
        const mission = MissionManager.missions.find(m => m.id === nearby.missionId);
        if (mission) {
          const mStatus = API.getMissionStatus(mission.id);
          if (mStatus) {
            const statusLabel = mStatus === 'SUCCESS' ? '✅ já concluída com sucesso!' : '❌ encerrada (missão falhou).';
            UI.showDialog('⭐ Lyra', `Esta operação já foi ${statusLabel} Cada missão tem 1 tentativa. Vá ao Centro Espacial para ver o painel de operações!`, '#ffd700');
            return;
          }
          MissionManager.startMissionIntro(mission);
        }
        return;
      }
    } else if (GameMap.currentZone === 'SPACE_CENTER') {
      const px = Player.x + 12;
      const py = Player.y + 12;

      const eSt = GameMap.stations.exit;
      if (Math.hypot((eSt.x + eSt.w / 2) - px, (eSt.y + eSt.h / 2) - py) < 80 || Player.y >= 10.0 * 48) {
        GameMap.switchZone('OUTDOOR'); return;
      }

      const wSt = GameMap.stations.workshop;
      if (Math.hypot((wSt.x + wSt.w / 2) - px, (wSt.y + wSt.h / 2) - py) < 80) {
        if (!MissionManager.hasActiveMission()) {
          UI.showDialog('⭐ Lyra', 'Oii! A bancada está pronta, mas precisamos aceitar um desafio lá fora primeiro! Fale com a Dona Iracema, Capitão Rodrigo, Professora Mariana ou Cacique Karaí!', '#ffd700');
          return;
        }
        this.state = 'SATELLITE_BUILD';
        MissionManager.startSatelliteAssembly();
        return;
      }

      const sSt = GameMap.stations.shop;
      if (Math.hypot((sSt.x + sSt.w / 2) - px, (sSt.y + sSt.h / 2) - py) < 80) {
        SpaceShop.open(); return;
      }

      const rSt = GameMap.stations.ranking;
      if (Math.hypot((rSt.x + rSt.w / 2) - px, (rSt.y + rSt.h / 2) - py) < 90) {
        this.selectMenuItem(1); return;
      }

      // Mapa de Operações (terminal padrão T no centro)
      const opX = 9 * 48; const opY = 6 * 48;
      if (Math.hypot(opX - px, opY - py) < 90) {
        this.state = 'MISSION_OPS'; return;
      }

      const nearbyInternal = NPCManager.getNearbyNPC(Player.x, Player.y);
      if (nearbyInternal) {
        UI.showDialog(nearbyInternal.name, nearbyInternal.dialog, nearbyInternal.color);
        return;
      }
    }
  },

  // ============================================
  // ADVANCE AFTER IMPACT (checks all missions done)
  // ============================================
  advanceAfterImpact() {
    const allDone = MissionManager.missions.length > 0 &&
      MissionManager.missions.every(m => !!API.getMissionStatus(m.id));

    if (allDone) {
      this.state = 'ENDGAME';
      this.endgamePhase = 0;
      this.fireworks = [];
      this.creditsScroll = 0;
      this.spawnFireworks();
    } else {
      MissionManager.advanceToNextMission();
      this.state = 'PLAYING';
    }
  },

  // ============================================
  // FIREWORKS
  // ============================================
  spawnFireworks() {
    for (let i = 0; i < 80; i++) {
      this.fireworks.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.6,
        vx: (Math.random() - 0.5) * 180,
        vy: (Math.random() - 0.5) * 180,
        life: Math.random() * 1.8 + 0.5,
        maxLife: 2.3,
        color: `hsl(${Math.random() * 360}, 100%, 70%)`,
        size: Math.random() * 4 + 2
      });
    }
    setTimeout(() => this.spawnFireworks(), 2200);
  },

  updateFireworks(dt) {
    this.fireworks = this.fireworks.filter(p => p.life > 0);
    for (const p of this.fireworks) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt;
      p.life -= dt;
    }
  },

  renderFireworks(ctx) {
    for (const p of this.fireworks) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  advanceEndgame() {
    if (this.endgamePhase === 0) {
      this.endgamePhase = 1;
    } else if (this.endgamePhase === 1) {
      this.endgamePhase = 2;
    } else {
      this.state = 'MENU';
      this.endgamePhase = 0;
    }
  },

  // ============================================
  // GAME LOOP
  // ============================================
  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;
    this.update(dt);
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  },

  update(dt) {
    Lyra.update(dt);
    NasaTips.update(dt);
    UI.update(dt);

    if (this.state === 'PLAYING') {
      GameMap.update(dt);
      Player.update(dt, this.input, GameMap);
      NPCManager.update(dt);

      if (GameMap.currentZone === 'OUTDOOR') {
        const doorCenterX = 11.5 * GameMap.tileSize;
        const doorCenterY = 3.6 * GameMap.tileSize;
        const distToDoor = Math.hypot(doorCenterX - (Player.x + 12), doorCenterY - (Player.y + 12));
        if (distToDoor < 48 || (Player.x >= 10.0 * 48 && Player.x <= 13.0 * 48 && Player.y <= 3.7 * 48 && Player.y >= 2.0 * 48)) {
          GameMap.switchZone('SPACE_CENTER');
        }
      } else if (GameMap.currentZone === 'SPACE_CENTER') {
        if (Player.y >= 10.5 * GameMap.tileSize && Player.x >= 6.8 * GameMap.tileSize && Player.x <= 11.2 * GameMap.tileSize) {
          GameMap.switchZone('OUTDOOR');
        }
      }

      const mapW = GameMap.cols * GameMap.tileSize;
      const mapH = GameMap.rows * GameMap.tileSize;
      let targetCamX = Player.x + Player.w / 2 - this.width / 2;
      let targetCamY = Player.y + Player.h / 2 - this.height / 2;

      if (mapW <= this.width) { targetCamX = (mapW - this.width) / 2; }
      else { targetCamX = Math.max(0, Math.min(mapW - this.width, targetCamX)); }
      if (mapH <= this.height) { targetCamY = (mapH - this.height) / 2; }
      else { targetCamY = Math.max(0, Math.min(mapH - this.height, targetCamY)); }

      this.camera.x += (targetCamX - this.camera.x) * 0.15;
      this.camera.y += (targetCamY - this.camera.y) * 0.15;
    } else if (this.state === 'LAUNCH') {
      LaunchMinigame.update(dt);
      if (!LaunchMinigame.active && LaunchMinigame.stage === 3) {
        this.state = 'SPACE_COLLECT';
      }
    } else if (this.state === 'ENDGAME') {
      this.updateFireworks(dt);
    }
  },

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);

    if (this.state === 'MENU') {
      this.renderMenu(ctx, w, h);
    } else if (this.state === 'ONBOARDING') {
      // DOM overlay handles it; just draw dark background
      ctx.fillStyle = '#060a1c';
      ctx.fillRect(0, 0, w, h);
      UI.renderStars(ctx, w, h);
    } else if (this.state === 'PLAYING') {
      GameMap.render(ctx, this.camera.x, this.camera.y, w, h);
      const nearby = NPCManager.getNearbyNPC(Player.x, Player.y);
      NPCManager.render(ctx, this.camera.x, this.camera.y, nearby);
      Player.render(ctx, this.camera.x, this.camera.y);
      this.renderHUD(ctx, w, h);
      if (MissionManager.cutsceneActive) MissionManager.renderCutscene(ctx, w, h);
    } else if (this.state === 'SATELLITE_BUILD') {
      SatelliteBuilder.render(ctx, w, h);
    } else if (this.state === 'LAUNCH') {
      LaunchMinigame.render(ctx, w, h);
    } else if (this.state === 'SPACE_COLLECT') {
      MissionManager.renderSpaceCollect(ctx, w, h);
    } else if (this.state === 'MISSION_IMPACT') {
      MissionManager.renderImpactScreen(ctx, w, h);
    } else if (this.state === 'MISSION_FAILED') {
      MissionManager.renderFailScreen(ctx, w, h);
    } else if (this.state === 'MISSION_OPS') {
      this.renderMissionOpsPanel(ctx, w, h);
    } else if (this.state === 'LEADERBOARD') {
      this.renderLeaderboard(ctx, w, h);
    } else if (this.state === 'CREDITS') {
      MissionManager.renderCreditsScreen(ctx, w, h);
    } else if (this.state === 'ENDGAME') {
      this.renderEndgame(ctx, w, h);
    } else if (this.state === 'DEV_END') {
      this.renderDevEnd(ctx, w, h);
    }

    // Overlays
    if (NasaTips.modalActive) NasaTips.renderModal(ctx, w, h);
    if (SpaceShop.active) SpaceShop.render(ctx, w, h);
    if (UI.dialog.active) UI.renderDialog(ctx, w, h);
    if (this.state === 'PLAYING' && (NasaTips.showing || NasaTips.alpha > 0)) {
      NasaTips.render(ctx, w, h);
    }
  },

  // ============================================
  // HUD
  // ============================================
  renderHUD(ctx, w, h) {
    ctx.save();
    const barH = 50;
    ctx.fillStyle = 'rgba(10, 16, 42, 0.92)';
    ctx.fillRect(15, 12, w - 30, barH);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 12, w - 30, barH);

    const player = API.currentPlayer || {};
    const curLevel = player.level || 1;
    const coins = player.coins !== undefined ? player.coins : 500;
    const score = MissionManager.totalScore || 0;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    const curM = MissionManager.getCurrent();
    const missionLabel = curM ? `🚀 ${curM.title}` : (GameMap.currentZone === 'SPACE_CENTER' ? '🔬 CENTRO ESPACIAL STELA' : '🌍 VALE DO TAQUARI');
    ctx.fillText(missionLabel, 30, 34);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillText(Lyra.getRankTitle(curLevel), 30, 52);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(`🪙 ${coins} Space Coins   ⭐ ${score} pts`, w - 160, 42);

    ctx.fillStyle = API.online ? '#22c55e' : '#ffd166';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillText(API.online ? '🟢 Conectado' : '🟡 Local', w - 35, 42);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(10, 16, 42, 0.85)';
    ctx.fillRect(w / 2 - 320, h - 38, 640, 28);
    ctx.strokeStyle = 'rgba(0, 180, 216, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(w / 2 - 320, h - 38, 640, 28);
    ctx.fillStyle = '#e0e7ff';
    ctx.font = '13px "Segoe UI", sans-serif';
    if (GameMap.currentZone === 'SPACE_CENTER') {
      ctx.fillText('[E] Bancada p/ Montar • [E] Lojinha • [E] Terminal de Operações • [E] Saída', w / 2, h - 20);
    } else {
      ctx.fillText('Ande com [WASD] • Interaja com moradores e portas usando [E / ESPAÇO]', w / 2, h - 20);
    }
    ctx.restore();
  },

  // ============================================
  // MENU PRINCIPAL
  // ============================================
  renderMenu(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#060a1c';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    const logoSize = Math.min(130, h * 0.22);
    const logoY = h * 0.16;

    if (this.logoImg && this.logoImg.complete && this.logoImg.naturalWidth > 0) {
      ctx.save();
      ctx.shadowColor = '#00b4d8'; ctx.shadowBlur = 25;
      ctx.drawImage(this.logoImg, w / 2 - logoSize / 2, logoY - logoSize / 2, logoSize, logoSize);
      ctx.restore();
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3;
      ctx.strokeRect(w / 2 - logoSize / 2, logoY - logoSize / 2, logoSize, logoSize);
    } else {
      Lyra.render(ctx, w / 2, logoY, 45, 'excited', '');
    }

    Lyra.render(ctx, w / 2 + logoSize * 0.9, logoY, 32, 'happy', '');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 38px "Segoe UI", sans-serif';
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 18;
    ctx.fillText('🚀 MISSÃO STELA', w / 2, logoY + logoSize / 2 + 35);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#90e0ef';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText('Exploração & Simulação Espacial no Vale do Taquari • Padrão NASA', w / 2, logoY + logoSize / 2 + 65);

    const startY = h * 0.52;
    for (let i = 0; i < this.menuItems.length; i++) {
      const isSel = i === this.menuSelected;
      const itemY = startY + i * 52;
      ctx.fillStyle = isSel ? 'rgba(0, 180, 216, 0.35)' : 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(w / 2 - 190, itemY - 24, 380, 44);
      ctx.strokeStyle = isSel ? '#ffd700' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isSel ? 2.5 : 1;
      ctx.strokeRect(w / 2 - 190, itemY - 24, 380, 44);
      ctx.fillStyle = isSel ? '#ffd700' : '#ffffff';
      ctx.font = isSel ? 'bold 18px "Segoe UI", sans-serif' : '17px "Segoe UI", sans-serif';
      ctx.fillText((isSel ? '▸ ' : '') + this.menuItems[i], w / 2, itemY + 7);
    }

    // Language switcher
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(w / 2 - 150, h - 55 - 18, 300, 36);
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1;
    ctx.strokeRect(w / 2 - 150, h - 55 - 18, 300, 36);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    const langLabel = I18n.lang === 'pt-BR' ? '🌐 Idioma: Português  [clique p/ EN]' : '🌐 Language: English  [click for PT-BR]';
    ctx.fillText(langLabel, w / 2, h - 55);

    ctx.fillStyle = '#6b7280';
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillText('Clique nas opções ou use [↑/↓] e [ENTER]', w / 2, h - 18);
    ctx.restore();
  },

  // ============================================
  // PAINEL DE OPERAÇÕES (Mapa de Missões no Centro Espacial)
  // ============================================
  renderMissionOpsPanel(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#060a1c';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    Lyra.render(ctx, w / 2, 55, 34, 'excited', '');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 26px "Segoe UI", sans-serif';
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 10;
    ctx.fillText('🗺️ PAINEL DE OPERAÇÕES ESPACIAIS', w / 2, 110);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#90e0ef';
    ctx.font = '15px "Segoe UI", sans-serif';
    ctx.fillText('Status das operações do Vale do Taquari  •  Regra: 1 tentativa por missão', w / 2, 138);

    const missions = MissionManager.missions || [];
    const panelW = Math.min(720, w - 60);
    const panelX = w / 2 - panelW / 2;

    for (let i = 0; i < missions.length; i++) {
      const m = missions[i];
      const status = API.getMissionStatus(m.id);
      const rowY = 170 + i * 90;

      const bgColor = status === 'SUCCESS' ? 'rgba(34,197,94,0.15)'
        : status === 'FAILED' ? 'rgba(239,68,68,0.15)'
        : 'rgba(0,180,216,0.08)';
      ctx.fillStyle = bgColor;
      ctx.fillRect(panelX, rowY, panelW, 78);
      ctx.strokeStyle = status === 'SUCCESS' ? '#22c55e' : status === 'FAILED' ? '#ef4444' : '#00b4d8';
      ctx.lineWidth = 2;
      ctx.strokeRect(panelX, rowY, panelW, 78);

      // Difficulty badge
      const diffIcon = m.difficulty === 1 ? '🟢' : m.difficulty === 2 ? '🟡' : m.difficulty === 3 ? '🟠' : '🔴';
      const diffLabel = m.difficulty === 1 ? 'Iniciante' : m.difficulty === 2 ? 'Moderada' : m.difficulty === 3 ? 'Avançada' : 'Especialista';

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 17px "Segoe UI", sans-serif';
      ctx.fillText(`${i + 1}. ${m.title}`, panelX + 18, rowY + 28);

      ctx.fillStyle = '#adb5bd';
      ctx.font = '14px "Segoe UI", sans-serif';
      ctx.fillText(`${diffIcon} ${diffLabel}  •  NPC: ${m.npc_name}`, panelX + 18, rowY + 52);

      // Status badge (right side)
      const statusText = status === 'SUCCESS' ? '✅ CONCLUÍDA COM SUCESSO'
        : status === 'FAILED' ? '❌ FALHOU — ENCERRADA'
        : '🚀 DISPONÍVEL';
      const statusColor = status === 'SUCCESS' ? '#22c55e' : status === 'FAILED' ? '#ef4444' : '#38bdf8';
      ctx.textAlign = 'right';
      ctx.fillStyle = statusColor;
      ctx.font = 'bold 14px "Segoe UI", sans-serif';
      ctx.fillText(statusText, panelX + panelW - 18, rowY + 46);
    }

    // Btn fechar
    const btnW = 260; const btnH = 48;
    const bx = w / 2 - btnW / 2;
    const by = h - 70;
    ctx.fillStyle = '#e63946';
    ctx.fillRect(bx, by, btnW, btnH);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, btnW, btnH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FECHAR [ESC / ENTER]', bx + btnW / 2, by + 31);

    ctx.restore();
  },

  // ============================================
  // ENDGAME (fogos + relatório + créditos + dev end)
  // ============================================
  renderEndgame(ctx, w, h) {
    if (this.endgamePhase === 0) {
      this.renderEndgameReport(ctx, w, h);
    } else if (this.endgamePhase === 1) {
      this.renderEndgameCredits(ctx, w, h);
    } else {
      this.renderDevEnd(ctx, w, h);
    }
  },

  renderEndgameReport(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);
    this.renderFireworks(ctx);

    const player = API.currentPlayer || {};
    const name = player.name || 'Comandante';
    const city = player.city || 'Vale do Taquari';

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 20;
    ctx.fillText(`🎆 PARABÉNS, ${name.toUpperCase()}! 🎆`, w / 2, 75);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#90e0ef';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillText('Todas as operações do Vale do Taquari foram concluídas!', w / 2, 112);

    // Impacto acumulado (cards de métricas)
    const metrics = [
      { icon: '🌾', label: '78% da Safra Salva', color: '#22c55e' },
      { icon: '👥', label: '+50.000 Vidas Protegidas', color: '#38bdf8' },
      { icon: '📡', label: '47 Comunidades Conectadas', color: '#c084fc' },
      { icon: '🌳', label: '1.200 ha de Mata Preservados', color: '#4ade80' }
    ];
    const cardW = Math.min(170, (w - 100) / 4);
    const totalCardsW = metrics.length * cardW + (metrics.length - 1) * 15;
    const cardStartX = w / 2 - totalCardsW / 2;

    for (let i = 0; i < metrics.length; i++) {
      const m = metrics[i];
      const cx = cardStartX + i * (cardW + 15);
      ctx.fillStyle = 'rgba(15,23,42,0.9)';
      ctx.fillRect(cx, 140, cardW, 110);
      ctx.strokeStyle = m.color; ctx.lineWidth = 2.5;
      ctx.strokeRect(cx, 140, cardW, 110);
      ctx.font = '36px "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(m.icon, cx + cardW / 2, 185);
      ctx.fillStyle = m.color;
      ctx.font = 'bold 13px "Segoe UI", sans-serif';
      // wrap label
      const words = m.label.split(' ');
      let line = ''; let ly = 211;
      for (let j = 0; j < words.length; j++) {
        const test = line + words[j] + ' ';
        if (ctx.measureText(test).width > cardW - 10 && j > 0) {
          ctx.fillText(line.trim(), cx + cardW / 2, ly); line = words[j] + ' '; ly += 18;
        } else { line = test; }
      }
      ctx.fillText(line.trim(), cx + cardW / 2, ly);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText(`❤️ Mais de 50.000 vidas e famílias protegidas em ${city} e região!`, w / 2, 285);
    ctx.fillStyle = '#86efac';
    ctx.font = '17px "Segoe UI", sans-serif';
    ctx.fillText('🌱 1.200 hectares de floresta preservados e 78% da produção rural protegida.', w / 2, 318);

    // Pontuação total
    const total = MissionManager.totalScore || 0;
    ctx.fillStyle = 'rgba(255,215,0,0.15)';
    ctx.fillRect(w / 2 - 200, 345, 400, 60);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 200, 345, 400, 60);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText(`⭐ PONTUAÇÃO TOTAL: ${total} pts`, w / 2, 383);

    // Botão
    const btnW = 340; const btnH = 52;
    const bx = w / 2 - btnW / 2;
    const by = h - 80;
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(bx, by, btnW, btnH);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2.5;
    ctx.strokeRect(bx, by, btnW, btnH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillText('VER CRÉDITOS [ENTER] ➔', bx + btnW / 2, by + 33);

    ctx.restore();
  },

  renderEndgameCredits(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    Lyra.render(ctx, w / 2, 60, 40, 'excited', '');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 30px "Segoe UI", sans-serif';
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 12;
    ctx.fillText('📜 CRÉDITOS OFICIAIS DO PROJETO', w / 2, 125);
    ctx.shadowBlur = 0;

    const boxW = Math.min(680, w - 80);
    const boxX = w / 2 - boxW / 2;

    ctx.fillStyle = 'rgba(15,23,42,0.95)';
    ctx.fillRect(boxX, 148, boxW, 320);
    ctx.strokeStyle = '#00b4d8'; ctx.lineWidth = 2.5;
    ctx.strokeRect(boxX, 148, boxW, 320);

    const lines = [
      { text: 'Desenvolvedoras:', color: '#38bdf8', font: 'bold 17px "Segoe UI", sans-serif', y: 185 },
      { text: '• Alexandra König Padilha', color: '#ffffff', font: '16px "Segoe UI", sans-serif', y: 215 },
      { text: '• Carine Teixeira Da Silva', color: '#ffffff', font: '16px "Segoe UI", sans-serif', y: 243 },
      { text: '• Isabelli Sehn', color: '#ffffff', font: '16px "Segoe UI", sans-serif', y: 271 },
      { text: '• Júlia Agosti', color: '#ffffff', font: '16px "Segoe UI", sans-serif', y: 299 },
      { text: '━━━━━━━━━━━━━━━━━━━━━━━━', color: '#374151', font: '14px "Segoe UI", sans-serif', y: 325 },
      { text: 'Projeto desenvolvido para o NASA Space Apps Challenge', color: '#ffd700', font: 'bold 15px "Segoe UI", sans-serif', y: 355 },
      { text: '━━━━━━━━━━━━━━━━━━━━━━━━', color: '#374151', font: '14px "Segoe UI", sans-serif', y: 375 },
      { text: 'Agradecimento especial à nossa primeira tester: Lulu 💖', color: '#f9a8d4', font: 'bold 15px "Segoe UI", sans-serif', y: 405 },
      { text: 'Fontes: Meteomatics Weather API & NASA Worldview', color: '#6b7280', font: '13px "Segoe UI", sans-serif', y: 435 }
    ];

    for (const l of lines) {
      ctx.fillStyle = l.color;
      ctx.font = l.font;
      ctx.fillText(l.text, w / 2, l.y);
    }

    // Botão
    const btnW = 300; const btnH = 50;
    const bx = w / 2 - btnW / 2;
    const by = h - 75;
    ctx.fillStyle = '#e63946';
    ctx.fillRect(bx, by, btnW, btnH);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, btnW, btnH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px "Segoe UI", sans-serif';
    ctx.fillText('CONTINUAR [ENTER] ➔', bx + btnW / 2, by + 32);

    ctx.restore();
  },

  renderDevEnd(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    Lyra.render(ctx, w / 2, h / 2 - 120, 55, 'happy', '');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 20;
    ctx.fillText('Missão STELA', w / 2, h / 2 - 30);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#90e0ef';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText('Em desenvolvimento 🚀', w / 2, h / 2 + 15);

    ctx.fillStyle = '#6b7280';
    ctx.font = '15px "Segoe UI", sans-serif';
    ctx.fillText('Obrigado por jogar e cuidar do nosso planeta!', w / 2, h / 2 + 55);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText('Pressione qualquer tecla para voltar ao menu', w / 2, h - 50);

    ctx.restore();
  },

  // ============================================
  // LEADERBOARD
  // ============================================
  renderLeaderboard(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = '#060a1c';
    ctx.fillRect(0, 0, w, h);
    UI.renderStars(ctx, w, h);

    Lyra.render(ctx, w / 2, 55, 34, 'excited', '');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 30px "Segoe UI", sans-serif';
    ctx.fillText('🏆 TELÃO DE RANKING ESPACIAL', w / 2, 115);

    ctx.fillStyle = '#90e0ef';
    ctx.font = '15px "Segoe UI", sans-serif';
    ctx.fillText('Astronautas e Líderes em Destaque no Vale do Taquari', w / 2, 142);

    const tableW = Math.min(680, w - 60);
    const tableX = w / 2 - tableW / 2;

    ctx.fillStyle = 'rgba(0, 180, 216, 0.3)';
    ctx.fillRect(tableX, 165, tableW, 36);
    ctx.strokeStyle = '#00b4d8';
    ctx.strokeRect(tableX, 165, tableW, 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Posição / Comandante', tableX + 20, 189);
    ctx.textAlign = 'right';
    ctx.fillText('Pontuação', tableX + tableW - 20, 189);

    const list = this.leaderboardData && this.leaderboardData.length > 0 ? this.leaderboardData : [
      { player_name: 'Comandante Taquari (Você)', score: MissionManager.totalScore || 1500 }
    ];

    list.slice(0, 7).forEach((item, idx) => {
      const rowY = 208 + idx * 42;
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(tableX, rowY, tableW, 36);
      ctx.fillStyle = idx === 0 ? '#ffd700' : '#ffffff';
      ctx.font = '15px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${idx + 1}º  ${item.player_name || 'Líder Espacial'}`, tableX + 20, rowY + 24);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`${item.score} pts`, tableX + tableW - 20, rowY + 24);
    });

    const btnW = 240; const btnH = 46;
    const bx = w / 2 - btnW / 2; const by = h - 65;
    ctx.fillStyle = '#e63946';
    ctx.fillRect(bx, by, btnW, btnH);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, btnW, btnH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VOLTAR [ESC]', bx + btnW / 2, by + 29);

    ctx.restore();
  }
};
