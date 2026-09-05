import { create } from 'zustand';
import { PatientCase } from '../types';

interface AppState {
  currentScreen: number;
  language: string;
  isNewPatient: boolean | null;
  abhaProfile: any | null;
  patientCase: PatientCase;
  setScreen: (screen: number) => void;
  nextScreen: () => void;
  prevScreen: () => void;
  setLanguage: (lang: string) => void;
  setIsNewPatient: (isNew: boolean) => void;
  setAbhaProfile: (profile: any) => void;
  updateCase: (data: Partial<PatientCase>) => void;
  resetSession: () => void;
}

function createInitialCase(): PatientCase {
  return {
    patientId: '',
    encounterId: '',
    chiefComplaint: [],
    history: {},
    medications: [],
    allergies: [],
    pastHistory: [],
    familyHistory: [],
    personalHistory: [],
    investigations: [],
    procedures: [],
    documents: [],
    timeline: [],
    alerts: [],
    missingInformation: [],
    contradictions: [],
    aiAnalysis: {
      triageLevel: "Low",
      clinicalSummary: '',
      differentialDiagnosis: [],
      recommendedQuestions: [],
    },
  };
}

type NavigationListener = () => void;
const navListeners = new Set<NavigationListener>();

export function onNavigate(fn: NavigationListener) {
  navListeners.add(fn);
  return () => {
    navListeners.delete(fn);
  };
}

function notifyNavigate() {
  navListeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("Navigation listener error:", e);
    }
  });
}

export const useStore = create<AppState & { screenHistory: number[] }>((set) => ({
  currentScreen: 1,
  screenHistory: [],
  language: 'English',
  isNewPatient: null,
  abhaProfile: null,
  patientCase: createInitialCase(),
  
  setScreen: (screen) => {
    notifyNavigate();
    set((state) => ({ 
      screenHistory: [...state.screenHistory, state.currentScreen],
      currentScreen: screen 
    }));
  },
  
  nextScreen: () => {
    notifyNavigate();
    set((state) => ({ 
      screenHistory: [...state.screenHistory, state.currentScreen],
      currentScreen: Math.min(state.currentScreen + 1, 9) 
    }));
  },
  
  prevScreen: () => {
    notifyNavigate();
    set((state) => {
      const history = [...state.screenHistory];
      const prev = history.pop();
      if (prev === undefined) return { currentScreen: 1 };
      return {
        screenHistory: history,
        currentScreen: prev
      };
    });
  },
  
  setLanguage: (lang) => set({ language: lang }),
  setIsNewPatient: (isNew) => set({ isNewPatient: isNew }),
  setAbhaProfile: (profile) => set({ abhaProfile: profile }),
  
  updateCase: (data) => set((state) => ({ 
    patientCase: { ...state.patientCase, ...data } 
  })),
  
  // Enforces complete stateless isolation & data purging between patient sessions
  resetSession: () => {
    notifyNavigate();
    set({
      currentScreen: 1,
      screenHistory: [],
      language: 'English',
      isNewPatient: null,
      abhaProfile: null,
      patientCase: createInitialCase(),
    });
  },
}));
