export type AnalyzeMode = "upload" | "text" | "url";

export interface AnalyzeRequest {
  type: AnalyzeMode;
  file?: File | null;
  text?: string;
  url?: string;
}

export interface AnalyzeField {
  name: string;
  value: string;
  confidence: number | null;
}

export interface AnalyzeResponse {
  summary: string;
  keyPoints: string[];
  risks: string[];
  recommendations: string[];

  documentId?: string;
  fileName?: string;
  documentType?: string | null;
  status?: string | null;
  fields?: AnalyzeField[];
}