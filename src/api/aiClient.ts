/**
 * AI API 客户端 - 纯 API 调用层
 * 负责与智谱 AI API 的通信
 */

import { getBaseUrl } from '@/storage';

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

export interface StreamDelta {
  choices: {
    delta: {
      content?: string;
    };
  }[];
}

/**
 * 发送聊天请求到 AI API
 */
export async function sendChatRequest(
  apiKey: string,
  messages: Message[],
  options: {
    model?: string;
    stream?: boolean;
  } = {}
): Promise<Response> {
  const { model = 'GLM-4.6', stream = false } = options;
  const apiUrl = getBaseUrl();

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 请求失败: ${response.status} - ${error}`);
  }

  return response;
}

/**
 * 非流式聊天
 */
export async function chat(
  apiKey: string,
  messages: Message[],
  model?: string
): Promise<string> {
  const response = await sendChatRequest(apiKey, messages, { model, stream: false });
  const data: ZhipuResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * 流式聊天
 */
export async function chatStream(
  apiKey: string,
  messages: Message[],
  onChunk: (chunk: string) => void,
  model?: string
): Promise<string> {
  const response = await sendChatRequest(apiKey, messages, { model, stream: true });

  if (!response.body) {
    throw new Error('响应体为空');
  }

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
          const parsed: StreamDelta = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk(content);
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }

  return fullContent;
}

/**
 * 解析 AI 返回的 JSON
 */
export function parseAIResponse<T>(response: string): T | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch {
    console.error('Failed to parse AI response:', response);
    return null;
  }
}
