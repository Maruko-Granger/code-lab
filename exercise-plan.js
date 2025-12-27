// ============================================
// 28天运动计划页面逻辑
// ============================================

// 默认API配置（与主页面一致）
const DEFAULT_API_CONFIG = {
    api_url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    api_key: 'aa624787a3714d2fa38ae7de782cae9d.KQyKqD6GCHy1QtXy',
    model_name: 'glm-4.7'
};

let apiConfig = DEFAULT_API_CONFIG;
let exercisePlan = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载计划数据
    loadExercisePlan();
    
    // 渲染日历
    renderSimpleCalendar();
    
    // 显示计划合理性说明
    displayPlanRationale();
    
    // 加载保存的提醒时间
    loadReminderTime();
    
    // 绑定事件
    bindEvents();
    
    // 绑定重新设计功能
    bindRedesignEvents();
});

// 加载运动计划
function loadExercisePlan() {
    // 先尝试从localStorage读取
    const savedPlan = localStorage.getItem('exercise_plan');
    if (savedPlan) {
        try {
            exercisePlan = JSON.parse(savedPlan);
            return;
        } catch (e) {
            console.error('解析保存的计划失败:', e);
        }
    }
    
    // 如果没有保存的计划，使用默认计划
    exercisePlan = generateExercisePlan();
    localStorage.setItem('exercise_plan', JSON.stringify(exercisePlan));
}

// 生成28天运动计划数据
function generateExercisePlan() {
    const plan = [];
    
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
    if (window.lastPlanRationale) {
        return window.lastPlanRationale;
    }
    return "本计划结合有氧运动（快走）、柔韧性训练（太极拳/八段锦）和力量训练，每周安排休息日，循序渐进，适合糖尿病患者。运动强度适中，时长控制在20-40分钟，有助于血糖控制和身体机能改善。";
}

// 显示计划合理性说明
function displayPlanRationale() {
    const rationaleText = document.getElementById('planRationaleText');
    if (rationaleText) {
        rationaleText.textContent = getPlanRationale();
    }
}

// 渲染简单日历（28天网格）
function renderSimpleCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid || !exercisePlan) return;
    
    grid.innerHTML = '';
    
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
        
        dayCard.appendChild(dayNumber);
        dayCard.appendChild(dayActivity);
        dayCard.appendChild(dayDuration);
        
        if (day.note) {
            const dayNote = document.createElement('div');
            dayNote.className = 'day-note';
            dayNote.textContent = day.note;
            dayCard.appendChild(dayNote);
        }
        
        grid.appendChild(dayCard);
    });
}

// 绑定事件
function bindEvents() {
    // 返回按钮
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // 主页按钮
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = 'home.html';
        });
    }
    
    // 设置提醒按钮
    const saveReminderBtn = document.getElementById('saveReminderBtn');
    if (saveReminderBtn) {
        saveReminderBtn.addEventListener('click', setupReminder);
    }
    
    // 进入饮食计划按钮
    const goToDietBtn = document.getElementById('goToDietBtn');
    if (goToDietBtn) {
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

// 加载保存的提醒时间
function loadReminderTime() {
    const savedTime = localStorage.getItem('exercise_reminder_time');
    const timeInput = document.getElementById('reminderTime');
    if (savedTime && timeInput) {
        timeInput.value = savedTime;
    }
}

// 安排每日提醒
function scheduleDailyReminder(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    // 如果今天的提醒时间已过，设置为明天
    if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const msUntilReminder = reminderTime.getTime() - now.getTime();
    
    setTimeout(() => {
        showReminderNotification();
        // 每天重复
        scheduleDailyReminder(timeStr);
    }, msUntilReminder);
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
            window.location.href = 'exercise-plan.html';
        };
    }
}

// 绑定重新设计功能
function bindRedesignEvents() {
    const redesignBtn = document.getElementById('redesignBtn');
    if (redesignBtn) {
        redesignBtn.addEventListener('click', () => {
            const redesignInput = document.getElementById('redesignInput');
            if (redesignInput && redesignInput.value.trim()) {
                redesignExercisePlan(redesignInput.value.trim());
            } else {
                alert('请输入您的需求');
            }
        });
    }
}

// 重新设计运动计划
async function redesignExercisePlan(userRequest) {
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
        localStorage.setItem('exercise_plan', JSON.stringify(exercisePlan));
        
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
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (redesignBtn) redesignBtn.disabled = false;
        if (redesignInput) redesignInput.disabled = false;
        if (redesignInput) redesignInput.value = '';
    }
}

// 调用AI生成运动计划
async function callAIForExercisePlan(userRequest) {
    const { api_url, api_key, model_name } = apiConfig;
    
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
    
    const requestBody = {
        model: model_name,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ]
    };
    
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
        let jsonStr = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }
        
        const parsed = JSON.parse(jsonStr.trim());
        
        if (parsed.plan && Array.isArray(parsed.plan) && parsed.plan.length === 28) {
            if (parsed.rationale) {
                window.lastPlanRationale = parsed.rationale;
            }
            
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
        throw new Error('无法解析AI返回的计划数据，请重试。');
    }
}

