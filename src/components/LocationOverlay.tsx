import React from 'react';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Location } from '../types';

interface LocationOverlayProps {
  mode: 'explore' | 'route' | 'discovery';
  location: Location | null;
  error: string | null;
}

export const LocationOverlay = React.memo(({ mode, location, error }: LocationOverlayProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "px-4 py-2 rounded-2xl shadow-xl border backdrop-blur-xl flex items-center gap-3 pointer-events-auto",
        mode === 'discovery' ? "bg-white/10 border-white/20 text-white" : "bg-white/80 border-gray-100 text-gray-800"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
        mode === 'discovery' ? "bg-orange-600 text-white" : "bg-black text-white"
      )}>
        {location ? <MapPin className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
      </div>
      
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
          {location?.name || "Current Location"}
        </span>
        <span className="text-sm font-bold truncate max-w-[150px]">
          {error ? "Location Error" : (location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Locating...")}
        </span>
      </div>

      {error && (
        <div className="ml-2 text-red-500">
          <AlertCircle className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  );
});
