import { useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useT } from "@/store/useTranslation";
import { useAutoSpeak, useSpeak } from "@/store/useSpeech";
import { FileText, Camera, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ScanState = "IDLE" | "SCANNING" | "EXTRACTING" | "RESULTS";

const HEADLINE = "Do you have previous medical records?";

export function ScreenDocumentScan() {
  const { nextScreen, updateCase, patientCase } = useStore();
  const t = useT();
  const { speak } = useSpeak();
  const headline = t(HEADLINE);
  useAutoSpeak(headline, HEADLINE);
  const [scanState, setScanState] = useState<ScanState>("IDLE");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const startScanClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFile(reader.result as string);
        processFile();
      };
      reader.readAsDataURL(file);
    }
  };

  const processFile = () => {
    setScanState("SCANNING");

    // Simulate edge detection and capture
    setTimeout(() => {
      setScanState("EXTRACTING");

      // Simulate extraction process
      setTimeout(() => {
        setScanState("RESULTS");
      }, 2500);
    }, 2500);
  };

  const handleConfirm = () => {
    // Save to global state so the AI can use it later
    const newDoc = {
      id: `doc_${Date.now()}`,
      type: "Prescription",
      extractedData: {
        medicine: "Metformin",
        dosage: "500 mg",
        frequency: "Twice daily"
      },
      fileData: uploadedFile || undefined
    };

    updateCase({
      medications: [
        ...(patientCase.medications || []),
        { name: "Metformin", dosage: "500 mg", frequency: "Twice daily" }
      ],
      documents: [
        ...(patientCase.documents || []),
        newDoc
      ]
    });
    nextScreen();
  };

  return (
    <div className="flex h-full flex-col px-10 pb-12 items-center justify-center w-full">
      <div className="text-center mb-10 mt-6">
        <h1 className="text-display font-serif text-white mb-3">
          {headline}
        </h1>
        <p className="text-body-lg text-white/70 mb-3">
          {t("Scan or upload your prescriptions/reports for the AI to analyze.")}
        </p>
        <button
          onClick={() => speak(headline)}
          className="inline-flex items-center gap-2 text-label font-bold text-[#7DD3E0] uppercase hover:opacity-70 transition-opacity"
        >
          <Volume2 className="h-4 w-4" />
          {t("Listen again")}
        </button>
      </div>

      {/* Hidden file input for actual uploads */}
      <input
        type="file"
        accept="image/*,application/pdf"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {scanState === "IDLE" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-6 justify-center w-full max-w-4xl"
          >
            <button
              onClick={startScanClick}
              className="flex flex-col items-center justify-center gap-6 rounded-card bg-white/95 backdrop-blur-3xl p-16 shadow-card border border-white/60 hover:bg-white transition-all duration-300 ease-premium hover:-translate-y-0.5 w-full max-w-md"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-card-sm bg-[#E8F2F4] text-[#1C718A]">
                <Camera className="h-9 w-9 stroke-[2]" />
              </div>
              <span className="text-title font-semibold text-[#000B33]">{t("Upload a document")}</span>
            </button>

            <button
              onClick={nextScreen}
              className="flex flex-col items-center justify-center gap-6 rounded-card bg-white/95 backdrop-blur-3xl p-16 shadow-card border border-white/60 hover:bg-white transition-all duration-300 ease-premium hover:-translate-y-0.5 w-full max-w-md"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-card-sm bg-black/5 text-[#000B33]/45">
                <FileText className="h-9 w-9 stroke-[2]" />
              </div>
              <span className="text-title font-semibold text-[#000B33]">{t("I don't have one")}</span>
            </button>
          </motion.div>
        )}

        {(scanState === "SCANNING" || scanState === "EXTRACTING") && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center flex-1 w-full"
          >
            <div className="relative w-full max-w-[400px] aspect-[3/4] bg-gray-900 rounded-card overflow-hidden shadow-2xl border border-white/20">

              {/* Display the ACTUAL uploaded file if it's an image, else a placeholder */}
              {uploadedFile && uploadedFile.startsWith("data:image/") ? (
                <img
                  src={uploadedFile}
                  alt="Uploaded Document"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              ) : (
                <div className="absolute inset-8 bg-white opacity-90 rounded-card-sm flex flex-col p-8 blur-[2px]">
                  <div className="w-1/2 h-6 bg-gray-300 rounded mb-4" />
                  <div className="w-full h-4 bg-gray-200 rounded mb-2" />
                  <div className="w-3/4 h-4 bg-gray-200 rounded mb-2" />
                  <div className="w-full h-4 bg-gray-200 rounded mb-8" />
                  <div className="w-1/3 h-6 bg-gray-300 rounded mb-4" />
                  <div className="w-full h-12 bg-gray-200 rounded mb-4" />
                </div>
              )}

              {scanState === "SCANNING" && (
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,1)] z-10"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}

              {scanState === "EXTRACTING" && (
                <div className="absolute inset-0 bg-[#000B33]/85 backdrop-blur-sm flex flex-col items-center justify-center text-white p-12">
                  <span className="text-xl font-semibold mb-12">{t("AI Extracting data...")}</span>
                  <div className="w-full space-y-6">
                    <div className="space-y-2">
                      <div className="text-sm opacity-70 uppercase tracking-widest">{t("Medicine")}</div>
                      <motion.div className="h-8 bg-white/20 rounded w-full overflow-hidden relative">
                         <motion.div className="absolute inset-0 bg-white/40" initial={{x: '-100%'}} animate={{x: '100%'}} transition={{repeat: Infinity, duration: 1, ease: 'linear'}} />
                      </motion.div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm opacity-70 uppercase tracking-widest">{t("Dosage")}</div>
                      <motion.div className="h-8 bg-white/20 rounded w-2/3 overflow-hidden relative">
                         <motion.div className="absolute inset-0 bg-white/40" initial={{x: '-100%'}} animate={{x: '100%'}} transition={{repeat: Infinity, duration: 1, ease: 'linear', delay: 0.2}} />
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {scanState === "RESULTS" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center w-full max-w-2xl"
          >
            <div className="bg-white/95 backdrop-blur-3xl rounded-card p-12 w-full shadow-card border border-white/60 mb-8">
              <div className="flex justify-between items-center mb-10 border-b border-black/5 pb-6">
                <h2 className="text-title font-serif text-[#000B33]">{t("AI Extraction Results")}</h2>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span className="text-emerald-700 text-xs font-bold tracking-wide">{t("HIGH CONFIDENCE")}</span>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col gap-2 relative group">
                  <span className="text-label font-semibold text-[#000B33]/45 uppercase">{t("Medicine")}</span>
                  <div className="text-[21px] font-semibold text-[#000B33] flex justify-between items-center">
                    Metformin
                    <button className="px-4 py-2 bg-black/5 rounded-full text-[#000B33] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/10">{t("Edit")}</button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative group">
                  <span className="text-label font-semibold text-[#000B33]/45 uppercase">{t("Dosage")}</span>
                  <div className="text-[21px] font-semibold text-[#000B33] flex justify-between items-center">
                    500 mg
                    <button className="px-4 py-2 bg-black/5 rounded-full text-[#000B33] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/10">{t("Edit")}</button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative group">
                  <span className="text-label font-semibold text-[#000B33]/45 uppercase">{t("Frequency")}</span>
                  <div className="text-[21px] font-semibold text-[#000B33] flex justify-between items-center">
                    Twice daily
                    <button className="px-4 py-2 bg-black/5 rounded-full text-[#000B33] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/10">{t("Edit")}</button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative group">
                  <span className="text-label font-semibold text-[#000B33]/45 uppercase">{t("Date")}</span>
                  <div className="text-[21px] font-semibold text-[#000B33] flex justify-between items-center">
                    12 Aug 2026
                    <button className="px-4 py-2 bg-black/5 rounded-full text-[#000B33] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/10">{t("Edit")}</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full justify-center">
              <button
                onClick={() => setScanState("IDLE")}
                className="px-8 py-4 rounded-full bg-white text-[#000B33] border border-black/10 text-body font-medium hover:border-[#000B33]/30 transition-all duration-300 ease-premium active:scale-[0.98]"
              >
                {t("Scan another")}
              </button>
              <button
                onClick={handleConfirm}
                className="px-12 py-4 rounded-full bg-[#000B33] text-white text-body font-medium hover:bg-black transition-all duration-300 ease-premium active:scale-[0.98]"
              >
                {t("Confirm")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
