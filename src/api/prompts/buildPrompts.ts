/**
 * Build 阶段相关的 AI Prompts
 */

import type { UserStory } from '@/types/aiOptions';

export const buildPrompts = {
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

  generateRoutes: (prd: string, features: string[], stories: UserStory[]) => `
根据产品需求、功能和用户故事：
PRD：${prd}
功能：${features.join('、')}
用户故事：${JSON.stringify(stories)}

设计前端路由结构。必须严格返回以下 JSON 格式：
{
  "routes": "/ 首页\\n/login 登录页\\n/dashboard 控制台\\n  /dashboard/overview 概览\\n  /dashboard/settings 设置\\n/profile 个人中心\\n..."
}
使用换行和缩进表示层级关系。只返回 JSON。`,

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
};
