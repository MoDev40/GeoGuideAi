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

// --- Services ---
import { parsePOIs, parseRoute } from './services/geminiParser';
import { GeminiService } from './services/geminiService';

// --- Types ---
import { 
  Message, 
  RouteInfo, 
  POI, 
  AppMode,
  RouteAlert,
  MapLayer
} from './types';

export default function App() {
  // --- State ---
  const { location, error } = useGeolocation();
  const weather = useWeather(location);
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mode, setMode] = useState<AppMode>('explore');
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null);
  const [poiResults, setPoiResults] = useState<POI[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [isPoiPanelOpen, setIsPoiPanelOpen] = useState(false);
  const [isHistorical, setIsHistorical] = useState(false);
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>([]);

  const { currentStepIndex, alerts: navigationAlerts, dismissAlert } = useNavigation(location, activeRoute, activeLayers);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Gemini Initialization ---
  const geminiService = useMemo(() => new GeminiService(process.env.GEMINI_API_KEY || ''), []);

  // --- Refs for Stable Callbacks ---
  // We use refs to store state that handleSend needs, so handleSend doesn't have to change on every keystroke.
  const stateRef = useRef({ input, mode, isHistorical, location, isLoading });
  useEffect(() => {
    stateRef.current = { input, mode, isHistorical, location, isLoading };
  }, [input, mode, isHistorical, location, isLoading]);

  // --- Handlers ---
  const handleSend = useCallback(async (e?: React.FormEvent, overrideMessage?: string) => {
    if (e) e.preventDefault();
    
    const { input: currentInput, mode: currentMode, isHistorical: currentIsHistorical, location: currentLocation, isLoading: currentIsLoading } = stateRef.current;
    
    const messageToSend = overrideMessage || currentInput;
    if (!messageToSend.trim() || currentIsLoading) return;

    const userMessage = messageToSend.trim();
    if (!overrideMessage) setInput('');
    
    if (currentMode !== 'route') {
      setMessages(prev => [...prev, { 
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        role: 'user', 
        text: userMessage 
      }]);
      setIsLoading(true);
      setIsSheetOpen(true);
    } else {
      setIsLoading(true);
    }

    try {
      const { text, groundingChunks } = await geminiService.generateResponse(
        userMessage,
        currentMode,
        currentIsHistorical,
        currentLocation
      );

      if (currentMode === 'explore') {
        const pois = parsePOIs(text);
        if (pois.length > 0) {
          setPoiResults(pois);
          setIsPoiPanelOpen(true);
        }
      }

      if (currentMode === 'route') {
        const route = parseRoute(text, userMessage, groundingChunks);
        if (route) {
          setActiveRoute(route);
          setMode('explore');
        }
      }

      setMessages(prev => [...prev, { 
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        role: 'model', 
        text, 
        groundingChunks 
      }]);
    } catch (err) {
      console.error("Gemini API Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      const isNetworkError = errorMessage.includes("Rpc failed") || errorMessage.includes("xhr error");
      
      setMessages(prev => [...prev, { 
        id: `msg-err-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        role: 'model', 
        text: isNetworkError 
          ? "I'm having trouble connecting to the map service right now. This is usually a temporary network issue. Please try again in a few seconds."
          : `Sorry, I encountered an error: ${errorMessage}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [geminiService]); // Stable dependency

  const handlePoiClick = useCallback((poi: POI) => {
    setSelectedPoi(poi);
  }, []);

  const handleRetry = useCallback((text: string) => {
    // We need the last user message. Since messages is a state, we can't easily get it without dependency.
    // But we can use the functional update pattern or just accept messages as a dependency for this specific handler.
    // However, handleRetry is only called when an error occurs, not on every keystroke.
    setMessages(prev => {
      const lastUserMsg = [...prev].reverse().find(m => m.role === 'user');
      if (lastUserMsg) handleSend(undefined, lastUserMsg.text);
      return prev;
    });
  }, [handleSend]);

  const handleClearAll = useCallback(() => {
    setPoiResults([]);
    setIsPoiPanelOpen(false);
    setActiveRoute(null);
    setIsHistorical(false);
  }, []);

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

  const handleVoiceCommand = useCallback((command: string, type: 'search' | 'route' | 'mode') => {
    if (type === 'mode') {
      setMode(command as AppMode);
      return;
    }

    if (type === 'route') {
      setMode('route');
      handleSend(undefined, command);
      return;
    }

    if (type === 'search') {
      setMode('explore');
      handleSend(undefined, command);
      return;
    }
  }, [handleSend]);

  // --- Effects ---
  // Proactive navigation alerts are now handled by useNavigation hook
  useEffect(() => {
    if (isSheetOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSheetOpen]);

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
