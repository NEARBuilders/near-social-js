import { Action } from '@near-js/transactions';
import { TransformedAction } from './types';

// Helper function to transform Actions
export const transformActions = (actions: Action[]): TransformedAction[] => {
  return actions.map((action) => {
    if (!action.functionCall) {
      throw new Error(`Unsupported action type: ${action.enum}`);
    }

    const functionCall = action.functionCall;
    return {
      type: 'FunctionCall',
      params: {
        methodName: functionCall.methodName,
        args: functionCall.args,
        gas: functionCall.gas,
        deposit: functionCall.deposit,
      },
    };
  });
};
