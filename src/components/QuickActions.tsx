import React from 'react';
import { Sparkles, Route as RouteIcon, History, Globe, Compass, Map as MapIcon, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppMode, MapLayer } from '../types';

interface QuickActionsProps {
  mode: AppMode;
  isHistorical: boolean;
  activeLayers: MapLayer[];
  onModeToggle: (newMode: AppMode) => void;
  onHistoricalToggle: () => void;
  onLayerToggle: (layer: MapLayer) => void;
  onClearAll: () => void;
}

export const QuickActions = React.memo(({ 
  mode, 
  isHistorical, 
  activeLayers,
  onModeToggle, 
  onHistoricalToggle, 
  onLayerToggle,
  onClearAll 
}: QuickActionsProps) => {
  return (
    <div className="absolute bottom-32 right-6 flex flex-col gap-3">
      <button 
        onClick={() => onModeToggle(mode === 'discovery' ? 'explore' : 'discovery')}
        className={cn(
          "w-12 h-12 rounded-full shadow-lg flex items-center justify-center border transition-all",
          mode === 'discovery' ? "bg-orange-600 text-white border-orange-500" : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
        )}
        title="Discovery Mode"
      >
        <Sparkles className="w-6 h-6" />
      </button>
      <button 
        onClick={() => onModeToggle(mode === 'route' ? 'explore' : 'route')}
        className={cn(
          "w-12 h-12 rounded-full shadow-lg flex items-center justify-center border transition-all",
          mode === 'route' ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
        )}
        title="Route Mode"
      >
        <RouteIcon className="w-6 h-6" />
      </button>
      <button 
        onClick={onHistoricalToggle}
        className={cn(
          "w-12 h-12 rounded-full shadow-lg flex items-center justify-center border transition-all",
          isHistorical ? "bg-amber-900 text-amber-100 border-amber-800" : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
        )}
        title="Historical Mode"
      >
        <History className="w-6 h-6" />
      </button>

      {/* Layer Toggles */}
      <div className="flex flex-col gap-2 p-1 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl">
        <button 
          onClick={() => onLayerToggle('traffic')}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            activeLayers.includes('traffic') ? "bg-red-500 text-white" : "text-gray-400 hover:bg-gray-50"
          )}
          title="Traffic Layer"
        >
          <AlertCircle className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onLayerToggle('transport')}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            activeLayers.includes('transport') ? "bg-blue-500 text-white" : "text-gray-400 hover:bg-gray-50"
          )}
          title="Transport Layer"
        >
          <MapIcon className="w-5 h-5" />
        </button>
      </div>

      <button 
        onClick={onClearAll}
        className={cn(
          "w-12 h-12 rounded-full shadow-lg flex items-center justify-center border transition-all bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
        )}
        title="Clear All"
      >
        <Globe className="w-6 h-6" />
      </button>
    </div>
  );
});
