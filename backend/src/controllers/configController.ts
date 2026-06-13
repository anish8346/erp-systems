import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createWorkCenter = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const wc = await prisma.workCenter.create({ data: { name } });
      res.status(201).json(wc);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
};

export const getWorkCenters = async (req: Request, res: Response) => {
    try {
      const wcs = await prisma.workCenter.findMany();
      res.json(wcs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
