import { z } from 'zod';

export const cardSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameKR: z.string(),
});

export type CardData = z.infer<typeof cardSchema>;

export const majorArcanaDefault: CardData[] = [
  { id: 'major-0', name: 'The Fool', nameKR: '바보' },
  { id: 'major-1', name: 'The Magician', nameKR: '마법사' },
  { id: 'major-2', name: 'The High Priestess', nameKR: '여사제' },
  { id: 'major-3', name: 'The Empress', nameKR: '여황제' },
  { id: 'major-4', name: 'The Emperor', nameKR: '황제' },
  { id: 'major-5', name: 'The Hierophant', nameKR: '교황' },
  { id: 'major-6', name: 'The Lovers', nameKR: '연인' },
  { id: 'major-7', name: 'The Chariot', nameKR: '전차' },
  { id: 'major-8', name: 'Strength', nameKR: '힘' },
  { id: 'major-9', name: 'The Hermit', nameKR: '은둔자' },
  { id: 'major-10', name: 'Wheel of Fortune', nameKR: '운명의 수레바퀴' },
  { id: 'major-11', name: 'Justice', nameKR: '정의' },
  { id: 'major-12', name: 'The Hanged Man', nameKR: '매달린 남자' },
  { id: 'major-13', name: 'Death', nameKR: '죽음' },
  { id: 'major-14', name: 'Temperance', nameKR: '절제' },
  { id: 'major-15', name: 'The Devil', nameKR: '악마' },
  { id: 'major-16', name: 'The Tower', nameKR: '탑' },
  { id: 'major-17', name: 'The Star', nameKR: '별' },
  { id: 'major-18', name: 'The Moon', nameKR: '달' },
  { id: 'major-19', name: 'The Sun', nameKR: '태양' },
  { id: 'major-20', name: 'Judgement', nameKR: '심판' },
  { id: 'major-21', name: 'The World', nameKR: '세계' },
];

export const wandsDefault: CardData[] = [
  { id: 'wands-ace', name: 'Ace of Wands', nameKR: '지팡이 에이스' },
  { id: 'wands-2', name: 'Two of Wands', nameKR: '지팡이 2' },
  { id: 'wands-3', name: 'Three of Wands', nameKR: '지팡이 3' },
  { id: 'wands-4', name: 'Four of Wands', nameKR: '지팡이 4' },
  { id: 'wands-5', name: 'Five of Wands', nameKR: '지팡이 5' },
  { id: 'wands-6', name: 'Six of Wands', nameKR: '지팡이 6' },
  { id: 'wands-7', name: 'Seven of Wands', nameKR: '지팡이 7' },
  { id: 'wands-8', name: 'Eight of Wands', nameKR: '지팡이 8' },
  { id: 'wands-9', name: 'Nine of Wands', nameKR: '지팡이 9' },
  { id: 'wands-10', name: 'Ten of Wands', nameKR: '지팡이 10' },
  { id: 'wands-page', name: 'Page of Wands', nameKR: '지팡이 시종' },
  { id: 'wands-knight', name: 'Knight of Wands', nameKR: '지팡이 기사' },
  { id: 'wands-queen', name: 'Queen of Wands', nameKR: '지팡이 여왕' },
  { id: 'wands-king', name: 'King of Wands', nameKR: '지팡이 왕' },
];

export const cupsDefault: CardData[] = [
  { id: 'cups-ace', name: 'Ace of Cups', nameKR: '컵 에이스' },
  { id: 'cups-2', name: 'Two of Cups', nameKR: '컵 2' },
  { id: 'cups-3', name: 'Three of Cups', nameKR: '컵 3' },
  { id: 'cups-4', name: 'Four of Cups', nameKR: '컵 4' },
  { id: 'cups-5', name: 'Five of Cups', nameKR: '컵 5' },
  { id: 'cups-6', name: 'Six of Cups', nameKR: '컵 6' },
  { id: 'cups-7', name: 'Seven of Cups', nameKR: '컵 7' },
  { id: 'cups-8', name: 'Eight of Cups', nameKR: '컵 8' },
  { id: 'cups-9', name: 'Nine of Cups', nameKR: '컵 9' },
  { id: 'cups-10', name: 'Ten of Cups', nameKR: '컵 10' },
  { id: 'cups-page', name: 'Page of Cups', nameKR: '컵 시종' },
  { id: 'cups-knight', name: 'Knight of Cups', nameKR: '컵 기사' },
  { id: 'cups-queen', name: 'Queen of Cups', nameKR: '컵 여왕' },
  { id: 'cups-king', name: 'King of Cups', nameKR: '컵 왕' },
];

export const swordsDefault: CardData[] = [
  { id: 'swords-ace', name: 'Ace of Swords', nameKR: '검 에이스' },
  { id: 'swords-2', name: 'Two of Swords', nameKR: '검 2' },
  { id: 'swords-3', name: 'Three of Swords', nameKR: '검 3' },
  { id: 'swords-4', name: 'Four of Swords', nameKR: '검 4' },
  { id: 'swords-5', name: 'Five of Swords', nameKR: '검 5' },
  { id: 'swords-6', name: 'Six of Swords', nameKR: '검 6' },
  { id: 'swords-7', name: 'Seven of Swords', nameKR: '검 7' },
  { id: 'swords-8', name: 'Eight of Swords', nameKR: '검 8' },
  { id: 'swords-9', name: 'Nine of Swords', nameKR: '검 9' },
  { id: 'swords-10', name: 'Ten of Swords', nameKR: '검 10' },
  { id: 'swords-page', name: 'Page of Swords', nameKR: '검 시종' },
  { id: 'swords-knight', name: 'Knight of Swords', nameKR: '검 기사' },
  { id: 'swords-queen', name: 'Queen of Swords', nameKR: '검 여왕' },
  { id: 'swords-king', name: 'King of Swords', nameKR: '검 왕' },
];

export const pentaclesDefault: CardData[] = [
  { id: 'pentacles-ace', name: 'Ace of Pentacles', nameKR: '펜타클 에이스' },
  { id: 'pentacles-2', name: 'Two of Pentacles', nameKR: '펜타클 2' },
  { id: 'pentacles-3', name: 'Three of Pentacles', nameKR: '펜타클 3' },
  { id: 'pentacles-4', name: 'Four of Pentacles', nameKR: '펜타클 4' },
  { id: 'pentacles-5', name: 'Five of Pentacles', nameKR: '펜타클 5' },
  { id: 'pentacles-6', name: 'Six of Pentacles', nameKR: '펜타클 6' },
  { id: 'pentacles-7', name: 'Seven of Pentacles', nameKR: '펜타클 7' },
  { id: 'pentacles-8', name: 'Eight of Pentacles', nameKR: '펜타클 8' },
  { id: 'pentacles-9', name: 'Nine of Pentacles', nameKR: '펜타클 9' },
  { id: 'pentacles-10', name: 'Ten of Pentacles', nameKR: '펜타클 10' },
  { id: 'pentacles-page', name: 'Page of Pentacles', nameKR: '펜타클 시종' },
  {
    id: 'pentacles-knight',
    name: 'Knight of Pentacles',
    nameKR: '펜타클 기사',
  },
  { id: 'pentacles-queen', name: 'Queen of Pentacles', nameKR: '펜타클 여왕' },
  { id: 'pentacles-king', name: 'King of Pentacles', nameKR: '펜타클 왕' },
];

export const minorArcanaDefault = {
  wands: wandsDefault,
  cups: cupsDefault,
  swords: swordsDefault,
  pentacles: pentaclesDefault,
};

export const cardsDefault = {
  major: majorArcanaDefault,
  minor: minorArcanaDefault,
};

export const keywordsDefault = {
  emotion: [
    '사랑',
    '희망',
    '두려움',
    '열정',
    '평화',
    '슬픔',
    '기쁨',
    '분노',
    '안정',
    '불안',
    '설렘',
    '외로움',
    '그리움',
    '해방감',
    '갈등',
  ],
  action: [
    '시작',
    '변화',
    '성장',
    '멈춤',
    '도전',
    '포기',
    '선택',
    '기다림',
    '출발',
    '완성',
    '정리',
    '준비',
    '극복',
    '수용',
    '전환',
  ],
  time: [
    '새로운 시작',
    '과거의 정리',
    '미래의 준비',
    '현재의 집중',
    '전환기',
    '완성의 시기',
    '성장의 시기',
    '안정의 시기',
    '변화의 시기',
    '도약의 시기',
  ],
  theme: [
    '인간관계',
    '진로',
    '재물',
    '건강',
    '자아',
    '가족',
    '업무',
    '창작',
    '영적 성장',
    '내면의 평화',
  ],
};

export const tarotDefault = {
  cards: cardsDefault,
  keywords: keywordsDefault,
};
