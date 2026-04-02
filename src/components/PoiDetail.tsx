import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Star, Phone, Clock, MessageSquare, Share2, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { POI, AppMode } from '../types';
import { shareLocation } from '../lib/share';

interface PoiDetailProps {
  poi: POI | null;
  mode: AppMode;
  onClose: () => void;
}

export const PoiDetail = React.memo(({ poi, mode, onClose }: PoiDetailProps) => {
  if (!poi) return null;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${poi.name} ${poi.address}`)}`;
    shareLocation(
      poi.name,
      `Check out this place: ${poi.name} at ${poi.address}`,
      url
    );
  };

  return (
    <AnimatePresence>
      {poi && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "absolute bottom-0 left-0 right-0 h-[70vh] rounded-t-[40px] shadow-2xl z-50 flex flex-col transition-colors duration-500",
              mode === 'discovery' ? "bg-[#15100E] text-white border-t border-white/10" : "bg-white text-[#1A1A1A]"
            )}
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center py-4 cursor-pointer" onClick={onClose}>
              <div className={cn("w-12 h-1.5 rounded-full", mode === 'discovery' ? "bg-white/10" : "bg-gray-200")} />
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
              {/* Header Image / Placeholder */}
              <div className="relative w-full h-48 rounded-3xl overflow-hidden mb-6 bg-gray-200">
                <img 
                  src={poi.photoUrl || `https://picsum.photos/seed/${poi.id}/800/400`} 
                  alt={poi.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={handleShare}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                  <button 
                    onClick={onClose}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-1">{poi.name}</h2>
                  <div className="flex items-center gap-2 text-sm opacity-60">
                    <MapPin size={14} />
                    <span>{poi.address}</span>
                  </div>
                </div>
                {poi.rating && (
                  <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full font-bold">
                    <Star size={16} className="fill-yellow-500" />
                    <span>{poi.rating}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {poi.phone && (
                  <a 
                    href={`tel:${poi.phone}`}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                      mode === 'discovery' ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                    )}
                  >
                    <div className="p-2 bg-green-500/20 text-green-500 rounded-lg">
                      <Phone size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Call</p>
                      <p className="text-sm font-bold truncate">{poi.phone}</p>
                    </div>
                  </a>
                )}
                {poi.hours && (
                  <div className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                    mode === 'discovery' ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"
                  )}>
                    <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg">
                      <Clock size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Hours</p>
                      <p className="text-sm font-bold truncate">{poi.hours}</p>
                    </div>
                  </div>
                )}
              </div>

              {poi.reviews && poi.reviews.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={18} className="opacity-50" />
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-50">Recent Reviews</h3>
                  </div>
                  {poi.reviews.map((review, i) => (
                    <div 
                      key={`${poi.id}-review-${i}`}
                      className={cn(
                        "p-4 rounded-2xl border",
                        mode === 'discovery' ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"
                      )}
                    >
                      <p className="text-sm italic opacity-80">"{review}"</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-current/10">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${poi.name} ${poi.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all",
                    mode === 'discovery' ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-black text-white hover:bg-gray-800"
                  )}
                >
                  <ExternalLink size={18} />
                  View on Google Maps
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
