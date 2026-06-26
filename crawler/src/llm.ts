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
  const baseURL = config.llm.base_url;
  const apiKey = config.llm.api_key;
  const maxTokens = config.llm.guardrails.max_tokens_per_run;
  const disableThinking = config.llm.request.disable_thinking;
  const timeoutMs = config.llm.request.timeout;
  const maxRetries = config.llm.request.max_retries;
  let used = 0;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  return {
    get available() {
      return apiKey.length > 0 && apiKey !== 'mock';
    },
    get budgetExceeded() {
      return used >= maxTokens;
    },
    get usedTokens() {
      return used;
    },
    async chat(model, temperature, messages) {
      // Bypass openai SDK — its X-Stainless-* headers trigger DeepSeek WAF
      // to drop the connection ("Premature close"). Raw fetch works reliably.
      const body = JSON.stringify({
        model,
        temperature,
        messages,
        ...(disableThinking ? { thinking: { type: 'disabled' } } : {}),
      });
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };

      let lastError: unknown;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(`${baseURL}/chat/completions`, {
            method: 'POST',
            headers,
            body,
            signal: controller.signal,
          });
          clearTimeout(timer);
          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
          }
          const data = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
            usage?: { total_tokens?: number };
          };
          const content = data.choices?.[0]?.message?.content ?? '';
          const tokens = data.usage?.total_tokens ?? 0;
          used += tokens;
          return { content, tokens };
        } catch (err) {
          clearTimeout(timer);
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
