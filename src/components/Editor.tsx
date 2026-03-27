import { useState, ChangeEvent, useMemo } from "react";
import { marked } from "marked";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./Editor.css";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const [previewMode, setPreviewMode] = useState(false);

  // Parse markdown with marked and process LaTeX
  const html = useMemo(() => {
    if (!value) return "";

    // Step 1: Extract and protect LaTeX blocks (both $$ and $)
    const latexBlocks: string[] = [];
    let protectedText = value;

    // Extract display math $$...$$ first
    protectedText = protectedText.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
      const index = latexBlocks.length;
      latexBlocks.push({ type: 'display', content: math.trim() });
      // Use a placeholder that won't be interpreted by markdown
      return `\u0000LATEX_BLOCK_${index}\u0000`;
    });

    // Extract inline math $...$
    protectedText = protectedText.replace(/\$([^$\n]+?)\$/g, (match, math) => {
      const index = latexBlocks.length;
      latexBlocks.push({ type: 'inline', content: math.trim() });
      // Use a placeholder that won't be interpreted by markdown
      return `\u0000LATEX_INLINE_${index}\u0000`;
    });

    // Step 2: Parse protected markdown to HTML
    const rawHtml = marked.parse(protectedText) as string;

    // Step 3: Restore LaTeX and render with KaTeX
    let finalHtml = rawHtml;

    // Restore display math
    finalHtml = finalHtml.replace(/\u0000LATEX_BLOCK_(\d+)\u0000/g, (_, index) => {
      const math = latexBlocks[parseInt(index)].content;
      try {
        return katex.renderToString(math, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return `$$${math}$$`;
      }
    });

    // Restore inline math
    finalHtml = finalHtml.replace(/\u0000LATEX_INLINE_(\d+)\u0000/g, (_, index) => {
      const math = latexBlocks[parseInt(index)].content;
      try {
        return katex.renderToString(math, {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return `$${math}$`;
      }
    });

    return finalHtml;
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <button
          className={!previewMode ? "active" : ""}
          onClick={() => setPreviewMode(false)}
        >
          编辑
        </button>
        <button
          className={previewMode ? "active" : ""}
          onClick={() => setPreviewMode(true)}
        >
          预览
        </button>
      </div>
      <div className="editor-content">
        {previewMode ? (
          <div className="preview" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <textarea
            value={value}
            onChange={handleChange}
            placeholder="在此输入 Markdown 内容，支持 LaTeX 公式..."
          />
        )}
      </div>
    </div>
  );
}
