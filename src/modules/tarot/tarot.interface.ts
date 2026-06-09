import { z } from 'zod';

export const tarotDirectionSchema = z.enum(['upright', 'reversed']);
export type TarotDirection = z.infer<typeof tarotDirectionSchema>;

export interface TarotCard {
  id: string;
  name: string;
  nameKR: string;
  type: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
}

export interface TarotMessageRequest {
  card: TarotCard;
  direction: TarotDirection;
  keywords: string[];
}
