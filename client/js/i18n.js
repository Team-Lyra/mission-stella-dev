// ============================================
// i18n.js — Sistema de Internacionalização (PT-BR & EN)
// ============================================

const I18n = {
  lang: localStorage.getItem('missaoStella_lang') || 'pt-BR',

  listeners: [],

  onLanguageChange(fn) {
    this.listeners.push(fn);
  },

  setLang(l) {
    if (l !== 'pt-BR' && l !== 'en') l = 'pt-BR';
    this.lang = l;
    localStorage.setItem('missaoStella_lang', l);
    this.listeners.forEach(fn => fn(l));
  },

  toggleLang() {
    this.setLang(this.lang === 'pt-BR' ? 'en' : 'pt-BR');
  },

  t(key, params = {}) {
    const dict = this.translations[this.lang] || this.translations['pt-BR'];
    let str = dict[key] || this.translations['pt-BR'][key] || key;
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`{${k}}`, 'g'), v);
    }
    return str;
  },

  translations: {
    'pt-BR': {
      // Menu Principal
      'game_title': '🚀 MISSÃO STELA',
      'game_subtitle': 'Exploração Espacial no Vale do Taquari • Padrão NASA',
      'menu_start': '🚀 Iniciar Exploração',
      'menu_mission_map': '🗺️ Mapa de Operações',
      'menu_leaderboard': '🏆 Placar de Líderes',
      'menu_shop': '🛍️ Lojinha Espacial',
      'menu_curiosities': '🛰️ Curiosidades',
      'menu_credits': '📜 Créditos & Equipe',
      'menu_hint': 'Clique nas opções ou use [↑/↓] e [ENTER]',
      'lang_switch': '🌐 Idioma: Português (Mudar p/ EN)',

      // Onboarding
      'onboard_title': '👨‍🚀 IDENTIFICAÇÃO DO EXPLORADOR',
      'onboard_subtitle': 'A Lyra quer te conhecer antes da decolagem!',
      'onboard_name_label': 'Seu Nome de Comandante:',
      'onboard_city_label': 'Sua Cidade:',
      'onboard_start_btn': 'DECOLAR COM A LYRA! ➔',
      'onboard_placeholder_name': 'Ex: Alex',
      'onboard_placeholder_city': 'Ex: Estrela, Lajeado...',
      'default_explorer': 'Comandante',
      'default_city': 'Vale do Taquari',

      // HUD & Status
      'hud_level': '{rank}',
      'hud_coins': '🪙 {coins} Space Coins',
      'hud_score': '⭐ {score} pts',
      'hud_online': '🟢 Conectado',
      'hud_offline': '🟡 Local',
      'hud_mission_none': '🌍 VALE DO TAQUARI • Escolha uma Operação',
      'hud_space_center': '🔬 CENTRO ESPACIAL STELA • Sala de Controle',

      // Cargos / Ranks
      'rank_1': 'Nível 1 • Explorador Mirim',
      'rank_2': 'Nível 2 • Cadete Espacial',
      'rank_3': 'Nível 3 • Engenheiro de Satélites',
      'rank_4': 'Nível 4 • Cientista de Voo',
      'rank_5': 'Nível 5 • Comandante Orbital',

      // Botões e Ações Gerais
      'btn_back': 'VOLTAR [ESC]',
      'btn_continue': 'CONTINUAR [ENTER] ➔',
      'btn_accept': '✅ ASSUMIR OPERAÇÃO [ENTER] ➔',
      'btn_launch': '🚀 LANÇAR MISSÃO! [ESPAÇO / CLIQUE]',
      'btn_next_fact': 'PRÓXIMA CURIOSIDADE ➔',
      'btn_close': 'FECHAR [ESC]',
      'dialog_continue': 'Pressione [ESPAÇO] ou [ENTER] ▼',

      // Mapa e Locais
      'map_center_label': '🚀 CENTRO ESPACIAL STELA',
      'map_door_label': '🚪 ENTRADA [Pressione E ou Entre]',
      'map_river': '🌊 Rio Taquari',
      'map_crops': '🌾 Lavouras de Estrela',
      'station_workshop': '🔬 BANCADA DE PROJETOS',
      'station_mission_map': '🗺️ MAPA DE OPERAÇÕES',
      'station_ranking': '🏆 TELÃO DE RANKING',
      'station_shop': '🛍️ LOJINHA ESPACIAL',
      'station_exit': '🚪 SAÍDA (VALE DO TAQUARI)',

      // Mapa de Missões (Terminal no Centro Espacial)
      'mission_panel_title': '🗺️ PAINEL DE OPERAÇÕES ESPACIAIS',
      'mission_panel_subtitle': 'Status das operações no Vale do Taquari (Regra: 1 tentativa por missão)',
      'mission_status_done': '✅ CONCLUÍDA COM SUCESSO',
      'mission_status_failed': '❌ MISSÃO FALHOU (Encerrada)',
      'mission_status_ready': '🚀 DISPONÍVEL (Fale com morador)',
      'mission_status_active': '⚡ EM ANDAMENTO (Na Bancada)',
      'mission_completed_alert': 'Esta operação já foi finalizada! Veja os relatórios ou escolha outro desafio.',

      // Nomes Oficiais das Missões
      'm1_title': 'Operação Solo Fértil',
      'm1_desc': 'Detectar pragas no milho e soja com sensores NIR antes que a safra de Estrela seja perdida.',
      'm1_npc': 'Dona Iracema',
      'm1_role': 'Agricultora em Estrela',
      'm1_dialog': 'Olá, {name}! As lavouras de {city} e região estão com uma praga invisível a olho nu. Precisamos de imagens espaciais da NASA para salvar a colheita!',
      'm1_diff': '🟢 Dificuldade: Iniciante',

      'm2_title': 'Operação Sentinela das Encostas',
      'm2_desc': 'Mapear deformações no solo de Lajeado através das nuvens com radar SAR para evitar deslizamentos.',
      'm2_npc': 'Capitão Rodrigo',
      'm2_role': 'Defesa Civil de Lajeado',
      'm2_dialog': 'Comandante {name}! Temporais ameaçam as encostas de rodovias. Precisamos de radar de satélite para alertar as famílias antes que o solo ceda!',
      'm2_diff': '🟡 Dificuldade: Moderada',

      'm3_title': 'Operação Conexão Taquari',
      'm3_desc': 'Levar internet de alta velocidade e telemedicina para escolas rurais e postos de saúde de Pouso Novo.',
      'm3_npc': 'Professora Mariana',
      'm3_role': 'Escola de Pouso Novo',
      'm3_dialog': 'Oi, {name}! Nossas crianças em Pouso Novo não têm sinal de internet. Vamos lançar um satélite de telecomunicações para conectar nossas escolas?',
      'm3_diff': '🟠 Dificuldade: Avançada',

      'm4_title': 'Operação Guardião das Águas e Matas',
      'm4_desc': 'Vigiar as matas ciliares do Rio Taquari dia e noite com sensores térmicos contra queimadas clandestinas.',
      'm4_npc': 'Cacique Karaí',
      'm4_role': 'Guardião da Mata Ciliar',
      'm4_dialog': 'Saudações, {name}! O Rio Taquari precisa de suas matas em pé. Precisamos de olhos térmicos no espaço que enxerguem o fogo no escuro da noite!',
      'm4_diff': '🔴 Dificuldade: Especialista',

      // Laboratório / Bancada de Montagem
      'workbench_title': '🔬 LABORATÓRIO DE MONTAGEM ESPACIAL',
      'workbench_subtitle': 'Veja as peças se encaixando no satélite em tempo real ao lado!',
      'cat_battery': 'Bateria',
      'cat_cpu': 'Computador',
      'cat_comms': 'Comunicação',
      'cat_sensor': 'Sensor',
      'stats_energy': '⚡ Força / Energia: {val}/100',
      'stats_reliability': '🛡️ Confiabilidade: {val}%',
      'stats_mass': '⚖️ Massa: {val} kg',
      'stats_success': '🎯 Chance de Sucesso: {val}%',
      'status_high_risk': '⚠️ ALTO RISCO DE FALHA (<60%)! Melhore as peças para não perder a missão!',
      'status_good': '✓ Nave bem balanceada e pronta para os testes!',

      // Falha da Missão (RNG & Baixa chance)
      'fail_title': '💥 MISSÃO COMPROMETIDA (FALHA TÉCNICA)',
      'fail_subtitle': 'A probabilidade de falha era alta e os sistemas falharam em órbita!',
      'fail_btn': 'VOLTAR AO CENTRO ESPACIAL [ENTER]',

      // Passo 5: Coleta de Dados
      'orbit_title': '📡 COLETA DE DADOS EM ÓRBITA (600 KM)',
      'orbit_lyra': 'Lyra: "Olha só, {name}! A nossa sonda já está no espaço enviando raios de dados direto para o Vale do Taquari!"',

      // Passo 6: Impacto e Métricas
      'impact_title': '🎉 OPERAÇÃO CONCLUÍDA COM SUCESSO!',
      'impact_metric_crops': '🌾 78% da Safra Salva',
      'impact_metric_people': '👥 50.000 Pessoas Protegidas',
      'impact_metric_schools': '🎒 47 Comunidades Conectadas',
      'impact_metric_forest': '🌳 1.200 Hectares de Mata Salvos',
      'impact_xp_reward': '⭐ +{xp} XP Ganho  •  🪙 +{coins} Space Coins',
      'impact_level_up': '🎉 SUBIU DE NÍVEL! Novo Cargo: {rank}',

      // Curiosidades
      'curiosities_title': '🛰️ CURIOSIDADES ESPACIAIS & NASA',

      // Endgame & Créditos
      'endgame_title': '🎆 PARABÉNS, COMANDANTE {name}! 🎆',
      'endgame_subtitle': 'Todas as operações do Vale do Taquari foram concluídas com sucesso!',
      'endgame_impact_header': '🌍 RELATÓRIO DO SEU IMPACTO NA COMUNIDADE:',
      'endgame_lives_saved': '❤️ Mais de 50.000 vidas e famílias protegidas em {city} e região!',
      'endgame_nature_saved': '🌱 1.200 hectares de floresta preservados e 78% da produção rural protegida.',
      'credits_title': '📜 CRÉDITOS OFICIAIS DO PROJETO',
      'credits_devs_header': 'Desenvolvedoras:',
      'credits_dev_1': '• Alexandra König Padilha',
      'credits_dev_2': '• Carine Teixeira Da Silva',
      'credits_dev_3': '• Isabelli Sehn',
      'credits_dev_4': '• Júlia Agosti',
      'credits_nasa': 'Projeto desenvolvido para o NASA Space Apps Challenge',
      'credits_tester': 'Agradecimento especial à nossa primeira tester: Lulu 💖',
      'credits_sources': 'Fontes Científicas: Meteomatics Weather API & NASA Worldview',
      'endgame_dev_status': 'Missão STELA — Em desenvolvimento 🚀\nObrigado por jogar e cuidar do nosso planeta!'
    },

    'en': {
      // Main Menu
      'game_title': '🚀 MISSION STELA',
      'game_subtitle': 'Space Exploration in Taquari Valley • NASA Standard',
      'menu_start': '🚀 Start Exploration',
      'menu_mission_map': '🗺️ Operations Map',
      'menu_leaderboard': '🏆 Leaderboard',
      'menu_shop': '🛍️ Space Shop',
      'menu_curiosities': '🛰️ Space Curiosities',
      'menu_credits': '📜 Credits & Team',
      'menu_hint': 'Click options or use [↑/↓] and [ENTER]',
      'lang_switch': '🌐 Language: English (Switch to PT-BR)',

      // Onboarding
      'onboard_title': '👨‍🚀 EXPLORER IDENTIFICATION',
      'onboard_subtitle': 'Lyra wants to meet you before liftoff!',
      'onboard_name_label': 'Your Commander Name:',
      'onboard_city_label': 'Your City:',
      'onboard_start_btn': 'LIFTOFF WITH LYRA! ➔',
      'onboard_placeholder_name': 'e.g. Alex',
      'onboard_placeholder_city': 'e.g. Houston, Porto Alegre...',
      'default_explorer': 'Commander',
      'default_city': 'Taquari Valley',

      // HUD & Status
      'hud_level': '{rank}',
      'hud_coins': '🪙 {coins} Space Coins',
      'hud_score': '⭐ {score} pts',
      'hud_online': '🟢 Online',
      'hud_offline': '🟡 Local',
      'hud_mission_none': '🌍 TAQUARI VALLEY • Choose an Operation',
      'hud_space_center': '🔬 STELA SPACE CENTER • Control Room',

      // Ranks
      'rank_1': 'Level 1 • Junior Explorer',
      'rank_2': 'Level 2 • Space Cadet',
      'rank_3': 'Level 3 • Satellite Engineer',
      'rank_4': 'Level 4 • Flight Scientist',
      'rank_5': 'Level 5 • Orbital Commander',

      // Buttons & Actions
      'btn_back': 'BACK [ESC]',
      'btn_continue': 'CONTINUE [ENTER] ➔',
      'btn_accept': '✅ ACCEPT OPERATION [ENTER] ➔',
      'btn_launch': '🚀 LAUNCH MISSION! [SPACE / CLICK]',
      'btn_next_fact': 'NEXT FACT ➔',
      'btn_close': 'CLOSE [ESC]',
      'dialog_continue': 'Press [SPACE] or [ENTER] ▼',

      // Map & Locations
      'map_center_label': '🚀 STELA SPACE CENTER',
      'map_door_label': '🚪 ENTRANCE [Press E or Step in]',
      'map_river': '🌊 Taquari River',
      'map_crops': '🌾 Estrela Farmlands',
      'station_workshop': '🔬 WORKBENCH',
      'station_mission_map': '🗺️ OPERATIONS TERMINAL',
      'station_ranking': '🏆 LEADERBOARD SCREEN',
      'station_shop': '🛍️ SPACE SHOP',
      'station_exit': '🚪 EXIT (TO VALLEY)',

      // Mission Panel
      'mission_panel_title': '🗺️ SPACE OPERATIONS PANEL',
      'mission_panel_subtitle': 'Status of regional operations (Rule: 1 attempt per mission)',
      'mission_status_done': '✅ COMPLETED SUCCESSFULLY',
      'mission_status_failed': '❌ MISSION FAILED (Closed)',
      'mission_status_ready': '🚀 READY (Talk to resident)',
      'mission_status_active': '⚡ ACTIVE (At Workbench)',
      'mission_completed_alert': 'This operation has already ended! Check reports or pick another challenge.',

      // Official Mission Names
      'm1_title': 'Operation Fertile Ground',
      'm1_desc': 'Detect crop pests in corn and soy using NIR sensors before harvest is lost.',
      'm1_npc': 'Dona Iracema',
      'm1_role': 'Estrela Farmer',
      'm1_dialog': 'Hello, {name}! Crops in {city} and region have an invisible pest. We need NASA satellite imagery to save the harvest!',
      'm1_diff': '🟢 Difficulty: Beginner',

      'm2_title': 'Operation Slope Sentinel',
      'm2_desc': 'Map ground deformations through storm clouds using SAR radar to prevent landslides.',
      'm2_npc': 'Captain Rodrigo',
      'm2_role': 'Civil Defense Commander',
      'm2_dialog': 'Commander {name}! Storms threaten roadside slopes. We need satellite radar to warn families before disasters happen!',
      'm2_diff': '🟡 Difficulty: Moderate',

      'm3_title': 'Operation Taquari Link',
      'm3_desc': 'Bring high-speed internet and telemedicine to rural schools in Pouso Novo.',
      'm3_npc': 'Teacher Mariana',
      'm3_role': 'Pouso Novo School Teacher',
      'm3_dialog': 'Hi, {name}! Our kids in Pouso Novo have no web access. Let us launch a comms satellite to connect our schools!',
      'm3_diff': '🟠 Difficulty: Advanced',

      'm4_title': 'Operation Waters & Forests Guardian',
      'm4_desc': 'Watch riparian forests on the Taquari River day and night using thermal sensors.',
      'm4_npc': 'Chief Karaí',
      'm4_role': 'Forest Guardian',
      'm4_dialog': 'Greetings, {name}! The Taquari River needs its trees alive. We need space thermal eyes to spot illegal fires at night!',
      'm4_diff': '🔴 Difficulty: Expert',

      // Workbench
      'workbench_title': '🔬 SATELLITE ASSEMBLY LAB',
      'workbench_subtitle': 'Watch parts attach dynamically to the probe in real time!',
      'cat_battery': 'Battery',
      'cat_cpu': 'Computer',
      'cat_comms': 'Comms',
      'cat_sensor': 'Sensor',
      'stats_energy': '⚡ Power / Energy: {val}/100',
      'stats_reliability': '🛡️ Reliability: {val}%',
      'stats_mass': '⚖️ Mass: {val} kg',
      'stats_success': '🎯 Success Chance: {val}%',
      'status_high_risk': '⚠️ HIGH RISK OF FAILURE (<60%)! Upgrade parts to avoid mission failure!',
      'status_good': '✓ Probe well balanced and ready for laboratory testing!',

      // Failure
      'fail_title': '💥 MISSION FAILED (TECHNICAL GLITCH)',
      'fail_subtitle': 'The risk was too high and systems malfunctioned in orbit!',
      'fail_btn': 'RETURN TO SPACE CENTER [ENTER]',

      // Step 5: Orbit
      'orbit_title': '📡 DATA HARVESTING IN ORBIT (600 KM)',
      'orbit_lyra': 'Lyra: "Look at that, {name}! Our probe is in orbit sending live telemetry beams straight to Taquari Valley!"',

      // Step 6: Impact
      'impact_title': '🎉 OPERATION COMPLETED SUCCESSFULLY!',
      'impact_metric_crops': '🌾 78% of Harvest Saved',
      'impact_metric_people': '👥 50,000 Citizens Protected',
      'impact_metric_schools': '🎒 47 Communities Connected',
      'impact_metric_forest': '🌳 1,200 Hectares Preserved',
      'impact_xp_reward': '⭐ +{xp} XP Earned  •  🪙 +{coins} Space Coins',
      'impact_level_up': '🎉 PROMOTED! New Rank: {rank}',

      // Curiosities
      'curiosities_title': '🛰️ SPACE & EARTH CURIOSITIES',

      // Endgame & Credits
      'endgame_title': '🎆 CONGRATULATIONS, COMMANDER {name}! 🎆',
      'endgame_subtitle': 'All regional operations in Taquari Valley were completed!',
      'endgame_impact_header': '🌍 YOUR ACCUMULATED COMMUNITY IMPACT:',
      'endgame_lives_saved': '❤️ Over 50,000 citizens and families protected in {city} and region!',
      'endgame_nature_saved': '🌱 1,200 hectares of forest preserved and 78% of agriculture safeguarded.',
      'credits_title': '📜 OFFICIAL PROJECT CREDITS',
      'credits_devs_header': 'Developers:',
      'credits_dev_1': '• Alexandra König Padilha',
      'credits_dev_2': '• Carine Teixeira Da Silva',
      'credits_dev_3': '• Isabelli Sehn',
      'credits_dev_4': '• Júlia Agosti',
      'credits_nasa': 'Project developed for the NASA Space Apps Challenge',
      'credits_tester': 'Special thanks to our first tester: Lulu 💖',
      'credits_sources': 'Scientific Data: Meteomatics Weather API & NASA Worldview',
      'endgame_dev_status': 'Mission STELA — Under development 🚀\nThank you for playing and protecting our planet!'
    }
  }
};
