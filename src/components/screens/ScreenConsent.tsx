import { useStore } from "@/store/useStore";
import { useT } from "@/store/useTranslation";
import { useAutoSpeak } from "@/store/useSpeech";
import { ShieldCheck, Mic, FileText } from "lucide-react";
import { motion } from "framer-motion";

const HEADLINE = "A quick word of trust";
const SUBTITLE = "We'll only ask what helps the doctor understand you today. You can skip anything that feels too much.";

const ITEMS = [
  { icon: Mic, title: "Your story, in your words", body: "We'll ask why you're here. Speak or tap — both reach the doctor the same way." },
  { icon: FileText, title: "Papers, if you have them", body: "A prescription or report can be photographed. We'll pull out the names of medicines for you to check." },
  { icon: ShieldCheck, title: "Stays in this hospital", body: "This helps today's visit. It is not shared outside the clinic for this demo." },
];

export function ScreenConsent() {
  const nextScreen = useStore((state) => state.nextScreen);
  const t = useT();

  const headlineText = t(HEADLINE);
  const subtitleText = t(SUBTITLE);
  useAutoSpeak(`${headlineText}. ${subtitleText}`, HEADLINE);

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-3xl p-12 rounded-card shadow-card border border-white/60 flex flex-col text-left">

        <h1 className="text-display font-serif text-[#000B33] mb-4">
          {t("A quick word of trust")}
        </h1>

        <p className="text-body-lg leading-relaxed text-[#000B33]/60 mb-10">
          {t("We'll only ask what helps the doctor understand you today. You can skip anything that feels too much.")}
        </p>

        <div className="flex flex-col gap-7 mb-12">
          {ITEMS.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-5"
            >
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-card-sm bg-[#E8F2F4] text-[#1C718A]">
                <Icon className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col pt-1">
                <h3 className="text-body font-semibold text-[#000B33] mb-1">{t(title)}</h3>
                <p className="text-[15px] leading-relaxed text-[#000B33]/55">{t(body)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center w-full">
          <button
            onClick={nextScreen}
            className="flex items-center justify-center w-full max-w-sm rounded-full bg-[#000B33] px-8 py-5 text-body font-semibold text-white transition-all duration-300 ease-premium hover:bg-black active:scale-[0.98]"
          >
            {t("I understand & continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
