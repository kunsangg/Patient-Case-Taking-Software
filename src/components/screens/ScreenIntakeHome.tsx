import { useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { Mic, Keyboard, X } from "lucide-react";
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
  
  const [isTyping, setIsTyping] = useState(false);
  const [typedSymptom, setTypedSymptom] = useState("");
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleSelectComplaint = (complaint: string) => {
    updateCase({ chiefComplaint: [{ symptom: complaint }] });
    nextScreen();
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedSymptom.trim()) {
      handleSelectComplaint(typedSymptom.trim());
    }
  };

  const startListening = () => {
    setVoiceError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Your browser does not support voice recognition. Please use Chrome.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("SpeechRecognition: started");
        setIsListening(true);
        setTranscript("");
      };

      recognition.onspeechstart = () => {
        console.log("SpeechRecognition: speech detected");
      };

      recognition.onresult = (event: any) => {
        console.log("SpeechRecognition: onresult fired", event);
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setTranscript(fullTranscript);
      };

      recognition.onend = () => {
        console.log("SpeechRecognition: ended");
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setVoiceError(`Microphone error: ${event.error}`);
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setVoiceError(`Failed to start mic: ${err.message}`);
    }
  };

  const stopAndSubmit = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (transcript.trim()) {
      handleSelectComplaint(transcript.trim());
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12 w-full">
      <div className="max-w-[900px] w-full bg-[#FDFBF7]/95 backdrop-blur-3xl p-12 rounded-[40px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col items-center min-h-[600px]">
        
        <div className="text-center mb-6">
          <h1 className="text-[40px] font-serif tracking-tight text-[#000B33] mb-4">
            Please describe your primary reason for visiting.
          </h1>
          <p className="text-[20px] text-[#000B33]/70 font-medium max-w-xl mx-auto">
            Speak naturally into the microphone, or select a common condition below.
          </p>
        </div>

        <div className="w-full flex flex-col items-center justify-center min-h-[260px] relative z-20">
          {isTyping ? (
            <form onSubmit={handleTypeSubmit} className="w-full max-w-xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
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
            <div className="flex flex-col items-center w-full">
              
              {/* Live Transcript Display */}
              <div className="h-[60px] flex flex-col items-center justify-center mb-4 px-4 w-full text-center">
                {voiceError ? (
                  <p className="text-[17px] text-red-500 font-medium">{voiceError}</p>
                ) : isListening ? (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-[22px] text-[#000B33] font-medium italic"
                  >
                    "{transcript || "Listening..."}"
                  </motion.p>
                ) : null}
              </div>

              {/* The Circular Voice Button */}
              <button
                onClick={isListening ? stopAndSubmit : startListening}
                className={`relative flex flex-col items-center justify-center h-[180px] w-[180px] rounded-full bg-white shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-100 transition-all group ${
                  isListening ? "scale-105 shadow-[0_8px_40px_rgb(44,95,85,0.2)] border-[#2C5F55]/20 ring-4 ring-[#2C5F55]/10" : "hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isListening && (
                  <span 
                    onClick={(e) => { e.stopPropagation(); stopListening(); }}
                    className="absolute top-2 right-2 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-black z-10"
                  >
                    <X size={14} />
                  </span>
                )}
                
                <div className={`flex items-center justify-center h-[76px] w-[76px] rounded-full mb-3 transition-colors ${
                  isListening ? "bg-[#2C5F55] text-white animate-pulse" : "bg-[#F0F7F6] text-[#2C5F55] group-hover:bg-[#E2F0ED]"
                }`}>
                  <Mic className="h-8 w-8 stroke-[2.5]" />
                </div>
                <span className="text-[18px] font-bold text-[#000B33]">
                  {isListening ? "Submit" : "Tap to speak"}
                </span>
              </button>
              
              {!isListening && (
                <button 
                  onClick={() => setIsTyping(true)}
                  className="mt-4 flex items-center gap-2 text-[#000B33]/50 hover:text-[#000B33] font-semibold text-[16px] transition-colors py-2 px-6 rounded-full hover:bg-black/5"
                >
                  <Keyboard className="h-[18px] w-[18px]" />
                  <span>I'd rather type</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className={`w-full z-10 transition-opacity duration-300 ${isListening ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
          <p className="text-center text-sm text-[#000B33]/40 mb-4 uppercase tracking-widest font-bold">
            Or select from common options
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-[700px] mx-auto">
            {COMMON_COMPLAINTS.map((complaint) => (
              <button
                key={complaint}
                onClick={() => handleSelectComplaint(complaint)}
                className="px-6 py-3.5 rounded-[16px] bg-white text-[17px] font-semibold text-[#000B33] border border-gray-200 shadow-sm hover:border-[#000B33] hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
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
