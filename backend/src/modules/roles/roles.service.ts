import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return role;
  }

  async create(createRoleDto: CreateRoleDto) {
    const { permissions, ...roleData } = createRoleDto;
    return this.prisma.role.create({
      data: {
        ...roleData,
        permissions: {
          create: permissions?.map((permId: string) => ({
            permission: { connect: { id: permId } }
          }))
        }
      },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { permissions, ...roleData } = updateRoleDto;
    
    // If permissions are provided, we replace the existing ones
    if (permissions) {
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        ...roleData,
        ...(permissions && {
          permissions: {
            create: permissions.map((permId: string) => ({
              permission: { connect: { id: permId } }
            }))
          }
        })
      },
      include: {
        permissions: {
          include: { permission: true }
        }
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.role.delete({ where: { id } });
  }
}
