import { PartialType } from '@nestjs/swagger';
import { CreateUiConfigDto } from './create-ui-config.dto';

export class UpdateUiConfigDto extends PartialType(CreateUiConfigDto) {}
