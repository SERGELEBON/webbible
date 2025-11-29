import request from 'supertest';
import app from '../../server.js';

describe('Bible API Integration Tests', () => {
  describe('GET /api/bible/books', () => {
    it('should return list of Bible books', async () => {
      const response = await request(app)
        .get('/api/bible/books')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/bible/search', () => {
    it('should search verses successfully', async () => {
      const response = await request(app)
        .get('/api/bible/search?q=love')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should return 400 for invalid search query', async () => {
      const response = await request(app)
        .get('/api/bible/search?q=a')
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/bible/verse-of-day', () => {
    it('should return verse of the day', async () => {
      const response = await request(app)
        .get('/api/bible/verse-of-day')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/bible/strong/:code', () => {
    it('should return Strong entry for valid code', async () => {
      const response = await request(app)
        .get('/api/bible/strong/H0430')
        .expect(200);

      expect(response.body).toHaveProperty('code');
    });

    it('should return 400 for invalid Strong code format', async () => {
      const response = await request(app)
        .get('/api/bible/strong/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });
});