import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useT } from "@/store/useTranslation";

export function ScreenWelcome() {
  const { setScreen, setIsNewPatient, resetSession } = useStore();
  const t = useT();

  const handleSelect = (isNew: boolean) => {
    setIsNewPatient(isNew);
    if (isNew) {
      setScreen(2); // Consent
    } else {
      setScreen(10); // ABHA Scan
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12 w-full">
      <div className="max-w-[760px] w-full min-h-[680px] bg-white/95 backdrop-blur-3xl p-16 rounded-card shadow-card border border-white/60 flex flex-col items-center justify-between text-center">

        <div className="flex items-center gap-3.5 mb-auto">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#000B33] text-white">
            <span className="font-serif text-[19px] font-bold">M</span>
          </div>
          <span className="font-serif text-[19px] text-[#000B33] leading-none">
            MediKiosk
          </span>
        </div>

        <div className="flex flex-col items-center max-w-2xl my-16">
          <h1 className="text-hero font-serif text-[#000B33] mb-7">
            {t("Tell us how you're feeling.")}<br />{t("We'll listen.")}
          </h1>
          <p className="text-body-lg text-[#000B33]/55 max-w-[480px]">
            {t("A few calm questions before you see the doctor. Speak, tap, or both — at your pace.")}
          </p>
        </div>

        <div className="flex flex-col items-center w-full max-w-[520px] gap-4">
          <button
            onClick={() => handleSelect(true)}
            className="w-full rounded-full bg-[#000B33] py-5 text-body font-semibold text-white transition-all duration-300 ease-premium hover:bg-black active:scale-[0.98]"
          >
            {t("Get started")}
          </button>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => handleSelect(false)}
              className="flex-1 rounded-full bg-white border border-black/10 py-4 text-body font-medium text-[#000B33] transition-all duration-300 ease-premium hover:border-[#000B33]/30"
            >
              {t("I have an ABHA ID")}
            </button>
            <button
              onClick={() => handleSelect(true)}
              className="flex-1 rounded-full bg-white border border-black/10 py-4 text-body font-medium text-[#000B33] transition-all duration-300 ease-premium hover:border-[#000B33]/30"
            >
              {t("I'm new here")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
