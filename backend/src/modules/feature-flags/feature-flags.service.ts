import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';

@Injectable()
export class FeatureFlagsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.featureFlag.findMany({
      include: {
        roles: {
          include: { role: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });
    if (!flag) throw new NotFoundException(`Feature flag with ID ${id} not found`);
    return flag;
  }

  async create(createFeatureFlagDto: CreateFeatureFlagDto) {
    const { roles, ...flagData } = createFeatureFlagDto;
    return this.prisma.featureFlag.create({
      data: {
        ...flagData,
        roles: {
          create: roles?.map(r => ({
            roleId: r.roleId,
            isEnabled: r.isEnabled
          }))
        }
      },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });
  }

  async update(id: string, updateFeatureFlagDto: UpdateFeatureFlagDto) {
    const { roles, ...flagData } = updateFeatureFlagDto;

    if (roles) {
      // Replace existing role scopes
      await this.prisma.roleFeatureFlag.deleteMany({
        where: { featureFlagId: id }
      });
    }

    return this.prisma.featureFlag.update({
      where: { id },
      data: {
        ...flagData,
        ...(roles && {
          roles: {
            create: roles.map(r => ({
              roleId: r.roleId,
              isEnabled: r.isEnabled
            }))
          }
        })
      },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.featureFlag.delete({ where: { id } });
  }

  async check(key: string, roleIds: string[]): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { key },
      include: {
        roles: {
          where: { roleId: { in: roleIds } }
        }
      }
    });

    if (!flag) return false;
    
    // If any role has it enabled specifically, it's enabled
    const roleEnabled = flag.roles.some(r => r.isEnabled);
    if (roleEnabled) return true;

    // Otherwise fallback to global state
    return flag.isEnabled;
  }
}
