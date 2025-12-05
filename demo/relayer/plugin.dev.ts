import type { PluginConfigInput } from "every-plugin";
import type Plugin from "./src/index";
import packageJson from "./package.json" with { type: "json" };

export default {
  pluginId: packageJson.name,
  port: 3014,
  prefix: "/relayer",
  config: {
    variables: {
      network: "mainnet",
      contractId: "social.near",
    },
    secrets: {
      relayerAccountId: "{{RELAYER_ACCOUNT_ID}}",
      relayerPrivateKey: "{{RELAYER_PRIVATE_KEY}}",
    },
  } satisfies PluginConfigInput<typeof Plugin>,
};
