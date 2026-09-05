import { useStore } from "@/store/useStore";
import { useT } from "@/store/useTranslation";
import { useAutoSpeak, useSpeak } from "@/store/useSpeech";
import { Edit3, AlertCircle, Sparkles, BrainCircuit, Activity, Volume2, Save, X, Plus, Trash2, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HEADLINE = "Your case is ready";

export function ScreenReview() {
  const { patientCase, updateCase, nextScreen } = useStore();
  const t = useT();
  const { speak } = useSpeak();
  const headline = t(HEADLINE);

  const [isAnalyzing, setIsAnalyzing] = useState(!patientCase.aiAnalysis?.clinicalSummary);
  const [isEditing, setIsEditing] = useState(false);

  // Editable local state
  const [editComplaint, setEditComplaint] = useState(patientCase.chiefComplaint[0]?.symptom || "");
  const [editSummary, setEditSummary] = useState(patientCase.aiAnalysis?.clinicalSummary || "");
  const [editHistory, setEditHistory] = useState<Record<string, string>>({ ...(patientCase.history || {}) });
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

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
            setEditSummary(data.clinicalSummary);
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
      setEditSummary(patientCase.aiAnalysis.clinicalSummary);
    }
  }, [patientCase, updateCase]);

  // Synchronize local edit state if patientCase changes
  useEffect(() => {
    if (patientCase.chiefComplaint[0]?.symptom) {
      setEditComplaint(patientCase.chiefComplaint[0].symptom);
    }
    if (patientCase.aiAnalysis?.clinicalSummary) {
      setEditSummary(patientCase.aiAnalysis.clinicalSummary);
    }
    if (patientCase.history) {
      setEditHistory({ ...patientCase.history });
    }
  }, [patientCase]);

  const handleSaveChanges = () => {
    updateCase({
      chiefComplaint: [{ symptom: editComplaint.trim() }],
      history: editHistory,
      aiAnalysis: {
        ...patientCase.aiAnalysis,
        clinicalSummary: editSummary.trim(),
        triageLevel: patientCase.aiAnalysis?.triageLevel || "Low",
        differentialDiagnosis: patientCase.aiAnalysis?.differentialDiagnosis || [],
        recommendedQuestions: patientCase.aiAnalysis?.recommendedQuestions || [],
      }
    });
    setIsEditing(false);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditComplaint(patientCase.chiefComplaint[0]?.symptom || "");
    setEditSummary(patientCase.aiAnalysis?.clinicalSummary || "");
    setEditHistory({ ...(patientCase.history || {}) });
    setIsEditing(false);
    setShowAddForm(false);
  };

  const handleHistoryChange = (key: string, value: string) => {
    setEditHistory((prev) => ({ ...prev, [key]: value }));
  };

  const handleDeleteHistoryItem = (keyToDelete: string) => {
    setEditHistory((prev) => {
      const updated = { ...prev };
      delete updated[keyToDelete];
      return updated;
    });
  };

  const handleAddCustomDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKey.trim() && newVal.trim()) {
      setEditHistory((prev) => ({ ...prev, [newKey.trim()]: newVal.trim() }));
      setNewKey("");
      setNewVal("");
      setShowAddForm(false);
    }
  };

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
            <div className="absolute inset-0 bg-[#1C718A]/20 rounded-full animate-pulse scale-110" />
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
          {/* Top Bar Header & Edit Toggle */}
          <div className="flex justify-between items-center mb-8 shrink-0 pb-6 border-b border-black/5">
            <div className="text-left">
              <h1 className="text-display font-serif text-[#000B33] mb-1">
                {headline}
              </h1>
              <p className="text-body-lg text-[#000B33]/55">
                {isEditing
                  ? t("Edit your clinical intake report below before submitting to your doctor.")
                  : t("Please review the AI-synthesized information before sending it to your doctor.")}
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => speak(headline)}
                className="p-3 bg-black/5 hover:bg-black/10 rounded-full text-[#1C718A] transition-colors"
                title={t("Listen again")}
              >
                <Volume2 className="h-5 w-5" />
              </button>

              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 text-[#000B33] font-semibold text-sm hover:bg-gray-200 transition-all"
                  >
                    <X className="h-4 w-4" />
                    <span>{t("Cancel")}</span>
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C718A] text-white font-semibold text-sm hover:bg-[#15596D] shadow-md transition-all"
                  >
                    <Save className="h-4 w-4" />
                    <span>{t("Save Changes")}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#000B33] text-white font-semibold text-sm hover:bg-black transition-all shadow-md"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>{t("Edit Report")}</span>
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Report Content */}
          <div className="flex-1 overflow-y-auto mb-8 px-2 space-y-6 scrollbar-hide">

            {/* AI Clinical Summary Card */}
            <div className="bg-gradient-to-br from-[#000B33] to-[#1a2342] rounded-card-sm p-8 border border-[#000B33]/20 text-white group relative shadow-md">
              <div className="flex justify-between items-start mb-5 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                  </div>
                  <h3 className="text-label font-bold text-white/70 uppercase">{t("AI Clinical Synthesis")}</h3>
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

              {isEditing ? (
                <div>
                  <label className="text-xs font-bold text-white/70 uppercase mb-2 block tracking-wider">
                    {t("Edit Summary Notes")}
                  </label>
                  <textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white text-[16px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-400/50 min-h-[120px] resize-y"
                  />
                </div>
              ) : (
                <p className="text-body-lg font-normal leading-relaxed text-white/90">
                  {t(patientCase.aiAnalysis?.clinicalSummary || "Summary generation failed.")}
                </p>
              )}
            </div>

            {/* Patient Symptoms & History Logs Card */}
            <div className="bg-white rounded-card-sm p-8 border border-black/5 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black/5 rounded-xl">
                    <Activity className="h-5 w-5 text-[#000B33]/60" />
                  </div>
                  <h3 className="text-label font-bold text-[#000B33]/50 uppercase">{t("Patient Symptoms & History Logs")}</h3>
                </div>
                {isEditing && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#1C718A] uppercase bg-[#E8F2F4] px-4 py-2 rounded-full hover:bg-[#D4E8EB] transition-colors"
                  >
                    <Plus size={14} />
                    <span>{t("Add Detail")}</span>
                  </button>
                )}
              </div>

              {/* Chief Complaint */}
              <div>
                <p className="text-label font-bold text-[#000B33]/40 uppercase mb-2">{t("Primary Chief Complaint")}</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editComplaint}
                    onChange={(e) => setEditComplaint(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-title font-semibold text-[#000B33] focus:outline-none focus:ring-2 focus:ring-[#1C718A]/30 focus:bg-white"
                  />
                ) : (
                  <p className="text-title font-semibold text-[#000B33]">
                    {t(patientCase.chiefComplaint[0]?.symptom || "Not provided")}
                  </p>
                )}
              </div>

              {/* Add New Custom Detail Form */}
              {isEditing && showAddForm && (
                <form onSubmit={handleAddCustomDetail} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <h4 className="text-xs font-bold text-[#000B33] uppercase tracking-wider">{t("Add Custom Detail / Symptom")}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder={t("Category (e.g. Allergies, Severity, Duration)")}
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1C718A]/30"
                    />
                    <input
                      type="text"
                      placeholder={t("Details (e.g. Penicillin allergy, Severe pain)")}
                      value={newVal}
                      onChange={(e) => setNewVal(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1C718A]/30"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 rounded-full bg-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-300"
                    >
                      {t("Cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={!newKey.trim() || !newVal.trim()}
                      className="px-5 py-2 rounded-full bg-[#1C718A] text-xs font-bold text-white hover:bg-[#15596D] disabled:opacity-50"
                    >
                      {t("Add Entry")}
                    </button>
                  </div>
                </form>
              )}

              {/* History Items */}
              <div>
                <p className="text-label font-bold text-[#000B33]/40 uppercase mb-3">{t("Interview Answers & History")}</p>
                <div className="space-y-3">
                  {Object.entries(isEditing ? editHistory : (patientCase.history || {})).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/60 transition-colors">
                      <span className="w-40 text-[#000B33]/60 capitalize font-medium text-sm shrink-0">{t(key)}:</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={String(val)}
                          onChange={(e) => handleHistoryChange(key, e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-[#000B33] focus:outline-none focus:ring-2 focus:ring-[#1C718A]/30"
                        />
                      ) : (
                        <span className="flex-1 font-semibold text-[#000B33] text-sm">{t(String(val))}</span>
                      )}
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteHistoryItem(key)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title={t("Delete item")}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Important Disclaimer Card */}
            <div className="bg-amber-50/80 rounded-card-sm p-8 border border-amber-200/50">
              <div className="flex items-start gap-5">
                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[17px] font-semibold text-amber-900 mb-2">{t("Important Information")}</h3>
                  <p className="text-[15px] text-amber-800/75 leading-relaxed">
                    {t("MediKiosk organizes your health history for your attending physician. Any edits you make here will be transmitted directly to the doctor.")}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Submit Action Button */}
          <div className="flex justify-center shrink-0 pt-2">
            {isEditing ? (
              <button
                onClick={handleSaveChanges}
                className="w-full rounded-full bg-[#1C718A] px-8 py-5 text-body-lg font-semibold text-white transition-all duration-300 ease-premium hover:bg-[#15596D] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg"
              >
                <Check className="h-5 w-5" />
                <span>{t("Save Edits & Submit to Doctor")}</span>
              </button>
            ) : (
              <button
                onClick={nextScreen}
                className="w-full rounded-full bg-[#000B33] px-8 py-5 text-body-lg font-semibold text-white transition-all duration-300 ease-premium hover:bg-black active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg"
              >
                <span>{t("Submit to Doctor")}</span>
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
