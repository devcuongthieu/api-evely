import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateScreenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  cinema_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  column_size: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  row_size: number;
}

export class UpdateScreenDto extends PartialType(CreateScreenDto) {}
