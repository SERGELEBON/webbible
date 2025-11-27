import fetch from 'node-fetch';
    import NodeCache from 'node-cache';
    import logger from '../utils/logger.js';

const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL) || 3600 });
const BIBLE_API_KEY = process.env.BIBLE_API_KEY;
const BIBLE_API_URL = process.env.BIBLE_API_URL || 'https://rest.api.bible';

const makeApiRequest = async (endpoint) => {
  const cacheKey = `bible_${endpoint}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    logger.info(`Cache hit for ${endpoint}`);
    return cached;
  }

  const url = `${BIBLE_API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${BIBLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Bible API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  cache.set(cacheKey, data);
  logger.info(`API request successful for ${endpoint}`);
  
  return data;
};

export const getTranslations = async () => {
  return await makeApiRequest('/v1/bibles');
};

export const getBooks = async (bibleId = 'de4e12af7f28f599-02') => {
  return await makeApiRequest(`/v1/bibles/${bibleId}/books`);
};

export const getChapters = async (bookId, bibleId = 'de4e12af7f28f599-02') => {
  return await makeApiRequest(`/v1/bibles/${bibleId}/books/${bookId}/chapters`);
};

export const getChapter = async (chapterId, bibleId = 'de4e12af7f28f599-02') => {
  return await makeApiRequest(`/v1/bibles/${bibleId}/chapters/${chapterId}`);
};

export const getVerses = async (chapterId, bibleId = 'de4e12af7f28f599-02') => {
  return await makeApiRequest(`/v1/bibles/${bibleId}/chapters/${chapterId}/verses`);
};

export const getVerse = async (verseId, bibleId = 'de4e12af7f28f599-02') => {
  return await makeApiRequest(`/v1/bibles/${bibleId}/verses/${verseId}`);
};

export const searchVerses = async (query, bibleId = 'de4e12af7f28f599-02') => {
  const encodedQuery = encodeURIComponent(query);
  return await makeApiRequest(`/v1/bibles/${bibleId}/search?query=${encodedQuery}`);
};

export const getVerseOfDay = async () => {
  // Generate a verse of the day based on current date
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  // Popular verses for verse of the day
  const popularVerses = [
    'JHN.3.16',
    'ROM.8.28',
    'PHP.4.13',
    'PSA.23.1',
    'JER.29.11',
    '1CO.13.4',
    'MAT.28.20',
    'ISA.41.10'
  ];
  
  const verseIndex = dayOfYear % popularVerses.length;
  const verseId = popularVerses[verseIndex];
  
  return await getVerse(verseId);
};

export const getAudio = async (book, chapter) => {
  // Audio functionality would require additional API or service
  // For now, return a placeholder response
  return {
    book,
    chapter,
    audioUrl: null,
    message: 'Audio functionality will be available soon'
  };
};

export const getStrongEntry = async (code) => {
  // Strong's concordance would require additional data source
  // For now, return mock data based on the code
  const mockStrongs = {
    'H0430': {
      code: 'H0430',
      language: 'hebrew',
      word: 'אֱלֹהִים',
      transliteration: 'elohim',
      definition: 'Dieu, dieux, juges, anges',
      usage: 'Utilisé 2606 fois dans l\'Ancien Testament. Désigne le Dieu créateur, mais aussi des êtres divins ou des autorités.'
    },
    'G0026': {
      code: 'G0026',
      language: 'greek',
      word: 'ἀγάπη',
      transliteration: 'agapē',
      definition: 'Amour, charité',
      usage: 'Amour divin inconditionnel, distinct de l\'amour émotionnel (phileo) ou romantique (eros).'
    }
  };

  return mockStrongs[code] || {
    error: 'Strong entry not found',
    code
  };
};