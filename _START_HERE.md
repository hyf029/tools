# 单文件 HTML 工具制作系统 — 使用说明书

> 这份文档把 P0–P5 的所有关键内容与落点整合在一起，方便你随时查阅。

---

## 1. 一句话总览

| 文件 | 作用 |
|------|------|
| `key-manager.html` | 集中管 key、base_url、默认模型（给所有 AI 工具供血） |
| `_template.html` | 一切工具的起点（UI/调试/错误/复制下载都标准化） |
| `tools-index.html` | 工具库入口（搜索筛选、导出 manifest） |
| `tool_meta + prompt_log` | 让每个工具变成"可检索资产" |
| P5 红线 | 让联网/隐私/调试/依赖不会翻车 |

---

## 2. 目录结构

```
html_tool/
├── key-manager.html      # P1 v2.1 - 集中管理 API Key
├── _template.html        # P2 v2.2 - 统一模板（唯一真源）
├── tools-index.html      # P4 v1.1 - 工具索引
├── _START_HERE.md        # 本说明书
└── tools/                # 你的工具放这里
    ├── xxx-tool.html
    └── yyy-tool.html
```

---

## 3. 日常开工（5 分钟 MVP）

**你现在依然可以一键开干，只是开干时"默认带系统底座"。**

### 新建工具最短流程

1. 复制 `_template.html` → 改名 `tools/my-new-tool.html`
2. 修改 `TOOL_META`（工具名/版本/能力开关）
3. 实现 `toolTransform(inputText, ctx)`（核心逻辑）
4. 加入 `tool_meta`（P4 规范，最小字段即可）
5. 打开页面 → 粘贴示例 → 自测 edge_cases

---

## 4. 什么时候需要 key-manager

- **只有当工具要用 AI/要联网请求时才需要**
- 如果工具纯离线（格式化、转换、切片），完全不需要 key-manager

---

## 5. 统一的 `tool_meta`（每个工具都要贴一份）

每个工具 HTML 里都放这段：

```html
<script type="application/json" id="tool_meta">
{
  "tool_id": "your-tool-id",
  "tool_name": "你的工具名",
  "tool_version": "1.0.0",
  "description": "一句话描述",
  "capabilities": {
    "paste_first": true,
    "file_input": false,
    "download_output": true,
    "url_state": false,
    "local_draft": false,
    "networking": false,
    "ai": false
  },
  "tags": ["single_file"]
}
</script>
```

---

## 6. 统一的 `prompt_log`（每个工具做完就写一份）

```text
# Prompt Log
tool_id:
tool_name:
tool_version:

## 需求（一句话）
-

## I/O
- input:
- output:

## 关键决策（为什么这么做）
- no build step 的原因：
- 依赖策略（为什么选/不选某库）：
- 持久化策略（URL/localStorage/none）：
- 联网策略（默认 off？哪些域名？）：

## 边界与降级
- CORS 不通时：
- 无 key 时：
- 大输入/大文件时：

## 已知限制
-

## 下次 Remix 方向（至少 3 个）
- 变体 1：
- 变体 2：
- 变体 3：

## 链接
- source:
- transcript / gist:
```

---

## 7. P5 红线怎么"真正落地"

**策略：不要给旧文件打补丁；只维护"最新模板"。**

也就是说：
- `_template.html` 是"唯一真源"
- AI 模块是"唯一真源"
- 新工具永远从真源复制生成

这样你不会陷入"这个工具打了补丁、那个工具没打补丁"的混乱。

### P5 核心规则

1. **联网默认 off**：开关必须由用户明确打开
2. **域名白名单 + 授权确认**：防止 key 发错地方
3. **敏感数据不入 URL**：URL 可分享、可被历史记录保存
4. **调试脱敏**：调试报告不会泄露 key 和输入全文

---

## 8. P0 协议（Key Manager Protocol）

### 旧工具兼容

旧工具继续读 `localStorage.getItem(keyName)`：
- `siliconflow_key`
- `openrouter_key`
- `deepseek_key`
- `custom_key`

### 新能力（覆盖配置）

Base URL、默认模型、自定义模型等覆盖配置放到：
```javascript
localStorage.getItem('km_provider_overrides_v1')
```

---

## 9. 文件定位表

| 产物 | 你什么时候用 | 你把它放哪 | 你做什么动作 |
|------|-------------|-----------|-------------|
| P0 协议 | 扩展 provider/升级 key-manager 时 | 本说明书 | 当"规则"，不需要每天碰 |
| `key-manager.html` | 需要 AI 的工具前 | 工具库根目录 | 设置 key + 选默认模型 |
| `_template.html` | 每次开新工具 | 工具库根目录 | 复制一份 → 改逻辑 |
| AI 模块 | 工具需要 AI 时 | 直接在模板内启用 | 把 `ai: false` 改成 `ai: true` |
| `tool_meta` | 每个工具都应该有 | 每个工具 HTML 内嵌 | 给工具"身份证" |
| `prompt_log` | 每做完一个工具 | 工具页脚/commit message | 记录关键选择/坑 |
| `tools-index.html` | 工具多起来后 | 工具库根目录 | 做检索入口 |

---

## 10. 模板中你只需要改 3 处

打开 `_template.html`，搜索 `EDIT AREA`：

### EDIT AREA 1/3: `TOOL_META`
```javascript
const TOOL_META = {
    tool_name: "你的工具名",
    tool_version: "1.0.0",
    description: "工具描述",
    capabilities: {
        paste_first: true,      // 粘贴优先
        file_input: false,      // 打开文件
        download_output: true,  // 下载输出
        url_state: false,       // URL 存状态
        local_draft: false,     // 本地草稿
        networking: false,      // 允许联网
        ai: false               // 启用 AI
    },
    // ...
};
```

### EDIT AREA 2/3: `toolTransform()`
```javascript
async function toolTransform(inputText, ctx){
    // 你的核心逻辑写这里
    // 默认是 JSON 美化
    return processedText;
}
```

### EDIT AREA 3/3: `buildAiMessages()`（可选）
```javascript
function buildAiMessages(inputText){
    return [
        { role: "system", content: "你的系统提示词" },
        { role: "user", content: inputText }
    ];
}
```

---

## 11. 快速链接

- [key-manager.html](./key-manager.html) — 管理 API Key
- [_template.html](./_template.html) — 工具模板
- [tools-index.html](./tools-index.html) — 工具索引
- [tools/ai-rewriter.html](./tools/ai-rewriter.html) — AI 改写器示例

---

## 附录：Tool Generator Prompt（用 AI 生成工具）

如果你想用大模型帮你生成工具，复制下面的 Prompt：

```text
你是"单文件 HTML 工具生成器"。

目标：基于我提供的【统一模板 v2.2】生成一个可运行的单文件 .html 工具。

强制约束：
- 必须输出完整 HTML（<!DOCTYPE html> ... </html>），且只有一个文件。
- 不允许 React/Vue/构建步骤；只允许原生 JS/CSS。
- 必须保留模板中的：调试面板、错误分流、限制策略、P5 红线。
- 只能修改/填写模板中的"EDIT AREA 1/3、2/3、3/3"以及页面底部的 <script id="tool_meta">。
- 必须按 tool_spec 填好 tool_meta。
- 必须在页面的说明区域增加一个"边界与测试"小段。

输入给你两段：
A) tool_spec（JSON）
B) 统一模板 v2.2（完整 HTML）

输出要求：
- 输出最终可运行的完整 HTML（不是 diff，不是片段）。
```

### tool_spec 模板

```json
{
  "tool_id": "your-tool-id",
  "tool_name": "你的工具名",
  "version": "1.0.0",
  "purpose": "一句话说明这个工具解决什么问题",
  "inputs": ["paste_text"],
  "outputs": ["copy_text"],
  "capabilities": {
    "paste_first": true,
    "file_input": false,
    "download_output": true,
    "url_state": false,
    "local_draft": false,
    "ai": false
  },
  "edge_cases": [
    "空输入怎么处理",
    "格式非法怎么报错",
    "超大输入怎么限制"
  ],
  "dependencies_policy": "能不用库就不用；必须用 CDN 就固定版本并写明原因"
}
```
