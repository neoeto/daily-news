import type { LlmGateway, ChatMessage } from './llm';

const CHUNK_WORDS = 1500;

function chunkByParagraphs(text: string, maxWords: number): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = '';
  let currentWords = 0;
  for (const p of paragraphs) {
    const words = p.split(/\s+/).length;
    if (current && currentWords + words > maxWords) {
      chunks.push(current);
      current = p;
      currentWords = words;
    } else {
      current = current ? `${current}\n\n${p}` : p;
      currentWords += words;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function translatePrompt(from: string, to: string): string {
  return [
    `You are a professional translator. Translate the following ${from} text into fluent, natural ${to}.`,
    'Preserve all Markdown formatting, links, image syntax, code blocks, and HTML tags exactly as-is.',
    'Do not add commentary, notes, or a title. Output ONLY the translation.',
  ].join(' ');
}

export async function translateBody(
  gateway: LlmGateway,
  text: string,
  fromLang: string,
  toLang: string,
  model: string,
  temperature: number,
): Promise<string> {
  if (!text.trim()) return text;
  const chunks = chunkByParagraphs(text, CHUNK_WORDS);
  const out: string[] = [];
  for (const chunk of chunks) {
    const messages: ChatMessage[] = [
      { role: 'system', content: translatePrompt(fromLang, toLang) },
      { role: 'user', content: chunk },
    ];
    const { content } = await gateway.chat(model, temperature, messages);
    out.push(content.trim());
  }
  return out.join('\n\n');
}
