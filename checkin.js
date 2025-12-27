// ============================================
// 28天打卡监督功能
// ============================================

// 默认API配置（与主页面一致）
const DEFAULT_API_CONFIG = {
    api_url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    api_key: 'aa624787a3714d2fa38ae7de782cae9d.KQyKqD6GCHy1QtXy',
    model_name: 'glm-4.7'
};

let apiConfig = DEFAULT_API_CONFIG;
let exercisePlan = EXERCISE_PLAN_DATA;
let checkinData = {};
let encouragementTimer = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载打卡记录
    loadCheckinData();
    
    // 渲染打卡日历
    renderCheckinCalendar();
    
    // 更新统计信息
    updateStatistics();
    
    // 绑定返回按钮
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'diet.html';
    });
    
    // 绑定主页按钮
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = 'home.html';
        });
    }
});

// 加载打卡记录
function loadCheckinData() {
    const saved = localStorage.getItem('checkin_data');
    if (saved) {
        checkinData = JSON.parse(saved);
    }
}

// 保存打卡记录
function saveCheckinData() {
    localStorage.setItem('checkin_data', JSON.stringify(checkinData));
}

// 获取日期字符串（YYYY-MM-DD）
// 使用计划开始日期，如果localStorage中有保存则使用，否则使用今天作为第1天
function getDateString(day) {
    let startDate = localStorage.getItem('plan_start_date');
    
    if (!startDate) {
        // 如果没有开始日期，使用今天作为开始日期
        const today = new Date();
        startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        localStorage.setItem('plan_start_date', startDate);
    }
    
    // 计算目标日期
    const [year, month, date] = startDate.split('-').map(Number);
    const start = new Date(year, month - 1, date);
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + day - 1);
    
    const targetYear = targetDate.getFullYear();
    const targetMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
    const targetDay = String(targetDate.getDate()).padStart(2, '0');
    
    return `${targetYear}-${targetMonth}-${targetDay}`;
}

// 渲染打卡日历
function renderCheckinCalendar() {
    const calendar = document.getElementById('checkinCalendar');
    if (!calendar) return;
    
    calendar.innerHTML = '';
    
    // 创建7列网格
    const grid = document.createElement('div');
    grid.className = 'checkin-grid';
    
    exercisePlan.forEach(dayPlan => {
        const dayCard = createDayCard(dayPlan);
        grid.appendChild(dayCard);
    });
    
    calendar.appendChild(grid);
}

// 创建日期卡片
function createDayCard(dayPlan) {
    const card = document.createElement('div');
    card.className = `checkin-day-card ${dayPlan.type}`;
    
    const dateStr = getDateString(dayPlan.day);
    const checkin = checkinData[dateStr];
    const isCompleted = checkin && checkin.completed;
    
    if (isCompleted) {
        card.classList.add('completed');
    }
    
    // 日期编号
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = `第${dayPlan.day}天`;
    
    // 运动内容
    const activity = document.createElement('div');
    activity.className = 'day-activity';
    activity.textContent = dayPlan.name;
    
    // 运动时长
    const duration = document.createElement('div');
    duration.className = 'day-duration';
    duration.textContent = `⏱️ ${dayPlan.duration}分钟`;
    
    // 打卡按钮
    const checkinBtn = document.createElement('button');
    checkinBtn.className = `checkin-btn ${isCompleted ? 'checked' : ''}`;
    checkinBtn.innerHTML = isCompleted ? '✓ 已完成' : '点击打卡';
    checkinBtn.addEventListener('click', () => {
        toggleCheckin(dayPlan.day, dateStr);
    });
    
    // 打卡时间
    if (isCompleted && checkin.time) {
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'checkin-time';
        timeDisplay.textContent = `打卡时间：${checkin.time}`;
        card.appendChild(timeDisplay);
    }
    
    // 注意事项
    if (dayPlan.note) {
        const note = document.createElement('div');
        note.className = 'day-note';
        note.textContent = dayPlan.note;
        card.appendChild(note);
    }
    
    card.appendChild(dayNumber);
    card.appendChild(activity);
    card.appendChild(duration);
    card.appendChild(checkinBtn);
    
    return card;
}

// 切换打卡状态
function toggleCheckin(day, dateStr) {
    const checkin = checkinData[dateStr] || {};
    
    if (checkin.completed) {
        // 取消打卡
        if (confirm('确定要取消打卡吗？')) {
            delete checkinData[dateStr];
        }
    } else {
        // 完成打卡
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        checkinData[dateStr] = {
            completed: true,
            time: timeStr,
            timestamp: now.getTime()
        };
        
        // 显示鼓励弹窗
        showEncouragement();
    }
    
    // 保存数据
    saveCheckinData();
    
    // 重新渲染
    renderCheckinCalendar();
    
    // 更新统计
    updateStatistics();
}

// 显示鼓励弹窗
async function showEncouragement() {
    const modal = document.getElementById('encouragementModal');
    const textEl = document.getElementById('encouragementText');
    
    if (!modal || !textEl) return;
    
    // 清除之前的定时器
    if (encouragementTimer) {
        clearTimeout(encouragementTimer);
    }
    
    try {
        // 获取鼓励语
        const encouragement = await getEncouragementFromAPI();
        textEl.textContent = encouragement;
    } catch (error) {
        console.error('获取鼓励语失败:', error);
        // 使用默认鼓励语
        const defaultEncouragements = [
            '太棒了！继续保持！',
            '坚持就是胜利！',
            '您做得很好！',
            '继续加油！',
            '了不起的进步！'
        ];
        const randomEncouragement = defaultEncouragements[Math.floor(Math.random() * defaultEncouragements.length)];
        textEl.textContent = randomEncouragement;
    }
    
    // 显示弹窗
    modal.classList.remove('hidden');
    modal.classList.add('show');
    
    // 5秒后自动隐藏
    encouragementTimer = setTimeout(() => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300); // 等待动画完成
    }, 5000);
}

// 从智谱API获取鼓励语
async function getEncouragementFromAPI() {
    const { api_url, api_key, model_name } = apiConfig;
    
    const prompt = `请生成一句简短、温暖、鼓励的话，用于鼓励糖尿病患者坚持运动打卡。要求：
1. 一句话，不超过20个字
2. 积极正面，充满鼓励
3. 适合老年人阅读
4. 不要包含任何数字或具体指标

请只返回鼓励的话，不要返回其他内容。`;
    
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
        throw new Error(`API 请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
        let content = data.choices[0].message.content.trim();
        
        // 清理内容（移除可能的引号、标点等）
        content = content.replace(/^["'""]|["'""]$/g, '').trim();
        
        // 如果内容太长，截取前20个字
        if (content.length > 20) {
            content = content.substring(0, 20) + '...';
        }
        
        return content || '太棒了！继续保持！';
    } else {
        throw new Error('API 返回格式异常');
    }
}

// 更新统计信息
function updateStatistics() {
    // 计算已完成天数
    const completedCount = Object.values(checkinData).filter(c => c.completed).length;
    
    // 计算连续打卡天数
    const streakDays = calculateStreakDays();
    
    // 计算完成率
    const completionRate = Math.round((completedCount / 28) * 100);
    
    // 更新显示
    const completedDaysEl = document.getElementById('completedDays');
    const streakDaysEl = document.getElementById('streakDays');
    const completionRateEl = document.getElementById('completionRate');
    
    if (completedDaysEl) completedDaysEl.textContent = completedCount;
    if (streakDaysEl) streakDaysEl.textContent = streakDays;
    if (completionRateEl) completionRateEl.textContent = completionRate + '%';
}

// 计算连续打卡天数
function calculateStreakDays() {
    const dates = Object.keys(checkinData)
        .filter(date => checkinData[date].completed)
        .sort()
        .reverse(); // 从最新到最旧
    
    if (dates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < dates.length; i++) {
        const checkDate = new Date(dates[i]);
        checkDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        
        if (checkDate.getTime() === expectedDate.getTime()) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

