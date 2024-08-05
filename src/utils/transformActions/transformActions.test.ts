import { transformActions } from './transformActions';
import { Action, FunctionCall } from '@near-js/transactions';

describe('transformActions', () => {
  it('should transform a valid FunctionCall action', () => {
    const mockFunctionCall: FunctionCall = {
      methodName: 'testMethod',
      args: new Uint8Array([1, 2, 3]),
      gas: BigInt(1000000),
      deposit: BigInt(0),
    };

    const mockAction: Action = {
      enum: 'FunctionCall',
      functionCall: mockFunctionCall,
    };

    const result = transformActions([mockAction]);

    expect(result).toEqual([
      {
        type: 'FunctionCall',
        params: {
          methodName: 'testMethod',
          args: new Uint8Array([1, 2, 3]),
          gas: BigInt(1000000),
          deposit: BigInt(0),
        },
      },
    ]);
  });

  it('should throw an error for unsupported action types', () => {
    const mockUnsupportedAction: Action = {
      enum: 'CreateAccount',
      createAccount: {},
    };

    expect(() => transformActions([mockUnsupportedAction])).toThrow(
      'Unsupported action type: CreateAccount'
    );
  });

  it('should transform multiple actions', () => {
    const mockFunctionCall1: FunctionCall = {
      methodName: 'method1',
      args: new Uint8Array([4, 5, 6]),
      gas: BigInt(2000000),
      deposit: BigInt(100),
    };

    const mockFunctionCall2: FunctionCall = {
      methodName: 'method2',
      args: new Uint8Array([7, 8, 9]),
      gas: BigInt(3000000),
      deposit: BigInt(200),
    };

    const mockActions: Action[] = [
      { enum: 'FunctionCall', functionCall: mockFunctionCall1 },
      { enum: 'FunctionCall', functionCall: mockFunctionCall2 },
    ];

    const result = transformActions(mockActions);

    expect(result).toEqual([
      {
        type: 'FunctionCall',
        params: {
          methodName: 'method1',
          args: new Uint8Array([4, 5, 6]),
          gas: BigInt(2000000),
          deposit: BigInt(100),
        },
      },
      {
        type: 'FunctionCall',
        params: {
          methodName: 'method2',
          args: new Uint8Array([7, 8, 9]),
          gas: BigInt(3000000),
          deposit: BigInt(200),
        },
      },
    ]);
  });
});
