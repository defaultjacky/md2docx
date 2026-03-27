import { useState, useCallback } from "react";
import "./DropZone.css";

interface DropZoneProps {
  onFileLoaded: (content: string) => void;
}

export default function DropZone({ onFileLoaded }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type === "text/markdown" || file.name.endsWith(".md")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileLoaded(content);
        };
        reader.readAsText(file);
      }
    },
    [onFileLoaded]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div
      className={`dropzone ${isDragging ? "dragging" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="dropzone-content">
        <svg
          className="dropzone-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p>拖拽 Markdown 文件到此处，或</p>
        <label className="file-input-label">
          选择文件
          <input
            type="file"
            accept=".md,.markdown"
            onChange={onFileChange}
            className="file-input"
          />
        </label>
      </div>
    </div>
  );
}
