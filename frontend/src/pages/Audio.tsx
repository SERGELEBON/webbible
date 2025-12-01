import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import BookList from '../components/BookList';
import ChapterList from '../components/ChapterList';
import AudioPlayer from '../components/AudioPlayer';
import Breadcrumbs from '../components/Breadcrumbs';
import { ChevronLeft } from 'lucide-react';
import type { BibleBook } from '../types/bible';
import { apiService, ApiError } from '../services/api.service';

export default function Audio() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [view, setView] = useState<'books' | 'chapters' | 'player'>('books');
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const raw: any = await apiService.getBooks();
        const arr: any[] = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        // Map minimal shape to BibleBook with string ids
        const mapped: BibleBook[] = arr.map((b: any, idx: number) => ({
          id: String(b.id ?? b.bookId ?? idx + 1),
          name: String(b.name ?? b.abbreviation ?? `Livre ${idx + 1}`),
          chapters: Array.isArray(b.chapters) ? b.chapters.length : Number(b.chapters ?? 1),
          // Heuristic: first 39 entries as OT, rest NT, if testament not provided
          testament: (b.testament === 'OT' || b.testament === 'NT')
            ? b.testament
            : (idx < 39 ? 'OT' : 'NT'),
        }));
        if (mounted) setBooks(mapped);
      } catch (e: any) {
        const msg = e instanceof ApiError ? e.message : (e?.message || 'Erreur de chargement');
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSelectBook = (book: BibleBook) => {
    setSelectedBook(book);
    setView('chapters');
    setSelectedChapter(null);
  };

  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(chapter);
    setView('player');
  };

  const handleBack = () => {
    if (view === 'player') {
      setView('chapters');
      setSelectedChapter(null);
    } else if (view === 'chapters') {
      setView('books');
      setSelectedBook(null);
    }
  };

  const breadcrumbItems = useMemo(() => ([
    { label: 'Accueil', path: '/' },
    { label: 'Écouter la Bible', path: '/audio' },
    ...(selectedBook ? [{ label: selectedBook.name }] as const : []),
    ...(selectedChapter ? [{ label: `Chapitre ${selectedChapter}` }] as const : []),
  ]), [selectedBook, selectedChapter]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            {view !== 'books' && (
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 mb-6 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>
            )}

            {view === 'books' && (
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  Écouter la Bible
                </h1>
                <p className="text-gray-600 mb-6">
                  Choisissez un livre pour commencer l'écoute
                </p>

                {loading && (
                  <div className="text-gray-500">Chargement des livres...</div>
                )}
                {error && (
                  <div className="text-red-600 mb-4">{error}</div>
                )}
                {!loading && !error && (
                  <BookList
                    books={books}
                    onSelectBook={handleSelectBook}
                    selectedBookId={selectedBook?.id}
                  />
                )}
              </div>
            )}

            {view === 'chapters' && selectedBook && (
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {selectedBook.name}
                </h1>
                <p className="text-gray-600 mb-6">
                  Choisissez un chapitre à écouter
                </p>
                <ChapterList
                  totalChapters={selectedBook.chapters}
                  selectedChapter={selectedChapter || undefined}
                  onSelectChapter={handleSelectChapter}
                />
              </div>
            )}

            {view === 'player' && selectedBook && selectedChapter && (
              <div className="max-w-2xl mx-auto">
                <AudioPlayer
                  bookName={selectedBook.name}
                  chapter={selectedChapter}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
}