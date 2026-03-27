import { describe, it, expect, beforeEach, vi } from "vitest";
import { convertToDocx } from "../src/utils/convert";

// Mock @tauri-apps/api/core
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("Convert Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call convert_markdown_to_docx with correct parameters", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    vi.mocked(invoke).mockResolvedValue({
      success: true,
      file_path: "/tmp/test.docx",
      error: null,
    });

    const markdown = "# Hello World\n\nThis is a test.";
    const result = await convertToDocx(markdown);

    expect(invoke).toHaveBeenCalledWith("convert_markdown_to_docx", {
      request: {
        markdown,
        output_path: null,
      },
    });
    expect(result.success).toBe(true);
    expect(result.file_path).toBe("/tmp/test.docx");
  });

  it("should handle conversion error", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    vi.mocked(invoke).mockResolvedValue({
      success: false,
      file_path: null,
      error: "Pandoc not found",
    });

    const result = await convertToDocx("# Test");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Pandoc not found");
  });

  it("should call progress callback during conversion", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    vi.mocked(invoke).mockResolvedValue({
      success: true,
      file_path: "/tmp/test.docx",
      error: null,
    });

    const progressCallback = vi.fn();
    await convertToDocx("# Test", progressCallback);

    expect(progressCallback).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(String)
    );
  });
});

describe("Markdown Test Cases", () => {
  it("should handle inline LaTeX formulas", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    vi.mocked(invoke).mockResolvedValue({
      success: true,
      file_path: "/tmp/test.docx",
      error: null,
    });

    const markdown = "This is an inline formula: $a^2+b^2=c^2$";
    const result = await convertToDocx(markdown);

    expect(result.success).toBe(true);
  });

  it("should handle block LaTeX formulas", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    vi.mocked(invoke).mockResolvedValue({
      success: true,
      file_path: "/tmp/test.docx",
      error: null,
    });

    const markdown = `
This is a block formula:

$$
\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}
$$
`;
    const result = await convertToDocx(markdown);

    expect(result.success).toBe(true);
  });

  it("should handle complex markdown with tables and code", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    vi.mocked(invoke).mockResolvedValue({
      success: true,
      file_path: "/tmp/test.docx",
      error: null,
    });

    const markdown = `
# Test Document

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |

\`\`\`javascript
const x = 10;
\`\`\`

Formula: $E=mc^2$
`;
    const result = await convertToDocx(markdown);

    expect(result.success).toBe(true);
  });
});
