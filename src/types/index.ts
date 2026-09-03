export interface PatientCase {
  patientId: string;
  encounterId: string;
  chiefComplaint: {
    symptom: string;
    duration?: string;
    severity?: number;
  }[];
  history: {
    onset?: string;
    character?: string;
    location?: string;
    radiation?: string;
    aggravatingFactors?: string;
    relievingFactors?: string;
  };
  medications: Medication[];
  allergies: string[];
  pastHistory: string[];
  familyHistory: string[];
  personalHistory: string[];
  investigations: Investigation[];
  procedures: Procedure[];
  documents: MedicalDocument[];
  timeline: TimelineEvent[];
  alerts: Alert[];
  missingInformation: string[];
  contradictions: Contradiction[];
}

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
}

export interface Investigation {
  name: string;
  date?: string;
  result?: string;
}

export interface Procedure {
  name: string;
  date?: string;
}

export interface MedicalDocument {
  id: string;
  type: string;
  extractedData: Record<string, unknown>;
}

export interface TimelineEvent {
  date: string;
  event: string;
}

export interface Alert {
  type: 'warning' | 'info' | 'critical';
  message: string;
}

export interface Contradiction {
  issue: string;
  details: string;
}
