import { validationResult } from 'express-validator';
    import * as bibleService from '../services/bibleApi.service.js';
    import logger from '../utils/logger.js';

export const getTranslations = async (req, res, next) => {
  try {
    const translations = await bibleService.getTranslations();
    res.json(translations);
  } catch (error) {
    logger.error('Error fetching translations:', error);
    next(error);
  }
};

export const getBooks = async (req, res, next) => {
  try {
    const books = await bibleService.getBooks();
    res.json(books);
  } catch (error) {
    logger.error('Error fetching books:', error);
    next(error);
  }
};

export const getChapters = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookId } = req.params;
    const chapters = await bibleService.getChapters(bookId);
    res.json(chapters);
  } catch (error) {
    logger.error('Error fetching chapters:', error);
    next(error);
  }
};

export const getChapter = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chapterId } = req.params;
    const chapter = await bibleService.getChapter(chapterId);
    res.json(chapter);
  } catch (error) {
    logger.error('Error fetching chapter:', error);
    next(error);
  }
};

export const getVerses = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { chapterId } = req.params;
    const verses = await bibleService.getVerses(chapterId);
    res.json(verses);
  } catch (error) {
    logger.error('Error fetching verses:', error);
    next(error);
  }
};

export const getVerse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { verseId } = req.params;
    const verse = await bibleService.getVerse(verseId);
    res.json(verse);
  } catch (error) {
    logger.error('Error fetching verse:', error);
    next(error);
  }
};

export const searchVerses = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q } = req.query;
    const results = await bibleService.searchVerses(q);
    res.json(results);
  } catch (error) {
    logger.error('Error searching verses:', error);
    next(error);
  }
};

export const getVerseOfDay = async (req, res, next) => {
  try {
    const verse = await bibleService.getVerseOfDay();
    res.json(verse);
  } catch (error) {
    logger.error('Error fetching verse of day:', error);
    next(error);
  }
};

export const getAudio = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { book, chapter } = req.params;
    const audio = await bibleService.getAudio(book, chapter);
    res.json(audio);
  } catch (error) {
    logger.error('Error fetching audio:', error);
    next(error);
  }
};

export const getStrongEntry = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.params;
    const entry = await bibleService.getStrongEntry(code);
    res.json(entry);
  } catch (error) {
    logger.error('Error fetching Strong entry:', error);
    next(error);
  }
};