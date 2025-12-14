const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/coding/paas/v4/chat/completions';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ZhipuResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export function getApiKey(): string | null {
  return localStorage.getItem('zhipu_api_key');
}

export function setApiKey(key: string): void {
  localStorage.setItem('zhipu_api_key', key);
}

export function removeApiKey(): void {
  localStorage.removeItem('zhipu_api_key');
}

export async function chatWithAI(
  messages: Message[],
  onStream?: (chunk: string) => void
): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API Key 未设置');
  }

  const response = await fetch(ZHIPU_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'GLM-4.6',
      messages,
      stream: !!onStream,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 请求失败: ${response.status} - ${error}`);
  }

  if (onStream && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              onStream(content);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    return fullContent;
  }

  const data: ZhipuResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

// 解析 AI 返回的 JSON
export function parseAIResponse<T>(response: string): T | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch {
    console.error('Failed to parse AI response:', response);
    return null;
  }
}

// 端到端 AI 引导流程的 Prompts
export const AI_GUIDED_PROMPTS = {
  suggestPersonas: (userInput: string) => `
用户的初步想法：${userInput}

请生成 4 个目标人群选项。必须严格返回以下 JSON 格式，不要包含任何其他内容：
{
  "type": "single",
  "question": "你的目标用户是谁？",
  "options": [
    {"id": "1", "label": "人群描述", "description": "更详细的说明"},
    {"id": "2", "label": "人群描述", "description": "更详细的说明"},
    {"id": "3", "label": "人群描述", "description": "更详细的说明"},
    {"id": "4", "label": "人群描述", "description": "更详细的说明"}
  ]
}
只返回 JSON，不要其他任何文字。`,

  suggestScenarios: (persona: string) => `
目标人群：${persona}

请生成 4 个使用场景选项。必须严格返回以下 JSON 格式：
{
  "type": "single",
  "question": "用户在什么场景下使用？",
  "options": [
    {"id": "1", "label": "场景描述", "description": "具体情境"},
    {"id": "2", "label": "场景描述", "description": "具体情境"},
    {"id": "3", "label": "场景描述", "description": "具体情境"},
    {"id": "4", "label": "场景描述", "description": "具体情境"}
  ]
}
只返回 JSON。`,

  suggestOutcomes: (persona: string, scenario: string) => `
目标人群：${persona}
使用场景：${scenario}

请生成 4 个期望结果选项。必须严格返回以下 JSON 格式：
{
  "type": "single",
  "question": "用户想要达成什么结果？",
  "options": [
    {"id": "1", "label": "结果描述", "description": "可衡量的效果"},
    {"id": "2", "label": "结果描述", "description": "可衡量的效果"},
    {"id": "3", "label": "结果描述", "description": "可衡量的效果"},
    {"id": "4", "label": "结果描述", "description": "可衡量的效果"}
  ]
}
只返回 JSON。`,

  suggestMetrics: (persona: string, scenario: string, outcome: string) => `
目标人群：${persona}
使用场景：${scenario}
期望结果：${outcome}

请生成 4 个北极星指标选项。必须严格返回以下 JSON 格式：
{
  "type": "single",
  "question": "你的核心衡量指标是什么？",
  "options": [
    {"id": "1", "label": "指标名称", "description": "如何衡量"},
    {"id": "2", "label": "指标名称", "description": "如何衡量"},
    {"id": "3", "label": "指标名称", "description": "如何衡量"},
    {"id": "4", "label": "指标名称", "description": "如何衡量"}
  ]
}
只返回 JSON。`,

  generateFullProject: (persona: string, scenario: string, outcome: string, metric: string) => `
根据以下信息生成完整的项目定义：
- 目标人群：${persona}
- 使用场景：${scenario}
- 期望结果：${outcome}
- 北极星指标：${metric}

必须严格返回以下 JSON 格式：
{
  "prd": "为【人群】在【场景】提供【结果】，用【关键机制】在 7 天内做到【具体指标】。",
  "loops": [
    {"trigger": "触发条件1", "action": "用户行动1", "reward": "即时反馈1"},
    {"trigger": "触发条件2", "action": "用户行动2", "reward": "即时反馈2"},
    {"trigger": "触发条件3", "action": "用户行动3", "reward": "即时反馈3"}
  ]
}
只返回 JSON。`,

  // Spec 阶段 - 生成功能选项 (多选)
  suggestFeatures: (prd: string, loops: Array<{ trigger: string; action: string; reward: string }>) => `
根据产品需求和行为闭环：
PRD：${prd}
闭环：${JSON.stringify(loops)}

生成 8 个核心功能选项供用户多选。必须严格返回以下 JSON 格式：
{
  "type": "multiple",
  "question": "选择你需要的核心功能（可多选，建议5-7个）",
  "options": [
    {"id": "1", "label": "功能名称", "description": "功能简要说明"},
    {"id": "2", "label": "功能名称", "description": "功能简要说明"},
    {"id": "3", "label": "功能名称", "description": "功能简要说明"},
    {"id": "4", "label": "功能名称", "description": "功能简要说明"},
    {"id": "5", "label": "功能名称", "description": "功能简要说明"},
    {"id": "6", "label": "功能名称", "description": "功能简要说明"},
    {"id": "7", "label": "功能名称", "description": "功能简要说明"},
    {"id": "8", "label": "功能名称", "description": "功能简要说明"}
  ]
}
只返回 JSON。`,

  // Spec 阶段 - 生成用户故事选项 (多选)
  suggestUserStories: (prd: string, features: string[]) => `
根据 PRD 和功能列表：
PRD：${prd}
功能：${features.join('、')}

生成 6 个用户故事选项供用户多选。必须严格返回以下 JSON 格式：
{
  "type": "multiple",
  "question": "选择最重要的用户故事（可多选，建议3个）",
  "options": [
    {"id": "1", "label": "故事标题", "description": "作为X我想要Y以便Z", "value": {"asA": "用户角色", "iWant": "想要做什么", "soThat": "为了什么目的"}},
    {"id": "2", "label": "故事标题", "description": "作为X我想要Y以便Z", "value": {"asA": "用户角色", "iWant": "想要做什么", "soThat": "为了什么目的"}},
    {"id": "3", "label": "故事标题", "description": "作为X我想要Y以便Z", "value": {"asA": "用户角色", "iWant": "想要做什么", "soThat": "为了什么目的"}},
    {"id": "4", "label": "故事标题", "description": "作为X我想要Y以便Z", "value": {"asA": "用户角色", "iWant": "想要做什么", "soThat": "为了什么目的"}},
    {"id": "5", "label": "故事标题", "description": "作为X我想要Y以便Z", "value": {"asA": "用户角色", "iWant": "想要做什么", "soThat": "为了什么目的"}},
    {"id": "6", "label": "故事标题", "description": "作为X我想要Y以便Z", "value": {"asA": "用户角色", "iWant": "想要做什么", "soThat": "为了什么目的"}}
  ]
}
只返回 JSON。`,

  // Spec 阶段 - 生成状态机和文案包 (自动生成，无需选择)
  generateStatesAndCopy: (prd: string, features: string[], persona: string) => `
根据以下信息生成状态机定义和文案包：
PRD：${prd}
功能：${features.join('、')}
用户：${persona}

必须严格返回以下 JSON 格式：
{
  "stateMachine": {
    "empty": "空态时显示的内容",
    "success": "成功时显示的内容",
    "failure": "失败时显示的内容",
    "noPermission": "无权限时显示的内容",
    "offline": "离线时显示的内容"
  },
  "copyPack": {
    "firstScreen": "首屏欢迎语",
    "guidance": "引导操作文案",
    "errorState": "错误提示文案",
    "emptyState": "空态提示文案"
  }
}
只返回 JSON。`,

  // Spec 阶段 - 生成埋点选项 (多选)
  suggestTrackingEvents: (features: string[], stories: Array<{ asA: string; iWant: string; soThat: string }>) => `
根据功能和用户故事：
功能：${features.join('、')}
故事：${JSON.stringify(stories)}

生成 8 个埋点事件选项供用户多选。必须严格返回以下 JSON 格式：
{
  "type": "multiple",
  "question": "选择需要的埋点事件（建议5个关键事件）",
  "options": [
    {"id": "1", "label": "事件名", "description": "属性: xxx | 触发: xxx", "value": {"name": "event_name", "props": "user_id, action", "when": "触发条件"}},
    {"id": "2", "label": "事件名", "description": "属性: xxx | 触发: xxx", "value": {"name": "event_name", "props": "user_id, action", "when": "触发条件"}},
    {"id": "3", "label": "事件名", "description": "属性: xxx | 触发: xxx", "value": {"name": "event_name", "props": "user_id, action", "when": "触发条件"}},
    {"id": "4", "label": "事件名", "description": "属性: xxx | 触发: xxx", "value": {"name": "event_name", "props": "user_id, action", "when": "触发条件"}},
    {"id": "5", "label": "事件名", "description": "属性: xxx | 触发: xxx", "value": {"name": "event_name", "props": "user_id, action", "when": "触发条件"}},
    {"id": "6", "label": "事件名", "description": "属性: xxx | 触发: xxx", "value": {"name": "event_name", "props": "user_id, action", "when": "触发条件"}},
    {"id": "7", "label": "事件名", "description": "属性: xxx | 触发: xxx", "value": {"name": "event_name", "props": "user_id, action", "when": "触发条件"}},
    {"id": "8", "label": "事件名", "description": "属性: xxx | 触发: xxx", "value": {"name": "event_name", "props": "user_id, action", "when": "触发条件"}}
  ]
}
只返回 JSON。`,

  // Build 阶段 - 选择技术栈
  suggestTechStack: (prd: string, features: string[]) => `
根据产品需求和功能：
PRD：${prd}
功能：${features.join('、')}

生成 4 个技术栈方案选项。必须严格返回以下 JSON 格式：
{
  "type": "single",
  "question": "选择最适合的技术栈方案",
  "options": [
    {"id": "1", "label": "方案名称", "description": "技术组合说明 (如: React + Supabase + Tailwind)"},
    {"id": "2", "label": "方案名称", "description": "技术组合说明"},
    {"id": "3", "label": "方案名称", "description": "技术组合说明"},
    {"id": "4", "label": "方案名称", "description": "技术组合说明"}
  ]
}
只返回 JSON。`,

  // Build 阶段 - 生成路由设计
  generateRoutes: (prd: string, features: string[], stories: Array<{ asA: string; iWant: string; soThat: string }>) => `
根据产品需求、功能和用户故事：
PRD：${prd}
功能：${features.join('、')}
用户故事：${JSON.stringify(stories)}

设计前端路由结构。必须严格返回以下 JSON 格式：
{
  "routes": "/ 首页\\n/login 登录页\\n/dashboard 控制台\\n  /dashboard/overview 概览\\n  /dashboard/settings 设置\\n/profile 个人中心\\n..."
}
使用换行和缩进表示层级关系。只返回 JSON。`,

  // Build 阶段 - 生成数据模型设计
  generateDataModel: (prd: string, features: string[], techStack: string) => `
根据产品需求、功能和技术栈：
PRD：${prd}
功能：${features.join('、')}
技术栈：${techStack}

设计数据模型。必须严格返回以下 JSON 格式：
{
  "dataModel": "## 用户表 (users)\\n- id: uuid, 主键\\n- email: string, 邮箱\\n- name: string, 用户名\\n- created_at: timestamp\\n\\n## 内容表 (contents)\\n- id: uuid, 主键\\n- user_id: uuid, 外键关联 users\\n- title: string, 标题\\n- content: text, 内容\\n..."
}
使用 Markdown 格式描述表结构。只返回 JSON。`,

  // Build 阶段 - 生成切片任务规划
  generateSlicePlan: (loops: Array<{ trigger: string; action: string; reward: string }>, features: string[], prd: string) => `
根据行为闭环和功能列表，规划 3 个垂直切片任务：
闭环：${JSON.stringify(loops)}
功能：${features.join('、')}
PRD：${prd}

每个切片对应一个闭环，包含具体的开发任务。
必须严格返回以下 JSON 格式：
{
  "slices": [
    {
      "loop": 1,
      "name": "切片名称（如：核心注册流程）",
      "description": "切片目标描述",
      "tasks": ["具体开发任务1", "具体开发任务2", "具体开发任务3"],
      "estimatedTime": "预估时间（如：2天）"
    },
    {
      "loop": 2,
      "name": "切片名称",
      "description": "切片目标描述",
      "tasks": ["具体开发任务1", "具体开发任务2", "具体开发任务3"],
      "estimatedTime": "预估时间"
    },
    {
      "loop": 3,
      "name": "切片名称",
      "description": "切片目标描述",
      "tasks": ["具体开发任务1", "具体开发任务2", "具体开发任务3"],
      "estimatedTime": "预估时间"
    }
  ]
}
只返回 JSON。`,

  // Build 阶段 - 生成完整 Build 配置
  generateBuildConfig: (prd: string, features: string[], techStack: string, routes: string, dataModel: string) => `
根据以下信息生成环境配置和发布说明：
PRD：${prd}
功能：${features.join('、')}
技术栈：${techStack}
路由：${routes}
数据模型：${dataModel}

必须严格返回以下 JSON 格式：
{
  "env": "NODE_ENV=development\\nAPI_URL=https://api.example.com\\nSUPABASE_URL=xxx\\nSUPABASE_ANON_KEY=xxx",
  "releaseNote": "v0.1.0 MVP 版本\\n\\n主要功能：\\n- 功能1描述\\n- 功能2描述\\n\\n技术栈：xxx\\n\\n注意事项：\\n- 注意点1\\n- 注意点2"
}
只返回 JSON。`,

  // Growth 阶段 - 生成 Before/After 对比图描述词
  generateBeforeAfter: (prd: string, persona: string, outcome: string) => `
根据以下产品信息生成 Before/After 对比图的图片生成描述词（Prompt）：
PRD：${prd}
目标用户：${persona}
期望结果：${outcome}

生成两张图的详细描述，用户可以直接复制到 Midjourney、DALL-E 或 Stable Diffusion 生成图片。
必须严格返回以下 JSON 格式：
{
  "beforeAfter": {
    "before": {
      "prompt": "英文图片生成 Prompt，描述使用产品前的痛苦状态，包含风格、构图、色调等细节",
      "description": "中文说明：这张图展示什么场景"
    },
    "after": {
      "prompt": "英文图片生成 Prompt，描述使用产品后的理想状态，包含风格、构图、色调等细节",
      "description": "中文说明：这张图展示什么场景"
    },
    "socialCopy": "完整的对比图描述文案，可用于社交媒体配文"
  }
}
只返回 JSON。`,

  // Growth 阶段 - 生成 15 秒短视频脚本
  generateVideoScript: (prd: string, persona: string, outcome: string, features: string[]) => `
根据以下产品信息生成 15 秒短视频脚本：
PRD：${prd}
目标用户：${persona}
期望结果：${outcome}
核心功能：${features.join('、')}

脚本要遵循：痛点(0-5s) → 解决方案(5-12s) → CTA(12-15s) 的结构。
必须严格返回以下 JSON 格式：
{
  "videoScript": {
    "hook": {"time": "0-5s", "text": "痛点描述，抓住注意力", "visual": "画面描述"},
    "solution": {"time": "5-12s", "text": "展示解决方案和结果", "visual": "画面描述"},
    "cta": {"time": "12-15s", "text": "行动号召语", "visual": "画面描述"},
    "fullScript": "完整脚本文案（可直接朗读）",
    "hashtags": ["相关话题标签1", "话题标签2", "话题标签3"]
  }
}
只返回 JSON。`,

  // Growth 阶段 - 生成长文大纲
  generateLongformOutline: (prd: string, persona: string, outcome: string, scenario: string) => `
根据以下产品信息生成一篇真实故事/复盘风格的长文大纲：
PRD：${prd}
目标用户：${persona}
使用场景：${scenario}
期望结果：${outcome}

大纲要适合公众号、知乎或 Medium 发布。
必须严格返回以下 JSON 格式：
{
  "longformOutline": {
    "title": "文章标题（吸引人点击）",
    "subtitle": "副标题/引言",
    "sections": [
      {"heading": "1. 问题背景", "points": ["要点1", "要点2"], "wordCount": 200},
      {"heading": "2. 尝试过的方案", "points": ["要点1", "要点2"], "wordCount": 150},
      {"heading": "3. 发现的解决方案", "points": ["要点1", "要点2"], "wordCount": 300},
      {"heading": "4. 实际效果与数据", "points": ["要点1", "要点2"], "wordCount": 200},
      {"heading": "5. 复盘与总结", "points": ["要点1", "要点2"], "wordCount": 150}
    ],
    "targetPlatform": "适合发布的平台",
    "estimatedReadTime": "预估阅读时间"
  }
}
只返回 JSON。`,

  // Growth 阶段 - 生成可领取资产选项
  suggestDownloadableAssets: (prd: string, features: string[], persona: string) => `
根据以下产品信息建议可领取资产：
PRD：${prd}
功能：${features.join('、')}
目标用户：${persona}

生成 4 个可领取资产选项（模板、清单、提示词包等）。
必须严格返回以下 JSON 格式：
{
  "type": "single",
  "question": "选择你想提供的可领取资产类型",
  "options": [
    {"id": "1", "label": "资产名称", "description": "资产描述和价值", "value": {"type": "资产类型", "content": "资产内容大纲"}},
    {"id": "2", "label": "资产名称", "description": "资产描述和价值", "value": {"type": "资产类型", "content": "资产内容大纲"}},
    {"id": "3", "label": "资产名称", "description": "资产描述和价值", "value": {"type": "资产类型", "content": "资产内容大纲"}},
    {"id": "4", "label": "资产名称", "description": "资产描述和价值", "value": {"type": "资产类型", "content": "资产内容大纲"}}
  ]
}
只返回 JSON。`,
};

// SOP 相关的 AI 提示词
export const SOP_PROMPTS = {
  generatePRD: (persona: string, scenario: string, outcome: string) => `
你是一个产品专家。根据以下信息生成一句话 PRD：
- 目标人群：${persona || '未指定'}
- 使用场景：${scenario || '未指定'}
- 期望结果：${outcome || '未指定'}

请用这个格式："为【人群】在【场景】提供【结果】，用【关键机制】在 7 天内做到【指标】。"
只返回这一句话，不要其他解释。
`,

  suggestLoops: (prd: string) => `
根据这个产品需求："${prd}"

设计 3 个用户行为闭环，每个闭环包含：
- 触发（用户何时来）
- 行动（做什么）
- 回报（立即得到什么）

用 JSON 格式返回：
[{"trigger": "...", "action": "...", "reward": "..."}]
只返回 JSON，不要其他内容。
`,

  generateUserStories: (prd: string, features: string) => `
根据产品需求："${prd}"
功能列表：${features}

生成 3 个用户故事，格式：
[{"asA": "作为...", "iWant": "我想要...", "soThat": "以便..."}]
只返回 JSON。
`,

  suggestFeatures: (prd: string) => `
根据产品需求："${prd}"

列出 7 个核心功能（按优先级排序），用 JSON 数组格式：
["功能1", "功能2", ...]
只返回 JSON。
`,

  generateCopy: (context: string, type: 'firstScreen' | 'guidance' | 'errorState' | 'emptyState') => {
    const typeMap = {
      firstScreen: '首屏文案（吸引用户，说明价值）',
      guidance: '引导文案（帮助用户开始）',
      errorState: '错误状态文案（安抚用户，提供解决方案）',
      emptyState: '空状态文案（引导用户创建内容）',
    };
    return `
产品背景：${context}

请生成${typeMap[type]}，要求：
- 简洁有力
- 符合产品调性
- 有行动引导

直接返回文案内容，不要解释。
`;
  },

  suggestTracking: (features: string) => `
根据功能列表：${features}

设计 5 个关键埋点事件，格式：
[{"name": "事件名", "props": "属性", "when": "触发时机"}]
只返回 JSON。
`,

  analyzeGrowth: (context: string) => `
产品背景：${context}

请生成增长物料建议：
1. Before/After 对比图描述
2. 15秒短视频脚本（痛点→结果→CTA）
3. 长文大纲（3-5个要点）

用清晰的分段格式返回。
`,
};
