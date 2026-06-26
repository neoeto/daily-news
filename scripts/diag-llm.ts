/**
 * Diagnostic: test LLM endpoint with different HTTP methods.
 * Run on Actions to pinpoint which layer causes "Premature close".
 *
 * Usage: LLM_BASE_URL=... LLM_API_KEY=... LLM_TRANSLATE_MODEL=... node --import tsx scripts/diag-llm.ts
 */
const baseURL = process.env.LLM_BASE_URL ?? '';
const apiKey = process.env.LLM_API_KEY ?? '';
const model = process.env.LLM_TRANSLATE_MODEL ?? 'glm-4.5';
const url = `${baseURL}/chat/completions`;
const body = JSON.stringify({
  model,
  temperature: 0.3,
  messages: [{ role: 'user', content: 'Translate to Chinese: Hello world, this is a test.' }],
  thinking: { type: 'disabled' },
});
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`,
};

async function testRawFetchNonStreaming() {
  console.log('\n--- Test 1: raw fetch (undici) non-streaming ---');
  try {
    const res = await fetch(url, { method: 'POST', headers, body });
    const text = await res.text();
    console.log(`  status: ${res.status}, body length: ${text.length}`);
    console.log(`  content preview: ${text.slice(0, 100)}`);
    console.log('  RESULT: ✓ pass');
  } catch (err) {
    console.log(`  RESULT: ✗ fail — ${err instanceof Error ? err.message : err}`);
  }
}

async function testRawFetchStreaming() {
  console.log('\n--- Test 2: raw fetch (undici) streaming ---');
  try {
    const streamBody = JSON.stringify({ ...JSON.parse(body), stream: true });
    const res = await fetch(url, { method: 'POST', headers, body: streamBody });
    const reader = res.body?.getReader();
    if (!reader) throw new Error('no response body');
    let chunks = 0;
    let totalChars = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks++;
      totalChars += value.length;
    }
    console.log(`  status: ${res.status}, chunks: ${chunks}, total bytes: ${totalChars}`);
    console.log('  RESULT: ✓ pass');
  } catch (err) {
    console.log(`  RESULT: ✗ fail — ${err instanceof Error ? err.message : err}`);
  }
}

async function testHttpsModule() {
  console.log('\n--- Test 3: node:https module (bypass undici) ---');
  return new Promise<void>((resolve) => {
    const parsed = new URL(url);
    const req = httpsRequest(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname,
        method: 'POST',
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          console.log(`  status: ${res.statusCode}, body length: ${data.length}`);
          console.log(`  content preview: ${data.slice(0, 100)}`);
          console.log('  RESULT: ✓ pass');
          resolve();
        });
      },
    );
    req.on('error', (err) => {
      console.log(`  RESULT: ✗ fail — ${err.message}`);
      resolve();
    });
    req.write(body);
    req.end();
  });
}

async function testOpenAISdkNonStreaming() {
  console.log('\n--- Test 4: openai SDK non-streaming ---');
  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ baseURL, apiKey, maxRetries: 0 });
    const res = await client.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [{ role: 'user', content: 'Translate to Chinese: Hello world.' }],
    });
    console.log(`  content: ${res.choices[0]?.message?.content?.slice(0, 80)}`);
    console.log('  RESULT: ✓ pass');
  } catch (err) {
    console.log(`  RESULT: ✗ fail — ${err instanceof Error ? err.message : err}`);
  }
}

async function testOpenAISdkStreaming() {
  console.log('\n--- Test 5: openai SDK streaming ---');
  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ baseURL, apiKey, maxRetries: 0 });
    const stream = await client.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [{ role: 'user', content: 'Translate to Chinese: Hello world.' }],
      stream: true,
    });
    let content = '';
    for await (const chunk of stream) {
      content += chunk.choices[0]?.delta?.content ?? '';
    }
    console.log(`  content: ${content.slice(0, 80)}`);
    console.log('  RESULT: ✓ pass');
  } catch (err) {
    console.log(`  RESULT: ✗ fail — ${err instanceof Error ? err.message : err}`);
  }
}

async function main() {
  console.log(`endpoint: ${url}`);
  console.log(`model: ${model}`);
  console.log(`node: ${process.version}`);
  console.log(`undici Agent: ${typeof globalThis.fetch}`);

  await testRawFetchNonStreaming();
  await testRawFetchStreaming();
  await testHttpsModule();
  await testOpenAISdkNonStreaming();
  await testOpenAISdkStreaming();

  console.log('\n--- Done ---');
}

import { request as httpsRequest } from 'node:https';
main().catch(console.error);
