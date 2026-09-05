import { useState, useEffect, useRef } from "react";
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

export function ScreenInterview() {
  const { nextScreen, updateCase, patientCase, language } = useStore();
  const t = useT();
  const { speak } = useSpeak();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [isTyping, setIsTyping] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const complaintText = patientCase.chiefComplaint?.[0]?.symptom || "unspecified symptom";

  // Fetch Groq dynamic questions when component mounts or symptom changes
  useEffect(() => {
    let isMounted = true;

    const fetchGroqQuestions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chiefComplaint: patientCase.chiefComplaint,
            language: language || "English",
            history: patientCase.history || {}
          })
        });

        const data = await res.json();
        if (isMounted && data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else if (isMounted) {
          setQuestions([
            {
              id: "onset",
              text: `Could you tell us when your ${complaintText} started?`,
              options: ["Today", "Yesterday", "3-4 days ago", "Over a week ago"]
            },
            {
              id: "severity",
              text: "How severe would you describe your discomfort right now?",
              options: ["Mild", "Moderate", "Severe", "Very severe"]
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to load Groq interview questions:", error);
        if (isMounted) {
          setQuestions([
            {
              id: "onset",
              text: `When did your ${complaintText} start?`,
              options: ["Today", "Yesterday", "3-4 days ago", "A week ago"]
            },
            {
              id: "severity",
              text: "How would you rate the severity of your pain or discomfort?",
              options: ["Mild", "Moderate", "Severe", "Unbearable"]
            }
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchGroqQuestions();

    return () => {
      isMounted = false;
    };
  }, [complaintText, language]);

  const currentQ = questions[currentQIndex];
  const questionText = currentQ ? t(currentQ.text) : "";
  useAutoSpeak(questionText, currentQ?.text || "");

  const handleAnswer = (answer: string) => {
    if (!answer || !currentQ) return;

    const updatedAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(updatedAnswers);

    updateCase({
      history: {
        ...patientCase.history,
        [currentQ.id]: answer
      }
    });

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
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
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Voice recognition requires Google Chrome or Microsoft Edge.");
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
      recognition.lang = language === "Hindi" ? "hi-IN" : "en-US";

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
        console.error("Speech recognition error:", event.error);
        setVoiceError(`Microphone error: ${event.error}`);
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setVoiceError(`Failed to start microphone: ${err.message}`);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-col px-10 pb-12 items-center justify-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#FDFBF7]/95 backdrop-blur-3xl rounded-[40px] p-16 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col items-center justify-center text-center max-w-xl w-full"
        >
          <div className="h-16 w-16 bg-[#000B33] rounded-full flex items-center justify-center mb-6 shadow-md">
            <div className="h-8 w-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          </div>

          <h2 className="text-[32px] font-serif tracking-tight text-[#000B33] mb-2">
            {t("Preparing your questions...")}
          </h2>
          <p className="text-[18px] text-[#000B33]/60 font-medium">
            {t("Please wait a moment while we set up your personalized intake.")}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12 w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id || currentQIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-[#FDFBF7]/95 backdrop-blur-3xl rounded-[40px] p-12 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col items-center w-full max-w-[800px] min-h-[600px]"
        >
          {/* Header */}
          <div className="flex justify-between items-start w-full mb-12">
            <div className="max-w-xl text-left">
              <h2 className="text-[38px] font-serif leading-[1.1] tracking-tight text-[#000B33] mb-2">
                {questionText}
              </h2>
              <button
                onClick={() => speak(questionText)}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1C718A] uppercase hover:opacity-70 transition-opacity"
              >
                <Volume2 className="h-4 w-4" />
                {t("Listen again")}
              </button>
            </div>
            
            <div className="flex gap-2 shrink-0 pt-3">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    i === currentQIndex
                      ? "bg-[#000B33]"
                      : i < currentQIndex
                      ? "bg-[#000B33]/30"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quick Option Buttons */}
          <div className="grid grid-cols-2 gap-4 w-full mb-auto">
            {currentQ.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={isListening}
                className={`py-5 px-6 text-[18px] font-semibold rounded-[20px] bg-white border shadow-sm transition-all text-left ${
                  isListening
                    ? "border-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                    : "border-gray-200 hover:border-[#000B33] text-[#000B33] hover:shadow-md active:scale-[0.98]"
                }`}
              >
                {t(opt)}
              </button>
            ))}
          </div>

          {/* Bottom Area: Voice, Typing, or Live Transcript */}
          <div className="w-full mt-8 flex flex-col items-center justify-center min-h-[200px]">
            {isTyping ? (
              <form
                onSubmit={handleTypeSubmit}
                className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300"
              >
                <textarea
                  autoFocus
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder={t("Type your clinical response here...")}
                  className="w-full bg-white border border-gray-200 rounded-[20px] p-6 text-[19px] text-[#000B33] placeholder:text-[#000B33]/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#000B33]/20 focus:border-[#000B33]/50 min-h-[120px] resize-none mb-4"
                />
                <div className="flex gap-4 w-full max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setIsTyping(false)}
                    className="flex-1 py-4 rounded-[20px] bg-gray-100 text-[#000B33] font-semibold text-[18px] hover:bg-gray-200 transition-colors"
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={!typedAnswer.trim()}
                    className="flex-1 py-4 rounded-[20px] bg-[#000B33] text-white font-semibold text-[18px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("Submit")}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center">
                {/* Live Transcript Display */}
                <div className="h-[50px] flex flex-col items-center justify-center mb-3 px-4 w-full text-center">
                  {voiceError ? (
                    <p className="text-[16px] text-red-500 font-medium">{voiceError}</p>
                  ) : isListening ? (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[20px] text-[#000B33] font-medium italic"
                    >
                      "{transcript || t("Listening...")}"
                    </motion.p>
                  ) : null}
                </div>

                {/* Circular Voice Button */}
                <button
                  onClick={isListening ? stopAndSubmit : startListening}
                  className={`relative flex flex-col items-center justify-center h-[180px] w-[180px] rounded-full bg-white shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-100 transition-all group ${
                    isListening
                      ? "scale-105 shadow-[0_8px_40px_rgb(44,95,85,0.2)] border-[#2C5F55]/20 ring-4 ring-[#2C5F55]/10"
                      : "hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {isListening && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        stopListening();
                      }}
                      className="absolute top-3 right-3 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-black z-10"
                    >
                      <X size={16} />
                    </span>
                  )}

                  <div
                    className={`flex items-center justify-center h-[76px] w-[76px] rounded-full mb-2 transition-colors ${
                      isListening
                        ? "bg-[#2C5F55] text-white animate-pulse"
                        : "bg-[#F0F7F6] text-[#2C5F55] group-hover:bg-[#E2F0ED]"
                    }`}
                  >
                    <Mic className="h-8 w-8 stroke-[2.5]" />
                  </div>
                  <span className="text-[18px] font-bold text-[#000B33]">
                    {isListening ? t("Submit Answer") : t("Tap to speak")}
                  </span>
                </button>

                {!isListening && (
                  <button
                    onClick={() => setIsTyping(true)}
                    className="mt-4 flex items-center gap-2 text-[#000B33]/50 hover:text-[#000B33] font-semibold text-[16px] transition-colors py-2 px-6 rounded-full hover:bg-black/5"
                  >
                    <Keyboard className="h-4 w-4" />
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
