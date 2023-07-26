import { getClientId } from '../../src/utils/getClientId';

describe('testing the getClientId function', () => {
  test('when the Basic Token is not defined', () => {
    const BASIC_TOKEN: string | undefined = undefined;
    expect(() => getClientId(BASIC_TOKEN)).toThrowError(
      'You need to add a Basic Token',
    );
  });

  test('when the Basic Token is defined', () => {
    const BASIC_TOKEN: string | undefined = 'YWJjOmRlZg==';
    const clientId = getClientId(BASIC_TOKEN);
    expect(clientId).toBe('abc');
  });
});
