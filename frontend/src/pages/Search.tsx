import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import SearchInput from '../components/SearchInput';
import { BookOpen } from 'lucide-react';
import { apiService } from '../services/api.service';

interface SearchResult {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setHasSearched(true);
    setLoading(true);

    try {
      const response = await apiService.searchVerses(searchQuery);
      setResults(response.data?.verses || []);
    } catch (error) {
      console.error('Error searching verses:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Rechercher dans la Bible
            </h1>
            <p className="text-gray-600 mb-6">
              Recherchez par mots-clés ou par référence (ex: Jean 3:16)
            </p>
            <SearchInput
              onSearch={handleSearch}
              placeholder="Entrez votre recherche..."
            />
          </div>

          {hasSearched && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {results.length} résultat{results.length > 1 ? 's' : ''} pour "{query}"
                  </h2>
                  <div className="space-y-6">
                    {results.map((result) => (
                      <div key={result.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-600">
                            {result.book} {result.chapter}:{result.verse}
                          </span>
                        </div>
                        <p className="text-gray-800 leading-relaxed">{result.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Aucun résultat trouvé pour "{query}"</p>
                </div>
              )}
            </div>
          )}

          {!hasSearched && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Commencez votre recherche
              </h3>
              <p className="text-gray-600">
                Entrez un mot-clé ou une référence biblique pour trouver des versets
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ChatWidget isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
}