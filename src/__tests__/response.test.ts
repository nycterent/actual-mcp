import { test } from 'node:test';
import assert from 'node:assert';
import { success, successWithContent, error, errorFromCatch } from '../utils/response.js';

test('success returns expected structure', () => {
  const result = success('ok');
  assert.deepStrictEqual(result, {
    isError: false,
    content: [{ type: 'text', text: 'ok' }]
  });
});

test('successWithContent returns provided content', () => {
  const result = successWithContent([{ type: 'text', text: 'hi' }]);
  assert.deepStrictEqual(result, {
    isError: false,
    content: [{ type: 'text', text: 'hi' }]
  });
});

test('error returns expected structure', () => {
  const result = error('fail');
  assert.deepStrictEqual(result, {
    isError: true,
    content: [{ type: 'text', text: 'Error: fail' }]
  });
});

test('errorFromCatch handles Error objects', () => {
  const result = errorFromCatch(new Error('boom'));
  assert.deepStrictEqual(result, {
    isError: true,
    content: [{ type: 'text', text: 'Error: boom' }]
  });
});

