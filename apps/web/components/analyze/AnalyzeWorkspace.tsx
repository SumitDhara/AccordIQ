"use client";

import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

import useAnalyze from "@/hooks/useAnalyze";

import AnalyzeTabs from "./AnalyzeTabs";
import UploadPanel from "./UploadPanel";
import TextPanel from "./TextPanel";
import AnalyzeButton from "./AnalyzeButton";
import AnalysisResult from "./AnalysisResult";

export default function AnalyzeWorkspace() {
  const analyze = useAnalyze();

  return (
    <Section className="pb-24">
      <Container className="max-w-6xl">

        {/* Hero */}

        <div className="mx-auto mb-16 max-w-3xl text-center">

          <Badge
            variant="secondary"
            className="mb-6 px-4 py-1.5"
          >
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            AI Powered Document Intelligence
          </Badge>

          <h1 className="text-gradient text-5xl font-bold tracking-tight lg:text-6xl">
            Understand Any Document.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Upload a document or paste text to extract summaries,
            insights and structured information using OCR and intelligent extraction.
          </p>

        </div>

        {/* Workspace */}

        <Card className="overflow-hidden">

          <CardContent className="p-8">

            <AnalyzeTabs
              mode={analyze.mode}
              setMode={analyze.setMode}
            />

            <div className="mt-8">

              {analyze.mode === "upload" && (
                <UploadPanel
                  file={analyze.file}
                  setFile={analyze.setFile}
                />
              )}

              {analyze.mode === "text" && (
                <TextPanel
                  text={analyze.text}
                  setText={analyze.setText}
                />
              )}

            </div>

            <div className="mt-10 flex justify-center">

              <AnalyzeButton
                analyze={analyze}
              />

            </div>

          </CardContent>

        </Card>

        <div className="mt-12">

          <AnalysisResult
            result={analyze.result}
          />

        </div>

      </Container>
    </Section>
  );
}