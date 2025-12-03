import React, { useState, useEffect } from 'react';
import { useBible } from '../hooks/useBible';
import type { BibleBook } from '../types/bible';
import { apiService } from '../services/api.service';
import ChatWidget from "../components/ChatWidget.tsx";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import Breadcrumbs from "../components/Breadcrumbs.tsx";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import ChapterList from "../components/ChapterList.tsx";
import BookList from "../components/BookList.tsx";
import Verse from "../components/Verse.tsx";
import TranslationPicker, { type Translation } from "../components/TranslationPicker.tsx";

// Define the shape of a verse item based on API responses
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
        // Remove leading verse number and pilcrow if any (e.g., "10  ")
        txt = txt.replace(/^\s*\d+\s*¶?\s*/, '');
        return txt.replace(/\s+/g, ' ');
    }
    return str.trim();
}

export default function Reader() {
    const { books, loading: booksLoading, error: booksError, fetchBooks } = useBible();

    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [verses, setVerses] = useState<VerseItem[]>([]);
    const [darkMode, setDarkMode] = useState(false);
    const [view, setView] = useState<'books' | 'chapters' | 'verses'>('books');
    const [loading, setLoading] = useState(false); // for chapters and verses fetching
    const [chatOpen, setChatOpen] = useState(false);
    const [chaptersMeta, setChaptersMeta] = useState<ChapterMeta[]>([]);
    const [chaptersError, setChaptersError] = useState<string | null>(null);

    // translations state
    const [translations, setTranslations] = useState<Translation[]>([]);
    const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
    const [loadingTranslations, setLoadingTranslations] = useState(false);

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Accueil', path: '/' },
        { label: 'Lire la Bible', path: '/reader' },
        ...(selectedBook ? [{ label: selectedBook.name }] as const : []),
        ...(selectedChapter ? [{ label: `Chapitre ${selectedChapter}` }] as const : []),
    ];

    // Load available translations on mount
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoadingTranslations(true);
            try {
                const resp = await apiService.getTranslations();
                const arr: any[] = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : []);
                const mapped: Translation[] = arr
                    .map((t: any) => ({
                        id: String(t.id ?? t.bibleId ?? ''),
                        name: String(t.name ?? t.title ?? t.abbreviation ?? 'Version'),
                        abbreviation: t.abbreviation ?? t.abbr ?? undefined,
                        language: t.language ?? t.lang ?? undefined,
                    }))
                    .filter((t: Translation) => t.id);
                if (mounted) setTranslations(mapped);
            } catch (e) {
                console.error('Error loading translations:', e);
                if (mounted) setTranslations([]);
            } finally {
                if (mounted) setLoadingTranslations(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Build chapters list with filtering and numeric sort
    const handleSelectBook = async (book: BibleBook) => {
        setSelectedBook(book);
        setView('chapters');
        setSelectedChapter(null);
        setVerses([]);
        setChaptersError(null);
        setLoading(true);
        try {
            const data = await apiService.getChapters(book.id, selectedTranslation?.id);
            const raw: any[] = (Array.isArray(data) ? data : (data as any)?.data ?? []) as any[];

            // Keep only real chapters: those with a numeric number or an id ending with .<number>
            const filtered = raw.filter((c: any) => {
                const hasNumericNumber = c?.number != null && /^\d+$/.test(String(c.number));
                const idStr = String(c?.id ?? '');
                const idHasNumericSuffix = /\.([1-9]\d*)$/.test(idStr);
                return hasNumericNumber || idHasNumericSuffix;
            });

            const list: ChapterMeta[] = filtered
                .map((c: any, idx: number) => {
                    const idStr = String(c?.id ?? '');
                    let number = c?.number != null && /^\d+$/.test(String(c.number)) ? Number(c.number) : NaN;
                    if (!Number.isFinite(number)) {
                        const m = idStr.match(/\.([1-9]\d*)$/);
                        number = m ? Number(m[1]) : idx + 1;
                    }
                    const id = idStr || `${book.id}.${number}`;
                    return { id, number };
                })
                .sort((a, b) => a.number - b.number);

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
            const data = await apiService.getVerses(chapterId, selectedTranslation?.id);
            console.log('Verses payload shape:', data);
            setVerses(Array.isArray(data) ? data : (data as any)?.verses ?? []);
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
            setChaptersMeta([]);
            setChaptersError(null);
        }
    };

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

                    {/* Translation selection */}
                    <div className={`rounded-2xl shadow-sm p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <TranslationPicker
                            translations={translations}
                            selectedId={selectedTranslation?.id}
                            onSelect={(t) => {
                                setSelectedTranslation(t);
                                // reset selections when translation changes
                                setSelectedBook(null);
                                setSelectedChapter(null);
                                setChaptersMeta([]);
                                setVerses([]);
                                // fetch books for this translation via hook
                                fetchBooks(t.id);
                                // ensure view shows books
                                setView('books');
                            }}
                            loading={loadingTranslations}
                        />
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
                                {!selectedTranslation && (
                                    <div className={`mb-4 text-sm rounded-md p-3 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-blue-50 text-blue-800'}`}>
                                        Veuillez d'abord sélectionner une version de la Bible ci-dessus.
                                    </div>
                                )}
                                {booksError && (
                                    <div className="mb-4 text-red-600">{booksError}</div>
                                )}
                                {booksLoading ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
                                        ))}
                                    </div>
                                ) : selectedTranslation ? (
                                    <BookList
                                        books={books}
                                        onSelectBook={handleSelectBook}
                                        selectedBookId={selectedBook?.id}
                                    />
                                ) : null}
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
                                {chaptersError && (
                                    <div className="mb-4 text-red-600">{chaptersError}</div>
                                )}
                                <ChapterList
                                    totalChapters={chaptersMeta.length || selectedBook.chapters}
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
                                    {selectedTranslation?.abbreviation ? `Version ${selectedTranslation.abbreviation}` : 'Version sélectionnée'}
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
                                                key={verse.id ?? `${selectedBook?.id}.${selectedChapter}.${index + 1}`}
                                                number={index + 1}
                                                text={extractVerseText(verse) || `Verset ${index + 1}`}
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