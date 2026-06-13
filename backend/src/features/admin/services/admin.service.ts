import { AdminRepository } from '../repositories/admin.repository.js';

export class AdminService {
  static async getAuditLogs() {
    return AdminRepository.getAuditLogs();
  }

  static async createWorkCenter(name: string) {
    return AdminRepository.createWorkCenter(name);
  }

  static async getWorkCenters() {
    return AdminRepository.getWorkCenters();
  }

  static async getUsers() {
    return AdminRepository.getUsers();
  }

  static async submitRequest(data: { name: string, email: string, company: string, message: string }) {
    return AdminRepository.submitRequest(data);
  }

  static async getRequests() {
    return AdminRepository.getRequests();
  }

  static async updateRequestStatus(id: string, status: string) {
    return AdminRepository.updateRequestStatus(id, status);
  }
}
