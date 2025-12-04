import {useState, useEffect, useCallback} from 'react';
import { apiService } from '../services/api.service';
import type { BibleBook } from '../types/bible';

export const useBible = () => {
    const [books, setBooks] = useState<BibleBook[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBooks = useCallback(async (bibleId?: string) => {
        setLoading(true);
        setError(null);
        try {
            const arr: any[] = await apiService.getBooks(bibleId);
            console.log('📚 Livres bruts reçus de l\'API:', JSON.stringify(arr, null, 2)); // <-- Ajoutez cette ligne
            const mapped: BibleBook[] = arr.map((b: any, idx: number) => {
                console.log(`📖 Traitement du livre ${b.name || b.id}:`, {
                    id: b.id,
                    chaptersRaw: b.chapters,
                    testament: b.testament
                });
                const chaptersRaw = (b as any)?.chapters;
                const chaptersCount = Array.isArray(chaptersRaw)
                    ? chaptersRaw.length
                    : (Number.isFinite(Number(chaptersRaw)) ? Number(chaptersRaw) : 0);

                return {
                    id: String(b.id ?? b.bookId ?? idx + 1),
                    name: String(b.name ?? b.abbreviation ?? `Livre ${idx + 1}`),
                    chapters: chaptersCount,
                    testament: (b.testament === 'OT' || b.testament === 'NT') ? b.testament : (idx < 39 ? 'OT' : 'NT'),
                } as BibleBook;
            });
            setBooks(mapped);
        } catch (err) {
            setError('Erreur lors du chargement des livres');
            console.error('Error fetching books:', err);
        } finally {
            setLoading(false);
        }
    }, []); //

    // Récupère un chapitre par ID, avec version optionnelle
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

    // Recherche de versets (optionnellement dans une version donnée)
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

    // Ne pas auto-fetch: on attend le choix de la version dans Reader.tsx
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