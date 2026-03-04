import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUiConfigDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;
}
