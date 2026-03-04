import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { UiConfigService } from './ui-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateUiConfigDto } from './dto/create-ui-config.dto';
import { UpdateUiConfigDto } from './dto/update-ui-config.dto';

@Controller('admin/ui-config')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UiConfigController {
  constructor(private readonly uiConfigService: UiConfigService) {}

  @Get()
  @Permissions('ui-config.read')
  findAll() {
    return this.uiConfigService.findAll();
  }

  @Get(':key/key')
  @Permissions('ui-config.read')
  findByKey(@Param('key') key: string) {
    return this.uiConfigService.findByKey(key);
  }

  @Post()
  @Permissions('ui-config.update')
  create(@Body() createUiConfigDto: CreateUiConfigDto) {
    return this.uiConfigService.create(createUiConfigDto);
  }

  @Put(':id')
  @Permissions('ui-config.update')
  update(@Param('id') id: string, @Body() updateUiConfigDto: UpdateUiConfigDto) {
    return this.uiConfigService.update(id, updateUiConfigDto);
  }

  @Delete(':id')
  @Permissions('ui-config.update')
  remove(@Param('id') id: string) {
    return this.uiConfigService.remove(id);
  }
}
