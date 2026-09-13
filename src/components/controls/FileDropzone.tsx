"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileWarning } from "lucide-react";

interface FileDropzoneProps {
  onFile: (file: File) => void;
  parsing: boolean;
  routeName?: string;
}

export default function FileDropzone({
  onFile,
  parsing,
  routeName,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".gpx")) {
        setLocalError("Only .gpx files are supported in V1.");
        return;
      }
      setLocalError(null);
      onFile(file);
    },
    [onFile]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        dragOver
          ? "border-emerald-500 bg-emerald-500/10"
          : "border-cs-border bg-cs-card/50 hover:border-cs-muted"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".gpx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {parsing ? (
        <div className="flex flex-col items-center gap-2 text-cs-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cs-border border-t-emerald-500" />
          <p className="text-sm">Parsing GPX…</p>
        </div>
      ) : routeName ? (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-emerald-500" />
          <p className="font-medium text-cs-text">{routeName}</p>
          <p className="text-xs text-cs-subtle">Click or drop to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-cs-muted" />
          <p className="font-medium text-cs-text">Drop your GPX file here</p>
          <p className="text-xs text-cs-subtle">or click to browse (.gpx only)</p>
        </div>
      )}
      <div className="mt-3 flex items-center justify-center gap-1 text-xs text-cs-subtle">
        <FileWarning className="h-3 w-3" />
        <span>FIT support coming soon</span>
      </div>
      {localError && (
        <p className="mt-2 text-xs text-red-400">{localError}</p>
      )}
    </div>
  );
}
