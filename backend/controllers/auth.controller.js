import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import database from '../database/database.js';
import { generateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await database.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await database.run(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, passwordHash, name || null]
    );

    const token = generateToken(result.id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: result.id,
        email,
        name: name || null
      }
    });

    logger.info(`New user registered: ${email}`);
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const users = await database.query(
      'SELECT id, email, name, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await database.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

    logger.info(`User logged in: ${email}`);
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = generateToken(req.user.id);
    res.json({ token });
  } catch (error) {
    logger.error('Refresh token error:', error);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // In a real app, you might want to blacklist the token
    res.json({ message: 'Logout successful' });
    logger.info(`User logged out: ${req.user.email}`);
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};