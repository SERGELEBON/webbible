import express from 'express';
import { body, param } from 'express-validator';
import * as chatController from '../controllers/chat.controller.js';

const router = express.Router();

// Send a chat message
router.post('/',
  body('message').isString().isLength({ min: 1, max: 1000 }).trim(),
  body('userId').optional().isString(),
  chatController.sendMessage
);

// Get chat history for a user
router.get('/history/:userId',
  param('userId').isString().notEmpty(),
  chatController.getChatHistory
);

// Get FAQ entries
router.get('/faq', chatController.getFAQ);

export default router;