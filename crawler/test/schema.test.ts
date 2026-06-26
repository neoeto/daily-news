import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sourceSchema } from '@daily-news/shared';

const validBase = {
  name: 'test',
  url: 'https://example.com/feed.xml',
  type: 'rss' as const,
  lang: 'en',
};

test('sourceSchema: max_items omitted → undefined (unlimited)', () => {
  const s = sourceSchema.parse(validBase);
  assert.equal(s.max_items, undefined);
});

test('sourceSchema: max_items accepts positive integer', () => {
  assert.equal(sourceSchema.parse({ ...validBase, max_items: 1 }).max_items, 1);
  assert.equal(sourceSchema.parse({ ...validBase, max_items: 50 }).max_items, 50);
});

test('sourceSchema: max_items rejects 0, negatives, non-integers', () => {
  for (const bad of [0, -1, 3.5, NaN]) {
    assert.throws(() => sourceSchema.parse({ ...validBase, max_items: bad }));
  }
});
