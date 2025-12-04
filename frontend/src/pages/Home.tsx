import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, Headphones, Search, BookOpen, Calendar, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api.service';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';

// Convert API HTML to plain readable text (strip tags, remove leading verses number/pilcrow)
function cleanVerseHtml(html?: string): string {
  if (!html) return '';
  // Create a temporary DOM node to decode HTML and strip tags
  const div = document.createElement('div');
  div.innerHTML = html;
  let text = (div.textContent || div.innerText || '').trim();
  // Remove leading verses number and optional pilcrow (e.g., "10  ")
  text = text.replace(/^\s*\d+\s*¶?\s*/, '');
  // Collapse excessive whitespace
  text = text.replace(/\s+/g, ' ');
  return text;
}

export default function Home() {
  const { t } = useLanguage();
  const [verseOfDay, setVerseOfDay] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
    // Dans Home.tsx, ajoutez setError à la déclaration d'état
    const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      // Dans Home.tsx
      const fetchVerseOfDay = async () => {
          try {
              setIsLoading(true);
              const data = await apiService.getVerseOfDay();

              // Vérifions ce que nous recevons de l'API
              console.log('Réponse de getVerseOfDay:', data);

              if (!data) {
                  throw new Error('Aucune donnée reçue pour le verset du jour');
              }

              setVerseOfDay(data);
              setError(null);
          } catch (error) {
              console.error('Erreur lors de la récupération du verset du jour:', error);
              setError('Impossible de charger le verset du jour');
              // Optionnel: définir un verset par défaut
              setVerseOfDay({
                  verse: 1,
                  text: 'Au commencement, Dieu créa les cieux et la terre.',
                  book_name: 'Genèse',
                  chapter: 1,
                  reference: 'Genèse 1:1'
              });
          } finally {
              setIsLoading(false);
          }
      };

    fetchVerseOfDay();
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: t('features.read.title'),
      description: t('features.read.desc'),
      link: '/reader',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Headphones,
      title: t('features.listen.title'),
      description: t('features.listen.desc'),
      link: '/audio',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Search,
      title: t('features.search.title'),
      description: t('features.search.desc'),
      link: '/search',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: Book,
      title: t('features.strongs.title'),
      description: t('features.strongs.desc'),
      link: '/strongs',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: Calendar,
      title: t('features.plans.title'),
      description: t('features.plans.desc'),
      link: '/plans',
      color: 'bg-red-50 text-red-600',
    },
      {
          icon: BookOpen,
          title: t('features.ask.title'),
          description: t('features.ask.desc'),
          link: '/reader',
          color: 'bg-red-50 text-red-600',
      },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/reader"
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>{t('hero.start_reading')}</span>
              </Link>
              <Link
                to="/audio"
                className="bg-blue-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-800 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <Headphones className="w-5 h-5" />
                <span>{t('hero.listen_bible')}</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200">
              <div className="flex items-start space-x-4">
                <Sparkles className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('verse.title')}</h2>
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                    </div>
                  ) : verseOfDay ? (
                    <>
                        <p className="text-lg text-gray-700 mb-2">
                            {verseOfDay.text || cleanVerseHtml(verseOfDay.content) || t('verse.text')}
                        </p>
                        <p className="text-sm text-gray-600 font-semibold">
                            {verseOfDay.reference || `${verseOfDay.book_name} ${verseOfDay.chapter}:${verseOfDay.verse}` || t('verse.reference')}
                        </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg text-gray-700 mb-2">{t('verse.text')}</p>
                      <p className="text-sm text-gray-600 font-semibold">{t('verse.reference')}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              {t('features.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={feature.title}
                    to={feature.link}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('chat.title')}</h2>
            <p className="text-xl text-blue-100 mb-8">
              {t('chat.subtitle')}
            </p>
            <p className="text-blue-100">
              {t('chat.cta')}
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <ChatWidget isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
}