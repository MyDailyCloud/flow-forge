/**
 * 内容格式化工具
 * 用于格式化 AI 生成的各类内容
 */

/**
 * 格式化 Before/After 对比内容
 */
export function formatBeforeAfterContent(data: {
  before?: { prompt?: string; description?: string };
  after?: { prompt?: string; description?: string };
  socialCopy?: string;
  combined?: string;
}): string {
  return `## Before/After 对比图

### Before（使用前）
**图片生成 Prompt：**
\`\`\`
${data.before?.prompt || ''}
\`\`\`
**场景说明：** ${data.before?.description || ''}

### After（使用后）
**图片生成 Prompt：**
\`\`\`
${data.after?.prompt || ''}
\`\`\`
**场景说明：** ${data.after?.description || ''}

### 社交媒体配文
${data.socialCopy || data.combined || ''}`;
}

/**
 * 格式化视频脚本内容
 */
export function formatVideoScriptContent(data: {
  hook?: { time?: string; text?: string; visual?: string };
  solution?: { time?: string; text?: string; visual?: string };
  cta?: { time?: string; text?: string; visual?: string };
  fullScript?: string;
  hashtags?: string[];
}): string {
  return `## 15秒短视频脚本

### Hook（0-5s）
**文案：** ${data.hook?.text || ''}
**画面：** ${data.hook?.visual || ''}

### Solution（5-12s）
**文案：** ${data.solution?.text || ''}
**画面：** ${data.solution?.visual || ''}

### CTA（12-15s）
**文案：** ${data.cta?.text || ''}
**画面：** ${data.cta?.visual || ''}

### 完整脚本
${data.fullScript || ''}

### 话题标签
${(data.hashtags || []).map((t: string) => `#${t}`).join(' ')}`;
}

/**
 * 格式化长文大纲内容
 */
export function formatLongformContent(data: {
  title?: string;
  subtitle?: string;
  sections?: Array<{
    heading?: string;
    points?: string[];
    wordCount?: number;
  }>;
  targetPlatform?: string;
  estimatedReadTime?: string;
}): string {
  const sections = (data.sections || []).map((s) => 
    `### ${s.heading}\n${(s.points || []).map((p: string) => `- ${p}`).join('\n')}\n*约 ${s.wordCount || 0} 字*`
  ).join('\n\n');
  
  return `## ${data.title || '长文大纲'}

**副标题：** ${data.subtitle || ''}

${sections}

**目标平台：** ${data.targetPlatform || '公众号/知乎'}
**预计阅读时间：** ${data.estimatedReadTime || '5分钟'}`;
}

/**
 * 格式化质量检查清单
 */
export function formatQualityChecklist(data: {
  criticalPath?: string;
  offlineScenarios?: string;
  permissionChecks?: string;
  dataTracing?: string;
  metricsValidation?: string;
}): string {
  return `## 质量检查清单

### 关键路径
${data.criticalPath || ''}

### 离线场景
${data.offlineScenarios || ''}

### 权限检查
${data.permissionChecks || ''}

### 数据追踪
${data.dataTracing || ''}

### 埋点验证
${data.metricsValidation || ''}`;
}

/**
 * 格式化测试用例
 */
export function formatTestCases(testCases: Array<{
  name?: string;
  steps?: string[];
  expected?: string;
}>): string {
  return testCases.map((tc, index) => 
    `### 测试用例 ${index + 1}: ${tc.name || '未命名'}
**步骤：**
${(tc.steps || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}

**预期结果：** ${tc.expected || ''}`
  ).join('\n\n');
}

/**
 * 格式化上线检查清单
 */
export function formatLaunchChecklist(items: string[]): string {
  return items.map((item, index) => `- [ ] ${item}`).join('\n');
}
