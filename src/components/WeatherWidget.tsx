import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { WeatherData } from '../types';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  mode: 'explore' | 'route' | 'discovery';
}

export const WeatherWidget = React.memo(({ weather, mode }: WeatherWidgetProps) => {
  if (!weather) return null;

  const { current } = weather;

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-4 h-4 text-yellow-500" />;
    if (code >= 1 && code <= 3) return <Cloud className="w-4 h-4 text-gray-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-4 h-4 text-blue-400" />;
    if (code >= 71 && code <= 77) return <CloudSnow className="w-4 h-4 text-blue-200" />;
    return <Cloud className="w-4 h-4 text-gray-400" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "px-4 py-2 rounded-2xl shadow-xl border backdrop-blur-xl flex items-center gap-4 pointer-events-auto",
        mode === 'discovery' ? "bg-white/10 border-white/20 text-white" : "bg-white/80 border-gray-100 text-gray-800"
      )}
    >
      <div className="flex items-center gap-2 border-r border-gray-200/20 pr-4">
        {getWeatherIcon(current.code)}
        <span className="text-sm font-bold">{current.temp}°</span>
      </div>
      
      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-60">
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3" />
          <span>{current.windSpeed} km/h</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          <span>{current.humidity}%</span>
        </div>
      </div>
    </motion.div>
  );
});
