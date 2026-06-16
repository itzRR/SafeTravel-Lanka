import { WeatherData, ForecastDay } from "./types";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day",
    timezone: "Asia/Colombo",
  });

  const res = await fetch(`${BASE_URL}?${params}`, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error("Failed to fetch weather data");

  const data = await res.json();
  const c = data.current;

  return {
    temperature: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    apparentTemperature: c.apparent_temperature,
    precipitation: c.precipitation,
    weatherCode: c.weather_code,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    isDay: c.is_day === 1,
  };
}

export async function fetchForecast(lat: number, lng: number, days: number = 7): Promise<ForecastDay[]> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",
    timezone: "Asia/Colombo",
    forecast_days: days.toString(),
  });

  const res = await fetch(`${BASE_URL}?${params}`, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error("Failed to fetch forecast data");

  const data = await res.json();
  const d = data.daily;

  return d.time.map((date: string, i: number) => ({
    date,
    temperatureMax: d.temperature_2m_max[i],
    temperatureMin: d.temperature_2m_min[i],
    precipitationSum: d.precipitation_sum[i],
    precipitationProbability: d.precipitation_probability_max[i],
    windSpeedMax: d.wind_speed_10m_max[i],
    weatherCode: d.weather_code[i],
  }));
}

export async function fetchWeatherForMultipleLocations(
  locations: { lat: number; lng: number; name: string }[]
): Promise<Map<string, WeatherData>> {
  const results = new Map<string, WeatherData>();
  const promises = locations.map(async (loc) => {
    try {
      const weather = await fetchCurrentWeather(loc.lat, loc.lng);
      results.set(loc.name, weather);
    } catch {
      // Skip failed requests
    }
  });
  await Promise.all(promises);
  return results;
}
