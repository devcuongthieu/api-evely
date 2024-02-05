import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { customAlphabet } from 'nanoid';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/users/dto/user.dto';
import { MailService } from 'src/mail/mail.service';

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
    private mailService: MailService,
  ) {}

  async signUp(data: SignUpDto) {
    try {
      const { email } = data;
      const user = await this.prismaService.user.findFirst({
        where: { email: data.email },
      });

      if (user) {
        throw new ConflictException('Email already exists');
      } else {
        const generateToken = customAlphabet('123456789', 6);
        const token = generateToken(6);
        const expires = new Date(Date.now() + FIVE_MINUTES * 30);

        const [user] = await this.prismaService.$transaction([
          this.prismaService.user.create({
            data: {
              ...data,
              password: await argon2.hash(data.password),
            },
          }),
          this.prismaService.verificationToken.create({
            data: {
              identifier: email,
              token,
              expires,
            },
          }),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;

        await this.mailService.sendSignUpMail({
          name: data.first_name + ' ' + data.last_name,
          email: data.email,
          token: token,
        });

        return userWithoutPassword;
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async signIn(data: SignInDto) {
    try {
      const { email } = data;

      const user = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (!user) throw new UnauthorizedException('User not found');

      await this.verifyPassword(user.password, data.password);

      const access_token = await this.jwtService.signAsync({ id: user.id });
      const refresh_token = await this.jwtService.signAsync(
        { id: user.id },
        { expiresIn: '7d' },
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      const payload = this.buildResponsePayload(
        userWithoutPassword,
        access_token,
        refresh_token,
      );

      return {
        ...payload,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (!user)
        throw new HttpException('Email not found', HttpStatus.NOT_FOUND);

      const generateToken = customAlphabet('123456789', 6);
      const token = generateToken(6);

      await this.prismaService.passwordReset.upsert({
        where: { user_id: user.id },
        update: {
          token,
          expires: new Date(Date.now() + FIVE_MINUTES * 30),
        },
        create: {
          token,
          user_id: user.id,
          expires: new Date(Date.now() + FIVE_MINUTES * 30),
        },
      });

      await this.mailService.sendForgotPasswordMail({
        name: user.last_name + ' ' + user.first_name,
        email: user.email,
        token: token,
      });

      return {
        message: 'Email sent successfully',
        code: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(token: string, password: string) {
    const checkToken = await this.validateResetPasswordOtp(token);
    const hashPassword = await argon2.hash(password);

    try {
      await this.prismaService.$transaction([
        this.prismaService.user.update({
          where: { id: checkToken.user_id },
          data: {
            password: hashPassword,
          },
        }),
        this.prismaService.passwordReset.delete({
          where: {
            user_id: checkToken.user_id,
          },
        }),
      ]);
      return {
        message: 'Reset password successfully',
        code: HttpStatus.OK,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async verifyAccount(token: string) {
    const checkToken = await this.validateVerifyToken(token);

    try {
      await this.prismaService.$transaction([
        this.prismaService.user.update({
          where: { email: checkToken.identifier },
          data: {
            email_verified: new Date(),
          },
        }),
        this.prismaService.verificationToken.delete({
          where: {
            token: token,
          },
        }),
      ]);

      return {
        message: 'Account verified successfully',
        code: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async resendVerifyToken(email: string) {
    try {
      const checkEmail = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (!checkEmail) throw new NotFoundException('Email not found');

      if (checkEmail.email_verified)
        throw new HttpException(
          'Email already verified',
          HttpStatus.BAD_REQUEST,
        );

      const checkVerificationToken =
        await this.prismaService.verificationToken.findFirst({
          where: { identifier: email },
        });

      if (!checkVerificationToken)
        throw new NotFoundException('Token not found');

      const generateToken = customAlphabet('123456789', 6);
      const token = generateToken(6);

      const newEmail = await this.prismaService.verificationToken.update({
        where: { identifier: email },
        data: {
          token,
          expires: new Date(Date.now() + FIVE_MINUTES * 30),
        },
      });

      await this.mailService.sendSignUpMail({
        name: checkEmail.first_name,
        email: checkEmail.email,
        token: newEmail.token,
      });

      return {
        message: 'Email sent successfully',
        code: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async changePassword(id: number, password: string, new_password: string) {
    const user = await this.prismaService.user.findFirst({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found');

    const checkPassword = await this.verifyPassword(user.password, password);
    if (checkPassword) {
      const hashPassword = await argon2.hash(new_password);

      await this.prismaService.user.update({
        where: { id },
        data: {
          password: hashPassword,
        },
      });

      return {
        message: 'Password changed successfully',
      };
    } else {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }
  }

  async refreshToken(user: UserDto) {
    const access_token = this.jwtService.sign({ id: user.id });
    const refresh_token = this.jwtService.sign(
      { id: user.id },
      { expiresIn: '7d' },
    );

    const payload = this.buildResponsePayload(
      user,
      access_token,
      refresh_token,
    );

    return {
      ...payload,
    };
  }

  async resendOtp(email: string) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (!user)
        throw new HttpException('Email not found', HttpStatus.NOT_FOUND);

      const generateToken = customAlphabet('123456789', 6);
      const token = generateToken(6);

      await this.prismaService.passwordReset.upsert({
        where: { user_id: user.id },
        update: {
          token,
          expires: new Date(Date.now() + FIVE_MINUTES * 30),
        },
        create: {
          token,
          user_id: user.id,
          expires: new Date(Date.now() + FIVE_MINUTES * 30),
        },
      });

      await this.mailService.sendForgotPasswordMail({
        name: user.last_name + ' ' + user.first_name,
        email: user.email,
        token: token,
      });

      return {
        message: 'Email sent successfully',
        code: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

  private async validateVerifyToken(token: string) {
    const checkToken = await this.prismaService.verificationToken.findFirst({
      where: { token },
    });

    if (!checkToken)
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);

    const dateToken = new Date(checkToken.expires);

    if (dateToken < new Date()) {
      await this.prismaService.verificationToken.delete({
        where: {
          token: token,
        },
      });

      throw new HttpException('Token expired', HttpStatus.BAD_REQUEST);
    }

    return checkToken;
  }

  async validateResetPasswordOtp(token: string) {
    const checkToken = await this.prismaService.passwordReset.findFirst({
      where: { token },
    });

    if (!checkToken)
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);

    const updatedAt = +new Date(checkToken.updated_at);
    const timeDifferenceInMilliseconds = Date.now() - updatedAt;

    if (timeDifferenceInMilliseconds >= FIVE_MINUTES) {
      await this.prismaService.passwordReset.delete({
        where: {
          token: token,
        },
      });

      throw new BadRequestException('Token expired');
    }

    return checkToken;
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
