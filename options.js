// options.js - 配置页面的交互逻辑

let currentRules = [];
let currentMappings = [];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
  try {
    initializeInterceptConfig(); // 新增：初始化拦截配置
    loadRulesFromStorage();
    loadMappingsFromStorage();
    loadInterceptConfig();
    renderRulesList();
    renderMappingsList();
    loadJsonFromStorage();
    checkExtensionStatus();
    loadProtoConversionStatus();
    setupEventListeners();
    showAlert('配置页面加载完成！当前有 ' + currentRules.length + ' 条规则，' + currentMappings.length + ' 个接口映射。', 'success');
  } catch (error) {
    showAlert('页面初始化失败: ' + error.message, 'danger');
    console.error('Options page initialization error:', error);
  }
});

// 设置事件监听器
function setupEventListeners() {
  // 刷新状态按钮
  const refreshStatusBtn = document.getElementById('refreshStatusBtn');
  if (refreshStatusBtn) {
    refreshStatusBtn.addEventListener('click', checkExtensionStatus);
  }
  
  // protobuf转换相关事件
  const enableProtoConversion = document.getElementById('enableProtoConversion');
  const refreshProtoStatusBtn = document.getElementById('refreshProtoStatusBtn');
  
  if (enableProtoConversion) {
    enableProtoConversion.addEventListener('change', toggleProtoConversion);
  }
  if (refreshProtoStatusBtn) {
    refreshProtoStatusBtn.addEventListener('click', loadProtoConversionStatus);
  }
  
  // 标签页切换
  const visualTabBtn = document.getElementById('visualTabBtn');
  const apiMappingTabBtn = document.getElementById('apiMappingTabBtn');
  const requestInterceptTabBtn = document.getElementById('requestInterceptTabBtn');
  const jsonTabBtn = document.getElementById('jsonTabBtn');
  const helpTabBtn = document.getElementById('helpTabBtn');
  
  if (visualTabBtn) {
    visualTabBtn.addEventListener('click', () => switchTab('visual'));
  }
  if (apiMappingTabBtn) {
    apiMappingTabBtn.addEventListener('click', () => switchTab('apiMapping'));
  }
  if (requestInterceptTabBtn) {
    requestInterceptTabBtn.addEventListener('click', () => switchTab('requestIntercept'));
  }
  if (jsonTabBtn) {
    jsonTabBtn.addEventListener('click', () => switchTab('json'));
  }
  if (helpTabBtn) {
    helpTabBtn.addEventListener('click', () => switchTab('help'));
  }
  
  // 快速添加规则按钮
  const addQuickRuleBtn = document.getElementById('addQuickRuleBtn');
  if (addQuickRuleBtn) {
    addQuickRuleBtn.addEventListener('click', addQuickRule);
  }
  
  // 接口映射相关按钮
  const addMappingBtn = document.getElementById('addMappingBtn');
  const saveMappingsBtn = document.getElementById('saveMappingsBtn');
  const exportMappingsBtn = document.getElementById('exportMappingsBtn');
  const clearAllMappingsBtn = document.getElementById('clearAllMappingsBtn');
  
  if (addMappingBtn) {
    addMappingBtn.addEventListener('click', addApiMapping);
  }
  if (saveMappingsBtn) {
    saveMappingsBtn.addEventListener('click', saveMappings);
  }
  if (exportMappingsBtn) {
    exportMappingsBtn.addEventListener('click', exportMappings);
  }
  if (clearAllMappingsBtn) {
    clearAllMappingsBtn.addEventListener('click', clearAllMappings);
  }
  
  // 请求拦截相关按钮
  const enableRequestIntercept = document.getElementById('enableRequestIntercept');
  const saveInterceptConfigBtn = document.getElementById('saveInterceptConfigBtn');
  const clearInterceptLogsBtn = document.getElementById('clearInterceptLogsBtn');
  const exportInterceptLogsBtn = document.getElementById('exportInterceptLogsBtn');
  const refreshLogsBtn = document.getElementById('refreshLogsBtn');
  const pauseLogsBtn = document.getElementById('pauseLogsBtn');
  const logSearchFilter = document.getElementById('logSearchFilter');
  
  if (enableRequestIntercept) {
    enableRequestIntercept.addEventListener('change', toggleRequestIntercept);
  }
  if (saveInterceptConfigBtn) {
    saveInterceptConfigBtn.addEventListener('click', saveInterceptConfig);
  }
  if (clearInterceptLogsBtn) {
    clearInterceptLogsBtn.addEventListener('click', clearInterceptLogs);
  }
  if (exportInterceptLogsBtn) {
    exportInterceptLogsBtn.addEventListener('click', exportInterceptLogs);
  }
  if (refreshLogsBtn) {
    refreshLogsBtn.addEventListener('click', refreshRequestLogs);
  }
  if (pauseLogsBtn) {
    pauseLogsBtn.addEventListener('click', toggleLogsPause);
  }
  if (logSearchFilter) {
    logSearchFilter.addEventListener('input', filterRequestLogs);
  }
  
  // 规则管理按钮
  const saveRulesBtn = document.getElementById('saveRulesBtn');
  const exportRulesBtn = document.getElementById('exportRulesBtn');
  const previewMergedRulesBtn = document.getElementById('previewMergedRulesBtn');
  const loadDefaultRulesBtn = document.getElementById('loadDefaultRulesBtn');
  const clearAllRulesBtn = document.getElementById('clearAllRulesBtn');
  
  if (saveRulesBtn) {
    saveRulesBtn.addEventListener('click', saveRules);
  }
  if (exportRulesBtn) {
    exportRulesBtn.addEventListener('click', exportToRulesJson);
  }
  if (previewMergedRulesBtn) {
    previewMergedRulesBtn.addEventListener('click', previewMergedRules);
  }
  if (loadDefaultRulesBtn) {
    loadDefaultRulesBtn.addEventListener('click', loadDefaultRules);
  }
  if (clearAllRulesBtn) {
    clearAllRulesBtn.addEventListener('click', clearAllRules);
  }
  
  // JSON编辑按钮
  const saveJsonRulesBtn = document.getElementById('saveJsonRulesBtn');
  const formatJsonBtn = document.getElementById('formatJsonBtn');
  const validateJsonBtn = document.getElementById('validateJsonBtn');
  const loadJsonBtn = document.getElementById('loadJsonBtn');
  
  if (saveJsonRulesBtn) {
    saveJsonRulesBtn.addEventListener('click', saveJsonRules);
  }
  if (formatJsonBtn) {
    formatJsonBtn.addEventListener('click', formatJson);
  }
  if (validateJsonBtn) {
    validateJsonBtn.addEventListener('click', validateJson);
  }
  if (loadJsonBtn) {
    loadJsonBtn.addEventListener('click', loadJsonFromStorage);
  }
  
  // ====== 开启右侧请求面板按钮 ======
  const openPanelBtn = document.getElementById('openRequestPanelBtn');
  if (openPanelBtn) {
    openPanelBtn.addEventListener('click', injectRequestPanel);
  }
  
  // 动态按钮事件委托
  ensureDynamicEventListeners();
}

// 设置动态按钮的事件委托（已废弃，使用ensureDynamicEventListeners）
function setupDynamicEventListeners() {
  ensureDynamicEventListeners();
}

// 切换标签页
function switchTab(tabName) {
  console.log('正在切换到标签页:', tabName);
  
  // 隐藏所有标签页内容
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // 移除所有标签的active状态
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // 显示选中的标签页
  const targetTab = document.getElementById(tabName + 'Tab');
  if (targetTab) {
    targetTab.classList.add('active');
    console.log('已激活标签页内容:', tabName + 'Tab');
  } else {
    console.error('找不到标签页内容:', tabName + 'Tab');
  }
  
  // 激活选中的标签
  let activeTabId = '';
  if (tabName === 'visual') {
    activeTabId = 'visualTabBtn';
  } else if (tabName === 'apiMapping') {
    activeTabId = 'apiMappingTabBtn';
  } else if (tabName === 'requestIntercept') {
    activeTabId = 'requestInterceptTabBtn';
  } else if (tabName === 'json') {
    activeTabId = 'jsonTabBtn';
  } else if (tabName === 'help') {
    activeTabId = 'helpTabBtn';
  }
  
  const activeTab = document.getElementById(activeTabId);
  if (activeTab) {
    activeTab.classList.add('active');
    console.log('已激活标签按钮:', activeTabId);
  } else {
    console.error('找不到标签按钮:', activeTabId);
  }
  
  // 根据切换的标签页执行相应的初始化
  if (tabName === 'visual') {
    // 切换到可视化编辑页面时，重新渲染规则列表
    console.log('正在重新渲染规则列表...');
    renderRulesList();
    checkExtensionStatus();
    showAlert('已切换到可视化编辑页面，规则列表已刷新', 'success');
  } else if (tabName === 'apiMapping') {
    // 切换到接口映射页面
    console.log('正在重新渲染接口映射列表...');
    renderMappingsList();
    showAlert('已切换到接口映射页面', 'success');
  } else if (tabName === 'requestIntercept') {
    // 切换到请求拦截页面
    console.log('正在加载请求拦截配置...');
    loadInterceptConfig();
    refreshRequestLogs();
    showAlert('已切换到请求解析页面', 'success');
  } else if (tabName === 'json') {
    // 切换到JSON标签页，同步最新数据
    console.log('正在加载JSON数据...');
    loadJsonFromStorage();
    showAlert('已切换到JSON编辑页面', 'info');
  } else if (tabName === 'help') {
    showAlert('已切换到帮助说明页面', 'info');
  }
  // help标签页不需要特殊处理
}

// 从localStorage加载规则
function loadRulesFromStorage() {
  try {
    const storedRules = localStorage.getItem('ura-proxy-rules');
    if (storedRules) {
      currentRules = JSON.parse(storedRules);
      
      // 确保所有规则都有enabled字段，默认为true
      currentRules.forEach(rule => {
        if (rule.enabled === undefined) {
          rule.enabled = true;
        }
      });
      
      // 保存更新后的规则
      saveRulesToStorage();
    } else {
      // 如果没有存储的规则，使用默认规则
      currentRules = getDefaultRules();
      saveRulesToStorage();
    }
  } catch (error) {
    console.error('加载规则失败:', error);
    showAlert('加载规则失败: ' + error.message, 'danger');
    currentRules = getDefaultRules();
  }
}

// 保存规则到localStorage
function saveRulesToStorage() {
  try {
    localStorage.setItem('ura-proxy-rules', JSON.stringify(currentRules, null, 2));
    
    showAlert('规则已保存到本地存储！重新加载扩展后生效。', 'success');
  } catch (error) {
    console.error('保存规则失败:', error);
    showAlert('保存规则失败: ' + error.message, 'danger');
  }
}

// 获取默认规则
function getDefaultRules() {
  return [
    {
      "id": 1,
      "priority": 1,
      "enabled": true,  // 新增启用状态
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
      "enabled": true,  // 新增启用状态
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

// 渲染规则列表
function renderRulesList() {
  const container = document.getElementById('rulesList');
  const statusContainer = document.getElementById('rulesStatus');
  
  if (!container) return;
  
  // 更新状态提示
  if (statusContainer) {
    statusContainer.style.display = 'block';
    statusContainer.textContent = `刷新规则列表...（当前 ${currentRules.length} 条规则）`;
    statusContainer.className = 'alert alert-info';
  }
  
  if (currentRules.length === 0) {
    container.innerHTML = '<div class="alert alert-info">暂无重定向规则。使用上方快速添加功能创建第一个规则。</div>';
    
    // 隐藏状态提示
    if (statusContainer) {
      statusContainer.style.display = 'none';
    }
    return;
  }
  
  container.innerHTML = currentRules.map((rule, index) => {
    const regexFilter = rule.condition.regexFilter;
    const targetUrl = rule.action.redirect.regexSubstitution;
    const hasProtoConversion = rule.protoConversion || false;
    
    // 解析规则显示友好的格式
    let sourceDisplay = regexFilter;
    let targetDisplay = targetUrl;
    
    try {
      // 处理源地址显示格式 - 更全面的转义符处理
      sourceDisplay = regexFilter
        .replace(/^\^/, '')                      // 移除开头的 ^
        .replace(/\$$/g, '')                     // 移除结尾的 $
        .replace(/https?:\\\\/, 'https://')      // 处理 https:\\ 为 https://
        .replace(/\\\\\./g, '.')                 // 将 \\. 替换为 .
        .replace(/\\\\\//g, '/')                 // 将 \\/ 替换为 /
        .replace(/\\\./g, '.')                   // 将 \. 替换为 .
        .replace(/\\\//g, '/')                   // 将 \/ 替换为 /
        .replace(/\(\.\*\)/g, '*')               // 将 (.*) 替换为 *
        .replace(/\.\*/g, '*')                   // 将 .* 替换为 *
        .replace(/\\\\/g, '\\');                 // 处理多余的反斜杠
      
      // 处理目标地址显示格式 - 更全面的转义符处理
      targetDisplay = targetUrl
        .replace(/\\\\(\d+)/g, '{{路径$1}}')        // 将 \\1 替换为 {路径1}
        .replace(/\\(\d+)/g, '{{路径$1}}')          // 将 \1 曫替换为 {路径1}
        .replace(/\\\\\//g, '/')                 // 将 \\/ 替换为 /
        .replace(/\\\//g, '/')                   // 将 \/ 曫替换为 /
        .replace(/\\\\/g, '\\');                 // 处理多余的反斜杠
        
    } catch (e) {
      // 解析失败时使用原始格式
      console.warn('规则格式化失败:', e);
    }
    
    // 构建 protobuf 转换标识
    const protoConversionBadge = hasProtoConversion 
      ? '<span style="background: #ff9800; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-left: 8px;">Protobuf转换</span>' 
      : '';
    
    return `
      <div class="rule-item ${rule.enabled === false ? 'rule-disabled' : ''}">
        <div class="rule-header">
          <div class="rule-title">
            <span class="toggle-text">规则 ${rule.id}</span>
            ${protoConversionBadge}
          </div>
          <div class="rule-actions">
            <button class="btn-warning edit-rule-btn" data-index="${index}">编辑</button>
            <button class="btn-danger delete-rule-btn" data-index="${index}">删除</button>
            <div class="rule-toggle">
              <label class="toggle-switch">
                <input type="checkbox" ${rule.enabled !== false ? 'checked' : ''} 
                       data-index="${index}" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="rule-details">
          <strong>从:</strong> ${sourceDisplay}<br>
          <strong>到:</strong> ${targetDisplay}<br>
          <strong>优先级:</strong> ${rule.priority} | <strong>类型:</strong> ${rule.condition.resourceTypes.join(', ')}}
          ${hasProtoConversion ? '<br><strong>协议转换:</strong> <span style="color: #ff9800;">✓ Protobuf → JSON</span>' : ''}
        </div>
      </div>
    `;
  }).join('');
  
  // 确保事件监听器正确设置
  ensureDynamicEventListeners();
  
  // 更新状态提示为成功
  if (statusContainer) {
    statusContainer.style.display = 'block';
    statusContainer.textContent = `✅ 规则列表已更新！当前共有 ${currentRules.length} 条重定向规则`;
    statusContainer.className = 'alert alert-success';
    
    // 3秒后隐藏状态提示
    setTimeout(() => {
      statusContainer.style.display = 'none';
    }, 3000);
  }
}

// 切换规则启用状态
function toggleRuleEnabled(index) {
  if (index >= 0 && index < currentRules.length) {
    const rule = currentRules[index];
    rule.enabled = !rule.enabled;
    
    // 保存到存储
    saveRulesToStorage();
    
    // 重新渲染列表
    renderRulesList();
    
    // 通知后台脚本
    chrome.runtime.sendMessage({
      action: 'updateRules',
      rules: currentRules
    }).catch(() => {
      console.warn('无法通知后台脚本规则变更');
    });
    
    const status = rule.enabled ? '启用' : '禁用';
    showAlert(`规则 ${rule.id} 已${status}`, 'success');
  }
}

// 全局暴露函数供HTML调用
window.toggleRuleEnabled = toggleRuleEnabled;

// 事件委托：处理规则开关切换
function ensureDynamicEventListeners() {
  const rulesList = document.getElementById('rulesList');
  if (!rulesList) return;

  // 移除旧的事件监听器（如果存在）
  const oldHandler = rulesList._clickHandler;
  if (oldHandler) {
    rulesList.removeEventListener('click', oldHandler);
  }

  // 新的事件处理器
  const newHandler = function(event) {
    if (event.target.classList.contains('edit-rule-btn')) {
      const index = parseInt(event.target.dataset.index);
      editRule(index);
    } else if (event.target.classList.contains('delete-rule-btn')) {
      const index = parseInt(event.target.dataset.index);
      deleteRule(index);
    } else if (event.target.matches('.rule-toggle input[type="checkbox"]')) {
      const index = parseInt(event.target.getAttribute('data-index'));
      toggleRuleEnabled(index);
    }
  };

  rulesList.addEventListener('click', newHandler);
  rulesList._clickHandler = newHandler;
}

// 快速添加规则
function addQuickRule() {
  try {
    const domain = document.getElementById('quickDomain').value.trim();
    const path = document.getElementById('quickPath').value.trim();
    const port = document.getElementById('quickPort').value.trim();
    const enableProtoConversion = document.getElementById('quickRuleProtoConversion').checked;
    
    if (!domain || !port) {
      showAlert('请填写域名和端口号', 'danger');
      return;
    }
    
    // 生成新的规则ID
    const newId = Math.max(...currentRules.map(r => r.id), 0) + 1;
    
    // 构建正则表达式
    const escapedDomain = domain.replace(/\./g, '\\\\.');
    const pathPart = path ? path.replace(/\//g, '\\/') : '';
    const regexFilter = `^https://${escapedDomain}${pathPart}(.*)`;
    
    // 构建目标地址
    const regexSubstitution = `http://localhost:${port}\\1`;
    
    const newRule = {
      "id": newId,
      "priority": 1,
      "enabled": true,  // 新规则默认启用
      "action": {
        "type": "redirect",
        "redirect": {
          "regexSubstitution": regexSubstitution
        }
      },
      "condition": {
        "regexFilter": regexFilter,
        "resourceTypes": ["xmlhttprequest"]
      },
      // 添加 protobuf 转换标记
      "protoConversion": enableProtoConversion
    };
    
    currentRules.push(newRule);
    renderRulesList();
    saveRulesToStorage();
    
    // 清空输入框
    document.getElementById('quickDomain').value = '';
    document.getElementById('quickPath').value = '';
    document.getElementById('quickPort').value = '3000';
    document.getElementById('quickRuleProtoConversion').checked = false;
    
    const conversionNote = enableProtoConversion ? ' (启用Protobuf转换)' : '';
    showAlert(`新规则已添加：${domain}${path} → localhost:${port}${conversionNote}`, 'success');
  } catch (error) {
    showAlert('添加规则失败: ' + error.message, 'danger');
    console.error('Add rule error:', error);
  }
}

// 编辑规则
function editRule(index) {
  const rule = currentRules[index];
  const newRegex = prompt('编辑正则表达式:', rule.condition.regexFilter);
  if (newRegex === null) return;
  
  const newTarget = prompt('编辑目标地址:', rule.action.redirect.regexSubstitution);
  if (newTarget === null) return;
  
  const newPriority = prompt('编辑优先级:', rule.priority);
  if (newPriority === null) return;
  
  // 编辑 protobuf 转换设置
  const currentProtoConversion = rule.protoConversion || false;
  const protoConversionAnswer = prompt(
    '是否启用 Protobuf → JSON 转换？\n(输入 "yes" 或 "y" 启用，其他为禁用)', 
    currentProtoConversion ? 'yes' : 'no'
  );
  if (protoConversionAnswer === null) return;
  
  const enableProtoConversion = protoConversionAnswer.toLowerCase() === 'yes' || protoConversionAnswer.toLowerCase() === 'y';
  
  try {
    currentRules[index].condition.regexFilter = newRegex;
    currentRules[index].action.redirect.regexSubstitution = newTarget;
    currentRules[index].priority = parseInt(newPriority) || 1;
    currentRules[index].protoConversion = enableProtoConversion;
    
    renderRulesList();
    saveRulesToStorage();
    
    const conversionNote = enableProtoConversion ? ' (已启用Protobuf转换)' : ' (已禁用Protobuf转换)';
    showAlert('规则已更新' + conversionNote, 'success');
  } catch (error) {
    showAlert('更新规则失败: ' + error.message, 'danger');
  }
}

// 删除规则
function deleteRule(index) {
  if (confirm('确定要删除这个规则吗？')) {
    currentRules.splice(index, 1);
    renderRulesList();
    saveRulesToStorage();
    showAlert('规则已删除', 'success');
  }
}

// 保存所有规则
function saveRules() {
  saveRulesToStorage();
}

// 导出规则到rules.json文件
function exportToRulesJson() {
  exportMergedRulesJson();
}

// 恢复默认规则
function loadDefaultRules() {
  if (confirm('确定要恢复默认规则吗？这将覆盖所有当前规则。')) {
    currentRules = getDefaultRules();
    renderRulesList();
    saveRulesToStorage();
    showAlert('已恢复默认规则', 'success');
  }
}

// 清空所有规则
function clearAllRules() {
  if (confirm('确定要清空所有规则吗？这个操作不可撤销。')) {
    currentRules = [];
    renderRulesList();
    saveRulesToStorage();
    showAlert('所有规则已清空', 'success');
  }
}

// JSON编辑器相关功能
function loadJsonFromStorage() {
  const jsonEditor = document.getElementById('jsonEditor');
  if (jsonEditor) {
    const mergedRules = getMergedRules();
    jsonEditor.value = JSON.stringify(mergedRules, null, 2);
  }
}

function saveJsonRules() {
  const jsonEditor = document.getElementById('jsonEditor');
  const jsonText = jsonEditor.value.trim();
  
  if (!jsonText) {
    showAlert('JSON内容不能为空', 'danger');
    return;
  }
  
  try {
    const rules = JSON.parse(jsonText);
    
    // 验证规则格式
    if (!Array.isArray(rules)) {
      throw new Error('规则必须是数组格式');
    }
    
    // 验证每个规则的必要字段
    rules.forEach((rule, index) => {
      if (!rule.id || !rule.action || !rule.condition) {
        throw new Error(`规则 ${index + 1} 缺少必要字段`);
      }
    });
    
    currentRules = rules;
    renderRulesList();
    saveRulesToStorage();
    showAlert('JSON规则已保存', 'success');
    
  } catch (error) {
    showAlert('JSON格式错误: ' + error.message, 'danger');
  }
}

function formatJson() {
  const jsonEditor = document.getElementById('jsonEditor');
  try {
    const obj = JSON.parse(jsonEditor.value);
    jsonEditor.value = JSON.stringify(obj, null, 2);
    showAlert('JSON已格式化', 'success');
  } catch (error) {
    showAlert('JSON格式错误，无法格式化: ' + error.message, 'danger');
  }
}

function validateJson() {
  const jsonEditor = document.getElementById('jsonEditor');
  try {
    const rules = JSON.parse(jsonEditor.value);
    
    if (!Array.isArray(rules)) {
      throw new Error('根元素必须是数组');
    }
    
    const ids = new Set();
    rules.forEach((rule, index) => {
      // 检查必要字段
      if (typeof rule.id !== 'number') {
        throw new Error(`规则 ${index + 1}: id必须是数字`);
      }
      
      if (ids.has(rule.id)) {
        throw new Error(`规则 ${index + 1}: ID ${rule.id} 重复`);
      }
      ids.add(rule.id);
      
      if (!rule.action || !rule.action.redirect || !rule.action.redirect.regexSubstitution) {
        throw new Error(`规则 ${index + 1}: 缺少action.redirect.regexSubstitution`);
      }
      
      if (!rule.condition || !rule.condition.regexFilter) {
        throw new Error(`规则 ${index + 1}: 缺少condition.regexFilter`);
      }
      
      if (!rule.condition.resourceTypes || !Array.isArray(rule.condition.resourceTypes)) {
        throw new Error(`规则 ${index + 1}: condition.resourceTypes必须是数组`);
      }
      
      // 测试正则表达式
      try {
        new RegExp(rule.condition.regexFilter);
      } catch (e) {
        throw new Error(`规则 ${index + 1}: 正则表达式无效`);
      }
    });
    
    showAlert('✅ JSON格式验证通过，共 ' + rules.length + ' 条规则', 'success');
    
  } catch (error) {
    showAlert('❌ JSON验证失败: ' + error.message, 'danger');
  }
}

// 显示消息提示
function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) {
    console.error('Alert container not found!');
    console.log(message);
    return;
  }
  
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = message;
  
  alertContainer.appendChild(alertDiv);
  
  // 3秒后自动移除提示
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.parentNode.removeChild(alertDiv);
    }
  }, 3000);
}

// 检查扩展状态
async function checkExtensionStatus() {
  try {
    const statusElement = document.getElementById('extensionStatus');
    if (!statusElement) return;
    
    // 检查存储中的启用状态
    const result = await chrome.storage.local.get(['redirectEnabled']);
    const isEnabled = result.redirectEnabled !== undefined ? result.redirectEnabled : true;
    
    // 检查当前启用的规则集
    const enabledRulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
    const rulesetEnabled = enabledRulesets.includes('ruleset_1');
    
    let statusText = '';
    let statusClass = '';
    
    if (isEnabled && rulesetEnabled) {
      statusText = '✅ 重定向已启用且规则集生效';
      statusClass = 'success';
    } else if (isEnabled && !rulesetEnabled) {
      statusText = '⚠️ 设置为启用但规则集未生效';
      statusClass = 'warning';
    } else if (!isEnabled && !rulesetEnabled) {
      statusText = '❌ 重定向已禁用';
      statusClass = 'info';
    } else {
      statusText = '⚠️ 设置为禁用但规则集仍在生效';
      statusClass = 'warning';
    }
    
    statusElement.innerHTML = statusText;
    statusElement.className = statusClass;
    
  } catch (error) {
    const statusElement = document.getElementById('extensionStatus');
    if (statusElement) {
      statusElement.innerHTML = '❌ 状态检查失败: ' + error.message;
      statusElement.className = 'danger';
    }
    console.error('检查扩展状态失败:', error);
  }
}

// ===== Protobuf 转换功能 =====

// 加载 protobuf 转换状态
async function loadProtoConversionStatus() {
  try {
    const result = await chrome.storage.local.get(['protoConversionEnabled']);
    const isEnabled = result.protoConversionEnabled || false;
    
    const checkbox = document.getElementById('enableProtoConversion');
    const statusElement = document.getElementById('protoConversionStatus');
    
    if (checkbox) {
      checkbox.checked = isEnabled;
    }
    
    if (statusElement) {
      if (isEnabled) {
        statusElement.innerHTML = '✅ Protobuf → JSON 转换已启用';
        statusElement.style.color = '#155724';
      } else {
        statusElement.innerHTML = '❌ Protobuf → JSON 转换已禁用';
        statusElement.style.color = '#721c24';
      }
    }
    
    console.log('Protobuf转换状态:', isEnabled ? '启用' : '禁用');
    
  } catch (error) {
    const statusElement = document.getElementById('protoConversionStatus');
    if (statusElement) {
      statusElement.innerHTML = '❌ 转换状态检查失败: ' + error.message;
      statusElement.style.color = '#721c24';
    }
    console.error('加载Protobuf转换状态失败:', error);
  }
}

// 切换 protobuf 转换状态
async function toggleProtoConversion() {
  try {
    const checkbox = document.getElementById('enableProtoConversion');
    const isEnabled = checkbox.checked;
    
    // 保存到 chrome.storage
    await chrome.storage.local.set({ protoConversionEnabled: isEnabled });
    
    // 更新状态显示
    const statusElement = document.getElementById('protoConversionStatus');
    if (statusElement) {
      if (isEnabled) {
        statusElement.innerHTML = '✅ Protobuf → JSON 转换已启用';
        statusElement.style.color = '#155724';
        showAlert('Protobuf → JSON 转换已启用！请确保本地服务支持JSON格式接口', 'success');
      } else {
        statusElement.innerHTML = '❌ Protobuf → JSON 转换已禁用';
        statusElement.style.color = '#721c24';
        showAlert('Protobuf → JSON 转换已禁用', 'info');
      }
    }
    
    // 通知后台脚本状态变更
    try {
      await chrome.runtime.sendMessage({
        type: 'PROTO_CONVERSION_CHANGED',
        enabled: isEnabled
      });
    } catch (msgError) {
      console.warn('无法通知后台脚本:', msgError);
    }
    
    console.log('Protobuf转换状态已更新:', isEnabled ? '启用' : '禁用');
    
  } catch (error) {
    showAlert('切换Protobuf转换状态失败: ' + error.message, 'danger');
    console.error('切换Protobuf转换状态失败:', error);
    
    // 恢复复选框状态
    const checkbox = document.getElementById('enableProtoConversion');
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
    }
  }
}

// ===== 接口映射功能 =====

// 从localStorage加载接口映射
function loadMappingsFromStorage() {
  try {
    const storedMappings = localStorage.getItem('ura-proxy-mappings');
    if (storedMappings) {
      currentMappings = JSON.parse(storedMappings);
    } else {
      currentMappings = [];
    }
  } catch (error) {
    console.error('加载接口映射失败:', error);
    showAlert('加载接口映射失败: ' + error.message, 'danger');
    currentMappings = [];
  }
}

// 保存接口映射到localStorage
function saveMappingsToStorage() {
  try {
    localStorage.setItem('ura-proxy-mappings', JSON.stringify(currentMappings, null, 2));
    showAlert('接口映射已保存到本地存储！', 'success');
  } catch (error) {
    console.error('保存接口映射失败:', error);
    showAlert('保存接口映射失败: ' + error.message, 'danger');
  }
}

// 渲染接口映射列表
function renderMappingsList() {
  const container = document.getElementById('mappingsList');
  const statusContainer = document.getElementById('mappingStatus');
  
  if (!container) return;
  
  // 更新状态提示
  if (statusContainer) {
    statusContainer.style.display = 'block';
    statusContainer.textContent = `刷新映射列表...（当前 ${currentMappings.length} 个映射）`;
    statusContainer.className = 'alert alert-info';
  }
  
  if (currentMappings.length === 0) {
    container.innerHTML = '<div class="alert alert-info">暂无接口映射。使用上方快速添加功能创建第一个映射。</div>';
    
    // 隐藏状态提示
    if (statusContainer) {
      statusContainer.style.display = 'none';
    }
    return;
  }
  
  container.innerHTML = currentMappings.map((mapping, index) => {
    const hasProtoConversion = mapping.protoConversion || false;
    const methodText = mapping.method ? ` [${mapping.method}]` : ' [所有方法]';
    
    // 构建 protobuf 转换标识
    const protoConversionBadge = hasProtoConversion 
      ? '<span style="background: #ff9800; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-left: 8px;">Protobuf转换</span>' 
      : '';
    
    return `
      <div class="rule-item">
        <div class="rule-header">
          <div class="rule-title">映射 ${mapping.id}${protoConversionBadge}</div>
          <div class="rule-actions">
            <button class="btn-warning edit-mapping-btn" data-index="${index}">编辑</button>
            <button class="btn-danger delete-mapping-btn" data-index="${index}">删除</button>
          </div>
        </div>
        <div class="rule-details">
          <strong>源路径:</strong> ${mapping.sourcePath}${methodText}<br>
          <strong>目标路径:</strong> ${mapping.targetPath}<br>
          <strong>域名:</strong> ${mapping.domain} → localhost:${mapping.port}
          ${hasProtoConversion ? '<br><strong>协议转换:</strong> <span style="color: #ff9800;">✓ Protobuf → JSON</span>' : ''}
        </div>
      </div>
    `;
  }).join('');
  
  // 确保事件监听器正确设置
  ensureMappingEventListeners();
  
  // 更新状态提示为成功
  if (statusContainer) {
    statusContainer.style.display = 'block';
    statusContainer.textContent = `✅ 映射列表已更新！当前共有 ${currentMappings.length} 个接口映射`;
    statusContainer.className = 'alert alert-success';
    
    // 3秒后隐藏状态提示
    setTimeout(() => {
      statusContainer.style.display = 'none';
    }, 3000);
  }
}

// 确保映射动态事件监听器正确设置
function ensureMappingEventListeners() {
  const mappingsList = document.getElementById('mappingsList');
  if (!mappingsList) return;
  
  // 移除旧的事件监听器（如果存在）
  const oldHandler = mappingsList._clickHandler;
  if (oldHandler) {
    mappingsList.removeEventListener('click', oldHandler);
  }
  
  // 创建新的事件处理器
  const newHandler = function(event) {
    if (event.target.classList.contains('edit-mapping-btn')) {
      const index = parseInt(event.target.dataset.index);
      editMapping(index);
    } else if (event.target.classList.contains('delete-mapping-btn')) {
      const index = parseInt(event.target.dataset.index);
      deleteMapping(index);
    }
  };
  
  // 绑定新的事件监听器
  mappingsList.addEventListener('click', newHandler);
  mappingsList._clickHandler = newHandler; // 保存引用以便后续移除
}

// 添加接口映射
function addApiMapping() {
  try {
    const sourcePath = document.getElementById('mappingSourcePath').value.trim();
    const targetPath = document.getElementById('mappingTargetPath').value.trim();
    const domain = document.getElementById('mappingDomain').value.trim();
    const port = document.getElementById('mappingPort').value.trim();
    const method = document.getElementById('mappingMethod').value.trim();
    const enableProtoConversion = document.getElementById('mappingProtoConversion').checked;
    
    if (!sourcePath || !targetPath || !domain || !port) {
      showAlert('请填写所有必需字段', 'danger');
      return;
    }
    
    // 生成新的映射ID
    const newId = Math.max(...currentMappings.map(m => m.id || 0), 0) + 1;
    
    const newMapping = {
      id: newId,
      sourcePath: sourcePath,
      targetPath: targetPath,
      domain: domain,
      port: parseInt(port),
      method: method || null,
      protoConversion: enableProtoConversion
    };
    
    currentMappings.push(newMapping);
    renderMappingsList();
    saveMappingsToStorage();
    
    // 清空输入框
    document.getElementById('mappingSourcePath').value = '';
    document.getElementById('mappingTargetPath').value = '';
    document.getElementById('mappingDomain').value = '';
    document.getElementById('mappingPort').value = '3000';
    document.getElementById('mappingMethod').value = '';
    document.getElementById('mappingProtoConversion').checked = false;
    
    const conversionNote = enableProtoConversion ? ' (启用Protobuf转换)' : '';
    const methodNote = method ? ` [${method}]` : '';
    showAlert(`新接口映射已添加：${sourcePath}${methodNote} → ${targetPath}${conversionNote}`, 'success');
  } catch (error) {
    showAlert('添加接口映射失败: ' + error.message, 'danger');
    console.error('Add mapping error:', error);
  }
}

// 编辑接口映射
function editMapping(index) {
  const mapping = currentMappings[index];
  
  const newSourcePath = prompt('编辑源路径:', mapping.sourcePath);
  if (newSourcePath === null) return;
  
  const newTargetPath = prompt('编辑目标路径:', mapping.targetPath);
  if (newTargetPath === null) return;
  
  const newDomain = prompt('编辑域名:', mapping.domain);
  if (newDomain === null) return;
  
  const newPort = prompt('编辑端口:', mapping.port);
  if (newPort === null) return;
  
  const newMethod = prompt('编辑请求方法 (留空表示所有方法):', mapping.method || '');
  if (newMethod === null) return;
  
  // 编辑 protobuf 转换设置
  const currentProtoConversion = mapping.protoConversion || false;
  const protoConversionAnswer = prompt(
    '是否启用 Protobuf → JSON 转换？\n(输入 "yes" 或 "y" 启用，其他为禁用)', 
    currentProtoConversion ? 'yes' : 'no'
  );
  if (protoConversionAnswer === null) return;
  
  const enableProtoConversion = protoConversionAnswer.toLowerCase() === 'yes' || protoConversionAnswer.toLowerCase() === 'y';
  
  try {
    currentMappings[index].sourcePath = newSourcePath;
    currentMappings[index].targetPath = newTargetPath;
    currentMappings[index].domain = newDomain;
    currentMappings[index].port = parseInt(newPort) || 3000;
    currentMappings[index].method = newMethod || null;
    currentMappings[index].protoConversion = enableProtoConversion;
    
    renderMappingsList();
    saveMappingsToStorage();
    
    const conversionNote = enableProtoConversion ? ' (已启用Protobuf转换)' : ' (已禁用Protobuf转换)';
    showAlert('接口映射已更新' + conversionNote, 'success');
  } catch (error) {
    showAlert('更新接口映射失败: ' + error.message, 'danger');
  }
}

// 删除接口映射
function deleteMapping(index) {
  if (confirm('确定要删除这个接口映射吗？')) {
    currentMappings.splice(index, 1);
    renderMappingsList();
    saveMappingsToStorage();
    showAlert('接口映射已删除', 'success');
  }
}

// 保存所有映射
function saveMappings() {
  saveMappingsToStorage();
}

// 导出映射配置
function exportMappings() {
  const jsonContent = JSON.stringify(currentMappings, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'api-mappings.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showAlert('api-mappings.json文件已下载', 'info');
}

// 清空所有映射
function clearAllMappings() {
  if (confirm('确定要清空所有接口映射吗？这个操作不可撤销。')) {
    currentMappings = [];
    renderMappingsList();
    saveMappingsToStorage();
    showAlert('所有接口映射已清空', 'success');
  }
}

// ===== 接口映射与规则转换 =====

// 将接口映射转换为重定向规则
function convertMappingsToRules() {
  const mappingRules = currentMappings.map((mapping, index) => {
    const mappingId = 1000 + mapping.id; // 使用1000+作为映射规则的ID前缀
    
    // 构建源路径的正则表达式
    const escapedDomain = mapping.domain.replace(/\./g, '\\\\.');
    const escapedSourcePath = mapping.sourcePath.replace(/\//g, '\\/');
    
    // 构建正则过滤器
    const regexFilter = `^https://${escapedDomain}${escapedSourcePath}(.*)`;
    
    // 构建目标替换
    const regexSubstitution = `http://localhost:${mapping.port}${mapping.targetPath}\\1`;
    
    // 构建资源类型数组
    let resourceTypes = ['xmlhttprequest'];
    if (mapping.method) {
      // 如果指定了特定方法，可以在这里进行更精确的匹配
      // 注意：declarativeNetRequest 不直接支持 HTTP 方法过滤，
      // 但我们可以通过其他方式实现，或者在代理层处理
    }
    
    return {
      "id": mappingId,
      "priority": 2, // 给映射规则更高的优先级
      "action": {
        "type": "redirect",
        "redirect": {
          "regexSubstitution": regexSubstitution
        }
      },
      "condition": {
        "regexFilter": regexFilter,
        "resourceTypes": resourceTypes
      },
      // 保留映射的额外信息
      "mappingInfo": {
        "sourcePath": mapping.sourcePath,
        "targetPath": mapping.targetPath,
        "method": mapping.method,
        "protoConversion": mapping.protoConversion
      }
    };
  });
  
  return mappingRules;
}

// 合并常规规则和映射规则
function getMergedRules() {
  const mappingRules = convertMappingsToRules();
  return [...currentRules, ...mappingRules];
}

// 更新导出功能，包含映射规则
function exportMergedRulesJson() {
  const mergedRules = getMergedRules();
  const jsonContent = JSON.stringify(mergedRules, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rules.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  const ruleCount = currentRules.length;
  const mappingCount = currentMappings.length;
  showAlert(`rules.json文件已下载（包含 ${ruleCount} 条常规规则 + ${mappingCount} 个接口映射），请替换扩展目录中的rules.json文件并重新加载扩展`, 'info');
}

// 预览合并规则
function previewMergedRules() {
  const mergedRules = getMergedRules();
  const jsonContent = JSON.stringify(mergedRules, null, 2);
  
  // 创建一个模态窗口来显示预览
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 8px;
    max-width: 80%;
    max-height: 80%;
    overflow: auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;
  
  modalContent.innerHTML = `
    <h3>🔍 合并规则预览</h3>
    <p>共 ${currentRules.length} 条常规规则 + ${currentMappings.length} 个接口映射 = ${mergedRules.length} 条总规则</p>
    <textarea readonly style="width: 100%; height: 400px; font-family: monospace; font-size: 12px; border: 1px solid #ddd; border-radius: 4px; padding: 10px;">${jsonContent}</textarea>
    <div style="margin-top: 15px; text-align: right;">
      <button id="closePreviewBtn" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">关闭</button>
      <button id="copyPreviewBtn" style="background: #2196F3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 10px;">复制到剪贴板</button>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // 关闭模态窗口
  document.getElementById('closePreviewBtn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // 复制到剪贴板
  document.getElementById('copyPreviewBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(jsonContent).then(() => {
      showAlert('规则已复制到剪贴板', 'success');
    }).catch(() => {
      showAlert('复制失败，请手动选择并复制', 'danger');
    });
  });
  
  // 点击背景关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// ===== 请求拦截和解析功能 =====

let currentRequestLogs = [];
let interceptConfig = {
  enabled: false,
  domainFilter: '',
  pathFilter: '',
  maxRecords: 100
};
let isLogsPaused = false;

// 初始化拦截配置 - 确保默认启用
function initializeInterceptConfig() {
  try {
    const stored = localStorage.getItem('ura-proxy-intercept-config');
    if (!stored) {
      // 如果没有配置，创建默认配置并启用
      interceptConfig = {
        enabled: true,  // 默认启用
        domainFilter: '',
        pathFilter: '',
        maxRecords: 100
      };
      localStorage.setItem('ura-proxy-intercept-config', JSON.stringify(interceptConfig));
      
      // 立即通知后台脚本
      chrome.runtime.sendMessage({
        type: 'REQUEST_INTERCEPT_CONFIG_CHANGED',
        config: interceptConfig
      }).catch(() => {
        console.warn('无法通知后台脚本初始化配置');
      });
      
      console.log('✅ 请求拦截已初始化并启用');
    }
  } catch (error) {
    console.error('初始化拦截配置失败:', error);
  }
}

// 加载拦截配置
function loadInterceptConfig() {
  try {
    const stored = localStorage.getItem('ura-proxy-intercept-config');
    if (stored) {
      interceptConfig = JSON.parse(stored);
    }
    
    // 更新UI
    const enableCheckbox = document.getElementById('enableRequestIntercept');
    const domainFilter = document.getElementById('interceptDomainFilter');
    const pathFilter = document.getElementById('interceptPathFilter');
    const maxRecords = document.getElementById('maxRecordCount');
    
    if (enableCheckbox) enableCheckbox.checked = interceptConfig.enabled;
    if (domainFilter) domainFilter.value = interceptConfig.domainFilter || '';
    if (pathFilter) pathFilter.value = interceptConfig.pathFilter || '';
    if (maxRecords) maxRecords.value = interceptConfig.maxRecords || 100;
    
    updateInterceptStatus();
    
  } catch (error) {
    console.error('加载拦截配置失败:', error);
    showAlert('加载拦截配置失败: ' + error.message, 'danger');
  }
}

// 保存拦截配置
function saveInterceptConfig() {
  try {
    const enableCheckbox = document.getElementById('enableRequestIntercept');
    const domainFilter = document.getElementById('interceptDomainFilter');
    const pathFilter = document.getElementById('interceptPathFilter');
    const maxRecords = document.getElementById('maxRecordCount');
    
    interceptConfig = {
      enabled: enableCheckbox ? enableCheckbox.checked : false,
      domainFilter: domainFilter ? domainFilter.value.trim() : '',
      pathFilter: pathFilter ? pathFilter.value.trim() : '',
      maxRecords: parseInt(maxRecords ? maxRecords.value : '100') || 100
    };
    
    localStorage.setItem('ura-proxy-intercept-config', JSON.stringify(interceptConfig));
    
    // 通知后台脚本配置变更
    chrome.runtime.sendMessage({
      type: 'REQUEST_INTERCEPT_CONFIG_CHANGED',
      config: interceptConfig
    }).catch(() => {
      console.warn('无法通知后台脚本配置变更');
    });
    
    updateInterceptStatus();
    showAlert('拦截配置已保存', 'success');
    
  } catch (error) {
    showAlert('保存拦截配置失败: ' + error.message, 'danger');
    console.error('保存拦截配置失败:', error);
  }
}

// 切换请求拦截状态
function toggleRequestIntercept() {
  saveInterceptConfig();
}

// 更新拦截状态显示
function updateInterceptStatus() {
  const statusElement = document.getElementById('interceptStatus');
  if (!statusElement) return;
  
  if (interceptConfig.enabled) {
    const filters = [];
    if (interceptConfig.domainFilter) filters.push(`域名: ${interceptConfig.domainFilter}`);
    if (interceptConfig.pathFilter) filters.push(`路径: ${interceptConfig.pathFilter}`);
    const filterText = filters.length > 0 ? ` (${filters.join(', ')})` : '';
    
    statusElement.innerHTML = `✅ 拦截已启用${filterText} - 最大记录 ${interceptConfig.maxRecords} 条`;
    statusElement.className = 'alert alert-success';
  } else {
    statusElement.innerHTML = '❌ 拦截状态：未启用';
    statusElement.className = 'alert alert-info';
  }
}

// 刷新请求日志
function refreshRequestLogs() {
  try {
    // 从后台脚本获取最新日志
    chrome.runtime.sendMessage({
      type: 'GET_REQUEST_LOGS'
    }).then(response => {
      if (response && response.logs) {
        currentRequestLogs = response.logs;
        renderRequestLogs();
      }
    }).catch(() => {
      // 如果无法从后台获取，则从本地存储获取
      const stored = localStorage.getItem('ura-proxy-request-logs');
      if (stored) {
        currentRequestLogs = JSON.parse(stored);
        renderRequestLogs();
      }
    });
  } catch (error) {
    console.error('刷新请求日志失败:', error);
  }
}

// 渲染请求日志列表
function renderRequestLogs() {
  const container = document.getElementById('requestLogsList');
  if (!container) return;
  
  const searchFilter = document.getElementById('logSearchFilter');
  const searchTerm = searchFilter ? searchFilter.value.toLowerCase() : '';
  
  // 过滤日志
  let filteredLogs = currentRequestLogs;
  if (searchTerm) {
    filteredLogs = currentRequestLogs.filter(log => 
      log.url.toLowerCase().includes(searchTerm) ||
      log.method.toLowerCase().includes(searchTerm) ||
      (log.requestBody && log.requestBody.toLowerCase().includes(searchTerm)) ||
      (log.responseBody && log.responseBody.toLowerCase().includes(searchTerm))
    );
  }
  
  if (filteredLogs.length === 0) {
    container.innerHTML = '<div class="alert alert-info">暂无请求日志。启用拦截功能后，符合条件的请求将出现在这里。</div>';
    return;
  }
  
  container.innerHTML = filteredLogs.map((log, index) => {
    const timestamp = new Date(log.timestamp).toLocaleString();
    const statusClass = log.status >= 200 && log.status < 300 ? 'success' : 
                       log.status >= 400 ? 'danger' : 'warning';
    
    // 尝试解析和美化请求/响应体
    let requestBodyDisplay = log.requestBody || '无';
    let responseBodyDisplay = log.responseBody || '无';
    
    try {
      if (log.requestBody && log.requestBody.startsWith('{')) {
        requestBodyDisplay = JSON.stringify(JSON.parse(log.requestBody), null, 2);
      }
    } catch (e) {
      // 保持原始格式
    }
    
    try {
      if (log.responseBody && log.responseBody.startsWith('{')) {
        responseBodyDisplay = JSON.stringify(JSON.parse(log.responseBody), null, 2);
      }
    } catch (e) {
      // 保持原始格式
    }
    
    return `
      <div class="rule-item">
        <div class="rule-header">
          <div class="rule-title">
            <span style="background: #2196F3; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${log.method}</span>
            <span style="background: #${statusClass === 'success' ? '4CAF50' : statusClass === 'danger' ? 'f44336' : 'ff9800'}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-left: 5px;">${log.status}</span>
            <span style="margin-left: 10px; font-size: 12px; color: #666;">${timestamp}</span>
          </div>
          <div class="rule-actions">
            <button class="btn-warning copy-log-btn" data-index="${index}">📋 复制</button>
            <button class="btn-warning toggle-details-btn" data-index="${index}">📖 详情</button>
          </div>
        </div>
        <div class="rule-details">
          <strong>URL:</strong> <span style="word-break: break-all;">${log.url}</span><br>
          <strong>Content-Type:</strong> ${log.contentType || '未知'}<br>
          <div id="log-details-${index}" style="display: none; margin-top: 10px;">
            <strong>请求头:</strong><br>
            <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 11px; max-height: 100px; overflow-y: auto;">${JSON.stringify(log.requestHeaders || {}, null, 2)}</pre>
            <strong>请求体:</strong><br>
            <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 11px; max-height: 200px; overflow-y: auto;">${requestBodyDisplay}</pre>
            <strong>响应头:</strong><br>
            <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 11px; max-height: 100px; overflow-y: auto;">${JSON.stringify(log.responseHeaders || {}, null, 2)}</pre>
            <strong>响应体:</strong><br>
            <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 11px; max-height: 200px; overflow-y: auto;">${responseBodyDisplay}</pre>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // 绑定事件监听器
  container.querySelectorAll('.copy-log-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      copyLogToClipboard(filteredLogs[index]);
    });
  });
  
  container.querySelectorAll('.toggle-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      const details = document.getElementById(`log-details-${index}`);
      if (details) {
        const isVisible = details.style.display !== 'none';
        details.style.display = isVisible ? 'none' : 'block';
        e.target.textContent = isVisible ? '📖 详情' : '📕 收起';
      }
    });
  });
}

// 复制日志到剪贴板
function copyLogToClipboard(log) {
  const logText = `
=== HTTP 请求日志 ===
时间: ${new Date(log.timestamp).toLocaleString()}
方法: ${log.method}
状态: ${log.status}
URL: ${log.url}
Content-Type: ${log.contentType || '未知'}

=== 请求头 ===
${JSON.stringify(log.requestHeaders || {}, null, 2)}

=== 请求体 ===
${log.requestBody || '无'}

=== 响应头 ===
${JSON.stringify(log.responseHeaders || {}, null, 2)}

=== 响应体 ===
${log.responseBody || '无'}
  `.trim();
  
  navigator.clipboard.writeText(logText).then(() => {
    showAlert('日志已复制到剪贴板', 'success');
  }).catch(() => {
    showAlert('复制失败，请手动选择并复制', 'danger');
  });
}

// 过滤请求日志
function filterRequestLogs() {
  renderRequestLogs();
}

// 暂停/恢复日志记录
function toggleLogsPause() {
  isLogsPaused = !isLogsPaused;
  const btn = document.getElementById('pauseLogsBtn');
  if (btn) {
    btn.textContent = isLogsPaused ? '▶️ 恢复' : '⏸️ 暂停';
  }
  
  // 通知后台脚本
  chrome.runtime.sendMessage({
    type: 'TOGGLE_LOGS_PAUSE',
    paused: isLogsPaused
  }).catch(() => {
    console.warn('无法通知后台脚本暂停状态');
  });
  
  showAlert(isLogsPaused ? '日志记录已暂停' : '日志记录已恢复', 'info');
}

// 清空拦截日志
function clearInterceptLogs() {
  if (confirm('确定要清空所有请求日志吗？')) {
    currentRequestLogs = [];
    localStorage.removeItem('ura-proxy-request-logs');
    
    // 通知后台脚本清空日志
    chrome.runtime.sendMessage({
      type: 'CLEAR_REQUEST_LOGS'
    }).catch(() => {
      console.warn('无法通知后台脚本清空日志');
    });
    
    renderRequestLogs();
    showAlert('请求日志已清空', 'success');
  }
}

// 导出拦截日志
function exportInterceptLogs() {
  if (currentRequestLogs.length === 0) {
    showAlert('暂无日志可导出', 'warning');
    return;
  }
  
  const exportData = {
    exportTime: new Date().toISOString(),
    totalLogs: currentRequestLogs.length,
    config: interceptConfig,
    logs: currentRequestLogs
  };
  
  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `request-logs-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showAlert(`已导出 ${currentRequestLogs.length} 条请求日志`, 'success');
}

// 监听来自后台脚本的日志更新
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'NEW_REQUEST_LOG') {
      if (!isLogsPaused) {
        currentRequestLogs.unshift(message.log);
        
        // 限制日志数量
        if (currentRequestLogs.length > interceptConfig.maxRecords) {
          currentRequestLogs = currentRequestLogs.slice(0, interceptConfig.maxRecords);
        }
        
        // 保存到本地存储
        localStorage.setItem('ura-proxy-request-logs', JSON.stringify(currentRequestLogs));
        
        // 如果当前在请求拦截页面，则更新显示
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === 'requestInterceptTab') {
          renderRequestLogs();
        }
      }
    }
  });
}

// 注入 request-panel.js 到当前活动标签页
async function injectRequestPanel() {
  if (!chrome.tabs || !chrome.scripting) {
    showAlert('当前环境不支持脚本注入', 'danger');
    return;
  }
  try {
    // 获取当前活动标签页
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (!tab || !tab.id) {
      showAlert('未找到活动标签页', 'danger');
      return;
    }
    
    // 先注入请求拦截器（如果还没有注入的话）
    try {
      await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: []
      });
    } catch (e) {
      console.warn('请求拦截器可能已注入:', e.message);
    }
    
    // 然后注入右侧面板
    await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ['request-panel.js']
    });
    
    showAlert('✅ 右侧请求面板已开启！可以实时查看请求日志', 'success');
  } catch (e) {
    showAlert('注入失败: ' + e.message, 'danger');
    console.error('注入右侧面板失败:', e);
  }
}

// ===== 国际化与语言切换 =====
function renderLang() {
  document.title = t('optionsTitle');
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) pageTitle.textContent = t('optionsTitle');
  const mainTitle = document.getElementById('mainTitle');
  if (mainTitle) mainTitle.textContent = t('optionsTitle');
  const extStatusTitle = document.getElementById('extStatusTitle');
  if (extStatusTitle) extStatusTitle.textContent = t('extStatusTitle');
  const refreshStatusBtn = document.getElementById('refreshStatusBtn');
  if (refreshStatusBtn) refreshStatusBtn.textContent = t('refreshStatusBtn');
  const protoTitle = document.getElementById('protoTitle');
  if (protoTitle) protoTitle.textContent = t('protoTitle');
  const protoSwitchLabel = document.getElementById('protoSwitchLabel');
  if (protoSwitchLabel) protoSwitchLabel.textContent = t('protoSwitchLabel');
  const refreshProtoStatusBtn = document.getElementById('refreshProtoStatusBtn');
  if (refreshProtoStatusBtn) refreshProtoStatusBtn.textContent = t('refreshProtoStatusBtn');
  const visualTabBtn = document.getElementById('visualTabBtn');
  if (visualTabBtn) visualTabBtn.textContent = t('visualTabBtn');
  const apiMappingTabBtn = document.getElementById('apiMappingTabBtn');
  if (apiMappingTabBtn) apiMappingTabBtn.textContent = t('apiMappingTabBtn');
  const requestInterceptTabBtn = document.getElementById('requestInterceptTabBtn');
  if (requestInterceptTabBtn) requestInterceptTabBtn.textContent = t('requestInterceptTabBtn');
  const jsonTabBtn = document.getElementById('jsonTabBtn');
  if (jsonTabBtn) jsonTabBtn.textContent = t('jsonTabBtn');
  const helpTabBtn = document.getElementById('helpTabBtn');
  if (helpTabBtn) helpTabBtn.textContent = t('helpTabBtn');
  // ...后续补充其它UI文本...
}

function setupLangSelector() {
  const langSelect = document.getElementById('langSelect');
  if (!langSelect) return;
  langSelect.value = getLang();
  langSelect.addEventListener('change', function() {
    localStorage.setItem('ura-proxy-lang', this.value);
    location.reload();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setupLangSelector();
  renderLang();
});
