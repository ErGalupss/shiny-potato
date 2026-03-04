import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        roles: {
          include: { role: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async create(data: CreateUserDto) {
    const { roles, ...userData } = data;
    return this.prisma.user.create({
      data: {
        ...userData,
        roles: {
          create: roles?.map((roleId: string) => ({
            role: { connect: { id: roleId } }
          }))
        }
      },
      include: { roles: true }
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const { roles, ...userData } = data;
    
    if (roles) {
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(roles && {
          roles: {
            create: roles.map((roleId: string) => ({
              role: { connect: { id: roleId } }
            }))
          }
        })
      },
      include: { roles: true }
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
