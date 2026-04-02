import { useState, useEffect, useRef, useCallback } from 'react';
import { Location, RouteInfo, RouteAlert, MapLayer } from '../types';

// Helper to calculate distance between two coordinates in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function useNavigation(location: Location | null, activeRoute: RouteInfo | null, activeLayers: MapLayer[] = []) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [alerts, setAlerts] = useState<RouteAlert[]>([]);
  const lastSpokenRef = useRef<string | null>(null);
  const lastStepIndexRef = useRef<number>(-1);
  const lastTrafficAlertRef = useRef<number>(0);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      lastSpokenRef.current = text;
    }
  }, []);

  useEffect(() => {
    if (!activeRoute || !location) {
      setCurrentStepIndex(0);
      setAlerts([]);
      lastSpokenRef.current = null;
      lastStepIndexRef.current = -1;
      return;
    }

    // If we just started a new route, announce the first step
    if (lastStepIndexRef.current === -1) {
      const firstStep = activeRoute.steps[0]?.instruction;
      if (firstStep) {
        speak(`Starting navigation to ${activeRoute.destination}. ${firstStep}`);
        lastStepIndexRef.current = 0;
      }
    }

    // Simulate traffic alerts if traffic layer is active
    if (activeLayers.includes('traffic') && Date.now() - lastTrafficAlertRef.current > 45000) {
      const trafficMessages = [
        "Heavy traffic detected ahead on your route. Expect a 5-minute delay.",
        "Congestion clearing up. Your estimated arrival time has improved by 2 minutes.",
        "Accident reported 2 miles ahead. Rerouting to avoid the delay.",
        "Slow traffic for the next 0.5 miles due to roadwork."
      ];
      const randomMsg = trafficMessages[Math.floor(Math.random() * trafficMessages.length)];
      
      setAlerts(prev => [...prev, {
        id: `traffic-alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${prev.length}`,
        type: 'delay',
        subType: 'traffic',
        message: randomMsg,
        delayTime: randomMsg.includes('5-minute') ? '5m' : undefined
      }]);
      speak(randomMsg);
      lastTrafficAlertRef.current = Date.now();
    }

    // In a real app, we'd check distance to the next step's coordinates.
    // Since we don't have real step coordinates from the text parser, 
    // we'll "simulate" progress through the steps based on distance to destination 
    // or just provide the next step as an alert.
    
    // For now, let's provide a "Live" feel by announcing the current step if it changes.
    const currentStep = activeRoute.steps[currentStepIndex];
    if (currentStep && lastStepIndexRef.current !== currentStepIndex) {
      speak(currentStep.instruction);
      lastStepIndexRef.current = currentStepIndex;
      
      // Add a visual alert
      setAlerts(prev => [...prev, {
        id: `nav-alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${prev.length}`,
        type: 'turn',
        message: currentStep.instruction,
        distance: currentStep.distance
      }]);
    }

    // Simulate moving through steps every 30 seconds for demo purposes 
    // if the user is actually moving (location changes)
    const timer = setTimeout(() => {
      if (currentStepIndex < activeRoute.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [location, activeRoute, currentStepIndex, speak]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return {
    currentStepIndex,
    alerts,
    dismissAlert
  };
}
