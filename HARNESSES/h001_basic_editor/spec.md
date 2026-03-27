# H-001: Basic Editor

## Goal

Build a Markdown editor with live preview toggle using marked + KaTeX.

## Acceptance Criteria

- [x] Editor component with Edit/Preview toggle
- [x] Markdown rendered correctly (headings, bold, lists, code)
- [x] Blockquotes (`>`) rendered correctly (not `&gt;`)
- [x] Empty content handled gracefully
- [x] No crashes on paste

## Test Cases

Located in `e2e/editor.spec.ts`:

```typescript
test('should render app without crashing')
test('should display editor with edit and preview buttons')
test('should handle markdown input in edit mode')
test('should render markdown preview with KaTeX')
test('should not crash on paste with special characters')
test('should handle empty content gracefully')
test('should render blockquote and LaTeX arrows correctly')
```

## Implementation

### Files Modified

- `src/components/Editor.tsx` - Main editor component
- `src/components/Editor.css` - Styles
- `src/App.tsx` - App integration

### Key Code

```typescript
// Editor.tsx - Protected LaTeX parsing
const latexBlocks: string[] = [];
let protectedText = value;

// Extract LaTeX with null-char placeholders
protectedText = protectedText.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
  const index = latexBlocks.length;
  latexBlocks.push({ type: 'display', content: math.trim() });
  return `\u0000LATEX_BLOCK_${index}\u0000`;
});

// Parse markdown, then restore LaTeX
const rawHtml = marked.parse(protectedText) as string;
```

## Status

✅ **Complete** (2026-03-27)

- 7/7 E2E tests passing
- Lint checks passing

## Change Log

- `983bba0` - Initial commit with basic editor
- Earlier commits - LaTeX fix, blockquote fix

## Next Steps

See: [H-003: File Save Dialog](../h003_file_save/spec.md)
