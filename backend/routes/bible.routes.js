import express from 'express';
import { body, param, query } from 'express-validator';
import * as bibleController from '../controllers/bible.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bible
 *   description: Bible content: books, chapters, verses, audio
 */

/**
 * @swagger
 * /bible/translations:
 *   get:
 *     summary: Get all Bible translations
 *     tags: [Bible]
 *     responses:
 *       200:
 *         description: List of Bible translations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 */
router.get('/translations', bibleController.getTranslations);

/**
 * @swagger
 * /bible/books:
 *   get:
 *     summary: Get all books of the Bible
 *     tags: [Bible]
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BibleBook'
 */
router.get('/books', bibleController.getBooks);

/**
 * @swagger
 * /bible/books/{bookId}/chapters:
 *   get:
 *     summary: Get chapters for a specific book
 *     tags: [Bible]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *         required: true
 *         description: Book identifier
 *     responses:
 *       200:
 *         description: List of chapters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 */
router.get('/books/:bookId/chapters',
    param('bookId').isString().notEmpty(),
    bibleController.getChapters
);

/**
 * @swagger
 * /bible/chapters/{chapterId}:
 *   get:
 *     summary: Get specific chapter content
 *     tags: [Bible]
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         schema:
 *           type: string
 *         required: true
 *         description: Chapter identifier
 *     responses:
 *       200:
 *         description: Chapter content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookId:
 *                   type: string
 *                 chapter:
 *                   type: integer
 *                 verses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Verse'
 */
router.get('/chapters/:chapterId',
    param('chapterId').isString().notEmpty(),
    bibleController.getChapter
);

/**
 * @swagger
 * /bible/chapters/{chapterId}/verses:
 *   get:
 *     summary: Get verses for a specific chapter
 *     tags: [Bible]
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         schema:
 *           type: string
 *         required: true
 *         description: Chapter identifier
 *     responses:
 *       200:
 *         description: List of verses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Verse'
 */
router.get('/chapters/:chapterId/verses',
    param('chapterId').isString().notEmpty(),
    bibleController.getVerses
);

/**
 * @swagger
 * /bible/verses/{verseId}:
 *   get:
 *     summary: Get specific verse
 *     tags: [Bible]
 *     parameters:
 *       - in: path
 *         name: verseId
 *         schema:
 *           type: string
 *         required: true
 *         description: Verse identifier
 *     responses:
 *       200:
 *         description: Verse content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Verse'
 */
router.get('/verses/:verseId',
    param('verseId').isString().notEmpty(),
    bibleController.getVerse
);

/**
 * @swagger
 * /bible/search:
 *   get:
 *     summary: Search verses
 *     tags: [Bible]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query (min 2 characters)
 *     responses:
 *       200:
 *         description: List of matching verses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Verse'
 */
router.get('/search',
    query('q').isString().isLength({ min: 2, max: 100 }),
    bibleController.searchVerses
);

/**
 * @swagger
 * /bible/verse-of-day:
 *   get:
 *     summary: Get Verse of the day
 *     tags: [Bible]
 *     responses:
 *       200:
 *         description: Verse of the day
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Verse'
 */
router.get('/verse-of-day', bibleController.getVerseOfDay);

/**
 * @swagger
 * /bible/audio/{book}/{chapter}:
 *   get:
 *     summary: Get audio for a book/chapter
 *     tags: [Bible]
 *     parameters:
 *       - in: path
 *         name: book
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: chapter
 *         schema:
 *           type: integer
 *         required: true
 *         description: Chapter number
 *     responses:
 *       200:
 *         description: Audio file URL or stream
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 */
router.get('/audio/:book/:chapter',
    param('book').isString().notEmpty(),
    param('chapter').isInt({ min: 1 }),
    bibleController.getAudio
);

/**
 * @swagger
 * /bible/strong/{code}:
 *   get:
 *     summary: Get Strong's concordance entry
 *     tags: [Bible]
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *           pattern: "^[HG]\\d{1,5}$"
 *         required: true
 *         description: Strong's code (e.g., H1234, G5678)
 *     responses:
 *       200:
 *         description: Strong's entry details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 lemma:
 *                   type: string
 *                 definition:
 *                   type: string
 */
router.get('/strong/:code',
    param('code').matches(/^[HG]\d{1,5}$/),
    bibleController.getStrongEntry
);

export default router;
