// ============================================
// api.js — Comunicação com backend (com suporte a PostgreSQL e fallback offline)
// ============================================

const API = {
  baseUrl: '/api',
  online: false,
  currentPlayer: null,

  /** Tenta conectar ao backend */
  async init() {
    try {
      const res = await fetch(this.baseUrl + '/health', { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        this.online = true;
        console.log('🛰️ [API] Conectado ao servidor Missão Taquari!');
      } else {
        this.online = false;
      }
    } catch {
      this.online = false;
      console.log('⚠️ [API] Modo offline ativado');
    }

    // Inicializa ou carrega jogador
    await this.initPlayer();
  },

  /** Cria ou recupera jogador no banco / local */
  async initPlayer(name) {
    const savedId = localStorage.getItem('missaoTaquari_playerId');
    const playerName = name || localStorage.getItem('missaoTaquari_playerName') || 'Líder Espacial';

    if (this.online && savedId) {
      try {
        const res = await fetch(`${this.baseUrl}/players/${savedId}`);
        if (res.ok) {
          this.currentPlayer = await res.json();
          return this.currentPlayer;
        }
      } catch (e) {
        console.warn('Erro ao carregar jogador existente:', e);
      }
    }

    if (this.online) {
      try {
        const res = await fetch(`${this.baseUrl}/players`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: playerName })
        });
        if (res.ok) {
          this.currentPlayer = await res.json();
          localStorage.setItem('missaoTaquari_playerId', this.currentPlayer.id);
          localStorage.setItem('missaoTaquari_playerName', this.currentPlayer.name);
          return this.currentPlayer;
        }
      } catch (e) {
        console.warn('Erro ao criar jogador no servidor:', e);
      }
    }

    // Fallback local
    this.currentPlayer = {
      id: parseInt(savedId || '1'),
      name: playerName,
      score: parseInt(localStorage.getItem('missaoTaquari_score') || '0'),
      current_mission: parseInt(localStorage.getItem('missaoTaquari_mission') || '1'),
      satellite_config: {}
    };
    return this.currentPlayer;
  },

  /** Salva progresso do jogo no PostgreSQL / backend */
  async saveGame(data) {
    if (this.currentPlayer) {
      if (data.score !== undefined) this.currentPlayer.score = data.score;
      if (data.current_mission !== undefined) this.currentPlayer.current_mission = data.current_mission;
      if (data.satellite_config !== undefined) this.currentPlayer.satellite_config = data.satellite_config;
    }

    localStorage.setItem('missaoTaquari_save', JSON.stringify(data));
    localStorage.setItem('missaoTaquari_score', data.score || 0);
    localStorage.setItem('missaoTaquari_mission', data.current_mission || 1);

    if (this.online && this.currentPlayer && this.currentPlayer.id) {
      try {
        await fetch(`${this.baseUrl}/players/${this.currentPlayer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: data.score,
            current_mission: data.current_mission,
            satellite_config: data.satellite_config
          })
        });
      } catch (e) {
        console.warn('[API] Erro ao sincronizar save no servidor:', e);
      }
    }
  },

  /** Envia pontuação */
  async submitScore(score, missionId = 1) {
    const curHigh = this.getHighScore();
    if (score > curHigh) {
      localStorage.setItem('missaoTaquari_highscore', score);
    }

    if (this.online && this.currentPlayer) {
      try {
        await fetch(`${this.baseUrl}/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_id: this.currentPlayer.id,
            mission_id: missionId,
            score: score
          })
        });
      } catch (e) {
        console.warn('[API] Erro ao enviar score:', e);
      }
    }
  },

  /** Busca ranking */
  async getLeaderboard() {
    if (this.online) {
      try {
        const res = await fetch(`${this.baseUrl}/scores`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('[API] Falha ao obter leaderboard:', e);
      }
    }
    return [
      { player_name: this.currentPlayer ? this.currentPlayer.name : 'Você', score: this.getHighScore() }
    ];
  },

  /** Busca missões do PostgreSQL / servidor */
  async getMissions() {
    if (this.online) {
      try {
        const res = await fetch(`${this.baseUrl}/missions`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch (e) {
        console.warn('[API] Falha ao carregar missões do servidor:', e);
      }
    }

    // Missões padrão com base nas especificações do Vale do Taquari
    return [
      {
        id: 1,
        title: "Safra em Perigo: Monitoramento Agrícola",
        problem_type: "agricultura",
        difficulty: 1,
        npc_name: "Dona Iracema",
        npc_dialog: "Olá, jovem líder! Sou a Dona Iracema, agricultora aqui em Estrela. Uma praga misteriosa está atacando as plantações de milho e soja! Se a gente conseguisse analisar a lavoura do espaço com satélites, podíamos agir antes de perder tudo. Você pode nos ajudar a construir um satélite de monitoramento?",
        solution_text: "Excelente! Satélite multiespectral em órbita gerando mapas NDVI que detectam estresse vegetal antes dos danos visíveis.",
        impact_text: "Com os dados do satélite, 78% das plantações do Vale do Taquari foram salvas e o uso de agrotóxicos foi reduzido em 40%!",
        nasa_tips: "🛰️ DICA NASA: Câmeras multiespectrais capturam luz no infravermelho próximo (NIR). Plantas com fotossíntese saudável refletem muito mais infravermelho!"
      },
      {
        id: 2,
        title: "Alerta Vermelho: Prevenção de Deslizamentos",
        problem_type: "deslizamentos",
        difficulty: 2,
        npc_name: "Capitão Rodrigo",
        npc_dialog: "Comandante! Sou o Capitão Rodrigo da Defesa Civil de Lajeado. Após chuvas fortes, as encostas do vale correm perigo de deslizamento. Precisamos de radar de satélite para vigiar a movimentação do terreno mesmo através das nuvens!",
        solution_text: "Satélite com radar SAR em órbita baixa LEO monitorando milímetros de deformação no solo com interferometria.",
        impact_text: "Sistema de alerta precoce protegeu 50.000 moradores e evitou desastres nas rodovias do Vale do Taquari!",
        nasa_tips: "🛰️ DICA NASA: O radar SAR (Synthetic Aperture Radar) emite pulsos de micro-ondas que atravessam nuvens, fumaça e operam tanto de dia quanto à noite!"
      },
      {
        id: 3,
        title: "Conexão Taquari: Internet para Produtores Rurais",
        problem_type: "comunicacao",
        difficulty: 3,
        npc_name: "Professora Mariana",
        npc_dialog: "Olá, líder espacial! Sou a Professora Mariana da Escola de Pouso Novo. Nossos alunos e produtores rurais estão completamente sem sinal de internet e telefone. Pode criar um satélite de retransmissão de dados para nossa região?",
        solution_text: "Satélite de retransmissão banda Ku com antenas direcionais e painéis solares autônomos em órbita.",
        impact_text: "47 comunidades rurais isoladas conectadas! Alunos agora têm aulas online e produtores monitoram o mercado em tempo real.",
        nasa_tips: "🛰️ DICA NASA: A NASA usa redes como a TDRS e a Deep Space Network para manter comunicações de alta velocidade contínuas pelo espaço!"
      },
      {
        id: 4,
        title: "Guardiões da Mata: Monitoramento das Matas Ciliares",
        problem_type: "florestal",
        difficulty: 3,
        npc_name: "Cacique Karaí",
        npc_dialog: "Saudações, líder! Sou o Cacique Karaí. As matas ciliares do Rio Taquari protegem nossas águas, mas desmatadores e queimadas estão destruindo a floresta. Ajude-nos com um satélite para monitorar e vigiar as matas!",
        solution_text: "Sistema óptico de alta definição e sensores termais infravermelhos integrados a alertas em tempo real.",
        impact_text: "Desmatamento ilegal reduzido em 62%! 45 focos de calor controlados e 1.200 hectares de mata atlântica preservados.",
        nasa_tips: "🛰️ DICA NASA: O sistema FIRMS da NASA monitora queimadas no planeta inteiro em tempo quase real usando satélites MODIS e VIIRS!"
      }
    ];
  },

  /** Retorna high score */
  getHighScore() {
    return parseInt(localStorage.getItem('missaoTaquari_highscore') || '0');
  }
};
