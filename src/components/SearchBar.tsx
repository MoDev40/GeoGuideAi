import React from 'react';
import { Route as RouteIcon, Sparkles, Search, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppMode } from '../types';
import { VoiceControl } from './VoiceControl';
import { GeminiService } from '../services/geminiService';

interface SearchBarProps {
  mode: AppMode;
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onVoiceCommand: (command: string, type: 'search' | 'route' | 'mode') => void;
  geminiService: GeminiService;
}

export const SearchBar = React.memo(({ 
  mode, 
  input, 
  isLoading, 
  onInputChange, 
  onSubmit,
  onVoiceCommand,
  geminiService
}: SearchBarProps) => {
  return (
    <div className="absolute bottom-8 left-6 right-6">
      <form 
        onSubmit={onSubmit}
        className={cn(
          "rounded-3xl shadow-2xl border p-2 flex items-center gap-2 transition-all duration-300",
          mode === 'route' ? "bg-blue-50 border-blue-200 ring-4 ring-blue-500/10" : 
          mode === 'discovery' ? "bg-white/10 border-white/20 backdrop-blur-xl ring-4 ring-orange-500/10" : 
          "bg-white border-gray-100",
          isLoading && "animate-pulse opacity-80"
        )}
      >
        <div className="pl-4">
          {mode === 'route' ? <RouteIcon className="w-5 h-5 text-blue-500" /> : 
           mode === 'discovery' ? <Sparkles className="w-5 h-5 text-orange-400" /> : 
           <Search className="w-5 h-5 text-gray-400" />}
        </div>
        <input 
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={
            mode === 'route' ? "Enter destination..." : 
            mode === 'discovery' ? "Ask about events or history..." : 
            "Ask about your surroundings..."
          }
          className={cn(
            "flex-1 py-3 outline-none text-sm font-medium bg-transparent",
            mode === 'discovery' ? "text-white placeholder:text-white/40" : "text-[#1A1A1A] placeholder:text-gray-400"
          )}
          autoFocus={mode !== 'explore'}
        />
        
        <div className="flex items-center gap-1 pr-1">
          <VoiceControl onCommand={onVoiceCommand} mode={mode} geminiService={geminiService} />
          
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-3 rounded-2xl transition-colors disabled:opacity-50",
              mode === 'route' ? "bg-blue-600 text-white hover:bg-blue-700" : 
              mode === 'discovery' ? "bg-orange-600 text-white hover:bg-orange-700" : 
              "bg-black text-white hover:bg-gray-800"
            )}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
});
