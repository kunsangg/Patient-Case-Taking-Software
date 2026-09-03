import { motion } from "framer-motion";

export function Waveform({ isListening }: { isListening: boolean }) {
  const bars = 5;
  
  return (
    <div className="flex items-center justify-center gap-2 h-16 w-32">
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 rounded-full bg-primary"
          initial={{ height: "4px" }}
          animate={{ 
            height: isListening 
              ? ["12px", "48px", "24px", "64px", "16px"][i % 5] 
              : "4px"
          }}
          transition={{
            duration: 0.5,
            repeat: isListening ? Infinity : 0,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}
