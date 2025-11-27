import { validationResult } from 'express-validator';
    import * as chatService from '../services/chat.service.js';
    import logger from '../utils/logger.js';

export const sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, userId } = req.body;
    const response = await chatService.processMessage(message, userId);
    
    res.json({
      response: response.text,
      type: response.type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error processing chat message:', error);
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const history = await chatService.getChatHistory(userId);
    res.json(history);
  } catch (error) {
    logger.error('Error fetching chat history:', error);
    next(error);
  }
};

export const getFAQ = async (req, res, next) => {
  try {
    const faq = await chatService.getFAQ();
    res.json(faq);
  } catch (error) {
    logger.error('Error fetching FAQ:', error);
    next(error);
  }
};