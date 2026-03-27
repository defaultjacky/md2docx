# MD2Docx Agent.md

> 项目开发和维护指南 - 用于后续功能迭代和代码维护

---

## 项目概述

**MD2Docx** 是一个基于 Tauri v2 的跨平台桌面应用，用于将 Markdown 文档（含 LaTeX 公式）转换为 Word (.docx) 格式，公式会被转换为 Word 原生的 OMML 格式。

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Tauri | v2 |
| 前端 | React + TypeScript + Vite | React 19, TS 5.8, Vite 7 |
| 后端 | Rust | 1.94+ (stable) |
| 转换引擎 | Pandoc (Sidecar) | 3.4 |
| 测试 | Vitest (前端), cargo test (后端) | - |
| 代码质量 | ESLint + Prettier, Clippy | - |

---

## 项目结构

```
md2docx/
├── .github/workflows/
│   ├── lint.yml            # CI: ESLint + Clippy 检查
│   └── build.yml           # CI: 跨平台构建与发布
├── src/                    # 前端源码
│   ├── components/
│   │   ├── DropZone.tsx    # 文件拖拽上传组件
│   │   ├── DropZone.css
│   │   ├── Editor.tsx      # Markdown 编辑器 (编辑/预览切换)
│   │   ├── Editor.css
│   │   ├── ProgressBar.tsx # 转换进度条组件
│   │   └── ProgressBar.css
│   ├── utils/
│   │   └── convert.ts      # 转换工具函数 (调用 Tauri Command)
│   ├── App.tsx             # 主应用组件
│   ├── App.css
│   └── main.tsx            # 入口文件
├── src-tauri/              # Tauri 后端
│   ├── binaries/           # Pandoc Sidecar 二进制文件
│   │   ├── pandoc-aarch64-apple-darwin
│   │   └── pandoc-x86_64-apple-darwin
│   ├── src/
│   │   ├── commands/
│   │   │   ├── convert.rs  # 转换命令实现 (含单元测试)
│   │   │   └── mod.rs      # 命令模块导出
│   │   ├── lib.rs          # Tauri 应用入口
│   │   └── main.rs         # Rust 主函数
│   ├── capabilities/
│   │   └── default.json    # 权限配置
│   ├── Cargo.toml          # Rust 依赖配置
│   └── tauri.conf.json     # Tauri 配置 (含 Sidecar)
├── tests/                  # 前端测试
│   └── convert.test.ts     # 转换功能集成测试
├── eslint.config.js        # ESLint 配置
├── prettier.config.js      # Prettier 配置
├── vite.config.ts          # Vite 配置 (含 Vitest)
├── package.json            # 前端依赖与脚本
├── tsconfig.json           # TypeScript 配置
└── README.md               # 用户文档
```

---

## 核心配置说明

### 1. Pandoc 配置

**重要**: Pandoc 查找逻辑采用多级回退策略：

1. **开发模式**: 优先使用系统 PATH 中的 `pandoc`
2. **生产模式**: 尝试从 `binaries/pandoc` 资源路径加载
3. **回退**: 尝试常见安装路径
4. **最后手段**: 假设 `pandoc` 在系统 PATH 中

**开发模式配置** (`tauri.conf.json`):

```json
{
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [...]
    // 开发模式下不需要 resources 配置
  }
}
```

**生产模式配置** (`tauri.conf.json`):

```json
{
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [...],
    "resources": [
      "binaries/*"
    ]
  }
}
```

**二进制文件命名规范**:

| 平台 | 文件名 |
|------|--------|
| Windows x86_64 | `pandoc-x86_64-pc-windows-msvc.exe` |
| macOS ARM64 | `pandoc-aarch64-apple-darwin` |
| macOS Intel | `pandoc-x86_64-apple-darwin` |
| Linux x86_64 | `pandoc-x86_64-unknown-linux-gnu` |

**添加新平台 Pandoc 的步骤**:

1. 从 [Pandoc Releases](https://github.com/jgm/pandoc/releases) 下载对应平台二进制
2. 解压并重命名为上述规范格式
3. 放置到 `src-tauri/binaries/` 目录
4. 更新 `build.yml` 中的下载逻辑
5. 生产模式需要在 `tauri.conf.json` 中添加 `resources` 配置

**开发环境准备**:

在开发模式下，需要确保系统安装了 Pandoc：

```bash
# macOS
brew install pandoc

# Windows
winget install JohnMacFarlane.Pandoc

# Linux
sudo apt-get install pandoc
```

**开发模式 vs 生产模式**:

| 配置项 | 开发模式 | 生产模式 |
|--------|---------|---------|
| Pandoc 来源 | 系统 PATH | bundled binaries |
| tauri.conf.json | 无 resources | `"resources": ["binaries/*"]` |
| binaries 目录 | 可选 | 必需 |
| 构建命令 | `npm run tauri dev` | `npm run tauri build` |

**从开发切换到生产模式**:

```bash
# 1. 恢复 binaries 目录
mv binaries_backup src-tauri/binaries

# 2. 修复权限
xattr -cr src-tauri/binaries/*
chmod +x src-tauri/binaries/*

# 3. 更新 tauri.conf.json，添加 resources 配置

# 4. 构建生产版本
npm run tauri build
```

### 2. 权限配置

**文件**: `src-tauri/capabilities/default.json`

当前权限:
- `core:default` - 核心功能
- `opener:default` - URL/文件打开
- `dialog:default` - 文件对话框
- `fs:default` - 文件系统访问
- `process:default` - 进程管理

添加新权限时，需要同时更新此文件和 `Cargo.toml` 中的特性。

### 3. Rust 依赖

**文件**: `src-tauri/Cargo.toml`

核心依赖:
- `tauri` (v2) - Tauri 框架
- `tauri-plugin-dialog` - 文件对话框
- `tauri-plugin-fs` - 文件系统
- `tauri-plugin-process` - 进程调用
- `uuid` - 生成临时文件名
- `serde` / `serde_json` - JSON 序列化

---

## 核心功能实现

### Rust 转换命令

**文件**: `src-tauri/src/commands/convert.rs`

```rust
#[tauri::command]
pub async fn convert_markdown_to_docx(
    app: AppHandle,
    request: ConvertRequest,
) -> Result<ConvertResponse, String>
```

**流程**:
1. 创建临时 Markdown 文件
2. 写入前端传入的 Markdown 内容
3. 解析 Pandoc Sidecar 路径
4. 调用 `pandoc --from markdown --to docx` 转换
5. 返回 .docx 文件路径或错误信息
6. 清理临时文件

**关键代码**:
```rust
let sidecar_path = app
    .path()
    .resolve("pandoc", tauri::path::BaseDirectory::Resource)
    .map_err(|e| format!("Failed to resolve sidecar path: {}", e))?;
```

### 前端调用

**文件**: `src/utils/convert.ts`

```typescript
export async function convertToDocx(
  markdown: string,
  onProgress?: (progress: number, status: string) => void
): Promise<ConvertResponse>
```

---

## 开发与维护

### 常用命令

```bash
# 开发模式 (热重载)
npm run tauri dev

# 构建发布版本
npm run tauri build

# 前端代码检查
npm run lint          # ESLint
npm run format:check  # Prettier 检查
npm run format        # Prettier 修复

# 后端代码检查
cd src-tauri
cargo clippy --all-targets --all-features  # Clippy
cargo fmt --all -- --check                  # rustfmt 检查
cargo fmt --all                             # rustfmt 修复

# 运行测试
npm test                      # 前端 Vitest
cd src-tauri && cargo test    # 后端测试
```

### 添加新功能检查清单

1. **前端组件**:
   - [ ] 创建 `.tsx` 和 `.css` 文件
   - [ ] 添加 TypeScript 类型定义
   - [ ] 编写组件测试

2. **后端命令**:
   - [ ] 在 `src/commands/` 下创建新模块
   - [ ] 使用 `#[tauri::command]` 标记
   - [ ] 在 `lib.rs` 中注册命令
   - [ ] 添加权限到 `capabilities/default.json`
   - [ ] 编写单元测试

3. **更新配置**:
   - [ ] 更新 `package.json` scripts (如需)
   - [ ] 更新 `Cargo.toml` 依赖 (如需)
   - [ ] 更新 `tauri.conf.json` (如需)

4. **测试**:
   - [ ] 运行 `npm test`
   - [ ] 运行 `cargo test`
   - [ ] 运行 `npm run tauri dev` 手动测试

5. **代码质量**:
   - [ ] 运行 `npm run lint`
   - [ ] 运行 `cargo clippy`

---

## 测试规范

### 后端测试 (Rust)

**位置**: `src-tauri/src/commands/convert.rs` (行内测试)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resolve_sidecar_name() {
        assert_eq!(resolve_sidecar_name(), "pandoc");
    }
}
```

### 前端测试 (Vitest)

**位置**: `tests/convert.test.ts`

测试覆盖:
- `convertToDocx` 函数调用
- 错误处理
- 进度回调
- LaTeX 公式场景 (行内/块级/复杂文档)

**运行**: `npm test`

### 测试用例示例

**LaTeX 公式测试**:

```markdown
# 测试文档

## 行内公式
这是一个行内公式：$a^2+b^2=c^2$

## 块级公式
$$
\frac{-b \pm \sqrt{b^2-4ac}}{2a}
$$

## 表格
| 列 1 | 列 2 |
|------|------|
| 值 1 | 值 2 |
```

---

## CI/CD 配置

### Lint 工作流 (`.github/workflows/lint.yml`)

触发条件: PR 或 push 到 main

执行:
- 前端: ESLint + Prettier
- 后端: Clippy + rustfmt

### Build 工作流 (`.github/workflows/build.yml`)

触发条件: PR、push 到 main、tag 推送

执行:
1. 运行测试 (前端 + 后端)
2. 跨平台构建 (Windows/macOS/Linux)
3. 生成 Release (tag 推送时)

**添加新平台构建**:
1. 在 `build.yml` 中添加新的 job
2. 添加对应平台的 Pandoc 下载步骤
3. 配置 `tauri-action` 的目标架构

---

## 常见问题排查

### Sidecar 路径解析失败

**症状**: `Failed to resolve sidecar path`

**原因**: binaries 目录缺少对应平台的 Pandoc 或命名不正确

**解决**:
1. 检查 `src-tauri/binaries/` 目录
2. 确认文件名符合命名规范
3. 确认 `tauri.conf.json` 中 `resources` 配置正确

### 权限错误 (macOS)

**症状**: `Permission denied (os error 13)`

**原因**: macOS 隔离机制或二进制文件权限不足

**解决**:
```bash
# 移除隔离属性
xattr -cr src-tauri/binaries/*

# 设置执行权限
chmod +x src-tauri/binaries/*

# 清理构建缓存
rm -rf src-tauri/target
```

### Pandoc 执行失败

**症状**: `Pandoc error: ...`

**调试**:
```bash
# 手动测试 Pandoc
pandoc --from markdown --to docx test.md -o test.docx

# 检查 Pandoc 版本
pandoc --version
```

### 开发模式下转换失败

**症状**: 开发模式运行正常，但构建后无法找到 Pandoc

**原因**: 开发模式使用系统 Pandoc，构建后未正确打包

**解决**:
1. 确保 binaries 目录包含正确的 Pandoc 二进制
2. 确认 `tauri.conf.json` 中 `resources` 包含 `binaries/*`
3. 在生产模式下，Rust 代码会从资源路径加载 Pandoc

### 转换成功但找不到输出文件

**症状**: 返回成功但文件不存在

**调试步骤**:
1. 检查前端控制台日志（显示文件路径）
2. 检查系统临时目录 (`/tmp` 或 `C:\Users\xxx\AppData\Local\Temp`)
3. 确认 Pandoc 执行日志（查看 stdout/stderr）

**解决方案**:
- 在 `convert.rs` 中已添加输出文件存在性验证
- 启用日志：`log::info!` 会输出详细转换过程

---

## 未来迭代建议

### 高优先级
- [ ] 添加文件保存对话框完整实现 (当前只打印路径)
- [ ] 添加转换历史记录
- [ ] 添加批量转换功能

### 中优先级
- [ ] 添加自定义 CSS 样式支持
- [ ] 添加文档预览 (转换后)
- [ ] 添加设置界面 (输出路径、格式选项)

### 低优先级
- [ ] 添加插件系统
- [ ] 支持其他输出格式 (PDF, HTML)
- [ ] 添加云同步功能

---

## 版本历史

- **v0.1.0** (2026-03-25) - 初始版本
  - 核心转换功能
  - 基础 UI 界面
  - CI/CD 配置
  - 测试套件

---

## 相关资源

- [Tauri v2 文档](https://tauri.app/v2/)
- [Pandoc 文档](https://pandoc.org/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [React 文档](https://react.dev/)
