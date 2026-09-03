import { useState } from "react";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import Model, { IExerciseData, IMuscleStats } from "react-body-highlighter";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

export function ScreenBodyMap() {
  const { nextScreen, updateCase } = useStore();
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [view, setView] = useState<"anterior" | "posterior">("anterior");

  const handleClick = (data: any) => {
    // react-body-highlighter returns data.muscle when a muscle is clicked
    if (data && data.muscle) {
      setSelectedMuscle(data.muscle);
      updateCase({ history: { location: data.muscle } });
    }
  };

  const data: IExerciseData[] = selectedMuscle
    ? [{ name: "Pain Location", muscles: [selectedMuscle as any] }]
    : [];

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12 w-full">
      <div className="max-w-4xl w-full bg-[#FDFBF7]/95 backdrop-blur-3xl p-10 rounded-[40px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col items-center">
        
        <div className="text-center mb-8">
          <h1 className="text-[36px] font-serif tracking-tight text-[#000B33] mb-3">
            Where does it hurt?
          </h1>
          <p className="text-[19px] text-[#000B33]/70 font-medium max-w-xl mx-auto">
            Interact with the anatomy map below. Zoom, pan, and tap the specific muscle or area to precisely locate your pain.
          </p>
        </div>

        <div className="flex gap-3 mb-6 bg-white p-1.5 rounded-[20px] shadow-sm border border-gray-100">
          <button
            onClick={() => setView("anterior")}
            className={`px-10 py-3 rounded-[16px] text-[17px] font-bold transition-all ${
              view === "anterior" ? "bg-[#000B33] text-white shadow-md" : "text-[#000B33]/60 hover:text-[#000B33] hover:bg-gray-50"
            }`}
          >
            Front View
          </button>
          <button
            onClick={() => setView("posterior")}
            className={`px-10 py-3 rounded-[16px] text-[17px] font-bold transition-all ${
              view === "posterior" ? "bg-[#000B33] text-white shadow-md" : "text-[#000B33]/60 hover:text-[#000B33] hover:bg-gray-50"
            }`}
          >
            Back View
          </button>
        </div>

        {/* Interactive Viewer Wrapper */}
        <div className="relative w-full max-w-[500px] h-[480px] bg-[#000B33] rounded-[24px] shadow-inner border-[6px] border-white overflow-hidden mb-8 [&_path]:stroke-[#000B33] [&_path]:stroke-[1.5px] [&_path]:transition-colors">
          
          <TransformWrapper
            initialScale={1.2}
            minScale={0.8}
            maxScale={4}
            centerOnInit={true}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-10">
                  <button onClick={() => zoomIn()} className="p-3 bg-white/10 backdrop-blur-md border border-white/20 shadow-md rounded-[14px] text-white hover:bg-white/20 active:scale-95 transition-all"><ZoomIn size={22} /></button>
                  <button onClick={() => zoomOut()} className="p-3 bg-white/10 backdrop-blur-md border border-white/20 shadow-md rounded-[14px] text-white hover:bg-white/20 active:scale-95 transition-all"><ZoomOut size={22} /></button>
                  <button onClick={() => resetTransform()} className="p-3 bg-white/10 backdrop-blur-md border border-white/20 shadow-md rounded-[14px] text-white hover:bg-white/20 active:scale-95 transition-all"><Maximize size={22} /></button>
                </div>

                <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Model
                    type={view}
                    data={data}
                    onClick={handleClick as any}
                    highlightedColors={["#FF3B30"]} // Bright red for pain on dark theme
                    bodyColor="#FDFBF7" // Bone/Cream color for extreme contrast
                    style={{ width: "260px", padding: "10px", filter: "drop-shadow(0px 0px 20px rgba(253,251,247,0.15))" }}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>

        <div className="flex w-full justify-between items-center mt-auto max-w-xl mx-auto h-16">
          {selectedMuscle ? (
            <>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#000B33]/50 uppercase tracking-widest">Selected Region</span>
                <p className="text-[24px] font-bold text-[#000B33] capitalize">
                  {selectedMuscle.replace("-", " ")}
                </p>
              </div>
              <button
                onClick={nextScreen}
                className="px-10 py-5 rounded-[20px] bg-[#000B33] text-white text-[19px] font-semibold shadow-md hover:bg-black active:scale-[0.98] transition-all"
              >
                Continue
              </button>
            </>
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
