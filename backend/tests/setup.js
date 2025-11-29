import database from '../database/database.js';

// Setup test database
beforeAll(async () => {
  // Initialize test database
  await database.query('DELETE FROM chat_messages WHERE user_id LIKE "test-%"');
  await database.query('DELETE FROM users WHERE email LIKE "%@example.com"');
});

afterAll(async () => {
  // Cleanup test data
  await database.query('DELETE FROM chat_messages WHERE user_id LIKE "test-%"');
  await database.query('DELETE FROM users WHERE email LIKE "%@example.com"');
  await database.close();
});