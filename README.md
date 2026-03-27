# MD2Docx

基于 Tauri 的跨平台 Markdown 转 Word (OMML) 桌面应用。

## 功能特性

- **跨平台支持**: Windows (x86_64), macOS (Intel/ARM), Linux
- **Pandoc Sidecar**: 内置 Pandoc 转换引擎，无需额外安装
- **LaTeX 公式支持**: 完美转换 LaTeX 公式为 Word 原生 OMML 格式
  - 行内公式：`$a^2+b^2=c^2$`
  - 块级公式：`$$\frac{-b \pm \sqrt{b^2-4ac}}{2a}$$`
- **简洁 UI**: 编辑/预览切换、实时 Markdown 渲染
- **KaTeX 渲染**: 使用 marked + KaTeX 实现快速预览

## 技术栈

- **前端**: React + TypeScript + Vite
- **后端**: Rust + Tauri v2
- **转换引擎**: Pandoc (Sidecar 模式)
- **Markdown 渲染**: marked + KaTeX
- **测试**: Playwright (E2E), Vitest (单元测试)

## 项目结构

```
md2docx/
├── .github/workflows/       # GitHub Actions CI/CD
│   ├── lint.yml            # ESLint + Clippy 检查
│   └── build.yml           # 跨平台构建
├── e2e/                     # E2E 测试
│   └── editor.spec.ts      # Playwright 测试
├── src/                     # 前端源码
│   ├── components/
│   │   ├── Editor.tsx      # Markdown 编辑器 (marked + KaTeX)
│   │   └── ProgressBar.tsx # 进度条
│   ├── utils/
│   │   └── convert.ts      # 转换工具函数
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/               # Tauri 后端
│   ├── binaries/           # Pandoc Sidecar 二进制
│   ├── src/
│   │   ├── commands/
│   │   │   └── convert.rs  # 转换命令
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── tests/                   # 前端单元测试
│   └── convert.test.ts
├── playwright.config.ts     # Playwright 配置
├── package.json
└── README.md
```

## 开发指南

### 环境准备

1. 安装 [Rust](https://rustup.rs/)
2. 安装 [Node.js](https://nodejs.org/) (v18+)
3. 安装 Tauri 依赖：
   - macOS: Xcode Command Tools
   - Windows: Microsoft Visual Studio C++ 工具
   - Linux: `libwebkit2gtk-4.1-dev` 等

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run tauri dev
```

### 构建发布版本

```bash
npm run tauri build
```

### 代码质量检查

```bash
# 前端
npm run lint
npm run format:check

# 后端
cd src-tauri
cargo clippy --all-targets --all-features
cargo fmt --all -- --check
```

### 运行测试

```bash
# 前端单元测试
npm test

# E2E 测试
npm run test:e2e

# 后端测试
cd src-tauri
cargo test
```

## Pandoc 配置

开发模式下使用系统 Pandoc，生产模式使用 bundeld binaries。

### 安装 Pandoc (开发模式)

```bash
# macOS
brew install pandoc

# Windows
winget install JohnMacFarlane.Pandoc

# Linux
sudo apt-get install pandoc
```

## GitHub Actions CI/CD

### Lint 工作流

- 前端：ESLint + Prettier
- 后端：Clippy + rustfmt

### Build 工作流

- 跨平台构建 (Windows/macOS/Linux)
- 自动生成 Release

## 测试用例

### LaTeX 公式测试

```markdown
# 测试文档

## 行内公式

这是一个行内公式：$a^2+b^2=c^2$

## 块级公式

$$
\frac{-b \pm \sqrt{b^2-4ac}}{2a}
$$

## 表格测试

| 列 1 | 列 2 |
|------|------|
| 值 1 | 值 2 |
```

## 许可证

MIT License
