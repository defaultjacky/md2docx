# Harness Index

## Completed Harnesses

| ID | Name | Status | Date |
|----|------|--------|------|
| H-001 | Basic Editor | ✅ Done | 2026-03-25 |
| H-002 | LaTeX Support | ✅ Done | 2026-03-26 |

## Pending Harnesses

| ID | Name | Priority |
|----|------|----------|
| H-003 | File Save Dialog | Medium |
| H-004 | Batch Conversion | Low |
| H-005 | Settings Panel | Low |

---

## Harness Registry

### H-001: Basic Editor

**Goal**: Markdown editor with preview toggle

**Spec**: [h001_basic_editor/spec.md](./h001_basic_editor/spec.md)

**Tests**: `e2e/editor.spec.ts` (basic tests)

**Status**: ✅ Complete - 7/7 E2E tests passing

---

### H-002: LaTeX Support

**Goal**: Render LaTeX formulas with KaTeX

**Spec**: [h002_latex_support/spec.md](./h002_latex_support/spec.md)

**Tests**: `e2e/editor.spec.ts` (LaTeX tests)

**Status**: ✅ Complete - KaTeX rendering working
