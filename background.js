// background.js - Service Worker 处理后台逻辑

console.log('API重定向插件已启动');

// 域名状态存储
function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// 获取当前激活标签页的域名
async function getCurrentTabDomain() {
  return new Promise((resolve) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        resolve(getDomainFromUrl(tabs[0].url));
      } else {
        resolve('');
      }
    });
  });
}

// 获取域名对应的重定向状态
async function getRedirectEnabledForDomain(domain) {
  const result = await chrome.storage.local.get(['redirectEnabledByDomain']);
  const map = result.redirectEnabledByDomain || {};
  return map[domain] !== undefined ? map[domain] : true;
}

// 设置域名对应的重定向状态
async function setRedirectEnabledForDomain(domain, enabled) {
  const result = await chrome.storage.local.get(['redirectEnabledByDomain']);
  const map = result.redirectEnabledByDomain || {};
  map[domain] = enabled;
  await chrome.storage.local.set({redirectEnabledByDomain: map});
}

// 设置扩展图标颜色
function updateIcon(enabled) {
  const color = enabled ? '#4CAF50' : '#BDBDBD';
  chrome.action.setIcon({
    path: {
      16: enabled ? 'icons/icon-16-green.png' : 'icons/icon-16-gray.png',
      32: enabled ? 'icons/icon-32-green.png' : 'icons/icon-32-gray.png',
      48: enabled ? 'icons/icon-48-green.png' : 'icons/icon-48-gray.png',
      128: enabled ? 'icons/icon-128-green.png' : 'icons/icon-128-gray.png',
    }
  });
  chrome.action.setBadgeText({text: enabled ? 'ON' : 'OFF'});
  chrome.action.setBadgeBackgroundColor({color});
}

// 恢复规则状态
async function restoreRuleState() {
  try {
    const result = await chrome.storage.local.get(['redirectEnabledByDomain', 'ura-proxy-intercept-config', 'ura-proxy-request-logs']);
    let domain = await getCurrentTabDomain();
    const map = result.redirectEnabledByDomain || {};
    const isEnabled = map[domain] !== undefined ? map[domain] : true;
    updateIcon(isEnabled);
    
    // 恢复请求拦截配置
    if (result['ura-proxy-intercept-config']) {
      requestInterceptConfig = JSON.parse(result['ura-proxy-intercept-config']);
      console.log('请求拦截配置已恢复:', requestInterceptConfig);
      
      if (requestInterceptConfig.enabled) {
        setupRequestInterception();
      }
    }
    
    // 恢复请求日志
    if (result['ura-proxy-request-logs']) {
      requestLogs = result['ura-proxy-request-logs'];
      console.log('请求日志已恢复:', requestLogs.length, '条');
    }
    
    if (isEnabled) {
      await enableRedirectRules();
    } else {
      await disableRedirectRules();
    }
    
    console.log('规则状态已恢复:', isEnabled ? '启用' : '禁用');
  } catch (error) {
    console.error('恢复规则状态失败:', error);
  }
}

// 立即恢复规则状态（Service Worker重启时）
restoreRuleState();

// 监听来自popup和options页面的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('收到消息:', request.type || request.action);
  
  if (request.action === 'toggleRedirect') {
    handleToggleRedirect(request.enabled);
    sendResponse({success: true});
  } else if (request.action === 'updateRules') {
    // 处理规则更新
    handleRulesUpdate(request.rules);
    sendResponse({success: true});
  } else if (request.type === 'PROTO_CONVERSION_CHANGED') {
    handleProtoConversionChange(request.enabled);
    sendResponse({success: true});
  } else if (request.type === 'REQUEST_INTERCEPT_CONFIG_CHANGED') {
    handleRequestInterceptConfigChange(request.config);
    sendResponse({success: true});
  } else if (request.type === 'GET_REQUEST_LOGS') {
    sendResponse({ logs: requestLogs });
  } else if (request.type === 'CLEAR_REQUEST_LOGS') {
    requestLogs = [];
    chrome.storage.local.remove('ura-proxy-request-logs');
    sendResponse({success: true});
  } else if (request.type === 'TOGGLE_LOGS_PAUSE') {
    isLogsPaused = request.paused;
    sendResponse({success: true});
  } else if (request.type === 'REQUEST_LOG_FROM_CONTENT') {
    handleRequestLog(request.log);
    sendResponse({success: true});
  } else if (request.type === 'OPEN_REQUEST_PANEL') {
    // 处理打开请求面板的请求
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          files: ['request-panel.js']
        }).then(() => {
          sendResponse({success: true});
        }).catch((error) => {
          sendResponse({success: false, error: error.message});
        });
      }
    });
  }
  
  return true; // 保持消息通道开放
});

// 处理重定向开关切换
async function handleToggleRedirect(enabled) {
  try {
    let domain = await getCurrentTabDomain();
    await setRedirectEnabledForDomain(domain, enabled);
    updateIcon(enabled);
    if (enabled) {
      // 启用重定向规则
      await enableRedirectRules();
      console.log('重定向规则已启用');
    } else {
      // 禁用重定向规则
      await disableRedirectRules();
      console.log('重定向规则已禁用');
    }
  } catch (error) {
    console.error('切换重定向规则失败:', error);
  }
}

// 启用重定向规则
async function enableRedirectRules() {
  try {
    // 启用规则集
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ['ruleset_1']
    });
    
    // 保存状态
    await chrome.storage.local.set({ 'redirectEnabled': true });
    console.log('重定向规则集已启用');
  } catch (error) {
    console.error('启用规则集失败:', error);
  }
}

// 禁用重定向规则
async function disableRedirectRules() {
  try {
    // 禁用规则集
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: ['ruleset_1']
    });
    
    // 保存状态
    await chrome.storage.local.set({ 'redirectEnabled': false });
    console.log('重定向规则集已禁用');
  } catch (error) {
    console.error('禁用规则集失败:', error);
  }
}

// 插件安装或启动时的初始化
chrome.runtime.onInstalled.addListener(async function(details) {
  if (details.reason === 'install') {
    console.log('API重定向插件已安装');
    // 设置默认状态为启用
    await chrome.storage.local.set({ 'redirectEnabled': true });
    await enableRedirectRules();
  }
});

// Service Worker启动时恢复规则状态
chrome.runtime.onStartup.addListener(async function() {
  console.log('插件启动，恢复规则状态');
  await restoreRuleState();
});

// 处理 protobuf 转换状态变更
async function handleProtoConversionChange(enabled) {
  try {
    console.log('Protobuf转换状态已变更:', enabled ? '启用' : '禁用');
    
    // 这里可以添加一些与protobuf转换相关的逻辑
    // 比如通知content script、设置拦截器等
    
    // 保存状态到存储（如果需要的话，已在options.js中处理）
    // await chrome.storage.local.set({ 'protoConversionEnabled': enabled });
    
    // 可以在这里添加更多的处理逻辑，比如：
    // 1. 通知所有打开的页面状态变更
    // 2. 设置请求拦截规则
    // 3. 初始化protobuf解析器等
    
  } catch (error) {
    console.error('处理Protobuf转换状态变更失败:', error);
  }
}

// ===== 请求拦截功能 =====

let requestInterceptConfig = {
  enabled: false,
  domainFilter: '',
  pathFilter: '',
  maxRecords: 100
};

let requestLogs = [];
let isLogsPaused = false;

// 处理请求拦截配置变更
async function handleRequestInterceptConfigChange(config) {
  try {
    requestInterceptConfig = config;
    console.log('请求拦截配置已更新:', config);
    
    if (config.enabled) {
      // 启用请求拦截
      setupRequestInterception();
    } else {
      // 禁用请求拦截
      cleanupRequestInterception();
    }
    
  } catch (error) {
    console.error('处理请求拦截配置变更失败:', error);
  }
}

// 设置请求拦截
function setupRequestInterception() {
  console.log('正在设置请求拦截...');
  
  // 先清理已有的内容脚本
  chrome.scripting.unregisterContentScripts({
    ids: ['request-interceptor']
  }).catch(() => {
    console.log('无需清理内容脚本');
  });
  
  // 注入内容脚本到所有页面
  chrome.scripting.registerContentScripts([{
    id: 'request-interceptor',
    matches: ['<all_urls>'],
    runAt: 'document_start',
    world: 'MAIN'
  }]).then(() => {
    console.log('✅ 请求拦截内容脚本注册成功');
  }).catch((error) => {
    console.error('❌ 内容脚本注册失败:', error);
  });
  
  // 立即注入到当前已打开的标签页
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          world: 'MAIN'
        }).catch(() => {
          console.log(`无法注入到标签页 ${tab.id}: ${tab.url}`);
        });
      }
    });
  });
}

// 清理请求拦截
function cleanupRequestInterception() {
  console.log('正在清理请求拦截...');
  
  // 取消注册内容脚本
  chrome.scripting.unregisterContentScripts({
    ids: ['request-interceptor']
  }).catch(() => {
    console.log('取消注册内容脚本失败或脚本未注册');
  });
}

// 处理来自内容脚本的请求日志
function handleRequestLog(log) {
  if (isLogsPaused || !requestInterceptConfig.enabled) {
    return;
  }
  
  try {
    // 应用过滤器
    if (requestInterceptConfig.domainFilter) {
      const url = new URL(log.url);
      if (!url.hostname.includes(requestInterceptConfig.domainFilter)) {
        return;
      }
    }
    
    if (requestInterceptConfig.pathFilter) {
      const url = new URL(log.url);
      const patterns = requestInterceptConfig.pathFilter.split(',').map(p => p.trim()).filter(p => p);
      if (patterns.length > 0) {
        const matchesPattern = patterns.some(pattern => {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
          return regex.test(url.pathname);
        });
        if (!matchesPattern) {
          return;
        }
      }
    }
    
    // 添加到日志列表
    const newLog = {
      ...log,
      timestamp: Date.now(),
      id: Date.now() + Math.random()
    };
    
    requestLogs.unshift(newLog);
    
    // 限制日志数量
    if (requestLogs.length > requestInterceptConfig.maxRecords) {
      requestLogs = requestLogs.slice(0, requestInterceptConfig.maxRecords);
    }
    
    // 保存到本地存储
    chrome.storage.local.set({
      'ura-proxy-request-logs': requestLogs
    }).catch(() => {
      console.warn('保存请求日志到存储失败');
    });
    
    // 通知所有监听页面
    chrome.runtime.sendMessage({
      type: 'NEW_REQUEST_LOG',
      log: newLog
    }).catch(() => {
      // 忽略发送失败（可能没有页面在监听）
    });
    
    console.log('📋 新请求日志:', log.method, log.url, log.status);
    
  } catch (error) {
    console.error('处理请求日志失败:', error);
  }
}

// 处理规则更新
async function handleRulesUpdate(rules) {
  try {
    console.log('更新规则:', rules.length, '条');
    
    // 保存规则到存储
    await chrome.storage.local.set({ 'ura-proxy-rules': JSON.stringify(rules) });
    
    // 过滤出启用的规则
    const enabledRules = rules.filter(rule => rule.enabled !== false);
    console.log('启用的规则:', enabledRules.length, '条');
    
    // 如果有启用的规则且重定向功能开启，则应用规则
    const result = await chrome.storage.local.get(['redirectEnabled']);
    const redirectEnabled = result.redirectEnabled !== undefined ? result.redirectEnabled : true;
    
    if (redirectEnabled && enabledRules.length > 0) {
      // 重新启用规则以应用更改
      await disableRedirectRules();
      await enableRedirectRules();
      console.log('规则已更新并重新应用');
    } else if (redirectEnabled && enabledRules.length === 0) {
      // 如果没有启用的规则，禁用重定向
      await disableRedirectRules();
      console.log('没有启用的规则，已禁用重定向');
    }
    
  } catch (error) {
    console.error('处理规则更新失败:', error);
  }
}

// 定期清理和维护
setInterval(() => {
  // 这里可以添加定期维护逻辑
  // 比如清理过期的缓存、统计使用情况等
}, 60000); // 每分钟执行一次

// 监听标签切换，动态更新图标
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    if (tab && tab.url) {
      const domain = getDomainFromUrl(tab.url);
      const enabled = await getRedirectEnabledForDomain(domain);
      updateIcon(enabled);
    }
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab.active && tab.url) {
    const domain = getDomainFromUrl(tab.url);
    const enabled = await getRedirectEnabledForDomain(domain);
    updateIcon(enabled);
  }
});
