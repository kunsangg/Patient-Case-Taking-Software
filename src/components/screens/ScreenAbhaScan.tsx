import { useState, useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";

declare global {
  interface Window {
    initAbhaApp?: (config: any) => void;
  }
}

export function ScreenAbhaScan() {
  const { setScreen, updateCase, setAbhaProfile } = useStore();
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const sdkInitialized = useRef(false);

  useEffect(() => {
    const scriptId = "abha-sdk-script";
    const existingScript = document.getElementById(scriptId);
    
    if (!existingScript) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/@eka-care/abha-stg/dist/sdk/abha/css/abha.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/@eka-care/abha-stg/dist/sdk/abha/js/abha.js";
      script.type = "module";
      script.onload = () => {
        setSdkLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setSdkLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (sdkLoaded && window.initAbhaApp && !sdkInitialized.current) {
      sdkInitialized.current = true;
      
      try {
        window.initAbhaApp({
        containerId: "abha_sdk_container",
        clientId: "ext",
        theme: {
          // Minimal overrides to match our cream theme
        },
        data: {},
        onSuccess: (params: any) => {
          console.log("ABHA Registration flow completed:", params);
          const profile = params?.response?.data?.profile;
          if (profile) {
            setAbhaProfile(profile);
            const fullName = profile.fn ? `${profile.fn} ${profile.ln || ""}`.trim() : profile.name;
            if (fullName) {
              updateCase({ patientName: fullName });
            }
          } else {
            // Mock profile if testing without real data
            setAbhaProfile({
              fn: "Kunsang Dorjay",
              ln: "Bhutia",
              abha_number: "91-4430-3423-1458",
              phr_address: "kunsangdorjay2006@abdm",
              gender: "M",
              dob: "03-10-2006",
              mobile: "8250341785"
            });
          }
          setScreen(11); // Proceed to Profile View
        },
        onKYCSuccess: (params: any) => {
          console.log("ABHA KYC Verified successfully:", params);
        },
        onConsentSuccess: (params: any) => {
          console.log("ABHA Consent flow completed successfully:", params);
          setScreen(2); // Proceed to consent
        },
        onAppointmentBookedSuccess: (params: any) => {
          console.log("Appointment Booked successfully:", params);
        },
        onSkipAbha: (params: any) => {
          console.log("ABHA flow SKIPPED:", params);
          setScreen(2);
        },
        onAbhaClose: () => {
          console.log("ABHA SDK closed");
          setScreen(1); // Go back to welcome
        },
        onError: (params: any) => {
          console.error("ABHA SDK failed:", params);
        },
      });
      } catch (e) {
        console.error("Failed to initialize ABHA SDK:", e);
      }
    }
  }, [sdkLoaded, setScreen, updateCase]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 pb-12 w-full">
      <div className="max-w-[480px] w-full bg-white/95 backdrop-blur-3xl p-8 rounded-card shadow-card border border-white/60 flex flex-col items-center text-center">

        <div className="w-full h-[600px] relative rounded-card-sm overflow-hidden bg-white/50 border border-black/10" id="abha_sdk_container">
          {!sdkLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#000B33]/20 border-t-[#000B33]" />
              <span className="text-[#000B33]/55 font-medium animate-pulse">
                Loading Secure ABHA Portal...
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setScreen(2)}
          className="mt-6 text-[#000B33]/50 font-semibold text-body hover:text-[#000B33] transition-colors duration-300 ease-premium"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
