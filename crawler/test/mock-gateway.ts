import type { LlmGateway, ChatMessage } from '../src/llm';

export interface Mocked {
  gateway: LlmGateway;
  calls: ChatMessage[][];
}

/**
 * Fake LlmGateway. `respond` receives each call's messages and returns the
 * simulated model output. Records every call so tests can assert prompts.
 */
export function mockGateway(
  respond: (msgs: ChatMessage[]) => string,
  opts: { tokensPerCall?: number; budgetAfter?: number } = {},
): Mocked {
  const calls: ChatMessage[][] = [];
  let used = 0;
  const tokensPerCall = opts.tokensPerCall ?? 10;
  const gateway: LlmGateway = {
    available: true,
    get budgetExceeded() {
      return opts.budgetAfter !== undefined && used >= opts.budgetAfter;
    },
    get usedTokens() {
      return used;
    },
    async chat(_model, _temperature, messages) {
      calls.push(messages);
      const content = respond(messages);
      used += tokensPerCall;
      return { content, tokens: tokensPerCall };
    },
  };
  return { gateway, calls };
}
