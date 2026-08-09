import apiClient from "@/lib/api/client";

export interface OCRResponse {
  extractedText: string;
  confidence: number;
  processingTimeMillis: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const ocrApi = {
  async extractText(file: File): Promise<OCRResponse> {
    const formData = new FormData();

    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<OCRResponse>>(
      "/ocr/extract",
      formData
    );

    return response.data.data;
  },
};