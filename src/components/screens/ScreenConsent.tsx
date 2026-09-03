import { useStore } from "@/store/useStore";
import { ShieldCheck, Mic, FileText } from "lucide-react";

export function ScreenConsent() {
  const nextScreen = useStore((state) => state.nextScreen);

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12">
      <div className="max-w-2xl w-full bg-[#FDFBF7]/95 backdrop-blur-3xl p-12 rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col text-left">
        
        <h1 className="text-[40px] font-serif tracking-tight text-[#000B33] mb-4">
          A quick word of trust
        </h1>
        
        <p className="text-[19px] leading-relaxed text-[#000B33]/80 mb-10 font-medium">
          We&apos;ll only ask what helps the doctor understand you today. You can skip anything that feels too much.
        </p>

        <div className="flex flex-col gap-8 mb-12">
          {/* Item 1 */}
          <div className="flex gap-5">
            <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#F0F7F6] text-[#2C5F55] shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-white">
              <Mic className="h-[26px] w-[26px] stroke-[2.2]" />
            </div>
            <div className="flex flex-col pt-1">
              <h3 className="text-[19px] font-semibold text-[#000B33] mb-1">Your story, in your words</h3>
              <p className="text-[17px] leading-relaxed text-[#000B33]/70">We&apos;ll ask why you&apos;re here. Speak or tap — both reach the doctor the same way.</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex gap-5">
            <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#F0F7F6] text-[#2C5F55] shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-white">
              <FileText className="h-[26px] w-[26px] stroke-[2.2]" />
            </div>
            <div className="flex flex-col pt-1">
              <h3 className="text-[19px] font-semibold text-[#000B33] mb-1">Papers, if you have them</h3>
              <p className="text-[17px] leading-relaxed text-[#000B33]/70">A prescription or report can be photographed. We&apos;ll pull out the names of medicines for you to check.</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex gap-5">
            <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#F0F7F6] text-[#2C5F55] shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-white">
              <ShieldCheck className="h-[26px] w-[26px] stroke-[2.2]" />
            </div>
            <div className="flex flex-col pt-1">
              <h3 className="text-[19px] font-semibold text-[#000B33] mb-1">Stays in this hospital</h3>
              <p className="text-[17px] leading-relaxed text-[#000B33]/70">This helps today&apos;s visit. It is not shared outside the clinic for this demo.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <button
            onClick={nextScreen}
            className="flex items-center justify-center w-full max-w-sm rounded-[20px] bg-[#000B33] px-8 py-5 text-[19px] font-medium tracking-tight text-white transition-all hover:bg-black active:scale-[0.98]"
          >
            I understand & continue
          </button>
        </div>
      </div>
    </div>
  );
}
