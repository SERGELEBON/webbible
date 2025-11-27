import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import BookList from '../components/BookList';
import ChapterList from '../components/ChapterList';
import AudioPlayer from '../components/AudioPlayer';
import Breadcrumbs from '../components/Breadcrumbs';
import { ChevronLeft } from 'lucide-react';

interface BibleBook {
  id: number;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

const mockBooks: BibleBook[] = [
  { id: 1, name: 'Genèse', testament: 'OT', chapters: 50 },
  { id: 2, name: 'Exode', testament: 'OT', chapters: 40 },
  { id: 40, name: 'Matthieu', testament: 'NT', chapters: 28 },
  { id: 41, name: 'Marc', testament: 'NT', chapters: 16 },
  { id: 42, name: 'Luc', testament: 'NT', chapters: 24 },
  { id: 43, name: 'Jean', testament: 'NT', chapters: 21 },
];

export default function Audio() {
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [view, setView] = useState<'books' | 'chapters' | 'player'>('books');
  const [chatOpen, setChatOpen] = useState(false);

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

  const breadcrumbItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Écouter la Bible', path: '/audio' },
    ...(selectedBook ? [{ label: selectedBook.name }] : []),
    ...(selectedChapter ? [{ label: `Chapitre ${selectedChapter}` }] : []),
  ];

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
                <BookList
                  books={mockBooks}
                  onSelectBook={handleSelectBook}
                  selectedBookId={selectedBook?.id}
                />
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