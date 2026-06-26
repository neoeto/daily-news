import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLang, sniffType, discoverFeedUrl } from '../src/add-source';

test('normalizeLang: feed-style codes collapse to short codes', () => {
  assert.equal(normalizeLang('zh-CN'), 'zh');
  assert.equal(normalizeLang('en-US'), 'en');
  assert.equal(normalizeLang('ja-JP'), 'ja');
  assert.equal(normalizeLang('ko-KR'), 'ko');
});

test('normalizeLang: franc 639-3 codes map to short codes', () => {
  assert.equal(normalizeLang('cmn'), 'zh');
  assert.equal(normalizeLang('eng'), 'en');
  assert.equal(normalizeLang('jpn'), 'ja');
});

test('normalizeLang: null/unknown → und or 2-letter fallback', () => {
  assert.equal(normalizeLang(null), 'und');
  assert.equal(normalizeLang('fra'), 'fr');
});

test('sniffType: content-type carries rss/atom/xml → rss', () => {
  assert.equal(sniffType('application/rss+xml', '<html/>'), 'rss');
  assert.equal(sniffType('application/atom+xml', ''), 'rss');
  assert.equal(sniffType('text/xml', ''), 'rss');
});

test('sniffType: body sniffing finds feed markers under generic content-type', () => {
  assert.equal(sniffType('text/html', '<?xml version="1.0"?><rss>'), 'rss');
  assert.equal(sniffType('text/html', '<feed xmlns="http://www.w3.org/2005/Atom">'), 'rss');
  assert.equal(sniffType('text/html', '<html><body>plain page</body></html>'), 'html');
});

test('discoverFeedUrl: extracts alternate rss/atom link and resolves relative', () => {
  const html = '<head><link rel="alternate" type="application/rss+xml" href="/feed.xml" /></head>';
  assert.equal(discoverFeedUrl(html, 'https://example.com/blog/'), 'https://example.com/feed.xml');
});

test('discoverFeedUrl: returns null when no feed link present', () => {
  assert.equal(discoverFeedUrl('<html><body>no feed here</body></html>', 'https://a.com/'), null);
});
