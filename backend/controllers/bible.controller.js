import { validationResult } from 'express-validator';
    import * as bibleService from '../services/bibleApi.service.js';
    import logger from '../utils/logger.js';

export const getTranslations = async (req, res, next) => {
    try {
        const translations = await bibleService.getTranslations();
        res.set('Cache-Control', 'no-store');        // ICI
        return res.json(translations);
    } catch (error) { next(error); }
};

export const getBooks = async (req, res, next) => {
    try {
        const bibleId = req.query.bibleId;
        const books = await bibleService.getBooks(bibleId);
        res.set('Cache-Control', 'no-store');        // ICI
        return res.json(books);
    } catch (error) { next(error); }
};

export const getChapters = async (req, res, next) => {
    try {
        const { bookId } = req.params;
        const bibleId = req.query.bibleId;
        const chapters = await bibleService.getChapters(bookId, bibleId);
        res.set('Cache-Control', 'no-store');        // ICI
        return res.json(chapters);
    } catch (error) { next(error); }
};

export const getChapter = async (req, res, next) => {
    try {
        const { chapterId } = req.params;
        const bibleId = req.query.bibleId;
        const chapter = await bibleService.getChapter(chapterId, bibleId);
        res.set('Cache-Control', 'no-store');        // ICI
        return res.json(chapter);
    } catch (error) { next(error); }
};

export const getVerses = async (req, res, next) => {
    try {
        const { chapterId } = req.params;
        const bibleId = req.query.bibleId;
        const verses = await bibleService.getVerses(chapterId, bibleId);
        res.set('Cache-Control', 'no-store');        // ICI
        return res.json(verses);
    } catch (error) { next(error); }
};

export const getVerse = async (req, res, next) => {
    try {
        const { verseId } = req.params;
        const bibleId = req.query.bibleId;
        const verse = await bibleService.getVerse(verseId, bibleId);
        res.set('Cache-Control', 'no-store');        // ICI
        return res.json(verse);
    } catch (error) { next(error); }
};

export const searchVerses = async (req, res, next) => {
    try {
        const { q } = req.query;
        const bibleId = req.query.bibleId;
        const results = await bibleService.searchVerses(q, bibleId);
        res.set('Cache-Control', 'no-store');        // ICI
        return res.json(results);
    } catch (error) { next(error); }
};

export const getVerseOfDay = async (req, res, next) => {
    try {
        const verse = await bibleService.getVerseOfDay();
        res.set('Cache-Control', 'no-store');        // ICI
        return res.json(verse);
    } catch (error) { next(error); }
};

export const getAudio = async (req, res, next) => {
    try {
        const { book, chapter } = req.params;
        const audio = await bibleService.getAudio(book, chapter);
        res.set('Cache-Control', 'no-store');        // ICI
        return res.json(audio);
    } catch (error) { next(error); }
};

export const getStrongEntry = async (req, res, next) => {
    try {
        const { code } = req.params;
        const entry = await bibleService.getStrongEntry(code);
        res.set('Cache-Control', 'no-store');        // ICI
        return res.json(entry);
    } catch (error) { next(error); }
};