/**
 * AI 服务层
 * 封装 AI API 调用和业务逻辑
 */

import { chat, chatStream, parseAIResponse, type Message } from '@/api/aiClient';
import { getApiKey } from '@/storage';
import type { AIOptionsResponse } from '@/types/aiOptions';

export class AIService {
  /**
   * 获取当前 API Key
   */
  private getKey(): string {
    const key = getApiKey();
    if (!key) {
      throw new Error('API Key 未设置');
    }
    return key;
  }

  /**
   * 发送聊天消息
   */
  async chat(messages: Message[]): Promise<string> {
    return chat(this.getKey(), messages);
  }

  /**
   * 流式发送聊天消息
   */
  async chatStream(messages: Message[], onChunk: (chunk: string) => void): Promise<string> {
    return chatStream(this.getKey(), messages, onChunk);
  }

  /**
   * 发送简单消息并获取响应
   */
  async sendMessage(content: string): Promise<string> {
    return this.chat([{ role: 'user', content }]);
  }

  /**
   * 发送 prompt 并解析 JSON 响应
   */
  async sendAndParse<T>(prompt: string): Promise<T | null> {
    const response = await this.sendMessage(prompt);
    return parseAIResponse<T>(response);
  }

  /**
   * 生成选项列表
   */
  async generateOptions(prompt: string): Promise<AIOptionsResponse | null> {
    const result = await this.sendAndParse<AIOptionsResponse>(prompt);
    if (!result || !result.options) {
      throw new Error('AI 返回格式错误');
    }
    return result;
  }
}

// 导出单例
export const aiService = new AIService();
