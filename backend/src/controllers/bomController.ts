import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const createBoM = async (req: Request, res: Response) => {
  try {
    const { productId, name, components } = req.body;
    
    // Use transaction to ensure consistency
    const bom = await prisma.$transaction(async (tx) => {
      // Check if BoM already exists - Casing must match prisma client (usually boM)
      const existingBom = await tx.boM.findUnique({ where: { productId } });
      
      if (existingBom) {
        // Delete old lines
        await tx.boMLine.deleteMany({ where: { bomId: existingBom.id } });
        
        // Update BoM name and recreate lines
        return await tx.boM.update({
          where: { id: existingBom.id },
          data: {
            name,
            bomLines: {
              create: components.map((c: any) => ({
                componentId: c.componentId,
                quantity: Number(c.quantity),
              })),
            },
          },
          include: { bomLines: true },
        });
      } else {
        // Create new BoM
        return await tx.boM.create({
          data: {
            productId,
            name,
            bomLines: {
              create: components.map((c: any) => ({
                componentId: c.componentId,
                quantity: Number(c.quantity),
              })),
            },
          },
          include: { bomLines: true },
        });
      }
    });

    // Update product with bomId if not already set
    await prisma.product.update({
      where: { id: productId },
      data: { bomId: bom.id },
    });

    res.status(201).json(bom);
  } catch (error: any) {
    console.error("BoM Creation Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getBoMs = async (req: Request, res: Response) => {
  try {
    const boms = await prisma.boM.findMany({
      include: {
        product: true,
        bomLines: { include: { component: true } },
      },
    });
    res.json(boms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
