"use client";

import {
  ChangeEvent,
  DragEvent,
  useState,
} from "react";
import {
  FileText,
  Upload,
  Loader2,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";

import { ocrApi } from "@/lib/api/ocr";

const MAX_FILE_SIZE =
  25 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
];

export default function OCRPage() {
  const [file, setFile] =
    useState<File | null>(null);

  const [result, setResult] =
    useState<{
      extractedText: string;
      confidence: number;
      processingTimeMillis: number;
    } | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [dragging, setDragging] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  function validateFile(
    selectedFile: File
  ) {
    if (
      !ALLOWED_TYPES.includes(
        selectedFile.type
      )
    ) {
      return "Only PDF, PNG and JPG files are supported.";
    }

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      return "File size must not exceed 25 MB.";
    }

    return null;
  }

  function selectFile(
    selectedFile: File
  ) {
    const validationError =
      validateFile(selectedFile);

    if (validationError) {
      setFile(null);
      setError(validationError);
      setResult(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
    setCopied(false);
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0];

    if (selectedFile) {
      selectFile(selectedFile);
    }
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setDragging(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    if (droppedFile) {
      selectFile(droppedFile);
    }
  }

  async function handleExtract() {
    if (!file) {
      setError(
        "Please select a file first."
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const ocrResult =
        await ocrApi.extractText(file);

      setResult(ocrResult);
    } catch (requestError: unknown) {
      console.error(
        "OCR request failed:",
        requestError
      );

      const message =
        (
          requestError as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        )?.response?.data?.message;

      setError(
        message ??
          "OCR processing failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyText() {
    if (!result?.extractedText) {
      return;
    }

    await navigator.clipboard.writeText(
      result.extractedText
    );

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setCopied(false);
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="text-sm font-medium text-gray-500">
            Document Intelligence
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
            OCR
          </h1>

          <p className="mt-3 max-w-2xl text-gray-500">
            Extract text from PDFs and images
            using AccordIQ's OCR pipeline.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          {/* Upload */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Upload Document
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              PDF, PNG or JPG · Maximum 25 MB
            </p>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() =>
                setDragging(false)
              }
              onDrop={handleDrop}
              className={`mt-6 rounded-2xl border-2 border-dashed p-8 text-center transition ${
                dragging
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200"
              }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Upload className="h-6 w-6 text-gray-700" />
              </div>

              <p className="mt-4 text-sm font-medium text-gray-900">
                Drag and drop your file here
              </p>

              <p className="mt-1 text-xs text-gray-500">
                or choose a file from your device
              </p>

              <label className="mt-5 inline-flex cursor-pointer rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
                Choose File

                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {file && (
              <div className="mt-5 rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {(
                        file.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={
                  !file || loading
                }
                onClick={() =>
                  void handleExtract()
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  "Extract Text"
                )}
              </button>

              <button
                type="button"
                onClick={reset}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Result */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Extracted Text
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  OCR output from your document
                </p>
              </div>

              {result && (
                <button
                  type="button"
                  onClick={() =>
                    void copyText()
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>

            {result ? (
              <>
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 p-6 sm:grid-cols-3">
                  <Metric
                    label="Processing"
                    value={`${result.processingTimeMillis} ms`}
                  />

                  <Metric
                    label="Characters"
                    value={result.extractedText.length.toLocaleString()}
                  />

                  <Metric
                    label="Confidence"
                    value={
                      result.confidence < 0
                        ? "N/A"
                        : `${result.confidence}%`
                    }
                  />
                </div>

                <div className="max-h-[600px] overflow-auto p-6">
                  {result.extractedText.trim() ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-gray-700">
                      {result.extractedText}
                    </pre>
                  ) : (
                    <div className="py-16 text-center">
                      <p className="text-sm text-gray-500">
                        No text was detected in
                        this document.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex min-h-[500px] items-center justify-center p-8 text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                    <FileText className="h-6 w-6 text-gray-500" />
                  </div>

                  <h3 className="mt-4 font-semibold text-gray-900">
                    No OCR result yet
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                    Upload a document and select
                    Extract Text to run the OCR
                    pipeline.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}