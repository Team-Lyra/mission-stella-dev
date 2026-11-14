// ============================================
// npc.js — NPCs e Interações no Vale do Taquari
// ============================================

const NPCManager = {
  npcs: [],

  init() {
    this.npcs = [
      {
        id: 'iracema',
        name: 'Dona Iracema',
        role: 'Agricultora de Estrela',
        missionId: 1,
        color: '#2a9d8f',
        x: 22 * 48,
        y: 4 * 48,
        w: 24,
        h: 24,
        hatColor: '#e76f51',
        shirtColor: '#f4a261',
        hairColor: '#e9c46a',
        dialog: 'Olá, líder espacial! Sou a Dona Iracema, agricultora aqui em Estrela. Uma praga misteriosa está devorando nossas lavouras de milho e soja! Se a gente conseguisse analisar a saúde das folhas pelo espaço usando dados de satélite da NASA, podíamos agir antes de perder tudo! Pode ir até o Centro de Comando e projetar um satélite com sensores multiespectrais para nos salvar?',
        hint: 'Problema: Praga agrícola • Necessidade: Satélite com sensor multiespectral (NDVI).'
      },
      {
        id: 'rodrigo',
        name: 'Capitão Rodrigo',
        role: 'Defesa Civil de Lajeado',
        missionId: 2,
        color: '#e63946',
        x: 14 * 48,
        y: 7 * 48,
        w: 24,
        h: 24,
        hatColor: '#d62828',
        shirtColor: '#f77f00',
        hairColor: '#3d405b',
        dialog: 'Comandante! Sou o Capitão Rodrigo da Defesa Civil. Após os fortes temporais no Vale, encostas nas rodovias correm risco severo de deslizamento! Precisamos de radar de satélite com tecnologia SAR, capaz de penetrar nuvens e medir movimentações milimétricas no solo antes que ocorram tragédias!',
        hint: 'Problema: Deslizamento de encostas • Necessidade: Satélite com radar SAR.'
      },
      {
        id: 'mariana',
        name: 'Professora Mariana',
        role: 'Escola de Pouso Novo',
        missionId: 3,
        color: '#9b5de5',
        x: 4 * 48,
        y: 10 * 48,
        w: 24,
        h: 24,
        hatColor: '#7209b7',
        shirtColor: '#f72585',
        hairColor: '#583101',
        dialog: 'Olá, jovem líder! Sou a Professora Mariana de Pouso Novo. Nossas escolas rurais e postos de saúde estão isolados, sem sinal de internet ou telecomunicações. Precisamos que projete um satélite de retransmissão de dados para conectar as famílias do interior ao conhecimento!',
        hint: 'Problema: Isolamento digital • Necessidade: Satélite de comunicação em banda Ku.'
      },
      {
        id: 'karai',
        name: 'Cacique Karaí',
        role: 'Líder Kaingang',
        missionId: 4,
        color: '#588157',
        x: 9 * 48,
        y: 15 * 48,
        w: 24,
        h: 24,
        hatColor: '#3a5a40',
        shirtColor: '#a3b18b',
        hairColor: '#2b2d42',
        dialog: 'Saudações, guardião da ciência! Sou o Cacique Karaí. O Rio Taquari precisa de suas matas ciliares para sobreviver. Invasões e queimadas clandestinas estão desmatando a beira do rio. Precisamos de um satélite com sensores termais e ópticos que vigie nossa mata 24 horas por dia!',
        hint: 'Problema: Desmatamento e fogo • Necessidade: Satélite óptico e termal infravermelho.'
      },
      {
        id: 'diretor_nasa',
        name: 'Dr. Santos (Diretor de Voo)',
        role: 'Centro de Comando Espacial',
        missionId: null,
        color: '#00b4d8',
        x: 12 * 48,
        y: 4 * 48 + 10,
        w: 24,
        h: 24,
        hatColor: '#0077b6',
        shirtColor: '#90e0ef',
        hairColor: '#e0e1dd',
        dialog: 'Bem-vindo ao Centro de Comando Espacial do Vale do Taquari! Aqui você constrói o satélite ideal, escolhendo sensores e materiais no padrão NASA, e realiza os testes de lançamento. Fale com os cidadãos locais para receber a missão e entre no Centro para projetar o satélite!',
        hint: 'Entre no Centro de Comando para montar seu satélite!'
      }
    ];
  },

  update(dt) {
    // Animações dos NPCs se necessário
  },

  getNearbyNPC(playerX, playerY, range = 64) {
    for (const npc of this.npcs) {
      const dist = Math.hypot((npc.x + npc.w / 2) - (playerX + 12), (npc.y + npc.h / 2) - (playerY + 12));
      if (dist <= range) {
        return npc;
      }
    }
    return null;
  },

  render(ctx, cameraX, cameraY, nearbyNPC) {
    const time = Date.now() / 300;

    for (const npc of this.npcs) {
      const rx = Math.round(npc.x - cameraX);
      const ry = Math.round(npc.y - cameraY);
      const isNear = nearbyNPC && nearbyNPC.id === npc.id;

      ctx.save();

      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(rx + npc.w / 2, ry + npc.h + 2, 10, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Roupa
      ctx.fillStyle = npc.shirtColor || npc.color;
      ctx.fillRect(rx + 4, ry + 10, npc.w - 8, 12);

      // Pernas
      ctx.fillStyle = '#212529';
      ctx.fillRect(rx + 6, ry + 22, 4, 4);
      ctx.fillRect(rx + 14, ry + 22, 4, 4);

      // Cabeça
      ctx.fillStyle = '#ffdfba';
      ctx.beginPath();
      ctx.arc(rx + npc.w / 2, ry + 7, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Cabelo / Chapéu
      ctx.fillStyle = npc.hatColor || npc.hairColor;
      ctx.beginPath();
      ctx.arc(rx + npc.w / 2, ry + 4, 7, Math.PI, Math.PI * 2);
      ctx.fill();

      // Nome do NPC acima dele
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(npc.name, rx + npc.w / 2, ry - 6);

      // Balão indicador de interação
      if (isNear) {
        const bounce = Math.sin(time * 3) * 3;
        const bx = rx + npc.w / 2;
        const by = ry - 22 + bounce;

        // Fundo do balão
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.roundRect(bx - 32, by - 12, 64, 18, 6);
        ctx.fill();

        // Triângulo do balão
        ctx.beginPath();
        ctx.moveTo(bx - 4, by + 6);
        ctx.lineTo(bx + 4, by + 6);
        ctx.lineTo(bx, by + 10);
        ctx.closePath();
        ctx.fill();

        // Texto no balão
        ctx.fillStyle = '#0a0a2e';
        ctx.font = 'bold 10px "Segoe UI", sans-serif';
        ctx.fillText('FALAR [E]', bx, by + 1);
      } else {
        // Ponto de exclamação dourado flutuando
        const bounce = Math.sin(time + npc.x) * 2;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        ctx.fillText('!', rx + npc.w / 2, ry - 14 + bounce);
      }

      ctx.restore();
    }
  }
};

