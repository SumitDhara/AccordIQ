import apiClient from "./client";

import type { ApiResponse } from "@/types/api";

import type {
  DocumentResponse,
  UploadDocumentResponse,
} from "@/types/document";

export const documentApi = {
  async upload(file: File) {
    const formData = new FormData();

    formData.append("file", file);

    const response =
      await apiClient.post<ApiResponse<UploadDocumentResponse>>(
        "/documents/upload",
        formData
      );

    return response.data;
  },

  async getAll() {
    const response =
      await apiClient.get<ApiResponse<DocumentResponse[]>>(
        "/documents"
      );

    return response.data;
  },

  async getById(id: string) {
    const response =
      await apiClient.get<ApiResponse<DocumentResponse>>(
        `/documents/${id}`
      );

    return response.data;
  },

  async delete(id: string) {
    const response =
      await apiClient.delete<ApiResponse<null>>(
        `/documents/${id}`
      );

    return response.data;
  },
};