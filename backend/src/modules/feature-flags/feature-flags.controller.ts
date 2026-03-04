import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';

@Controller('admin/feature-flags')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  @Permissions('feature-flags.read')
  findAll() {
    return this.featureFlagsService.findAll();
  }

  @Get(':id')
  @Permissions('feature-flags.read')
  findOne(@Param('id') id: string) {
    return this.featureFlagsService.findOne(id);
  }

  @Post()
  @Permissions('feature-flags.update') // Using update permission for create as well per request
  create(@Body() createFeatureFlagDto: CreateFeatureFlagDto) {
    return this.featureFlagsService.create(createFeatureFlagDto);
  }

  @Put(':id')
  @Permissions('feature-flags.update')
  update(@Param('id') id: string, @Body() updateFeatureFlagDto: UpdateFeatureFlagDto) {
    return this.featureFlagsService.update(id, updateFeatureFlagDto);
  }

  @Delete(':id')
  @Permissions('feature-flags.update')
  remove(@Param('id') id: string) {
    return this.featureFlagsService.remove(id);
  }
}
