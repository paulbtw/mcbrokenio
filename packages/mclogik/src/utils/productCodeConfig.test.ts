import { describe, expect, test } from 'vitest';

import { normalizeProductCodeConfig, unavailableProduct } from './productCodeConfig';

describe('normalizeProductCodeConfig', () => {
  test('returns tracked config for product code arrays', () => {
    expect(normalizeProductCodeConfig(['CODE1'])).toEqual({
      kind: 'tracked',
      codes: ['CODE1'],
    });
  });

  test('returns tracked config for empty product code arrays', () => {
    expect(normalizeProductCodeConfig([])).toEqual({
      kind: 'tracked',
      codes: [],
    });
  });

  test('returns unavailable config for the UNAVAILABLE legacy marker', () => {
    expect(normalizeProductCodeConfig(['UNAVAILABLE'])).toEqual({
      kind: 'unavailable',
    });
  });

  test('returns unavailable config for the __NOT_APPLICABLE__ legacy marker', () => {
    expect(normalizeProductCodeConfig(['__NOT_APPLICABLE__'])).toEqual({
      kind: 'unavailable',
    });
  });

  test('returns unavailable config for explicit unavailable product config', () => {
    expect(normalizeProductCodeConfig(unavailableProduct())).toEqual({
      kind: 'unavailable',
    });
  });
});
