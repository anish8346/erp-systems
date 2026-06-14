import prisma from '../../../core/database/prisma.js';
import type { CreateMOData, MOStatus, WOStatus } from '../../../core/types/index.js';

export class OperationsRepository {
  static async findBoMByProductId(productId: string) {
    return await prisma.boM.findUnique({ 
      where: { productId },
      include: { 
        bomLines: { include: { component: true } },
        operations: { include: { workCenter: true } }
      }
    });
  }

  static async findBoMById(id: string) {
    return await prisma.boM.findUnique({
      where: { id },
      include: { 
        bomLines: { include: { component: true } },
        operations: { include: { workCenter: true } }
      }
    });
  }

  static async createMO(data: CreateMOData) {
    const { productId, quantity, bomId, assigneeId, components, workOrders } = data;
    return await prisma.manufacturingOrder.create({
      data: {
        productId,
        quantity,
        bomId,
        assigneeId: assigneeId && assigneeId.trim() !== '' ? assigneeId : undefined,
        status: 'DRAFT',
        components: {
          create: components?.map(c => ({
            productId: c.productId,
            toConsume: c.toConsume,
            consumed: 0
          }))
        },
        WorkOrders: {
          create: workOrders?.map(w => ({
            operationId: w.operationId,
            operationName: w.operationName,
            workCenterId: w.workCenterId,
            expectedDuration: w.expectedDuration,
            realDuration: 0,
            status: 'PENDING'
          }))
        }
      },
      include: { 
        product: true, 
        bom: true, 
        components: { include: { product: true } },
        WorkOrders: { include: { operation: true, workCenter: true } }
      }
    });
  }

  static async findMOById(id: string) {
    return await prisma.manufacturingOrder.findUnique({
      where: { id },
      include: { 
        product: true, 
        bom: true, 
        assignee: true,
        components: { include: { product: true } },
        WorkOrders: { include: { operation: true, workCenter: true } }
      }
    });
  }

  static async updateMOStatus(id: string, status: MOStatus) {
    return await prisma.manufacturingOrder.update({
      where: { id },
      data: { status }
    });
  }

  static async updateWorkOrder(id: string, data: { status?: WOStatus, realDuration?: number, startTime?: Date | null }) {
    return await prisma.workOrder.update({
      where: { id },
      data,
      include: { mo: { include: { product: true } }, operation: true }
    });
  }

  static async updateComponentConsumption(id: string, consumed: number) {
    return await prisma.mOComponent.update({
      where: { id },
      data: { consumed }
    });
  }

  static async findAllBoMs() {
    return await prisma.boM.findMany({
      include: { 
        product: true, 
        bomLines: { include: { component: true } }, 
        operations: { include: { workCenter: true } } 
      }
    });
  }

  static async getMOs(filters: { page: number; limit: number; searchTerm?: string }) {
    const { page, limit, searchTerm } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (searchTerm) {
      where.OR = [
        { id: { contains: searchTerm, mode: 'insensitive' } },
        { product: { name: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    const [mos, totalItems] = await Promise.all([
      prisma.manufacturingOrder.findMany({
        where,
        include: { 
          product: true, 
          bom: true, 
          assignee: true,
          components: { include: { product: true } },
          WorkOrders: { include: { operation: true, workCenter: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.manufacturingOrder.count({ where }),
    ]);

    return {
      mos,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
  }
}
