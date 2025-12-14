/**
 * Quality 阶段相关的 AI Prompts
 */

export const qualityPrompts = {
  generateQualityChecklist: (prd: string, routes: string, dataModel: string, features: string[]) => `
根据以下产品信息生成质量检查清单和测试建议：
PRD：${prd}
路由设计：${routes}
数据模型：${dataModel}
功能列表：${features.join('、')}

必须严格返回以下 JSON 格式：
{
  "qualityChecklist": {
    "criticalPath": "关键路径描述和测试点（用户核心流程能否走通）",
    "offlineScenarios": "离线场景处理建议（无网络时的体验）",
    "permissionChecks": "权限检查要点（登录态、角色权限等）",
    "dataTracing": "数据追踪验证点（数据流向是否正确）",
    "metricsValidation": "埋点验证方法（如何确认埋点生效）"
  },
  "testCases": [
    {"name": "核心流程测试", "steps": ["步骤1", "步骤2", "步骤3"], "expected": "预期结果"},
    {"name": "边界条件测试", "steps": ["步骤1", "步骤2"], "expected": "预期结果"},
    {"name": "异常场景测试", "steps": ["步骤1", "步骤2"], "expected": "预期结果"}
  ],
  "launchChecklist": [
    "确认生产环境配置正确",
    "确认数据库迁移完成",
    "确认埋点代码已部署",
    "确认监控告警已配置",
    "确认回滚方案已准备"
  ]
}
只返回 JSON。`,
};
