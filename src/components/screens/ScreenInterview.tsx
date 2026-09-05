import { useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useT } from "@/store/useTranslation";
import { useAutoSpeak, useSpeak } from "@/store/useSpeech";
import { Mic, Keyboard, X, Volume2 } from "lucide-react";
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
  const t = useT();
  const { speak } = useSpeak();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [history, setHistory] = useState<{q: string, a: string}[]>([]);

  const [isTyping, setIsTyping] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentQ = QUESTIONS[currentQIndex];
  const questionText = t(currentQ.text);
  useAutoSpeak(questionText, currentQ.text);

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
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setTranscript(fullTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setVoiceError(event.error);
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setVoiceError(err.message);
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
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/95 backdrop-blur-3xl rounded-card p-12 shadow-card border border-white/60 flex flex-col items-center w-full max-w-[780px] min-h-[600px]"
        >
          <div className="flex justify-between items-start w-full mb-12">
            <div className="max-w-xl text-left">
              <h2 className="text-display font-serif leading-[1.1] text-[#000B33] mb-2">
                {questionText}
              </h2>
              <button
                onClick={() => speak(questionText)}
                className="inline-flex items-center gap-2 text-label font-bold text-[#1C718A] uppercase hover:opacity-70 transition-opacity"
              >
                <Volume2 className="h-4 w-4" />
                {t("Listen again")}
              </button>
            </div>
            <div className="flex gap-2 shrink-0 pt-3">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                    i === currentQIndex ? "bg-[#000B33]" : i < currentQIndex ? "bg-[#000B33]/30" : "bg-black/10"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mb-auto">
            {currentQ.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={isListening}
                className={`py-4 px-6 text-body font-medium rounded-card-sm bg-white border transition-all duration-300 ease-premium text-left ${
                  isListening
                    ? "border-black/5 text-[#000B33]/25 cursor-not-allowed"
                    : "border-black/10 hover:border-[#000B33]/30 text-[#000B33] active:scale-[0.98]"
                }`}
              >
                {t(opt)}
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
                  placeholder={t("Type your answer here...")}
                  className="w-full bg-white border border-black/10 rounded-card-sm p-6 text-body text-[#000B33] placeholder:text-[#000B33]/35 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#1C718A]/25 focus:border-[#1C718A]/40 min-h-[120px] resize-none mb-4 transition-all duration-300 ease-premium"
                />
                <div className="flex gap-3 w-full max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setIsTyping(false)}
                    className="flex-1 py-4 rounded-full bg-black/5 text-[#000B33] font-semibold text-body hover:bg-black/10 transition-colors duration-300 ease-premium"
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={!typedAnswer.trim()}
                    className="flex-1 py-4 rounded-full bg-[#000B33] text-white font-semibold text-body hover:bg-black transition-colors duration-300 ease-premium disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t("Submit")}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center">

                {/* Live Transcript Display */}
                <div className="h-[60px] flex flex-col items-center justify-center mb-4 px-4 w-full text-center">
                  {voiceError ? (
                    <p className="text-body text-red-500 font-medium">{t("Microphone error:")} {voiceError}</p>
                  ) : isListening ? (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="text-body-lg text-[#000B33] font-medium italic"
                    >
                      "{transcript || t("Listening...")}"
                    </motion.p>
                  ) : null}
                </div>

                {/* The Circular Voice Button from User's Design */}
                <button
                  onClick={isListening ? stopAndSubmit : startListening}
                  className={`relative flex flex-col items-center justify-center h-[196px] w-[196px] rounded-full bg-white shadow-float border border-black/5 transition-all duration-300 ease-premium group ${
                    isListening ? "scale-105 shadow-[0_12px_32px_-4px_rgba(28,113,138,0.3)] border-[#1C718A]/20 ring-4 ring-[#1C718A]/10" : "hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {isListening && (
                    <span
                      onClick={(e) => { e.stopPropagation(); stopListening(); }}
                      className="absolute top-4 right-4 p-2 bg-black/5 rounded-full text-[#000B33]/50 hover:bg-black/10 hover:text-[#000B33] z-10 transition-colors"
                    >
                      <X size={16} />
                    </span>
                  )}

                  <div className={`flex items-center justify-center h-[86px] w-[86px] rounded-full mb-3 transition-colors duration-300 ${
                    isListening ? "bg-[#1C718A] text-white animate-pulse" : "bg-[#E8F2F4] text-[#1C718A] group-hover:bg-[#DCEEF1]"
                  }`}>
                    <Mic className="h-8 w-8 stroke-[2.2]" />
                  </div>
                  <span className="text-[18px] font-semibold text-[#000B33]">
                    {isListening ? t("Submit Answer") : t("Tap to speak")}
                  </span>
                </button>

                {!isListening && (
                  <button
                    onClick={() => setIsTyping(true)}
                    className="mt-6 flex items-center gap-2 text-[#000B33]/45 hover:text-[#000B33] font-medium text-[15px] transition-colors duration-300 ease-premium py-2 px-6 rounded-full hover:bg-black/5"
                  >
                    <Keyboard className="h-[17px] w-[17px]" />
                    <span>{t("I'd rather type")}</span>
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
