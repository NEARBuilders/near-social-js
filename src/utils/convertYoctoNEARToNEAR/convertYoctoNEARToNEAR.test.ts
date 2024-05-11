// utils
import convertYoctoNEARToNEAR from './convertYoctoNEARToNEAR';

interface ITestParams {
  atomicUnit: string;
  expected: string;
}

describe('convertYoctoNEARToNEARtest()', () => {
  it.each([
    {
      atomicUnit: '10000',
      expected: '0.00000000000000000001',
    },
    {
      atomicUnit: '1000000000000000000001000',
      expected: '1.00000000000000000001',
    },
    {
      atomicUnit: '3200000000000000000000000',
      expected: '3.2',
    },
    {
      atomicUnit: '3200000000000000000000001',
      expected: '3.20000000000000000001',
    },
  ])(
    `should convert the yoctonear unit of "$atomicUnit" to near unit of "$expected"`,
    ({ atomicUnit, expected }: ITestParams) => {
      expect(convertYoctoNEARToNEAR(atomicUnit)).toBe(expected);
    }
  );
});
