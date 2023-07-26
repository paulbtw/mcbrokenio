import { APIType } from '../../src/types';
import { getNewBearerToken } from '../../src/utils';

describe('Getting a new bearer Token', () => {
  // Only works with AU IP
  // test('Try getting a new Token for AP', async () => {
  //   const token = await getNewBearerToken(APIType.AP);
  //   expect(token).toBeDefined();
  //   expect(token).toBeTruthy();
  // });

  test('Try getting a new Token for EL', async () => {
    const token = await getNewBearerToken(APIType.EL);
    expect(token).toBeDefined();
    expect(token).toBeTruthy();
  });

  test('Try getting a new Token for EU', async () => {
    const token = await getNewBearerToken(APIType.EU);
    expect(token).toBeDefined();
    expect(token).toBeTruthy();
  });

  test('Try getting a new Token for HK', async () => {
    expect(() => getNewBearerToken(APIType.HK)).rejects.toThrowError();
  });

  test('Try getting a new Token for UNKNOWN', async () => {
    expect(() => getNewBearerToken(APIType.UNKNOWN)).rejects.toThrowError();
  });

  // Only works with USA IP
  // test('Try getting a new Token for US', async () => {
  //   const token = await getNewBearerToken(APIType.US);
  //   expect(token).toThrow();
  // });
});
