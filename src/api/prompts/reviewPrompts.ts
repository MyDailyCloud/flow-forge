/**
 * Review 阶段相关的 AI Prompts
 */

export const reviewPrompts = {
  generateReviewTemplate: (prd: string, metric: string, loops: Array<{ trigger: string; action: string; reward: string }>, growthMaterials: string) => `
根据以下产品信息生成数据复盘模板：
PRD：${prd}
北极星指标：${metric}
行为闭环：${JSON.stringify(loops)}
增长物料：${growthMaterials}

必须严格返回以下 JSON 格式：
{
  "funnelTemplate": {
    "stages": ["曝光", "触达", "激活", "留存"],
    "metricsToTrack": ["UV/PV", "点击率", "转化率", "次日留存"],
    "expectedBaseline": "基于行业标准的预期基线描述"
  },
  "reviewQuestions": [
    "最大的漏斗掉落发生在哪个环节？",
    "用户在哪个步骤流失最多？",
    "哪个渠道的转化效果最好？",
    "下一个实验假设是什么？",
    "下周的优化目标应该是什么？"
  ],
  "retrospectivePrompts": [
    "本周做得好的地方",
    "本周需要改进的地方",
    "下周要尝试的新事物",
    "需要停止做的事情",
    "学到的关键教训"
  ]
}
只返回 JSON。`,
};
