import { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';
import type { BibleBook } from '../types/bible';

export interface BibleVerse {
  id: string;
  number: number;
  text: string;
}

export const useBible = () => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async (bibleId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const arr: any[] = await apiService.getBooks(bibleId);
      const mapped: BibleBook[] = arr.map((b: any, idx: number) => ({
        id: String(b.id ?? b.bookId ?? idx + 1),
        name: String(b.name ?? b.abbreviation ?? `Livre ${idx + 1}`),
        chapters: Array.isArray(b.chapters) ? b.chapters.length : Number(b.chapters ?? 1),
        testament: (b.testament === 'OT' || b.testament === 'NT') ? b.testament : (idx < 39 ? 'OT' : 'NT'),
      }));
      setBooks(mapped);
    } catch (err) {
      setError('Erreur lors du chargement des livres');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapter = async (chapterId: string, bibleId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const chapter = await apiService.getChapter(chapterId, bibleId);
      return chapter;
    } catch (err) {
      setError('Erreur lors du chargement du chapitre');
      console.error('Error fetching chapter:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchVerses = async (query: string, bibleId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await apiService.searchVerses(query, bibleId);
      return list || [];
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error('Error searching verses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // no-op
  }, []);

  return {
    books,
    loading,
    error,
    fetchBooks,
    fetchChapter,
    searchVerses,
  };
};