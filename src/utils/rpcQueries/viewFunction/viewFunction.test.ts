import { providers } from 'near-api-js';
import type { IOptions } from './types';
import viewFunction from './viewFunction'; // Adjust the import path as needed

// Mock the near-api-js providers
jest.mock('near-api-js', () => ({
  providers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      query: jest.fn(),
    })),
  },
}));

describe('viewFunction', () => {
  let defaultOptions: IOptions;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    (providers.JsonRpcProvider as jest.Mock).mockImplementation(() => ({
      query: mockQuery,
    }));

    defaultOptions = {
      contractId: 'test.near',
      method: 'get_value',
      provider: new providers.JsonRpcProvider({
        url: 'https://a.query.to.nowhere',
      }),
    };
  });

  it('should call the provider with correct parameters and return parsed result', async () => {
    const mockResult = {
      result: Buffer.from(JSON.stringify({ value: 'test' })).toJSON().data,
    };
    mockQuery.mockResolvedValue(mockResult);

    const result = await viewFunction({
      ...defaultOptions,
      args: { key: 'someKey' },
    });

    expect(mockQuery).toHaveBeenCalledWith({
      request_type: 'call_function',
      account_id: 'test.near',
      method_name: 'get_value',
      args_base64: Buffer.from(JSON.stringify({ key: 'someKey' })).toString(
        'base64'
      ),
      finality: 'optimistic',
    });
    expect(result).toEqual({ value: 'test' });
  });

  it('should handle empty args', async () => {
    mockQuery.mockResolvedValue({
      result: Buffer.from('{}').toString('base64'),
    });

    await viewFunction(defaultOptions);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        args_base64: Buffer.from('{}').toString('base64'),
      })
    );
  });
});
