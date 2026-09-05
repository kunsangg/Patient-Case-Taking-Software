"use client";

import { useStore } from "@/store/useStore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  ScreenWelcome,
  ScreenConsent,
  ScreenLanguage,
  ScreenAbhaScan,
  ScreenAbhaProfile,
  ScreenIntakeHome,
  ScreenInterview,
  ScreenBodyMap,
  ScreenDocumentScan,
  ScreenReview,
  ScreenComplete
} from "@/components/screens";

export default function Home() {
  const currentScreen = useStore((state) => state.currentScreen);
  const prevScreen = useStore((state) => state.prevScreen);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 1: return <ScreenLanguage key="language" />;
      case 2: return <ScreenWelcome key="welcome" />;
      case 3: return <ScreenConsent key="consent" />;
      case 10: return <ScreenAbhaScan key="abha" />;
      case 11: return <ScreenAbhaProfile key="abhaprofile" />;
      case 4: return <ScreenIntakeHome key="intake" />;
      case 5: return <ScreenInterview key="interview" />;
      case 6: return <ScreenBodyMap key="bodymap" />;
      case 7: return <ScreenDocumentScan key="documents" />;
      case 8: return <ScreenReview key="review" />;
      case 9: return <ScreenComplete key="complete" />;
      default: return <ScreenLanguage key="language" />;
    }
  };

  if (!isMounted) {
    return (
      <main className="flex h-screen w-screen flex-col overflow-hidden relative bg-[#000B33] text-white flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <span className="font-serif text-xl tracking-wide opacity-90">MediKiosk System...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden relative">
      
      {/* Fullscreen Video Background */}
      <div className="absolute inset-0 -z-20 min-h-screen overflow-hidden bg-black pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        >
          <source src="https://www.pexels.com/download/video/7583988/" type="video/mp4" />
        </video>
        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#000B33]/60 via-transparent to-[#000B33]/40"></div>
      </div>

      {currentScreen > 1 && currentScreen < 9 && (
        <button
          onClick={prevScreen}
          className="absolute top-10 left-10 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-2xl border border-white/20 text-white shadow-lg transition-all hover:bg-white/25 hover:scale-[1.05] active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
        </button>
      )}

      <div className="relative flex-1 overflow-hidden flex flex-col pt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
