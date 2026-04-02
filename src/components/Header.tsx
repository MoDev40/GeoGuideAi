import React from 'react';
import { cn } from '../lib/utils';
import { AppMode, Location } from '../types';

interface HeaderProps {
  mode: AppMode;
  location: Location | null;
}

export const Header = React.memo(({ mode, location }: HeaderProps) => {
  return (
    <div className="fixed top-6 left-6 z-50 pointer-events-none">
      <div className={cn(
        "flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase transition-all",
        location 
          ? (mode === 'discovery' ? "text-orange-400" : "text-green-600")
          : "text-orange-600"
      )}>
        <div className={cn("w-2 h-2 rounded-full animate-pulse", location ? (mode === 'discovery' ? "bg-orange-500" : "bg-green-500") : "bg-orange-500")} />
        {location ? (location.name || "Live Tracking") : "Locating..."}
      </div>
    </div>
  );
});
