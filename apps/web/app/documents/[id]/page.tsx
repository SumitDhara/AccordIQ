"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Trash2,
} from "lucide-react";

import { documentApi } from "@/lib/api/documents";
import { reviewService } from "@/services/review.service";

import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";
import { ExportMenu } from "@/components/export/ExportMenu";

import type { DocumentResponse } from "@/types/document";
import type {
  DocumentAnalysisDetail,
} from "@/types/review";
import type { ExportDocument } from "@/types/export";

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
}

function getFileExtension(contentType: string) {
  const mimeTypes: Record<string, string> = {
    "application/pdf": "PDF",
    "image/png": "PNG",
    "image/jpeg": "JPG",
    "image/jpg": "JPG",
    "image/webp": "WEBP",
  };

  return mimeTypes[contentType] ?? "FILE";
}

function buildExportDocument(
  document: DocumentResponse,
  analysis: DocumentAnalysisDetail | null
): ExportDocument {
  return {
    id: document.id,
    fileName: document.originalFileName,
    documentType:
      analysis?.documentType ??
      getFileExtension(document.contentType),
    summary: analysis?.summary ?? null,
    status: document.status,
    fields:
      analysis?.fields.map((field) => ({
        name: field.name,
        value: field.value,
        confidence: field.confidence,
      })) ?? [],
  };
}

export default function DocumentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [document, setDocument] =
    useState<DocumentResponse | null>(null);

  const [analysis, setAnalysis] =
    useState<DocumentAnalysisDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const documentResponse =
          await documentApi.getById(id);

        setDocument(documentResponse.data);

        try {
          const analysisResponse =
            await reviewService.getAnalysis(id);

          setAnalysis(analysisResponse);
        } catch (analysisError) {
          console.warn(
            "No document analysis available:",
            analysisError
          );

          setAnalysis(null);
        }
      } catch (loadError) {
        console.error(
          "Failed to load document:",
          loadError
        );

        setError(
          "Failed to load document."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      void load();
    }
  }, [id]);

  async function handleDelete() {
    if (!document || deleting) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${document.originalFileName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await documentApi.delete(
        document.id
      );

      router.push("/documents");
    } catch (deleteError) {
      console.error(
        "Failed to delete document:",
        deleteError
      );

      window.alert(
        "Failed to delete document."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="h-10 w-2/3 rounded bg-gray-200" />
            <div className="h-64 rounded-2xl bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !document) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              {error || "Document not found."}
            </h1>

            <Link
              href="/documents"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Documents
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const exportDocument =
    buildExportDocument(
      document,
      analysis
    );

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Link>

        {/* Document header */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <FileText className="h-6 w-6 text-gray-700" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Document
                </p>

                <h1 className="mt-1 break-all text-2xl font-bold tracking-tight text-gray-900">
                  {document.originalFileName}
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  {getFileExtension(
                    document.contentType
                  )}{" "}
                  ·{" "}
                  {formatFileSize(
                    document.fileSize
                  )}
                </p>
              </div>
            </div>

            <DocumentStatusBadge
              status={document.status}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-6">
            <ExportMenu
              document={exportDocument}
            />

            <button
              type="button"
              disabled={deleting}
              onClick={() =>
                void handleDelete()
              }
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />

              {deleting
                ? "Deleting..."
                : "Delete Document"}
            </button>
          </div>
        </section>

        {/* Analysis */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Analysis
          </h2>

          {!analysis ? (
            <div className="mt-4 rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                No analysis is available for this
                document yet.
              </p>

              <Link
                href="/analyze"
                className="mt-4 inline-flex rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Analyze Document
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              {/* Summary */}
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Summary
                </p>

                <p className="mt-2 leading-7 text-gray-700">
                  {analysis.summary ||
                    "No summary available."}
                </p>
              </div>

              {/* Document type */}
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Document Type
                </p>

                <p className="mt-2 font-semibold text-gray-900">
                  {analysis.documentType ||
                    "Unknown"}
                </p>
              </div>

              {/* Overall confidence */}
              {analysis.confidence != null && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Overall Confidence
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {analysis.confidence}%
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}