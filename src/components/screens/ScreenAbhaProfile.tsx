import { useStore } from "@/store/useStore";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, User } from "lucide-react";
import { motion } from "framer-motion";

export function ScreenAbhaProfile() {
  const { abhaProfile, setScreen, patientCase } = useStore();

  // Fallback data if profile is empty (to match user's screenshot exactly during testing)
  const profile = abhaProfile || {
    fn: "Kunsang Dorjay",
    ln: "Bhutia",
    abha_number: "91-4430-3423-1458",
    phr_address: "kunsangdorjay2006@abdm",
    gender: "M",
    dob: "03-10-2006",
    mobile: "8250341785",
    pic: null,
  };

  const fullName = profile.fn ? `${profile.fn} ${profile.ln || ""}`.trim() : profile.name || patientCase.patientName || "Verified Patient";
  const genderMap: Record<string, string> = { M: "Male", F: "Female", O: "Other", U: "Unknown" };
  const displayGender = genderMap[profile.gender] || profile.gender || "Not specified";

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12 w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[750px] w-full bg-[#FDFBF7]/95 backdrop-blur-3xl p-10 rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col"
      >
        
        {/* Top Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] font-bold text-[#000B33]">
            Welcome, {fullName}
          </h2>
          <div className="flex gap-4 text-[#D35400] text-[14px] font-medium">
            <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Download size={16} /> Download ABHA card
            </button>
            <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Printer size={16} /> Print ABHA
            </button>
          </div>
        </div>

        {/* The Card Itself */}
        <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          
          {/* Card Header (Blue) */}
          <div className="bg-[#1C3E7B] px-6 py-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              {/* Fake NHA Logo */}
              <div className="flex flex-col border-l-2 border-white/30 pl-3">
                <span className="text-[12px] font-bold leading-tight">national</span>
                <span className="text-[12px] font-bold leading-tight">health</span>
                <span className="text-[12px] font-bold leading-tight">authority</span>
              </div>
            </div>
            
            <div className="text-center flex flex-col">
              <span className="font-semibold text-[17px] tracking-wide">Ayushman Bharat Health Account (ABHA)</span>
              <span className="font-medium text-[15px]">आयुष्मान भारत स्वास्थ्य खाता (आभा)</span>
            </div>

            {/* Fake NDL Logo */}
            <div className="h-12 w-12 rounded-full bg-white p-1 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-green-500 flex items-center justify-center">
                <span className="text-green-600 font-bold text-[10px]">NDHM</span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 flex justify-between">
            {/* Left Col: Photo */}
            <div className="flex-shrink-0 w-32 h-40 bg-gray-100 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center">
              {profile.pic ? (
                <img src={`data:image/jpeg;base64,${profile.pic}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-400" />
              )}
            </div>

            {/* Middle Col: Details */}
            <div className="flex-grow px-8 flex flex-col justify-between">
              <div>
                <p className="text-[#000B33]/60 text-[13px] font-bold">Name/नाम</p>
                <p className="text-[#000B33] text-[20px] font-bold leading-tight mb-4">{fullName}</p>
                
                <p className="text-[#000B33]/60 text-[13px] font-bold">ABHA number/आभा-संख्या</p>
                <p className="text-[#000B33] text-[20px] font-bold leading-tight mb-4">{profile.abha_number || "XX-XXXX-XXXX-XXXX"}</p>
                
                <p className="text-[#000B33]/60 text-[13px] font-bold">ABHA address/आभा पता</p>
                <p className="text-[#000B33] text-[20px] font-bold leading-tight">{profile.phr_address || profile.abha_address || "Not generated"}</p>
              </div>
              
              <div className="flex justify-between pt-6 mt-4 border-t border-gray-100">
                <div>
                  <p className="text-[#000B33]/60 text-[13px] font-bold">Gender/लिंग</p>
                  <p className="text-[#000B33] text-[16px] font-bold">{displayGender}</p>
                </div>
                <div>
                  <p className="text-[#000B33]/60 text-[13px] font-bold">Date of birth/जन्मतिथि</p>
                  <p className="text-[#000B33] text-[16px] font-bold">{profile.dob || "XX-XX-XXXX"}</p>
                </div>
                <div>
                  <p className="text-[#000B33]/60 text-[13px] font-bold">Mobile/मोबाइल</p>
                  <p className="text-[#000B33] text-[16px] font-bold">{profile.mobile || "XXXXXXXXXX"}</p>
                </div>
              </div>
            </div>

            {/* Right Col: QR */}
            <div className="flex-shrink-0 flex items-start">
              <div className="p-2 border border-gray-200 rounded-md bg-white">
                <QRCodeSVG value={`did:abha:${profile.abha_number}`} size={120} level="M" />
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-10">
          <button
            onClick={() => setScreen(1)} // Go back
            className="rounded-[20px] px-8 py-4 text-[17px] font-semibold transition-all bg-white text-[#000B33] border border-gray-200 hover:border-[#000B33]"
          >
            Not me
          </button>
          
          <button
            onClick={() => setScreen(2)} // Proceed to Consent
            className="rounded-[20px] px-10 py-4 text-[18px] font-semibold transition-all bg-[#000B33] text-white hover:bg-black shadow-md active:scale-[0.98]"
          >
            Authorize & Proceed
          </button>
        </div>

      </motion.div>
    </div>
  );
}
