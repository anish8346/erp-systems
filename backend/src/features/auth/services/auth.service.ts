import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository.js';
import { logActivity } from '../../../core/utils/logger.js';
import type { RegisterData, LoginData } from '../../../core/types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export class AuthService {
  static async registerUser(data: RegisterData) {
    const { email, password, name, role } = data;
    
    const existing = await AuthRepository.findUserByEmail(email);
    if (existing) {
      throw new Error('A user with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await AuthRepository.createUser({
      email,
      password: hashedPassword,
      name,
      role,
    });

    await logActivity(user.id, 'REGISTER', 'USER', user.id, `New user registered: ${user.email}`);
    return user;
  }

  static async loginUser(data: LoginData) {
    const { email, password } = data;
    if (!password) throw new Error('Password is required.');

    const user = await AuthRepository.findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    await logActivity(user.id, 'LOGIN', 'USER', user.id, `User logged in: ${user.email}`);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
}
