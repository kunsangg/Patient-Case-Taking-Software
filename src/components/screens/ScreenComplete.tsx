import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useT } from "@/store/useTranslation";
import { useAutoSpeak } from "@/store/useSpeech";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const HEADLINE = "Your case has been submitted.";

export function ScreenComplete() {
  const { resetSession } = useStore();
  const t = useT();
  const headline = t(HEADLINE);
  useAutoSpeak(headline, HEADLINE);

  useEffect(() => {
    // Reset back to welcome after 15 seconds
    const timer = setTimeout(() => {
      resetSession();
    }, 15000);
    return () => clearTimeout(timer);
  }, [resetSession]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-3xl p-16 rounded-card shadow-card border border-white/60 flex flex-col items-center text-center">

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, delay: 0.2 }}
          className="mb-10 flex h-20 w-20 items-center justify-center rounded-card-sm bg-emerald-50 border border-emerald-100"
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-500 stroke-[2]" />
        </motion.div>

        <div className="text-center mb-12">
          <h1 className="text-display font-serif text-[#000B33] mb-4">
            {headline}
          </h1>
          <p className="text-body-lg text-[#000B33]/55 max-w-xl mx-auto">
            {t("Your doctor will review the information before your consultation.")}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-card-sm p-10 border border-black/5 flex flex-col items-center min-w-[280px]"
        >
          <span className="text-label font-semibold text-[#000B33]/40 uppercase mb-3">
            {t("Queue Number")}
          </span>
          <span className="text-6xl font-bold tracking-tight text-[#000B33]">
            A-127
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="mt-12 text-body-lg font-medium text-[#000B33]/50"
        >
          {t("Please take a seat in the waiting area.")}
        </motion.p>
      </div>
    </div>
  );
}
