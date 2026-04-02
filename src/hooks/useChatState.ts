import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, AppMode, Location } from '../types';
import { GeminiService } from '../services/geminiService';
import { parsePOIs, parseRoute } from '../services/geminiParser';

export function useChatState(
  geminiService: GeminiService,
  location: Location | null,
  mode: AppMode,
  isHistorical: boolean,
  onPoiResults: (pois: any[]) => void,
  onRouteFound: (route: any) => void,
  onModeChange: (mode: AppMode) => void
) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Stable ref for state to avoid handleSend changing on every keystroke
  const stateRef = useRef({ input, mode, isHistorical, location, isLoading });
  useEffect(() => {
    stateRef.current = { input, mode, isHistorical, location, isLoading };
  }, [input, mode, isHistorical, location, isLoading]);

  const handleSend = useCallback(async (e?: React.FormEvent, overrideMessage?: string) => {
    if (e) e.preventDefault();
    
    const { input: currentInput, mode: currentMode, isHistorical: currentIsHistorical, location: currentLocation, isLoading: currentIsLoading } = stateRef.current;
    
    const messageToSend = overrideMessage || currentInput;
    if (!messageToSend.trim() || currentIsLoading) return;

    // Immediately mark as loading to prevent duplicate sends
    setIsLoading(true);
    stateRef.current.isLoading = true;

    const userMessage = messageToSend.trim();
    if (!overrideMessage) setInput('');
    
    if (currentMode !== 'route') {
      setMessages(prev => [...prev, { 
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${prev.length}`,
        role: 'user', 
        text: userMessage 
      }]);
      setIsSheetOpen(true);
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
          onPoiResults(pois);
        }
      }

      if (currentMode === 'route') {
        const route = parseRoute(text, userMessage, groundingChunks);
        if (route) {
          onRouteFound(route);
          onModeChange('explore');
        }
      }

      setMessages(prev => [...prev, { 
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${prev.length}`,
        role: 'model', 
        text, 
        groundingChunks 
      }]);
    } catch (err) {
      console.error("Gemini API Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      const isNetworkError = errorMessage.includes("Rpc failed") || errorMessage.includes("xhr error");
      
      setMessages(prev => [...prev, { 
        id: `msg-err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${prev.length}`,
        role: 'model', 
        text: isNetworkError 
          ? "I'm having trouble connecting to the map service right now. This is usually a temporary network issue. Please try again in a few seconds."
          : `Sorry, I encountered an error: ${errorMessage}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      stateRef.current.isLoading = false;
    }
  }, [geminiService, onPoiResults, onRouteFound, onModeChange]);

  const handleRetry = useCallback((text: string) => {
    handleSend(undefined, text);
  }, [handleSend]);

  const handleVoiceCommand = useCallback((command: string, type: 'search' | 'route' | 'mode') => {
    if (type === 'mode') {
      onModeChange(command as AppMode);
      return;
    }

    if (type === 'route') {
      onModeChange('route');
      handleSend(undefined, command);
      return;
    }

    if (type === 'search') {
      onModeChange('explore');
      handleSend(undefined, command);
      return;
    }
  }, [handleSend, onModeChange]);

  useEffect(() => {
    if (isSheetOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSheetOpen]);

  return {
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
  };
}
