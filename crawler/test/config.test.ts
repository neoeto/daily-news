import { test } from 'node:test';
import assert from 'node:assert/strict';
import { substituteEnv } from '../src/config';

test('substituteEnv: ${VAR} resolves from process.env', () => {
  process.env.TEST_VAR_PLAIN = 'hello';
  assert.equal(substituteEnv('${TEST_VAR_PLAIN}'), 'hello');
});

test('substituteEnv: ${VAR:-default} uses default when env unset', () => {
  delete process.env.TEST_VAR_UNSET;
  assert.equal(substituteEnv('${TEST_VAR_UNSET:-fallback}'), 'fallback');
});

test('substituteEnv: ${VAR:-default} uses env value when set', () => {
  process.env.TEST_VAR_SET = 'deepseek-chat';
  assert.equal(substituteEnv('${TEST_VAR_SET:-glm-4.5}'), 'deepseek-chat');
});

test('substituteEnv: ${VAR:-default} uses default when env is empty string', () => {
  process.env.TEST_VAR_EMPTY = '';
  assert.equal(substituteEnv('${TEST_VAR_EMPTY:-glm-4.5}'), 'glm-4.5');
});

test('substituteEnv: multiple placeholders in one string', () => {
  process.env.TEST_A = 'x';
  delete process.env.TEST_B;
  assert.equal(
    substituteEnv('translate=${TEST_A} tag=${TEST_B:-glm-4.5-flash}'),
    'translate=x tag=glm-4.5-flash',
  );
});
