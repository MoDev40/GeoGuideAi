import { useState, useCallback } from 'react';
import { AppMode, MapLayer, POI, RouteInfo } from '../types';

export function useAppState() {
  const [mode, setMode] = useState<AppMode>('explore');
  const [isHistorical, setIsHistorical] = useState(false);
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>([]);
  const [poiResults, setPoiResults] = useState<POI[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [isPoiPanelOpen, setIsPoiPanelOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null);

  const handleModeToggle = useCallback((newMode: AppMode) => {
    setMode(newMode);
    if (newMode === 'route') setActiveRoute(null);
  }, []);

  const handleHistoricalToggle = useCallback(() => {
    setIsHistorical(prev => {
      const next = !prev;
      if (next) setMode('discovery');
      return next;
    });
  }, []);

  const handleLayerToggle = useCallback((layer: MapLayer) => {
    setActiveLayers(prev => 
      prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
    );
  }, []);

  const handleClearAll = useCallback(() => {
    setPoiResults([]);
    setIsPoiPanelOpen(false);
    setActiveRoute(null);
    setIsHistorical(false);
  }, []);

  return {
    mode,
    setMode,
    isHistorical,
    setIsHistorical,
    activeLayers,
    setActiveLayers,
    poiResults,
    setPoiResults,
    selectedPoi,
    setSelectedPoi,
    isPoiPanelOpen,
    setIsPoiPanelOpen,
    activeRoute,
    setActiveRoute,
    handleModeToggle,
    handleHistoricalToggle,
    handleLayerToggle,
    handleClearAll
  };
}
