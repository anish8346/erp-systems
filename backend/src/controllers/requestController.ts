import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const submitRequest = async (req: Request, res: Response) => {
  try {
    const { name, email, company, message } = req.body;
    const accessRequest = await prisma.accessRequest.create({
      data: { name, email, company, message }
    });
    res.status(201).json({ message: 'Request submitted successfully', id: accessRequest.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.accessRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.accessRequest.update({
      where: { id },
      data: { status }
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
