# Harness Engineering Guide for MD2Docx

> Harness Engineering: AI-driven development with verification-first mindset

---

## 核心原则

1. **测试先行 (Test-First)** - 新功能先写测试，再实现代码
2. **验证闭环 (Verification Loop)** - 每次变更必须通过测试
3. **小步迭代 (Incremental)** - 每次只做一个可验证的变更
4. **文档同步 (Doc as Code)** - 代码变更同步更新文档

---

## 开发工作流

```bash
# 1. 运行现有测试，确认基准状态
npm run test:e2e

# 2. 添加新测试 (描述期望行为)
# 编辑 e2e/editor.spec.ts

# 3. 实现功能
# 编辑源码

# 4. 验证
npm run test:e2e
npm run lint

# 5. 提交
git add -A
git commit -m "feat: xxx (with tests)"
```

---

## 项目结构

```
md2docx/
├── HARNESS.md           # Harness 工程指南 (本文件)
├── HARNESSES/           # Harness 目录
│   ├── README.md        # Harness 索引
│   ├── h001_basic_editor/    # Harness 001: 基础编辑器
│   │   ├── spec.md      # 需求规格
│   │   └── tests/       # 相关测试
│   └── h002_latex_support/   # Harness 002: LaTeX 支持
│       ├── spec.md
│       └── tests/
├── e2e/                 # Playwright E2E 测试
├── tests/               # Vitest 单元测试
├── src/                 # 源码
└── docs/                # 文档
```

---

## Harness 模板

每个 Harness 包含：

```markdown
# H-XXX: [名称]

## 目标
[一句话描述]

## 验收标准
- [ ] 标准 1
- [ ] 标准 2

## 测试用例
[Playwright/Vitest 测试]

## 实现状态
[已完成/进行中/待开始]

## 变更记录
[Git commits]
```

---

## 常用命令

### 测试
```bash
# E2E 测试
npm run test:e2e

# 单元测试
npm test

# 特定测试
npx playwright test e2e/editor.spec.ts --debug
```

### 代码质量
```bash
# 前端 lint
npm run lint

# 后端 lint
cd src-tauri && cargo clippy

# 格式化
npm run format
```

### 开发
```bash
# 开发模式
npm run tauri dev

# 构建
npm run tauri build
```

---

## AI 协作文案

### 请求新功能
```
请实现 [功能描述]

验收标准:
1. [标准 1]
2. [标准 2]

请先：
1. 添加 E2E 测试
2. 运行测试确认失败
3. 实现功能
4. 运行测试确认通过
```

### Debug 问题
```
测试失败：[粘贴错误信息]

请：
1. 分析失败原因
2. 提出修复方案
3. 应用修复
4. 运行测试验证
```

---

## 质量检查清单

提交前确认：

- [ ] E2E 测试通过
- [ ] Lint 检查通过
- [ ] 文档已更新
- [ ] .gitignore 正确
- [ ] Commit message 清晰

---

## 参考资料

- [Playwright 文档](https://playwright.dev/)
- [Tauri v2 文档](https://tauri.app/)
- [marked 文档](https://marked.js.org/)
- [KaTeX 文档](https://katex.org/)
