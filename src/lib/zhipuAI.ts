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
