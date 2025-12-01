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

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw: any = await apiService.getBooks();
      const arr: any[] = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
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

  const fetchChapter = async (chapterId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getChapter(chapterId);
      return response.data;
    } catch (err) {
      setError('Erreur lors du chargement du chapitre');
      console.error('Error fetching chapter:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchVerses = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.searchVerses(query);
      return response.data || [];
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error('Error searching verses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
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