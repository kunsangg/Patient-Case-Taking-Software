import { useStore } from "@/store/useStore";
import { useT } from "@/store/useTranslation";
import { useAutoSpeak, useSpeak } from "@/store/useSpeech";
import { Edit2, AlertCircle, Sparkles, BrainCircuit, Activity, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HEADLINE = "Your case is ready";

export function ScreenReview() {
  const { patientCase, updateCase, nextScreen } = useStore();
  const t = useT();
  const { speak } = useSpeak();
  const headline = t(HEADLINE);
  const [isAnalyzing, setIsAnalyzing] = useState(!patientCase.aiAnalysis?.clinicalSummary);
  useAutoSpeak(isAnalyzing ? "" : headline, HEADLINE);

  useEffect(() => {
    if (!patientCase.aiAnalysis?.clinicalSummary) {
      const runAI = async () => {
        try {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientCase)
          });
          const data = await res.json();
          if (data && data.clinicalSummary) {
            updateCase({ aiAnalysis: data });
          }
        } catch (error) {
          console.error("AI Analysis failed:", error);
        } finally {
          setIsAnalyzing(false);
        }
      };
      runAI();
    } else {
      setIsAnalyzing(false);
    }
  }, [patientCase, updateCase]);

  if (isAnalyzing) {
    return (
      <div className="flex h-full flex-col px-10 pb-12 items-center justify-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/95 backdrop-blur-3xl rounded-card p-16 shadow-card border border-white/60 flex flex-col items-center justify-center text-center max-w-xl w-full"
        >
          <div className="relative mb-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#1C718A]/20 rounded-full animate-ping" />
            <div className="h-24 w-24 bg-[#000B33] rounded-full flex items-center justify-center relative z-10">
              <BrainCircuit className="h-11 w-11 text-white animate-pulse" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 text-amber-400 h-8 w-8 animate-bounce" />
          </div>
          <h2 className="text-title font-serif text-[#000B33] mb-4">
            {t("Analyzing your case...")}
          </h2>
          <p className="text-body-lg text-[#000B33]/55">
            {t("Our medical intelligence layer is synthesizing your symptoms, medical history, and body map into a professional clinical report.")}
          </p>
          <div className="w-full max-w-xs mt-10 h-1.5 bg-black/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#000B33] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-10 pb-12 max-w-4xl mx-auto w-full justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/95 backdrop-blur-3xl rounded-card p-12 shadow-card border border-white/60 flex flex-col max-h-[85vh] w-full"
        >
          <div className="text-center mb-10 shrink-0">
            <h1 className="text-display font-serif text-[#000B33] mb-3">
              {headline}
            </h1>
            <p className="text-body-lg text-[#000B33]/55 mb-3">
              {t("Please review the AI-synthesized information before sending it to your doctor.")}
            </p>
            <button
              onClick={() => speak(headline)}
              className="inline-flex items-center gap-2 text-label font-bold text-[#1C718A] uppercase hover:opacity-70 transition-opacity"
            >
              <Volume2 className="h-4 w-4" />
              {t("Listen again")}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mb-10 px-4 space-y-5 scrollbar-hide">

            {/* AI Clinical Summary */}
            <div className="bg-gradient-to-br from-[#000B33] to-[#1a2342] rounded-card-sm p-8 border border-[#000B33]/20 text-white group relative">
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                  </div>
                  <h3 className="text-label font-bold text-white/60 uppercase">{t("AI Clinical Synthesis")}</h3>
                </div>
                {patientCase.aiAnalysis?.triageLevel && (
                  <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold uppercase tracking-wider ${
                    patientCase.aiAnalysis.triageLevel === 'High' || patientCase.aiAnalysis.triageLevel === 'Critical'
                      ? 'bg-red-500/20 text-red-200 border border-red-500/30'
                      : 'bg-green-500/20 text-green-200 border border-green-500/30'
                  }`}>
                    {t("Triage:")} {t(patientCase.aiAnalysis.triageLevel)}
                  </span>
                )}
              </div>
              <p className="text-body-lg font-normal leading-relaxed text-white/85">
                {t(patientCase.aiAnalysis?.clinicalSummary || "Summary generation failed.")}
              </p>
            </div>

            {/* Raw Data Review */}
            <div className="bg-white rounded-card-sm p-8 border border-black/5 group relative">
              <div className="flex justify-between items-start mb-6 border-b border-black/5 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black/5 rounded-xl">
                    <Activity className="h-5 w-5 text-[#000B33]/55" />
                  </div>
                  <h3 className="text-label font-bold text-[#000B33]/45 uppercase">{t("Raw Data Logs")}</h3>
                </div>
                <button className="text-[#000B33]/45 hover:text-[#000B33] transition-colors flex items-center gap-2 text-sm font-semibold bg-black/5 px-4 py-2 rounded-full">
                  <Edit2 className="h-4 w-4" /> {t("Edit")}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-label font-semibold text-[#000B33]/35 uppercase mb-2">{t("Chief Complaint")}</p>
                  <p className="text-title font-semibold text-[#000B33]">
                    {t(patientCase.chiefComplaint[0]?.symptom || "Not provided")}
                  </p>
                </div>

                <div>
                  <p className="text-label font-semibold text-[#000B33]/35 uppercase mb-2">{t("Interview History")}</p>
                  <ul className="space-y-3">
                    {Object.entries(patientCase.history || {}).map(([key, val]) => (
                      <li key={key} className="text-[17px] text-[#000B33] flex items-center">
                        <span className="w-36 text-[#000B33]/45 capitalize font-medium">{t(key)}:</span>
                        <span className="font-semibold">{t(String(val))}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className="bg-amber-50/80 rounded-card-sm p-8 border border-amber-200/50">
              <div className="flex items-start gap-5">
                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[17px] font-semibold text-amber-900 mb-2">{t("Important Information")}</h3>
                  <p className="text-[15px] text-amber-800/75 leading-relaxed">
                    {t("MEDI-OS intelligently organizes the information you provide. It does not definitively diagnose or prescribe. Your physician remains the final decision-maker.")}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-center shrink-0 mt-4">
            <button
              onClick={nextScreen}
              className="w-full rounded-full bg-[#000B33] px-8 py-5 text-body-lg font-semibold text-white transition-all duration-300 ease-premium hover:bg-black active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {t("Submit to Doctor")}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
