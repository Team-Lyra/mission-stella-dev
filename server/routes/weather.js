const express = require('express');
const router = express.Router();

// ============================================
// weather.js — Proxy da Meteomatics Weather API
// Consultas de clima real do Vale do Taquari.
// Credenciais ficam no servidor (.env) para não
// ficarem expostas no navegador.
// ============================================

const USER = process.env.METEOMATICS_USER;
const PASSWORD = process.env.METEOMATICS_PASSWORD;

const BASE_URL = 'https://api.meteomatics.com';

// Cidades do Vale do Taquari com coordenadas fixas
const CITIES = {
  estrela:    { name: 'Estrela (RS)',    lat: -29.5011, lon: -51.9644 },
  lajeado:    { name: 'Lajeado (RS)',    lat: -29.4603, lon: -51.9303 },
  'pouso-novo': { name: 'Pouso Novo (RS)', lat: -29.0228, lon: -52.0333 },
  taquari:    { name: 'Taquari (RS)',    lat: -29.6528, lon: -51.8564 }
};

// Parâmetros solicitados à API (todas as informações disponíveis)
const PARAMS = 't_2m:C,precip_1h:mm,wind_speed_10m:ms,windspeed_gust_10m:ms,relative_humidity_2m:p,msl_pressure:hPa,wind_dir_10m:d';

// Cache em memória (10 minutos) para não estourar a cota da API
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

// Cache do nome do lugar (24h — o nome não muda)
const REV_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const revCache = new Map();

/** Reverse geocoding: lat/lon -> nome do lugar atual (API BigDataCloud, gratuita, sem chave) */
async function reverseGeocode(lat, lon) {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = revCache.get(key);
  if (cached && Date.now() - cached.at < REV_CACHE_TTL_MS) return cached.name;

  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`Reverse geocode respondeu ${res.status}`);
  const d = await res.json();
  const name = d.city || d.locality || d.principalSubdivision || null;
  if (name) revCache.set(key, { at: Date.now(), name });
  return name;
}

function getAuthHeader() {
  if (!USER || !PASSWORD) return null;
  return 'Basic ' + Buffer.from(`${USER}:${PASSWORD}`).toString('base64');
}

/** Chama a Meteomatics e normaliza a resposta */
async function fetchFromMeteomatics(lat, lon) {
  const url = `${BASE_URL}/now/${PARAMS}/${lat},${lon}/json`;
  const headers = {};
  const auth = getAuthHeader();
  if (auth) headers.Authorization = auth;

  const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    throw new Error(`Meteomatics respondeu ${res.status}`);
  }

  const body = await res.json();

  // Normaliza o formato da Meteomatics
  const out = {};
  for (const p of body.parameters || []) {
    const value = p.coordinates?.[0]?.value;
    if (value === undefined || value === null) continue;
    switch (p.name) {
      case 't_2m:C':                out.temp = Math.round(value); break;
      case 'precip_1h:mm':          out.precip = value; break;
      case 'wind_speed_10m:ms':     out.wind = Math.round(value * 3.6); break; // m/s -> km/h
      case 'windspeed_gust_10m:ms': out.gust = Math.round(value * 3.6); break;
      case 'relative_humidity_2m:p': out.humidity = Math.round(value); break;
      case 'msl_pressure:hPa':      out.pressure = Math.round(value); break;
      case 'wind_dir_10m:d':        out.windDir = Math.round(value); break;
    }
  }
  return out;
}

/** Dados simulados plausíveis para o Vale do Taquari (fallback) */
function simulatedWeather() {
  const hour = new Date().getHours();
  const dayTemp = 22 + Math.round(8 * Math.sin(((hour - 6) / 24) * Math.PI * 2));
  return {
    temp: dayTemp,
    precip: Math.round(Math.random() * 20) / 100,
    wind: 8 + Math.round(Math.random() * 14),
    gust: 14 + Math.round(Math.random() * 20),
    humidity: 45 + Math.round(Math.random() * 35),
    pressure: 1008 + Math.round(Math.random() * 12),
    windDir: Math.round(Math.random() * 360)
  };
}

// GET /api/weather?city=estrela   — cidades fixas do Vale do Taquari
// GET /api/weather?lat=-29&lon=-52&name=Guapore — cidade escolhida no onboarding
router.get('/', async (req, res) => {
  const hasCustom = req.query.lat !== undefined && req.query.lon !== undefined;

  let cityKey, city, lat, lon;
  if (hasCustom) {
    lat = parseFloat(req.query.lat);
    lon = parseFloat(req.query.lon);
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'lat/lon inválidos' });
    }
    cityKey = `@${lat.toFixed(2)},${lon.toFixed(2)}`;
    // O nome exibido é o que a API da localização ATUAL traz (não o digitado)
    let placeName = 'Sua região';
    try {
      placeName = await reverseGeocode(lat, lon) || placeName;
    } catch (e) {
      console.warn('⚠️ [Weather] Reverse geocoding falhou, usarei o nome padrão:', e.message);
    }
    city = { name: String(placeName).slice(0, 60), lat, lon };
  } else {
    cityKey = String(req.query.city || 'estrela').toLowerCase();
    city = CITIES[cityKey] || CITIES.estrela;
  }

  // Serve do cache se ainda estiver válido
  const cached = cache.get(cityKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return res.json({ ...cached.data, city, simulated: cached.simulated });
  }

  try {
    if (!getAuthHeader()) {
      console.warn('⚠️ [Weather] METEOMATICS_USER/METEOMATICS_PASSWORD não configurados — usando dados simulados');
      throw new Error('sem credenciais');
    }

    const data = await fetchFromMeteomatics(city.lat, city.lon);
    const payload = { ...data, fetched_at: new Date().toISOString() };
    cache.set(cityKey, { at: Date.now(), data: payload, simulated: false });
    return res.json({ ...payload, city, simulated: false });
  } catch (err) {
    console.warn(`⚠️ [Weather] Falha na Meteomatics (${err.message}) — usando dados simulados`);
    const payload = { ...simulatedWeather(), fetched_at: new Date().toISOString() };
    cache.set(cityKey, { at: Date.now(), data: payload, simulated: true });
    return res.json({ ...payload, city, simulated: true });
  }
});

// GET /api/weather/cities — lista de cidades disponíveis
router.get('/cities', (req, res) => {
  res.json(Object.entries(CITIES).map(([id, c]) => ({ id, ...c })));
});

module.exports = router;
