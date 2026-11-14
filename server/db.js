const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Garante que o diretório data exista
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Dados iniciais com as missões completas do Vale do Taquari
const initialMissions = [
  {
    id: 1,
    title: 'Safra em Perigo: Monitoramento Agrícola',
    description: 'As lavouras do Vale do Taquari estão sofrendo com uma praga desconhecida que avança rapidamente. Sua missão é configurar um satélite com sensores multiespectrais para monitorar as lavouras e salvar a produção.',
    problem_type: 'agricultura',
    difficulty: 1,
    npc_name: 'Dona Iracema',
    npc_dialog: 'Olá, jovem líder espacial! Sou a Dona Iracema, agricultora aqui em Estrela. Uma praga misteriosa está atacando nossas plantações de milho e soja! Se a gente conseguisse ver as lavouras do alto pelo espaço com satélites, podíamos agir antes. Você pode nos ajudar a construir e lançar um satélite de monitoramento?',
    solution_text: 'Excelente! Ao configurar o satélite com sensores multiespectrais no infravermelho próximo (NIR), calculamos o índice NDVI da vegetação antes dos sintomas ficarem visíveis a olho nu.',
    impact_text: 'Com o satélite em órbita, os agricultores de Estrela e do Vale do Taquari reduziram o uso de defensivos em 40% e salvaram mais de 78% da safra de milho e soja! Mais de 200 famílias foram beneficiadas.',
    nasa_tips: '🛰️ DICA NASA: O programa Landsat da NASA monitora lavouras e florestas desde 1972! Sensores multiespectrais revelam a saúde da clorofila refletindo ondas infravermelhas.'
  },
  {
    id: 2,
    title: 'Alerta Vermelho: Prevenção de Deslizamentos',
    description: 'Após chuvas torrenciais no Vale do Taquari, as encostas de rodovias e morros correm sério risco de deslizamento. Use radar de satélite para mapear o relevo e criar alertas precoces.',
    problem_type: 'deslizamentos',
    difficulty: 2,
    npc_name: 'Capitão Rodrigo',
    npc_dialog: 'Comandante! Sou o Capitão Rodrigo da Defesa Civil de Lajeado. Após os fortes temporais no Vale, encostas inteiras ameaçam desabar. Precisamos de dados de radar de satélite para medir a movimentação do solo e umidade em tempo real antes que ocorra uma tragédia!',
    solution_text: 'Missão cumprida! Com tecnologia SAR (Radar de Abertura Sintética), o satélite enxerga através das nuvens e mede alterações milimétricas no relevo do solo.',
    impact_text: 'Mais de 50.000 moradores de Lajeado e região agora estão protegidos por alertas automáticos. Um deslizamento na serra foi detectado com 48h de antecedência, permitindo evacuação segura!',
    nasa_tips: '🛰️ DICA NASA: O satélite GPM da NASA mede chuva global a cada 3 horas, e radares SAR conseguem mapear milímetros de deformação no solo dia e noite!'
  },
  {
    id: 3,
    title: 'Conexão Taquari: Internet para Produtores Rurais',
    description: 'Escolas rurais e produtores isolados de Pouso Novo não possuem sinal de rádio ou internet. Projete um satélite de comunicação para conectar comunidades distantes.',
    problem_type: 'comunicacao',
    difficulty: 3,
    npc_name: 'Professora Mariana',
    npc_dialog: 'Oi, líder espacial! Sou a Professora Mariana da Escola Municipal de Pouso Novo. Nossos alunos no interior não têm conexão com o mundo e os postos de saúde ficam incomunicáveis. Será que podemos lançar um satélite de retransmissão para conectar nossa comunidade?',
    solution_text: 'Brilhante! Satélite de órbita baixa LEO configurado com antenas de banda Ku e transponders de alto ganho com alimentação solar.',
    impact_text: 'A rede espacial conectou 47 comunidades rurais isoladas no Vale do Taquari! Escolas agora têm teleaulas e postos médicos atendem por telemedicina.',
    nasa_tips: '🛰️ DICA NASA: A Deep Space Network (DSN) da NASA conecta naves espaciais a bilhões de quilômetros da Terra com antenas parabólicas gigantes de alta frequência!'
  },
  {
    id: 4,
    title: 'Guardiões da Mata: Monitoramento das Matas Ciliares',
    description: 'A preservação das matas ciliares ao longo do Rio Taquari é vital para evitar assoreamento e proteger a fauna nativa. Monitore focos de desmatamento e queimadas.',
    problem_type: 'florestal',
    difficulty: 3,
    npc_name: 'Cacique Karaí',
    npc_dialog: 'Saudações, guardião da ciência! Sou o Cacique Karaí. O Rio Taquari precisa das suas matas ciliares em pé para respirar. Tratores e queimadas destroem a beira do rio na calada da noite. Precisamos de um olhar do espaço que vigie nossas matas 24 horas por dia!',
    solution_text: 'Combinamos imagens ópticas de alta resolução com sensores infravermelhos termais para alertas automáticos de desmatamento e calor.',
    impact_text: 'O desmatamento ilegal caiu 62% nas margens do Rio Taquari! 45 focos de incêndio foram combatidos a tempo e 1.200 hectares de mata atlântica foram protegidos.',
    nasa_tips: '🛰️ DICA NASA: O sistema FIRMS da NASA usa sensores MODIS e VIIRS para detectar focos de calor e queimadas no mundo todo em tempo real!'
  }
];

let dbData = {
  players: [
    {
      id: 1,
      name: 'Comandante Taquari',
      score: 1500,
      current_mission: 2,
      satellite_config: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  missions: initialMissions,
  scores: [
    {
      id: 1,
      player_id: 1,
      player_name: 'Comandante Taquari',
      mission_id: 1,
      mission_title: 'Safra em Perigo: Monitoramento Agrícola',
      score: 1500,
      completed_at: new Date().toISOString()
    }
  ]
};

// Carrega ou cria banco em arquivo JSON
function loadDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      dbData = JSON.parse(content);
      if (!dbData.missions || dbData.missions.length === 0) {
        dbData.missions = initialMissions;
      }
      console.log('📦 Banco de dados local carregado com sucesso:', DB_FILE);
    } catch (err) {
      console.warn('Erro ao ler db.json, recriando:', err.message);
      saveDatabase();
    }
  } else {
    saveDatabase();
    console.log('📦 Banco de dados local criado em:', DB_FILE);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (err) {
    console.error('Erro ao salvar banco de dados local:', err.message);
  }
}

// Inicializa no startup
loadDatabase();

module.exports = {
  // Players
  getPlayers() {
    return dbData.players.sort((a, b) => (b.score || 0) - (a.score || 0));
  },

  getPlayer(id) {
    return dbData.players.find(p => p.id === parseInt(id));
  },

  createPlayer(name) {
    const newPlayer = {
      id: dbData.players.length > 0 ? Math.max(...dbData.players.map(p => p.id)) + 1 : 1,
      name: (name && name.trim()) ? name.trim() : 'Líder Espacial',
      score: 0,
      current_mission: 1,
      satellite_config: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dbData.players.push(newPlayer);
    saveDatabase();
    return newPlayer;
  },

  updatePlayer(id, data) {
    const player = dbData.players.find(p => p.id === parseInt(id));
    if (!player) return null;

    if (data.name !== undefined) player.name = data.name;
    if (data.score !== undefined) player.score = data.score;
    if (data.current_mission !== undefined) player.current_mission = data.current_mission;
    if (data.satellite_config !== undefined) player.satellite_config = data.satellite_config;
    player.updated_at = new Date().toISOString();

    saveDatabase();
    return player;
  },

  // Missions
  getMissions() {
    return dbData.missions;
  },

  getMission(id) {
    return dbData.missions.find(m => m.id === parseInt(id));
  },

  // Scores / Leaderboard
  getScores() {
    return dbData.scores.sort((a, b) => b.score - a.score).slice(0, 20);
  },

  addScore(playerId, missionId, score) {
    const player = dbData.players.find(p => p.id === parseInt(playerId));
    const mission = dbData.missions.find(m => m.id === parseInt(missionId));

    const newScore = {
      id: dbData.scores.length > 0 ? Math.max(...dbData.scores.map(s => s.id)) + 1 : 1,
      player_id: parseInt(playerId),
      player_name: player ? player.name : 'Astronauta ' + playerId,
      mission_id: parseInt(missionId),
      mission_title: mission ? mission.title : 'Missão ' + missionId,
      score: parseInt(score),
      completed_at: new Date().toISOString()
    };

    dbData.scores.push(newScore);

    if (player) {
      player.score = Math.max(player.score || 0, parseInt(score));
      player.updated_at = new Date().toISOString();
    }

    saveDatabase();
    return newScore;
  }
};
