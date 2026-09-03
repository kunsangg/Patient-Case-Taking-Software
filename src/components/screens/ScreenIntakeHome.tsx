import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Mic, Keyboard } from "lucide-react";
import { Waveform } from "../Waveform";
import { motion, AnimatePresence } from "framer-motion";

const COMMON_COMPLAINTS = [
  "Chest pain",
  "Fever",
  "Cough",
  "Headache",
  "Stomach pain",
  "Back pain",
  "Nausea",
  "Joint pain",
  "Dizziness",
  "Sore throat"
];

export function ScreenIntakeHome() {
  const { nextScreen, updateCase } = useStore();
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typedSymptom, setTypedSymptom] = useState("");

  const handleVoiceToggle = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate listening and transitioning
      setTimeout(() => {
        setIsListening(false);
        updateCase({ chiefComplaint: [{ symptom: "Chest pain" }] });
        nextScreen();
      }, 3000);
    }
  };

  const handleSelectComplaint = (complaint: string) => {
    updateCase({ chiefComplaint: [{ symptom: complaint }] });
    nextScreen();
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedSymptom.trim()) {
      updateCase({ chiefComplaint: [{ symptom: typedSymptom.trim() }] });
      nextScreen();
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12">
      <div className="max-w-4xl w-full bg-[#FDFBF7]/95 backdrop-blur-3xl p-12 rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col items-center">
        
        <div className="text-center mb-8">
          <h1 className="text-[36px] font-serif tracking-tight text-[#000B33] mb-3">
            Please describe your primary reason for visiting.
          </h1>
          <p className="text-[19px] text-[#000B33]/70 font-medium">
            Speak naturally into the microphone, or select a common condition below.
          </p>
        </div>

        {isTyping ? (
          <form onSubmit={handleTypeSubmit} className="w-full max-w-xl flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-300">
            <textarea
              autoFocus
              value={typedSymptom}
              onChange={(e) => setTypedSymptom(e.target.value)}
              placeholder="E.g., I have had a severe headache since yesterday..."
              className="w-full bg-white border border-gray-200 rounded-[20px] p-6 text-[19px] text-[#000B33] placeholder:text-[#000B33]/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#000B33]/20 focus:border-[#000B33]/50 min-h-[140px] resize-none mb-4"
            />
            <div className="flex gap-4 w-full">
              <button
                type="button"
                onClick={() => setIsTyping(false)}
                className="flex-1 py-4 rounded-[16px] bg-gray-100 text-[#000B33] font-semibold text-[17px] hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!typedSymptom.trim()}
                className="flex-1 py-4 rounded-[16px] bg-[#000B33] text-white font-semibold text-[17px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center mb-10 relative">
            <button
              onClick={handleVoiceToggle}
              className={`relative z-10 flex flex-col items-center justify-center h-48 w-48 rounded-full transition-all duration-500 ease-out mb-6 ${
                isListening 
                  ? "bg-white border-2 border-blue-500 shadow-[0_0_60px_rgba(59,130,246,0.4)] scale-[1.02]" 
                  : "bg-white border border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.div
                    key="waveform"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center"
                  >
                    <Waveform isListening={isListening} />
                    <span className="text-lg font-bold text-blue-600 mt-6 tracking-tight">Listening...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mic"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center"
                  >
                    <div className="rounded-full bg-[#F0F7F6] p-6 mb-3 text-[#2C5F55] transition-transform">
                      <Mic className="h-10 w-10 stroke-[2.2]" />
                    </div>
                    <span className="text-lg font-semibold text-[#000B33] tracking-tight">Tap to speak</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            
            <button 
              onClick={() => setIsTyping(true)}
              className="flex items-center gap-2 text-[#000B33]/60 hover:text-[#000B33] font-semibold text-[17px] transition-colors py-2 px-4 rounded-full hover:bg-black/5"
            >
              <Keyboard className="h-5 w-5" />
              <span>I'd rather type</span>
            </button>
          </div>
        )}

        <div className="w-full z-10">
          <p className="text-center text-sm text-[#000B33]/50 mb-5 uppercase tracking-widest font-bold">
            Or select from common options
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {COMMON_COMPLAINTS.map((complaint) => (
              <button
                key={complaint}
                onClick={() => handleSelectComplaint(complaint)}
                className="px-7 py-4 rounded-[18px] bg-white text-[18px] font-semibold text-[#000B33] border-2 border-gray-100 shadow-sm hover:border-[#000B33] hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {complaint}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
