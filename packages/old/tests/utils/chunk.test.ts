import { chunk } from '../../src/utils';

describe('testing the chunk function', () => {
  test('when the array is empty', () => {
    const arr: number[] = [];
    const size: number = 2;
    const expected: number[][] = [];
    const actual: number[][] = chunk(arr, size);
    expect(actual).toEqual(expected);
  });

  test('when the array is not empty', () => {
    const arr: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const size: number = 2;
    const expected: number[][] = [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
      [9, 10],
    ];
    const actual: number[][] = chunk(arr, size);
    expect(actual).toEqual(expected);
  });
});
