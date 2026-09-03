import { useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { Mic, Keyboard, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Question = {
  id: string;
  text: string;
  options: string[];
};

const QUESTIONS: Question[] = [
  {
    id: "duration",
    text: "Could you specify when these symptoms first appeared?",
    options: ["Today", "Yesterday", "3 days ago", "A week ago", "Not sure"]
  },
  {
    id: "quality",
    text: "How would you characterize the nature of your discomfort?",
    options: ["Pressure", "Burning", "Sharp", "Tightness", "Other"]
  },
  {
    id: "radiation",
    text: "Does the discomfort radiate to any other regions?",
    options: ["Left arm", "Right arm", "Back", "Jaw", "Nowhere", "Not sure"]
  }
];

export function ScreenInterview() {
  const { nextScreen, updateCase } = useStore();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [history, setHistory] = useState<{q: string, a: string}[]>([]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentQ = QUESTIONS[currentQIndex];

  const handleAnswer = (answer: string) => {
    if (!answer) return;
    
    const newHistory = [...history, { q: currentQ.text, a: answer }];
    
    // Save to global state (simple mapping)
    if (currentQ.id === "duration") updateCase({ history: { duration: answer } });
    if (currentQ.id === "quality") updateCase({ history: { quality: answer } });
    if (currentQ.id === "radiation") updateCase({ history: { radiation: answer } });

    if (currentQIndex < QUESTIONS.length - 1) {
      setHistory(newHistory);
      setCurrentQIndex(currentQIndex + 1);
      setIsTyping(false);
      setTypedAnswer("");
      setTranscript("");
      setVoiceError(null);
    } else {
      nextScreen();
    }
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedAnswer.trim()) {
      handleAnswer(typedAnswer.trim());
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
      recognition.continuous = true; // Stay open until they click submit
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
      handleAnswer(transcript.trim());
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
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQ.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-[#FDFBF7]/95 backdrop-blur-3xl rounded-[40px] p-12 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col items-center w-full max-w-[800px] min-h-[600px]"
        >
          <div className="flex justify-between items-start w-full mb-12">
            <h2 className="text-[38px] font-serif leading-[1.1] tracking-tight text-[#000B33] max-w-xl text-left">
              {currentQ.text}
            </h2>
            <div className="flex gap-2 shrink-0 pt-3">
              {QUESTIONS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    i === currentQIndex ? "bg-[#000B33]" : i < currentQIndex ? "bg-[#000B33]/30" : "bg-gray-200"
                  }`} 
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mb-auto">
            {currentQ.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={isListening}
                className={`py-5 px-6 text-[19px] font-semibold rounded-[20px] bg-white border shadow-sm transition-all text-left ${
                  isListening 
                    ? "border-gray-100 text-gray-300 cursor-not-allowed opacity-50" 
                    : "border-gray-200 hover:border-[#000B33] text-[#000B33] hover:shadow-md active:scale-[0.98]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Bottom Area: Voice, Typing, or Live Transcript */}
          <div className="w-full mt-10 flex flex-col items-center justify-center min-h-[220px]">
            {isTyping ? (
              <form onSubmit={handleTypeSubmit} className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <textarea
                  autoFocus
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full bg-white border border-gray-200 rounded-[20px] p-6 text-[19px] text-[#000B33] placeholder:text-[#000B33]/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#000B33]/20 focus:border-[#000B33]/50 min-h-[120px] resize-none mb-4"
                />
                <div className="flex gap-4 w-full max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setIsTyping(false)}
                    className="flex-1 py-4 rounded-[20px] bg-gray-100 text-[#000B33] font-semibold text-[18px] hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!typedAnswer.trim()}
                    className="flex-1 py-4 rounded-[20px] bg-[#000B33] text-white font-semibold text-[18px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center">
                
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

                {/* The Circular Voice Button from User's Design */}
                <button
                  onClick={isListening ? stopAndSubmit : startListening}
                  className={`relative flex flex-col items-center justify-center h-[200px] w-[200px] rounded-full bg-white shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-100 transition-all group ${
                    isListening ? "scale-105 shadow-[0_8px_40px_rgb(44,95,85,0.2)] border-[#2C5F55]/20 ring-4 ring-[#2C5F55]/10" : "hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {isListening && (
                    <span 
                      onClick={(e) => { e.stopPropagation(); stopListening(); }}
                      className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-black z-10"
                    >
                      <X size={16} />
                    </span>
                  )}
                  
                  <div className={`flex items-center justify-center h-[88px] w-[88px] rounded-full mb-3 transition-colors ${
                    isListening ? "bg-[#2C5F55] text-white animate-pulse" : "bg-[#F0F7F6] text-[#2C5F55] group-hover:bg-[#E2F0ED]"
                  }`}>
                    <Mic className="h-9 w-9 stroke-[2.5]" />
                  </div>
                  <span className="text-[20px] font-bold text-[#000B33]">
                    {isListening ? "Submit Answer" : "Tap to speak"}
                  </span>
                </button>

                {!isListening && (
                  <button 
                    onClick={() => setIsTyping(true)}
                    className="mt-6 flex items-center gap-2 text-[#000B33]/50 hover:text-[#000B33] font-semibold text-[17px] transition-colors py-2 px-6 rounded-full hover:bg-black/5"
                  >
                    <Keyboard className="h-5 w-5" />
                    <span>I'd rather type</span>
                  </button>
                )}

              </div>
            )}
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
