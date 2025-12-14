/**
 * Project 阶段相关的 AI Prompts
 */

export const projectPrompts = {
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

  // SOP 相关
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
};
