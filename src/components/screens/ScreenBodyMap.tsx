import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useT } from "@/store/useTranslation";
import { useAutoSpeak, useSpeak } from "@/store/useSpeech";
import { Volume2 } from "lucide-react";

const HEADLINE = "Where does it hurt?";

export function ScreenBodyMap() {
  const { nextScreen, updateCase } = useStore();
  const t = useT();
  const { speak } = useSpeak();
  const headline = t(HEADLINE);
  useAutoSpeak(headline, HEADLINE);
  const [manualInput, setManualInput] = useState("");
  const [hasSaved, setHasSaved] = useState(false);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      updateCase({ history: { location: manualInput.trim() } });
      setHasSaved(true);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12 w-full">
      <div className="max-w-4xl w-full bg-white/95 backdrop-blur-3xl p-10 rounded-card shadow-card border border-white/60 flex flex-col items-center min-h-[750px]">

        <div className="text-center mb-8">
          <h1 className="text-display font-serif text-[#000B33] mb-3">
            {headline}
          </h1>
          <p className="text-body-lg text-[#000B33]/55 max-w-xl mx-auto mb-3">
            {t("Explore the anatomy map to pinpoint your exact pain location, then type it below to save.")}
          </p>
          <button
            onClick={() => speak(headline)}
            className="inline-flex items-center gap-2 text-label font-bold text-[#1C718A] uppercase hover:opacity-70 transition-opacity"
          >
            <Volume2 className="h-4 w-4" />
            {t("Listen again")}
          </button>
        </div>

        {/* Pure Innerbody Embed */}
        <div className="w-full max-w-[800px] h-[550px] bg-white rounded-card-sm shadow-inner border-[6px] border-white overflow-hidden relative flex flex-col items-center justify-center mb-8">

          {/* CSS Cropping trick to isolate the canvas and hide the header/sidebar */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-white">
            <iframe
              src="https://www.innerbody.com/image/musfov.html"
              className="absolute border-0"
              style={{
                width: "180%",
                height: "160%",
                top: "-220px",
                left: "-380px"
              }}
              title="3D Anatomy Viewer"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>

          {/* Edge mask to hide any scrollbars from iframe */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(255,255,255,1)] z-10" />

          {/* Overlay Input for Saving */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/95 backdrop-blur-md p-4 rounded-card-sm shadow-2xl border border-white/60 flex flex-col gap-3 z-20">
            {hasSaved ? (
              <div className="flex flex-col items-center justify-center py-2">
                <span className="text-[17px] font-semibold text-emerald-600 mb-1">{t("Location Saved!")}</span>
                <span className="text-[15px] font-medium text-[#000B33]/55 capitalize">{manualInput}</span>
              </div>
            ) : (
              <>
                <span className="text-[14px] font-semibold text-[#000B33] text-center">{t("Found the exact spot? Type it here to save it:")}</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={t("e.g. Lower Back, Biceps...")}
                    className="flex-1 px-4 py-3 bg-black/5 border border-black/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1C718A]/25 transition-all duration-300 ease-premium"
                  />
                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                    className="px-6 py-3 bg-[#000B33] text-white rounded-full font-semibold hover:bg-black transition-all duration-300 ease-premium disabled:opacity-40"
                  >
                    {t("Save")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex w-full justify-between items-center mt-auto max-w-xl mx-auto h-16">
          {hasSaved ? (
            <button
              onClick={nextScreen}
              className="w-full py-5 rounded-full bg-[#000B33] text-white text-body font-semibold hover:bg-black active:scale-[0.98] transition-all duration-300 ease-premium"
            >
              {t("Continue")}
            </button>
          ) : (
            <button
              onClick={nextScreen}
              className="w-full py-4 text-[#000B33]/45 text-body font-medium hover:text-[#000B33] transition-colors duration-300 ease-premium"
            >
              {t("Skip this step")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
