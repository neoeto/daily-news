import { test } from 'node:test';
import assert from 'node:assert/strict';
import { translateBody } from '../src/translate';
import { mockGateway } from './mock-gateway';

function paraWords(n: number): string {
  return Array(n).fill('word').join(' ');
}

test('translateBody: single short call, returns translated text', async () => {
  const { gateway, calls } = mockGateway((msgs) => msgs[1]!.content.toUpperCase());
  const out = await translateBody(gateway, 'hello world', 'en', 'zh', 'm', 0.3);
  assert.equal(out, 'HELLO WORLD');
  assert.equal(calls.length, 1);
  assert.match(calls[0]![0]!.content, /en.*zh|zh/);
});

test('translateBody: long text is chunked into multiple calls and rejoined', async () => {
  const long = [paraWords(1000), paraWords(1000), paraWords(1000)].join('\n\n');
  const { gateway, calls } = mockGateway((msgs) => msgs[1]!.content);
  const out = await translateBody(gateway, long, 'en', 'zh', 'm', 0.3);
  assert.equal(calls.length, 3);
  assert.equal(out, long);
});

test('translateBody: empty text skipped, gateway not called', async () => {
  const { gateway, calls } = mockGateway(() => 'X');
  const out = await translateBody(gateway, '   ', 'en', 'zh', 'm', 0.3);
  assert.equal(out, '   ');
  assert.equal(calls.length, 0);
});
