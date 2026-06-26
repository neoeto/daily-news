import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAliasMap, normalizeTags, tagArticle } from '../src/tag';
import { mockGateway } from './mock-gateway';

test('buildAliasMap stores canonical, its lowercase, and each alias', () => {
  const map = buildAliasMap({ AI: ['ai', '人工智能'] });
  assert.equal(map.get('AI'), 'AI');
  assert.equal(map.get('ai'), 'AI');
  assert.equal(map.get('人工智能'), 'AI');
});

test('normalizeTags dedups variants, is case-insensitive, passes unknown through', () => {
  const map = buildAliasMap({ AI: ['ai', '人工智能'], Rust: ['rust-lang'] });
  const out = normalizeTags(['人工智能', 'AI', 'aI', 'RUST', 'rust-lang', '量子计算'], map);
  assert.deepEqual(out, ['AI', 'Rust', '量子计算']);
});

test('tagArticle normalizes LLM output via alias map and feeds existing tags', async () => {
  const registry = { AI: ['ai', '人工智能'], 前端: ['frontend', '前端开发'] };
  const { gateway, calls } = mockGateway(() => '["人工智能", "frontend", "量子计算"]');
  const tags = await tagArticle(gateway, registry, 5, 'm', 0.2, '标题', '摘要');
  assert.deepEqual(tags, ['AI', '前端', '量子计算']);
  assert.equal(calls.length, 1);
  const userContent = calls[0]![1]!.content;
  assert.match(userContent, /AI/);
  assert.match(userContent, /前端/);
});

test('tagArticle caps result at maxTags', async () => {
  const { gateway } = mockGateway(() => '["AI","Rust","量子","前端","创业","extra"]');
  const tags = await tagArticle(gateway, {}, 3, 'm', 0.2, 't', 'e');
  assert.equal(tags.length, 3);
});

test('tagArticle returns [] on malformed LLM output (no crash)', async () => {
  const { gateway } = mockGateway(() => 'sorry, I cannot do that');
  const tags = await tagArticle(gateway, {}, 5, 'm', 0.2, 't', 'e');
  assert.deepEqual(tags, []);
});

test('tagArticle extracts JSON array from surrounding prose', async () => {
  const { gateway } = mockGateway(() => 'Here are the tags:\n["AI","Rust"]\nHope that helps!');
  const tags = await tagArticle(gateway, {}, 5, 'm', 0.2, 't', 'e');
  assert.deepEqual(tags, ['AI', 'Rust']);
});
