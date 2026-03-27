import { test, expect } from '@playwright/test';

test.describe('MD2Docx Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render app without crashing', async ({ page }) => {
    // Check app title is visible
    await expect(page.getByText('MD2Docx')).toBeVisible();
    await expect(page.getByText('Markdown 转 Word (OMML) 转换器')).toBeVisible();
  });

  test('should display editor with edit and preview buttons', async ({ page }) => {
    // Check editor toolbar exists
    await expect(page.getByRole('button', { name: '编辑' })).toBeVisible();
    await expect(page.getByRole('button', { name: '预览' })).toBeVisible();
  });

  test('should handle markdown input in edit mode', async ({ page }) => {
    // Type some markdown
    const textarea = page.locator('textarea');
    await textarea.fill('# Hello World\n\nThis is a **test**.');

    // Verify content is in textarea
    await expect(textarea).toHaveValue('# Hello World\n\nThis is a **test**.');
  });

  test('should render markdown preview with KaTeX', async ({ page }) => {
    // Type markdown with LaTeX
    const textarea = page.locator('textarea');
    await textarea.fill('# Test Document\n\nInline: $a^2 + b^2 = c^2$\n\n$$\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$');

    // Switch to preview mode
    await page.getByRole('button', { name: '预览' }).click();

    // Check preview container exists and has content
    const preview = page.locator('.preview');
    await expect(preview).toBeVisible();

    // Check for KaTeX rendered elements
    await expect(page.locator('.katex').first()).toBeVisible();

    // Check heading is rendered
    await expect(preview.locator('h1')).toContainText('Test Document');
  });

  test('should not crash on paste with special characters', async ({ page }) => {
    // Simulate pasting complex markdown content
    const complexMarkdown = `# Complex Document

## Section 1
Some text with \`inline code\` and **bold**.

## Section 2 - Math
Inline: $E = mc^2$

Display:
$$\\int_0^\\infty e^{-x} dx = 1$$

## Section 3 - Table
| Col1 | Col2 |
|------|------|
| A    | B    |
`;

    const textarea = page.locator('textarea');
    await textarea.fill(complexMarkdown);

    // Switch to preview
    await page.getByRole('button', { name: '预览' }).click();

    // Should not crash - page should still be functional
    await expect(page.locator('.preview')).toBeVisible();

    // Switch back to edit mode
    await page.getByRole('button', { name: '编辑' }).click();
    await expect(textarea).toBeVisible();
  });

  test('should handle empty content gracefully', async ({ page }) => {
    // Clear textarea
    const textarea = page.locator('textarea');
    await textarea.fill('');

    // Switch to preview
    await page.getByRole('button', { name: '预览' }).click();

    // Should not crash
    await expect(page.locator('.preview')).toBeVisible();
  });

  test('should render blockquote and LaTeX arrows correctly', async ({ page }) => {
    // Test blockquote (>) and LaTeX arrow (\Rightarrow)
    const textarea = page.locator('textarea');
    await textarea.fill('> This is a blockquote\n\n$$A \\Rightarrow B$$');

    // Switch to preview
    await page.getByRole('button', { name: '预览' }).click();

    // Check blockquote is rendered (not &gt;)
    const blockquote = page.locator('blockquote');
    await expect(blockquote).toBeVisible();
    await expect(blockquote).toContainText('This is a blockquote');

    // Check KaTeX arrow is rendered
    await expect(page.locator('.katex-display').first()).toBeVisible();
  });
});
