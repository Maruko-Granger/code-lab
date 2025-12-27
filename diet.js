// ============================================
// 饮食计划页面逻辑
// ============================================

// 默认API配置（与主页面一致）
const DEFAULT_API_CONFIG = {
    api_url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    api_key: 'aa624787a3714d2fa38ae7de782cae9d.KQyKqD6GCHy1QtXy',
    model_name: 'glm-4.7'
};

let apiConfig = DEFAULT_API_CONFIG;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 先检查是否有缓存的饮食总结
    const cachedDietSummary = localStorage.getItem('diet_summary_cached');
    
    if (cachedDietSummary) {
        try {
            // 直接使用缓存，立即显示
            const summary = JSON.parse(cachedDietSummary);
            displayDietSummary(summary);
            
            // 绑定按钮
            bindButtons();
            return; // 直接返回，不调用API
        } catch (e) {
            console.error('解析缓存失败:', e);
            // 如果解析失败，继续使用API生成
        }
    }
    
    // 读取AI总结
    const aiSummary = localStorage.getItem('ai_summary');
    
    if (aiSummary) {
        // 生成3句话（只在没有缓存时调用）
        await generateDietSummary(aiSummary);
    } else {
        // 如果没有AI总结，显示提示
        showNoSummaryMessage();
    }
    
    // 绑定返回按钮
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // 绑定主页按钮
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = 'home.html';
        });
    }
    
    // 绑定按钮
    bindButtons();
});

// 绑定按钮事件
function bindButtons() {
    // 绑定返回按钮
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // 绑定主页按钮
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = 'home.html';
        });
    }
    
    // 绑定确认按钮（跳转到home页面）
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            window.location.href = 'home.html';
        });
    }
}

// 生成饮食总结（3句话）
async function generateDietSummary(aiSummary) {
    try {
        // 调用AI提取3句话
        const summary = await callAIForDietSummary(aiSummary);
        
        // 保存到缓存
        localStorage.setItem('diet_summary_cached', JSON.stringify(summary));
        
        // 显示总结
        displayDietSummary(summary);
    } catch (error) {
        console.error('生成饮食总结失败:', error);
        // 如果AI调用失败，尝试简单解析
        displaySimpleSummary(aiSummary);
    }
}

// 调用AI生成饮食总结
async function callAIForDietSummary(aiSummary) {
    const { api_url, api_key, model_name } = apiConfig;
    
    const prompt = `请从以下医嘱总结中，提取并生成3句话，格式要求如下：

1. 第一句：建议饮食（推荐吃什么，饮食原则）
2. 第二句：饮食注意事项（需要避免什么，注意事项）
3. 第三句：一句鼓励的话（给患者的鼓励）

医嘱总结：
${aiSummary}

请严格按照以下JSON格式返回：
{
  "dietAdvice": "建议饮食的一句话",
  "precautions": "饮食注意事项的一句话",
  "encouragement": "鼓励的一句话"
}`;
    
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
        const content = data.choices[0].message.content;
        
        // 尝试解析JSON
        try {
            let jsonStr = content;
            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                jsonStr = jsonMatch[1];
            }
            const parsed = JSON.parse(jsonStr.trim());
            return parsed;
        } catch (e) {
            // 如果JSON解析失败，尝试从文本中提取
            return parseTextSummary(content);
        }
    } else {
        throw new Error('API 返回格式异常');
    }
}

// 解析文本格式的总结
function parseTextSummary(content) {
    // 尝试从文本中提取三句话
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
        dietAdvice: lines[0] || '请遵循医生建议的饮食原则，合理搭配营养。',
        precautions: lines[1] || '注意控制糖分摄入，避免高糖食物。',
        encouragement: lines[2] || '坚持健康饮食，您的努力一定会带来好的结果！'
    };
}

// 显示饮食总结
function displayDietSummary(summary) {
    const contentDiv = document.getElementById('dietPlanContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="diet-summary-container">
            <div class="diet-summary-card advice-card">
                <div class="card-icon">🍎</div>
                <h3>建议饮食</h3>
                <p>${summary.dietAdvice}</p>
            </div>
            
            <div class="diet-summary-card precautions-card">
                <div class="card-icon">⚠️</div>
                <h3>注意事项</h3>
                <p>${summary.precautions}</p>
            </div>
            
            <div class="diet-summary-card encouragement-card">
                <div class="card-icon">💪</div>
                <h3>鼓励</h3>
                <p>${summary.encouragement}</p>
            </div>
        </div>
        
        <div class="confirm-button-container">
            <button id="confirmBtn" class="btn btn-confirm">确认并进入主页</button>
        </div>
    `;
    
    // 重新绑定按钮
    bindButtons();
}

// 显示简单总结（如果AI调用失败）
function displaySimpleSummary(aiSummary) {
    const contentDiv = document.getElementById('dietPlanContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="diet-summary-container">
            <div class="diet-summary-card">
                <h3>医嘱总结</h3>
                <p>${aiSummary}</p>
            </div>
        </div>
        
        <div class="confirm-button-container">
            <button id="confirmBtn" class="btn btn-confirm">确认并进入主页</button>
        </div>
    `;
    
    // 重新绑定按钮
    bindButtons();
}

// 显示无总结消息
function showNoSummaryMessage() {
    const contentDiv = document.getElementById('dietPlanContent');
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="diet-placeholder">
            <p>还没有医嘱总结</p>
            <p>请先返回首页输入医嘱并生成总结</p>
            <button onclick="window.location.href='index.html'" class="btn btn-primary">返回首页</button>
        </div>
    `;
}

