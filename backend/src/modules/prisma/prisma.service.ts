import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the database');
      await this.seed();
    } catch (error) {
      this.logger.error('Failed to connect to the database. Please check your DATABASE_URL environment variable.');
      this.logger.error(error);
    }
  }

  private async seed() {
    const userCount = await this.user.count();
    if (userCount === 0) {
      this.logger.log('Seeding initial data...');
      
      // Create admin role
      const adminRole = await this.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: {
          name: 'admin',
          description: 'Administrator with full access',
        },
      });

      // Create manage:all permission
      const manageAllPerm = await this.permission.upsert({
        where: { id: 'manage-all-perm' }, // Using a fixed ID for seeding
        update: {},
        create: {
          id: 'manage-all-perm',
          key: 'manage:all',
          action: 'manage',
          subject: 'all',
          description: 'Full access to everything',
        },
      });

      // Connect permission to role
      await this.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: manageAllPerm.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: manageAllPerm.id,
        },
      });

      // Create default admin user
      const adminUser = await this.user.create({
        data: {
          email: 'admin@example.com',
          password: 'password123', // In real app, use bcrypt
          firstName: 'System',
          lastName: 'Admin',
          roles: {
            create: {
              roleId: adminRole.id,
            },
          },
        },
      });

      this.logger.log('Seeding completed. Default user: admin@example.com / password123');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
