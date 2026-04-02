import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { GeminiService } from '../services/geminiService';

interface VoiceControlProps {
  onCommand: (command: string, type: 'search' | 'route' | 'mode') => void;
  mode: 'explore' | 'route' | 'discovery';
  geminiService: GeminiService;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({ onCommand, mode, geminiService }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      
      // Auto-stop after 8 seconds to prevent long recordings
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording();
        }
      }, 8000);

    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("Microphone access denied or not available.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        try {
          const result = await geminiService.processVoiceCommand(base64Audio);
          handleCommandResult(result);
        } catch (err) {
          console.error("Error processing audio:", err);
          setError("Failed to process voice command.");
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (err) {
      console.error("Error processing audio:", err);
      setError("Failed to process voice command.");
      setIsProcessing(false);
    }
  };

  const handleCommandResult = (result: string) => {
    console.log("AI Voice Result:", result);
    
    if (result.startsWith("ROUTE:")) {
      onCommand(result.replace("ROUTE:", "").trim(), 'route');
    } else if (result.startsWith("SEARCH:")) {
      onCommand(result.replace("SEARCH:", "").trim(), 'search');
    } else if (result.startsWith("MODE:")) {
      const targetMode = result.replace("MODE:", "").trim().toLowerCase();
      if (['explore', 'route', 'discovery'].includes(targetMode)) {
        onCommand(targetMode, 'mode');
      }
    } else {
      // Fallback to search if it's just text
      onCommand(result, 'search');
    }
  };

  return (
    <div className="relative flex items-center">
      <AnimatePresence>
        {(isRecording || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: -50 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className={cn(
              "absolute right-0 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 whitespace-nowrap z-50",
              mode === 'discovery' ? "bg-white/10 border-white/20 text-white" : "bg-white/90 border-gray-100 text-gray-800"
            )}
          >
            {isRecording ? (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-widest">Recording...</p>
              </>
            ) : (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                <p className="text-xs font-bold uppercase tracking-widest">Processing...</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        type="button"
        className={cn(
          "p-2.5 rounded-xl transition-all flex items-center justify-center",
          isRecording 
            ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
            : (isProcessing ? "bg-gray-100 text-gray-400" : (mode === 'discovery' ? "text-white/60 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-black hover:bg-gray-100"))
        )}
      >
        {isRecording ? <Square className="w-4 h-4" /> : (isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />)}
      </motion.button>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-full right-0 mb-4 flex items-center gap-2 text-[9px] text-red-500 font-bold uppercase tracking-widest bg-white/90 px-2 py-1 rounded-lg shadow-sm border border-red-100 whitespace-nowrap"
        >
          <AlertCircle className="w-2.5 h-2.5" />
          {error}
        </motion.div>
      )}
    </div>
  );
};
