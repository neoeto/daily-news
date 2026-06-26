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
    maxRetries: 0,
  });
  const maxTokens = config.llm.guardrails.max_tokens_per_run;
  const disableThinking = config.llm.request.disable_thinking;
  const maxRetries = config.llm.request.max_retries;
  let used = 0;

  type ChatParams = OpenAI.ChatCompletionCreateParamsStreaming & {
    thinking?: { type: string };
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
      let lastError: unknown;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const params: ChatParams = {
            model,
            temperature,
            messages: messages as OpenAI.ChatCompletionMessageParam[],
            stream: true,
            stream_options: { include_usage: true },
          };
          if (disableThinking) {
            params.thinking = { type: 'disabled' };
          }
          const stream = await client.chat.completions.create(params);
          let content = '';
          let tokens = 0;
          for await (const chunk of stream) {
            content += chunk.choices[0]?.delta?.content ?? '';
            if (chunk.usage) tokens = chunk.usage.total_tokens ?? 0;
          }
          used += tokens;
          return { content, tokens };
        } catch (err) {
          lastError = err;
          if (attempt < maxRetries) {
            await sleep(Math.min(2000 * 2 ** attempt, 30_000));
            continue;
          }
        }
      }
      throw lastError;
    },
  };
}
