import React from 'react';
import { VerseContent } from './VerseContent';

interface VerseProps {
    verseId?: string;
    content?: string;
    reference?: string;
    translation?: string;
    isVerseOfDay?: boolean;
    className?: string;
    disableAutoContent?: boolean;
}

export const Verse: React.FC<VerseProps> = ({
                                                verseId,
                                                content: initialContent,
                                                reference,
                                                translation,
                                                isVerseOfDay = false,
                                                className = '',
                                                disableAutoContent = false
                                            }) => {
    // Extraire le numéro du verset de manière sécurisée
    const getVerseNumber = (id?: string): string => {
        if (!id) return '';
        try {
            // Gère les formats: GEN.1.1, 1.1, 1-1, etc.
            const parts = id.split(/[.-]/);
            return parts[parts.length - 1] || '';
        } catch {
            return '';
        }
    };

    const verseNumber = getVerseNumber(verseId);

    // Mode verset du jour ou chargement manuel désactivé
    if (isVerseOfDay || disableAutoContent) {
        return (
            <div className={`bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-4 border border-blue-100 dark:border-blue-800/50 ${className}`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {reference || 'Verset du jour'}
                    </span>
                    {translation && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded">
                            {translation}
                        </span>
                    )}
                </div>
                <blockquote className="text-gray-800 dark:text-gray-200 italic pl-3 border-l-2 border-blue-300 dark:border-blue-600">
                    {initialContent || 'Chargement du verset...'}
                </blockquote>
                {verseId && (
                    <div className="mt-2 text-right">
                        <a
                            href={`/reader?verse=${verseId}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Lire le chapitre complet →
                        </a>
                    </div>
                )}
            </div>
        );
    }

    // Affichage normal d'un verset
    return (
        <div
            id={verseId ? `verse-${verseId}` : undefined}
            className={`verse group flex items-start py-1.5 px-2 -mx-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${className}`}
        >
            {verseNumber && (
                <span
                    className="verse-number inline-block min-w-[24px] text-xs font-mono text-right text-gray-400 dark:text-gray-500 mr-2 mt-0.5 select-none"
                    aria-hidden="true"
                >
                    {verseNumber}
                </span>
            )}
            <div className="flex-1 min-w-0">
                {verseId ? (
                    <VerseContent
                        verseId={verseId}
                        bibleId={translation}
                        className="leading-relaxed"
                    />
                ) : (
                    <span className="text-gray-800 dark:text-gray-200">
                        {initialContent || '...'}
                    </span>
                )}
            </div>
        </div>
    );
};

export default Verse;