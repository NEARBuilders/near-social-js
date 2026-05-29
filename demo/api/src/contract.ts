import { oc } from 'every-plugin/orpc';
import { z } from 'every-plugin/zod';
import {
  ConnectInputSchema,
  ConnectOutputSchema,
  PublishInputSchema,
  PublishOutputSchema,
} from './schema';

export const contract = oc.router({
  connect: oc
    .route({
      method: 'POST',
      path: '/connect',
      summary: 'Connect to contract',
      description:
        'Ensures the account has storage deposit on the contract. If not, makes a deposit on behalf of the user.',
      tags: ['API'],
    })
    .input(ConnectInputSchema)
    .output(ConnectOutputSchema),

  publish: oc
    .route({
      method: 'POST',
      path: '/publish',
      summary: 'Publish a signed delegate action',
      description:
        'Submits a signed delegate action (meta-transaction) to the network. Used for API-backed gasless social posts and profile updates.',
      tags: ['API'],
    })
    .input(PublishInputSchema)
    .output(PublishOutputSchema),

  ping: oc
    .route({
      method: 'GET',
      path: '/ping',
      summary: 'Health check',
      description:
        'Simple ping endpoint to verify the API is responding correctly.',
      tags: ['Health'],
    })
    .output(
      z.object({
        status: z.literal('ok'),
        timestamp: z.string().datetime(),
      })
    ),
});
