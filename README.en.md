# URA Proxy

🔄 Seamlessly redirect online frontend API requests to your local development server with this Chrome extension.

![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-v1.0.0-blue)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

- ✅ **Zero code change** – No need to modify your frontend code
- ✅ **One-click toggle** – Quickly enable/disable redirection
- ✅ **Instant effect** – No browser restart required
- ✅ **Visual rules** – Clearly display current redirection rules
- ✅ **Cache management** – One-click clear browser cache
- ✅ **State persistence** – Remembers your toggle state
- ✅ **Multiple rules** – Supports multiple redirection rules

## 💡 Use Cases

- 🎯 Debug local APIs while frontend is deployed online
- 🎯 No need to change frontend config or redeploy
- 🎯 Instantly switch between online and local environments
- 🎯 Flexible API proxy for team collaboration
- 🎯 Avoid complex proxy server setups

## 📦 Quick Install

### Method 1: Developer Mode (Recommended)

1. Download or clone this repo
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the project root directory
6. Extension installed! The toolbar will show the extension icon 🔄

### Method 2: Packaged Install

```bash
# In Chrome extensions page, click "Pack extension"
# Select the project root, generate .crx file
# Double-click or drag .crx to install
```

## 🔧 Default Rules

Two default redirection rules are included:

### 📍 Rule 1: Example API Redirection
```
From: https://example.com/api/*
To:   http://localhost:8091/*
```
**Purpose**: Redirect online API requests to local port 8091

### 📍 Rule 2: General API Redirection
```
From: https://api.example.com/*
To:   http://localhost:3000/*
```
**Purpose**: Example rule, modify as needed

## 🛠️ Custom Configuration

Edit `rules.json` in the project root:

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

### Parameter Reference

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique rule ID | `1, 2, 3...` |
| `priority` | Rule priority | `1` (higher = higher priority) |
| `regexFilter` | URL regex to match | `"^https://api\\.domain\\.com(.*)"` |
| `regexSubstitution` | Redirect target | `"http://localhost:3000\\1"` |
| `resourceTypes` | Request types | `["xmlhttprequest", "fetch"]` |

**Note**: `\\1` means the first regex group, to keep the URL path.

## 🚀 Usage Guide

### 1. Start Your Local API Server

```bash
# Node.js
npm start
# Python
python app.py
# Java
mvn spring-boot:run
# Make sure your service runs on the expected port, e.g. localhost:8091
```

### 2. Toggle Redirection

- **Click the extension icon** to open the control panel
- **View status** (enabled/disabled)
- **One-click toggle**
- **State is remembered**
- **Takes effect instantly**

**Note:**
- ✅ Enabled: Matching API requests are redirected to local
- ❌ Disabled: Requests go to original server
- 🔄 Switching is instant, no reload needed

### 3. Configure CORS (Important!)

Your local server must allow cross-origin requests, or CORS errors will occur.

#### Node.js Express:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
  credentials: true
}));
```

#### Python Flask:
```python
from flask_cors import CORS
CORS(app, origins=['https://your-frontend-domain.com'])
```

#### Java Spring Boot:
```java
@CrossOrigin(origins = {"https://your-frontend-domain.com"})
@RestController  
public class ApiController {
    // Your API code
}
```

#### Python Django:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
]
```

### 4. Verify Redirection

1. Visit your online frontend
2. Open DevTools (F12)
3. Check API requests in the Network tab
4. Confirm requests are redirected to localhost

## 🔍 Debug & Test

### View Extension Logs

1. Go to `chrome://extensions/`
2. Find "URA Proxy"
3. Click the "service worker" link
4. Check logs in the console

### Test Redirection

In the browser console:

```javascript
fetch('https://example.com/api/test')
  .then(response => {
    console.log('✅ Redirected! Response from:', response.url);
    return response.json();
  })
  .then(data => console.log('📄 Data:', data))
  .catch(error => console.log('❌ Request failed:', error));

fetch('https://api.example.com/users')
  .then(response => console.log('📍 Redirected to:', response.url))
  .catch(error => console.log('⚠️ Request error:', error));
```

### Monitor Requests

- Filter XHR/Fetch in DevTools Network tab
- Check if URLs are redirected
- Check response status/data

## 🎛️ Extension UI Features

| Feature | Description | Action |
|---------|-------------|--------|
| 🔄 Toggle | Enable/disable redirection | Click toggle button |
| 📋 Show rules | View current rules | Shown in popup |
| 🗑️ Clear cache | Clear browser cache | Click button |
| ⚙️ Edit rules | Open options page | Click button |

## ⚠️ Notes

### 1. CORS
```bash
❌ Error: Access to fetch at 'xxx' has been blocked by CORS policy
✅ Solution: Configure CORS on your local server
```

### 2. HTTPS Mixed Content
```bash
❌ Chrome blocks HTTPS page requesting HTTP resource
✅ Solution:
   - Click lock icon → Site settings → Allow insecure content
   - Or use HTTPS for local server
```

### 3. Cache
```bash
🔄 After toggling, clear cache:
   - Use extension's clear cache
   - Or Ctrl+Shift+Del
```

### 4. Port Consistency
```bash
✅ Make sure local port matches rules.json
   - Local: localhost:8091
   - Config: "regexSubstitution": "http://localhost:8091\\1"
```

## 📝 FAQ

<details>
<summary><strong>Q: Extension not working?</strong></summary>

**Checklist:**
1. Is the extension loaded? (`chrome://extensions/`)
2. Is your local server running?
3. Is `rules.json` correct?
4. Clear browser cache and refresh
5. Check service worker logs

</details>

<details>
<summary><strong>Q: CORS errors?</strong></summary>

**Solution:**
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

</details>

<details>
<summary><strong>Q: How to debug redirection?</strong></summary>

1. Open DevTools Network panel
2. Filter XHR/Fetch
3. Check if URLs are redirected
4. Check service worker logs

</details>

<details>
<summary><strong>Q: Multiple API domains?</strong></summary>

**Yes!** Add multiple rules in `rules.json`:
```json
[
  {"id": 1, "condition": {"regexFilter": "^https://api1\\.com(.*)"}},
  {"id": 2, "condition": {"regexFilter": "^https://api2\\.com(.*)"}},
  {"id": 3, "condition": {"regexFilter": "^https://api3\\.com(.*)"}}
]
```

</details>

<details>
<summary><strong>Q: Temporarily disable a rule?</strong></summary>

1. Click the extension icon, then "Disable"
2. Or remove the rule from `rules.json` and reload

</details>

## 🛠️ Developer Guide

### Project Structure

```
ura-proxy/
├── manifest.json
├── rules.json
├── popup.html
├── popup.js
├── background.js
└── README.md
```

### Modify Features

**Add new rules:**
```bash
1. Edit rules.json
2. Reload extension in chrome://extensions/
```

**Edit UI:**
```bash
1. Edit popup.html
2. Edit popup.js
```

**Extend background:**
```bash
1. Edit background.js
2. Add dynamic rules, request listeners, etc.
```

### Dynamic Rule Example

```javascript
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
  removeRuleIds: [999]
});
```

## 🔗 Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [declarativeNetRequest API](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Extension Permissions](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/)

## 📊 Compatibility

| Item | Info |
|------|------|
| **Browser** | Chrome 88+, Edge 88+ |
| **Manifest** | V3 |
| **Performance** | Minimal, only intercepts specified requests |
| **Memory** | < 5MB |
| **Startup** | < 100ms |

## License

MIT License - see [LICENSE](LICENSE)

---

## 🎉 Get Started

1. **Clone**: `git clone <repository-url>`
2. **Install**: See above
3. **Configure**: Edit `rules.json`
4. **Start local server**
5. **Debug online frontend with local API!**

---

*Questions or suggestions? Open an Issue or Pull Request!*
