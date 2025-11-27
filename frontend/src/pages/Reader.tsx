import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import BookList from '../components/BookList';
import ChapterList from '../components/ChapterList';
import Verse from '../components/Verse';
import Breadcrumbs from '../components/Breadcrumbs';
import { ChevronLeft, Moon, Sun } from 'lucide-react';
import { useBible } from '../hooks/useBible';
import type { BibleBook } from '../hooks/useBible';
import { apiService } from '../services/api.service';

// Define the shape of a verses item based on API responses
type VerseItem = {
  id?: string | number;
  text?: string;
  content?: string;
};

export default function Reader() {
  const { books, loading: booksLoading } = useBible();
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState<'books' | 'chapters' | 'verses'>('books');
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleSelectBook = (book: BibleBook) => {
    setSelectedBook(book);
    setView('chapters');
    setSelectedChapter(null);
    setVerses([]);
  };

  const handleSelectChapter = async (chapter: number) => {
    if (!selectedBook) return;
    
    setSelectedChapter(chapter);
    setView('verses');
    setLoading(true);

    try {
      const chapterId = `${selectedBook.id}.${chapter}`;
      const data = await apiService.getVerses(chapterId);
      setVerses(Array.isArray(data) ? data : (data?.verses ?? []));
    } catch (error) {
      console.error('Error fetching verses:', error);
      setVerses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (view === 'verses') {
      setView('chapters');
      setSelectedChapter(null);
      setVerses([]);
    } else if (view === 'chapters') {
      setView('books');
      setSelectedBook(null);
    }
  };

  const breadcrumbItems = [
    { label: 'Accueil', path: '/' },
    { label: 'Lire la Bible', path: '/reader' },
    ...(selectedBook ? [{ label: selectedBook.name }] : []),
    ...(selectedChapter ? [{ label: `Chapitre ${selectedChapter}` }] : []),
  ];

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <Breadcrumbs items={breadcrumbItems} />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-700 shadow-sm'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className={`rounded-2xl shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {view !== 'books' && (
              <button
                onClick={handleBack}
                className={`flex items-center space-x-2 mb-6 px-4 py-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>
            )}

            {view === 'books' && (
              <div>
                <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Choisissez un livre
                </h1>
                {booksLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
                    ))}
                  </div>
                ) : (
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
                <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedBook.name}
                </h1>
                <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choisissez un chapitre
                </p>
                <ChapterList
                  totalChapters={selectedBook.chapters}
                  selectedChapter={selectedChapter || undefined}
                  onSelectChapter={handleSelectChapter}
                />
              </div>
            )}

            {view === 'verses' && selectedBook && selectedChapter && (
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedBook.name} {selectedChapter}
                </h1>
                <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Version Louis Segond 1910
                </p>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {verses.map((verse, index) => (
                      <Verse 
                        key={verse.id || index} 
                        number={index + 1} 
                        text={verse.text || verse.content || `Verset ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
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