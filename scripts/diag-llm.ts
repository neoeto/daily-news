/**
 * Diagnostic: test LLM endpoint with short AND long messages.
 * The crawler sends 500-word article chunks — previous tests used 10-word
 * messages and all passed. Need to test with realistic input size.
 */
const baseURL = process.env.LLM_BASE_URL ?? '';
const apiKey = process.env.LLM_API_KEY ?? '';
const model = process.env.LLM_TRANSLATE_MODEL ?? 'glm-4.5';
const url = `${baseURL}/chat/completions`;
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`,
};

const SHORT_MSG = 'Translate to Chinese: Hello world, this is a test.';

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

function makeBody(msg: string, stream: boolean) {
  return JSON.stringify({
    model,
    temperature: 0.3,
    messages: [{ role: 'user', content: msg }],
    thinking: { type: 'disabled' },
    stream,
  });
}

async function timedFetch(label: string, msg: string, stream: boolean) {
  console.log(`\n--- ${label} ---`);
  const t0 = Date.now();
  try {
    const res = await fetch(url, { method: 'POST', headers, body: makeBody(msg, stream) });
    if (stream) {
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
      console.log(
        `  status: ${res.status}, chunks: ${chunks}, bytes: ${totalChars}, time: ${Date.now() - t0}ms`,
      );
    } else {
      const text = await res.text();
      console.log(
        `  status: ${res.status}, body: ${text.length} bytes, time: ${Date.now() - t0}ms`,
      );
    }
    console.log('  RESULT: pass');
  } catch (err) {
    console.log(
      `  RESULT: FAIL - ${err instanceof Error ? err.message : err} (time: ${Date.now() - t0}ms)`,
    );
  }
}

async function main() {
  console.log(`endpoint: ${url}`);
  console.log(`model: ${model}`);
  console.log(`node: ${process.version}`);
  console.log(`short msg: ${SHORT_MSG.length} chars`);
  console.log(`long msg: ${LONG_MSG.length} chars`);

  await timedFetch('Test 1: short non-streaming', SHORT_MSG, false);
  await timedFetch('Test 2: short streaming', SHORT_MSG, true);
  await timedFetch('Test 3: long non-streaming', LONG_MSG, false);
  await timedFetch('Test 4: long streaming', LONG_MSG, true);

  console.log('\n--- Done ---');
}

main().catch(console.error);
