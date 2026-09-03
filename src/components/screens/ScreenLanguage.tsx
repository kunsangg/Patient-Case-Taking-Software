import { useStore } from "@/store/useStore";

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

export function ScreenLanguage() {
  const { setLanguage, setScreen } = useStore();
  
  const handleSelect = (lang: string) => {
    setLanguage(lang);
    setScreen(4); // Go to Intake Home
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-4">
          Please select your preferred language
        </h1>
        <p className="text-lg text-white/90 font-medium">
          Your entire intake experience will be translated in real-time.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-4xl">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.english}
            onClick={() => handleSelect(lang.english)}
            className="group flex flex-col items-center justify-center py-8 rounded-[24px] bg-[#FDFBF7]/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 hover:bg-white hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            <span className="text-4xl font-semibold text-[#000B33] mb-3 group-hover:text-blue-600 transition-colors">
              {lang.script}
            </span>
            {lang.script !== lang.english && (
              <span className="text-lg font-medium text-[#000B33]/60 group-hover:text-blue-600/80 transition-colors">
                {lang.english}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
