import OpenAI from 'openai';
import type { LlmConfig } from '@daily-news/shared';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmGateway {
  readonly available: boolean;
  readonly budgetExceeded: boolean;
  readonly usedTokens: number;
  chat(
    model: string,
    temperature: number,
    messages: ChatMessage[],
  ): Promise<{ content: string; tokens: number }>;
}

export function createLlmGateway(config: LlmConfig): LlmGateway {
  const client = new OpenAI({
    baseURL: config.llm.base_url,
    apiKey: config.llm.api_key,
    timeout: config.llm.request.timeout,
    maxRetries: config.llm.request.max_retries,
  });
  const maxTokens = config.llm.guardrails.max_tokens_per_run;
  let used = 0;

  return {
    get available() {
      return config.llm.api_key.length > 0 && config.llm.api_key !== 'mock';
    },
    get budgetExceeded() {
      return used >= maxTokens;
    },
    get usedTokens() {
      return used;
    },
    async chat(model, temperature, messages) {
      const res = await client.chat.completions.create({
        model,
        temperature,
        messages: messages as OpenAI.ChatCompletionMessageParam[],
      });
      const tokens = res.usage?.total_tokens ?? 0;
      used += tokens;
      return { content: res.choices[0]?.message?.content ?? '', tokens };
    },
  };
}
