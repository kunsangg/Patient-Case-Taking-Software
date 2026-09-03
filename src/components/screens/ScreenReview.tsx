import { useStore } from "@/store/useStore";
import { Edit2, AlertCircle, Sparkles, BrainCircuit, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ScreenReview() {
  const { patientCase, updateCase, nextScreen } = useStore();
  const [isAnalyzing, setIsAnalyzing] = useState(!patientCase.aiAnalysis?.clinicalSummary);

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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#FDFBF7]/95 backdrop-blur-3xl rounded-[40px] p-16 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col items-center justify-center text-center max-w-xl w-full"
        >
          <div className="relative mb-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#2C5F55]/20 rounded-full animate-ping" />
            <div className="h-24 w-24 bg-[#000B33] rounded-full flex items-center justify-center relative z-10 shadow-lg">
              <BrainCircuit className="h-12 w-12 text-white animate-pulse" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 text-amber-400 h-8 w-8 animate-bounce" />
          </div>
          <h2 className="text-[32px] font-serif tracking-tight text-[#000B33] mb-4">
            Analyzing your case...
          </h2>
          <p className="text-[19px] text-[#000B33]/60 font-medium">
            Our medical intelligence layer is synthesizing your symptoms, medical history, and body map into a professional clinical report.
          </p>
          <div className="w-full max-w-xs mt-10 h-2 bg-gray-100 rounded-full overflow-hidden">
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
          className="bg-[#FDFBF7]/95 backdrop-blur-3xl rounded-[40px] p-12 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col max-h-[85vh] w-full"
        >
          <div className="text-center mb-10 shrink-0">
            <h1 className="text-[36px] font-serif tracking-tight text-[#000B33] mb-3">
              Your case is ready
            </h1>
            <p className="text-[19px] text-[#000B33]/70 font-medium">
              Please review the AI-synthesized information before sending it to your doctor.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto mb-10 px-4 space-y-6 scrollbar-hide">
            
            {/* AI Clinical Summary */}
            <div className="bg-gradient-to-br from-[#000B33] to-[#1a2342] rounded-[24px] p-8 shadow-lg border border-[#000B33]/20 text-white group relative">
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                  </div>
                  <h3 className="text-[15px] font-bold text-white/70 uppercase tracking-widest">AI Clinical Synthesis</h3>
                </div>
                {patientCase.aiAnalysis?.triageLevel && (
                  <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold uppercase tracking-wider ${
                    patientCase.aiAnalysis.triageLevel === 'High' || patientCase.aiAnalysis.triageLevel === 'Critical' 
                      ? 'bg-red-500/20 text-red-200 border border-red-500/30'
                      : 'bg-green-500/20 text-green-200 border border-green-500/30'
                  }`}>
                    Triage: {patientCase.aiAnalysis.triageLevel}
                  </span>
                )}
              </div>
              <p className="text-[20px] font-medium leading-relaxed text-white/90">
                {patientCase.aiAnalysis?.clinicalSummary || "Summary generation failed."}
              </p>
            </div>

            {/* Raw Data Review */}
            <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 group relative">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <Activity className="h-5 w-5 text-[#000B33]/60" />
                  </div>
                  <h3 className="text-[15px] font-bold text-[#000B33]/50 uppercase tracking-widest">Raw Data Logs</h3>
                </div>
                <button className="text-[#000B33]/50 hover:text-[#000B33] transition-colors flex items-center gap-2 text-sm font-semibold bg-gray-50 px-4 py-2 rounded-full">
                  <Edit2 className="h-4 w-4" /> Edit
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[13px] font-bold text-[#000B33]/40 uppercase tracking-wider mb-2">Chief Complaint</p>
                  <p className="text-[20px] font-semibold text-[#000B33]">
                    {patientCase.chiefComplaint[0]?.symptom || "Not provided"}
                  </p>
                </div>
                
                <div>
                  <p className="text-[13px] font-bold text-[#000B33]/40 uppercase tracking-wider mb-2">Interview History</p>
                  <ul className="space-y-3">
                    {Object.entries(patientCase.history || {}).map(([key, val]) => (
                      <li key={key} className="text-[18px] text-[#000B33] flex items-center">
                        <span className="w-36 text-[#000B33]/50 capitalize font-medium">{key}:</span>
                        <span className="font-semibold">{val}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className="bg-amber-50 rounded-[24px] p-8 border border-amber-200/60">
              <div className="flex items-start gap-5">
                <AlertCircle className="h-7 w-7 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[18px] font-bold text-amber-900 mb-2">Important Information</h3>
                  <p className="text-[17px] text-amber-800/80 leading-relaxed font-medium">
                    MEDI-OS intelligently organizes the information you provide. It does not definitively diagnose or prescribe. 
                    Your physician remains the final decision-maker.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-center shrink-0 mt-4">
            <button
              onClick={nextScreen}
              className="w-full rounded-[24px] bg-[#000B33] px-8 py-5 text-[20px] font-semibold text-white transition-all hover:bg-black active:scale-[0.98] shadow-lg flex items-center justify-center gap-3"
            >
              Submit to Doctor
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
