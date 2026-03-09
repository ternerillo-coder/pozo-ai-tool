

export enum View {
  DASHBOARD = 'DASHBOARD',
  CLINICAL_NOTES = 'CLINICAL_NOTES',
  RESEARCH = 'RESEARCH',
  CALCULATORS = 'CALCULATORS',
  DIAGNOSTICS = 'DIAGNOSTICS',
  TEACHING = 'TEACHING',
  VISUAL_STUDIO = 'VISUAL_STUDIO',
  AI_CENTER = 'AI_CENTER',
  LIVE_CONSULT = 'LIVE_CONSULT',
  SCHEDULER = 'SCHEDULER',
  SETTINGS = 'SETTINGS'
}

export interface ResearchTool {
  name: string;
  description: string;
  url: string;
  category: 'Search' | 'Analysis' | 'Clinical' | 'Creation' | 'Video' | 'Education' | 'Automation' | 'Research' | 'Patient';
  isFree: boolean;
  pros: string[];
  cons: string[];
  useCases: string[];
  tutorialUrl: string;
}

export interface Calculator {
  id: string;
  name: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  image?: string; // Base64
}

export interface GroundingSource {
  title: string;
  uri: string;
  placeAnswerSources?: any; 
}

export enum CalculatorType {
  IPSS = 'IPSS',
  RENAL = 'RENAL',
  PADUA = 'PADUA',
  CHARLSON = 'CHARLSON',
  ASA = 'ASA',
  STONE = 'STONE',
  IIEF = 'IIEF',
  VOLUME = 'VOLUME',
  BRIGANTI = 'BRIGANTI',
  MSKCC = 'MSKCC',
  EORTC = 'EORTC'
}

export interface UserProfile {
  name: string;
  email: string;
  specialty: string;
  avatar?: string;
}