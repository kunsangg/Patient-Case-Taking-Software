import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function ScreenComplete() {
  const { resetSession } = useStore();

  useEffect(() => {
    // Reset back to welcome after 15 seconds
    const timer = setTimeout(() => {
      resetSession();
    }, 15000);
    return () => clearTimeout(timer);
  }, [resetSession]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12">
      <div className="max-w-2xl w-full bg-[#FDFBF7]/95 backdrop-blur-3xl p-16 rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col items-center text-center">
        
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, delay: 0.2 }}
          className="mb-10 flex h-24 w-24 items-center justify-center rounded-[24px] bg-emerald-50 border border-emerald-100 shadow-sm"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-500 stroke-[2.5]" />
        </motion.div>

        <div className="text-center mb-12">
          <h1 className="text-[36px] font-serif tracking-tight text-[#000B33] mb-4">
            Your case has been submitted.
          </h1>
          <p className="text-[19px] text-[#000B33]/70 max-w-xl mx-auto font-medium">
            Your doctor will review the information before your consultation.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-[24px] p-10 shadow-sm border border-gray-100 flex flex-col items-center min-w-[300px]"
        >
          <span className="text-sm font-bold text-[#000B33]/50 uppercase tracking-widest mb-3">
            Queue Number
          </span>
          <span className="text-6xl font-bold tracking-tight text-[#000B33]">
            A-127
          </span>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-[19px] font-semibold text-[#000B33]/60"
        >
          Please take a seat in the waiting area.
        </motion.p>
      </div>
    </div>
  );
}
