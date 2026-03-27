# H-003: File Save Dialog

## Goal

Implement file save dialog to save converted .docx files to user-specified location.

**Note**: This is already implemented. This harness documents and verifies existing functionality.

## Acceptance Criteria

- [ ] "保存文件..." button appears after conversion
- [ ] Clicking opens system save dialog
- [ ] User can choose destination and filename
- [ ] File is copied to selected location
- [ ] Success/error message displayed

## Test Cases

To be added in `e2e/save.spec.ts`:

```typescript
test('should save file to user-specified location', async ({ page }) => {
  // Fill markdown content
  await textarea.fill('# Test\n\nContent');

  // Convert
  await page.getByRole('button', { name: '转换为 Word' }).click();

  // Wait for conversion
  await expect(page.getByRole('button', { name: '保存文件...' })).toBeVisible();

  // Save (mock file dialog)
  // ... verify save dialog opens
  // ... verify file is saved
});
```

## Implementation Status

**Backend**: ✅ Implemented
- `save_file_to_location` command in `src-tauri/src/commands/convert.rs`

**Frontend**: ✅ Implemented
- `handleSave` function in `src/App.tsx`
- Uses `@tauri-apps/plugin-dialog`

**Tests**: ⏳ Pending
- E2E test needs file system mocking

## Files to Modify

- `e2e/save.spec.ts` (create) - E2E tests for save functionality

## Next Steps

1. Create `e2e/save.spec.ts`
2. Add E2E tests for save flow
3. Run tests and verify

---

**Priority**: Medium
**Estimate**: 2 hours
