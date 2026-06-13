import type { Request, Response } from 'express';
import { AdminService } from '../services/admin.service.js';

export class AdminController {
  // Config methods
  static async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await AdminService.getAuditLogs();
      res.json(logs);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async createWorkCenter(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const wc = await AdminService.createWorkCenter(name);
      res.status(201).json(wc);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async getWorkCenters(req: Request, res: Response) {
    try {
      const wcs = await AdminService.getWorkCenters();
      res.json(wcs);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const users = await AdminService.getUsers();
      res.json(users);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  // Request methods
  static async submitRequest(req: Request, res: Response) {
    try {
      const accessRequest = await AdminService.submitRequest(req.body);
      res.status(201).json({ message: 'Request submitted successfully', id: accessRequest.id });
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async getRequests(req: Request, res: Response) {
    try {
      const requests = await AdminService.getRequests();
      res.json(requests);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  static async updateRequestStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const updated = await AdminService.updateRequestStatus(id, status);
      res.json(updated);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }
}
