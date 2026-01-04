import { describe, expect, test } from 'vitest';

import { getClientIdWithToken } from './getClientId';

describe('testing the getClientIdWithToken function', () => {
  test('when the Basic Token is not defined', () => {
    const BASIC_TOKEN: string | undefined = undefined;
    expect(() => getClientIdWithToken(BASIC_TOKEN)).toThrowError(
      'Basic token is missing',
    );
  });

  test('when the Basic Token is defined', () => {
    const BASIC_TOKEN: string | undefined = 'YWJjOmRlZg==';
    const clientId = getClientIdWithToken(BASIC_TOKEN);
    expect(clientId).toBe('abc');
  });
});
