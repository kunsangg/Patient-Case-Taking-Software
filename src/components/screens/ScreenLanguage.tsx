import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useSpeak, stopAllSpeech } from "@/store/useSpeech";

const LANGUAGES = [
  { script: "हिन्दी", english: "Hindi" },
  { script: "नेपाली", english: "Nepali" },
  { script: "বাংলা", english: "Bengali" },
  { script: "English", english: "English" },
  { script: "தமிழ்", english: "Tamil" },
  { script: "తెలుగు", english: "Telugu" },
  { script: "मराठी", english: "Marathi" },
  { script: "ಕನ್ನಡ", english: "Kannada" },
  { script: "മലയാളം", english: "Malayalam" },
];

const HINDI_NARRATION = "कृपया अपनी पसंदीदा भाषा चुनें। आपका पूरा अनुभव आपकी भाषा में अनुवादित किया जाएगा।";

export function ScreenLanguage() {
  const { setLanguage, setScreen } = useStore();
  const { speak } = useSpeak();

  useEffect(() => {
    const timer = setTimeout(() => {
      speak(HINDI_NARRATION, undefined, "Hindi");
    }, 400);
    return () => {
      clearTimeout(timer);
      stopAllSpeech();
    };
  }, [speak]);

  const handleSelect = (lang: string) => {
    stopAllSpeech();
    setLanguage(lang);
    setScreen(2); // Go to Welcome Screen
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12">
      <div className="text-center mb-12">
        <h1 className="text-display font-serif text-white mb-3">
          Please select your preferred language
        </h1>
        <p className="text-body-lg text-white/70">
          Your entire intake experience will be translated in real-time.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5 w-full max-w-4xl">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.english}
            onClick={() => handleSelect(lang.english)}
            className="group flex flex-col items-center justify-center py-8 rounded-card-sm bg-white/95 backdrop-blur-3xl shadow-card border border-white/60 transition-all duration-300 ease-premium hover:bg-white hover:-translate-y-0.5"
          >
            <span className="text-title font-serif text-[#000B33] mb-2 group-hover:text-[#1C718A] transition-colors">
              {lang.script}
            </span>
            {lang.script !== lang.english && (
              <span className="text-[15px] font-medium text-[#000B33]/50 group-hover:text-[#1C718A]/80 transition-colors">
                {lang.english}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
