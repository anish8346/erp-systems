
import type { Response } from 'express';
import prisma from '../config/prisma.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { logActivity } from '../utils/logger.js';

export const createVendor = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, address } = req.body;
    const vendor = await prisma.vendor.create({
      data: { name, email, phone, address }
    });

    if (req.user) {
      await logActivity(req.user.id, 'CREATE', 'VENDOR', vendor.id, `Created vendor: ${name}`);
    }

    res.status(201).json(vendor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getVendors = async (req: AuthRequest, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(vendors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateVendor = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, email, phone, address } = req.body;
    const vendor = await prisma.vendor.update({
      where: { id },
      data: { name, email, phone, address }
    });

    if (req.user) {
      await logActivity(req.user.id, 'UPDATE', 'VENDOR', id, `Updated vendor: ${name}`);
    }

    res.json(vendor);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
