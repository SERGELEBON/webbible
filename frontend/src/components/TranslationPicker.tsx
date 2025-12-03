import React from 'react';

export type Translation = {
  id: string;
  name: string;
  abbreviation?: string;
  language?: string;
};

interface TranslationPickerProps {
  translations: Translation[];
  selectedId?: string;
  onSelect: (translation: Translation) => void;
  loading?: boolean;
}

const TranslationPicker: React.FC<TranslationPickerProps> = ({ translations, selectedId, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto py-2" aria-busy="true" aria-label="Chargement des versions">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse h-10 w-28 rounded-full bg-gray-200 flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Versions disponibles</h2>
        <span className="text-xs text-gray-500">{translations.length} versions</span>
      </div>
      <div className="flex gap-2 overflow-x-auto py-2" role="listbox" aria-label="Choisir une version de la Bible">
        {translations.map(t => {
          const active = t.id === selectedId;
          return (
            <button
              key={t.id}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onSelect(t)}
              className={`flex-shrink-0 px-4 h-10 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                active
                  ? 'bg-blue-600 text-white border-blue-600 shadow'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              title={`${t.name}${t.abbreviation ? ` (${t.abbreviation})` : ''}${t.language ? ` – ${t.language}` : ''}`}
            >
              <span className="font-medium text-sm">
                {t.abbreviation || t.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TranslationPicker;
