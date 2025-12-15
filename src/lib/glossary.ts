export const GLOSSARY = {
  // 项目启动
  northStarMetric: {
    term: '北极星指标',
    description: '团队最核心的成功衡量指标，所有工作都围绕它展开。例如：日活用户数、付费转化率等。'
  },
  prd: {
    term: 'PRD',
    description: '产品需求文档（Product Requirements Document）的缩写，用一句话说清楚产品是什么、为谁、解决什么问题。'
  },
  loop: {
    term: '最小闭环',
    description: '用户从"来"到"得到价值"的完整路径。触发是用户为什么来，行动是用户做什么，回报是用户立即得到什么。'
  },
  
  // 问题→方案
  userStory: {
    term: '用户故事',
    description: '用"作为…我想要…以便…"格式描述需求，确保每个功能都有明确的用户价值。'
  },
  stateMachine: {
    term: '状态机',
    description: '定义系统在不同状态（空态、成功、失败、无权限、离线）下的表现，确保用户体验完整。'
  },
  copyPack: {
    term: '文案包',
    description: '产品中所有用户可见文字的集合，包括首屏、引导、错误提示、空态等，统一管理便于迭代。'
  },
  tracking: {
    term: '埋点事件',
    description: '在关键用户行为处记录数据，用于分析用户路径和产品效果，是数据驱动决策的基础。'
  },
  
  // AI 辅助开发
  mvp: {
    term: 'MVP',
    description: '最小可行产品（Minimum Viable Product），用最少的功能验证核心假设，快速获取用户反馈。'
  },
  scaffold: {
    term: '脚手架',
    description: '项目初始化模板，包含基础目录结构、配置文件、通用组件等，15-30分钟内完成。'
  },
  verticalSlice: {
    term: '垂直切片',
    description: '完整实现一个功能从 UI 到数据库的全部层级，优先保证一条路径完全跑通。'
  },
  horizontalReplication: {
    term: '横向复制',
    description: '在垂直切片验证成功后，复制相同模式到其他功能，提高开发效率。'
  },
  observability: {
    term: '可观测性',
    description: '通过日志、监控、告警等手段，让系统运行状态透明可见，便于排查问题。'
  },
  routeDesign: {
    term: '路由设计',
    description: '规划 URL 路径与页面的对应关系，好的路由结构让用户和开发者都容易理解。'
  },
  dataModel: {
    term: '数据模型',
    description: '定义系统中的实体（如用户、项目）及其属性和关系，是后端设计的核心。'
  },
  releaseNote: {
    term: 'Release Note',
    description: '发布说明，记录本次上线的主要变更、修复的问题、已知限制等。'
  },
  
  // 数据复盘
  funnelMetrics: {
    term: '漏斗指标',
    description: '用户转化的各阶段数据，从曝光到最终转化，逐层分析流失点。'
  },
  exposure: {
    term: '曝光',
    description: '用户看到产品或功能的次数，是漏斗的第一层。'
  },
  reach: {
    term: '到达',
    description: '用户实际进入产品或页面的次数，从曝光到到达的转化率反映吸引力。'
  },
  activation: {
    term: '激活',
    description: '用户首次完成核心动作（如注册、首次使用），标志用户真正开始使用产品。'
  },
  retention: {
    term: '留存/复购',
    description: '用户持续使用或再次购买的比例，是产品价值的核心验证指标。'
  },
  abTesting: {
    term: 'A/B 实验',
    description: '将用户随机分成两组，分别体验不同版本，通过数据对比找出更优方案。'
  },
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
