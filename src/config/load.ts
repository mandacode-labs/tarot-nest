import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { yamlSchema } from './yaml.schema';
import type { YamlConfig } from './yaml.schema';

export function loadYamlConfig(configPath?: string): YamlConfig {
  const path =
    configPath ?? process.env.CONFIG_PATH ?? '/app/config/config.yaml';

  let yamlConfig: object = {};

  try {
    const content = readFileSync(path, 'utf8');
    const parsed: unknown = load(content);

    // Type guard to ensure parsed is a plain object (not array, not null)
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      yamlConfig = parsed;
    }
  } catch (err) {
    console.warn(
      `Failed to load YAML config from ${path}. Using defaults. Error: ${String(err)}`,
    );
  }

  return yamlSchema.parse(yamlConfig);
}
