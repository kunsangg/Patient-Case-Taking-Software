import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useT } from "@/store/useTranslation";
import { useAutoSpeak, useSpeak } from "@/store/useSpeech";
import { CheckCircle2, Clock, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

const HEADLINE = "Your intake report has been submitted.";
const VOICE_EXPLANATION = "Your intake report has been submitted to your doctor. Please take a seat in the waiting room and wait for your queue token to be called.";

export function ScreenComplete() {
  const { resetSession } = useStore();
  const t = useT();
  const { speak } = useSpeak();
  
  const headlineText = t(HEADLINE);
  const voiceExplanationText = t(VOICE_EXPLANATION);

  // Automatically speak the clear waiting room queue instruction and return to start screen upon completion
  useAutoSpeak(voiceExplanationText, VOICE_EXPLANATION, () => {
    // 2.5 second pause after narration ends, then reset session back to beginning screen
    setTimeout(() => {
      resetSession();
    }, 2500);
  });

  useEffect(() => {
    // Backup safety timer: reset session after 15 seconds if audio fails or is muted
    const timer = setTimeout(() => {
      resetSession();
    }, 15000);
    return () => clearTimeout(timer);
  }, [resetSession]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12 w-full">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-3xl p-14 rounded-card shadow-card border border-white/60 flex flex-col items-center text-center">

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, delay: 0.2 }}
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-card-sm bg-emerald-50 border border-emerald-100 shadow-sm"
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-500 stroke-[2]" />
        </motion.div>

        {/* Main Headline & Voice Replay */}
        <div className="text-center mb-8">
          <h1 className="text-display font-serif text-[#000B33] mb-3">
            {headlineText}
          </h1>
          <p className="text-body-lg text-[#000B33]/65 max-w-xl mx-auto mb-3 leading-relaxed font-medium">
            {t("Your doctor has received your detailed intake history. Please proceed to the waiting room and wait for your token to be called.")}
          </p>
          <button
            onClick={() => speak(voiceExplanationText)}
            className="inline-flex items-center gap-2 text-label font-bold text-[#1C718A] uppercase hover:opacity-70 transition-opacity"
          >
            <Volume2 className="h-4 w-4" />
            {t("Listen again")}
          </button>
        </div>

        {/* Queue Token Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-b from-[#000B33] to-[#162040] text-white rounded-card-sm p-8 border border-[#000B33]/20 flex flex-col items-center min-w-[300px] shadow-lg"
        >
          <span className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
            {t("Your Queue Token")}
          </span>
          <span className="text-6xl font-bold tracking-tight text-white mb-2">
            A-127
          </span>
          <span className="text-xs font-medium text-emerald-300 flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
            <Clock size={12} />
            {t("Active in Waiting Room Queue")}
          </span>
        </motion.div>

        {/* Clear Waiting Room Guidance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-8 bg-blue-50/80 border border-blue-100 rounded-2xl p-5 w-full text-center"
        >
          <p className="text-body font-semibold text-[#000B33]">
            {t("Please take a seat in the waiting room. The display monitor will announce Token A-127 when your doctor is ready.")}
          </p>
        </motion.div>

      </div>
    </div>
  );
}
