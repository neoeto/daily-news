/**
 * Diagnostic: compare raw fetch vs openai SDK on short AND long messages.
 */
const baseURL = process.env.LLM_BASE_URL ?? '';
const apiKey = process.env.LLM_API_KEY ?? '';
const model = process.env.LLM_TRANSLATE_MODEL ?? 'glm-4.5';
const url = `${baseURL}/chat/completions`;
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`,
};

const SHORT_MSG = 'Translate to Chinese: Hello world.';
const LONG_MSG =
  'Translate the following text to Chinese. ' +
  'Software engineering is the systematic application of engineering approaches to the development of software. ' +
  'Software engineering is a computing discipline. A software engineer is a person who applies the engineering design process to design, develop, test, debug, and maintain software. ' +
  'A software engineer writes, tests, and maintains the source code of computer programs. ' +
  'Unlike programmers, who typically focus on producing code for individual projects, software engineers apply engineering principles to design scalable, maintainable, and efficient solutions. ' +
  'They work on a broader spectrum of tasks including requirements analysis, system architecture, deployment, and ongoing maintenance. ' +
  'Software engineers collaborate with other stakeholders, such as product managers, designers, and quality assurance teams. ' +
  'The discipline incorporates best practices, methodologies, and tools to ensure reliability, performance, and security in software products. ' +
  'Key areas within software engineering include front-end development, which focuses on user interfaces and experience; ' +
  'back-end development, which involves server-side logic, databases, and application integration; ' +
  'DevOps, which bridges development and operations through automation, continuous integration, and continuous deployment; ' +
  'and quality engineering, which ensures software meets functional and non-functional requirements through testing and validation. ' +
  'Software engineers also deal with non-functional requirements such as scalability, reliability, security, and performance. ' +
  'They use version control systems like Git to manage code changes, and they follow agile or other methodologies to organize their work. ' +
  'The field continues to evolve with new technologies such as cloud computing, microservices, containers, and artificial intelligence. ' +
  'Software engineers must continuously learn and adapt to these changes, staying current with industry trends, best practices, and emerging tools. ' +
  'The role often requires strong analytical thinking, problem-solving skills, and the ability to work effectively in teams. ' +
  'Communication skills are equally important, as engineers must explain technical concepts to non-technical stakeholders.';

async function testRawFetch(label: string, msg: string) {
  const t0 = Date.now();
  try {
    const body = JSON.stringify({
      model,
      temperature: 0.3,
      messages: [{ role: 'user', content: msg }],
      thinking: { type: 'disabled' },
    });
    const res = await fetch(url, { method: 'POST', headers, body });
    const text = await res.text();
    console.log(`  ${label}: pass (${text.length} bytes, ${Date.now() - t0}ms)`);
  } catch (err) {
    console.log(
      `  ${label}: FAIL - ${err instanceof Error ? err.message : err} (${Date.now() - t0}ms)`,
    );
  }
}

async function testSdkNonStream(label: string, msg: string) {
  const t0 = Date.now();
  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ baseURL, apiKey, maxRetries: 0, timeout: 60_000 });
    const res = await client.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [{ role: 'user', content: msg }],
    });
    const content = res.choices[0]?.message?.content ?? '';
    console.log(`  ${label}: pass (${content.length} chars, ${Date.now() - t0}ms)`);
  } catch (err) {
    console.log(
      `  ${label}: FAIL - ${err instanceof Error ? err.message : err} (${Date.now() - t0}ms)`,
    );
  }
}

async function testSdkStream(label: string, msg: string) {
  const t0 = Date.now();
  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ baseURL, apiKey, maxRetries: 0, timeout: 60_000 });
    const stream = await client.chat.completions.create({
      model,
      temperature: 0.3,
      messages: [{ role: 'user', content: msg }],
      stream: true,
      stream_options: { include_usage: true },
    });
    let content = '';
    for await (const chunk of stream) {
      content += chunk.choices[0]?.delta?.content ?? '';
    }
    console.log(`  ${label}: pass (${content.length} chars, ${Date.now() - t0}ms)`);
  } catch (err) {
    console.log(
      `  ${label}: FAIL - ${err instanceof Error ? err.message : err} (${Date.now() - t0}ms)`,
    );
  }
}

async function main() {
  console.log(`endpoint: ${url}`);
  console.log(`model: ${model}`);
  console.log(`node: ${process.version}`);
  console.log(`short: ${SHORT_MSG.length} chars, long: ${LONG_MSG.length} chars\n`);

  console.log('--- raw fetch ---');
  await testRawFetch('short', SHORT_MSG);
  await testRawFetch('long', LONG_MSG);

  console.log('\n--- openai SDK ---');
  await testSdkNonStream('short non-stream', SHORT_MSG);
  await testSdkNonStream('long non-stream', LONG_MSG);
  await testSdkStream('short stream', SHORT_MSG);
  await testSdkStream('long stream', LONG_MSG);

  console.log('\n--- Done ---');
}

main().catch(console.error);
