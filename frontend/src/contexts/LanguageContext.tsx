import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'en' | 'fr' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    'site.title': 'JeLisLaBIBLE',
    'site.tagline': 'Your companion to read, listen and meditate on God\'s Word',
    'nav.home': 'Home',
    'nav.read': 'Read Bible',
    'nav.listen': 'Listen',
    'nav.search': 'Search',
    'nav.strongs': 'Strong\'s Lexicon',
    'nav.plans': 'Reading Plans',
    'hero.title': 'Welcome to JeLisLaBIBLE',
    'hero.subtitle': 'Your companion to read, listen and meditate on God\'s Word',
    'hero.start_reading': 'Start Reading',
    'hero.listen_bible': 'Listen to Bible',
    'verse.title': 'Verse of the Day',
    'verse.text': 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    'verse.reference': 'John 3:16',
    'features.title': 'Explore God\'s Word',
    'features.read.title': 'Read the Bible',
    'features.read.desc': 'Access multiple translations and read the Word with ease',
    'features.listen.title': 'Listen to the Bible',
    'features.listen.desc': 'Listen to the Bible in audio, chapter by chapter',
    'features.search.title': 'Search',
    'features.search.desc': 'Quickly find verses by keywords or references',
    'features.strongs.title': 'Strong\'s Lexicon',
    'features.strongs.desc': 'Explore Hebrew and Greek definitions',
    'features.plans.title': 'Reading Plans',
    'features.plans.desc': 'Follow a plan to read the Bible in one year',
      'features.ask.title': 'Pastor, I have the question',
      'features.ask.desc': 'Ask the pastor all things about the Bible',
    'chat.title': 'Have a question about the Bible?',
    'chat.subtitle': 'Our assistant is here to help you understand the Word',
    'chat.cta': 'Click the chat icon at the bottom right to start',
    'footer.tagline': 'Your companion to read, listen and meditate on God\'s Word.',
    'footer.navigation': 'Navigation',
    'footer.resources': 'Resources',
    'footer.follow': 'Follow us',
    'footer.copyright': 'All rights reserved.',
  },
  fr: {
    'site.title': 'JeLisLaBIBLE',
    'site.tagline': 'Votre compagnon pour lire, écouter et méditer la Parole de Dieu',
    'nav.home': 'Accueil',
    'nav.read': 'Lire la Bible',
    'nav.listen': 'Écouter',
    'nav.search': 'Rechercher',
    'nav.strongs': 'Lexique Strong',
    'nav.plans': 'Plans de lecture',
    'hero.title': 'Bienvenue sur JeLisLaBIBLE',
    'hero.subtitle': 'Votre compagnon pour lire, écouter et méditer la Parole de Dieu',
    'hero.start_reading': 'Commencer à lire',
    'hero.listen_bible': 'Écouter la Bible',
    'verse.title': 'Verset du jour',
    'verse.text': 'Car Dieu a tant aimé le monde qu\'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu\'il ait la vie éternelle.',
    'verse.reference': 'Jean 3:16',
    'features.title': 'Explorez la Parole de Dieu',
    'features.read.title': 'Lire la Bible',
    'features.read.desc': 'Accédez à plusieurs traductions et lisez la Parole en toute simplicité',
    'features.listen.title': 'Écouter la Bible',
    'features.listen.desc': 'Écoutez la Bible en audio, chapitre par chapitre',
    'features.search.title': 'Rechercher',
    'features.search.desc': 'Trouvez rapidement des versets par mots-clés ou références',
    'features.strongs.title': 'Lexique Strong',
    'features.strongs.desc': 'Explorez les définitions hébraïques et grecques',
    'features.plans.title': 'Plans de lecture',
    'features.plans.desc': 'Suivez un plan pour lire la Bible en un an',
    'chat.title': 'Une question sur la Bible ?',
    'chat.subtitle': 'Notre assistant est là pour vous aider à comprendre la Parole',
    'chat.cta': 'Cliquez sur l\'icône de chat en bas à droite pour commencer',
    'footer.tagline': 'Votre compagnon pour lire, écouter et méditer la Parole de Dieu.',
    'footer.navigation': 'Navigation',
    'footer.resources': 'Ressources',
    'footer.follow': 'Suivez-nous',
    'footer.copyright': 'Tous droits réservés.',
  },
  es: {
    'site.title': 'JeLisLaBIBLE',
    'site.tagline': 'Tu compañero para leer, escuchar y meditar la Palabra de Dios',
    'nav.home': 'Inicio',
    'nav.read': 'Leer Biblia',
    'nav.listen': 'Escuchar',
    'nav.search': 'Buscar',
    'nav.strongs': 'Léxico Strong',
    'nav.plans': 'Planes de lectura',
    'hero.title': 'Bienvenido a JeLisLaBIBLE',
    'hero.subtitle': 'Tu compañero para leer, escuchar y meditar la Palabra de Dios',
    'hero.start_reading': 'Comenzar a leer',
    'hero.listen_bible': 'Escuchar la Biblia',
    'verse.title': 'Versículo del día',
    'verse.text': 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
    'verse.reference': 'Juan 3:16',
    'features.title': 'Explora la Palabra de Dios',
    'features.read.title': 'Leer la Biblia',
    'features.read.desc': 'Accede a múltiples traducciones y lee la Palabra con facilidad',
    'features.listen.title': 'Escuchar la Biblia',
    'features.listen.desc': 'Escucha la Biblia en audio, capítulo por capítulo',
    'features.search.title': 'Buscar',
    'features.search.desc': 'Encuentra rápidamente versículos por palabras clave o referencias',
    'features.strongs.title': 'Léxico Strong',
    'features.strongs.desc': 'Explora las definiciones hebreas y griegas',
    'features.plans.title': 'Planes de lectura',
    'features.plans.desc': 'Sigue un plan para leer la Biblia en un año',
    'chat.title': '¿Tienes una pregunta sobre la Biblia?',
    'chat.subtitle': 'Nuestro asistente está aquí para ayudarte a entender la Palabra',
    'chat.cta': 'Haz clic en el ícono de chat en la parte inferior derecha para comenzar',
    'footer.tagline': 'Tu compañero para leer, escuchar y meditar la Palabra de Dios.',
    'footer.navigation': 'Navegación',
    'footer.resources': 'Recursos',
    'footer.follow': 'Síguenos',
    'footer.copyright': 'Todos los derechos reservados.',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};