/**
 * @deprecated 此文件已重构，请使用新的分层架构：
 * - API 客户端: src/api/aiClient.ts
 * - Prompts: src/api/prompts/
 * - 存储: src/storage/
 * - 服务: src/services/
 * 
 * 此文件保留用于向后兼容
 */

// 重新导出 API 客户端
export { 
  chat as chatWithAI,
  parseAIResponse,
  type Message,
  type ZhipuResponse,
} from '@/api/aiClient';

// 重新导出存储
export {
  getApiKey,
  setApiKey,
  removeApiKey,
} from '@/storage';

// 重新导出 Prompts
export {
  AI_GUIDED_PROMPTS,
  SOP_PROMPTS,
} from '@/api/prompts';

// 包装 chatWithAI 以保持向后兼容
import { chat, chatStream } from '@/api/aiClient';
import { getApiKey as getKey } from '@/storage';

export async function legacyChatWithAI(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  onStream?: (chunk: string) => void
): Promise<string> {
  const apiKey = getKey();
  if (!apiKey) {
    throw new Error('API Key 未设置');
  }

  if (onStream) {
    return chatStream(apiKey, messages, onStream);
  }
  return chat(apiKey, messages);
}
