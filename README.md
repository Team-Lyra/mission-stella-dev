# 🚀 Missão Taquari — Jogo Educativo Espacial

Um jogo educativo de exploração e simulação espacial voltado para estudantes de até 18 anos, ambientado no **Vale do Taquari**, RS, Brasil.

## 🎮 Sobre o Jogo

O jogador assume o papel de um jovem líder de uma agência espacial. A jogabilidade mistura movimentação em um mapa 2D (estilo RPG/Aventura) com minigames de simulação. O objetivo central é usar a tecnologia espacial para resolver problemas reais da região.

### Ciclo Principal (Core Loop)

1. **🌍 Planejar (Na Terra)** — Explorar o mapa, conversar com moradores e identificar problemas locais
2. **🚀 Realizar (No Espaço)** — Montar satélite, lançar e coletar dados
3. **📊 Impactar (Retorno)** — Aplicar soluções e ver a região se transformar

### Temas de Missão

- 🌾 **Agricultura de Precisão** — Monitorar plantações contra pragas e secas
- ⛰️ **Mapeamento de Deslizamentos** — Prevenir quedas de barreiras
- 📡 **Comunicação Rural** — Conectar produtores isolados
- 🌳 **Monitoramento Florestal** — Preservar matas ciliares do Rio Taquari

## 🛠️ Tecnologias

- **Frontend:** HTML5 Canvas + JavaScript puro (sem frameworks)
- **Backend:** Node.js + Express
- **Banco de Dados:** PostgreSQL

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+

## 🚀 Instalação

### 1. Clonar e instalar dependências

```bash
cd server
npm install
```

### 2. Configurar o banco de dados

```bash
# Criar o banco de dados
createdb missao_taquari

# Criar as tabelas
psql -d missao_taquari -f schema.sql

# Popular com dados iniciais
psql -d missao_taquari -f seed.sql
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `server/`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/missao_taquari
PORT=3000
```

### 4. Iniciar o servidor

```bash
cd server
node server.js
```

### 5. Jogar!

Abra o navegador em: **http://localhost:3000**

## 🎮 Controles

| Tecla | Ação |
|-------|------|
| ↑ ↓ ← → / WASD | Movimentar |
| E / Enter | Interagir com NPCs |
| Espaço | Confirmar / Avançar diálogo |
| ESC | Menu / Voltar |

## 📁 Estrutura do Projeto

```
missao-taquari/
├── server/           # Backend Node.js + PostgreSQL
│   ├── server.js     # Servidor Express
│   ├── db.js         # Conexão com PostgreSQL
│   ├── schema.sql    # Estrutura do banco
│   ├── seed.sql      # Dados iniciais
│   └── routes/       # Rotas da API
├── client/           # Frontend do jogo
│   ├── index.html    # Página principal
│   ├── css/          # Estilos
│   └── js/           # Código do jogo
└── README.md
```

## 📖 Dicas Educativas

Durante o jogo, o jogador recebe "Dicas da NASA" — textos educativos curtos sobre:
- Como funciona uma missão espacial
- Testes de satélites (vácuo, vibração, temperatura)
- Sensoriamento remoto
- Transmissão de dados espaciais
- Órbitas e posicionamento

## 🏫 Uso Educacional

Este jogo foi projetado para ser usado em escolas, mostrando que a tecnologia espacial traz benefícios diretos para a economia e segurança local — o espaço não serve apenas para "olhar estrelas"!

---

Desenvolvido como projeto educacional 🇧🇷

