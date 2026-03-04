import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const { user } = req;
    
    if (!user) {
      this.logger.warn('User not found in request');
      return false;
    }

    if (!this.prisma) {
      this.logger.error('PrismaService is not injected!');
      return false;
    }

    if (!this.prisma.user) {
      this.logger.error('PrismaService.user is undefined!');
      return false;
    }

    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    if (!userWithRoles) return false;

    const userPermissions = new Set<string>();
    userWithRoles.roles.forEach(ur => {
      ur.role.permissions.forEach(rp => {
        userPermissions.add(rp.permission.key);
      });
    });

    return requiredPermissions.some(permission => userPermissions.has(permission) || userPermissions.has('manage:all'));
  }
}
