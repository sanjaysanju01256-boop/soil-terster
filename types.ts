// types.ts

export type Language = 'en' | 'te';

// Data contract from ESP32
export interface SensorData {
  ts: number; // timestamp from device
  ph: number;
  moisture: number;
  temperature: number;
  battery: number;
}

export interface AiAnalysisResult {
    soilHealth: 'Healthy' | 'Needs Improvement' | 'Poor';
    cropSuggestions: string;
    fertilizerAdvice: string;
    irrigationSuggestion: string;
}

export interface HistoryEntry {
  id: string;
  farmId: string; // Link to the specific farm this test belongs to
  timestamp: number; // App-side timestamp
  location: { lat: number; lon: number } | null;
  values: SensorData;
  aiResult: AiAnalysisResult;
}

export interface FarmerProfile {
  id: string;
  name: string;
  phone?: string;
  village?: string;
  district?: string;
  state?: string;
  language: Language;
  photo?: string; // base64 encoded image
}

export type LandUnit = 'acres' | 'guntas' | 'hectares';
export type SoilType = 'Sandy' | 'Loamy' | 'Black' | 'Red' | 'Clay' | 'Other';

export interface FarmProfile {
  id: string;
  name: string;
  location: { lat: number; lon: number } | string | null; // GPS, manual address, or null
  size: { value: number; unit: LandUnit };
  soilType?: SoilType;
  currentCrop?: string;
}

export interface AppSettings {
    isTtsEnabled: boolean;
}

export interface NPKData {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
}
