"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DocumentEmptyState } from "@/components/documents/DocumentEmptyState";
import { DocumentFilters } from "@/components/documents/DocumentFilters";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentLoading } from "@/components/documents/DocumentLoading";
import { DocumentStats } from "@/components/documents/DocumentStats";
import { useDocuments } from "@/hooks/use-documents";

export default function DocumentsPage() {
  const {
    documents,
    allDocuments,
    isLoading,
    error,
    search,
    setSearch,
    status,
    setStatus,
  } = useDocuments();

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <DocumentLoading />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load documents
          </h2>

          <p className="mt-2 text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">

      <div>
        <Link
          href="/dashboard"
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-gray-900
            shadow-sm
            transition
            hover:bg-gray-50
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Documents
            </h1>

            <p className="mt-2 text-gray-500">
              Manage, review and search all uploaded documents.
            </p>
          </div>

          <Link
            href="/upload"
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              bg-gray-900
              px-6
              py-3
              font-medium
              text-white
              transition
              hover:bg-black
            "
          >
            Upload Document
          </Link>

        </div>
      </div>

      <DocumentStats
        documents={allDocuments}
      />

      <DocumentFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
      />

      {documents.length === 0 ? (
        <DocumentEmptyState />
      ) : (
        <DocumentList
          documents={documents}
        />
      )}

    </main>
  );
}