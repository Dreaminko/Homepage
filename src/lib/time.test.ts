import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beijingTime, runtime } from './time.ts';

test('Beijing clock rolls over at UTC 16:00 regardless of host timezone', () => {
  assert.equal(beijingTime(new Date('2026-09-08T16:00:00Z')), '00:00:00');
});
test('runtime handles day boundaries and dates before launch', () => {
  const start = '2021-11-12T11:45:14+08:00';
  assert.equal(runtime(new Date('2021-11-13T12:46:15+08:00'), start), '1 天 1 小時 1 分 1 秒');
  assert.equal(runtime(new Date('2021-11-11T00:00:00Z'), start), '0 天 0 小時 0 分 0 秒');
});
