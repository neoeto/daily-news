import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { runSummarySchema, type RunSummary } from '@daily-news/shared';

export async function saveRunSummary(summary: RunSummary): Promise<void> {
  const validated = runSummarySchema.parse(summary);
  const runsDir = path.resolve(process.cwd(), 'runs');
  await mkdir(runsDir, { recursive: true });
  const filepath = path.join(runsDir, `${validated.date}.json`);
  await writeFile(filepath, `${JSON.stringify(validated, null, 2)}\n`, 'utf8');
}
