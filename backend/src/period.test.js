import test from 'node:test';
import assert from 'node:assert/strict';
import { nextPeriod } from './period.js';

test('monthly periods clamp month end, including leap years', () => {
  assert.equal(nextPeriod('2024-01-31','monthly'),'2024-02-29');
  assert.equal(nextPeriod('2025-01-31','monthly'),'2025-02-28');
  assert.equal(nextPeriod('2025-02-28','monthly',31),'2025-03-31');
});
test('annual periods handle leap day', () => {
  assert.equal(nextPeriod('2024-02-29','annual'),'2025-02-28');
});
