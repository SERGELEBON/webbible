import request from 'supertest';
import app from '../../server.js';

describe('Chat API Integration Tests', () => {
  describe('POST /api/chat', () => {
    it('should process chat message successfully', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          message: 'Who is Jesus?',
          userId: 'test-user'
        })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 400 for empty message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          message: '',
          userId: 'test-user'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for message too long', async () => {
      const longMessage = 'a'.repeat(1001);
      const response = await request(app)
        .post('/api/chat')
        .send({
          message: longMessage,
          userId: 'test-user'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/chat/faq', () => {
    it('should return FAQ entries', async () => {
      const response = await request(app)
        .get('/api/chat/faq')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('question');
      expect(response.body[0]).toHaveProperty('answer');
    });
  });
});