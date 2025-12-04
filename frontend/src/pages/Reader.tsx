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

// Verset: accepte plusieurs formes issues d'API
type VerseItem = {
    id?: string | number;
    text?: string;
    content?: string;
    attributes?: { text?: string; content?: string };
};

type ChapterMeta = { id: string; number: number };

// Extraction texte lisible d'un verset (HTML -> texte)
function extractVerseText(v: VerseItem): string {
    const raw = v?.text ?? v?.content ?? v?.attributes?.text ?? v?.attributes?.content ?? '';
    if (!raw) return '';
    const str = String(raw);
    if (/<[^>]+>/.test(str)) {
        const div = document.createElement('div');
        div.innerHTML = str;
        let txt = (div.textContent || div.innerText || '').trim();
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
    const [loading, setLoading] = useState(false); // pour chapitres/versets
    const [chatOpen, setChatOpen] = useState(false);
    const [chaptersMeta, setChaptersMeta] = useState<ChapterMeta[]>([]);
    const [chaptersError, setChaptersError] = useState<string | null>(null);

    // Versions
    const [translations, setTranslations] = useState<Translation[]>([]);
    const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
    const [loadingTranslations, setLoadingTranslations] = useState(false);

    // Fil d'ariane
    const breadcrumbItems = [
        { label: 'Accueil', path: '/' },
        { label: 'Lire la Bible', path: '/reader' },
        ...(selectedBook ? [{ label: selectedBook.name }] as const : []),
        ...(selectedChapter ? [{ label: `Chapitre ${selectedChapter}` }] as const : []),
    ];

    // Charger la liste des versions au montage
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoadingTranslations(true);
            try {
                const resp = await apiService.getTranslations();
                const arr: any[] = Array.isArray((resp as any)?.data)
                    ? (resp as any).data
                    : Array.isArray(resp as any)
                        ? (resp as any)
                        : Array.isArray((resp as any)?.translations)
                            ? (resp as any).translations
                            : [];
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

    // Si la traduction change, recharge les livres (useBible.fetchBooks)
    useEffect(() => {
        if (selectedTranslation) {
            fetchBooks(selectedTranslation.id);
            setSelectedBook(null);
            setSelectedChapter(null);
            setChaptersMeta([]);
            setVerses([]);
            setView('books');
        }
    }, [selectedTranslation, fetchBooks]);

    // Sélection d'un livre -> construire liste chapitres FIABLE
    const handleSelectBook = async (book: BibleBook) => {
        console.log('📖 Livre sélectionné:', {
            bookId: book.id,
            bookName: book.name,
            chaptersCount: book.chapters
        });
        // detect multiple id fields
        const bookId = String((book as any).id ?? (book as any).bookId ?? (book as any).osisId ?? (book as any).code ?? '');
        setSelectedBook(book);
        setView('chapters');
        setSelectedChapter(null);
        setVerses([]);
        setChaptersError(null);
        setChaptersMeta([]);
        setLoading(true);
        try {
            const resp = await apiService.getChapters(bookId, selectedTranslation?.id);

            // Normalize many possible shapes to an array
            const raw: any[] = Array.isArray((resp as any)?.data)
                ? (resp as any).data
                : Array.isArray((resp as any)?.chapters)
                    ? (resp as any).chapters
                    : Array.isArray((resp as any)?.items)
                        ? (resp as any).items
                        : Array.isArray(resp as any)
                            ? resp as any[]
                            : Array.isArray((resp as any)?.data?.chapters)
                                ? (resp as any).data.chapters
                                : [];

            // If raw empty but book exposes a numeric chapter count, create synthetic list
            const bookChapterCount = Number((book as any).chapterCount ?? (book as any).chapters ?? (book as any).numChapters ?? 0);
            let candidates = raw;
            if (candidates.length === 0 && Number.isFinite(bookChapterCount) && bookChapterCount > 0) {
                candidates = Array.from({ length: bookChapterCount }).map((_, i) => ({ id: `${bookId}.${i + 1}`, number: i + 1 }));
            }

            // Filter and build ChapterMeta
            const filtered = candidates.filter((c: any, idx: number) => {
                // accept if it has numeric number, or id ends with .<num>, or has chapter/chapterNumber fields
                const numField = c?.number ?? c?.chapter ?? c?.chapterNumber;
                const hasNumericNumber = numField != null && /^\d+$/.test(String(numField));
                const idStr = String(c?.id ?? '');
                const idHasNumericSuffix = /\.([1-9]\d*)$/.test(idStr);
                return hasNumericNumber || idHasNumericSuffix;
            });

            const list: ChapterMeta[] = filtered
                .map((c: any, idx: number) => {
                    const idStr = String(c?.id ?? '');
                    let number = NaN;
                    if (c?.number != null && /^\d+$/.test(String(c.number))) number = Number(c.number);
                    else if (c?.chapter != null && /^\d+$/.test(String(c.chapter))) number = Number(c.chapter);
                    else if (c?.chapterNumber != null && /^\d+$/.test(String(c.chapterNumber))) number = Number(c.chapterNumber);
                    else {
                        const m = idStr.match(/\.([1-9]\d*)$/);
                        number = m ? Number(m[1]) : idx + 1;
                    }
                    const id = idStr || `${bookId}.${number}`;
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

    // Sélection d'un chapitre -> récupérer versets (robuste aux formes)
    const handleSelectChapter = async (chapter: number) => {
        if (!selectedBook) return;

        console.log('📝 Chargement du chapitre:', {
            bookId: selectedBook.id,
            bookName: selectedBook.name,
            chapter
        });

        setSelectedChapter(chapter);
        setView('verses');
        setLoading(true);
        setVerses([]);

        try {
            const chapterMeta = chaptersMeta.find((c) => c.number === chapter);
            const chapterId = chapterMeta?.id || `${String((selectedBook as any).id ?? (selectedBook as any).bookId ?? (selectedBook as any).osisId)}.${chapter}`;

            console.log('📜 Versets reçus:', {
                chapterId,
                nbVerses: verses?.length,
                firstVerse: verses?.[0],
                lastVerse: verses?.[verses.length - 1]
            }); // <-- Ajoutez cette ligne

            const resp = await apiService.getVerses(chapterId, selectedTranslation?.id);

            // Normalisation agressive des versets
            let list: any[] = [];
            if (Array.isArray((resp as any)?.data)) list = (resp as any).data as any[];
            else if (Array.isArray((resp as any)?.verses)) list = (resp as any).verses as any[];
            else if (Array.isArray(resp as any)) list = resp as any[];
            else if ((resp as any)?.data && Array.isArray((resp as any).data.verses)) list = (resp as any).data.verses as any[];
            else if (typeof resp === 'string') {
                // split text into lines
                list = resp.split(/\r?\n/).filter(Boolean).map((t, i) => ({ id: `${chapterId}-${i + 1}`, text: t }));
            } else if (resp && typeof resp === 'object') {
                // try best-effort: flatten object values that look like verses
                const possible = Object.values(resp).flatMap((v: any) => Array.isArray(v) ? v : []);
                if (possible.length > 0) list = possible;
            }

            setVerses(list);
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

                    {/* Choix de version */}
                    <div className={`rounded-2xl shadow-sm p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <TranslationPicker
                            translations={translations}
                            selectedId={selectedTranslation?.id}
                            onSelect={(t) => {
                                setSelectedTranslation(t);
                                // reset
                                setSelectedBook(null);
                                setSelectedChapter(null);
                                setChaptersMeta([]);
                                setVerses([]);
                                // charger les livres pour cette version
                                fetchBooks(t.id);
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
                                    totalChapters={
                                        chaptersMeta.length > 0
                                            ? chaptersMeta.length
                                            : Number((selectedBook as any)?.chapterCount ?? (selectedBook as any)?.chapters ?? 0)
                                    }
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
                                        // Dans Reader.tsx
                                        {verses.map((verse) => (
                                            <Verse
                                                key={verse.id}
                                                verseId={verse.id}
                                                translation={selectedTranslation?.id}
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
