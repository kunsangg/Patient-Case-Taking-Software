import { useState } from "react";
import { useStore } from "@/store/useStore";

export function ScreenBodyMap() {
  const { nextScreen, updateCase } = useStore();
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
      <div className="max-w-4xl w-full bg-[#FDFBF7]/95 backdrop-blur-3xl p-10 rounded-[40px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col items-center min-h-[750px]">
        
        <div className="text-center mb-8">
          <h1 className="text-[36px] font-serif tracking-tight text-[#000B33] mb-3">
            Where does it hurt?
          </h1>
          <p className="text-[19px] text-[#000B33]/70 font-medium max-w-xl mx-auto">
            Explore the anatomy map to pinpoint your exact pain location, then type it below to save.
          </p>
        </div>

        {/* Pure Innerbody Embed */}
        <div className="w-full max-w-[800px] h-[550px] bg-white rounded-[24px] shadow-inner border-[6px] border-white overflow-hidden relative flex flex-col items-center justify-center mb-8">
          
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
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/95 backdrop-blur-md p-4 rounded-[24px] shadow-2xl border border-white/50 flex flex-col gap-3 z-20">
            {hasSaved ? (
              <div className="flex flex-col items-center justify-center py-2">
                <span className="text-[18px] font-bold text-emerald-600 mb-1">Location Saved!</span>
                <span className="text-[15px] font-medium text-[#000B33]/60 capitalize">{manualInput}</span>
              </div>
            ) : (
              <>
                <span className="text-sm font-bold text-[#000B33] text-center">Found the exact spot? Type it here to save it:</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g. Lower Back, Biceps..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#000B33]/20"
                  />
                  <button 
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                    className="px-6 py-3 bg-[#000B33] text-white rounded-[14px] font-semibold hover:bg-black transition-all disabled:opacity-50"
                  >
                    Save
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
              className="w-full py-5 rounded-[20px] bg-[#000B33] text-white text-[19px] font-semibold shadow-md hover:bg-black active:scale-[0.98] transition-all"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={nextScreen}
              className="w-full py-4 text-[#000B33]/50 text-[19px] font-semibold hover:text-[#000B33] transition-colors"
            >
              Skip this step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
