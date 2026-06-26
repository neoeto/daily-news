import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonicalizeUrl, urlHash } from '../src/dedup';

test('canonicalizeUrl strips tracking params and fragment, keeps real params', () => {
  assert.equal(canonicalizeUrl('https://a.com/x?utm_source=foo&id=1#frag'), 'https://a.com/x?id=1');
});

test('canonicalizeUrl lowercases host and drops trailing slash (non-root)', () => {
  assert.equal(canonicalizeUrl('https://EXAMPLE.com/Path/'), 'https://example.com/Path');
  assert.equal(canonicalizeUrl('https://a.com/'), 'https://a.com/');
});

test('urlHash is stable across tracking-param variants (dedup works)', () => {
  const a = urlHash('https://a.com/x?utm_source=foo');
  const b = urlHash('https://a.com/x');
  assert.equal(a, b);
});

test('urlHash differs for genuinely different URLs', () => {
  assert.notEqual(urlHash('https://a.com/x'), urlHash('https://a.com/y'));
});
