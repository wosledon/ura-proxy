// popup.js - 处理插件弹窗的交互逻辑

document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggleBtn');
  const statusText = document.getElementById('statusText');
  const statusIndicator = document.getElementById('statusIndicator');
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  const clearCacheBtn = document.getElementById('clearCacheBtn');
  const openRequestPanelBtn = document.getElementById('openRequestPanelBtn');
  const openDiagnosticBtn = document.getElementById('openDiagnosticBtn');
  const refreshRulesBtn = document.getElementById('refreshRulesBtn');
  
  let isEnabled = true;
  let currentRules = []; // 存储当前规则
  
  // 初始化状态
  loadState();
  loadAndDisplayRules(); // 加载并显示规则
  
  // 切换重定向开关
  toggleBtn.addEventListener('click', function() {
    isEnabled = !isEnabled;
    updateUI();
    saveState();
    
    // 这里应该通知background script更新规则状态
    chrome.runtime.sendMessage({
      action: 'toggleRedirect',
      enabled: isEnabled
    });
  });
  
  // 打开配置说明页面
  openOptionsBtn.addEventListener('click', function() {
    // 打开配置说明页面
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html')
    });
  });
  
  // 清除浏览器缓存
  clearCacheBtn.addEventListener('click', function() {
    chrome.browsingData.removeCache({}, function() {
      // 显示成功提示
      const btn = document.getElementById('clearCacheBtn');
      const originalText = btn.textContent;
      btn.textContent = '✅ 已清除';
      btn.style.background = '#4CAF50';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '#2196F3';
      }, 1500);
    });
  });
  
  // 开启右侧请求面板
  openRequestPanelBtn.disabled = true;
  openRequestPanelBtn.style.opacity = 0.5;
  openRequestPanelBtn.title = '该功能已禁用';
  // openRequestPanelBtn.addEventListener('click', ...); // 事件禁用

  // 开启诊断工具
  openDiagnosticBtn.disabled = true;
  openDiagnosticBtn.style.opacity = 0.5;
  openDiagnosticBtn.title = '该功能已禁用';
  // openDiagnosticBtn.addEventListener('click', ...); // 事件禁用

  // 刷新规则
  if (refreshRulesBtn) {
    refreshRulesBtn.addEventListener('click', function() {
      loadAndDisplayRules();
    });
  }
  
  // 更新UI状态
  function updateUI() {
    if (isEnabled) {
      statusText.textContent = '重定向已启用';
      statusIndicator.className = 'status-indicator status-enabled';
      toggleBtn.textContent = '禁用';
      toggleBtn.className = 'btn-danger';
    } else {
      statusText.textContent = '重定向已禁用';
      statusIndicator.className = 'status-indicator status-disabled';
      toggleBtn.textContent = '启用';
      toggleBtn.className = 'btn-success';
    }
  }
  
  // 保存状态到本地存储
  function saveState() {
    chrome.storage.local.set({ 'redirectEnabled': isEnabled });
  }
  
  // 从本地存储加载状态
  function loadState() {
    chrome.storage.local.get(['redirectEnabled'], function(result) {
      if (result.redirectEnabled !== undefined) {
        isEnabled = result.redirectEnabled;
      }
      updateUI();
    });
  }
  
  // 显示按钮反馈
  function showButtonFeedback(button, message, color) {
    const originalText = button.textContent;
    const originalColor = button.style.background;
    
    button.textContent = message;
    button.style.background = color;
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = originalColor;
    }, 2000);
  }

  // 加载并显示规则
  function loadAndDisplayRules() {
    try {
      // 从localStorage加载规则
      const storedRules = localStorage.getItem('ura-proxy-rules');
      if (storedRules) {
        currentRules = JSON.parse(storedRules);
      } else {
        // 使用默认规则
        currentRules = getDefaultRules();
      }
      
      // 显示规则
      displayRules();
    } catch (error) {
      console.error('加载规则失败:', error);
      currentRules = getDefaultRules();
      displayRules();
    }
  }

  // 获取默认规则
  function getDefaultRules() {
    return [
      {
        "id": 1,
        "priority": 1,
        "enabled": true,
        "action": {
          "type": "redirect",
          "redirect": {
            "regexSubstitution": "http://localhost:8091\\1"
          }
        },
        "condition": {
          "regexFilter": "^https://your-api-domain\\.com(.*)",
          "resourceTypes": ["xmlhttprequest"]
        },
        "protoConversion": false
      },
      {
        "id": 2,
        "priority": 1,
        "enabled": true,
        "action": {
          "type": "redirect",
          "redirect": {
            "regexSubstitution": "http://localhost:3000\\1"
          }
        },
        "condition": {
          "regexFilter": "^https://api\\.example\\.com(.*)",
          "resourceTypes": ["xmlhttprequest"]
        },
        "protoConversion": false
      }
    ];
  }

  // 显示规则列表
  function displayRules() {
    const rulesContainer = document.querySelector('.rules');
    if (!rulesContainer) {
      console.error('未找到规则容器');
      return;
    }

    // 清空现有规则显示
    const existingRulesList = rulesContainer.querySelector('.rules-list');
    if (existingRulesList) {
      existingRulesList.remove();
    }

    // 过滤出已启用的规则
    const enabledRules = currentRules.filter(rule => rule.enabled !== false);
    
    // 创建规则列表容器
    const rulesList = document.createElement('div');
    rulesList.className = 'rules-list';

    if (enabledRules.length === 0) {
      rulesList.innerHTML = '<div class="no-rules">暂无启用的重定向规则<br><small>点击"⚙️ 配置规则"添加规则</small></div>';
      rulesContainer.appendChild(rulesList);
      return;
    }

    enabledRules.forEach((rule, index) => {
      const ruleDiv = document.createElement('div');
      ruleDiv.className = 'rule';
      
      // 解析规则URL
      const fromUrl = parseRegexToFriendlyUrl(rule.condition.regexFilter);
      const toUrl = parseSubstitutionToFriendlyUrl(rule.action.redirect.regexSubstitution);
      
      ruleDiv.innerHTML = `
        <div class="rule-from">From: ${fromUrl}</div>
        <div class="rule-to">To: ${toUrl}</div>
      `;
      
      rulesList.appendChild(ruleDiv);
    });

    rulesContainer.appendChild(rulesList);
  }

  // 将正则表达式转换为友好的URL显示
  function parseRegexToFriendlyUrl(regexFilter) {
    try {
      // 移除开头的^和结尾的(.*)
      let url = regexFilter.replace(/^\^/, '').replace(/\([^)]*\)$/, '');
      // 反转义特殊字符
      url = url.replace(/\\\./g, '.').replace(/\\\//g, '/');
      // 添加通配符
      if (regexFilter.includes('(.*)')) {
        url += '*';
      }
      return url;
    } catch (error) {
      return regexFilter;
    }
  }

  // 将替换字符串转换为友好的URL显示
  function parseSubstitutionToFriendlyUrl(substitution) {
    try {
      // 将\\1替换为*
      return substitution.replace(/\\1/g, '*');
    } catch (error) {
      return substitution;
    }
  }

  // 切换规则启用状态（全局函数，供HTML调用）
  window.toggleRule = function(ruleId) {
    const rule = currentRules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = !rule.enabled;
      
      // 保存到localStorage
      localStorage.setItem('ura-proxy-rules', JSON.stringify(currentRules));
      
      // 重新显示规则
      displayRules();
      
      // 通知后台脚本更新规则
      chrome.runtime.sendMessage({
        action: 'updateRules',
        rules: currentRules
      });
      
      console.log(`规则 ${ruleId} 已${rule.enabled ? '启用' : '禁用'}`);
    }
  };
});

// 监听来自background script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateStatus') {
    // 可以在这里更新UI状态
    console.log('Status updated:', request.data);
  }
});
