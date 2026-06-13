import prisma from '../../../core/database/prisma.js';

export class AdminRepository {
  static async getAuditLogs() {
    return prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createWorkCenter(name: string) {
    return prisma.workCenter.create({ data: { name } });
  }

  static async getWorkCenters() {
    return prisma.workCenter.findMany();
  }

  static async getUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
  }

  static async submitRequest(data: { name: string, email: string, company: string, message: string }) {
    return prisma.accessRequest.create({
      data
    });
  }

  static async getRequests() {
    return prisma.accessRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateRequestStatus(id: string, status: string) {
    return prisma.accessRequest.update({
      where: { id },
      data: { status }
    });
  }
}
