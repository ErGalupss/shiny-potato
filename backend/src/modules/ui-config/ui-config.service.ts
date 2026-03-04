import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUiConfigDto } from './dto/create-ui-config.dto';
import { UpdateUiConfigDto } from './dto/update-ui-config.dto';

@Injectable()
export class UiConfigService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.uiConfig.findMany();
  }

  async findOne(id: string) {
    const config = await this.prisma.uiConfig.findUnique({
      where: { id },
    });
    if (!config) throw new NotFoundException(`UI Config with ID ${id} not found`);
    return config;
  }

  async findByKey(key: string) {
    const config = await this.prisma.uiConfig.findUnique({
      where: { key },
    });
    if (!config) throw new NotFoundException(`UI Config with key ${key} not found`);
    return config;
  }

  async create(createUiConfigDto: CreateUiConfigDto) {
    return this.prisma.uiConfig.create({
      data: createUiConfigDto,
    });
  }

  async update(id: string, updateUiConfigDto: UpdateUiConfigDto) {
    await this.findOne(id);
    return this.prisma.uiConfig.update({
      where: { id },
      data: updateUiConfigDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.uiConfig.delete({
      where: { id },
    });
  }
}
