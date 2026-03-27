import { useState } from "react";
import Editor from "./components/Editor";
import ProgressBar from "./components/ProgressBar";
import { convertToDocx, saveFileToPath } from "./utils/convert";
import { save } from "@tauri-apps/plugin-dialog";
import "./App.css";

function App() {
  const [markdown, setMarkdown] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<{ path: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!markdown.trim()) {
      setError("请先输入 Markdown 内容");
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setStatus("正在准备转换...");
    setError(null);
    setResult(null);

    console.log("[App] Starting conversion");

    try {
      const response = await convertToDocx(markdown, (p, s) => {
        setProgress(p);
        setStatus(s);
      });

      console.log("[App] Conversion response:", response);

      if (response.success && response.file_path) {
        setResult({ path: response.file_path });
        setStatus(`转换成功！文件路径：${response.file_path}`);
      } else {
        setError(response.error || "转换失败");
      }
    } catch (err) {
      console.error("[App] Conversion error:", err);
      setError(err instanceof Error ? err.message : "转换失败");
    } finally {
      setIsConverting(false);
    }
  };

  const handleSave = async () => {
    if (!result?.path) return;

    try {
      const savePath = await save({
        defaultPath: "document.docx",
        filters: [
          {
            name: "Word Document",
            extensions: ["docx"],
          },
        ],
      });

      if (savePath) {
        setStatus("正在保存文件...");
        const saveResult = await saveFileToPath(result.path, savePath);

        if (saveResult.success) {
          setStatus(`文件已保存到：${saveResult.saved_path}`);
        } else {
          setError(saveResult.error || "保存失败");
        }
      }
    } catch (err) {
      console.error("[App] Save error:", err);
      setError(err instanceof Error ? err.message : "保存失败");
    }
  };

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>MD2Docx</h1>
        <p className="app-subtitle">Markdown 转 Word (OMML) 转换器</p>
      </header>

      <div className="app-content">
        <Editor value={markdown} onChange={setMarkdown} />

        <div className="action-buttons">
          <button
            className="convert-button"
            onClick={handleConvert}
            disabled={isConverting || !markdown.trim()}
          >
            {isConverting ? "转换中..." : "转换为 Word"}
          </button>

          {result && (
            <button className="save-button" onClick={handleSave}>
              保存文件...
            </button>
          )}
        </div>

        {isConverting && <ProgressBar progress={progress} status={status} />}

        {error && <div className="error-message">{error}</div>}

        {result && !error && (
          <div className="success-message">
            <p>转换成功！文件路径：{result.path}</p>
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p>支持 LaTeX 公式：行内 $a^2+b^2=c^2$ 和 块级公式</p>
      </footer>
    </main>
  );
}

export default App;
