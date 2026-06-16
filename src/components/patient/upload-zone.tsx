"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface UploadZoneProps {
  onAnalysisSuccess: (data: any) => void;
  onLogAudit: (
    fileName: string,
    status: "Success" | "Failed",
    errorMsg?: string,
  ) => void;
}

export function UploadZone({ onAnalysisSuccess, onLogAudit }: UploadZoneProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const processWithAI = async (payload: object, fileNameForLog: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        onAnalysisSuccess(result.data);
        onLogAudit(fileNameForLog, "Success");
      } else {
        throw new Error(result.error || "AI failed to extract data");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      onLogAudit(fileNameForLog, "Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Please upload an image file (PNG, JPG) or a PDF.");
      return;
    }
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      processWithAI(
        { fileBase64: reader.result as string, mimeType: file.type },
        file.name,
      );
    };
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full">
      <Card
        className={`border-2 border-dashed transition-all ${
          dragActive
            ? "border-blue-500 bg-blue-50/50"
            : "border-slate-200 bg-white"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files?.[0])
            handleFileUpload(e.dataTransfer.files[0]);
        }}
      >
        <CardContent className="flex flex-col items-center justify-center py-10 px-6 text-center cursor-pointer">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            }}
          />
          <label
            htmlFor="file-upload"
            className="w-full h-full flex flex-col items-center cursor-pointer"
          >
            <div className="p-4 bg-slate-50 text-slate-600 rounded-full mb-4">
              <UploadCloud size={32} />
            </div>
            <p className="font-medium text-slate-800 text-base">
              Drag & Drop Prescription Image
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Supports PNG, JPG, JPEG, or PDF
            </p>
          </label>
          {selectedFileName && (
            <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <FileText size={14} /> {selectedFileName}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-slate-200"></div>
        <span className="px-3 text-slate-400 text-xs uppercase font-semibold tracking-wider">
          Or Paste Text
        </span>
        <div className="flex-1 border-t border-slate-200"></div>
      </div>

      <div className="space-y-3">
        <textarea
          placeholder="Paste copied prescription text details or clinical summary notes here..."
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 transition"
        />
        <Button
          disabled={loading || !rawText.trim()}
          onClick={() =>
            processWithAI({ textData: rawText }, "Raw_Text_Input.txt")
          }
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            "Analyze Prescription via AI"
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl flex items-start gap-2.5 text-sm border border-rose-100">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}
    </div>
  );
}
