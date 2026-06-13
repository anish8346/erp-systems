import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const user = await AuthService.registerUser(req.body);
      res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error: any) {
      console.error('[Register Error]:', error);
      if (error.message === 'A user with this email already exists.') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'System failed to register user. Please try again later.' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const result = await AuthService.loginUser({ email, password });
      res.json(result);
    } catch (error: any) {
      console.error('[Login Error]:', error);
      if (error.message === 'Invalid email or password.') {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Login service currently unavailable.' });
    }
  }
}
