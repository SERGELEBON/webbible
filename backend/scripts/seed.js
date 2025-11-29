import database from '../database/database.js';
import logger from '../utils/logger.js';

const strongsData = [
  {
    code: 'H0430',
    language: 'hebrew',
    word: 'אֱלֹהִים',
    transliteration: 'elohim',
    definition: 'Dieu, dieux, juges, anges',
    usage: 'Utilisé 2606 fois dans l\'Ancien Testament. Désigne le Dieu créateur, mais aussi des êtres divins ou des autorités.'
  },
  {
    code: 'G0026',
    language: 'greek',
    word: 'ἀγάπη',
    transliteration: 'agapē',
    definition: 'Amour, charité',
    usage: 'Amour divin inconditionnel, distinct de l\'amour émotionnel (phileo) ou romantique (eros).'
  },
  {
    code: 'H3068',
    language: 'hebrew',
    word: 'יְהֹוָה',
    transliteration: 'Yahweh',
    definition: 'L\'Éternel, Yahweh',
    usage: 'Le nom propre de Dieu dans l\'Ancien Testament, utilisé plus de 6800 fois.'
  },
  {
    code: 'G2316',
    language: 'greek',
    word: 'θεός',
    transliteration: 'theos',
    definition: 'Dieu, divinité',
    usage: 'Terme général pour Dieu dans le Nouveau Testament, utilisé plus de 1300 fois.'
  },
  {
    code: 'H7965',
    language: 'hebrew',
    word: 'שָׁלוֹם',
    transliteration: 'shalom',
    definition: 'Paix, bien-être, complétude',
    usage: 'Concept de paix complète et de bien-être dans toutes les dimensions de la vie.'
  }
];

const audioData = [
  {
    book_id: 'GEN',
    chapter: 1,
    file_url: 'https://example.com/audio/genesis/chapter1.mp3',
    duration: 180,
    file_size: 2500000
  },
  {
    book_id: 'JHN',
    chapter: 1,
    file_url: 'https://example.com/audio/john/chapter1.mp3',
    duration: 240,
    file_size: 3200000
  },
  {
    book_id: 'PSA',
    chapter: 23,
    file_url: 'https://example.com/audio/psalms/chapter23.mp3',
    duration: 120,
    file_size: 1800000
  }
];

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Seed Strong's entries
    for (const entry of strongsData) {
      await database.run(
        `INSERT OR REPLACE INTO strongs_entries 
         (code, language, word, transliteration, definition, usage) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [entry.code, entry.language, entry.word, entry.transliteration, entry.definition, entry.usage]
      );
    }
    logger.info(`Seeded ${strongsData.length} Strong's entries`);

    // Seed audio files
    for (const audio of audioData) {
      await database.run(
        `INSERT OR REPLACE INTO audio_files 
         (book_id, chapter, file_url, duration, file_size) 
         VALUES (?, ?, ?, ?, ?)`,
        [audio.book_id, audio.chapter, audio.file_url, audio.duration, audio.file_size]
      );
    }
    logger.info(`Seeded ${audioData.length} audio file entries`);

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('✅ Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;