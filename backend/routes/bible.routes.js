import express from 'express';
import { body, param, query } from 'express-validator';
import * as bibleController from '../controllers/bible.controller.js';

const router = express.Router();

// Get all Bible translations
router.get('/translations', bibleController.getTranslations);

// Get all books
router.get('/books', bibleController.getBooks);

// Get chapters for a specific book
router.get('/books/:bookId/chapters', 
  param('bookId').isString().notEmpty(),
  bibleController.getChapters
);

// Get specific chapter content
router.get('/chapters/:chapterId',
  param('chapterId').isString().notEmpty(),
  bibleController.getChapter
);

// Get verses for a specific chapter
router.get('/chapters/:chapterId/verses',
  param('chapterId').isString().notEmpty(),
  bibleController.getVerses
);

// Get specific verse
router.get('/verses/:verseId',
  param('verseId').isString().notEmpty(),
  bibleController.getVerse
);

// Search verses
router.get('/search',
  query('q').isString().isLength({ min: 2, max: 100 }),
  bibleController.searchVerses
);

// Get verse of the day
router.get('/verse-of-day', bibleController.getVerseOfDay);

// Get audio for book/chapter
router.get('/audio/:book/:chapter',
  param('book').isString().notEmpty(),
  param('chapter').isInt({ min: 1 }),
  bibleController.getAudio
);

// Get Strong's concordance entry
router.get('/strong/:code',
  param('code').matches(/^[HG]\d{1,5}$/),
  bibleController.getStrongEntry
);

export default router;