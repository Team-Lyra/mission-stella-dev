// ============================================
// npc.js — NPCs, Moradores do Vale do Taquari e Equipe Espacial
// ============================================

const NPCManager = {
  npcs: [],

  init() {
    this.npcs = [
      // --- MORADORES DO VALE DO TAQUARI (OUTDOOR) ---
      {
        id: 'iracema',
        zone: 'OUTDOOR',
        name: 'Dona Marta',
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
        dialog: 'Oi, jovem cientista! Nossas plantações de milho e soja estão com uma praga misteriosa. Se pudéssemos olhar as folhas do espaço com câmeras da NASA, podíamos salvar a colheita! Pode nos ajudar montando um satélite com sensor multiespectral?',
        hint: 'Problema: Praga no milho • Sensor: Câmera Multiespectral (NDVI)'
      },
      {
        id: 'rodrigo',
        zone: 'OUTDOOR',
        name: 'Capitão Farias',
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
        dialog: 'Atenção, Comandante! Chuvas fortes ameaçam desabar encostas nas estradas de Lajeado. Precisamos de um satélite com radar SAR que enxergue através das nuvens de tempestade para avisar as famílias a tempo!',
        hint: 'Problema: Risco de deslizamento • Sensor: Radar SAR de micro-ondas'
      },
      {
        id: 'mariana',
        zone: 'OUTDOOR',
        name: 'Professora Clara',
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
        dialog: 'Olá, amigo astronauta! Nossos alunos e postos médicos em Pouso Novo estão sem sinal de internet. Vamos lançar um satélite de telecomunicações para conectar nossas crianças ao mundo?',
        hint: 'Problema: Isolamento digital • Sensor: Transponder Banda Ku'
      },
      {
        id: 'karai',
        zone: 'OUTDOOR',
        name: 'Seu Nilo',
        role: 'Guardião do Rio Taquari',
        missionId: 4,
        color: '#588157',
        x: 9 * 48,
        y: 15 * 48,
        w: 24,
        h: 24,
        hatColor: '#3a5a40',
        shirtColor: '#a3b18b',
        hairColor: '#2b2d42',
        dialog: 'Saudações! O Rio Taquari precisa de suas árvores vivas para respirar. Tratores e queimadas destroem a margem do rio escondidos na escuridão. Precisamos de sensores infravermelhos no céu para proteger a floresta!',
        hint: 'Problema: Focos de calor e desmatamento • Sensor: Câmera Térmica Infravermelha'
      },
      {
        id: 'recepcionista',
        zone: 'OUTDOOR',
        name: 'Guia do Centro Espacial',
        role: 'Recepção STELA',
        missionId: null,
        color: '#00b4d8',
        x: 14 * 48,
        y: 4 * 48,
        w: 24,
        h: 24,
        hatColor: '#0077b6',
        shirtColor: '#90e0ef',
        hairColor: '#ffffff',
        dialog: 'Bem-vindo ao Centro Espacial STELA! A porta de entrada está logo ali ao lado. Quer que eu te acompanhe para entrar na Sala de Comando?',
        hint: 'Pressione [E] na porta ou fale comigo para entrar!'
      },

      // --- EQUIPE INTERNA DO CENTRO ESPACIAL (SPACE_CENTER) ---
      {
        id: 'diretor_nasa',
        zone: 'SPACE_CENTER',
        name: 'Dr. Santos (Diretor de Voo)',
        role: 'Sala de Controle',
        missionId: null,
        color: '#00b4d8',
        x: 8.5 * 48,
        y: 5 * 48,
        w: 24,
        h: 24,
        hatColor: '#0077b6',
        shirtColor: '#90e0ef',
        hairColor: '#e0e1dd',
        dialog: 'Bem-vindo à sala de controle! Aqui você acompanha todas as suas operações. Abrindo o Painel de Operações na sua frente...',
        hint: 'Aperte [E] para abrir o Painel de Operações!'
      },
      {
        id: 'lyra_npc',
        zone: 'SPACE_CENTER',
        name: 'Lyra (Sua Guia ⭐)',
        role: 'Mascote Estelar',
        missionId: null,
        color: '#ffd700',
        isLyra: true,
        x: 6.5 * 48,
        y: 5 * 48,
        w: 24,
        h: 24,
        dialog: 'Oii! Estou tão animada! A Bancada está à esquerda para você montar o satélite, o Telão de Ranking fica lá no topo e a Lojinha fica à direita! Vamos ajudar o Vale do Taquari!',
        hint: 'Lyra está sempre com você para dar dicas!'
      }
    ];
  },

  update(dt) {
    // Animações dos NPCs
  },

  getNearbyNPC(playerX, playerY, range = 64) {
    const curZone = GameMap.currentZone;
    for (const npc of this.npcs) {
      if (npc.zone !== curZone) continue;
      const dist = Math.hypot((npc.x + npc.w / 2) - (playerX + 12), (npc.y + npc.h / 2) - (playerY + 12));
      if (dist <= range) {
        return npc;
      }
    }
    return null;
  },

  render(ctx, cameraX, cameraY, nearbyNPC) {
    const time = Date.now() / 300;
    const curZone = GameMap.currentZone;

    for (const npc of this.npcs) {
      if (npc.zone !== curZone) continue;

      const rx = Math.round(npc.x - cameraX);
      const ry = Math.round(npc.y - cameraY);
      const isNear = nearbyNPC && nearbyNPC.id === npc.id;

      ctx.save();

      // Se for a Lyra
      if (npc.isLyra) {
        Lyra.render(ctx, rx + 12, ry + 12, 22, 'happy', '');
      } else {
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
      }

      // Nome do NPC acima dele — mas a Lyra fica SEM nome (não sobrepõe as conversas)
      if (!npc.isLyra) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(npc.name, rx + npc.w / 2, ry - 8);
      }

      // Balão indicador de interação (largura medida pelo texto — nunca vaza)
      if (isNear) {
        const bounce = Math.sin(time * 3) * 3;
        const bx = rx + npc.w / 2;
        const by = ry - 26 + bounce;
        const label = 'FALAR [E]';

        ctx.font = 'bold 11px "Segoe UI", sans-serif';
        const tw = ctx.measureText(label).width;
        const bw = Math.max(84, tw + 26);
        const bh = 22;

        // Fundo do balão
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx - bw / 2, by - 14, bw, bh, 7) : ctx.rect(bx - bw / 2, by - 14, bw, bh);
        ctx.fill();

        // Triângulo do balão
        ctx.beginPath();
        ctx.moveTo(bx - 5, by + 7);
        ctx.lineTo(bx + 5, by + 7);
        ctx.lineTo(bx, by + 13);
        ctx.closePath();
        ctx.fill();

        // Texto no balão (centralizado na vertical e na horizontal)
        ctx.fillStyle = '#0a0a2e';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, bx, by - 3.5);
        ctx.textBaseline = 'alphabetic';
      } else {
        // Ponto de exclamação dourado flutuando
        const bounce = Math.sin(time + npc.x) * 2;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px "Segoe UI", sans-serif';
        ctx.fillText('!', rx + npc.w / 2, ry - 16 + bounce);
      }

      ctx.restore();
    }
  }
};
