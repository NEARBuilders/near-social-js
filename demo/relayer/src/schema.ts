import { z } from 'every-plugin/zod';

export const ConnectInputSchema = z.object({
  accountId: z
    .string()
    .min(1, 'Account ID is required')
    .describe('The account ID to ensure storage deposit for'),
});

export const ConnectOutputSchema = z.object({
  accountId: z.string().describe('The account ID that was connected'),
  hasStorage: z.boolean().describe('Whether the account already had storage'),
  depositTxHash: z
    .string()
    .optional()
    .describe('Transaction hash if a deposit was made'),
});

export const PublishInputSchema = z.object({
  payload: z
    .string()
    .min(1, 'Payload is required')
    .describe('Base64 encoded signed delegate action'),
});

export const PublishOutputSchema = z.object({
  hash: z.string().describe('Transaction hash'),
});

export type ConnectInput = z.infer<typeof ConnectInputSchema>;
export type ConnectOutput = z.infer<typeof ConnectOutputSchema>;
export type PublishInput = z.infer<typeof PublishInputSchema>;
export type PublishOutput = z.infer<typeof PublishOutputSchema>;
