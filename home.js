// ============================================
// 个人主页逻辑
// ============================================

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载医嘱历史
    loadPrescriptionHistory();
    
    // 加载运动计划可视化
    loadExercisePlanVisualization();
    
    // 加载打卡情况可视化
    loadCheckinVisualization();
    
    // 绑定按钮事件
    document.getElementById('goToDietBtn').addEventListener('click', () => {
        window.location.href = 'diet.html';
    });
    
    document.getElementById('goToCheckinBtn').addEventListener('click', () => {
        window.location.href = 'checkin.html';
    });
});

// 加载医嘱历史
function loadPrescriptionHistory() {
    const history = JSON.parse(localStorage.getItem('prescription_history') || '[]');
    const container = document.getElementById('prescriptionHistory');
    
    if (!container) return;
    
    if (history.length === 0) {
        container.innerHTML = '<p class="empty-message">暂无医嘱记录</p>';
        return;
    }
    
    container.innerHTML = '';
    
    // 只显示最近5条记录
    const recentHistory = history.slice(0, 5);
    
    recentHistory.forEach((record, index) => {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'prescription-item';
        
        recordDiv.innerHTML = `
            <div class="prescription-date">${record.date}</div>
            <div class="prescription-content">${record.summary.substring(0, 100)}${record.summary.length > 100 ? '...' : ''}</div>
        `;
        
        container.appendChild(recordDiv);
    });
    
    // 如果记录超过5条，显示提示
    if (history.length > 5) {
        const moreDiv = document.createElement('div');
        moreDiv.className = 'more-records';
        moreDiv.textContent = `还有 ${history.length - 5} 条记录...`;
        container.appendChild(moreDiv);
    }
}

// 加载运动计划可视化
function loadExercisePlanVisualization() {
    const exercisePlan = EXERCISE_PLAN_DATA;
    const previewContainer = document.getElementById('planPreview');
    const daysEl = document.getElementById('planDays');
    const activitiesEl = document.getElementById('planActivities');
    
    if (!previewContainer) return;
    
    // 更新统计
    if (daysEl) daysEl.textContent = exercisePlan.length;
    
    // 统计运动类型
    const activityTypes = new Set(exercisePlan.map(item => item.type));
    if (activitiesEl) activitiesEl.textContent = activityTypes.size;
    
    // 显示计划预览
    if (exercisePlan.length > 0) {
        // 统计每种类型的天数
        const typeCount = {};
        exercisePlan.forEach(day => {
            typeCount[day.type] = (typeCount[day.type] || 0) + 1;
        });
        
        const typeNames = {
            'walking': '快走',
            'taichi': '太极拳',
            'strength': '力量训练',
            'rest': '休息'
        };
        
        const typeColors = {
            'walking': '#28a745',
            'taichi': '#17a2b8',
            'strength': '#ffc107',
            'rest': '#999'
        };
        
        let previewHTML = '<div class="plan-type-list">';
        Object.keys(typeCount).forEach(type => {
            const count = typeCount[type];
            const percentage = Math.round((count / exercisePlan.length) * 100);
            previewHTML += `
                <div class="plan-type-item">
                    <div class="plan-type-info">
                        <span class="plan-type-dot" style="background-color: ${typeColors[type]}"></span>
                        <span class="plan-type-name">${typeNames[type] || type}</span>
                        <span class="plan-type-count">${count}天</span>
                    </div>
                    <div class="plan-type-bar">
                        <div class="plan-type-bar-fill" style="width: ${percentage}%; background-color: ${typeColors[type]}"></div>
                    </div>
                </div>
            `;
        });
        previewHTML += '</div>';
        
        previewContainer.innerHTML = previewHTML;
    } else {
        previewContainer.innerHTML = '<p class="empty-message">暂无运动计划</p>';
    }
}

// 加载打卡情况可视化
function loadCheckinVisualization() {
    const checkinData = JSON.parse(localStorage.getItem('checkin_data') || '{}');
    const exercisePlan = EXERCISE_PLAN_DATA;
    
    // 计算统计信息
    const completedCount = Object.values(checkinData).filter(c => c.completed).length;
    const streakDays = calculateStreakDays(checkinData);
    const completionRate = Math.round((completedCount / exercisePlan.length) * 100);
    
    // 更新统计显示
    const completedDaysEl = document.getElementById('homeCompletedDays');
    const streakDaysEl = document.getElementById('homeStreakDays');
    const completionRateEl = document.getElementById('homeCompletionRate');
    
    if (completedDaysEl) completedDaysEl.textContent = completedCount;
    if (streakDaysEl) streakDaysEl.textContent = streakDays;
    if (completionRateEl) completionRateEl.textContent = completionRate + '%';
    
    // 生成打卡图表
    const chartContainer = document.getElementById('checkinChart');
    if (!chartContainer) return;
    
    if (completedCount === 0) {
        chartContainer.innerHTML = '<p class="empty-message">开始打卡查看进度</p>';
        return;
    }
    
    // 生成简单的进度条
    const totalDays = exercisePlan.length;
    const completed = completedCount;
    const percentage = (completed / totalDays) * 100;
    
    chartContainer.innerHTML = `
        <div class="progress-bar-container">
            <div class="progress-bar-label">
                <span>总体进度</span>
                <span class="progress-percentage">${completed}/${totalDays} (${Math.round(percentage)}%)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

// 计算连续打卡天数（与checkin.js中的逻辑一致）
function calculateStreakDays(checkinData) {
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

