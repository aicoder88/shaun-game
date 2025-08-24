// Vocabulary data organized by difficulty level and theme
export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  contextSentence: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  theme: 'detective' | 'steampunk' | 'space' | 'cyborg' | 'general';
  pronunciation?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export const vocabularyDatabase: VocabularyWord[] = [
  // Detective/Mystery vocabulary - Beginner
  {
    id: 'clue',
    word: 'clue',
    definition: 'A piece of evidence or information that helps solve a mystery',
    contextSentence: 'Sherlock found an important clue hidden under the carpet.',
    difficulty: 'beginner',
    theme: 'detective',
    synonyms: ['hint', 'lead', 'evidence'],
    antonyms: ['confusion', 'misleading']
  },
  {
    id: 'suspect',
    word: 'suspect',
    definition: 'A person who might have committed a crime',
    contextSentence: 'The butler is our main suspect in the diamond theft.',
    difficulty: 'beginner',
    theme: 'detective',
    synonyms: ['accused', 'person of interest'],
    antonyms: ['innocent', 'victim']
  },
  {
    id: 'alibi',
    word: 'alibi',
    definition: 'Proof that someone was somewhere else when a crime happened',
    contextSentence: 'Lady Pemberton has a strong alibi - she was dining with witnesses.',
    difficulty: 'intermediate',
    theme: 'detective',
    synonyms: ['excuse', 'defense'],
    antonyms: ['guilt', 'incrimination']
  },
  {
    id: 'investigate',
    word: 'investigate',
    definition: 'To examine something carefully to discover the truth',
    contextSentence: 'Holmes decided to investigate the mysterious noise in the engine room.',
    difficulty: 'beginner',
    theme: 'detective',
    synonyms: ['examine', 'research', 'explore'],
    antonyms: ['ignore', 'overlook']
  },
  
  // Steampunk vocabulary
  {
    id: 'contraption',
    word: 'contraption',
    definition: 'A mechanical device that looks complicated or unusual',
    contextSentence: 'The inventor showed us his latest steam-powered contraption.',
    difficulty: 'intermediate',
    theme: 'steampunk',
    synonyms: ['device', 'gadget', 'apparatus'],
    antonyms: ['simplicity', 'basic tool']
  },
  {
    id: 'locomotive',
    word: 'locomotive',
    definition: 'A powered rail vehicle used for pulling trains',
    contextSentence: 'The massive locomotive released clouds of steam as it departed.',
    difficulty: 'intermediate',
    theme: 'steampunk',
    synonyms: ['engine', 'train engine'],
    antonyms: ['passenger car', 'cargo']
  },
  {
    id: 'brass',
    word: 'brass',
    definition: 'A yellow metal made from copper and zinc, often used for decoration',
    contextSentence: 'The ornate brass fittings gleamed in the lamplight.',
    difficulty: 'beginner',
    theme: 'steampunk',
    synonyms: ['bronze', 'copper alloy'],
    antonyms: ['silver', 'iron']
  },
  
  // Space vocabulary
  {
    id: 'cosmos',
    word: 'cosmos',
    definition: 'The universe seen as a well-ordered whole',
    contextSentence: 'Our train soared through the vast cosmos, past distant stars.',
    difficulty: 'advanced',
    theme: 'space',
    synonyms: ['universe', 'space', 'galaxy'],
    antonyms: ['chaos', 'disorder']
  },
  {
    id: 'celestial',
    word: 'celestial',
    definition: 'Relating to the sky or outer space',
    contextSentence: 'We observed celestial bodies through the observatory window.',
    difficulty: 'advanced',
    theme: 'space',
    synonyms: ['heavenly', 'astronomical', 'stellar'],
    antonyms: ['earthly', 'terrestrial']
  },
  {
    id: 'nebula',
    word: 'nebula',
    definition: 'A cloud of gas and dust in outer space',
    contextSentence: 'The colorful nebula sparkled like cosmic jewels.',
    difficulty: 'advanced',
    theme: 'space',
    synonyms: ['space cloud', 'cosmic dust'],
    antonyms: ['vacuum', 'empty space']
  },
  
  // Cyborg vocabulary
  {
    id: 'artificial',
    word: 'artificial',
    definition: 'Made by humans rather than occurring naturally',
    contextSentence: 'The cyborg had artificial intelligence that could think like a human.',
    difficulty: 'intermediate',
    theme: 'cyborg',
    synonyms: ['synthetic', 'manufactured', 'man-made'],
    antonyms: ['natural', 'organic', 'real']
  },
  {
    id: 'cybernetic',
    word: 'cybernetic',
    definition: 'Relating to the interaction between humans and machines',
    contextSentence: 'His cybernetic arm was stronger than any human limb.',
    difficulty: 'advanced',
    theme: 'cyborg',
    synonyms: ['robotic', 'mechanical', 'computerized'],
    antonyms: ['biological', 'organic', 'natural']
  },
  {
    id: 'interface',
    word: 'interface',
    definition: 'A point where two systems meet and interact',
    contextSentence: 'She used the neural interface to communicate with the ship\'s computer.',
    difficulty: 'advanced',
    theme: 'cyborg',
    synonyms: ['connection', 'link', 'bridge'],
    antonyms: ['separation', 'barrier', 'isolation']
  }
];

// Function to get vocabulary by theme and difficulty
export const getVocabularyByTheme = (theme: string, difficulty?: string): VocabularyWord[] => {
  return vocabularyDatabase.filter(word => {
    const themeMatch = word.theme === theme || theme === 'all';
    const difficultyMatch = !difficulty || word.difficulty === difficulty;
    return themeMatch && difficultyMatch;
  });
};

// Function to get random vocabulary words
export const getRandomVocabulary = (count: number, theme?: string): VocabularyWord[] => {
  const words = theme ? getVocabularyByTheme(theme) : vocabularyDatabase;
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to get vocabulary appropriate for current game phase
export const getPhaseVocabulary = (phase: 'steampunk' | 'space' | 'cyborg'): VocabularyWord[] => {
  const detectiveWords = getVocabularyByTheme('detective');
  const phaseWords = getVocabularyByTheme(phase);
  const generalWords = getVocabularyByTheme('general');
  
  return [...detectiveWords, ...phaseWords, ...generalWords];
};