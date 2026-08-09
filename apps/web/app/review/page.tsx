"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { reviewService } from "@/services/review.service";

import type {
  DocumentAnalysisDetail,
  ReviewResponse,
} from "@/types/review";

import { ReviewHeader } from "@/components/review/ReviewHeader";
import { ReviewFieldList } from "@/components/review/ReviewFieldList";
import { ReviewActions } from "@/components/review/ReviewActions";

export default function ReviewPage() {
  const [documentId, setDocumentId] =
    useState<string | null>(null);

  const [documentName, setDocumentName] =
    useState("Document");

  const [analysis, setAnalysis] =
    useState<DocumentAnalysisDetail | null>(
      null
    );

  const [review, setReview] =
    useState<ReviewResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const id = params.get("documentId");

    const name =
      params.get("documentName");

    if (id) {
      setDocumentId(id);
    }

    if (name) {
      setDocumentName(name);
    }

    if (!id) {
      setLoading(false);
      setError(
        "No document was selected for review."
      );
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [
          analysisData,
          reviewData,
        ] = await Promise.all([
          reviewService.getAnalysis(id!),
          reviewService.getReview(id!),
        ]);

        setAnalysis(analysisData);
        setReview(reviewData);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load the document review."
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  async function handleSaveField(
    fieldId: string,
    value: string
  ) {
    await reviewService.updateField(
      fieldId,
      value
    );

    if (!analysis) {
      return;
    }

    setAnalysis({
      ...analysis,
      fields: analysis.fields.map(
        (field) =>
          field.id === fieldId
            ? {
                ...field,
                value,
              }
            : field
      ),
    });
  }

  async function handleApprove(
    comments: string
  ) {
    if (!documentId) {
      return;
    }

    const updated =
      await reviewService.approve(
        documentId,
        comments
      );

    setReview(updated);
  }

  async function handleReject(
    comments: string
  ) {
    if (!documentId) {
      return;
    }

    const updated =
      await reviewService.reject(
        documentId,
        comments
      );

    setReview(updated);
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto flex max-w-4xl items-center justify-center py-24">
          <LoaderCircle className="mr-3 h-6 w-6 animate-spin" />
          <span>Loading review...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-2xl border p-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />

            <h1 className="text-xl font-semibold">
              Review unavailable
            </h1>
          </div>

          <p className="mt-3 text-muted-foreground">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!analysis) {
    return null;
  }

  const reviewCompleted =
    review?.status === "APPROVED" ||
    review?.status === "REJECTED";

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <ReviewHeader
          documentName={documentName}
        />

        <section className="mt-8 rounded-2xl border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Extracted Fields
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Verify and correct the extracted
              information before making a review
              decision.
            </p>
          </div>

          <ReviewFieldList
            fields={analysis.fields}
            onSave={handleSaveField}
          />
        </section>

        {reviewCompleted ? (
          <section className="mt-8 rounded-2xl border p-6">
            <p className="font-semibold">
              Review{" "}
              {review.status === "APPROVED"
                ? "Approved"
                : "Rejected"}
            </p>

            {review.reviewerComments && (
              <p className="mt-2 text-sm text-muted-foreground">
                {review.reviewerComments}
              </p>
            )}
          </section>
        ) : (
          <div className="mt-8">
            <ReviewActions
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        )}
      </div>
    </main>
  );
}