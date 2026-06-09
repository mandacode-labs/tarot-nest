import { z } from 'zod';

export const llmReadResponseSchema = z.object({
  advice: z.string().min(1),
});

export type LlmReadResponse = z.infer<typeof llmReadResponseSchema>;

export const readResponseSchema = z.object({
  title: z.string().min(1),
  titleKR: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  advice: z.string().min(1),
});

export type ReadResponse = z.infer<typeof readResponseSchema>;
