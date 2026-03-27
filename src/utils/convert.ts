import { invoke } from "@tauri-apps/api/core";

export interface ConvertResponse {
  success: boolean;
  file_path: string | null;
  error: string | null;
}

export interface SaveFileResponse {
  success: boolean;
  saved_path: string | null;
  error: string | null;
}

export async function convertToDocx(
  markdown: string,
  onProgress?: (progress: number, status: string) => void
): Promise<ConvertResponse> {
  try {
    onProgress?.(10, "正在准备转换...");
    console.log("[convert] Starting conversion with markdown length:", markdown.length);

    // Call the Tauri command
    onProgress?.(30, "正在调用 Pandoc 转换...");
    console.log("[convert] Invoking convert_markdown_to_docx command");

    const result = await invoke<ConvertResponse>("convert_markdown_to_docx", {
      request: {
        markdown,
        output_path: null,
      },
    });

    console.log("[convert] Raw result:", result);
    onProgress?.(100, "转换完成！");

    return result;
  } catch (error) {
    console.error("[convert] Error during conversion:", error);
    return {
      success: false,
      file_path: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function saveFileToPath(
  sourcePath: string,
  destinationPath: string
): Promise<SaveFileResponse> {
  try {
    console.log("[save] Copying file from", sourcePath, "to", destinationPath);

    const result = await invoke<SaveFileResponse>("save_file_to_location", {
      request: {
        source_path: sourcePath,
        destination_path: destinationPath,
      },
    });

    console.log("[save] Save result:", result);
    return result;
  } catch (error) {
    console.error("[save] Error saving file:", error);
    return {
      success: false,
      saved_path: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
