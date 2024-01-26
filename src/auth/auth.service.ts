import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { customAlphabet } from 'nanoid';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/users/dto/user.dto';

const FIVE_MINUTES = 5 * 60 * 1000;

export interface AuthenticationPayload {
  type: string;
  access_token: string;
  refresh_token: string;
  user: UserDto;
}

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(data: SignUpDto) {
    try {
      const { email } = data;
      const existingUser = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const generateToken = customAlphabet('123456789', 6);
      const token = generateToken(6);
      const expires = new Date(Date.now() + FIVE_MINUTES * 30);

      const newUser = await this.prismaService.user.create({
        data: {
          ...data,
          password: await argon2.hash(data.password),
        },
      });

      await this.prismaService.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = newUser;

      return { userWithoutPassword };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async signIn(data: SignInDto) {
    try {
      const { email, password } = data;

      const user = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      await this.verifyPassword(user.password, password);

      const [access_token, refresh_token] = await Promise.all([
        this.jwtService.signAsync({ id: user.id }),
        this.jwtService.signAsync({ id: user.id }, { expiresIn: '7d' }),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      const payload = this.buildResponsePayload(
        userWithoutPassword,
        access_token,
        refresh_token,
      );

      return payload;
    } catch (error) {
      throw new HttpException(
        error.message || 'Bad request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async verifyPassword(
    storedPassword: string,
    providedPassword: string,
  ) {
    const isValidPassword = await argon2.verify(
      storedPassword,
      providedPassword,
    );

    if (!isValidPassword) {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }

    return isValidPassword;
  }

  private buildResponsePayload(
    user: UserDto,
    accessToken: string,
    refreshToken: string,
  ): AuthenticationPayload {
    return {
      type: 'Bearer',
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }
}
