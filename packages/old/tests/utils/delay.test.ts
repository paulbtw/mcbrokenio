import { delay } from '../../src/utils';

describe('Test the delay function', () => {
  test('when the delay is successful', async () => {
    const start = Date.now();
    await delay(1000);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(1000);
  });
});
