import { createPluginRuntime } from 'every-plugin'
import fs from 'node:fs'
import path from 'node:path'

interface PluginEntry {
  remote?: string
  module?: any
  variables?: Record<string, any>
  secrets?: Record<string, string>
}

interface RegistryConfig {
  plugins: Record<string, PluginEntry>
}

const registryPath = path.resolve(import.meta.dirname, '../registry.json')
const registry: RegistryConfig = JSON.parse(fs.readFileSync(registryPath, 'utf-8'))

function resolveSecrets(secrets: Record<string, string>): Record<string, string> {
  const resolved: Record<string, string> = {}
  for (const [key, value] of Object.entries(secrets)) {
    const match = value.match(/^\{\{(\w+)\}\}$/)
    if (match) {
      resolved[key] = process.env[match[1]] ?? ''
    } else {
      resolved[key] = value
    }
  }
  return resolved
}

export async function initializePlugins() {
  const entries = Object.entries(registry.plugins)
  if (entries.length === 0) {
    throw new Error('No plugins configured in registry.json')
  }

  const [pluginName, pluginConfig] = entries[0]!

  const runtime = createPluginRuntime({
    registry: {
      [pluginName]: { remote: pluginConfig.remote, module: pluginConfig.module }
    },
    secrets: {},
  })

  const secrets = pluginConfig.secrets ? resolveSecrets(pluginConfig.secrets) : {}
  const variables = pluginConfig.variables ?? {}

  const api = await runtime.usePlugin(pluginName, {
    variables,
    secrets,
  })

  return { runtime, api } as const
}

export type Plugins = Awaited<ReturnType<typeof initializePlugins>>
