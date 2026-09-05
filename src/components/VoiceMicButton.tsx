import { motion, AnimatePresence } from "framer-motion";
import { Mic, Check, X, Square } from "lucide-react";
import { useT } from "@/store/useTranslation";

interface VoiceMicButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStopAndSubmit: () => void;
  onCancel: () => void;
  submitLabel?: string;
  idleLabel?: string;
}

export function VoiceMicButton({
  isListening,
  onStart,
  onStopAndSubmit,
  onCancel,
  submitLabel = "Done / Submit",
  idleLabel = "Tap to speak",
}: VoiceMicButtonProps) {
  const t = useT();

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Background Pulsing Aura Rings when listening */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              className="absolute h-[190px] w-[190px] rounded-full bg-[#1C718A]/20 blur-md pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1.22, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.4, ease: "easeOut" }}
              className="absolute h-[190px] w-[190px] rounded-full bg-[#1C718A]/30 pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Microphone Action Button */}
      <button
        type="button"
        onClick={isListening ? onStopAndSubmit : onStart}
        className={`relative z-10 flex flex-col items-center justify-center h-[196px] w-[196px] rounded-full transition-all duration-300 ease-out group select-none ${
          isListening
            ? "bg-gradient-to-br from-[#1C718A] via-[#165D72] to-[#0D3E4D] text-white shadow-[0_16px_50px_rgba(28,113,138,0.45)] ring-4 ring-[#1C718A]/30 scale-[1.03]"
            : "bg-white/95 backdrop-blur-2xl text-[#000B33] border border-slate-200/90 shadow-[0_12px_40px_-8px_rgba(0,11,51,0.12)] hover:border-[#1C718A]/50 hover:shadow-[0_16px_48px_-6px_rgba(28,113,138,0.22)] hover:scale-[1.02] active:scale-[0.97]"
        }`}
      >
        {/* Top Cancel Pill when listening */}
        {isListening && (
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="absolute top-2.5 right-2.5 p-2 bg-white/15 hover:bg-white/30 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-all shadow-sm z-20"
            title={t("Cancel recording")}
          >
            <X size={15} />
          </motion.span>
        )}

        {/* Central Icon Container */}
        <div
          className={`flex items-center justify-center h-20 w-20 rounded-full mb-2.5 transition-all duration-300 ${
            isListening
              ? "bg-white/20 text-white backdrop-blur-md shadow-inner"
              : "bg-[#E8F2F4] text-[#1C718A] group-hover:bg-[#D4E8EB] group-hover:scale-105"
          }`}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Mic className="h-9 w-9 stroke-[2.2]" />
            </motion.div>
          ) : (
            <Mic className="h-9 w-9 stroke-[2.2]" />
          )}
        </div>

        {/* Animated Wave Equalizer inside button when listening */}
        {isListening && (
          <div className="flex items-center justify-center gap-1 h-3 mb-1.5">
            {[0.4, 0.8, 1.2, 0.6, 0.9].map((delay, i) => (
              <motion.div
                key={i}
                className="w-1 bg-white/90 rounded-full"
                animate={{ height: ["4px", "14px", "6px"] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: delay * 0.2,
                }}
              />
            ))}
          </div>
        )}

        {/* Main Action Text Label */}
        <span
          className={`text-[16px] font-bold tracking-tight transition-colors ${
            isListening ? "text-white" : "text-[#000B33]"
          }`}
        >
          {isListening ? t(submitLabel) : t(idleLabel)}
        </span>

        {/* Status Subtitle */}
        <span
          className={`text-[11px] font-medium tracking-wide mt-0.5 uppercase ${
            isListening ? "text-white/70" : "text-[#000B33]/45"
          }`}
        >
          {isListening ? t("Listening...") : t("Voice Input")}
        </span>
      </button>
    </div>
  );
}
