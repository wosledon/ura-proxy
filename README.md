# URA Proxy

🔄 将线上前端的API请求透明地重定向到本地开发服务器的Chrome浏览器扩展

![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-v1.0.0-blue)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 功能特性

- ✅ **零代码修改** - 前端代码完全无需改动
- ✅ **一键切换** - 可快速启用/禁用重定向  
- ✅ **实时生效** - 无需重启浏览器
- ✅ **规则可视** - 清晰显示当前重定向规则
- ✅ **缓存管理** - 一键清除浏览器缓存
- ✅ **状态保持** - 自动记住开关状态
- ✅ **多规则支持** - 支持同时配置多个重定向规则

## 💡 解决的问题

**完美解决以下开发痛点：**

- 🎯 前端代码部署在线上，但需要调试本地API
- 🎯 不想修改前端配置文件或重新部署  
- 🎯 需要在线上环境和本地环境之间快速切换
- 🎯 团队协作时需要灵活的API代理方案
- 🎯 避免复杂的代理服务器配置

## 📦 快速安装

### 方法1: 开发者模式安装（推荐）

1. 下载或克隆本项目到本地
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本项目的根目录
6. 扩展安装完成！工具栏会显示扩展图标 🔄

### 方法2: 打包安装

```bash
# 在Chrome扩展页面点击"打包扩展程序"
# 选择本项目根目录，生成.crx文件
# 双击.crx文件或拖拽到扩展页面安装
```

## 🔧 预设规则

扩展默认配置了两个重定向规则：

### 📍 规则1: 示例API重定向
```
源地址: https://example.com/api/*
目标地址: http://localhost:8091/*
```
**用途**: 将线上API请求重定向到本地8091端口

### 📍 规则2: 通用API重定向  
```
源地址: https://api.example.com/*
目标地址: http://localhost:3000/*
```
**用途**: 示例规则，可根据需要修改

## 🛠️ 自定义配置

### 修改重定向规则

编辑项目根目录的 `rules.json` 文件：

```json
[
  {
    "id": 3,
    "priority": 1,
    "action": {
      "type": "redirect", 
      "redirect": {
        "regexSubstitution": "http://localhost:8080\\1"
      }
    },
    "condition": {
      "regexFilter": "^https://your-api-domain\\.com(.*)",
      "resourceTypes": ["xmlhttprequest", "fetch"]
    }
  }
]
```

### 配置参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `id` | 规则唯一标识符 | `1, 2, 3...` |
| `priority` | 规则优先级 | `1`（数字越大优先级越高） |
| `regexFilter` | 匹配URL的正则表达式 | `"^https://api\\.domain\\.com(.*)"` |
| `regexSubstitution` | 重定向目标地址 | `"http://localhost:3000\\1"` |
| `resourceTypes` | 拦截的请求类型 | `["xmlhttprequest", "fetch"]` |

**注意**: `\\1` 表示正则表达式的第一个捕获组，用于保留URL路径

## 🚀 使用指南

### 第一步：启动本地API服务

确保您的本地API服务正在运行：

```bash
# Node.js 示例
npm start

# Python 示例  
python app.py

# Java 示例
mvn spring-boot:run

# 确认服务运行在预期端口，如 localhost:8091
```

### 第二步：控制重定向开关

扩展提供了灵活的开关控制：

1. **点击扩展图标** - 在工具栏点击🔄图标打开控制面板
2. **查看状态** - 面板显示当前重定向状态（启用/禁用）
3. **一键切换** - 点击"启用"/"禁用"按钮即时切换
4. **状态保持** - 扩展会记住您的选择，下次打开浏览器时自动恢复
5. **实时生效** - 无需重启浏览器或重新加载页面

**重要说明**：
- ✅ 启用状态：所有匹配的API请求将重定向到本地服务器
- ❌ 禁用状态：API请求正常发送到原始服务器，不进行重定向
- 🔄 状态切换立即生效，无需重新加载网页

### 第二步：配置CORS（重要！）

本地服务器必须支持跨域请求，否则会出现CORS错误：

### 第三步：配置本地API的CORS

为避免跨域问题，本地API需要配置CORS：

**Node.js Express:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
  credentials: true
}));
```

**Python Flask:**
```python
from flask_cors import CORS
CORS(app, origins=['https://your-frontend-domain.com'])
```

**Java Spring Boot:**
```java
@CrossOrigin(origins = {"https://your-frontend-domain.com"})
@RestController  
public class ApiController {
    // 您的API代码
}
```

**Python Django:**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
]
```

### 第四步：验证重定向

1. 访问您的线上前端应用
2. 打开浏览器开发者工具（F12）
3. 在Network标签页观察API请求
4. 确认请求被重定向到localhost

## 🔍 调试与测试

### 查看扩展日志

1. 访问 `chrome://extensions/`
2. 找到"URA Proxy"
3. 点击"service worker"链接
4. 在控制台查看重定向日志

### 测试重定向功能

在浏览器控制台执行以下代码：

```javascript
// 测试预设的API重定向
fetch('https://example.com/api/test')
  .then(response => {
    console.log('✅ 重定向成功！响应来源:', response.url);
    return response.json();
  })
  .then(data => console.log('📄 响应数据:', data))
  .catch(error => console.log('❌ 请求失败:', error));

// 测试自定义API
fetch('https://api.example.com/users')
  .then(response => console.log('📍 请求重定向到:', response.url))
  .catch(error => console.log('⚠️ 请求错误:', error));
```

### 网络请求监控

在DevTools的Network标签页中：
- 筛选 `XHR` 和 `Fetch` 请求
- 查看请求URL是否被正确重定向
- 检查响应状态码和数据

## 🎛️ 扩展界面功能

扩展弹窗提供以下功能：

| 功能 | 说明 | 操作 |
|------|------|------|
| 🔄 状态切换 | 启用/禁用重定向 | 点击"启用"/"禁用"按钮 |
| 📋 规则显示 | 查看当前重定向规则 | 弹窗中自动显示 |
| 🗑️ 缓存清理 | 清除浏览器缓存 | 点击"清除缓存"按钮 |
| ⚙️ 配置规则 | 打开选项页面 | 点击"配置规则"按钮 |

## ⚠️ 注意事项

### 1. CORS配置（最重要）
```bash
❌ 常见错误: Access to fetch at 'xxx' has been blocked by CORS policy
✅ 解决方案: 在本地服务器配置CORS允许线上域名访问
```

### 2. HTTPS混合内容警告
```bash
❌ 问题: Chrome阻止HTTPS页面请求HTTP资源
✅ 解决方案: 
   - 点击地址栏锁图标 → 网站设置 → 允许不安全内容
   - 或为本地服务配置HTTPS证书
```

### 3. 缓存问题
```bash
🔄 切换重定向后，建议清理缓存:
   - 使用扩展的"清除缓存"功能
   - 或 Ctrl+Shift+Del 手动清除
```

### 4. 端口一致性
```bash
✅ 确保本地服务端口与rules.json中配置一致
   - 本地服务: localhost:8091  
   - 配置文件: "regexSubstitution": "http://localhost:8091\\1"
```

## 📝 常见问题

<details>
<summary><strong>Q: 扩展安装后没有生效？</strong></summary>

**排查步骤:**
1. 检查扩展是否正确加载（访问 `chrome://extensions/`）
2. 确认本地服务正在运行
3. 检查 `rules.json` 配置是否正确
4. 清除浏览器缓存并刷新页面
5. 查看扩展的service worker控制台是否有错误

</details>

<details>
<summary><strong>Q: 出现CORS跨域错误？</strong></summary>

**解决方案:**
```javascript
// 在本地服务器添加CORS配置
app.use(cors({
  origin: ['https://your-frontend-domain.com'], 
  credentials: true
}));
```

</details>

<details>
<summary><strong>Q: 如何调试重定向是否生效？</strong></summary>

**调试方法:**
1. 打开DevTools Network面板
2. 筛选XHR/Fetch请求
3. 查看请求URL是否被重定向
4. 检查扩展的service worker日志

</details>

<details>
<summary><strong>Q: 可以同时重定向多个不同的API域名吗？</strong></summary>

**答案:** 可以！在 `rules.json` 中添加多个规则即可：
```json
[
  {"id": 1, "condition": {"regexFilter": "^https://api1\\.com(.*)"}},
  {"id": 2, "condition": {"regexFilter": "^https://api2\\.com(.*)"}},
  {"id": 3, "condition": {"regexFilter": "^https://api3\\.com(.*)"}}
]
```

</details>

<details>
<summary><strong>Q: 如何临时禁用某个规则？</strong></summary>

**方法:**
1. 点击扩展图标，在弹窗中点击"禁用"（全部禁用）
2. 或编辑 `rules.json`，删除特定规则后重新加载扩展

</details>

## 🛠️ 开发者指南

### 项目结构

```
ura-proxy/
├── 📄 manifest.json          # 扩展配置文件
├── 📄 rules.json            # 重定向规则配置  
├── 📄 popup.html            # 扩展弹窗界面
├── 📄 popup.js              # 弹窗交互逻辑
├── 📄 background.js         # 后台服务脚本
└── 📄 README.md             # 使用说明文档
```

### 修改扩展功能

**添加新的重定向规则:**
```bash
1. 编辑 rules.json 添加规则
2. 在 chrome://extensions/ 页面重新加载扩展
```

**修改UI界面:**
```bash
1. 编辑 popup.html 修改界面布局和样式
2. 修改 popup.js 添加新的交互逻辑
```

**扩展后台功能:**
```bash
1. 编辑 background.js 添加后台处理逻辑
2. 可以添加动态规则、请求监听等功能
```

### 动态规则示例

```javascript
// 在background.js中添加动态规则
chrome.declarativeNetRequest.updateDynamicRules({
  addRules: [{
    id: 999,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { regexSubstitution: "http://localhost:9000\\1" }
    },
    condition: {
      regexFilter: "^https://dynamic-api\\.com(.*)",
      resourceTypes: ["xmlhttprequest", "fetch"]
    }
  }],
  removeRuleIds: [999] // 移除旧规则
});
```

## 🔗 相关资源

- [Chrome扩展开发官方文档](https://developer.chrome.com/docs/extensions/)
- [declarativeNetRequest API参考](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/)
- [Manifest V3迁移指南](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome扩展权限说明](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/)

## 📊 性能与兼容性

| 项目 | 说明 |
|------|------|
| **浏览器支持** | Chrome 88+, Edge 88+ |
| **Manifest版本** | V3（最新标准） |
| **性能影响** | 极小，仅拦截指定请求 |
| **内存占用** | < 5MB |
| **启动时间** | < 100ms |

## � 技术说明

### Content Security Policy (CSP) 兼容性

本扩展完全兼容Chrome的Content Security Policy，所有JavaScript事件都使用标准的`addEventListener`方式绑定，确保：

- ✅ 符合Chrome扩展安全标准
- ✅ 不使用任何内联事件处理器
- ✅ 通过CSP严格模式检查
- ✅ 代码更安全、更维护

### 扩展架构

- **Manifest V3**: 使用最新的扩展架构
- **Service Worker**: 后台处理重定向逻辑
- **declarativeNetRequest**: 高性能的网络请求拦截
- **Event-driven**: 事件驱动的交互模式

## �📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🎉 开始使用

1. **克隆项目**: `git clone <repository-url>`
2. **安装扩展**: 按照上面的安装步骤操作
3. **配置规则**: 编辑 `rules.json` 设置您的API重定向
4. **启动本地服务**: 确保本地API服务正在运行  
5. **开始调试**: 访问线上前端，享受无缝的本地API调试体验！

**🚀 这就是最简单高效的线上前端API重定向解决方案！**

---

*如有问题或建议，欢迎提交 Issue 或 Pull Request！*
