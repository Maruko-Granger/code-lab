// ============================================
// Supabase 配置 - 用户需要自己配置这些值
// ============================================
const SUPABASE_URL = 'https://supabase.com/dashboard/project/flsxeybloagcfsbzmpbu'; // 用户配置的 Project URL
const SUPABASE_KEY = 'sb_publishable_0WAyxlkqbDuCwLTVA5Ix7g_Sb6LnzdJ'; // 用户配置的 Publishable Key

// 初始化 Supabase 客户端
// 注意：需要在 script.js 顶部配置 SUPABASE_URL 和 SUPABASE_KEY
let supabaseClient = null;
if (SUPABASE_URL && SUPABASE_KEY && typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ============================================
// 默认 API 配置
// ============================================
const DEFAULT_API_CONFIG = {
    api_url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    api_key: 'aa624787a3714d2fa38ae7de782cae9d.KQyKqD6GCHy1QtXy',
    model_name: 'glm-4.7'
};

// ============================================
// 全局变量
// ============================================
// 直接使用默认API配置，不需要从数据库或localStorage加载
let apiConfig = DEFAULT_API_CONFIG;
let mediaRecorder = null;
let audioChunks = [];
let currentAudioBlob = null;
let currentImageFile = null;
let exercisePlan = null; // 28天运动计划

// ============================================
// DOM 元素
// ============================================
const elements = {
    // 配置相关
    configPanel: document.getElementById('configPanel'),
    settingsBtn: document.getElementById('settingsBtn'),
    saveConfigBtn: document.getElementById('saveConfigBtn'),
    closeConfigBtn: document.getElementById('closeConfigBtn'),
    apiUrlInput: document.getElementById('apiUrl'),
    apiKeyInput: document.getElementById('apiKey'),
    modelNameInput: document.getElementById('modelName'),
    
    // 输入相关
    textInput: document.getElementById('textInput'),
    voiceInput: document.getElementById('voiceInput'),
    imageInput: document.getElementById('imageInput'),
    textMessage: document.getElementById('textMessage'),
    recordBtn: document.getElementById('recordBtn'),
    recordingStatus: document.getElementById('recordingStatus'),
    audioPlayback: document.getElementById('audioPlayback'),
    imageFile: document.getElementById('imageFile'),
    imagePreview: document.getElementById('imagePreview'),
    previewImg: document.getElementById('previewImg'),
    removeImageBtn: document.getElementById('removeImageBtn'),
    sendBtn: document.getElementById('sendBtn'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    
    // 对话相关
    chatMessages: document.getElementById('chatMessages'),
    loadingIndicator: document.getElementById('loadingIndicator')
};

// ============================================
// 全局变量 - UI状态
// ============================================
let currentCategory = 'diet'; // 当前分类
let currentDate = new Date(); // 当前显示的日期
let selectedDay = null; // 选中的日期

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    // API配置已直接使用默认值，无需检查
    console.log('API配置已加载:', apiConfig);
    
    // 绑定事件
    bindEvents();
    
    // 初始化UI
    initUI();
});

// ============================================
// 配置管理（已简化，直接使用默认配置）
// ============================================
// 配置已直接写入代码，无需数据库交互或手动配置

// ============================================
// UI初始化
// ============================================
function initUI() {
    // UI初始化代码
}

// ============================================
// 事件绑定
// ============================================
function bindEvents() {
    // 菜单按钮
    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const addBtn = document.getElementById('addBtn');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sideMenu.classList.remove('hidden');
        });
    }
    
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => {
            sideMenu.classList.add('hidden');
        });
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            // 可以添加新对话或其他功能
            console.log('添加新对话');
        });
    }
    
    // 配置面板事件（已移除，不再需要）
    // 如果settingsBtn存在，可以保留但显示提示
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            alert('API配置已直接写入代码，无需手动配置。如需修改，请直接编辑 script.js 文件中的 DEFAULT_API_CONFIG。');
        });
    }
    
    // 主页按钮
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = 'home.html';
        });
    }
    
    // 分类切换
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            switchCategory(category);
        });
    });
    
    // 麦克风按钮
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
        micBtn.addEventListener('click', () => {
            switchTab('voice');
            toggleRecording();
        });
    }
    
    // 图片上传按钮
    const imageUploadBtn = document.getElementById('imageUploadBtn');
    if (imageUploadBtn) {
        imageUploadBtn.addEventListener('click', () => {
            elements.imageFile.click();
        });
    }
    
    // 发送按钮（新的发送图标按钮）
    const sendIconBtn = document.querySelector('.send-icon-btn');
    if (sendIconBtn) {
        sendIconBtn.addEventListener('click', sendMessage);
    }
    
    // 输入标签切换
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
    
    // 文字输入（主输入框和隐藏输入框）
    const mainTextarea = document.getElementById('textMessage');
    if (mainTextarea) {
        mainTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                sendMessage();
            }
        });
    }
    
    if (elements.textMessage) {
        elements.textMessage.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                sendMessage();
            }
        });
    }
    
    // 语音输入
    elements.recordBtn.addEventListener('click', toggleRecording);
    
    // 图片输入
    elements.imageFile.addEventListener('change', handleImageSelect);
    elements.removeImageBtn.addEventListener('click', removeImage);
    
    // 发送按钮
    elements.sendBtn.addEventListener('click', sendMessage);
    
    // 拖拽上传图片
    const fileLabel = document.querySelector('.file-label');
    fileLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileLabel.style.borderColor = '#667eea';
    });
    
    fileLabel.addEventListener('dragleave', () => {
        fileLabel.style.borderColor = '#d0d0d0';
    });
    
    fileLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        fileLabel.style.borderColor = '#d0d0d0';
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            elements.imageFile.files = files;
            handleImageSelect({ target: elements.imageFile });
        }
    });
}

// ============================================
// 标签切换
// ============================================
function switchTab(tab) {
    // 更新标签按钮状态
    elements.tabBtns.forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 更新输入面板
    elements.textInput.classList.toggle('active', tab === 'text');
    elements.voiceInput.classList.toggle('active', tab === 'voice');
    elements.imageInput.classList.toggle('active', tab === 'image');
}

// ============================================
// 语音录制
// ============================================
async function toggleRecording() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        await startRecording();
    } else {
        stopRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunks = [];
        
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            currentAudioBlob = audioBlob;
            
            const audioUrl = URL.createObjectURL(audioBlob);
            elements.audioPlayback.src = audioUrl;
            elements.audioPlayback.classList.remove('hidden');
            
            // 停止所有音频轨道
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        elements.recordBtn.classList.add('recording');
        elements.recordBtn.querySelector('.record-text').textContent = '点击停止录音';
        elements.recordingStatus.classList.remove('hidden');
    } catch (error) {
        console.error('录音失败:', error);
        alert('无法访问麦克风，请检查浏览器权限设置');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        elements.recordBtn.classList.remove('recording');
        elements.recordBtn.querySelector('.record-text').textContent = '点击开始录音';
        elements.recordingStatus.classList.add('hidden');
    }
}

// ============================================
// 图片处理
// ============================================
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        currentImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.previewImg.src = e.target.result;
            elements.imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    currentImageFile = null;
    elements.imageFile.value = '';
    elements.imagePreview.classList.add('hidden');
    elements.previewImg.src = '';
}

// ============================================
// 发送消息
// ============================================
async function sendMessage() {
    // API配置已直接写入代码，无需检查
    
    // 获取当前输入方式
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    let inputData = null;
    let inputType = null;
    
    if (activeTab === 'text') {
        // 检查主输入框和隐藏输入框
        const mainTextarea = document.getElementById('textMessage');
        const hiddenTextarea = elements.textMessage;
        const text = (mainTextarea ? mainTextarea.value.trim() : '') || (hiddenTextarea ? hiddenTextarea.value.trim() : '');
        
        if (!text) {
            alert('请输入医嘱内容');
            return;
        }
        inputData = text;
        inputType = 'text';
    } else if (activeTab === 'voice') {
        if (!currentAudioBlob) {
            alert('请先录制语音');
            return;
        }
        inputData = currentAudioBlob;
        inputType = 'audio';
    } else if (activeTab === 'image') {
        if (!currentImageFile) {
            alert('请先选择图片');
            return;
        }
        inputData = currentImageFile;
        inputType = 'image';
    }
    
    // 显示用户输入
    displayUserInput(inputData, inputType);
    
    // 禁用发送按钮
    elements.sendBtn.disabled = true;
    elements.loadingIndicator.classList.remove('hidden');
    
    try {
        // 调用 API
        const response = await callZhipuAPI(inputData, inputType);
        
        // 显示 AI 回复
        displayAssistantMessage(response);
    } catch (error) {
        console.error('API 调用失败:', error);
        displayErrorMessage(error.message || '生成总结失败，请重试');
    } finally {
        // 恢复发送按钮
        elements.sendBtn.disabled = false;
        elements.loadingIndicator.classList.add('hidden');
        
        // 清空输入
        clearInput();
    }
}

function clearInput() {
    elements.textMessage.value = '';
    currentAudioBlob = null;
    currentImageFile = null;
    elements.audioPlayback.classList.add('hidden');
    elements.audioPlayback.src = '';
    removeImage();
}

// ============================================
// API 调用
// ============================================
async function callZhipuAPI(inputData, inputType) {
    const { api_url, api_key, model_name } = apiConfig;
    
    // 构建请求体
    let requestBody = {
        model: model_name,
        messages: []
    };
    
    if (inputType === 'text') {
        // 文字输入：添加system message要求纯文本、分点、无markdown、100字以内
        requestBody.messages.push({
            role: 'system',
            content: '请根据用户的医嘱内容，生成一个简洁的总结。要求：1. 返回纯文本，不要使用任何markdown语法（如#、*、**、```等）；2. 使用分点形式（用数字1.2.3.或中文一、二、三）；3. 字数控制在100字以内；4. 内容要清晰、简洁、易读。'
        });
        requestBody.messages.push({
            role: 'user',
            content: `请总结以下医嘱内容：\n\n${inputData}`
        });
    } else if (inputType === 'image') {
        // 图片输入：根据智谱API文档，content需要是字符串格式
        // 检查是否使用支持图片的模型（如glm-4v）
        const isVisionModel = model_name && (model_name.includes('4v') || model_name.includes('vision'));
        
        if (isVisionModel) {
            // 如果使用支持图片的模型，尝试将图片base64作为content的一部分
            // 注意：这可能需要根据实际API文档调整格式
            const base64Image = await fileToBase64(inputData);
            requestBody.messages.push({
                role: 'system',
                content: '请根据图片中的医嘱内容，生成一个简洁的总结。要求：1. 返回纯文本，不要使用任何markdown语法（如#、*、**、```等）；2. 使用分点形式（用数字1.2.3.或中文一、二、三）；3. 字数控制在100字以内；4. 内容要清晰、简洁、易读。'
            });
            requestBody.messages.push({
                role: 'user',
                content: `请分析以下图片中的医嘱内容，并生成总结。\n\n图片数据：${base64Image}`
            });
            console.warn('提示：使用图片输入，请确认模型支持图片输入。如果API返回错误，请查看API文档确认正确的图片输入格式。');
        } else {
            // 如果不支持图片，提示用户
            throw new Error('当前使用的模型可能不支持直接发送图片。\n\n建议：\n1. 请先将图片中的医嘱内容手动输入为文字，然后使用"文字"输入方式\n2. 或者切换到支持图片的模型（如glm-4v）');
        }
    } else if (inputType === 'audio') {
        // 音频输入：智谱API的content需要是字符串
        // 提示用户需要先进行语音转文字
        throw new Error('当前智谱API不支持直接发送音频文件。请先将语音转换为文字，然后使用文字输入方式。');
    }
    
    // 调试输出：请求信息
    console.log('========== 智谱 API 请求信息 ==========');
    console.log('API URL:', api_url);
    console.log('模型名称:', model_name);
    console.log('输入类型:', inputType);
    console.log('请求体:', JSON.stringify(requestBody, null, 2));
    console.log('=====================================');
    
    // 发送请求
    const response = await fetch(api_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`
        },
        body: JSON.stringify(requestBody)
    });
    
    // 调试输出：响应状态
    console.log('========== 智谱 API 响应状态 ==========');
    console.log('HTTP 状态码:', response.status, response.statusText);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));
    console.log('=====================================');
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('========== API 错误响应 ==========');
        console.error('错误信息:', errorData);
        console.error('===================================');
        throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 调试输出：完整响应
    console.log('========== 智谱 API 完整响应 ==========');
    console.log('响应数据:', JSON.stringify(data, null, 2));
    console.log('=====================================');
    
    // 提取回复内容
    if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        console.log('========== 提取的回复内容 ==========');
        console.log('回复内容:', content);
        console.log('=====================================');
        return content;
    } else {
        console.error('========== API 响应格式异常 ==========');
        console.error('响应数据:', data);
        console.error('=====================================');
        throw new Error('API 返回格式异常，响应中没有 choices 字段');
    }
}

// ============================================
// 工具函数
// ============================================
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result;
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result;
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ============================================
// 消息显示
// ============================================
function displayUserInput(inputData, inputType) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    headerDiv.textContent = '您';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (inputType === 'text') {
        contentDiv.textContent = inputData;
    } else if (inputType === 'image') {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(inputData);
        img.className = 'message-image';
        img.alt = '上传的图片';
        contentDiv.appendChild(img);
    } else if (inputType === 'audio') {
        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(inputData);
        audio.controls = true;
        audio.className = 'message-audio';
        contentDiv.appendChild(audio);
        contentDiv.appendChild(document.createTextNode('语音输入'));
    }
    
    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    
    // 移除欢迎消息
    const welcomeMsg = elements.chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// 保存医嘱历史记录
function savePrescriptionHistory(summary) {
    const history = JSON.parse(localStorage.getItem('prescription_history') || '[]');
    const newRecord = {
        id: Date.now(),
        summary: summary,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('zh-CN')
    };
    history.unshift(newRecord); // 添加到开头
    // 最多保存50条记录
    if (history.length > 50) {
        history.pop();
    }
    localStorage.setItem('prescription_history', JSON.stringify(history));
}

function displayAssistantMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    headerDiv.textContent = 'AI 总结';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    
    // 保存AI总结到localStorage，供饮食计划页面使用
    localStorage.setItem('ai_summary', content);
    
    // 保存医嘱历史记录
    savePrescriptionHistory(content);
    
    // 添加"生成运动计划"按钮
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'plan-button-container';
    const planButton = document.createElement('button');
    planButton.className = 'btn btn-plan';
    planButton.textContent = '📅 生成28天运动计划';
    planButton.addEventListener('click', () => {
        // 生成计划并保存到localStorage
        exercisePlan = generateExercisePlan();
        localStorage.setItem('exercise_plan', JSON.stringify(exercisePlan));
        // 跳转到运动计划页面
        window.location.href = 'exercise-plan.html';
    });
    buttonDiv.appendChild(planButton);
    messageDiv.appendChild(buttonDiv);
    
    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function displayErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.style.background = '#ffe6e6';
    messageDiv.style.color = '#cc0000';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    headerDiv.textContent = '错误';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message;
    
    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    
    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ============================================
// 28天运动计划
// ============================================

// 生成28天运动计划数据
function generateExercisePlan() {
    const plan = [];
    
    // 根据计划：7天一个周期，共4周
    // 第1、4、8、11、15、18、22、25天：快走
    // 第2、5、9、12、16、19、23、26天：太极拳/八段锦
    // 第3、6、10、13、17、20、24、27天：力量训练
    // 第7、14、21、28天：轻松散步（休息日）
    
    const weekPattern = [
        { type: 'walking', name: '公园或小区快走', duration: 40, note: '餐后1小时进行' },
        { type: 'taichi', name: '太极拳/八段锦', duration: 30, note: '' },
        { type: 'strength', name: '力量训练', duration: 35, note: '弹力带扩胸3组×12次、靠墙静蹲3组×40秒，之后做10分钟太极放松' },
        { type: 'walking', name: '公园或小区快走', duration: 40, note: '餐后1小时进行' },
        { type: 'taichi', name: '太极拳/八段锦', duration: 30, note: '' },
        { type: 'strength', name: '力量训练', duration: 35, note: '弹力带扩胸3组×12次、靠墙静蹲3组×40秒，之后做10分钟太极放松' },
        { type: 'rest', name: '轻松散步', duration: 20, note: '休息日' }
    ];
    
    for (let day = 1; day <= 28; day++) {
        const weekDay = (day - 1) % 7;
        const activity = weekPattern[weekDay];
        plan.push({
            day: day,
            type: activity.type,
            name: activity.name,
            duration: activity.duration,
            note: activity.note
        });
    }
    
    return plan;
}

// 获取计划合理性说明
function getPlanRationale() {
    // 如果AI生成了新的说明，使用新的；否则使用默认的
    if (window.lastPlanRationale) {
        return window.lastPlanRationale;
    }
    return "本计划结合有氧运动（快走）、柔韧性训练（太极拳/八段锦）和力量训练，每周安排休息日，循序渐进，适合糖尿病患者。运动强度适中，时长控制在20-40分钟，有助于血糖控制和身体机能改善。";
}

// 分类切换
function switchCategory(category) {
    currentCategory = category;
    
    // 更新标签样式
    document.querySelectorAll('.category-tab').forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // 根据分类显示不同内容
    // 这里可以根据需要实现不同分类的内容切换
    console.log('切换到分类:', category);
}

// 显示运动计划日历
function showExerciseCalendar() {
    // 生成计划
    exercisePlan = generateExercisePlan();
    
    // 显示面板
    const panel = document.getElementById('exercisePlanPanel');
    if (!panel) {
        console.error('运动计划面板不存在');
        return;
    }
    panel.classList.remove('hidden');
    
    // 显示计划合理性说明
    const rationaleText = document.getElementById('planRationaleText');
    if (rationaleText) {
        rationaleText.textContent = getPlanRationale();
    }
    
    // 渲染日历（使用简单的28天网格）
    renderSimpleCalendar();
    
    // 加载保存的提醒时间
    loadReminderTime();
    
    // 绑定事件
    bindPlanEvents();
    
    // 绑定重新设计功能
    bindRedesignEvents();
}

// 绑定重新设计功能事件
function bindRedesignEvents() {
    const redesignBtn = document.getElementById('redesignBtn');
    const redesignInput = document.getElementById('redesignInput');
    
    if (redesignBtn && !redesignBtn.hasAttribute('data-bound')) {
        redesignBtn.setAttribute('data-bound', 'true');
        redesignBtn.addEventListener('click', () => {
            const input = redesignInput ? redesignInput.value.trim() : '';
            if (!input) {
                alert('请输入您的需求');
                return;
            }
            redesignExercisePlan(input);
        });
    }
    
    // 回车键提交
    if (redesignInput && !redesignInput.hasAttribute('data-bound')) {
        redesignInput.setAttribute('data-bound', 'true');
        redesignInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                const input = redesignInput.value.trim();
                if (input) {
                    redesignExercisePlan(input);
                }
            }
        });
    }
}

// 重新设计运动计划
async function redesignExercisePlan(userRequest) {
    // API配置已直接写入代码，无需检查
    
    // 显示加载状态
    const loadingDiv = document.getElementById('redesignLoading');
    const redesignBtn = document.getElementById('redesignBtn');
    const redesignInput = document.getElementById('redesignInput');
    
    if (loadingDiv) loadingDiv.classList.remove('hidden');
    if (redesignBtn) redesignBtn.disabled = true;
    if (redesignInput) redesignInput.disabled = true;
    
    try {
        // 调用AI生成新计划
        const newPlan = await callAIForExercisePlan(userRequest);
        
        // 更新计划
        exercisePlan = newPlan;
        
        // 重新渲染日历
        renderSimpleCalendar();
        
        // 更新计划合理性说明
        const rationaleText = document.getElementById('planRationaleText');
        if (rationaleText) {
            rationaleText.textContent = getPlanRationale();
        }
        
        alert('运动计划已更新！');
    } catch (error) {
        console.error('重新设计计划失败:', error);
        alert('生成新计划失败，请重试。错误：' + error.message);
    } finally {
        // 隐藏加载状态
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (redesignBtn) redesignBtn.disabled = false;
        if (redesignInput) redesignInput.disabled = false;
        if (redesignInput) redesignInput.value = '';
    }
}

// 调用AI生成运动计划
async function callAIForExercisePlan(userRequest) {
    const { api_url, api_key, model_name } = apiConfig;
    
    // 构建提示词
    const prompt = `请根据以下需求，为糖尿病患者设计一个28天的运动计划。

用户需求：${userRequest}

要求：
1. 返回一个包含28天的运动计划
2. 每天包含：运动项目名称、运动时长（分钟）、简要说明
3. 计划要适合糖尿病患者，运动强度适中
4. 请以JSON格式返回，格式如下：
{
  "plan": [
    {
      "day": 1,
      "name": "运动项目名称",
      "duration": 30,
      "note": "说明",
      "type": "walking|taichi|strength|rest"
    },
    ...
  ],
  "rationale": "计划合理性说明（2句话）"
}

请确保返回有效的JSON格式。`;
    
    // 构建请求体
    const requestBody = {
        model: model_name,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ]
    };
    
    // 发送请求
    const response = await fetch(api_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 提取回复内容
    if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message.content;
        return parseAIResponse(content);
    } else {
        throw new Error('API 返回格式异常');
    }
}

// 解析AI返回的计划
function parseAIResponse(content) {
    try {
        // 尝试提取JSON（可能包含在代码块中）
        let jsonStr = content;
        
        // 如果包含```json或```，提取其中的内容
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }
        
        // 尝试解析JSON
        const parsed = JSON.parse(jsonStr.trim());
        
        if (parsed.plan && Array.isArray(parsed.plan) && parsed.plan.length === 28) {
            // 更新计划合理性说明
            if (parsed.rationale) {
                // 可以保存到全局变量或直接使用
                window.lastPlanRationale = parsed.rationale;
            }
            
            // 转换格式以匹配现有结构
            return parsed.plan.map(item => ({
                day: item.day,
                name: item.name,
                duration: item.duration,
                note: item.note || '',
                type: item.type || 'walking'
            }));
        } else {
            throw new Error('计划数据格式不正确');
        }
    } catch (error) {
        console.error('解析AI响应失败:', error);
        console.error('原始内容:', content);
        
        // 如果JSON解析失败，尝试从文本中提取信息
        // 这里可以添加更复杂的文本解析逻辑
        throw new Error('无法解析AI返回的计划数据，请重试。');
    }
}


// 渲染简单日历（28天网格）
function renderSimpleCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // 直接渲染28天的计划
    exercisePlan.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = `calendar-day ${day.type}`;
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = `第${day.day}天`;
        
        const dayActivity = document.createElement('div');
        dayActivity.className = 'day-activity';
        dayActivity.textContent = day.name;
        
        const dayDuration = document.createElement('div');
        dayDuration.className = 'day-duration';
        dayDuration.textContent = `⏱️ ${day.duration}分钟`;
        
        const dayNote = document.createElement('div');
        dayNote.className = 'day-note';
        dayNote.textContent = day.note || '';
        
        dayCard.appendChild(dayNumber);
        dayCard.appendChild(dayActivity);
        dayCard.appendChild(dayDuration);
        if (day.note) {
            dayCard.appendChild(dayNote);
        }
        
        grid.appendChild(dayCard);
    });
}


// 绑定计划面板事件
function bindPlanEvents() {
    const saveReminderBtn = document.getElementById('saveReminderBtn');
    const goToDietBtn = document.getElementById('goToDietBtn');
    
    if (saveReminderBtn && !saveReminderBtn.hasAttribute('data-bound')) {
        saveReminderBtn.setAttribute('data-bound', 'true');
        saveReminderBtn.addEventListener('click', setupReminder);
    }
    
    // 进入饮食计划按钮（跳转到home）
    if (goToDietBtn && !goToDietBtn.hasAttribute('data-bound')) {
        goToDietBtn.setAttribute('data-bound', 'true');
        goToDietBtn.addEventListener('click', () => {
            window.location.href = 'home.html';
        });
    }
}

// 设置提醒
function setupReminder() {
    const timeInput = document.getElementById('reminderTime');
    const statusDiv = document.getElementById('reminderStatus');
    
    if (!timeInput.value) {
        alert('请选择提醒时间');
        return;
    }
    
    // 保存到 localStorage
    localStorage.setItem('exercise_reminder_time', timeInput.value);
    
    // 显示成功消息
    statusDiv.classList.remove('hidden');
    statusDiv.classList.add('success');
    statusDiv.textContent = `✅ 提醒时间已设置为：每天 ${timeInput.value}`;
    
    // 请求浏览器通知权限
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('通知权限已授予');
            }
        });
    }
    
    // 设置每日提醒（使用浏览器通知）
    scheduleDailyReminder(timeInput.value);
}

// 安排每日提醒
function scheduleDailyReminder(time) {
    const [hours, minutes] = time.split(':').map(Number);
    
    // 计算今天该时间的毫秒数
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    // 如果今天的时间已过，设置为明天
    if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    console.log(`提醒将在 ${Math.round(timeUntilReminder / 1000 / 60)} 分钟后触发`);
    
    // 设置定时器
    setTimeout(() => {
        showReminderNotification();
        // 设置每日重复（24小时后）
        setInterval(showReminderNotification, 24 * 60 * 60 * 1000);
    }, timeUntilReminder);
}

// 显示提醒通知
function showReminderNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('运动提醒', {
            body: '该进行今天的运动了！查看您的28天运动计划。',
            icon: '📅',
            badge: '📅'
        });
        
        notification.onclick = () => {
            window.focus();
            const panel = document.getElementById('exercisePlanPanel');
            panel.classList.remove('hidden');
        };
    }
}

// 加载保存的提醒时间
function loadReminderTime() {
    const savedTime = localStorage.getItem('exercise_reminder_time');
    if (savedTime) {
        const timeInput = document.getElementById('reminderTime');
        timeInput.value = savedTime;
        
        const statusDiv = document.getElementById('reminderStatus');
        statusDiv.classList.remove('hidden');
        statusDiv.classList.add('success');
        statusDiv.textContent = `✅ 当前提醒时间：每天 ${savedTime}`;
    }
}

