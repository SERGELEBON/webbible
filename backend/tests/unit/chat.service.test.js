import * as chatService from '../../services/chat.service.js';

describe('Chat Service Unit Tests', () => {
  describe('processMessage', () => {
    it('should generate appropriate response for Jesus-related questions', async () => {
      const response = await chatService.processMessage('Who is Jesus?', 'test-user');
      
      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('type');
      expect(response.text).toContain('Jésus');
      expect(response.type).toBe('keyword');
    });

    it('should generate default response for unknown questions', async () => {
      const response = await chatService.processMessage('Random question', 'test-user');
      
      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('type');
      expect(response.type).toBe('default');
    });
  });

  describe('getFAQ', () => {
    it('should return FAQ entries', async () => {
      const faq = await chatService.getFAQ();
      
      expect(Array.isArray(faq)).toBe(true);
      expect(faq.length).toBeGreaterThan(0);
      expect(faq[0]).toHaveProperty('question');
      expect(faq[0]).toHaveProperty('answer');
    });
  });
});