import type {
  DocumentAnalysisDetail,
  ReviewResponse,
} from "@/types/review";

import type {
  DocumentResponse,
} from "@/types/document";

import apiClient from "@/lib/api/client";

export const reviewService = {
  async getAnalysis(
    documentId: string
  ): Promise<DocumentAnalysisDetail> {
    const response = await apiClient.get(
      `/document-analyses/${documentId}`
    );

    return response.data.data as DocumentAnalysisDetail;
  },

  async getDocument(
    documentId: string
  ): Promise<DocumentResponse> {
    const response = await apiClient.get(
      `/documents/${documentId}`
    );

    return response.data.data as DocumentResponse;
  },

  async getReview(
    documentId: string
  ): Promise<ReviewResponse | null> {
    try {
      const response = await apiClient.get(
        `/reviews/${documentId}`
      );

      return (
        response.data.data as ReviewResponse | null
      );
    } catch (error: unknown) {
      const status =
        (
          error as {
            response?: {
              status?: number;
            };
          }
        )?.response?.status;

      if (status === 404) {
        return null;
      }

      throw error;
    }
  },

  async updateField(
    fieldId: string,
    value: string
  ) {
    const response = await apiClient.patch(
      `/document-fields/${fieldId}`,
      {
        value,
      }
    );

    return response.data.data;
  },

  async approve(
    documentId: string,
    comments: string
  ): Promise<ReviewResponse> {
    const response = await apiClient.post(
      `/reviews/${documentId}/approve`,
      {
        comments,
      }
    );

    return response.data.data as ReviewResponse;
  },

  async reject(
    documentId: string,
    comments: string
  ): Promise<ReviewResponse> {
    const response = await apiClient.post(
      `/reviews/${documentId}/reject`,
      {
        comments,
      }
    );

    return response.data.data as ReviewResponse;
  },
};