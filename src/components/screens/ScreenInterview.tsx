import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Mic, Keyboard } from "lucide-react";
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
  
  const currentQ = QUESTIONS[currentQIndex];

  const handleAnswer = (answer: string) => {
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

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12 w-full">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQ.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-[#FDFBF7]/95 backdrop-blur-3xl rounded-[32px] p-12 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col w-full max-w-3xl"
        >
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-[32px] font-serif tracking-tight text-[#000B33] pr-6">
              {currentQ.text}
            </h2>
            <div className="flex gap-2 shrink-0">
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

          <div className="grid grid-cols-2 gap-4 mb-10">
            {currentQ.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="py-5 px-6 text-[19px] font-semibold rounded-[20px] bg-white border border-gray-200 hover:border-[#000B33] text-[#000B33] shadow-sm hover:shadow-md transition-all text-left active:scale-[0.98]"
              >
                {opt}
              </button>
            ))}
          </div>

          {isTyping ? (
            <form onSubmit={handleTypeSubmit} className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <textarea
                autoFocus
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full bg-white border border-gray-200 rounded-[20px] p-6 text-[19px] text-[#000B33] placeholder:text-[#000B33]/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#000B33]/20 focus:border-[#000B33]/50 min-h-[100px] resize-none mb-4"
              />
              <div className="flex gap-4 w-full max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setIsTyping(false)}
                  className="flex-1 py-3 rounded-[16px] bg-gray-100 text-[#000B33] font-semibold text-[17px] hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!typedAnswer.trim()}
                  className="flex-1 py-3 rounded-[16px] bg-[#000B33] text-white font-semibold text-[17px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4 mt-auto">
              <button className="flex items-center gap-3 px-8 py-4 rounded-[20px] bg-[#F0F7F6] border border-white text-[#2C5F55] hover:bg-white shadow-sm hover:shadow-md transition-all text-[19px] font-semibold active:scale-[0.98]">
                <Mic className="h-6 w-6 stroke-[2.5]" />
                Tap to answer by voice
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
