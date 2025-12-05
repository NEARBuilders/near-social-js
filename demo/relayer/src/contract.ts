import { oc } from "every-plugin/orpc";
import { z } from "every-plugin/zod";
import {
  ConnectInputSchema,
  ConnectOutputSchema,
  PublishInputSchema,
  PublishOutputSchema,
} from "./schema";

export const contract = oc.router({
  connect: oc
    .route({
      method: "POST",
      path: "/connect",
      summary: "Connect account to social.near",
      description: "Ensures the account has storage deposit on the social.near contract. If not, makes a deposit on behalf of the user.",
      tags: ["Social"],
    })
    .input(ConnectInputSchema)
    .output(ConnectOutputSchema),

  publish: oc
    .route({
      method: "POST",
      path: "/publish",
      summary: "Publish a signed delegate action",
      description: "Submits a signed delegate action (meta-transaction) to the network. Used for gasless social posts and profile updates.",
      tags: ["Social"],
    })
    .input(PublishInputSchema)
    .output(PublishOutputSchema),

  ping: oc
    .route({
      method: "GET",
      path: "/ping",
      summary: "Health check",
      description: "Simple ping endpoint to verify the relayer is responding correctly.",
      tags: ["Health"],
    })
    .output(
      z.object({
        status: z.literal("ok"),
        timestamp: z.string().datetime(),
      })
    ),
});
