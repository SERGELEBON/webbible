import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import SearchInput from '../components/SearchInput';
import { BookOpen, Languages } from 'lucide-react';

interface StrongEntry {
  code: string;
  language: 'hebrew' | 'greek';
  word: string;
  transliteration: string;
  definition: string;
  usage: string;
}

const mockStrongs: StrongEntry[] = [
  {
    code: 'H0430',
    language: 'hebrew',
    word: 'אֱלֹהִים',
    transliteration: 'elohim',
    definition: 'Dieu, dieux, juges, anges',
    usage: 'Utilisé 2606 fois dans l\'Ancien Testament. Désigne le Dieu créateur, mais aussi des êtres divins ou des autorités.',
  },
  {
    code: 'G0026',
    language: 'greek',
    word: 'ἀγάπη',
    transliteration: 'agapē',
    definition: 'Amour, charité',
    usage: 'Amour divin inconditionnel, distinct de l\'amour émotionnel (phileo) ou romantique (eros).',
  },
];

export default function Strongs() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StrongEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setHasSearched(true);
    setResults(mockStrongs);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Lexique Strong
            </h1>
            <p className="text-gray-600 mb-6">
              Explorez les définitions hébraïques et grecques des mots bibliques
            </p>
            <SearchInput
              onSearch={handleSearch}
              placeholder="Rechercher par code (ex: H0430) ou mot..."
            />
          </div>

          {hasSearched && (
            <div className="space-y-6">
              {results.length > 0 ? (
                results.map((entry) => (
                  <div key={entry.code} className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl font-bold text-blue-600">{entry.code}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            entry.language === 'hebrew'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {entry.language === 'hebrew' ? 'Hébreu' : 'Grec'}
                          </span>
                        </div>
                        <div className="text-3xl mb-2">{entry.word}</div>
                        <div className="text-gray-600 italic">{entry.transliteration}</div>
                      </div>
                      <Languages className="w-8 h-8 text-gray-300" />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Définition</h3>
                        <p className="text-gray-700">{entry.definition}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Usage</h3>
                        <p className="text-gray-700">{entry.usage}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                  <p className="text-gray-600">Aucun résultat trouvé pour "{query}"</p>
                </div>
              )}
            </div>
          )}

          {!hasSearched && (
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="text-center mb-8">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Découvrez le sens original des mots
                </h3>
                <p className="text-gray-600">
                  Recherchez un code Strong ou un mot pour explorer sa signification
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-purple-200 rounded-xl p-6 bg-purple-50">
                  <h4 className="font-semibold text-purple-900 mb-2">Hébreu (Ancien Testament)</h4>
                  <p className="text-sm text-purple-700">
                    Codes commençant par H (ex: H0430 pour "Elohim")
                  </p>
                </div>
                <div className="border border-green-200 rounded-xl p-6 bg-green-50">
                  <h4 className="font-semibold text-green-900 mb-2">Grec (Nouveau Testament)</h4>
                  <p className="text-sm text-green-700">
                    Codes commençant par G (ex: G0026 pour "Agapē")
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}