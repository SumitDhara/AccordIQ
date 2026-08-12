"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSearch,
  Lightbulb,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { exportService } from "@/services/export.service";

import type { AnalyzeResponse } from "@/types/analyze";

interface AnalysisResultProps {
  result: AnalyzeResponse | null;
}

export default function AnalysisResult({
  result,
}: AnalysisResultProps) {
  if (!result) {
    return null;
  }

  const canExport =
    Boolean(result.documentId) &&
    Boolean(result.fields);

  const exportDocument = canExport
    ? {
        id: result.documentId!,
        fileName:
          result.fileName ?? "accordiq-document",
        documentType:
          result.documentType ?? null,
        summary: result.summary,
        status: result.status ?? null,
        fields: result.fields!.map((field) => ({
          name: field.name,
          value: field.value,
          confidence: field.confidence,
        })),
      }
    : null;

  return (
    <div className="space-y-6">
      {canExport && exportDocument && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="font-semibold">
                Document actions
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Export the analysis for your records.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  exportService.downloadJson(
                    exportDocument
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  exportService.downloadCsv(
                    exportDocument
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileSearch className="h-5 w-5 text-primary" />
            Summary
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="leading-8 text-muted-foreground">
            {result.summary}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Key Points
          </CardTitle>
        </CardHeader>

        <CardContent>
          {result.keyPoints.length > 0 ? (
            <ul className="space-y-3">
              {result.keyPoints.map(
                (point, index) => (
                  <li
                    key={index}
                    className="flex gap-3"
                  >
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-green-600" />
                    <span>{point}</span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              No key points identified.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Risks
          </CardTitle>
        </CardHeader>

        <CardContent>
          {result.risks.length > 0 ? (
            <ul className="space-y-3">
              {result.risks.map(
                (risk, index) => (
                  <li
                    key={index}
                    className="flex gap-3"
                  >
                    <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                    <span>{risk}</span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              No risks detected.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            Recommendations
          </CardTitle>
        </CardHeader>

        <CardContent>
          {result.recommendations.length > 0 ? (
            <ul className="space-y-3">
              {result.recommendations.map(
                (item, index) => (
                  <li
                    key={index}
                    className="flex gap-3"
                  >
                    <Lightbulb className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              No recommendations available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}