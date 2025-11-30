import express from 'express';
import { body, param } from 'express-validator';
import * as chatController from '../controllers/chat.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat and AI-related endpoints
 */

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Send a chat message
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Bonjour, que dit la Bible sur la foi?"
 *               userId:
 *                 type: string
 *                 example: "user123"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 response:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/',
    body('message').isString().isLength({ min: 1, max: 1000 }).trim(),
    body('userId').optional().isString(),
    chatController.sendMessage
);

/**
 * @swagger
 * /chat/history/{userId}:
 *   get:
 *     summary: Get chat history for a user
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessage'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/history/:userId',
    param('userId').isString().notEmpty(),
    chatController.getChatHistory
);

/**
 * @swagger
 * /chat/faq:
 *   get:
 *     summary: Get FAQ entries
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: FAQ retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   question:
 *                     type: string
 *                   answer:
 *                     type: string
 */
router.get('/faq', chatController.getFAQ);

export default router;
