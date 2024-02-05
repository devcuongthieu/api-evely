import { IsEmail, IsString } from 'class-validator';

export class EmailSignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  token: string;
}

export class EmailForgotPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  token: string;
}
