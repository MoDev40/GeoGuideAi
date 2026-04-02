import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, MapPin, Star, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppMode, POI } from '../types';
import { shareLocation } from '../lib/share';

interface PoiPanelProps {
  isOpen: boolean;
  poiResults: POI[];
  mode: AppMode;
  onClose: () => void;
  onPoiClick: (poi: POI) => void;
  onClearResults: () => void;
}

export const PoiPanel = React.memo(({ 
  isOpen, 
  poiResults, 
  mode, 
  onClose, 
  onPoiClick, 
  onClearResults 
}: PoiPanelProps) => {
  const handleShare = (e: React.MouseEvent, poi: POI) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${poi.name} ${poi.address}`)}`;
    shareLocation(
      poi.name,
      `Check out this place: ${poi.name} at ${poi.address}`,
      url
    );
  };

  return (
    <AnimatePresence>
      {isOpen && poiResults.length > 0 && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          className={cn(
            "absolute left-6 bottom-32 w-72 max-h-[400px] overflow-hidden flex flex-col rounded-2xl shadow-2xl border z-20 transition-colors duration-500 pointer-events-auto",
            mode === 'discovery' ? "bg-black/60 border-white/10 backdrop-blur-xl text-white" : "bg-white/90 border-white text-gray-800 backdrop-blur-md"
          )}
        >
          <div className="p-4 border-b border-current/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search size={16} className="opacity-50" />
              <h3 className="text-xs font-bold uppercase tracking-widest">Search Results</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-current/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {poiResults.map((poi) => (
              <div key={poi.id} className="relative group/item mb-1">
                <button
                  onClick={() => onPoiClick(poi)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-all hover:bg-current/5 group",
                    mode === 'discovery' ? "hover:bg-orange-500/10" : "hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg shrink-0",
                      mode === 'discovery' ? "bg-orange-500/20 text-orange-400" : "bg-gray-100 text-gray-600"
                    )}>
                      <MapPin size={14} />
                    </div>
                    <div className="min-w-0 flex-1 pr-8">
                      <p className="text-sm font-bold truncate">{poi.name}</p>
                      <p className="text-[10px] opacity-50 truncate">{poi.address}</p>
                      {poi.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={10} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-[10px] font-bold">{poi.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => handleShare(e, poi)}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all",
                    mode === 'discovery' ? "hover:bg-white/10 text-orange-400" : "hover:bg-gray-200 text-gray-400"
                  )}
                  title="Share POI"
                >
                  <Share2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="p-3 bg-current/5 text-center">
            <button 
              onClick={onClearResults}
              className="text-[10px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
            >
              Clear Results
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
