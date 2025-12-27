
export interface ExtractedData {
  text: string;
  images: string[]; // base64 strings
}

export interface ProcessingOptions {
  extractImages: boolean;
  includeImageAnalysis: boolean;
  model: string;
  systemPrompt: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  EXTRACTING = 'EXTRACTING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface QTIResult {
  xml: string;
  timestamp: string;
  fileName: string;
  questions?: QuestionJSON[];
}

export interface QuestionJSON {
  category: string;
  question: string;
  correct_answer: string;
  images: string[];
}
