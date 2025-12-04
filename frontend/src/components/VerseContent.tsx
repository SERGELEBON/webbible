import { useEffect, useState } from 'react';
import { apiService } from '../services/api.service';

interface VerseContentProps {
    verseId: string;
    bibleId?: string;
    className?: string;
}

// Type pour la réponse de l'API
interface VerseData {
    id?: string;
    content?: string;
    text?: string;
    bookId?: string;
    chapterId?: string;
    verseNumber?: string | number;
}

export const VerseContent: React.FC<VerseContentProps> = ({
                                                              verseId,
                                                              bibleId,
                                                              className = ''
                                                          }) => {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadVerse = async () => {
            if (!verseId) {
                setError('Aucun identifiant de verset fourni');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const verseData = await apiService.getVerse<VerseData>(verseId, bibleId);

                if (!verseData) {
                    throw new Error('Aucune donnée reçue pour ce verset');
                }

                // Essayer différents chemins possibles pour le contenu
                const verseContent =
                    verseData.content ||
                    verseData.text ||
                    (typeof verseData === 'string' ? verseData : '');

                if (!verseContent) {
                    console.warn('Contenu du verset vide ou mal formaté:', verseData);
                }

                setContent(verseContent || `[Verset ${verseId} non disponible]`);
            } catch (err) {
                console.error(`Erreur lors du chargement du verset ${verseId}:`, err);
                setError(`Impossible de charger le verset: ${err.message || 'Erreur inconnue'}`);
            } finally {
                setLoading(false);
            }
        };

        // Délai pour éviter les chargements trop rapides
        const timer = setTimeout(loadVerse, 50);
        return () => clearTimeout(timer);
    }, [verseId, bibleId]);

    if (loading) {
        return (
            <span
                className={`inline-block h-4 w-4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}
                aria-label="Chargement..."
            />
        );
    }

    if (error) {
        return (
            <span
                className={`text-xs text-red-500 dark:text-red-400 ${className}`}
                title={error}
            >
                ⚠️ Erreur
            </span>
        );
    }

    return (
        <span
            className={`verse-text text-gray-800 dark:text-gray-200 ${className}`}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
};