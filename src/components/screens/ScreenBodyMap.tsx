import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useT } from "@/store/useTranslation";
import { useAutoSpeak, useSpeak } from "@/store/useSpeech";
import { Volume2, CheckCircle2, RotateCw, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HEADLINE = "Where does it hurt?";

interface AnatomyRegion {
  id: string;
  name: string;
  view: "front" | "back";
  cx: number;
  cy: number;
  path: string;
}

const REGIONS: AnatomyRegion[] = [
  // FRONT VIEW REGIONS
  {
    id: "head",
    name: "Head & Face",
    view: "front",
    cx: 200,
    cy: 65,
    path: "M 200 23 C 220 23 236 41 236 65 C 236 89 220 107 200 107 C 180 107 164 89 164 65 C 164 41 180 23 200 23 Z",
  },
  {
    id: "neck",
    name: "Neck & Throat",
    view: "front",
    cx: 200,
    cy: 120,
    path: "M 186 107 L 214 107 L 214 133 L 186 133 Z",
  },
  {
    id: "chest",
    name: "Chest & Ribs",
    view: "front",
    cx: 200,
    cy: 166,
    path: "M 148 133 C 165 130 235 130 252 133 L 256 200 L 144 200 Z",
  },
  {
    id: "abdomen",
    name: "Stomach & Abdomen",
    view: "front",
    cx: 200,
    cy: 238,
    path: "M 144 202 L 256 202 L 248 275 L 152 275 Z",
  },
  {
    id: "pelvis",
    name: "Hips & Pelvis",
    view: "front",
    cx: 200,
    cy: 303,
    path: "M 152 277 L 248 277 L 240 330 L 160 330 Z",
  },
  {
    id: "left_arm",
    name: "Right Arm & Hand",
    view: "front",
    cx: 115,
    cy: 220,
    path: "M 145 136 C 132 145 122 185 114 235 L 100 310 C 98 320 90 320 92 310 L 108 230 C 116 180 128 142 145 136 Z",
  },
  {
    id: "right_arm",
    name: "Left Arm & Hand",
    view: "front",
    cx: 285,
    cy: 220,
    path: "M 255 136 C 268 145 278 185 286 235 L 300 310 C 302 320 310 320 308 310 L 292 230 C 284 180 272 142 255 136 Z",
  },
  {
    id: "left_leg",
    name: "Right Leg & Knee",
    view: "front",
    cx: 175,
    cy: 400,
    path: "M 160 332 L 195 332 L 188 470 C 185 478 165 478 162 470 Z",
  },
  {
    id: "right_leg",
    name: "Left Leg & Knee",
    view: "front",
    cx: 225,
    cy: 400,
    path: "M 205 332 L 240 332 L 238 470 C 235 478 215 478 212 470 Z",
  },

  // BACK VIEW REGIONS
  {
    id: "head_back",
    name: "Back of Head",
    view: "back",
    cx: 200,
    cy: 65,
    path: "M 200 23 C 220 23 236 41 236 65 C 236 89 220 107 200 107 C 180 107 164 89 164 65 C 164 41 180 23 200 23 Z",
  },
  {
    id: "neck_back",
    name: "Neck (Back)",
    view: "back",
    cx: 200,
    cy: 120,
    path: "M 186 107 L 214 107 L 214 133 L 186 133 Z",
  },
  {
    id: "upper_back",
    name: "Upper Back & Shoulders",
    view: "back",
    cx: 200,
    cy: 171,
    path: "M 144 133 C 165 130 235 130 256 133 L 252 210 L 148 210 Z",
  },
  {
    id: "lower_back",
    name: "Lower Back & Spine",
    view: "back",
    cx: 200,
    cy: 248,
    path: "M 148 212 L 252 212 L 244 285 L 156 285 Z",
  },
  {
    id: "glutes",
    name: "Hips & Glutes",
    view: "back",
    cx: 200,
    cy: 311,
    path: "M 156 287 L 244 287 L 238 335 L 162 335 Z",
  },
  {
    id: "left_arm_back",
    name: "Left Arm (Back)",
    view: "back",
    cx: 111,
    cy: 220,
    path: "M 141 136 C 128 145 118 185 110 235 L 96 310 C 94 320 86 320 88 310 L 104 230 C 112 180 124 142 141 136 Z",
  },
  {
    id: "right_arm_back",
    name: "Right Arm (Back)",
    view: "back",
    cx: 289,
    cy: 220,
    path: "M 259 136 C 272 145 282 185 290 235 L 304 310 C 306 320 314 320 312 310 L 296 230 C 288 180 276 142 259 136 Z",
  },
  {
    id: "left_leg_back",
    name: "Left Leg (Back)",
    view: "back",
    cx: 176,
    cy: 400,
    path: "M 162 337 L 196 337 L 189 470 C 186 478 166 478 163 470 Z",
  },
  {
    id: "right_leg_back",
    name: "Right Leg (Back)",
    view: "back",
    cx: 224,
    cy: 400,
    path: "M 204 337 L 238 337 L 237 470 C 234 478 214 478 211 470 Z",
  },
];

export function ScreenBodyMap() {
  const { nextScreen, updateCase } = useStore();
  const t = useT();
  const { speak } = useSpeak();
  const headline = t(HEADLINE);
  useAutoSpeak(headline, HEADLINE);

  const [view, setView] = useState<"front" | "back">("front");
  const [selectedRegion, setSelectedRegion] = useState<AnatomyRegion | null>(null);
  const [customDetail, setCustomDetail] = useState("");

  const activeRegions = REGIONS.filter((r) => r.view === view);

  const handleSelectRegion = (region: AnatomyRegion) => {
    setSelectedRegion(region);
    const locationText = customDetail.trim()
      ? `${region.name} (${customDetail.trim()})`
      : region.name;
    updateCase({ history: { location: locationText } });
  };

  const handleCustomDetailChange = (text: string) => {
    setCustomDetail(text);
    if (selectedRegion) {
      const locationText = text.trim()
        ? `${selectedRegion.name} (${text.trim()})`
        : selectedRegion.name;
      updateCase({ history: { location: locationText } });
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 md:px-8 pb-6 w-full">
      <div className="max-w-3xl w-full bg-white/95 backdrop-blur-3xl p-6 md:p-8 rounded-card shadow-card border border-white/60 flex flex-col items-center max-h-[88vh] overflow-y-auto scrollbar-hide">

        {/* Top Header */}
        <div className="text-center mb-4 shrink-0">
          <h1 className="text-2xl md:text-3xl font-serif text-[#000B33] mb-1">
            {headline}
          </h1>
          <p className="text-sm text-[#000B33]/60 max-w-md mx-auto mb-1">
            {t("Tap directly on any body part to pinpoint your exact pain location.")}
          </p>
          <button
            onClick={() => speak(headline)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C718A] uppercase hover:opacity-70 transition-opacity"
          >
            <Volume2 className="h-3.5 w-3.5" />
            {t("Listen again")}
          </button>
        </div>

        {/* Compact Interactive Anatomy Card Container */}
        <div className="w-full max-w-[620px] bg-gradient-to-b from-slate-50/90 to-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col items-center relative mb-4 shrink-0">

          {/* View Indicator & Flip Controls */}
          <div className="flex items-center justify-between w-full mb-3 px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#000B33]/60 uppercase tracking-wider">
              <MapPin size={14} className="text-[#1C718A]" />
              <span>{t("Anatomy View:")} <strong className="text-[#000B33] capitalize">{t(view)}</strong></span>
            </div>

            <button
              onClick={() => {
                setView(view === "front" ? "back" : "front");
                setSelectedRegion(null);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-[#000B33] shadow-sm hover:border-[#1C718A] hover:text-[#1C718A] transition-all"
            >
              <RotateCw size={12} />
              <span>{t("Flip to")} {view === "front" ? t("Back View") : t("Front View")}</span>
            </button>
          </div>

          {/* Compact Fluid Precision Anatomy SVG Container */}
          <div className="relative w-full max-w-[240px] aspect-[4/5] flex items-center justify-center select-none bg-white/80 rounded-xl border border-slate-100 p-1.5 shadow-inner mb-3">
            <svg viewBox="0 0 400 500" className="w-full h-full">
              
              {/* Render Anatomical Regions with Scaled Precision */}
              {activeRegions.map((region) => {
                const isSelected = selectedRegion?.id === region.id;

                return (
                  <g
                    key={region.id}
                    onClick={() => handleSelectRegion(region)}
                    className="cursor-pointer group"
                  >
                    {/* Anatomical Region Shape */}
                    <path
                      d={region.path}
                      className={`transition-all duration-300 ${
                        isSelected
                          ? "fill-[#1C718A] stroke-[#000B33] stroke-[3] shadow-lg"
                          : "fill-[#EBF2F5] stroke-[#B0C8D0] stroke-[2.5] hover:fill-[#1C718A]/30 hover:stroke-[#1C718A]"
                      }`}
                    />

                    {/* Pin Target Marker exactly at (cx, cy) */}
                    {isSelected ? (
                      <g>
                        {/* Outer Pulsing Ring */}
                        <circle
                          cx={region.cx}
                          cy={region.cy}
                          r="18"
                          className="fill-[#1C718A]/30 stroke-white stroke-2 animate-ping"
                        />
                        {/* Inner Pin Target Dot */}
                        <circle
                          cx={region.cx}
                          cy={region.cy}
                          r="8"
                          className="fill-white stroke-[#000B33] stroke-2 shadow-md"
                        />
                        <circle
                          cx={region.cx}
                          cy={region.cy}
                          r="4"
                          className="fill-[#1C718A]"
                        />
                      </g>
                    ) : (
                      /* Idle Spot Dot Indicator */
                      <circle
                        cx={region.cx}
                        cy={region.cy}
                        r="3.5"
                        className="fill-[#1C718A]/40 group-hover:fill-[#1C718A] group-hover:r-5 transition-all"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Compact Quick Select Pills */}
          <div className="w-full pt-3 border-t border-slate-200/80 flex flex-col items-center">
            <span className="text-[11px] font-bold text-[#000B33]/40 uppercase mb-2 tracking-wider">
              {t("Or tap a region name:")}
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 max-w-lg">
              {activeRegions.map((region) => {
                const isSelected = selectedRegion?.id === region.id;
                return (
                  <button
                    key={region.id}
                    onClick={() => handleSelectRegion(region)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      isSelected
                        ? "bg-[#1C718A] text-white shadow-sm scale-105"
                        : "bg-white text-[#000B33]/80 border border-gray-200 hover:border-[#1C718A] hover:text-[#1C718A]"
                    }`}
                  >
                    {t(region.name)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Region Confirmation Card */}
        <AnimatePresence>
          {selectedRegion && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="w-full max-w-[620px] bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 shadow-sm shrink-0"
            >
              <div className="flex items-center gap-2.5 text-left">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-wider block">{t("Pain Location Pinpointed")}</span>
                  <span className="text-sm font-bold text-emerald-950">{t(selectedRegion.name)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder={t("Specific detail (e.g. Sharp pain on left side)...")}
                  value={customDetail}
                  onChange={(e) => handleCustomDetailChange(e.target.value)}
                  className="px-3.5 py-1.5 bg-white border border-emerald-200 rounded-full text-xs font-medium text-[#000B33] focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full sm:w-[240px]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation Actions */}
        <div className="flex w-full justify-between items-center mt-auto max-w-xs mx-auto shrink-0">
          {selectedRegion ? (
            <button
              onClick={nextScreen}
              className="w-full py-3.5 rounded-full bg-[#000B33] text-white text-sm font-semibold hover:bg-black active:scale-[0.98] transition-all duration-300 ease-premium shadow-md"
            >
              {t("Save & Continue")}
            </button>
          ) : (
            <button
              onClick={nextScreen}
              className="w-full py-3 text-[#000B33]/45 text-sm font-medium hover:text-[#000B33] transition-colors duration-300 ease-premium"
            >
              {t("Skip this step")}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
