import { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';

export interface BibleBook {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

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
      const response = await apiService.getBooks();
      setBooks(response.data || []);
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