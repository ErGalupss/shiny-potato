import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AuditLogFilters {
  userId?: string;
  startDate?: string;
  endDate?: string;
  action?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: AuditLogFilters = {}) {
    const { userId, startDate, endDate, action } = filters;
    
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = { contains: action };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    return this.prisma.auditLog.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: string;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details,
        ipAddress: data.ipAddress,
      }
    });
  }
}
