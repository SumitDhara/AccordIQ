"use client";

import { useMemo, useState } from "react";

import type {
  AnalyzeMode,
  AnalyzeResponse,
} from "@/types/analyze";

export default function useAnalyze() {
  const [mode, setMode] =
    useState<AnalyzeMode>("upload");

  const [file, setFile] =
    useState<File | null>(null);

  const [text, setText] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState<AnalyzeResponse | null>(null);

  const canAnalyze = useMemo(() => {
    switch (mode) {
      case "upload":
        return file !== null;

      case "text":
        return text.trim().length > 0;

      default:
        return false;
    }
  }, [mode, file, text]);

  function reset() {
    setFile(null);
    setText("");
    setLoading(false);
    setResult(null);
    setMode("upload");
  }

  return {
    mode,
    setMode,

    file,
    setFile,

    text,
    setText,

    loading,
    setLoading,

    result,
    setResult,

    canAnalyze,

    reset,
  };
}