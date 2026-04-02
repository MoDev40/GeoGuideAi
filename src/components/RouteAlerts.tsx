import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, AlertTriangle, ChevronRight, CloudRain, ShieldAlert, TrafficCone } from 'lucide-react';
import { cn } from '../lib/utils';
import { RouteAlert, AppMode } from '../types';

interface RouteAlertsProps {
  alerts: RouteAlert[];
  mode: AppMode;
  onDismiss: (id: string) => void;
}

export const RouteAlerts = React.memo(({ alerts, mode, onDismiss }: RouteAlertsProps) => {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const getIcon = (alert: RouteAlert, size: number = 24) => {
    if (alert.subType === 'weather') return <CloudRain size={size} />;
    if (alert.subType === 'safety') return <ShieldAlert size={size} />;
    if (alert.subType === 'traffic') return <TrafficCone size={size} />;
    if (alert.type === 'turn') return <Navigation size={size} />;
    return <AlertTriangle size={size} />;
  };

  const getAlertColor = (alert: RouteAlert) => {
    if (alert.subType === 'weather') return "bg-blue-600 border-blue-500";
    if (alert.subType === 'safety') return "bg-amber-600 border-amber-500";
    if (alert.type === 'delay') return "bg-red-600 border-red-500";
    return mode === 'discovery' ? "bg-orange-600 border-orange-500" : "bg-black border-gray-800";
  };

  const getLabel = (alert: RouteAlert) => {
    if (alert.subType === 'weather') return 'Weather Alert';
    if (alert.subType === 'safety') return 'Safety Notice';
    if (alert.subType === 'traffic') return 'Traffic Delay';
    if (alert.type === 'turn') return 'Upcoming Turn';
    return 'Route Alert';
  };

  return (
    <div className="fixed bottom-28 left-6 right-6 z-[60] flex flex-col-reverse items-center pointer-events-none">
      <div className="w-full max-w-md flex flex-col-reverse gap-2">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setHoveredId(alert.id)}
              onHoverEnd={() => setHoveredId(null)}
              className={cn(
                "p-3 rounded-2xl shadow-xl border backdrop-blur-xl flex items-start gap-3 pointer-events-auto cursor-pointer active:scale-95 transition-all duration-300",
                getAlertColor(alert),
                "text-white",
                hoveredId === alert.id ? "p-4" : "p-3"
              )}
              onClick={() => onDismiss(alert.id)}
            >
              <div className="p-2 rounded-xl bg-white/20 shrink-0 mt-0.5">
                {getIcon(alert, hoveredId === alert.id ? 20 : 18)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                    {getLabel(alert)}
                  </p>
                  {alert.distance && (
                    <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-lg">
                      {alert.distance}
                    </span>
                  )}
                </div>
                <motion.p 
                  layout
                  className={cn(
                    "text-xs font-bold leading-tight",
                    hoveredId !== alert.id && "truncate"
                  )}
                >
                  {alert.message}
                </motion.p>
                {alert.delayTime && (
                  <p className="text-[10px] font-medium mt-0.5 opacity-80">+{alert.delayTime} delay expected</p>
                )}
                
                <AnimatePresence>
                  {hoveredId === alert.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 pt-2 border-t border-white/10"
                    >
                      <p className="text-[10px] opacity-80 leading-relaxed">
                        Tap to dismiss this alert. GeoGuide AI is monitoring your route in real-time.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className={cn(
                "opacity-40 shrink-0 transition-transform duration-300",
                hoveredId === alert.id ? "rotate-90" : "rotate-0"
              )}>
                <ChevronRight size={16} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});
