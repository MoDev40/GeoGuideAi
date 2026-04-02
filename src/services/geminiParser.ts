import { POI, RouteStep, RouteInfo, RouteStop } from '../types';

export function parsePOIs(text: string): POI[] {
  const pois: POI[] = [];
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    if (line.startsWith('PLACE:')) {
      const parts = line.replace('PLACE:', '').split('|').map(p => p.trim());
      if (parts.length >= 2) {
        pois.push({
          id: `poi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: parts[0],
          address: parts[1],
          rating: parts[2] || undefined,
          phone: parts[3] || undefined,
          hours: parts[4] || undefined,
          reviews: parts[5] ? parts[5].split(';').map(r => r.trim()) : undefined,
          photoUrl: parts[6] || undefined,
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60
        });
      }
    }
  });
  return pois;
}

export function parseRoute(text: string, destination: string, groundingMetadata?: any): RouteInfo | null {
  const steps: RouteStep[] = [];
  const stops: RouteStop[] = [];
  const lines = text.split('\n');
  let estTime = "Calculating...";
  let dist = "Calculating...";
  let destinationCoords: { lat: number; lng: number } | undefined;

  // Try to find destination coordinates from grounding metadata
  if (groundingMetadata?.groundingChunks) {
    const mapChunk = groundingMetadata.groundingChunks.find((chunk: any) => chunk.maps);
    if (mapChunk?.maps?.uri) {
      // Very basic extraction from URI if possible, or just use the title
      // In a real app, we'd use a more robust way to get lat/lng from the tool response
      // For now, let's look for any lat/lng-like patterns in the text or metadata
    }
  }

  lines.forEach(line => {
    if (line.toLowerCase().includes('time:') || line.toLowerCase().includes('duration:')) {
      estTime = line.split(':')[1]?.trim() || estTime;
    }
    if (line.toLowerCase().includes('traffic') || line.toLowerCase().includes('delay')) {
      // If traffic is mentioned, we can append it to the estimated time or steps
      if (line.toLowerCase().includes('delay:')) {
        const delay = line.split(':')[1]?.trim();
        if (delay) estTime += ` (includes ${delay} delay)`;
      }
    }
    if (line.toLowerCase().includes('distance:')) {
      dist = line.split(':')[1]?.trim() || dist;
    }
    if (line.startsWith('STOPS:')) {
      const parts = line.replace('STOPS:', '').split('|').map(p => p.trim());
      parts.forEach((p, i) => {
        if (p) stops.push({ 
          id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
          name: p 
        });
      });
    }
    if (line.match(/^\d+\./) || line.startsWith('- ')) {
      steps.push({ 
        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${steps.length}`,
        instruction: line.replace(/^\d+\.\s*|-\s*/, '').trim() 
      });
    }
  });

  if (steps.length > 0) {
    return {
      destination,
      destinationCoords,
      stops: stops.length > 0 ? stops : undefined,
      estimatedTime: estTime,
      distance: dist,
      steps
    };
  }
  return null;
}
