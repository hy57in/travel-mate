import { useState, useEffect } from "react";

const CACHE_KEY = "tp-weather";
const CACHE_TTL = 3600000; // 1 hour

// OpenWeatherMap free tier: 5-day forecast
// No API key needed for this demo — uses wttr.in (no key, JSON API)
export default function useWeather(startDate, days) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!startDate || !days?.length) return;

    const start = new Date(startDate);
    const now = new Date();
    const diffDays = Math.ceil((start - now) / 86400000);

    // Only fetch if trip is within 5 days (free forecast range)
    if (diffDays > 5 || diffDays < -days.length) return;

    // Check cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) { setWeather(data); return; }
      } catch {}
    }

    // Fetch from wttr.in (Tokyo, no API key needed)
    fetch("https://wttr.in/Tokyo?format=j1")
      .then(r => r.json())
      .then(json => {
        const forecasts = json.weather?.map(w => ({
          date: w.date,
          maxC: w.maxtempC,
          minC: w.mintempC,
          desc: w.hourly?.[4]?.weatherDesc?.[0]?.value || "",
          icon: getWeatherEmoji(w.hourly?.[4]?.weatherCode),
        })) || [];
        setWeather(forecasts);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: forecasts, ts: Date.now() }));
      })
      .catch(() => {});
  }, [startDate, days?.length]);

  return weather;
}

function getWeatherEmoji(code) {
  const c = Number(code);
  if (c <= 113) return "\u2600\uFE0F"; // sunny
  if (c <= 176) return "\u26C5"; // partly cloudy
  if (c <= 200) return "\u2601\uFE0F"; // cloudy
  if (c <= 311) return "\uD83C\uDF27\uFE0F"; // rain
  if (c <= 395) return "\uD83C\uDF28\uFE0F"; // snow
  return "\u2601\uFE0F";
}
