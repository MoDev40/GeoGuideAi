import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppMode, POI, MapLayer, RouteInfo } from '../types';

interface MapAreaProps {
  mode: AppMode;
  isHistorical: boolean;
  poiResults: POI[];
  activeRoute: RouteInfo | null;
  onPoiClick: (poi: POI) => void;
  activeLayers: MapLayer[];
}

export const MapArea = React.memo(({ mode, isHistorical, poiResults, activeRoute, onPoiClick, activeLayers }: MapAreaProps) => {
  return (
    <div className={cn("absolute inset-0 transition-all duration-1000", isHistorical && "sepia-[0.6] grayscale-[0.2]")}>
      {/* Mock Map Background */}
      <div className={cn(
        "absolute inset-0 opacity-40 pointer-events-none overflow-hidden transition-opacity",
        mode === 'discovery' ? "opacity-20" : "opacity-40"
      )}>
        <div className="absolute inset-0" style={{ 
          backgroundImage: `radial-gradient(${mode === 'discovery' ? '#fff' : '#000'} 1px, transparent 1px)`, 
          backgroundSize: '40px 40px' 
        }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "w-[800px] h-[800px] border rounded-full animate-[spin_60s_linear_infinite]",
            mode === 'discovery' ? "border-white/10" : "border-black/10"
          )} />
        </div>
      </div>

      {/* Layer Overlays */}
      <AnimatePresence>
        {activeLayers.includes('traffic') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#ff4444_20px,#ff4444_40px)] opacity-10 animate-[pulse_4s_ease-in-out_infinite]" />
            <svg className="absolute inset-0 w-full h-full">
              {/* Main Arteries - Heavy Traffic */}
              <path d="M0,150 L1600,150" fill="none" stroke="#ff4444" strokeWidth="8" strokeDasharray="20,10" className="animate-[dash_10s_linear_infinite] opacity-60" />
              <path d="M400,0 L400,1600" fill="none" stroke="#ff4444" strokeWidth="8" strokeDasharray="20,10" className="animate-[dash_12s_linear_infinite] opacity-60" />
              
              {/* Side Streets - Moderate Traffic */}
              <path d="M0,450 L1600,450" fill="none" stroke="#ffbb33" strokeWidth="4" strokeDasharray="15,15" className="animate-[dash_20s_linear_infinite] opacity-40" />
              <path d="M800,0 L800,1600" fill="none" stroke="#ffbb33" strokeWidth="4" strokeDasharray="15,15" className="animate-[dash_25s_linear_infinite] opacity-40" />
              
              {/* Diagonal Routes */}
              <path d="M0,0 L1600,1600" fill="none" stroke="#ff4444" strokeWidth="6" strokeDasharray="25,15" className="animate-[dash_15s_linear_infinite] opacity-30" />
              <path d="M1600,0 L0,1600" fill="none" stroke="#00C851" strokeWidth="4" strokeDasharray="30,20" className="animate-[dash_30s_linear_infinite] opacity-30" />
            </svg>
            <style>{`
              @keyframes dash {
                to {
                  stroke-dashoffset: -1000;
                }
              }
            `}</style>
          </motion.div>
        )}

        {activeLayers.includes('transport') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            <svg className="w-full h-full opacity-30">
              <path d="M0,100 Q400,300 800,100 T1600,100" fill="none" stroke="#33b5e5" strokeWidth="4" strokeDasharray="10,5" />
              <path d="M100,0 Q300,400 100,800 T100,1600" fill="none" stroke="#33b5e5" strokeWidth="4" strokeDasharray="10,5" />
              <path d="M0,400 L1600,400" fill="none" stroke="#aa66cc" strokeWidth="6" strokeDasharray="15,10" />
            </svg>
          </motion.div>
        )}

        {activeLayers.includes('cycling') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            <svg className="w-full h-full opacity-40">
              <path d="M0,200 C200,200 400,600 600,400 S1000,200 1200,400" fill="none" stroke="#00C851" strokeWidth="3" />
              <path d="M200,0 C200,200 600,400 400,600 S200,1000 400,1200" fill="none" stroke="#00C851" strokeWidth="3" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route Destination Marker */}
      <AnimatePresence>
        {activeRoute && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute z-30 pointer-events-none"
            style={{ left: '70%', top: '30%' }} // Mock destination position
          >
            <div className="relative flex flex-col items-center">
              <div className="bg-blue-600 text-white p-3 rounded-full shadow-2xl animate-bounce">
                <MapPin size={24} />
              </div>
              <div className="mt-2 bg-black text-white px-3 py-1 rounded-lg text-xs font-bold shadow-xl whitespace-nowrap">
                {activeRoute.destination}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POI Markers on Mock Map */}
      <AnimatePresence>
        {poiResults.map((poi) => (
          <motion.div
            key={poi.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute z-20 cursor-pointer group"
            style={{ left: `${poi.x}%`, top: `${poi.y}%` }}
            onClick={() => onPoiClick(poi)}
          >
            <div className="relative">
              <div className={cn(
                "p-2 rounded-full shadow-lg transition-transform group-hover:scale-110",
                mode === 'discovery' ? "bg-orange-600 text-white" : "bg-black text-white"
              )}>
                <MapPin size={16} />
              </div>
              <div className={cn(
                "absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-sm",
                mode === 'discovery' ? "bg-orange-900 text-orange-100" : "bg-white text-black"
              )}>
                {poi.name}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
