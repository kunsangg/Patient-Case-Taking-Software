import { useState, useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useT } from "@/store/useTranslation";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Smartphone, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    initAbhaApp?: (config: any) => void;
  }
}

export function ScreenAbhaScan() {
  const { setScreen, updateCase, setAbhaProfile } = useStore();
  const t = useT();
  const [sdkMounted, setSdkMounted] = useState(false);
  const [mode, setMode] = useState<"scan" | "mobile" | "otp">("scan");
  const [abhaInput, setAbhaInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  
  const sdkMountRef = useRef<HTMLDivElement>(null);
  const sdkInitialized = useRef(false);

  useEffect(() => {
    const scriptId = "abha-sdk-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/@eka-care/abha/dist/sdk/abha/css/abha.css";
      document.head.appendChild(link);

      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/@eka-care/abha/dist/sdk/abha/js/abha.js";
      script.type = "module";
      document.body.appendChild(script);
    }
  }, []);

  // Poll for window.initAbhaApp ready state
  useEffect(() => {
    let isSubscribed = true;
    let attempts = 0;

    const interval = setInterval(() => {
      attempts++;
      if (!isSubscribed) {
        clearInterval(interval);
        return;
      }
      
      if (window.initAbhaApp && sdkMountRef.current && !sdkInitialized.current) {
        clearInterval(interval);
        sdkInitialized.current = true;
        try {
          window.initAbhaApp({
            containerId: "abha_sdk_container",
            clientId: "ext",
            theme: {},
            data: {},
            onSuccess: (params: any) => {
              if (!isSubscribed) return;
              const profile = params?.response?.data?.profile;
              handleSuccessProfile(profile);
            },
            onKYCSuccess: (params: any) => {
              console.log("ABHA KYC Verified:", params);
            },
            onConsentSuccess: () => {
              if (isSubscribed) setScreen(2);
            },
            onSkipAbha: () => {
              if (isSubscribed) setScreen(2);
            },
            onAbhaClose: () => {
              if (isSubscribed) setScreen(1);
            },
            onError: (params: any) => {
              console.error("ABHA Error:", params);
            }
          });
          if (isSubscribed) setSdkMounted(true);
        } catch (e) {
          console.error("ABHA Init Error:", e);
        }
      } else if (attempts > 10) {
        clearInterval(interval);
      }
    }, 250);

    const containerEl = sdkMountRef.current;
    return () => {
      isSubscribed = false;
      clearInterval(interval);
      if (containerEl) {
        containerEl.innerHTML = "";
      }
    };
  }, [setScreen]);

  const handleSuccessProfile = (profile?: any) => {
    const verifiedProfile = profile || {
      fn: "Kunsang Dorjay",
      ln: "Bhutia",
      abha_number: abhaInput.includes("-") ? abhaInput : "91-4430-3423-1458",
      phr_address: "kunsangdorjay2006@abdm",
      gender: "M",
      dob: "03-10-2006",
      mobile: abhaInput.length === 10 ? abhaInput : "8250341785"
    };

    setAbhaProfile(verifiedProfile);
    const fullName = verifiedProfile.fn
      ? `${verifiedProfile.fn} ${verifiedProfile.ln || ""}`.trim()
      : "Verified Patient";
    updateCase({ patientName: fullName });
    setScreen(11); // Proceed to ABHA Card Profile screen
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "mobile") {
      setMode("otp");
    } else if (mode === "otp") {
      handleSuccessProfile();
    }
  };

  const handleSkip = () => {
    if (sdkMountRef.current) {
      sdkMountRef.current.innerHTML = "";
    }
    setScreen(2);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12 w-full">
      <div className="max-w-[480px] w-full bg-[#FDFBF7]/95 backdrop-blur-3xl p-8 rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col items-center text-center">
        
        {/* Container shell */}
        <div className="w-full h-[600px] relative rounded-[24px] overflow-hidden bg-white border border-gray-200 flex flex-col shadow-inner">
          
          {/* Isolated div for 3rd-party SDK DOM manipulation */}
          <div 
            id="abha_sdk_container" 
            ref={sdkMountRef} 
            className={`absolute inset-0 z-20 ${sdkMounted ? "block" : "hidden"}`} 
          />

          {/* Clean Portal UI fallback */}
          {!sdkMounted && (
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 bg-gradient-to-b from-[#F0F4FA] via-white to-white">
              
              {/* Official ABDM Header */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-10 w-10 rounded-xl bg-[#1C3E7B] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    ABDM
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#000B33] leading-tight">{t("ABHA Health Portal")}</h3>
                    <p className="text-[11px] text-[#000B33]/50 font-medium">Ayushman Bharat Digital Mission</p>
                  </div>
                </div>
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex bg-gray-100 p-1 rounded-2xl my-3 shrink-0">
                <button
                  onClick={() => setMode("scan")}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    mode === "scan" ? "bg-white text-[#000B33] shadow-sm" : "text-gray-500 hover:text-black"
                  }`}
                >
                  <QrCode size={14} /> {t("Scan & Share")}
                </button>
                <button
                  onClick={() => setMode("mobile")}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    mode === "mobile" || mode === "otp" ? "bg-white text-[#000B33] shadow-sm" : "text-gray-500 hover:text-black"
                  }`}
                >
                  <Smartphone size={14} /> ABHA / {t("Mobile")}
                </button>
              </div>

              {/* Body Content according to mode */}
              {mode === "scan" && (
                <div className="flex-1 flex flex-col items-center justify-center py-2 overflow-hidden">
                  <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-[#1C3E7B]/30 shadow-sm mb-3 flex flex-col items-center justify-center">
                    <QRCodeSVG 
                      value="phr:abdm:hospital:kiosk:scan" 
                      size={140} 
                      level="M" 
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-sm font-semibold text-[#000B33] mb-1">{t("Scan QR code using ABHA App")}</p>
                  <p className="text-xs text-gray-500 max-w-xs mb-4">{t("Open Aarogya Setu or ABHA App & scan to share health profile instantly.")}</p>
                  
                  <button
                    onClick={() => handleSuccessProfile()}
                    className="w-full py-3.5 bg-[#1C3E7B] text-white rounded-2xl font-semibold text-sm hover:bg-[#142d5a] transition-all flex items-center justify-center gap-2 shadow-md shrink-0"
                  >
                    <span>{t("Simulate Scan & Authorize")}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {(mode === "mobile" || mode === "otp") && (
                <form onSubmit={handleVerifySubmit} className="flex-1 flex flex-col justify-center py-2 text-left">
                  {mode === "mobile" ? (
                    <>
                      <label className="text-xs font-bold text-[#000B33]/70 mb-2 uppercase tracking-wider">
                        {t("Enter ABHA Number or Mobile")}
                      </label>
                      <input
                        type="text"
                        required
                        value={abhaInput}
                        onChange={(e) => setAbhaInput(e.target.value)}
                        placeholder="e.g. 91-4430-3423-1458 or 9876543210"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-[#000B33] mb-4 focus:outline-none focus:ring-2 focus:ring-[#1C3E7B]/30 focus:bg-white"
                      />
                      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                        {t("An OTP will be sent to the registered mobile number for identity verification.")}
                      </p>
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#1C3E7B] text-white rounded-2xl font-semibold text-sm hover:bg-[#142d5a] transition-all flex items-center justify-center gap-2 shadow-md mt-auto"
                      >
                        <span>{t("Send OTP")}</span>
                        <ArrowRight size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <CheckCircle2 size={18} />
                        <span className="text-xs font-semibold">{t("OTP sent to registered mobile")}</span>
                      </div>
                      <label className="text-xs font-bold text-[#000B33]/70 mb-2 uppercase tracking-wider">
                        {t("Enter 6-Digit OTP")}
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="• • • • • •"
                        className="w-full px-4 py-3.5 bg-gray-50 border border-[#1C3E7B]/20 rounded-2xl text-center text-lg font-bold tracking-widest text-[#000B33] mb-6 focus:outline-none focus:ring-2 focus:ring-[#1C3E7B]/30 focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#1C3E7B] text-white rounded-2xl font-semibold text-sm hover:bg-[#142d5a] transition-all flex items-center justify-center gap-2 shadow-md mt-auto"
                      >
                        <span>{t("Verify & Fetch Profile")}</span>
                        <ArrowRight size={16} />
                      </button>
                    </>
                  )}
                </form>
              )}

              {/* Security Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium shrink-0">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>256-bit ABDM Encrypted Health Gateway</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSkip}
          className="mt-6 text-[#000B33]/50 font-semibold text-[17px] hover:text-[#000B33] transition-colors"
        >
          {t("Skip for now")}
        </button>
      </div>
    </div>
  );
}
