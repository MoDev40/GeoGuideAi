import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Map as MapIcon, RotateCcw, MessageSquare, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { AppMode, Message } from '../types';

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AppMode;
  messages: Message[];
  isLoading: boolean;
  onRetry: (text: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

const MessageItem = React.memo(({ msg, mode, onRetry }: { msg: Message, mode: AppMode, onRetry: (text: string) => void }) => (
  <div className={cn(
    "flex flex-col gap-2",
    msg.role === 'user' ? "items-end" : "items-start"
  )}>
    <div className={cn(
      "max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed relative",
      msg.role === 'user' 
        ? (mode === 'discovery' ? "bg-orange-600 text-white rounded-tr-none" : "bg-black text-white rounded-tr-none")
        : (mode === 'discovery' ? "bg-white/5 text-gray-200 rounded-tl-none border border-white/10" : "bg-gray-100 text-gray-800 rounded-tl-none"),
      msg.isError && "border-red-500/50 bg-red-500/5 text-red-500"
    )}>
      {msg.role === 'model' ? (
        <div className={cn(
          "prose prose-sm max-w-none",
          mode === 'discovery' ? "prose-invert prose-orange" : "",
          msg.isError && "text-red-500"
        )}>
          <ReactMarkdown>{msg.text}</ReactMarkdown>
        </div>
      ) : (
        msg.text
      )}
      
      {msg.isError && (
        <button 
          onClick={() => onRetry(msg.text)}
          className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:underline"
        >
          <RotateCcw size={12} />
          Retry
        </button>
      )}
    </div>
    
    {/* Grounding Links */}
    {msg.groundingChunks && msg.groundingChunks.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2">
        {msg.groundingChunks.map((chunk, cIdx) => (
          <GroundingLink key={`${msg.id}-grounding-${cIdx}`} chunk={chunk} mode={mode} />
        ))}
      </div>
    )}
  </div>
));

const GroundingLink = React.memo(({ chunk, mode }: { chunk: any, mode: AppMode }) => {
  if (chunk.maps) {
    return (
      <a 
        href={chunk.maps.uri}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
          mode === 'discovery' 
            ? "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20" 
            : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
        )}
      >
        <MapIcon className="w-3 h-3" />
        {chunk.maps.title || "View on Maps"}
      </a>
    );
  }
  
  if (chunk.web) {
    return (
      <a 
        href={chunk.web.uri}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
          mode === 'discovery' 
            ? "bg-white/5 text-white/60 border-white/10 hover:bg-white/10" 
            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
        )}
      >
        <ExternalLink className="w-3 h-3" />
        {chunk.web.title || "Source"}
      </a>
    );
  }

  return null;
});

export const ChatSheet = React.memo(({ 
  isOpen, 
  onClose, 
  mode, 
  messages, 
  isLoading, 
  onRetry,
  chatEndRef 
}: ChatSheetProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "absolute bottom-0 left-0 right-0 h-[85vh] rounded-t-[40px] shadow-2xl z-30 flex flex-col transition-colors duration-500",
              mode === 'discovery' ? "bg-[#15100E] text-white border-t border-white/10" : "bg-white text-[#1A1A1A]"
            )}
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center py-4 cursor-pointer" onClick={onClose}>
              <div className={cn("w-12 h-1.5 rounded-full", mode === 'discovery' ? "bg-white/10" : "bg-gray-200")} />
            </div>

            {/* Sheet Header */}
            <div className="px-8 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {mode === 'discovery' ? "Discovery Engine" : "AI Guide"}
                </h2>
                <p className={cn("text-sm", mode === 'discovery' ? "text-orange-400" : "text-gray-500")}>
                  {mode === 'discovery' ? "Real-time local insights & history" : "Intelligent location insights"}
                </p>
              </div>
              <button 
                onClick={onClose}
                className={cn("p-2 rounded-full transition-colors", mode === 'discovery' ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <Sparkles className="w-12 h-12" />
                  <p className="max-w-[200px] text-sm font-medium">
                    Ask about current events, local history, or hidden gems.
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <MessageItem key={msg.id} msg={msg} mode={mode} onRetry={onRetry} />
              ))}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-start gap-2"
                >
                  <div className={cn(
                    "p-5 rounded-2xl rounded-tl-none border animate-pulse flex items-center gap-3",
                    mode === 'discovery' ? "bg-white/5 border-white/10" : "bg-gray-100 border-transparent"
                  )}>
                    <div className="flex gap-1">
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]", mode === 'discovery' ? "bg-orange-500" : "bg-gray-400")} />
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]", mode === 'discovery' ? "bg-orange-500" : "bg-gray-400")} />
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-bounce", mode === 'discovery' ? "bg-orange-500" : "bg-gray-400")} />
                    </div>
                    <span className={cn("text-xs font-medium", mode === 'discovery' ? "text-orange-400" : "text-gray-500")}>
                      {mode === 'discovery' ? "Discovery Engine is thinking..." : "AI Guide is typing..."}
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
