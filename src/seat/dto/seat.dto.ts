import { ApiProperty, PartialType } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSeatDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  row: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  column: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  screen_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum($Enums.SeatType)
  seat_type: $Enums.SeatType;
}

export class UpdateSeatDto extends PartialType(CreateSeatDto) {}
