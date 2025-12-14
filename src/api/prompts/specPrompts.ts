/**
 * Spec 阶段相关的 AI Prompts
 */

import type { UserStory } from '@/types/aiOptions';

export const specPrompts = {
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

  suggestTrackingEvents: (features: string[], stories: UserStory[]) => `
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

  // SOP 相关
  generateUserStories: (prd: string, features: string) => `
根据产品需求："${prd}"
功能列表：${features}

生成 3 个用户故事，格式：
[{"asA": "作为...", "iWant": "我想要...", "soThat": "以便..."}]
只返回 JSON。
`,

  suggestFeaturesSimple: (prd: string) => `
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
};
