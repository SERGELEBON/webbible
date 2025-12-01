import React, { useState } from 'react';
import { useBible } from '../hooks/useBible';
import type { BibleBook } from '../types/bible';
import { apiService } from '../services/api.service';

// Define the shape of a verses item based on API responses
type VerseItem = {
  id?: string | number;
  text?: string;
  content?: string;
  attributes?: { text?: string; content?: string };
};

type ChapterMeta = { id: string; number: number };

// Extract readable verses text from various API shapes (HTML or plain)
function extractVerseText(v: VerseItem): string {
  const raw = v?.text ?? v?.content ?? v?.attributes?.text ?? v?.attributes?.content ?? '';
  if (!raw) return '';
  const str = String(raw);
  // Strip HTML if present
  if (/<[^>]+>/.test(str)) {
    const div = document.createElement('div');
    div.innerHTML = str;
    let txt = (div.textContent || div.innerText || '').trim();
    // Remove leading verses number and pilcrow if any (e.g., "10  ")
    txt = txt.replace(/^\s*\d+\s*¶?\s*/, '');
    return txt.replace(/\s+/g, ' ');
  }
  return str.trim();
}

export default function Reader() {
  const { books, loading: booksLoading, error: booksError } = useBible();
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState<'books' | 'chapters' | 'verses'>('books');
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chaptersMeta, setChaptersMeta] = useState<ChapterMeta[]>([]);
  const [chaptersError, setChaptersError] = useState<string | null>(null);

  // Restore breadcrumb items to avoid ReferenceError
  const breadcrumbItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Lire la Bible', path: '/reader' },
    ...(selectedBook ? [{ label: selectedBook.name }] : []),
    ...(selectedChapter ? [{ label: `Chapitre ${selectedChapter}` }] : []),
  ];

  // Reintroduce handleSelectBook used by onSelectBook prop
  const handleSelectBook = async (book: BibleBook) => {
    setSelectedBook(book);
    setView('chapters');
    setSelectedChapter(null);
    setVerses([]);
    setChaptersError(null);
    setLoading(true);
    try {
      const data = await apiService.getChapters(book.id);
      const list: ChapterMeta[] = (Array.isArray(data) ? data : (data?.data ?? data) || []).map((c: any, idx: number) => ({
        id: String(c.id ?? c.chapterId ?? `${book.id}.${idx + 1}`),
        number: Number(c.number ?? idx + 1),
      }));
      setChaptersMeta(list);
    } catch (e) {
      console.error('Error fetching chapters list:', e);
      setChaptersMeta([]);
      setChaptersError('Impossible de charger les chapitres');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChapter = async (chapter: number) => {
    if (!selectedBook) return;
    
    setSelectedChapter(chapter);
    setView('verses');
    setLoading(true);

    try {
      const chapterId = chaptersMeta.find((c) => c.number === chapter)?.id || `${selectedBook.id}.${chapter}`;
      const data = await apiService.getVerses(chapterId);
      console.log('Verses payload shape:', data);
      setVerses(Array.isArray(data) ? data : (data?.verses ?? []));
    } catch (error) {
      console.error('Error fetching verses:', error);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  };