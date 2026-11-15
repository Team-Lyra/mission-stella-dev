const express = require('express');
const router = express.Router();

// ============================================
// geocode.js — Conversão "nome de cidade" -> coordenadas
// Usa a API de geocodificação gratuita do Open-Meteo
// (apenas para achar lat/lon — o CLIMA continua vindo
// exclusivamente da Meteomatics Weather API).
// ============================================

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

// Cache em memória de 1 hora para não repetir buscas idênticas
const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map();

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// GET /api/geocode?name=guapore&count=6
router.get('/', async (req, res) => {
  const name = String(req.query.name || '').trim();
  const count = Math.min(parseInt(req.query.count) || 6, 10);

  if (name.length < 2) {
    return res.json({ results: [] });
  }

  const key = normalize(name);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return res.json({ results: cached.results.slice(0, count) });
  }

  try {
    const url = `${GEO_URL}?name=${encodeURIComponent(name)}&count=10&language=pt&format=json&countryCode=BR`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!resp.ok) throw new Error(`Geocoding respondeu ${resp.status}`);

    const body = await resp.json();
    const results = (body.results || []).map(r => ({
      name: r.name,
      admin1: r.admin1 || null,   // estado, ex.: "Rio Grande do Sul"
      admin2: r.admin2 || null,   // região/mesorregião
      country: r.country || 'Brasil',
      lat: r.latitude,
      lon: r.longitude,
      // Rótulo amigável para crianças: "Guaporé, RS, Brasil"
      label: [
        r.name,
        r.admin1 ? shortState(r.admin1) : null,
        r.country || 'Brasil'
      ].filter(Boolean).join(', ')
    }));

    cache.set(key, { at: Date.now(), results });
    return res.json({ results: results.slice(0, count) });
  } catch (err) {
    console.warn(`⚠️ [Geocode] Falha na busca por "${name}":`, err.message);
    return res.status(200).json({ results: [], error: 'geocode_indisponivel' });
  }
});

// Abrevia nomes longos de estado para ficar curto no botão
function shortState(admin1) {
  const map = {
    'Rio Grande do Sul': 'RS',
    'Santa Catarina': 'SC',
    'Paraná': 'PR',
    'São Paulo': 'SP',
    'Rio de Janeiro': 'RJ',
    'Minas Gerais': 'MG',
    'Espírito Santo': 'ES',
    'Mato Grosso do Sul': 'MS',
    'Mato Grosso': 'MT',
    'Goiás': 'GO',
    'Distrito Federal': 'DF',
    'Bahia': 'BA',
    'Pernambuco': 'PE',
    'Ceará': 'CE',
    'Pará': 'PA',
    'Amazonas': 'AM'
  };
  return map[admin1] || admin1;
}

module.exports = router;
