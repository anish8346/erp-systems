
import prisma from '../config/prisma';

export const logActivity = async (userId: string, action: string, entityType: string, entityId: string, details: string) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
