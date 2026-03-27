# H-002: LaTeX Support

## Goal

Render LaTeX formulas in Markdown preview using KaTeX, supporting both inline `$...$` and display `$$...$$` math.

## Acceptance Criteria

- [x] Inline math `$a^2 + b^2 = c^2$` renders correctly
- [x] Display math `$$\frac{-b \pm \sqrt{b^2-4ac}}{2a}$$` renders correctly
- [x] LaTeX arrows (`\Rightarrow`, `\leftarrow`, etc.) work
- [x] Complex formulas with integrals, fractions work
- [x] No interference with Markdown syntax

## Test Cases

Located in `e2e/editor.spec.ts`:

```typescript
test('should render markdown preview with KaTeX', async ({ page }) => {
  await textarea.fill('# Test Document\n\nInline: $a^2 + b^2 = c^2$\n\n$$\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$');
  await page.getByRole('button', { name: '预览' }).click();
  await expect(page.locator('.katex').first()).toBeVisible();
});

test('should render blockquote and LaTeX arrows correctly', async ({ page }) => {
  await textarea.fill('> This is a blockquote\n\n$$A \\Rightarrow B$$');
  await page.getByRole('button', { name: '预览' }).click();
  await expect(blockquote).toBeVisible();
  await expect(page.locator('.katex-display').first()).toBeVisible();
});
```

## Implementation

### Files Modified

- `src/components/Editor.tsx` - LaTeX extraction and KaTeX rendering

### Key Dependencies

- `marked` - Markdown parser
- `katex` - LaTeX renderer

### Algorithm

```
1. Extract $$...$$ blocks → store in array, replace with \u0000LATEX_BLOCK_N\u0000
2. Extract $...$ inline → store in array, replace with \u0000LATEX_INLINE_N\u0000
3. Parse protected text with marked
4. Restore placeholders and render with KaTeX
```

### Why Null Characters?

Previous attempts with `__LATEX_X__` failed because:
- Underscores triggered Markdown italic/bold parsing
- `>` in content was escaped to `&gt;`

Null characters (`\u0000`) are invisible to Markdown parsers.

## Status

✅ **Complete** (2026-03-27)

- All LaTeX E2E tests passing
- Blockquote rendering fixed

## Known Issues

None currently.

## References

- [KaTeX Docs](https://katex.org/docs/node.html)
- [marked Docs](https://marked.js.org/)
