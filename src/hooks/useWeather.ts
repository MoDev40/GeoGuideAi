import { useState, useEffect, useRef } from 'react';
import { Location, WeatherData } from '../types';
import { WEATHER_UPDATE_INTERVAL } from '../constants';

const getWeatherLabel = (code: number) => {
  if (code === 0) return 'Clear Sky';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Cloudy';
};

export function useWeather(location: Location | null) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const lastLocationRef = useRef<{ lat: number, lon: number } | null>(null);

  useEffect(() => {
    if (!location) return;

    const { latitude, longitude } = location;
    
    // Only re-fetch if location changed significantly (approx 1km)
    if (lastLocationRef.current) {
      const dLat = Math.abs(latitude - lastLocationRef.current.lat);
      const dLon = Math.abs(longitude - lastLocationRef.current.lon);
      if (dLat < 0.01 && dLon < 0.01) return;
    }

    lastLocationRef.current = { lat: latitude, lon: longitude };

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!data.current || !data.daily) {
          throw new Error("Invalid weather data format");
        }
        
        setWeather({
          current: {
            temp: Math.round(data.current.temperature_2m),
            feelsLike: Math.round(data.current.apparent_temperature),
            condition: getWeatherLabel(data.current.weather_code),
            code: data.current.weather_code,
            isDay: data.current.is_day === 1,
            windSpeed: Math.round(data.current.wind_speed_10m),
            humidity: data.current.relative_humidity_2m,
          },
          forecast: data.daily.time.slice(1, 4).map((time: string, i: number) => ({
            id: `forecast-${time}-${i}`,
            day: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
            maxTemp: Math.round(data.daily.temperature_2m_max[i + 1]),
            minTemp: Math.round(data.daily.temperature_2m_min[i + 1]),
            code: data.daily.weather_code[i + 1],
          })),
        });
      } catch (err) {
        console.warn("Weather fetch failed, using fallback data:", err);
        // Fallback to a default state so the UI doesn't break
        setWeather({
          current: {
            temp: 22,
            feelsLike: 24,
            condition: 'Partly Cloudy',
            code: 2,
            isDay: true,
            windSpeed: 12,
            humidity: 45,
          },
          forecast: [
            { id: 'fallback-1', day: 'Tomorrow', maxTemp: 24, minTemp: 18, code: 1 },
            { id: 'fallback-2', day: 'Next Day', maxTemp: 23, minTemp: 17, code: 2 },
            { id: 'fallback-3', day: 'Third Day', maxTemp: 25, minTemp: 19, code: 0 },
          ],
        });
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, WEATHER_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [location]);

  return weather;
}
