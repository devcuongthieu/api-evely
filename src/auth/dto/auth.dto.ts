import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(1)
  @ApiProperty()
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(1)
  @ApiProperty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6)
  @ApiProperty()
  password: string;
}

export class SignInDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}

export class VerifyAccountDto {
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}

export class ResendVerifyAccountDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class ChangePasswordDto {
  @IsNumber()
  @IsNotEmpty({ message: 'Id is required' })
  id: number;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(6)
  @ApiProperty()
  new_password: string;
}
