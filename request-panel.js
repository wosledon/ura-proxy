// request-panel.js - 注入到网页右侧的实时请求日志面板
(function() {
  if (window.__URA_PROXY_PANEL__) return; // 防止重复注入
  window.__URA_PROXY_PANEL__ = true;

  // 修改页面布局以适应面板
  function adjustPageLayout(show) {
    const body = document.body;
    const html = document.documentElement;
    
    if (show) {
      // 为页面添加右侧边距，给面板腾出空间
      body.style.marginRight = '420px';
      body.style.transition = 'margin-right 0.3s ease';
      html.style.transition = 'margin-right 0.3s ease';
    } else {
      // 恢复页面布局
      body.style.marginRight = '0';
      setTimeout(() => {
        body.style.transition = '';
        html.style.transition = '';
      }, 300);
    }
  }

  // 调整页面布局
  adjustPageLayout(true);

  // 创建 Shadow DOM 容器
  const panelHost = document.createElement('div');
  panelHost.style.position = 'fixed';
  panelHost.style.top = '0';
  panelHost.style.right = '0';
  panelHost.style.zIndex = '2147483647';
  panelHost.style.width = '420px';
  panelHost.style.height = '100vh';
  panelHost.style.pointerEvents = 'none';
  panelHost.style.transition = 'right 0.3s ease';
  document.body.appendChild(panelHost);

  const shadow = panelHost.attachShadow({mode: 'open'});

  // 样式
  const style = document.createElement('style');
  style.textContent = `
    .ura-proxy-panel {
      font-family: 'Segoe UI', 'Arial', sans-serif;
      background: #fff;
      border-left: 1px solid #e0e0e0;
      box-shadow: -2px 0 12px rgba(0,0,0,0.08);
      width: 400px;
      height: 100vh;
      position: fixed;
      right: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      transition: right 0.3s ease;
    }
    .ura-proxy-panel-header {
      background: #2196F3;
      color: #fff;
      padding: 10px 16px;
      font-size: 16px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: move;
      user-select: none;
    }
    .ura-proxy-panel-toggle {
      background: none;
      border: none;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      margin-left: 8px;
    }
    .ura-proxy-panel-close {
      background: none;
      border: none;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      margin-left: 8px;
    }
    .ura-proxy-panel-body {
      flex: 1;
      overflow-y: auto;
      background: #fafbfc;
      padding: 0 0 10px 0;
    }
    .ura-proxy-panel-search {
      padding: 8px 16px 0 16px;
      background: #fafbfc;
      border-bottom: 1px solid #eee;
    }
    .ura-proxy-panel-search input {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
    }
    .ura-proxy-panel-loglist {
      padding: 0 16px;
    }
    .ura-proxy-panel-logitem {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 5px;
      margin: 10px 0 0 0;
      padding: 10px;
      font-size: 13px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .ura-proxy-panel-logitem .log-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ura-proxy-panel-logitem .log-status {
      border-radius: 3px;
      padding: 1px 6px;
      font-size: 11px;
      margin-right: 6px;
    }
    .ura-proxy-panel-logitem .log-status-success {
      background: #4CAF50;
      color: #fff;
    }
    .ura-proxy-panel-logitem .log-status-warning {
      background: #ff9800;
      color: #fff;
    }
    .ura-proxy-panel-logitem .log-status-danger {
      background: #f44336;
      color: #fff;
    }
    .ura-proxy-panel-logitem .log-url {
      font-size: 12px;
      color: #666;
      word-break: break-all;
    }
    .ura-proxy-panel-logitem .log-actions {
      display: flex;
      gap: 4px;
    }
    .ura-proxy-panel-logitem .log-actions button {
      background: #2196F3;
      color: #fff;
      border: none;
      border-radius: 3px;
      padding: 2px 6px;
      cursor: pointer;
      font-size: 11px;
    }
    .ura-proxy-panel-logitem .log-actions button:hover {
      background: #1976D2;
    }
    .ura-proxy-panel-logitem .log-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .ura-proxy-panel-logitem .log-status {
      border-radius: 3px;
      padding: 1px 6px;
      font-size: 11px;
      margin-right: 6px;
      color: #fff;
    }
    .ura-proxy-panel-logitem .log-status-success { background: #4CAF50; }
    .ura-proxy-panel-logitem .log-status-danger { background: #f44336; }
    .ura-proxy-panel-logitem .log-status-warning { background: #ff9800; }
    .ura-proxy-panel-logitem .log-url {
      word-break: break-all;
      color: #333;
      flex: 1;
    }
    .ura-proxy-panel-logitem .log-actions button {
      background: #eee;
      border: none;
      border-radius: 3px;
      padding: 2px 8px;
      margin-left: 6px;
      cursor: pointer;
      font-size: 12px;
    }
    .ura-proxy-panel-logitem .log-details {
      margin-top: 8px;
      background: #f8f9fa;
      border-radius: 4px;
      padding: 8px;
      font-size: 12px;
      display: none;
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;
    }
    .ura-proxy-panel-footer {
      padding: 8px 16px;
      background: #fafbfc;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #888;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ura-proxy-panel-footer button {
      background: #f44336;
      color: #fff;
      border: none;
      border-radius: 3px;
      padding: 4px 12px;
      cursor: pointer;
      font-size: 12px;
    }
    .ura-proxy-panel-collapsed {
      right: -380px !important;
    }
    .ura-proxy-panel-footer {
      background: #f8f9fa;
      border-top: 1px solid #eee;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ura-proxy-panel-footer button {
      background: #dc3545;
      color: #fff;
      border: none;
      border-radius: 3px;
      padding: 4px 12px;
      cursor: pointer;
      font-size: 12px;
    }
    .ura-proxy-panel-empty {
      text-align: center;
      padding: 40px 20px;
      color: #666;
      font-size: 14px;
    }
  `;
  shadow.appendChild(style);

  // 主面板结构
  const panel = document.createElement('div');
  panel.className = 'ura-proxy-panel';
  panel.innerHTML = `
    <div class="ura-proxy-panel-header">
      <span>URA Proxy 请求面板</span>
      <span>
        <button class="ura-proxy-panel-toggle" title="收起/展开">»</button>
        <button class="ura-proxy-panel-close" title="关闭面板">×</button>
      </span>
    </div>
    <div class="ura-proxy-panel-search">
      <input type="text" placeholder="搜索URL/内容..." />
    </div>
    <div class="ura-proxy-panel-body">
      <div class="ura-proxy-panel-loglist"></div>
    </div>
    <div class="ura-proxy-panel-footer">
      <span class="ura-proxy-panel-count">日志: 0</span>
      <button class="ura-proxy-panel-clear">清空日志</button>
    </div>
  `;
  shadow.appendChild(panel);

  // 拖拽收起/展开
  const toggleBtn = panel.querySelector('.ura-proxy-panel-toggle');
  const closeBtn = panel.querySelector('.ura-proxy-panel-close');
  let collapsed = false;
  
  toggleBtn.onclick = function() {
    collapsed = !collapsed;
    if (collapsed) {
      panelHost.classList.add('ura-proxy-panel-collapsed');
      toggleBtn.textContent = '«';
      adjustPageLayout(false);
    } else {
      panelHost.classList.remove('ura-proxy-panel-collapsed');
      toggleBtn.textContent = '»';
      adjustPageLayout(true);
    }
  };

  // 关闭面板
  closeBtn.onclick = function() {
    adjustPageLayout(false);
    clearInterval(refreshInterval);
    panelHost.remove();
    window.__URA_PROXY_PANEL__ = false;
  };

  // 拖拽面板（仅上下）
  let isDragging = false, dragStartY = 0, dragStartTop = 0;
  const header = panel.querySelector('.ura-proxy-panel-header');
  header.addEventListener('mousedown', function(e) {
    isDragging = true;
    dragStartY = e.clientY;
    dragStartTop = panelHost.offsetTop;
    document.body.style.userSelect = 'none';
  });
  window.addEventListener('mousemove', function(e) {
    if (isDragging) {
      let newTop = dragStartTop + (e.clientY - dragStartY);
      newTop = Math.max(0, Math.min(window.innerHeight - 100, newTop));
      panelHost.style.top = newTop + 'px';
    }
  });
  window.addEventListener('mouseup', function() {
    isDragging = false;
    document.body.style.userSelect = '';
  });

  // 日志渲染与交互
  const logList = panel.querySelector('.ura-proxy-panel-loglist');
  const searchInput = panel.querySelector('.ura-proxy-panel-search input');
  const countSpan = panel.querySelector('.ura-proxy-panel-count');
  const clearBtn = panel.querySelector('.ura-proxy-panel-clear');

  let logs = [];
  let searchTerm = '';

  function renderLogs() {
    let filtered = logs;
    if (searchTerm) {
      filtered = logs.filter(log =>
        log.url.toLowerCase().includes(searchTerm) ||
        log.method.toLowerCase().includes(searchTerm) ||
        (log.requestBody && log.requestBody.toLowerCase().includes(searchTerm)) ||
        (log.responseBody && log.responseBody.toLowerCase().includes(searchTerm))
      );
    }
    
    countSpan.textContent = `日志: ${filtered.length}`;
    
    if (filtered.length === 0) {
      logList.innerHTML = `
        <div class="ura-proxy-panel-empty">
          📋 暂无请求日志<br>
          <small>启用拦截功能后，符合条件的请求将显示在这里</small>
        </div>
      `;
      return;
    }
    
    logList.innerHTML = filtered.map((log, idx) => {
      const statusClass = log.status >= 200 && log.status < 300 ? 'log-status-success' :
        log.status >= 400 ? 'log-status-danger' : 'log-status-warning';
      const timestamp = new Date(log.timestamp).toLocaleString();
      const urlDisplay = log.url.length > 50 ? log.url.substring(0, 50) + '...' : log.url;
      
      return `
        <div class="ura-proxy-panel-logitem">
          <div class="log-header">
            <div style="flex: 1; overflow: hidden;">
              <span class="log-method">${log.method}</span>
              <span class="log-status ${statusClass}">${log.status}</span>
              <div class="log-url" title="${log.url}">${urlDisplay}</div>
              <div style="font-size: 11px; color: #666; margin-top: 2px;">${timestamp}</div>
            </div>
            <div class="log-actions">
              <button data-idx="${idx}" class="log-copy">📋</button>
              <button data-idx="${idx}" class="log-toggle">👁️</button>
            </div>
          </div>
          <div class="log-details" id="ura-proxy-log-details-${idx}" style="display: none;">
            <div style="margin: 8px 0;"><strong>URL:</strong> ${log.url}</div>
            <div style="margin: 8px 0;"><strong>Content-Type:</strong> ${log.contentType || '未知'}</div>
            <div style="margin: 8px 0;"><strong>请求体:</strong><pre style="background: #f5f5f5; padding: 8px; border-radius: 3px; white-space: pre-wrap; font-size: 11px; max-height: 100px; overflow-y: auto;">${log.requestBody || '无'}</pre></div>
            <div style="margin: 8px 0;"><strong>响应体:</strong><pre style="background: #f5f5f5; padding: 8px; border-radius: 3px; white-space: pre-wrap; font-size: 11px; max-height: 150px; overflow-y: auto;">${log.responseBody || '无'}</pre></div>
          </div>
        </div>
      `;
    }).join('');
    
    // 绑定事件
    logList.querySelectorAll('.log-copy').forEach(btn => {
      btn.onclick = function() {
        const idx = parseInt(btn.getAttribute('data-idx'));
        const log = filtered[idx];
        const text = `=== HTTP 请求日志 ===\n时间: ${new Date(log.timestamp).toLocaleString()}\n方法: ${log.method}\n状态: ${log.status}\nURL: ${log.url}\nContent-Type: ${log.contentType || '未知'}\n\n=== 请求头 ===\n${JSON.stringify(log.requestHeaders || {}, null, 2)}\n\n=== 请求体 ===\n${log.requestBody || '无'}\n\n=== 响应头 ===\n${JSON.stringify(log.responseHeaders || {}, null, 2)}\n\n=== 响应体 ===\n${log.responseBody || '无'}`;
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = '✅';
          setTimeout(() => btn.textContent = '📋', 1000);
        });
      };
    });
    
    logList.querySelectorAll('.log-toggle').forEach(btn => {
      btn.onclick = function() {
        const idx = btn.getAttribute('data-idx');
        const details = logList.querySelector(`#ura-proxy-log-details-${idx}`);
        if (details) {
          const isVisible = details.style.display !== 'none';
          details.style.display = isVisible ? 'none' : 'block';
          btn.textContent = isVisible ? '👁️' : '🙈';
        }
      };
    });
  }

  searchInput.addEventListener('input', function() {
    searchTerm = searchInput.value.trim().toLowerCase();
    renderLogs();
  });

  clearBtn.onclick = function() {
    if (confirm('确定要清空所有请求日志吗？')) {
      logs = [];
      renderLogs();
      chrome.runtime.sendMessage({ type: 'CLEAR_REQUEST_LOGS' }).catch(() => {
        console.warn('清空日志消息发送失败');
      });
    }
  };

  // 从多个源获取日志数据
  function fetchLogs() {
    // 尝试从 background script 获取
    chrome.runtime.sendMessage({ type: 'GET_REQUEST_LOGS' }).then(resp => {
      if (resp && Array.isArray(resp.logs)) {
        logs = resp.logs;
        renderLogs();
        console.log('📋 从后台脚本获取日志:', logs.length, '条');
        return;
      }
      // 如果 background script 没有返回，尝试从本地存储获取
      return fetchLogsFromStorage();
    }).catch((error) => {
      console.warn('从后台脚本获取日志失败:', error);
      // 如果消息发送失败，从本地存储获取
      fetchLogsFromStorage();
    });
  }

  // 从本地存储获取日志
  function fetchLogsFromStorage() {
    try {
      chrome.storage.local.get(['ura-proxy-request-logs']).then(result => {
        if (result['ura-proxy-request-logs']) {
          logs = result['ura-proxy-request-logs'];
          renderLogs();
          console.log('📋 从本地存储获取日志:', logs.length, '条');
        } else {
          // 显示提示信息
          logs = [];
          renderLogs();
          console.log('📋 无日志数据');
        }
      }).catch(() => {
        // 兼容性：尝试从 localStorage 获取
        const stored = localStorage.getItem('ura-proxy-request-logs');
        if (stored) {
          logs = JSON.parse(stored);
          renderLogs();
          console.log('📋 从localStorage获取日志:', logs.length, '条');
        } else {
          logs = [];
          renderLogs();
          console.log('📋 无日志数据');
        }
      });
    } catch (error) {
      console.error('从本地存储获取日志失败:', error);
      logs = [];
      renderLogs();
    }
  }

  // 初始获取日志
  fetchLogs();
  
  // 定时刷新日志
  const refreshInterval = setInterval(fetchLogs, 3000);

  // 支持 background 推送新日志
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'NEW_REQUEST_LOG') {
      logs.unshift(msg.log);
      if (logs.length > 200) logs = logs.slice(0, 200);
      renderLogs();
    }
  });

  // 支持 ESC 快捷键收起/展开
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') toggleBtn.click();
  });
})();
