import { providers } from 'near-api-js';
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
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    (providers.JsonRpcProvider as jest.Mock).mockImplementation(() => ({
      query: mockQuery,
    }));
  });

  it('should call the provider with correct parameters and return parsed result', async () => {
    const mockResult = {
      result: Buffer.from(JSON.stringify({ value: 'test' })).toJSON().data,
    };
    mockQuery.mockResolvedValue(mockResult);

    const options = {
      contractId: 'test.near',
      method: 'get_value',
      args: { key: 'someKey' },
    };

    const result = await viewFunction(options);

    expect(providers.JsonRpcProvider).toHaveBeenCalledWith({
      url: 'https://rpc.mainnet.near.org',
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

  it('should use custom RPC URL if provided', async () => {
    mockQuery.mockResolvedValue({
      result: Buffer.from('{}').toString('base64'),
    });

    const options = {
      contractId: 'test.near',
      method: 'get_value',
      rpcURL: 'https://custom-rpc.near.org',
    };

    await viewFunction(options);

    expect(providers.JsonRpcProvider).toHaveBeenCalledWith({
      url: 'https://custom-rpc.near.org',
    });
  });

  it('should handle empty args', async () => {
    mockQuery.mockResolvedValue({
      result: Buffer.from('{}').toString('base64'),
    });

    const options = {
      contractId: 'test.near',
      method: 'get_value',
    };

    await viewFunction(options);

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        args_base64: Buffer.from('{}').toString('base64'),
      })
    );
  });
});
