import prisma from '../../../core/database/prisma.js';

export class OperationsRepository {
  static async findBoMByProductId(productId: string) {
    return await prisma.boM.findUnique({ where: { productId } });
  }

  static async deleteBoMLinesByBomId(bomId: string, tx: any = prisma) {
    return await tx.boMLine.deleteMany({ where: { bomId } });
  }

  static async deleteOperationsByBomId(bomId: string, tx: any = prisma) {
    return await tx.operation.deleteMany({ where: { bomId } });
  }

  static async updateBoM(id: string, data: any, tx: any = prisma) {
    return await tx.boM.update({
      where: { id },
      data,
      include: { bomLines: true, operations: true },
    });
  }

  static async createBoM(data: any, tx: any = prisma) {
    return await tx.boM.create({
      data,
      include: { bomLines: true, operations: true },
    });
  }

  static async updateProductBoM(productId: string, bomId: string) {
    return await prisma.product.update({
      where: { id: productId },
      data: { bomId },
    });
  }

  static async getBoMs() {
    return await prisma.boM.findMany({
      include: {
        product: true,
        bomLines: { include: { component: true } },
      },
    });
  }

  static async findBoMById(id: string) {
    return await prisma.boM.findUnique({
      where: { id },
      include: { operations: true }
    });
  }

  static async createMO(data: any) {
    return await prisma.manufacturingOrder.create({
      data,
    });
  }

  static async findMOById(id: string) {
    return await prisma.manufacturingOrder.findUnique({
      where: { id },
      include: { 
        bom: { include: { bomLines: { include: { component: true } } } },
        product: true,
        WorkOrders: true
      },
    });
  }

  static async updateMO(id: string, data: any, tx: any = prisma) {
    return await tx.manufacturingOrder.update({
      where: { id },
      data
    });
  }

  static async updateWorkOrder(id: string, data: any) {
    return await prisma.workOrder.update({
      where: { id },
      data,
      include: { mo: { include: { product: true } }, operation: true }
    });
  }

  static async getMOs() {
    return await prisma.manufacturingOrder.findMany({
      include: { product: true, bom: true, WorkOrders: { include: { operation: { include: { workCenter: true } } } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}
