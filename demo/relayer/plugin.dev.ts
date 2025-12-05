import type { PluginConfigInput } from 'every-plugin';
import type Plugin from './src/index';
import packageJson from './package.json' with { type: 'json' };

export default {
  pluginId: packageJson.name,
  port: 3014,
  prefix: '/template',
  config: {
    variables: {
    },
    secrets: {
    }
  } satisfies PluginConfigInput<typeof Plugin>
}
