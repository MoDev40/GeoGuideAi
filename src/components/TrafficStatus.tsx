import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { MapLayer } from '../types';

interface TrafficStatusProps {
  activeLayers: MapLayer[];
  mode: 'explore' | 'route' | 'discovery';
}

export const TrafficStatus = React.memo(({ activeLayers, mode }: TrafficStatusProps) => {
  const isActive = activeLayers.includes('traffic');

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="pointer-events-auto"
        >
          <div className={cn(
            "px-4 py-2 rounded-2xl shadow-xl border backdrop-blur-xl flex items-center gap-4 transition-colors",
            mode === 'discovery' ? "bg-white/10 border-white/20 text-white" : "bg-white/80 border-gray-100 text-gray-800"
          )}>
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle size={16} className="animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Live Traffic</span>
            </div>
            
            <div className="h-4 w-px bg-current opacity-20" />
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-red-500" />
                <span className="text-[10px] font-bold opacity-70">Heavy: 12%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-500" />
                <span className="text-[10px] font-bold opacity-70">Avg Delay: 4m</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
