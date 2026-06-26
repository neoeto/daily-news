import { writeFile } from 'node:fs/promises';
import { stringify as stringifyYaml } from 'yaml';
import { sourceStateSchema, type SourceState } from '@daily-news/shared';
import { CONFIG_PATHS } from './config';

export async function saveSourceState(state: SourceState): Promise<void> {
  const validated = sourceStateSchema.parse(state);
  const yaml = stringifyYaml(validated);
  await writeFile(CONFIG_PATHS.sourceState, yaml, 'utf8');
}
