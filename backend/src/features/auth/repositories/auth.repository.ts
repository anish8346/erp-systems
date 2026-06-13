import prisma from '../../../core/database/prisma.js';
import type { RegisterData } from '../../../core/types/index.js';

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async createUser(data: RegisterData) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'SALES',
      },
    });
  }
}
