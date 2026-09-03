import { useStore } from "@/store/useStore";
import { UserPlus, UserCircle } from "lucide-react";

export function ScreenWelcome() {
  const { setScreen, setIsNewPatient } = useStore();

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
      <div className="max-w-[800px] w-full min-h-[700px] bg-[#FDFBF7]/95 backdrop-blur-3xl p-16 rounded-[40px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col items-center justify-between text-center">
        
        <div className="flex items-center gap-4 mb-auto">
          <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#000B33] text-white shadow-sm">
            <span className="font-serif text-[28px] font-bold">M</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-bold tracking-[0.2em] text-[#000B33]/50 uppercase mb-0.5">
              Hospital System
            </span>
            <span className="font-serif text-[22px] text-[#000B33] leading-none">
              MediKiosk
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center max-w-2xl my-16">
          <span className="text-[14px] font-bold tracking-[0.15em] text-[#000B33]/60 uppercase mb-8">
            Patient Intake
          </span>
          <h1 className="text-[64px] font-serif leading-[1.1] tracking-tight text-[#000B33] mb-8">
            Tell us how you're feeling.<br/>We'll listen.
          </h1>
          <p className="text-[22px] text-[#000B33]/60 font-medium leading-[1.5] max-w-[540px]">
            A few calm questions before you see the doctor. Speak, tap, or both — at your pace.
          </p>
        </div>

        <div className="flex flex-col items-center w-full max-w-[560px] gap-5">
          <button
            onClick={() => handleSelect(true)}
            className="w-full rounded-full bg-[#000B33] py-[22px] text-[22px] font-semibold text-white transition-all hover:bg-black active:scale-[0.98] shadow-md"
          >
            Get started
          </button>
          
          <div className="flex gap-4 w-full">
            <button
              onClick={() => handleSelect(false)}
              className="flex-1 rounded-full bg-white border border-gray-200 py-[18px] text-[18px] font-semibold text-[#000B33] transition-all hover:border-[#000B33]/50 hover:bg-[#000B33]/5 active:scale-[0.98] shadow-sm"
            >
              I have an ABHA ID
            </button>
            <button
              onClick={() => handleSelect(true)}
              className="flex-1 rounded-full bg-white border border-gray-200 py-[18px] text-[18px] font-semibold text-[#000B33] transition-all hover:border-[#000B33]/50 hover:bg-[#000B33]/5 active:scale-[0.98] shadow-sm"
            >
              I'm new here
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
