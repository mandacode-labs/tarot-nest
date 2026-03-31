import { z } from 'zod';
import { yamlSchema } from './yaml.schema';

export { yamlSchema, type YamlConfig } from './yaml.schema';

// Final schema: YAML + Secrets (secrets required)
// This schema uses yamlSchema as base but makes secrets required
export const configSchema = z.object({
  server: yamlSchema.shape.server,
  openai: z.object({
    apiKey: z.string().min(1),
    systemMessage: yamlSchema.shape.openai.shape.systemMessage,
  }),
  tarot: yamlSchema.shape.tarot,
  cache: yamlSchema.shape.cache,
});

export type Config = z.infer<typeof configSchema>;
