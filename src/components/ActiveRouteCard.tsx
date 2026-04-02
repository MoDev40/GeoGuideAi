import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Route as RouteIcon, Clock, Navigation, Circle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { RouteInfo } from '../types';

interface ActiveRouteCardProps {
  activeRoute: RouteInfo | null;
  currentStepIndex: number;
  onClose: () => void;
}

export const ActiveRouteCard = React.memo(({ activeRoute, currentStepIndex, onClose }: ActiveRouteCardProps) => {
  return (
    <AnimatePresence>
      {activeRoute && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-black text-white p-5 rounded-2xl shadow-2xl max-w-md border border-gray-800 pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RouteIcon className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Navigating to</span>
            </div>
            <button onClick={onClose} className="opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-xl font-bold mb-4">{activeRoute.destination}</h3>
          
          {activeRoute.stops && activeRoute.stops.length > 0 && (
            <div className="mb-6 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Optimized Stops</p>
              <div className="flex flex-wrap gap-2">
                {activeRoute.stops.map((stop, i) => (
                  <div key={stop.id} className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg text-[10px] font-medium">
                    <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[8px] font-bold">
                      {i + 1}
                    </span>
                    {stop.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">{activeRoute.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">{activeRoute.distance}</span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {activeRoute.steps.map((step, i) => (
              <div key={step.id} className="flex gap-3 items-start group">
                <div className="mt-1 flex flex-col items-center">
                  <Circle className={cn(
                    "w-2 h-2 transition-all duration-300", 
                    i === currentStepIndex ? "fill-blue-400 text-blue-400 scale-125" : 
                    i < currentStepIndex ? "fill-green-400 text-green-400 opacity-40" : "text-gray-600 opacity-40"
                  )} />
                  {i < activeRoute.steps.length - 1 && <div className={cn("w-px h-8 my-1 transition-colors duration-300", i < currentStepIndex ? "bg-green-400/20" : "bg-gray-700")} />}
                </div>
                <p className={cn(
                  "text-sm leading-tight transition-all duration-300", 
                  i === currentStepIndex ? "font-bold text-white" : 
                  i < currentStepIndex ? "opacity-30 text-green-400" : "opacity-60"
                )}>
                  {step.instruction}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
