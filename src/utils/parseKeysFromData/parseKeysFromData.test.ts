// utils
import parseKeysFromData from './parseKeysFromData';

interface ITestParams {
  data: Record<string, unknown>;
  expected: string[];
}

describe('parseKeyFromData()', () => {
  it.each([
    {
      data: {
        ['thor.test.near']: {
          type: 'aesir',
        },
      },
      expected: ['thor.test.near/type'],
    },
    {
      data: {
        ['thor.test.near']: {
          profile: {
            name: 'Thor',
          },
        },
      },
      expected: ['thor.test.near/profile/name'],
    },
    {
      data: {
        ['odin.test.near']: {
          profile: {
            name: 'Odin',
          },
          type: 'aesir',
        },
      },
      expected: ['odin.test.near/profile/name', 'odin.test.near/type'],
    },
    {
      data: {
        ['huginn.test.near']: {
          profile: {
            name: 'Huginn',
          },
          type: 'raven',
        },
        ['muninn.test.near']: {
          profile: {
            name: 'Muninn',
          },
          type: 'raven',
        },
      },
      expected: [
        'huginn.test.near/profile/name',
        'huginn.test.near/type',
        'muninn.test.near/profile/name',
        'muninn.test.near/type',
      ],
    },
  ])(
    `should parse the data to the key "$expected"`,
    ({ data, expected }: ITestParams) => {
      expect(parseKeysFromData(data)).toEqual(expected);
    }
  );
});
