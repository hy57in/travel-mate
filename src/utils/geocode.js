// Nominatim geocoding (free, no API key)
// Rate limit: 1 req/sec — we add delay for batch operations

const CACHE_KEY = "tp-geocache";
let cache = null;

function loadCache() {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { cache = {}; }
  return cache;
}

function saveCache() {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export async function geocodePlace(query) {
  if (!query) return null;
  const key = query.trim().toLowerCase();
  const c = loadCache();
  if (c[key]) return c[key];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "Accept-Language": "ko" } },
    );
    const data = await res.json();
    if (data[0]) {
      const result = { lat: Number(data[0].lat), lng: Number(data[0].lon) };
      c[key] = result;
      saveCache();
      return result;
    }
  } catch {}
  return null;
}

export async function geocodeBatch(items, hint = "") {
  const results = [];
  for (const item of items) {
    if (item.lat && item.lng) {
      results.push(item);
      continue;
    }
    const query = item.text.replace(/[#\d¥₩]+/g, "").trim() + (hint ? ` ${hint}` : "");
    const coords = await geocodePlace(query);
    if (coords) {
      results.push({ ...item, ...coords });
    } else {
      results.push(item);
    }
    // Nominatim rate limit: 1 req/sec
    await new Promise(r => setTimeout(r, 1100));
  }
  return results;
}
