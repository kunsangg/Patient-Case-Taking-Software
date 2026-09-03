import { useStore } from "@/store/useStore";
import { Edit2, AlertCircle } from "lucide-react";

export function ScreenReview() {
  const { patientCase, nextScreen } = useStore();

  return (
    <div className="flex h-full flex-col px-10 pb-12 max-w-4xl mx-auto w-full justify-center">
      <div className="bg-[#FDFBF7]/95 backdrop-blur-3xl rounded-[32px] p-12 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col max-h-[85vh]">
        <div className="text-center mb-10 shrink-0">
          <h1 className="text-[36px] font-serif tracking-tight text-[#000B33] mb-3">
            Your case is ready
          </h1>
          <p className="text-[19px] text-[#000B33]/70 font-medium">
            Please review the information before sending it to your doctor.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto mb-10 px-2 space-y-6">
          
          {/* Main concern */}
          <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100 group relative">
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-[#000B33]/50 uppercase tracking-widest">Main Concern</h3>
              <button className="text-[#000B33]/50 hover:text-[#000B33] transition-colors flex items-center gap-2 text-sm font-semibold">
                <Edit2 className="h-4 w-4" /> Edit
              </button>
            </div>
            <p className="text-[22px] font-semibold text-[#000B33]">
              {patientCase.chiefComplaint[0]?.symptom || "Not provided"}
            </p>
          </div>

          {/* Symptoms & History */}
          <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100 group relative">
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-[#000B33]/50 uppercase tracking-widest">Symptoms</h3>
              <button className="text-[#000B33]/50 hover:text-[#000B33] transition-colors flex items-center gap-2 text-sm font-semibold">
                <Edit2 className="h-4 w-4" /> Edit
              </button>
            </div>
            <ul className="space-y-3">
              {Object.entries(patientCase.history).map(([key, val]) => (
                <li key={key} className="text-[19px] text-[#000B33] flex items-center">
                  <span className="w-40 text-[#000B33]/60 capitalize">{key}:</span>
                  <span className="font-semibold">{val}</span>
                </li>
              ))}
              {Object.keys(patientCase.history).length === 0 && (
                <li className="text-[19px] text-[#000B33]/50">No details provided</li>
              )}
            </ul>
          </div>

          {/* Medications */}
          <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100 group relative">
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-[#000B33]/50 uppercase tracking-widest">Medications</h3>
              <button className="text-[#000B33]/50 hover:text-[#000B33] transition-colors flex items-center gap-2 text-sm font-semibold">
                <Edit2 className="h-4 w-4" /> Edit
              </button>
            </div>
            {patientCase.medications.length > 0 ? (
              <ul className="space-y-3">
                {patientCase.medications.map((med, i) => (
                  <li key={i} className="text-[19px] text-[#000B33] font-semibold">
                    {med.name} — {med.dosage} — {med.frequency}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[19px] text-[#000B33]/50">None reported</p>
            )}
          </div>

          {/* Important Info */}
          <div className="bg-amber-50 rounded-[20px] p-8 border border-amber-200/60">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[17px] font-semibold text-amber-900 mb-1">Important Information</h3>
                <p className="text-[17px] text-amber-800/80 leading-relaxed font-medium">
                  MEDI-OS organizes the information you provide. It does not diagnose or prescribe. 
                  Your physician remains the final decision-maker.
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-center shrink-0">
          <button
            onClick={nextScreen}
            className="w-full rounded-[20px] bg-[#000B33] px-8 py-5 text-[19px] font-medium text-white transition-all hover:bg-black active:scale-[0.98] shadow-md"
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );
}
