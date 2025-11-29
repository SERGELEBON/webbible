import database from '../database/database.js';
import logger from '../utils/logger.js';

export const processMessage = async (message, userId = 'anonymous') => {
  try {
    // Generate response
    const response = generateResponse(message);
    
    // Store in database
    await database.run(
      'INSERT INTO chat_messages (user_id, message, response, type) VALUES (?, ?, ?, ?)',
      [userId, message, response.text, response.type]
    );

    logger.info(`Chat message processed for user ${userId}`);
    return response;
  } catch (error) {
    logger.error('Error processing chat message:', error);
    throw error;
  }
};

export const getChatHistory = async (userId, limit = 50) => {
  try {
    const messages = await database.query(
      `SELECT message, response, type, created_at 
       FROM chat_messages 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );

    return messages.reverse().map(msg => [
      {
        type: 'user',
        message: msg.message,
        timestamp: msg.created_at
      },
      {
        type: 'bot',
        message: msg.response,
        timestamp: msg.created_at
      }
    ]).flat();
  } catch (error) {
    logger.error('Error fetching chat history:', error);
    throw error;
  }
};

export const getFAQ = async () => {
  return [
    {
      id: 1,
      question: "Qui est Jésus-Christ ?",
      answer: "Jésus-Christ est le Fils de Dieu, venu sur terre pour sauver l'humanité du péché. Il est à la fois pleinement Dieu et pleinement homme, comme l'enseigne Jean 1:14."
    },
    {
      id: 2,
      question: "Comment être sauvé ?",
      answer: "Le salut vient par la foi en Jésus-Christ. Romains 10:9 dit : 'Si tu confesses de ta bouche le Seigneur Jésus, et si tu crois dans ton cœur que Dieu l'a ressuscité des morts, tu seras sauvé.'"
    },
    {
      id: 3,
      question: "Qu'est-ce que la prière ?",
      answer: "La prière est une communication avec Dieu. C'est un moyen de lui parler, de le louer, de lui demander pardon et de présenter nos requêtes, comme l'enseigne Philippiens 4:6."
    },
    {
      id: 4,
      question: "Comment lire la Bible ?",
      answer: "Commencez par prier pour demander la compréhension, lisez régulièrement, méditez sur les passages et appliquez les enseignements à votre vie. L'Évangile de Jean est un bon point de départ."
    }
  ];
};

const generateResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('jésus') || lowerMessage.includes('christ')) {
    return {
      text: "Jésus-Christ est le centre de la foi chrétienne. Il est le Fils de Dieu qui est venu sur terre pour nous sauver. Avez-vous une question spécifique sur Jésus ?",
      type: 'keyword'
    };
  }

  if (lowerMessage.includes('prière') || lowerMessage.includes('prier')) {
    return {
      text: "La prière est essentielle dans la vie chrétienne. C'est notre moyen de communication avec Dieu. Matthieu 6:9-13 nous enseigne le Notre Père comme modèle de prière.",
      type: 'keyword'
    };
  }

  if (lowerMessage.includes('bible') || lowerMessage.includes('écriture')) {
    return {
      text: "La Bible est la Parole de Dieu, notre guide pour la vie. 2 Timothée 3:16 nous dit qu'elle est inspirée de Dieu et utile pour enseigner, convaincre, corriger et instruire.",
      type: 'keyword'
    };
  }

  if (lowerMessage.includes('salut') || lowerMessage.includes('sauvé')) {
    return {
      text: "Le salut est un don gratuit de Dieu par la foi en Jésus-Christ. Éphésiens 2:8-9 nous enseigne que c'est par la grâce que nous sommes sauvés, par le moyen de la foi.",
      type: 'keyword'
    };
  }

  if (lowerMessage.includes('amour') || lowerMessage.includes('aimer')) {
    return {
      text: "L'amour de Dieu est au cœur de l'Évangile. Jean 3:16 nous rappelle que 'Dieu a tant aimé le monde qu'il a donné son Fils unique'. 1 Jean 4:8 nous dit que 'Dieu est amour'.",
      type: 'keyword'
    };
  }

  return {
    text: "Merci pour votre question. Je suis là pour vous aider à comprendre la Bible et la foi chrétienne. N'hésitez pas à me poser des questions plus spécifiques sur Jésus, la prière, le salut, ou tout autre sujet biblique.",
    type: 'default'
  };
};