import type { YamlConfig } from './yaml.schema';

export function overrideWithEnv(config: YamlConfig): YamlConfig {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const valkeyPassword = process.env.VALKEY_PASSWORD;
  const valkeyHost = process.env.VALKEY_HOST;
  const valkeyPort = process.env.VALKEY_PORT;
  const valkeyPrefix = process.env.VALKEY_PREFIX;
  const valkeyUsername = process.env.VALKEY_USERNAME;

  if (openaiApiKey) {
    config.openai.apiKey = openaiApiKey;
  }

  if (valkeyPassword) {
    config.cache.valkey.password = valkeyPassword;
  }

  if (valkeyHost) {
    config.cache.valkey.host = valkeyHost;
  }

  if (valkeyPort) {
    config.cache.valkey.port = parseInt(valkeyPort, 10);
  }

  if (valkeyPrefix) {
    config.cache.valkey.prefix = valkeyPrefix;
  }

  if (valkeyUsername) {
    config.cache.valkey.username = valkeyUsername;
  }

  return config;
}
