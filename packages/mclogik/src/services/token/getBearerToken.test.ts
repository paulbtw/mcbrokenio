import { describe, expect, test } from 'vitest';

import { APIType } from '../../types';

import { getBearerToken } from './getBearerToken';

describe('Getting a new bearer Token', () => {
  test('Try getting a new Token for AP', async () => {
    const token = await getBearerToken(APIType.AP);
    expect(token).toBeDefined();
    expect(token).toBeTruthy();
  });

  test('Try getting a new Token for EL', async () => {
    const token = await getBearerToken(APIType.EL);
    expect(token).toBeDefined();
    expect(token).toBeTruthy();
  });

  test('Try getting a new Token for EU', async () => {
    const token = await getBearerToken(APIType.EU);
    expect(token).toBeDefined();
    expect(token).toBeTruthy();
  });

  test('Try getting a new Token for HK', async () => {
    await expect(getBearerToken(APIType.HK)).rejects.toThrowError();
  });

  test('Try getting a new Token for UNKNOWN', async () => {
    await expect(getBearerToken(APIType.UNKNOWN)).rejects.toThrowError();
  });
});
