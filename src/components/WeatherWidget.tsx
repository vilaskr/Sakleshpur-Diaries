import { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Droplets, Wind, Loader2 } from 'lucide-react';

interface WeatherData {
  temperature: number;
  weathercode: number;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Coordinates for Sakleshpur
    const lat = 12.9366;
    const lon = 75.7891;
    
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then(res => res.json())
      .then(data => {
        if (data && data.current_weather) {
          setWeather({
            temperature: data.current_weather.temperature,
            weathercode: data.current_weather.weathercode,
          });
        }
      })
      .catch(err => console.error("Error fetching weather:", err))
      .finally(() => setLoading(false));
  }, []);

  const getWeatherDetails = (code: number) => {
    // WMO Weather interpretation codes
    if (code === 0) return { condition: 'Clear Sky', icon: <Sun className="w-8 h-8 text-yellow-400" /> };
    if (code === 1 || code === 2 || code === 3) return { condition: 'Partly Cloudy', icon: <Cloud className="w-8 h-8 text-gray-300" /> };
    if (code >= 51 && code <= 67) return { condition: 'Rainy', icon: <CloudRain className="w-8 h-8 text-blue-400" /> };
    if (code >= 71 && code <= 82) return { condition: 'Heavy Rain', icon: <Droplets className="w-8 h-8 text-blue-500" /> };
    return { condition: 'Cloudy', icon: <Wind className="w-8 h-8 text-gray-400" /> };
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 flex items-center justify-center w-full min-h-[120px]">
        <Loader2 className="w-6 h-6 text-white animate-spin" />
      </div>
    );
  }

  if (!weather) return null;

  const { condition, icon } = getWeatherDetails(weather.weathercode);

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 w-full md:w-auto relative group overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex justify-between items-start gap-8">
        <div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Current Weather</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-white">{Math.round(weather.temperature)}°C</span>
            <span className="text-white/80 font-medium mb-1">{condition}</span>
          </div>
        </div>
        <div className="bg-white/10 p-3 rounded-2xl shadow-inner">
          {icon}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-brand-yellow text-xs font-bold uppercase tracking-wider">Best time to visit</span>
        <span className="text-white/80 text-sm font-medium">Oct - March</span>
      </div>
    </div>
  );
}
