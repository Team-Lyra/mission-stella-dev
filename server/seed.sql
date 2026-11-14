-- =============================================
-- Missão Taquari - Dados Iniciais (Seed)
-- =============================================

-- Limpar dados existentes (em ordem para respeitar foreign keys)
DELETE FROM scores;
DELETE FROM missions;

-- Resetar sequências
ALTER SEQUENCE missions_id_seq RESTART WITH 1;

-- =============================================
-- MISSÃO 1: Agricultura de Precisão
-- =============================================
INSERT INTO missions (title, description, problem_type, difficulty, npc_name, npc_dialog, solution_text, impact_text, nasa_tips)
VALUES (
    'Safra em Perigo: Monitoramento Agrícola',
    'As lavouras do Vale do Taquari estão sofrendo com uma praga desconhecida que avança rapidamente. Os agricultores não conseguem identificar quais áreas estão afetadas a tempo. Sua missão é configurar um satélite para monitorar as plantações usando imagens multiespectrais e ajudar os produtores a salvar a safra.',
    'agricultura',
    1,
    'Dona Iracema',
    'Olá, jovem líder! Sou a Dona Iracema, agricultora aqui em Estrela. Faz três gerações que minha família cultiva essas terras. Mas esse ano tá difícil... uma praga tá destruindo nossas plantações de soja e milho. Quando a gente percebe, já é tarde demais. Se a gente tivesse como ver as lavouras do alto, quem sabe dava pra agir antes, né? Disseram que você entende dessas coisas de satélite... será que pode nos ajudar?',
    'Excelente trabalho! Ao configurar o satélite com sensores multiespectrais no infravermelho próximo (NIR), você conseguiu criar mapas de NDVI (Índice de Vegetação por Diferença Normalizada) das lavouras. Esses mapas mostram claramente as áreas de estresse das plantas ANTES que os sintomas sejam visíveis a olho nu. Com essa informação, os agricultores puderam aplicar defensivos apenas nas áreas afetadas, economizando recursos e protegendo o meio ambiente.',
    'Graças ao monitoramento por satélite, os agricultores do Vale do Taquari conseguiram reduzir em 40% o uso de defensivos agrícolas e salvar 78% das áreas que seriam perdidas. A Dona Iracema e mais de 200 famílias produtoras foram beneficiadas. A técnica agora é usada em toda a região, transformando o Vale do Taquari em referência nacional em agricultura de precisão.',
    '🛰️ DICA NASA: O programa Landsat da NASA, ativo desde 1972, é o mais longo programa de observação da Terra por satélite. As imagens Landsat são gratuitas e usadas no mundo inteiro para monitoramento agrícola. O sensor MODIS dos satélites Terra e Aqua da NASA gera mapas de NDVI a cada 16 dias, permitindo acompanhar a saúde das plantações ao longo do tempo. O programa SERVIR da NASA treina comunidades em países em desenvolvimento a usar dados de satélite para agricultura, e o Brasil é um dos maiores beneficiados dessas tecnologias.'
);

-- =============================================
-- MISSÃO 2: Prevenção de Deslizamentos
-- =============================================
INSERT INTO missions (title, description, problem_type, difficulty, npc_name, npc_dialog, solution_text, impact_text, nasa_tips)
VALUES (
    'Alerta Vermelho: Prevenção de Deslizamentos',
    'Após chuvas intensas, as encostas do Vale do Taquari estão em risco de deslizamentos. Em 2023, enchentes e deslizamentos devastaram a região. Sua missão é usar dados de satélite para criar um sistema de alerta precoce que identifique áreas de risco e avise a população antes que desastres aconteçam.',
    'deslizamentos',
    2,
    'Capitão Rodrigo',
    'Saudações, comandante! Sou o Capitão Rodrigo da Defesa Civil de Lajeado. Depois da tragédia de 2023, quando as enchentes e deslizamentos causaram destruição no nosso vale, prometemos que nunca mais seríamos pegos de surpresa. Precisamos de um sistema que monitore a umidade do solo, a quantidade de chuva e o movimento das encostas em tempo real. Sei que os satélites da NASA podem ajudar. Cada minuto de antecedência no alerta pode salvar vidas. Estamos contando com você!',
    'Brilhante! Você configurou o satélite com radar SAR (Radar de Abertura Sintética), que funciona mesmo através de nuvens e à noite. Combinando dados de precipitação do satélite GPM da NASA com mapas de elevação digital (DEM) e medições de umidade do solo pelo SMAP, você criou um modelo preditivo que identifica áreas com alto risco de deslizamento com até 72 horas de antecedência.',
    'O sistema de alerta precoce baseado em satélite protege agora mais de 50.000 moradores do Vale do Taquari. Em um teste real durante fortes chuvas, o sistema alertou com 48 horas de antecedência, permitindo a evacuação segura de 3.200 pessoas de áreas de risco. A Defesa Civil de Lajeado se tornou modelo para todo o Rio Grande do Sul, e o Capitão Rodrigo levou o projeto para ser apresentado na ONU.',
    '🛰️ DICA NASA: O satélite GPM (Global Precipitation Measurement) da NASA e JAXA mede chuvas em todo o planeta a cada 3 horas. O programa SERVIR da NASA já ajudou a criar sistemas de alerta de enchentes em mais de 50 países. O radar SAR pode medir movimentos do terreno de apenas milímetros usando uma técnica chamada InSAR (Interferometria SAR). O satélite SMAP (Soil Moisture Active Passive) da NASA mede a umidade do solo global, crucial para prever deslizamentos. Após o desastre no Vale do Taquari em 2023, imagens de satélite foram fundamentais para mapear áreas afetadas e planejar a reconstrução.'
);

-- =============================================
-- MISSÃO 3: Comunicação Rural
-- =============================================
INSERT INTO missions (title, description, problem_type, difficulty, npc_name, npc_dialog, solution_text, impact_text, nasa_tips)
VALUES (
    'Conexão Taquari: Internet para Todos',
    'Muitas comunidades rurais do Vale do Taquari ainda não têm acesso à internet confiável. Escolas rurais não conseguem acessar conteúdo educacional online, e postos de saúde ficam isolados. Sua missão é projetar uma solução de comunicação via satélite que conecte as comunidades mais isoladas do vale.',
    'comunicacao',
    3,
    'Professora Mariana',
    'Oi, querido líder espacial! Sou a Professora Mariana, da Escola Municipal de Pouso Novo. Aqui no interior, a internet é um sonho distante. Meus alunos são brilhantes, curiosos, cheios de vontade de aprender. Mas enquanto crianças na cidade acessam o mundo inteiro pelo celular, os meus mal conseguem carregar uma página. Tem aluno que caminha duas horas até a escola e merecia ter acesso à mesma educação que qualquer criança no Brasil. Será que os satélites podem trazer o futuro até nós?',
    'Fantástico! Você projetou uma rede de comunicação usando satélites em órbita baixa (LEO) combinados com estações terrestres solares. O sistema usa antenas de baixo custo com rastreamento automático e frequências em banda Ku, garantindo conexão de alta velocidade mesmo nos vales mais remotos. Cada estação é alimentada por painéis solares e baterias, funcionando de forma autônoma.',
    'A rede de comunicação por satélite conectou 47 comunidades rurais do Vale do Taquari. Mais de 2.300 alunos agora têm acesso à internet na escola, incluindo os alunos da Professora Mariana em Pouso Novo. Os postos de saúde rurais podem fazer teleconsultas com especialistas em Porto Alegre, e os agricultores acessam previsões meteorológicas e preços de mercado em tempo real. A evasão escolar na região caiu 35%.',
    '🛰️ DICA NASA: A NASA usa redes de comunicação via satélite há décadas! A Deep Space Network (DSN) da NASA se comunica com sondas a bilhões de quilômetros da Terra. Os satélites TDRS (Tracking and Data Relay Satellite) formam uma rede que permite comunicação quase contínua com a Estação Espacial Internacional. A tecnologia de comunicação por laser da NASA (LCRD - Laser Communications Relay Demonstration) pode transmitir dados 10 a 100 vezes mais rápido que rádio. Muitas tecnologias desenvolvidas pela NASA para comunicação espacial foram adaptadas para melhorar telecomunicações na Terra, beneficiando comunidades remotas no mundo inteiro.'
);

-- =============================================
-- MISSÃO 4: Monitoramento Florestal
-- =============================================
INSERT INTO missions (title, description, problem_type, difficulty, npc_name, npc_dialog, solution_text, impact_text, nasa_tips)
VALUES (
    'Guardiões da Mata: Proteção Florestal',
    'A Mata Atlântica no Vale do Taquari está ameaçada por desmatamento ilegal e queimadas. Restam menos de 7% da cobertura original. Sua missão é configurar um sistema de monitoramento por satélite que detecte desmatamento e queimadas em tempo real, ajudando a proteger o que resta desse bioma precioso.',
    'florestal',
    3,
    'Cacique Karaí',
    'Ânhe porã, jovem protetor! Sou Karaí, cacique da aldeia Kaingang aqui no vale. A mata é nossa mãe, nossa farmácia, nossa escola. Cada árvore que cai é uma história que se perde. Nossos avós contam que antigamente a floresta cobria tudo, até onde a vista alcançava. Hoje, os tratores chegam de noite e quando o sol nasce, a mata já não existe mais. Precisamos de olhos no céu que nunca dormem, que vejam o que acontece mesmo quando ninguém está olhando. Pode nos dar esses olhos?',
    'Incrível! Você configurou um sistema de monitoramento combinando imagens ópticas de alta resolução com sensores térmicos infravermelhos. O sistema detecta automaticamente: 1) Mudanças na cobertura florestal comparando imagens de diferentes datas, 2) Pontos de calor que indicam queimadas usando o algoritmo FIRMS da NASA, 3) Estradas ilegais sendo abertas na mata. Alertas automáticos são enviados para a polícia ambiental e para as comunidades indígenas.',
    'O sistema de monitoramento florestal reduziu o desmatamento ilegal no Vale do Taquari em 62% no primeiro ano. Foram detectados e impedidos 23 focos de desmatamento ilegal e 45 queimadas foram combatidas antes de se espalharem. O Cacique Karaí e seu povo agora são parceiros oficiais do monitoramento, combinando conhecimento tradicional com tecnologia espacial. A área de Mata Atlântica protegida na região aumentou em 1.200 hectares.',
    '🛰️ DICA NASA: O sistema FIRMS (Fire Information for Resource Management System) da NASA detecta incêndios ativos no mundo inteiro usando dados dos satélites Terra, Aqua e NOAA-20. O programa Global Forest Watch usa dados Landsat da NASA para monitorar florestas no planeta todo. O satélite ICESat-2 da NASA usa laser para medir a altura das árvores, ajudando a calcular quanto carbono as florestas armazenam. O DETER do INPE brasileiro, inspirado em tecnologias da NASA, monitora o desmatamento na Amazônia e Mata Atlântica. A NASA e o INPE colaboram há décadas para proteger as florestas do Brasil usando tecnologia espacial.'
);

-- =============================================
-- MISSÃO 5: Qualidade da Água
-- =============================================
INSERT INTO missions (title, description, problem_type, difficulty, npc_name, npc_dialog, solution_text, impact_text, nasa_tips)
VALUES (
    'Águas Limpas: Monitoramento Hídrico',
    'O Rio Taquari, que dá nome ao vale, está sofrendo com poluição de diversas fontes. A qualidade da água afeta a saúde de milhares de pessoas e a vida aquática. Sua missão é usar sensores de satélite para monitorar a qualidade da água do rio e seus afluentes, identificando fontes de poluição.',
    'recursos_hidricos',
    4,
    'Dr. Helena',
    'Olá, comandante! Sou a Dra. Helena, bióloga e pesquisadora da Univates aqui em Lajeado. Estudo o Rio Taquari há 15 anos e nunca vi a situação tão preocupante. A água que nossos avós bebiam direto do rio hoje está cheia de contaminantes. Temos esgoto sem tratamento, agrotóxicos das lavouras, resíduos industriais... E o rio é enorme! Não conseguimos monitorar tudo com nossas equipes de campo. Se pudéssemos ver a saúde do rio inteiro de cima, do espaço, poderíamos focar nossos esforços onde é mais urgente. Você consegue nos ajudar?',
    'Extraordinário! Você configurou sensores hiperespectrais no satélite que analisam a cor e a composição da água em diferentes comprimentos de onda. O sistema detecta concentração de clorofila (indicando proliferação de algas), turbidez, temperatura da água e até presença de poluentes químicos. Combinando com dados de uso do solo ao redor do rio, você criou um mapa completo das fontes de poluição ao longo de todo o Rio Taquari.',
    'O monitoramento por satélite da qualidade da água identificou 12 pontos críticos de poluição no Rio Taquari, levando à ação imediata das autoridades ambientais. Três indústrias foram notificadas e adequaram seus sistemas de tratamento. Dois municípios aceleraram obras de saneamento. A Dra. Helena publicou os resultados em uma revista científica internacional, e o modelo está sendo replicado em outros rios do Rio Grande do Sul. A qualidade da água melhorou 28% em seis meses.',
    '🛰️ DICA NASA: O satélite Landsat 9 da NASA possui sensores que podem analisar a qualidade da água de rios e lagos. O programa PACE (Plankton, Aerosol, Cloud, ocean Ecosystem) da NASA, lançado em 2024, revolucionou o monitoramento de ecossistemas aquáticos com sensores hiperespectrais avançados. O GRACE-FO (Gravity Recovery and Climate Experiment Follow-On) mede mudanças na quantidade de água subterrânea. A NASA disponibiliza gratuitamente a plataforma Giovanni para análise de dados ambientais, incluindo qualidade de água. Cientistas brasileiros usam dados da NASA diariamente para monitorar os recursos hídricos do país.'
);

-- =============================================
-- MISSÃO 6: Clima e Eventos Extremos
-- =============================================
INSERT INTO missions (title, description, problem_type, difficulty, npc_name, npc_dialog, solution_text, impact_text, nasa_tips)
VALUES (
    'Tempestade à Vista: Previsão Climática',
    'O Vale do Taquari tem enfrentado eventos climáticos cada vez mais extremos: chuvas torrenciais, secas prolongadas, granizo e vendavais. Os prejuízos para a agricultura e para as cidades são enormes. Sua missão é criar um sistema de previsão climática avançado usando dados de múltiplos satélites da NASA.',
    'clima',
    5,
    'Seu Antônio',
    'Bah, tchê! Sou o Seu Antônio, prefeito de Arroio do Meio. Nos últimos anos, o tempo ficou doido! Chuva quando devia ter sol, seca quando precisava de chuva, granizo destruindo tudo... No ano passado, perdemos a colheita inteira de uva por causa de uma chuvarada que ninguém previu. E as enchentes? Cada vez piores. O povo tá com medo, e eu preciso proteger nossa gente. Me disseram que os satélites da NASA conseguem prever o tempo melhor do que qualquer estação meteorológica. Será que dá pra criar algo assim pro nosso vale?',
    'Espetacular! Você integrou dados de uma constelação de satélites: GPM para precipitação, GOES para monitoramento de tempestades em tempo real, Aqua/Terra para temperatura e umidade, e CloudSat para estrutura das nuvens. O modelo de inteligência artificial que você treinou com dados históricos e em tempo real consegue prever eventos extremos com até 5 dias de antecedência, com precisão localizada para cada município do Vale do Taquari.',
    'O sistema de previsão climática avançado transformou o Vale do Taquari. As previsões com 5 dias de antecedência permitiram que agricultores protegessem suas colheitas, que a Defesa Civil evacuasse áreas de risco e que os municípios se preparassem para eventos extremos. No primeiro ano, os prejuízos causados por eventos climáticos caíram 55%. O Seu Antônio apresentou o projeto na COP do clima como exemplo de adaptação climática local. O Vale do Taquari agora é referência mundial em resiliência climática comunitária.',
    '🛰️ DICA NASA: A NASA opera mais de 20 satélites de observação da Terra que monitoram o clima em tempo real. O programa Earth Science da NASA é o maior do mundo em estudo do clima. Os dados do satélite GPM são usados por serviços meteorológicos de mais de 150 países. A NASA disponibiliza o NASA Worldview, uma ferramenta gratuita onde qualquer pessoa pode ver imagens de satélite da Terra quase em tempo real. O programa NASA DEVELOP treina jovens cientistas a usar dados de satélite para resolver problemas ambientais locais - exatamente como você está fazendo agora! A colaboração entre NASA e instituições brasileiras como INPE e CPTEC é fundamental para a previsão do tempo no Brasil.'
);
