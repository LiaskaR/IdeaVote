import type { Express, Response } from "express";
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { generateTokens, hashPassword, verifyPassword, verifyToken, authenticate, type AuthRequest } from './auth';
import { storage } from './storage';

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration attempts per hour
  message: {
    error: 'REGISTRATION_LIMIT_EXCEEDED',
    message: 'Too many registration attempts, please try again later'
  }
});

// Input validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be 8+ characters with uppercase, lowercase, number, and special character')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export function registerAuthRoutes(app: Express) {
  // User registration
  app.post('/vote/auth/register', registrationLimiter, registerValidation, async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        });
      }

      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'USER_EXISTS',
          message: 'User with this email already exists'
        });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(409).json({
          error: 'USERNAME_TAKEN',
          message: 'Username is already taken'
        });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role: 'user',
        isActive: 'true'
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(newUser);

      // Don't send password in response
      const { password: _, ...userResponse } = newUser;

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse,
        accessToken,
        refreshToken
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'REGISTRATION_FAILED',
        message: 'Failed to register user'
      });
    }
  });

  // User login
  app.post('/vote/auth/login', authLimiter, loginValidation, async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || user.isActive !== 'true') {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        });
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Don't send password in response
      const { password: _, ...userResponse } = user;

      res.json({
        message: 'Login successful',
        user: userResponse,
        accessToken,
        refreshToken
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'LOGIN_FAILED',
        message: 'Failed to authenticate user'
      });
    }
  });

  // Token refresh
  app.post('/vote/auth/refresh', authLimiter, async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required'
        });
      }

      const payload = verifyToken(refreshToken) as any;
      if (!payload || payload.type !== 'refresh') {
        return res.status(401).json({
          error: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token'
        });
      }

      // Get current user data
      const user = await storage.getUser(payload.userId);
      if (!user || user.isActive !== 'true') {
        return res.status(401).json({
          error: 'USER_INACTIVE',
          message: 'User account is inactive'
        });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

      res.json({
        accessToken,
        refreshToken: newRefreshToken
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        error: 'REFRESH_FAILED',
        message: 'Failed to refresh token'
      });
    }
  });

  // Get current user profile
  app.get('/vote/auth/profile', authenticate, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      const { password: _, ...userResponse } = user;
      res.json(userResponse);

    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({
        error: 'PROFILE_FETCH_FAILED',
        message: 'Failed to fetch user profile'
      });
    }
  });

  // Logout (client-side token invalidation)
  app.post('/vote/auth/logout', authenticate, async (req, res) => {
    // In a production system, you might want to maintain a blacklist of tokens
    // For now, we'll just return success and let the client handle token removal
    res.json({
      message: 'Logout successful'
    });
  });
}