import axios from "axios";

import type {
  AnalyzeRequest,
  AnalyzeResponse,
} from "@/types/analyze";

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080/api/v1";

interface UploadAnalysisResponse {
  upload: {
    id: string;
    originalFileName: string;
    storedFileName: string;
    contentType: string;
    fileSize: number;
    status: string;
  };

  analysis: {
    summary: string;
    documentType: string;
    fields: {
      name: string;
      value: string;
      confidence: number;
    }[];
  };
}

class AnalyzeService {
  async analyze(
    request: AnalyzeRequest
  ): Promise<AnalyzeResponse> {
    switch (request.type) {
      case "text": {
        const response = await axios.post(
          `${API}/analyze/text`,
          {
            text: request.text,
          }
        );

        return response.data.data;
      }

      case "upload": {
        if (!request.file) {
          throw new Error("Please choose a file.");
        }

        const formData = new FormData();

        formData.append("file", request.file);

        const response = await axios.post(
          `${API}/documents/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const data: UploadAnalysisResponse =
          response.data.data;

        return {
          summary: data.analysis.summary,

          keyPoints: data.analysis.fields.map(
            (field) =>
              `${field.name}: ${field.value}`
          ),

          risks: [],

          recommendations: [],

          documentId: data.upload.id,

          fileName: data.upload.originalFileName,

          documentType:
            data.analysis.documentType ?? null,

          status: data.upload.status,

          fields: data.analysis.fields.map(
            (field) => ({
              name: field.name,
              value: field.value,
              confidence:
                field.confidence ?? null,
            })
          ),
        };
      }

      case "url":
        throw new Error(
          "Website analysis is not implemented yet."
        );

      default:
        throw new Error(
          "Unsupported analysis mode."
        );
    }
  }
}

export default new AnalyzeService();