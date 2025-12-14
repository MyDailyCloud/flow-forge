/**
 * Growth 阶段相关的 AI Prompts
 */

export const growthPrompts = {
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

  // SOP 相关
  analyzeGrowth: (context: string) => `
产品背景：${context}

请生成增长物料建议：
1. Before/After 对比图描述
2. 15秒短视频脚本（痛点→结果→CTA）
3. 长文大纲（3-5个要点）

用清晰的分段格式返回。
`,
};
