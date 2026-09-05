import { useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useT } from "@/store/useTranslation";
import { useAutoSpeak, useSpeak } from "@/store/useSpeech";
import { Keyboard, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { VoiceMicButton } from "@/components/VoiceMicButton";

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

const HEADLINE = "Please describe your primary reason for visiting.";

export function ScreenIntakeHome() {
  const { nextScreen, updateCase } = useStore();
  const t = useT();
  const { speak } = useSpeak();
  const headline = t(HEADLINE);
  useAutoSpeak(headline, HEADLINE);

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
      <div className="max-w-[880px] w-full bg-white/95 backdrop-blur-3xl p-12 rounded-card shadow-card border border-white/60 flex flex-col items-center min-h-[600px]">

        <div className="text-center mb-8">
          <h1 className="text-display font-serif text-[#000B33] mb-3">
            {headline}
          </h1>
          <p className="text-body-lg text-[#000B33]/55 max-w-xl mx-auto mb-3">
            {t("Speak naturally into the microphone, or select a common condition below.")}
          </p>
          <button
            onClick={() => speak(headline)}
            className="inline-flex items-center gap-2 text-label font-bold text-[#1C718A] uppercase hover:opacity-70 transition-opacity"
          >
            <Volume2 className="h-4 w-4" />
            {t("Listen again")}
          </button>
        </div>

        <div className="w-full flex flex-col items-center justify-center min-h-[260px] relative z-20">
          {isTyping ? (
            <form onSubmit={handleTypeSubmit} className="w-full max-w-xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <textarea
                autoFocus
                value={typedSymptom}
                onChange={(e) => setTypedSymptom(e.target.value)}
                placeholder={t("E.g., I have had a severe headache since yesterday...")}
                className="w-full bg-white border border-black/10 rounded-card-sm p-6 text-body text-[#000B33] placeholder:text-[#000B33]/35 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#1C718A]/25 focus:border-[#1C718A]/40 min-h-[140px] resize-none mb-4 transition-all duration-300 ease-premium"
              />
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setIsTyping(false)}
                  className="flex-1 py-4 rounded-full bg-black/5 text-[#000B33] font-semibold text-body hover:bg-black/10 transition-colors duration-300 ease-premium"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={!typedSymptom.trim()}
                  className="flex-1 py-4 rounded-full bg-[#000B33] text-white font-semibold text-body hover:bg-black transition-colors duration-300 ease-premium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t("Continue")}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center w-full">

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

              {/* Improvised Professional Voice Mic Button */}
              <VoiceMicButton
                isListening={isListening}
                onStart={startListening}
                onStopAndSubmit={stopAndSubmit}
                onCancel={stopListening}
                submitLabel="Submit Complaint"
                idleLabel="Tap to speak"
              />

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

        <div className={`w-full z-10 transition-opacity duration-300 ${isListening ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
          <p className="text-center text-label text-[#000B33]/35 mb-4 uppercase font-semibold">
            {t("Or select from common options")}
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 max-w-[680px] mx-auto">
            {COMMON_COMPLAINTS.map((complaint) => (
              <button
                key={complaint}
                onClick={() => handleSelectComplaint(complaint)}
                className="px-5 py-3 rounded-full bg-white text-[15px] font-medium text-[#000B33] border border-black/10 transition-all duration-300 ease-premium hover:border-[#000B33]/30 hover:-translate-y-0.5"
              >
                {t(complaint)}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
