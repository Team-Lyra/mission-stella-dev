// ============================================
// weather.js — Clima real (Meteomatics Weather API)
// Busca TODOS os dados do lugar do jogador via /api/weather
// e guarda em `lastData` para o HUD desenhar (junto das
// moedas/nível na barra do topo). Se o servidor estiver
// offline, o clima simplesmente não aparece (nunca quebra).
// ============================================

const Weather = {
  REFRESH_MS: 10 * 60 * 1000,
  timer: null,
  lastData: null,

  // Mapeia nomes de cidade (digitação do jogador no onboarding) -> id da API
  CITY_MATCHERS: [
    { id: 'estrela',     pattern: /estrela/i },
    { id: 'lajeado',     pattern: /lajeado/i },
    { id: 'pousonovo',   pattern: /pouso\s*novo/i },
    { id: 'taquari',     pattern: /taquari/i }
  ],

  async init() {
    await this.refresh();
    this.timer = setInterval(() => this.refresh(), this.REFRESH_MS);
    console.log('🌦️ [Weather] Clima para o HUD iniciado');
  },

  /** Descobre a cidade do jogador (salva no onboarding) ou usa Estrela como padrão */
  detectCity() {
    const savedLat = parseFloat(localStorage.getItem('missaoTaquari_cityLat'));
    const savedLon = parseFloat(localStorage.getItem('missaoTaquari_cityLon'));
    const savedName = localStorage.getItem('missaoTaquari_playerCity') || '';

    // Cidade escolhida no onboarding (com coordenadas do geocoding)
    if (!isNaN(savedLat) && !isNaN(savedLon)) {
      return {
        lat: savedLat,
        lon: savedLon,
        name: savedName || 'Sua região'
      };
    }

    // Fallback: cidades com nome registrado no jogo
    const playerCity = savedName;
    for (const m of this.CITY_MATCHERS) {
      if (m.pattern.test(playerCity)) return m.id;
    }
    return 'estrela';
  },

  weatherIcon(data) {
    if (data.precip > 0.5) return '🌧️';
    if (data.precip > 0.05) return '🌦️';
    if (data.wind > 35) return '💨';
    if (data.temp >= 28) return '☀️';
    if (data.temp <= 12) return '❄️';
    return '🌤️';
  },

  async refresh() {
    try {
      const c = this.detectCity();
      const qs = (typeof c === 'object' && c !== null && c.lat !== undefined)
        ? `lat=${c.lat}&lon=${c.lon}&name=${encodeURIComponent(c.name)}`
        : `city=${c}`;
      const res = await fetch(`/api/weather?${qs}`, {
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.lastData = await res.json();
    } catch (e) {
      // Servidor offline ou falha na API: o HUD só não mostra clima
      console.warn('[Weather] Clima indisponível:', e.message);
    }
  },

  /** Textos do clima para o HUD, em 3 níveis de detalhe — o jogo escolhe o que cabe.
      Usa TODAS as informações que a Meteomatics oferece: cidade, temperatura, chuva,
      umidade, vento, rajada, direção do vento e pressão. */
  hudText(mode) {
    const d = this.lastData;
    if (!d || d.temp === undefined) return null;
    const icon = this.weatherIcon(d);
    const city = String((d.city && d.city.name) || 'Sua região').slice(0, 16);

    const parts = [];
    if (d.precip !== undefined)  parts.push(`🌧️${d.precip.toFixed(1)}mm`);
    if (d.humidity !== undefined) parts.push(`💧${d.humidity}%`);
    if (d.wind !== undefined)    parts.push(`💨${d.wind}km/h`);
    if (d.gust !== undefined)    parts.push(`💥${d.gust}km/h`);
    if (d.windDir !== undefined) parts.push(`🧭${d.windDir}°`);
    if (d.pressure !== undefined) parts.push(`🌐${d.pressure}hPa`);

    if (mode === 'full')  return `${icon} ${city} ${d.temp}°C  ${parts.join('  ')}`;
    if (mode === 'short') return `${icon} ${city} ${d.temp}°C  ${parts.slice(0, 3).join('  ')}`;
    if (mode === 'tiny')  return `${icon} ${city} ${d.temp}°C`;
    return `${icon} ${d.temp}°C`; // mini
  }
};
