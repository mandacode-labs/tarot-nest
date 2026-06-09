import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { configSchema } from './schema';
import type { Config } from './schema';

const CONFIG_PATH = process.env.CONFIG_PATH ?? '/app/config/config.yaml';

function setNested(
  config: Record<string, unknown>,
  path: string[],
  value: unknown,
): void {
  let current = config;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    current[key] ??= {};
    const next = current[key];
    if (typeof next !== 'object' || next === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[path[path.length - 1]] = value;
}

function ensureSkeleton(
  config: Record<string, unknown>,
): Record<string, unknown> {
  config.server ??= {};
  config.openai ??= {};
  config.tarot ??= {};
  config.cache ??= {};

  const openai = config.openai as Record<string, unknown>;
  openai.systemMessage ??= {};

  const cache = config.cache as Record<string, unknown>;
  cache.valkey ??= {};

  return config;
}

export function validate(envVars: Record<string, unknown>): Config {
  const config: Record<string, unknown> = {};

  try {
    const content = readFileSync(CONFIG_PATH, 'utf8');
    const parsed: unknown = load(content);

    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      Object.assign(config, parsed);
    }
  } catch {
    console.warn(
      `Failed to load YAML config from ${CONFIG_PATH}. Using defaults.`,
    );
  }

  const openaiApiKey = envVars.OPENAI_API_KEY;
  if (typeof openaiApiKey === 'string' && openaiApiKey.length > 0) {
    setNested(config, ['openai', 'apiKey'], openaiApiKey);
  }

  const valkeyPassword = envVars.VALKEY_PASSWORD;
  if (typeof valkeyPassword === 'string') {
    setNested(config, ['cache', 'valkey', 'password'], valkeyPassword);
  }

  const valkeyHost = envVars.VALKEY_HOST;
  if (typeof valkeyHost === 'string') {
    setNested(config, ['cache', 'valkey', 'host'], valkeyHost);
  }

  const valkeyPort = envVars.VALKEY_PORT;
  if (typeof valkeyPort === 'string') {
    setNested(config, ['cache', 'valkey', 'port'], parseInt(valkeyPort, 10));
  }

  const valkeyPrefix = envVars.VALKEY_PREFIX;
  if (typeof valkeyPrefix === 'string') {
    setNested(config, ['cache', 'valkey', 'prefix'], valkeyPrefix);
  }

  const valkeyUsername = envVars.VALKEY_USERNAME;
  if (typeof valkeyUsername === 'string') {
    setNested(config, ['cache', 'valkey', 'username'], valkeyUsername);
  }

  return configSchema.parse(ensureSkeleton(config));
}
