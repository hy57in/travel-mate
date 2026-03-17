import { useState, useEffect } from "react";
import type { Day, WeatherForecast } from "../types";

const CACHE_KEY = "tp-weather";
const CACHE_TTL = 3600000;

export default function useWeather(startDate: string | undefined, days: Day[] | undefined): WeatherForecast[] | null {
  const [weather, setWeather] = useState<WeatherForecast[] | null>(null);

  useEffect(() => {
    if (!startDate || !days?.length) return;

    const start = new Date(startDate);
    const now = new Date();
    const diffDays = Math.ceil((start.getTime() - now.getTime()) / 86400000);

    if (diffDays > 5 || diffDays < -days.length) return;

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) { setWeather(data); return; }
      } catch {}
    }

    fetch("https://wttr.in/Tokyo?format=j1")
      .then(r => r.json())
      .then((json: { weather?: Array<{ date: string; maxtempC: string; mintempC: string; hourly?: Array<{ weatherDesc?: Array<{ value: string }>; weatherCode?: string }> }> }) => {
        const forecasts: WeatherForecast[] = json.weather?.map(w => ({
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

function getWeatherEmoji(code: string | undefined): string {
  const c = Number(code);
  if (c <= 113) return "☀️";
  if (c <= 176) return "⛅";
  if (c <= 200) return "☁️";
  if (c <= 311) return "🌧️";
  if (c <= 395) return "🌨️";
  return "☁️";
}
