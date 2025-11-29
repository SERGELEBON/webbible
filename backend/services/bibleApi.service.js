import axios from 'axios';
import axiosRetry from 'axios-retry';
import CircuitBreaker from 'opossum';
import NodeCache from 'node-cache';
import database from '../database/database.js';
import logger from '../utils/logger.js';

const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL) || 3600 });
const BIBLE_API_KEY = process.env.BIBLE_API_KEY;
const BIBLE_API_URL = process.env.BIBLE_API_URL || 'https://rest.api.bible';

// Configure axios with retries
const apiClient = axios.create({
  baseURL: BIBLE_API_URL,
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${BIBLE_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Configure retry logic
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status >= 500;
  }
});

// Circuit breaker configuration
const circuitBreakerOptions = {
  timeout: 15000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
  rollingCountTimeout: 10000,
  rollingCountBuckets: 10
};

const makeApiRequest = async (endpoint) => {
  const cacheKey = `bible_${endpoint}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    logger.info(`Cache hit for ${endpoint}`);
    return cached;
  }

  try {
    const response = await apiClient.get(endpoint);
    const data = response.data;
    cache.set(cacheKey, data);
    logger.info(`API request successful for ${endpoint}`);
    return data;
  } catch (error) {
    logger.error(`Bible API error for ${endpoint}:`, error.message);
    throw new Error(`Bible API error: ${error.response?.status || 'Network'} ${error.message}`);
  }
};

// Wrap API calls with circuit breaker
const circuitBreaker = new CircuitBreaker(makeApiRequest, circuitBreakerOptions);

circuitBreaker.on('open', () => logger.warn('Bible API circuit breaker opened'));
circuitBreaker.on('halfOpen', () => logger.info('Bible API circuit breaker half-open'));
circuitBreaker.on('close', () => logger.info('Bible API circuit breaker closed'));

export const getTranslations = async () => {
  return await circuitBreaker.fire('/v1/bibles');
};

export const getBooks = async (bibleId = 'de4e12af7f28f599-02') => {
  return await circuitBreaker.fire(`/v1/bibles/${bibleId}/books`);
};

export const getChapters = async (bookId, bibleId = 'de4e12af7f28f599-02') => {
  return await circuitBreaker.fire(`/v1/bibles/${bibleId}/books/${bookId}/chapters`);
};

export const getChapter = async (chapterId, bibleId = 'de4e12af7f28f599-02') => {
  return await circuitBreaker.fire(`/v1/bibles/${bibleId}/chapters/${chapterId}`);
};

export const getVerses = async (chapterId, bibleId = 'de4e12af7f28f599-02') => {
  return await circuitBreaker.fire(`/v1/bibles/${bibleId}/chapters/${chapterId}/verses`);
};

export const getVerse = async (verseId, bibleId = 'de4e12af7f28f599-02') => {
  return await circuitBreaker.fire(`/v1/bibles/${bibleId}/verses/${verseId}`);
};

export const searchVerses = async (query, bibleId = 'de4e12af7f28f599-02') => {
  const encodedQuery = encodeURIComponent(query);
  return await circuitBreaker.fire(`/v1/bibles/${bibleId}/search?query=${encodedQuery}`);
};

export const getVerseOfDay = async () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  const popularVerses = [
    'JHN.3.16', 'ROM.8.28', 'PHP.4.13', 'PSA.23.1', 'JER.29.11',
    '1CO.13.4', 'MAT.28.20', 'ISA.41.10'
  ];
  
  const verseIndex = dayOfYear % popularVerses.length;
  const verseId = popularVerses[verseIndex];
  
  return await getVerse(verseId);
};

export const getAudio = async (book, chapter) => {
  try {
    const audioFile = await database.query(
      'SELECT file_url, duration FROM audio_files WHERE book_id = ? AND chapter = ?',
      [book, chapter]
    );

    if (audioFile.length > 0) {
      return {
        book,
        chapter,
        audioUrl: audioFile[0].file_url,
        duration: audioFile[0].duration
      };
    }

    return {
      book,
      chapter,
      audioUrl: null,
      message: 'Audio functionality will be available soon'
    };
  } catch (error) {
    logger.error('Error fetching audio:', error);
    throw error;
  }
};

export const getStrongEntry = async (code) => {
  try {
    const entries = await database.query(
      'SELECT * FROM strongs_entries WHERE code = ?',
      [code]
    );

    if (entries.length > 0) {
      return entries[0];
    }

    return {
      error: 'Strong entry not found',
      code
    };
  } catch (error) {
    logger.error('Error fetching Strong entry:', error);
    throw error;
  }
};