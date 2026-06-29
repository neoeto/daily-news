import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  readingStateDataSchema,
  readingStateEnvelopeV1Schema,
  emptyState,
  migrate,
  READING_STATE_VERSION,
  READING_STATE_STORAGE_KEY,
} from '@daily-news/shared';

test('readingStateEnvelopeV1Schema: parses a valid envelope', () => {
  const env = {
    v: 1,
    data: {
      read: { abc: { at: 1730000000000, y: 1240 } },
      starred: { def: { at: 1730000001000 } },
    },
  };
  const r = readingStateEnvelopeV1Schema.safeParse(env);
  assert.ok(r.success);
  if (r.success) {
    assert.deepEqual(r.data.data.read.abc, { at: 1730000000000, y: 1240 });
    assert.deepEqual(r.data.data.starred.def, { at: 1730000001000 });
  }
});

test('readingStateEnvelopeV1Schema: missing v field fails', () => {
  const r = readingStateEnvelopeV1Schema.safeParse({ data: { read: {}, starred: {} } });
  assert.equal(r.success, false);
});

test('readingStateEnvelopeV1Schema: v mismatch (2 against v1 schema) fails', () => {
  const r = readingStateEnvelopeV1Schema.safeParse({ v: 2, data: { read: {}, starred: {} } });
  assert.equal(r.success, false);
});

test('readingStateDataSchema: empty maps parse', () => {
  const r = readingStateDataSchema.safeParse({ read: {}, starred: {} });
  assert.ok(r.success);
});

test('readingStateDataSchema: malformed entry value fails', () => {
  const r = readingStateDataSchema.safeParse({
    read: { abc: { at: 'not a number', y: 0 } },
    starred: {},
  });
  assert.equal(r.success, false);
});

test('emptyState: returns { read: {}, starred: {} }', () => {
  assert.deepEqual(emptyState(), { read: {}, starred: {} });
});

test('emptyState: each call returns a fresh object (no shared refs)', () => {
  const a = emptyState();
  const b = emptyState();
  a.read.foo = { at: 1, y: 0 };
  assert.equal(b.read.foo, undefined, 'mutating one emptyState must not leak into the next');
});

test('migrate: unknown fromVersion returns emptyState, never throws', () => {
  assert.deepEqual(migrate({ whatever: 'shape' }, 99), { read: {}, starred: {} });
});

test('migrate: null input returns emptyState', () => {
  assert.deepEqual(migrate(null, 0), { read: {}, starred: {} });
});

test('migrate: corrupt string input returns emptyState', () => {
  assert.deepEqual(migrate('corrupt', 0), { read: {}, starred: {} });
});

test('migrate: same args return deep-equal results (purity)', () => {
  assert.deepEqual(migrate(null, 0), migrate(null, 0));
});

test('migrate: fromVersion >= READING_STATE_VERSION returns emptyState (no downgrade)', () => {
  assert.deepEqual(migrate({ read: { x: { at: 1, y: 2 } }, starred: {} }, READING_STATE_VERSION), {
    read: {},
    starred: {},
  });
});

test('constants: READING_STATE_VERSION is 1, key embeds version', () => {
  assert.equal(READING_STATE_VERSION, 1);
  assert.equal(READING_STATE_STORAGE_KEY, 'dn:state:v1');
});
