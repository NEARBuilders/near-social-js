// utils
import convertNEARToYoctoNEAR from './convertNEARToYoctoNEAR';

interface ITestParams {
  expected: string;
  standardUnit: string;
}

describe('convertNEARToYoctoNEAR()', () => {
  it.each([
    {
      standardUnit: '0.00000000000001',
      expected: '10000000000',
    },
    {
      standardUnit: '1.000000000000001',
      expected: '1000000000000001000000000',
    },
    {
      standardUnit: '3.2',
      expected: '3200000000000000000000000',
    },
    {
      standardUnit: '3.200000000000000001',
      expected: '3200000000000000001000000',
    },
  ])(
    `should convert the near unit of "$standardUnit" to yoctonear unit of "$expected"`,
    ({ expected, standardUnit }: ITestParams) => {
      expect(convertNEARToYoctoNEAR(standardUnit)).toBe(expected);
    }
  );
});
