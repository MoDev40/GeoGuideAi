import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AnimatePresence, motion } from 'motion/react';
import { cn } from './lib/utils';

// --- Components ---
import { Header } from './components/Header';
import { MapArea } from './components/MapArea';
import { ChatSheet } from './components/ChatSheet';
import { QuickActions } from './components/QuickActions';
import { ActiveRouteCard } from './components/ActiveRouteCard';
import { PoiPanel } from './components/PoiPanel';
import { SearchBar } from './components/SearchBar';
import { PoiDetail } from './components/PoiDetail';
import { RouteAlerts } from './components/RouteAlerts';
import { LocationOverlay } from './components/LocationOverlay';
import { WeatherWidget } from './components/WeatherWidget';
import { TrafficStatus } from './components/TrafficStatus';

// --- Hooks ---
import { useGeolocation } from './hooks/useGeolocation';
import { useWeather } from './hooks/useWeather';
import { useNavigation } from './hooks/useNavigation';
import { useAppState } from './hooks/useAppState';
import { useChatState } from './hooks/useChatState';

// --- Services ---
import { GeminiService } from './services/geminiService';

// --- Types ---
import { 
  POI, 
  AppMode,
  MapLayer
} from './types';

export default function App() {
  // --- State & Logic Hooks ---
  const { location, error } = useGeolocation();
  const weather = useWeather(location);
  
  const {
    mode,
    setMode,
    isHistorical,
    activeLayers,
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
  } = useAppState();

  // --- Gemini Initialization ---
  const geminiService = useMemo(() => new GeminiService(process.env.GEMINI_API_KEY || ''), []);

  const onPoiResults = useCallback((pois: POI[]) => {
    setPoiResults(pois);
    setIsPoiPanelOpen(true);
  }, [setPoiResults, setIsPoiPanelOpen]);

  const onRouteFound = useCallback((route: any) => setActiveRoute(route), [setActiveRoute]);
  const onModeChange = useCallback((newMode: AppMode) => setMode(newMode), [setMode]);

  const {
    input,
    setInput,
    messages,
    isLoading,
    isSheetOpen,
    setIsSheetOpen,
    chatEndRef,
    handleSend,
    handleRetry,
    handleVoiceCommand
  } = useChatState(
    geminiService,
    location,
    mode,
    isHistorical,
    onPoiResults,
    onRouteFound,
    onModeChange
  );

  const { currentStepIndex, alerts: navigationAlerts, dismissAlert } = useNavigation(location, activeRoute, activeLayers);
  
  // --- Handlers ---
  const handlePoiClick = useCallback((poi: POI) => {
    setSelectedPoi(poi);
  }, [setSelectedPoi]);

  return (
    <div className={cn(
      "flex flex-col h-screen font-sans transition-colors duration-700 overflow-hidden",
      mode === 'discovery' ? "bg-[#0A0502] text-white" : "bg-[#F5F5F5] text-[#1A1A1A]"
    )}>
      {/* Atmospheric Background for Discovery Mode */}
      <AnimatePresence>
        {mode === 'discovery' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-0"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#3a1510_0%,transparent_60%),radial-gradient(circle_at_10%_80%,#ff4e00_0%,transparent_50%)] blur-[60px]" />
          </motion.div>
        )}
      </AnimatePresence>

      <Header mode={mode} location={location} />

      <main className="flex-1 relative z-1">
        <MapArea 
          mode={mode} 
          isHistorical={isHistorical} 
          poiResults={poiResults} 
          activeRoute={activeRoute}
          onPoiClick={handlePoiClick} 
          activeLayers={activeLayers}
        />

        {/* Overlays */}
        <div className="absolute top-16 left-6 right-6 flex flex-col md:flex-row gap-4 items-start justify-between pointer-events-none">
          <div className="flex flex-col gap-4">
            <LocationOverlay mode={mode} location={location} error={error} />
            <TrafficStatus activeLayers={activeLayers} mode={mode} />
          </div>
          <WeatherWidget weather={weather} mode={mode} />
        </div>

        <div className="absolute top-32 left-6 pointer-events-none">
          <ActiveRouteCard 
            activeRoute={activeRoute} 
            currentStepIndex={currentStepIndex}
            onClose={() => setActiveRoute(null)} 
          />
        </div>

        <PoiPanel 
          isOpen={isPoiPanelOpen} 
          poiResults={poiResults} 
          mode={mode} 
          onClose={() => setIsPoiPanelOpen(false)} 
          onPoiClick={handlePoiClick}
          onClearResults={() => setPoiResults([])}
        />

        <QuickActions 
          mode={mode} 
          isHistorical={isHistorical} 
          activeLayers={activeLayers}
          onModeToggle={handleModeToggle} 
          onHistoricalToggle={handleHistoricalToggle}
          onLayerToggle={handleLayerToggle}
          onClearAll={handleClearAll}
        />

        <PoiDetail 
          poi={selectedPoi} 
          mode={mode} 
          onClose={() => setSelectedPoi(null)} 
        />

        <RouteAlerts 
          alerts={navigationAlerts} 
          mode={mode} 
          onDismiss={dismissAlert} 
        />

        <SearchBar 
          mode={mode} 
          input={input} 
          isLoading={isLoading} 
          onInputChange={setInput} 
          onSubmit={handleSend} 
          onVoiceCommand={handleVoiceCommand}
          geminiService={geminiService}
        />
      </main>

      <ChatSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        mode={mode} 
        messages={messages} 
        isLoading={isLoading} 
        onRetry={handleRetry}
        chatEndRef={chatEndRef}
      />
    </div>
  );
}
